using MongoDB.Bson;
using MongoDB.Driver;
using Soopi.Api.Domain.Inventory;
using Soopi.Api.Domain.Shared;
using static Soopi.Api.Data.MongoDocuments;
namespace Soopi.Api.Data.Stores;

public sealed record Bin(string BinCode, int Qty);
public sealed record PartStock(string Sku, string Name, string? Unit, string? CategoryCode, string? BrandName, decimal CostPrice, decimal ServicePrice, int OnHand, int Reserved, int MinLevel, string PrimaryBin, IReadOnlyList<Bin> Bins, int WarrantyMonths, string? SupplierId, string? SupplierName, string? SupplierPhone, bool Active)
{ public int Available => OnHand - Reserved; }
public sealed class InventoryStore(MongoDocuments docs)
{
    public async Task<PartStock?> FindPartAsync(string sku)
    {
        var doc = await docs.GetAsync("parts", Document(("_id", sku), ("active", true)));
        return doc is null ? null : await PartAsync(doc);
    }
    public async Task<PartStock> RequirePartAsync(string sku) => await FindPartAsync(sku) ?? throw new DomainException(ErrorCode.STOCK_ISSUE_PART_INVALID);
    public async Task<List<PartStock>> FindPartsAsync(string? query, string? category, bool lowStock)
    {
        var filter = new BsonDocument();
        if (!string.IsNullOrWhiteSpace(query)) filter = Search(query.Trim(), "_id", "name");
        if (!string.IsNullOrWhiteSpace(category)) filter = And(filter, Eq("categoryCode", category.Trim()));
        if (lowStock) filter = And(filter, new BsonDocument("$expr", new BsonDocument("$lte", new BsonArray { new BsonDocument("$subtract", new BsonArray { "$onHand", "$reserved" }), "$minLevel" })));
        var result = new List<PartStock>();
        foreach (var doc in await docs.ListAsync("parts", filter, new BsonDocument { { "name", 1 }, { "_id", 1 } })) result.Add(await PartAsync(doc));
        return lowStock ? result.OrderBy(p => p.Available - p.MinLevel).ToList() : result;
    }
    public async Task<bool> SupplierExistsAsync(string? supplierId) => await docs.GetAsync("suppliers", Document(("_id", supplierId ?? ""), ("active", true))) is not null;
    public async Task ReserveAsync(string sku, int quantity)
    {
        var filter = Document(("_id", sku), ("active", true), ("$expr", new BsonDocument("$gte", new BsonArray { new BsonDocument("$subtract", new BsonArray { "$onHand", "$reserved" }), quantity })));
        if (await docs.UpdateAsync("parts", filter, new BsonDocument("$inc", Document(("reserved", quantity), ("version", 1)))) != 1) throw new DomainException(ErrorCode.STOCK_INSUFFICIENT);
    }
    public async Task ReleaseAsync(string sku, int quantity)
    {
        if (await docs.UpdateAsync("parts", Document(("_id", sku), ("reserved", new BsonDocument("$gte", quantity))), new BsonDocument("$inc", Document(("reserved", -quantity), ("version", 1)))) != 1) throw new DomainException(ErrorCode.STOCK_INSUFFICIENT);
    }
    public async Task IssueAsync(string sku, int quantity, string binCode)
    {
        var filter = Document(("_id", sku), ("onHand", new BsonDocument("$gte", quantity)), ("reserved", new BsonDocument("$gte", quantity)));
        if (await docs.UpdateAsync("parts", filter, new BsonDocument("$inc", Document(("onHand", -quantity), ("reserved", -quantity), ("version", 1)))) != 1) throw new DomainException(ErrorCode.STOCK_INSUFFICIENT);
        await RemoveFromBinAsync(sku, quantity, binCode);
    }
    public async Task ReceiveAsync(string sku, int quantity, string binCode)
    {
        if (await docs.UpdateAsync("parts", Document(("_id", sku), ("active", true)), new BsonDocument("$inc", Document(("onHand", quantity), ("version", 1)))) != 1) throw new DomainException(ErrorCode.STOCK_ISSUE_PART_INVALID);
        await AddToBinAsync(sku, quantity, binCode);
    }
    public async Task TransferAsync(string sku, int quantity, string fromBin, string toBin)
    {
        await docs.UpdateAsync("parts", Eq("_id", sku), new BsonDocument("$inc", new BsonDocument("version", 1)));
        await RemoveFromBinAsync(sku, quantity, fromBin); await AddToBinAsync(sku, quantity, toBin);
    }
    private async Task RemoveFromBinAsync(string sku, int quantity, string binCode)
    {
        var filter = Document(("_id", sku), ("bins", new BsonDocument("$elemMatch", Document(("binCode", binCode), ("qty", new BsonDocument("$gte", quantity))))));
        if (await docs.UpdateAsync("parts", filter, new BsonDocument("$inc", new BsonDocument("bins.$.qty", -quantity))) != 1) throw new DomainException(ErrorCode.STOCK_BIN_INSUFFICIENT, binCode);
    }
    private async Task AddToBinAsync(string sku, int quantity, string binCode)
    {
        if (await docs.UpdateAsync("parts", Document(("_id", sku), ("bins.binCode", binCode)), new BsonDocument("$inc", new BsonDocument("bins.$.qty", quantity))) == 0)
            await docs.UpdateAsync("parts", Document(("_id", sku), ("bins.binCode", new BsonDocument("$ne", binCode))), new BsonDocument("$push", new BsonDocument("bins", Document(("binCode", binCode), ("qty", quantity)))));
    }
    private async Task<PartStock> PartAsync(BsonDocument d)
    {
        string? Str(string key) => d.GetValue(key, BsonNull.Value) is { IsBsonNull: false } v ? v.AsString : null;
        int Num(string key) => d.GetValue(key, 0).ToInt32();
        decimal MoneyOf(string key) => d.GetValue(key, new BsonDecimal128(0)).ToDecimal();
        var supplier = Str("supplierId") is { } id ? await docs.GetAsync("suppliers", Eq("_id", id)) : null;
        var bins = d.GetValue("bins", new BsonArray()).AsBsonArray.Select(v => new Bin(v["binCode"].AsString, v["qty"].ToInt32())).OrderBy(v => v.BinCode).ToList();
        return new PartStock(d["_id"].AsString, Str("name")!, Str("unit"), Str("categoryCode"), Str("brandName"), MoneyOf("costPrice"), MoneyOf("servicePrice"), Num("onHand"), Num("reserved"), Num("minLevel"), Str("primaryBin") ?? "", bins, Num("warrantyMonths"), Str("supplierId"), supplier?.GetValue("name", BsonNull.Value).IsBsonNull == false ? supplier["name"].AsString : null, supplier?.GetValue("phone", BsonNull.Value).IsBsonNull == false ? supplier["phone"].AsString : null, d.GetValue("active", false).ToBoolean());
    }
}
public sealed class InventoryDocumentStore(AppDbContext db)
{
    public async Task SaveAsync(StockReceipt receipt)
    {
        if (!receipt.Persisted) { receipt.Persisted = true; await db.InsertAsync("stock_receipts", receipt); }
        else await db.ReplaceAsync("stock_receipts", Builders<StockReceipt>.Filter.Eq(r => r.Id, receipt.Id), receipt);
    }
    public Task<StockReceipt?> FindReceiptAsync(string code) => db.FirstAsync<StockReceipt>("stock_receipts", r => r.Id == code);
    public Task<List<StockReceipt>> FindReceiptsAsync(string? status) => db.Find<StockReceipt>("stock_receipts", Builders<StockReceipt>.Filter.Where(r => status == null || status == "" || r.Status == status)).SortByDescending(r => r.ReceivedOn).ThenByDescending(r => r.Id).ToListAsync();
    public async Task SaveAsync(StockIssue issue)
    {
        if (!issue.Persisted) { issue.Persisted = true; await db.InsertAsync("stock_issues", issue); }
        else await db.ReplaceAsync("stock_issues", Builders<StockIssue>.Filter.Eq(r => r.Id, issue.Id), issue);
    }
    public Task<StockIssue?> FindIssueAsync(string code) => db.FirstAsync<StockIssue>("stock_issues", r => r.Id == code);
    public Task<List<StockIssue>> FindIssuesAsync(string? status, string? technicianId) => db.Find<StockIssue>("stock_issues", Builders<StockIssue>.Filter.Where(r => (status == null || status == "" || r.Status == status) && (technicianId == null || r.TechnicianId == technicianId))).SortBy(r => r.RequestedAt).ThenBy(r => r.Id).ToListAsync();
    public async Task<bool> HasPendingIssueAsync(string ticketCode) => await db.Find<StockIssue>("stock_issues", Builders<StockIssue>.Filter.Where(r => r.TicketId == ticketCode && r.Status == "PENDING")).AnyAsync();
    public Task<List<StockIssue>> FindIssuedByTicketAsync(string ticketCode) => db.Find<StockIssue>("stock_issues", Builders<StockIssue>.Filter.Where(r => r.TicketId == ticketCode && r.Status == "ISSUED")).SortBy(r => r.RequestedAt).ThenBy(r => r.Id).ToListAsync();
    public async Task SaveAsync(StockTransfer transfer)
    {
        if (!transfer.Persisted) { transfer.Persisted = true; await db.InsertAsync("stock_transfers", transfer); }
        else await db.ReplaceAsync("stock_transfers", Builders<StockTransfer>.Filter.Eq(r => r.Id, transfer.Id), transfer);
    }
    public Task<StockTransfer?> FindTransferAsync(string code) => db.FirstAsync<StockTransfer>("stock_transfers", r => r.Id == code);
    public Task<List<StockTransfer>> FindTransfersAsync(string? status) => db.Find<StockTransfer>("stock_transfers", Builders<StockTransfer>.Filter.Where(r => status == null || status == "" || r.Status == status)).SortByDescending(r => r.Id).ToListAsync();
}
