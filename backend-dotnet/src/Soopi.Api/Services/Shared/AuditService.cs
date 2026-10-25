using Soopi.Api.Data;
using static Soopi.Api.Data.MongoDocuments;
namespace Soopi.Api.Services.Shared;
/// <summary>Nhật ký chỉ có đường ghi thêm và đọc.</summary>
public sealed class AuditService(AppDbContext db, MongoDocuments docs, TimeProvider clock)
{
    public async Task RecordAsync(string? actorId, string? actorName, IEnumerable<string>? actorRoles, string action, string? actionLabel, string entityType, string? entityId, string? before = null, string? after = null)
    {
        await docs.InsertAsync("audit_logs", Document(("_id", await db.NextIdAsync("audit_logs")), ("at", clock.GetUtcNow()), ("actorId", Limit(actorId ?? "SYSTEM", 30)), ("actorName", Limit(actorName, 100)), ("actorRoles", actorRoles?.ToList() ?? []), ("action", Limit(action, 50)), ("actionLabel", Limit(actionLabel ?? action, 100)), ("entityType", Limit(entityType, 30)), ("entityId", Limit(entityId ?? "—", 30)), ("before", Limit(before, 500)), ("after", Limit(after, 500))));
    }
    private static string? Limit(string? value, int max) => value is null || value.Length <= max ? value : value[..max];
}
