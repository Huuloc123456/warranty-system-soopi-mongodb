using MongoDB.Bson;
using System.Globalization;
using System.Text.Json;
using Soopi.Api.Domain.Shared;

namespace Soopi.Api.Data.Stores;

/// <summary>
/// Danh mục quản trị trên các bảng của schema. API danh mục trả/nhận bản ghi dạng map với khóa <c>_id</c> và tên trường
/// tiếng Anh như giao diện đang dùng; lớp này dịch qua lại với cột tiếng Việt.
/// </summary>
public sealed class CatalogStore(MongoDocuments docs)
{
    private enum Kind
    {
        Text,
        Number,
        Money,
        Flag,
    }

    private sealed record Field(string Key, string Column, Kind Kind);

    private sealed record Table(string Name, string Key, string SortColumn, Field[] Fields);

    private static Field Text(string key, string column) => new(key, column, Kind.Text);

    private static Field Number(string key, string column) => new(key, column, Kind.Number);

    private static Field Money(string key, string column) => new(key, column, Kind.Money);

    private static Field Flag(string key, string column) => new(key, column, Kind.Flag);

    private static readonly Dictionary<string, Table> Tables = new()
    {
        ["service_stations"] = new("TramDichVu", "MaTram", "TenTram",
            [Text("name", "TenTram"), Text("address", "DiaChi"), Flag("active", "HoatDong")]),
        ["device_categories"] = new("NhomThietBi", "MaNhom", "TenNhom",
            [Text("name", "TenNhom"), Number("sortOrder", "ThuTu"), Flag("active", "HoatDong")]),
        ["brands"] = new("HangSanXuat", "MaHang", "TenHang", [Text("name", "TenHang"), Flag("active", "HoatDong")]),
        ["products"] = new("SanPham", "MaSP", "TenSP",
        [
            Text("name", "TenSP"), Text("brandId", "MaHang"), Text("deviceTypeCode", "MaLoai"), Text("productLine", "DongSanPham"),
            Number("defaultWarrantyMonths", "ThoiHanBaoHanhMacDinhThang"), Flag("active", "HoatDong"),
        ]),
        ["warranty_policies"] = new("ChinhSachBaoHanh", "MaChinhSach", "TenChinhSach",
        [
            Text("scope", "PhamVi"), Text("productId", "MaSP"), Text("brandId", "MaHang"), Text("name", "TenChinhSach"),
            Number("warrantyMonths", "SoThangBaoHanh"), Text("conditions", "DieuKienBaoHanh"),
            Text("rejectionCases", "TruongHopTuChoi"), Text("distributor", "NhaPhanPhoi"), Flag("active", "HoatDong"),
        ]),
        ["service_prices"] = new("BangGiaDichVu", "MaDichVu", "TenDichVu",
            [Text("name", "TenDichVu"), Text("categoryCode", "MaNhom"), Money("price", "DonGia"), Flag("active", "HoatDong")]),
        ["suppliers"] = new("NhaCungCap", "MaNCC", "TenNCC",
        [
            Text("name", "TenNCC"), Text("phone", "SDT"), Text("address", "DiaChi"), Text("email", "Email"), Flag("active", "HoatDong"),
        ]),
        ["parts"] = new("LinhKien", "MaLK", "TenLK",
        [
            Text("name", "TenLK"), Text("unit", "DonViTinh"), Text("categoryCode", "MaNhom"), Text("brandName", "TenHang"),
            Money("costPrice", "DonGiaVon"), Money("servicePrice", "DonGiaDichVu"), Number("minLevel", "DinhMucTonToiThieu"),
            Text("primaryBin", "KeChinh"), Number("warrantyMonths", "ThoiHanBaoHanhThang"), Text("supplierId", "MaNCC"),
            Flag("active", "HoatDong"),
        ]),
    };


