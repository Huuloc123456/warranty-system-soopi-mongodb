using MongoDB.Bson;
using Soopi.Api.Domain.Shared;
using static Soopi.Api.Data.MongoDocuments;
namespace Soopi.Api.Data.Stores;

public sealed record NewWarrantyRequest(
    string Code,
    string FullName,
    string Phone,
    string? Email,
    string? Address,
    string CategoryCode,
    string DeviceTypeCode,
    string BrandModel,
    string IdentifierType,
    string SerialOrImei,
    string Symptom,
    string PreferredStation,
    DateTimeOffset? PreferredFrom,
    DateTimeOffset? PreferredTo,
    DateTimeOffset CreatedAt,
    string? CustomerId = null);


public sealed class WarrantyRequestStore(MongoDocuments docs)
{
    public async Task<List<Dictionary<string, object?>>> SearchAsync(string? status, string? query)
    {
        var filter = new BsonDocument();
        if (!string.IsNullOrWhiteSpace(status)) filter = Eq("status", status);
        if (!string.IsNullOrWhiteSpace(query)) filter = And(filter, Search(query.Trim(), "_id", "customer.fullName", "customer.phone", "serialOrImei"));
        return await MapAsync(await docs.ListAsync("warranty_requests", filter, new BsonDocument { { "createdAt", -1 }, { "_id", -1 } }));
    }
    public async Task<Dictionary<string, object?>?> FindAsync(string code)
    {
        var doc = await docs.GetAsync("warranty_requests", Eq("_id", code));
        return doc is null ? null : (await MapAsync([doc])).First();
    }
    public async Task<List<Dictionary<string, object?>>> FindByCustomerAsync(string customerId, string phone) => await MapAsync(await docs.ListAsync("warranty_requests", new BsonDocument("$or", new BsonArray { Eq("customerId", customerId), And(Eq("customerId", BsonNull.Value), Eq("customer.phone", phone)) }), new BsonDocument { { "createdAt", -1 }, { "_id", -1 } }));
    public async Task<bool> IsPendingAsync(string code) => await docs.GetAsync("warranty_requests", Document(("_id", code), ("status", "PENDING_INTAKE"))) is not null;
    public async Task RequirePendingAsync(string code) { if (!await IsPendingAsync(code)) throw new DomainException(ErrorCode.WARRANTY_REQUEST_NOT_PENDING); }
    public Task InsertAsync(NewWarrantyRequest r) => docs.InsertAsync("warranty_requests", Document(
        ("_id", r.Code), ("customerId", r.CustomerId), ("customer", Document(("fullName", r.FullName), ("phone", r.Phone), ("email", r.Email), ("address", r.Address))),
        ("categoryCode", r.CategoryCode), ("deviceTypeCode", r.DeviceTypeCode), ("brandModel", r.BrandModel), ("identifierType", r.IdentifierType),
        ("serialOrImei", r.SerialOrImei), ("symptom", r.Symptom), ("preferredStation", r.PreferredStation), ("preferredFrom", r.PreferredFrom), ("preferredTo", r.PreferredTo),
        ("status", "PENDING_INTAKE"), ("createdAt", r.CreatedAt), ("convertedTicketId", null), ("handledBy", null), ("handledAt", null), ("cancelReason", null)));
    public Task CancelAsync(string code, string reason, string? employeeId, DateTimeOffset now) => docs.UpdateAsync("warranty_requests", Document(("_id", code), ("status", "PENDING_INTAKE")), new BsonDocument("$set", Document(("status", "CANCELLED"), ("cancelReason", reason.Length > 255 ? reason[..255] : reason), ("handledBy", employeeId), ("handledAt", now))));
    public async Task ConvertAsync(string code, string ticketCode, string? employeeId, DateTimeOffset now)
    {
        if (await docs.UpdateAsync("warranty_requests", Document(("_id", code), ("status", "PENDING_INTAKE")), new BsonDocument("$set", Document(("status", "CONVERTED"), ("convertedTicketId", ticketCode), ("handledBy", employeeId), ("handledAt", now)))) != 1)
            throw new DomainException(ErrorCode.WARRANTY_REQUEST_NOT_PENDING);
    }
    private async Task<List<Dictionary<string, object?>>> MapAsync(List<BsonDocument> documents)
    {
        var result = documents.Select(Map).ToList();
        var files = await docs.ListAsync("attachments", Document(("ownerType", "WARRANTY_REQUEST"), ("ownerId", new BsonDocument("$in", new BsonArray(documents.Select(d => d["_id"]))))), new BsonDocument("_id", 1));
        foreach (var row in result) row["attachments"] = files.Where(f => f["ownerId"].AsString == (string)row["_id"]!).Select(f => new Dictionary<string, object?> { ["fileId"] = f["_id"].ToInt64().ToString(), ["fileName"] = f["fileName"].AsString, ["contentType"] = f["contentType"].AsString, ["size"] = f["size"].ToInt64() }).ToList();
        return result;
    }
}
