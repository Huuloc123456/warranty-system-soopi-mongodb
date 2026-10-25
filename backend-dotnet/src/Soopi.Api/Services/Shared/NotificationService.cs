using MongoDB.Bson;
using Soopi.Api.Data;
using Soopi.Api.Data.Entities;
using Soopi.Api.Data.Stores;
using Soopi.Api.Domain.Shared;
using static Soopi.Api.Data.MongoDocuments;
namespace Soopi.Api.Services.Shared;

public sealed class NotificationService(AppDbContext db, MongoDocuments docs, TimeProvider clock, PushDispatcher pushes, TransactionRunner transactions)
{
    public const string CustomerPortal = "/portal";
    public const string CustomAnnouncementType = "CUSTOM_ANNOUNCEMENT";
    public Task ForRoleAsync(string role, string type, string message, string? link, string? entityId) => InsertAsync(role, null, type, message, link, entityId);
    public Task ForAccountAsync(string? accountId, string type, string message, string? link, string? entityId) => string.IsNullOrWhiteSpace(accountId) ? Task.CompletedTask : InsertAsync(null, long.Parse(accountId), type, message, link, entityId);
    public async Task ForEmployeeAsync(string employeeId, string type, string message, string? link, string? entityId)
    {
        var e = await db.FirstAsync<EmployeeRecord>("employees", e => e.Code == employeeId);
        if (e?.AccountId is { } id) await InsertAsync(null, id, type, message, link, entityId);
    }
    public async Task ForCustomerAsync(string customerId, string type, string message, string? entityId)
    {
        var c = await db.Customers.FirstOrDefaultAsync(c => c.Id == customerId);
        await ForActiveCustomerAsync(c, type, message, entityId);
    }
    public async Task ForCustomerPhoneAsync(string phone, string type, string message, string? entityId)
    {
        var c = await db.Customers.FirstOrDefaultAsync(c => c.Phone == phone && c.Status == CustomerStatus.ACTIVE);
        await ForActiveCustomerAsync(c, type, message, entityId);
    }
    private async Task ForActiveCustomerAsync(Customer? c, string type, string message, string? entityId)
    {
        if (c?.AccountId is { } id && await db.Accounts.AnyAsync(a => a.Id == id && a.Status == AccountStatus.ACTIVE)) await InsertAsync(null, id, type, message, CustomerPortal, entityId);
    }
    public Task BroadcastToCustomersAsync(IReadOnlyList<string> customerIds, string message, string? link) => BroadcastAsync(customerIds, message, link);
    public Task BroadcastToAllCustomersAsync(string message, string? link) => BroadcastAsync(null, message, link);

    private Task BroadcastAsync(IReadOnlyList<string>? customerIds, string message, string? link) => transactions.InTransactionAsync(async () =>
    {
        var customers = db.Customers.Where(c => c.Status == CustomerStatus.ACTIVE && c.AccountId != null);
        var ids = customerIds?.Distinct(StringComparer.OrdinalIgnoreCase).ToArray();
        if (ids is not null)
        {
            if (ids.Length == 0) throw new DomainException(ErrorCode.VALIDATION_FAILED);
            customers = customers.Where(c => ids.Contains(c.Id));
        }
        var accountIds = (await customers.Select(c => c.AccountId!.Value).ToListAsync()).Distinct().ToList();
        var activeAccounts = await db.Accounts.Where(a => accountIds.Contains(a.Id) && a.Status == AccountStatus.ACTIVE)
            .Select(a => a.Id).ToListAsync();
        if (ids is not null && activeAccounts.Count != ids.Length) throw new DomainException(ErrorCode.VALIDATION_FAILED);
        foreach (var accountId in activeAccounts)
            await InsertAsync(null, accountId, CustomAnnouncementType, message, link, null);
    });
    public async Task<bool> ExistsAsync(string type, string entityId) => await docs.GetAsync("notifications", Document(("type", type), ("entityId", entityId))) is not null;
    private async Task InsertAsync(string? role, long? accountId, string type, string message, string? link, string? entityId)
    {
        var id = await db.NextIdAsync("notifications");
        var storedType = Limit(type, 40)!; var storedMessage = Limit(message, 255)!; var storedEntity = Limit(entityId, 30);
        await docs.InsertAsync("notifications", Document(("_id", id), ("role", role), ("accountId", accountId), ("type", storedType), ("message", storedMessage), ("link", Limit(link, 255)), ("entityId", storedEntity), ("createdAt", clock.GetUtcNow()), ("readBy", new BsonArray())));
        if (accountId is not null) pushes.Dispatch(accountId.Value, id, storedType, storedMessage, storedEntity);
    }
    private static string? Limit(string? value, int max) => value is null || value.Length <= max ? value : value[..max];
}