    public async Task<List<Dictionary<string, object?>>> ListAsync(string collection)
    {
        TableOf(collection);
        var rows = (await docs.ListAsync(collection, sort: new BsonDocument { { "name", 1 }, { "_id", 1 } })).Select(MongoDocuments.Map).ToList();
        await EnrichAsync(collection, rows); return rows;
    }
    public async Task<Dictionary<string, object?>?> FindAsync(string collection, string id)
    {
        TableOf(collection);
        var row = await docs.GetAsync(collection, MongoDocuments.Eq("_id", id));
        if (row is null) return null;
        var result = MongoDocuments.Map(row); await EnrichAsync(collection, [result]); return result;
    }
    public async Task<Dictionary<string, object?>> SaveAsync(string collection, string id, IReadOnlyDictionary<string, object?> value)
    {
        var table = TableOf(collection);
        var fields = table.Fields.Where(f => value.ContainsKey(f.Key)).ToDictionary(f => f.Key, f => ToColumn(f, value[f.Key]));
        if (collection == "device_categories" && value.ContainsKey("deviceTypes")) fields["deviceTypes"] = value["deviceTypes"];
        if (collection == "brands" && value.ContainsKey("categoryCodes")) fields["categoryCodes"] = value["categoryCodes"];
        var existing = await docs.GetAsync(collection, MongoDocuments.Eq("_id", id));
        var candidate = existing ?? new BsonDocument("_id", id);
        if (existing is null)
            foreach (var field in table.Fields) candidate[field.Key] = field.Kind switch { Kind.Flag => true, Kind.Number => 0, Kind.Money => new BsonDecimal128(0), _ => BsonNull.Value };
        foreach (var (key, item) in fields) candidate[key] = MongoDocuments.Value(item);
        if (collection == "parts" && candidate["primaryBin"].IsBsonNull) candidate["primaryBin"] = "MAIN";
        await ValidateAsync(collection, candidate);
        if (existing is null) fields = MongoDocuments.Map(candidate).Where(p => p.Key != "_id").ToDictionary(p => p.Key, p => p.Value);
        var update = new BsonDocument("$set", MongoDocuments.Value(fields).AsBsonDocument);
        if (collection == "parts") update["$setOnInsert"] = new BsonDocument { { "onHand", 0 }, { "reserved", 0 }, { "bins", new BsonArray() }, { "version", 0 } };
        await docs.UpdateAsync(collection, MongoDocuments.Eq("_id", id), update, true);
        if (collection == "parts")
        {
            var part = await docs.GetAsync(collection, MongoDocuments.Eq("_id", id));
            var bin = part!.GetValue("primaryBin", "").AsString;
            if (bin.Length > 0) await docs.UpdateAsync(collection, new BsonDocument { { "_id", id }, { "bins.binCode", new BsonDocument("$ne", bin) } }, new BsonDocument("$push", new BsonDocument("bins", new BsonDocument { { "binCode", bin }, { "qty", 0 } })));
        }
        return await FindAsync(collection, id) ?? throw new DomainException(ErrorCode.NOT_FOUND);
    }
    public async Task<bool> IsReferencedByOpenTicketAsync(string type, string id)
    {
        if (type == "parts")
        {
            var quotes = await docs.ListAsync("quotations", new BsonDocument("lines.sku", id));
            var tickets = new BsonArray(quotes.Select(q => q["ticketId"]));
            return await docs.GetAsync("tickets", new BsonDocument { { "open", true }, { "_id", new BsonDocument("$in", tickets) } }) is not null;
        }
        var field = type switch { "device-categories" => "deviceSnapshot.categoryCode", "stations" => "stationCode", "products" => "deviceSnapshot.productId", "brands" => "deviceSnapshot.brandId", _ => null };
        return field is not null && await docs.GetAsync("tickets", new BsonDocument { { "open", true }, { field, id } }) is not null;
    }
    public static object? Plain(JsonElement element) => element.ValueKind switch
    {
        JsonValueKind.String => element.GetString(),
        JsonValueKind.Number => element.GetDecimal(),
        JsonValueKind.True => true,
        JsonValueKind.False => false,
        JsonValueKind.Array => element.EnumerateArray().Select(Plain).ToList(),
        JsonValueKind.Object => element.EnumerateObject().ToDictionary(property => property.Name, property => Plain(property.Value)),
        _ => null,
    };

    private static Table TableOf(string collection) => Tables.GetValueOrDefault(collection) ?? throw new DomainException(ErrorCode.NOT_FOUND);

    private static object? ToColumn(Field field, object? value)
    {
        if (value is null) return field.Kind == Kind.Flag ? true : null;
        var text = value switch
        {
            bool flag => flag ? "true" : "false",
            IFormattable number => number.ToString(null, CultureInfo.InvariantCulture),
            _ => value.ToString() ?? "",
        };
        return field.Kind switch
        {
            Kind.Text => value is string s && string.IsNullOrWhiteSpace(s) ? null : text,
            Kind.Number => decimal.TryParse(text, NumberStyles.Number, CultureInfo.InvariantCulture, out var number)
                && number == decimal.Truncate(number) && number is >= int.MinValue and <= int.MaxValue
                    ? (int)number
                    : throw new DomainException(ErrorCode.VALIDATION_FAILED),
            Kind.Money => decimal.TryParse(text, NumberStyles.Number, CultureInfo.InvariantCulture, out var money)
                ? money
                : throw new DomainException(ErrorCode.VALIDATION_FAILED),
            _ => value is bool b ? b : string.Equals(text, "true", StringComparison.OrdinalIgnoreCase),
        };
    }


