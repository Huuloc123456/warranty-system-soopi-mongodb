using MongoDB.Bson;
using MongoDB.Driver;
using Soopi.Api.Domain.Tickets;
using Soopi.Api.Domain.Quotations;
namespace Soopi.Api.Data.Stores;

public sealed record TechnicianLoad(long Active, long AtRisk) { public static readonly TechnicianLoad None = new(0, 0); }
public sealed record TicketFilter(string? Status, string? Category, string? Technician, string? Sla, string? Query, DateTimeOffset? From, DateTimeOffset? To, DateTimeOffset Now, DateTimeOffset AtRiskUntil);
public sealed class TicketStore(AppDbContext db, ProductCatalog catalog)
{
    public async Task SaveAsync(Ticket ticket)
    {
        var previous = ticket.Version;
        ticket.Version = previous is null ? 0 : previous + 1;
        var document = ticket.ToBsonDocument();
        document["open"] = ticket.Open;
        if (previous is null) await db.InsertAsync("tickets", document);
        else
        {
            var result = await db.ReplaceAsync("tickets", new BsonDocument { { "_id", ticket.Id }, { "version", previous.Value } }, document);
            if (result.MatchedCount != 1) { ticket.Version = previous; throw new MongoConcurrencyException(); }
        }
    }
    public async Task<Ticket?> FindAsync(string code)
    {
        var ticket = await db.FirstAsync<Ticket>("tickets", t => t.Id == code);
        if (ticket is not null) await EnrichAsync([ticket]);
        return ticket;
    }
    public async Task<bool> HasOpenForDeviceAsync(string deviceId) => await db.Find<Ticket>("tickets", new BsonDocument { { "deviceId", deviceId }, { "open", true } }).AnyAsync();
    public async Task<List<Ticket>> SearchAsync(TicketFilter filter, int offset, int limit)
    {
        var items = await db.Find<Ticket>("tickets", await WhereAsync(filter)).SortByDescending(t => t.ReceivedAt).ThenByDescending(t => t.Id).Skip(offset).Limit(limit).ToListAsync();
        await EnrichAsync(items); return items;
    }
    public async Task<long> CountAsync(TicketFilter filter) => db.Session is null ? await db.Collection<Ticket>("tickets").CountDocumentsAsync(await WhereAsync(filter)) : await db.Collection<Ticket>("tickets").CountDocumentsAsync(db.Session, await WhereAsync(filter));
    public async Task<List<Ticket>> FindOpenAsync()
    {
        var items = await db.Find<Ticket>("tickets", new BsonDocument("open", true)).ToListAsync();
        await EnrichAsync(items);
        return items.OrderBy(t => t.Assignment?.Priority switch { Priority.URGENT => 0, Priority.NORMAL => 1, _ => 2 }).ThenBy(t => t.PromisedReturnAt is null ? 1 : 0).ThenBy(t => t.PromisedReturnAt).ToList();
    }
    public async Task<List<Ticket>> FindActiveForTechnicianAsync(string technicianId)
    {
        var filter = Builders<Ticket>.Filter.Eq("assignment.technicianId", technicianId)
            & Builders<Ticket>.Filter.Eq("open", true)
            & Builders<Ticket>.Filter.Nin(t => t.Status, [TicketStatus.COMPLETED, TicketStatus.AWAITING_RETURN]);
        var items = await db.Find<Ticket>("tickets", filter).ToListAsync();
        await EnrichAsync(items);
        return items;
    }
    public async Task<List<Ticket>> FindSlaDueBetweenAsync(DateTimeOffset from, DateTimeOffset until)
    {
        var filter = Builders<Ticket>.Filter;
        var items = await db.Find<Ticket>("tickets", new BsonDocument("open", true) & filter.Nin(t => t.Status, [TicketStatus.COMPLETED, TicketStatus.AWAITING_RETURN]) & filter.Gte(t => t.Sla.DueAt, from) & filter.Lte(t => t.Sla.DueAt, until)).ToListAsync();
        await EnrichAsync(items); return items;
    }
    public async Task<List<Ticket>> FindByCustomerAsync(string customerId)
    {
        var items = await db.Find<Ticket>("tickets", Builders<Ticket>.Filter.Eq(t => t.CustomerId, customerId)).SortByDescending(t => t.ReceivedAt).ThenByDescending(t => t.Id).ToListAsync();
        await EnrichAsync(items); return items;
    }
    public async Task<Dictionary<string, TechnicianLoad>> TechnicianLoadsAsync(DateTimeOffset from, DateTimeOffset to)
    {
        var items = await db.Find<Ticket>("tickets", new BsonDocument { { "open", true }, { "assignment", new BsonDocument("$ne", BsonNull.Value) } }).ToListAsync();
        return items.GroupBy(t => t.Assignment!.TechnicianId).ToDictionary(g => g.Key, g => new TechnicianLoad(g.LongCount(t => t.Status is not (TicketStatus.COMPLETED or TicketStatus.AWAITING_RETURN)), g.LongCount(t => t.Sla.DueAt >= from && t.Sla.DueAt <= to)));
    }
    private async Task<FilterDefinition<Ticket>> WhereAsync(TicketFilter value)
    {
        var f = Builders<Ticket>.Filter; var filter = f.Empty;
        if (!string.IsNullOrWhiteSpace(value.Status)) filter &= f.In("status", value.Status.Split(','));
        if (!string.IsNullOrWhiteSpace(value.Category))
        {
            var docs = new MongoDocuments(db);
            var category = await docs.GetAsync("device_categories", MongoDocuments.Eq("_id", value.Category));
            var types = category?.GetValue("deviceTypes", new BsonArray()).AsBsonArray.Select(t => t["code"].AsString).ToList() ?? [];
            var products = await docs.ListAsync("products", new BsonDocument("deviceTypeCode", new BsonDocument("$in", new BsonArray(types))));
            var productIds = products.Select(p => p["_id"].AsString).ToList();
            var devices = await db.Devices.Where(d => productIds.Contains(d.ProductId)).Select(d => d.Id).ToListAsync();
            filter &= f.In(t => t.DeviceId, devices);
        }
        if (!string.IsNullOrWhiteSpace(value.Technician)) filter &= f.Eq(t => t.Assignment!.TechnicianId, value.Technician);
        if (value.From is { } from) filter &= f.Gte(t => t.ReceivedAt, from);
        if (value.To is { } to) filter &= f.Lte(t => t.ReceivedAt, to);
        if (!string.IsNullOrWhiteSpace(value.Query))
        {
            var docs = new MongoDocuments(db);
            var customers = (await docs.ListAsync("customers", MongoDocuments.Search(value.Query.Trim(), "phone"))).Select(c => c["_id"].AsString).ToList();
            var devices = (await docs.ListAsync("devices", MongoDocuments.Search(value.Query.Trim(), "serialNormalized"))).Select(d => d["_id"].AsString).ToList();
            filter &= f.Or(MongoDocuments.Search(value.Query.Trim(), "_id"), f.In(t => t.CustomerId, customers), f.In(t => t.DeviceId, devices));
        }
        if (!string.IsNullOrWhiteSpace(value.Sla)) filter &= value.Sla switch
        {
            "BREACHED" => f.Lt(t => t.Sla.DueAt, value.Now),
            "AT_RISK" => f.Gte(t => t.Sla.DueAt, value.Now) & f.Lte(t => t.Sla.DueAt, value.AtRiskUntil),
            "ON_TRACK" => f.Gt(t => t.Sla.DueAt, value.AtRiskUntil),
            _ => f.Eq("_id", ""),
        };
        return filter;
    }
    private async Task EnrichAsync(List<Ticket> items)
    {
        if (items.Count == 0) return;
        var ids = items.Select(t => t.Id).ToList();
        var quotes = await db.ListAsync<Quotation>("quotations", q => ids.Contains(q.TicketId) && q.Approval.Status != "REJECTED");
        var customerIds = items.Select(t => t.CustomerId).Distinct().ToList();
        var deviceIds = items.Select(t => t.DeviceId).Distinct().ToList();
        var customers = (await db.Customers.Where(c => customerIds.Contains(c.Id)).ToListAsync()).ToDictionary(c => c.Id);
        var devices = (await db.Devices.Where(d => deviceIds.Contains(d.Id)).ToListAsync()).ToDictionary(d => d.Id);
        var products = new Dictionary<string, ProductInfo>();
        foreach (var productId in devices.Values.Select(d => d.ProductId).Distinct()) products[productId] = await catalog.RequireProductAsync(productId, false);
        foreach (var item in items)
        {
            item.ActiveQuotationId = quotes.FirstOrDefault(q => q.TicketId == item.Id)?.Id;
            if (customers.TryGetValue(item.CustomerId, out var customer))
            {
                var snapshot = new Dictionary<string, string> { ["fullName"] = customer.FullName, ["phone"] = customer.Phone };
                if (customer.Email is { } email) snapshot["email"] = email;
                if (customer.Address is { } address) snapshot["address"] = address;
                item.CustomerSnapshot = snapshot;
            }
            if (devices.TryGetValue(item.DeviceId, out var device) && products.TryGetValue(device.ProductId, out var product))
            {
                item.DeviceSnapshot = new Dictionary<string, string>(product.Snapshot.Where(p => p.Value is not null && p.Key != "name").ToDictionary(p => p.Key, p => p.Value!))
                { ["productId"] = device.ProductId, ["productName"] = product.Snapshot["name"]!, ["serialOrImei"] = device.SerialOrImei, ["identifierType"] = device.IdentifierType.ToString() };
                item.WarrantyAtIntake = item.WarrantyAtIntake with { Distributor = device.Distributor };
            }
        }
    }
}