    private async Task EnrichAsync(string collection, List<Dictionary<string, object?>> rows)
    {
        if (collection == "products")
        {
            var categories = await docs.ListAsync("device_categories");
            foreach (var row in rows)
            {
                var type = row.GetValueOrDefault("deviceTypeCode") as string;
                row["categoryCode"] = categories.FirstOrDefault(c => c.GetValue("deviceTypes", new BsonArray()).AsBsonArray.Any(t => t["code"] == type))?.GetValue("_id").AsString;
            }
        }
        foreach (var row in rows)
        {
            row.Remove("version");
            if (collection == "device_categories") row.TryAdd("deviceTypes", new List<object>());
            if (collection == "brands") row.TryAdd("categoryCodes", new List<object>());
        }
    }
    private async Task ValidateAsync(string collection, BsonDocument candidate)
    {
        string? TextOf(string key) => candidate.GetValue(key, BsonNull.Value) is { IsBsonNull: false } value ? value.AsString : null;
        if (string.IsNullOrWhiteSpace(TextOf("name"))) throw new DomainException(ErrorCode.VALIDATION_FAILED);
        foreach (var field in TableOf(collection).Fields.Where(f => f.Kind is Kind.Number or Kind.Money))
            if (candidate[field.Key].ToDecimal() < 0) throw new DomainException(ErrorCode.VALIDATION_FAILED);
        async Task Reference(string target, string? id, bool required)
        {
            if (string.IsNullOrWhiteSpace(id)) { if (required) throw new DomainException(ErrorCode.VALIDATION_FAILED); return; }
            if (await docs.GetAsync(target, MongoDocuments.Eq("_id", id)) is null) throw new DomainException(ErrorCode.VALIDATION_FAILED);
        }
        switch (collection)
        {
            case "products":
                await Reference("brands", TextOf("brandId"), true);
                var type = TextOf("deviceTypeCode");
                if (string.IsNullOrWhiteSpace(type) || await docs.GetAsync("device_categories", MongoDocuments.Eq("deviceTypes.code", type)) is null) throw new DomainException(ErrorCode.VALIDATION_FAILED);
                break;
            case "warranty_policies":
                if (TextOf("scope") is not ("BRAND" or "PRODUCT")) throw new DomainException(ErrorCode.VALIDATION_FAILED);
                await Reference("brands", TextOf("brandId"), TextOf("scope") == "BRAND");
                await Reference("products", TextOf("productId"), TextOf("scope") == "PRODUCT");
                break;
            case "parts":
                await Reference("device_categories", TextOf("categoryCode"), false);
                await Reference("suppliers", TextOf("supplierId"), false);
                break;
            case "service_prices": await Reference("device_categories", TextOf("categoryCode"), false); break;
            case "brands":
                var categories = candidate.GetValue("categoryCodes", new BsonArray());
                if (!categories.IsBsonArray || categories.AsBsonArray.Any(c => !c.IsString)) throw new DomainException(ErrorCode.VALIDATION_FAILED);
                foreach (var category in categories.AsBsonArray) await Reference("device_categories", category.AsString, true);
                break;
            case "device_categories":
                var typeValues = candidate.GetValue("deviceTypes", new BsonArray());
                if (!typeValues.IsBsonArray) throw new DomainException(ErrorCode.VALIDATION_FAILED);
                var types = typeValues.AsBsonArray;
                var seen = new HashSet<string>();
                foreach (var entry in types)
                {
                    if (!entry.IsBsonDocument || new[] { "code", "name", "identifierType" }.Any(key => !entry.AsBsonDocument.GetValue(key, BsonNull.Value).IsString)) throw new DomainException(ErrorCode.VALIDATION_FAILED);
                    var code = entry.AsBsonDocument.GetValue("code", "").AsString;
                    if (string.IsNullOrWhiteSpace(code) || !seen.Add(code) || string.IsNullOrWhiteSpace(entry.AsBsonDocument.GetValue("name", "").AsString)
                        || entry.AsBsonDocument.GetValue("identifierType", "").AsString is not ("SERIAL" or "IMEI")) throw new DomainException(ErrorCode.VALIDATION_FAILED);
                    var other = await docs.GetAsync("device_categories", new BsonDocument { { "deviceTypes.code", code }, { "_id", new BsonDocument("$ne", candidate["_id"]) } });
                    if (other is not null) throw new DomainException(ErrorCode.CONCURRENT_MODIFICATION);
                }
                break;
        }
    }
}
