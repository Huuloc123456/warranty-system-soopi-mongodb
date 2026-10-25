using MongoDB.Bson;
using Soopi.Api.Data;
using Soopi.Api.Domain.Identity;
using Soopi.Api.DTOs.Shared;
using Soopi.Api.Infrastructure.Security;
using static Soopi.Api.Data.MongoDocuments;
namespace Soopi.Api.Services.Reporting;

public sealed record AuditEntryView(DateTimeOffset? At, string ActorId, string? ActorName, IReadOnlyList<string> ActorRoles, string Action, string ActionLabel, string EntityType, string EntityId, string? Before, string? After);
public sealed class AuditQueryService(MongoDocuments docs, CurrentActor actors)
{
    private static readonly HashSet<string> SortFields = ["at"];
    public async Task<PageResponse<AuditEntryView>> SearchAsync(string? entityType, string? entityId, string? actor, DateTimeOffset? from, DateTimeOffset? to, PageRequestParams paging)
    {
        actors.Require(Permission.AUDIT_READ); paging.Validate();
        var direction = paging.ParseSort(SortFields, "at", defaultDescending: true).Descending ? -1 : 1;
        var filter = new BsonDocument();
        if (!string.IsNullOrWhiteSpace(entityType)) filter = And(filter, Eq("entityType", entityType));
        if (!string.IsNullOrWhiteSpace(entityId)) filter = And(filter, Eq("entityId", entityId));
        if (!string.IsNullOrWhiteSpace(actor)) filter = And(filter, new BsonDocument("$or", new BsonArray { Eq("actorId", actor.Trim()), Search(actor.Trim(), "actorName") }));
        if (from is { } f) filter = And(filter, new BsonDocument("at", new BsonDocument("$gte", Value(f))));
        if (to is { } t) filter = And(filter, new BsonDocument("at", new BsonDocument("$lt", Value(t))));
        var rows = await docs.ListAsync("audit_logs", filter, new BsonDocument { { "at", direction }, { "_id", direction } }, paging.Offset, paging.Size);
        return PageResponse<AuditEntryView>.Of(rows.Select(Entry).ToList(), paging.Page, paging.Size, await docs.CountAsync("audit_logs", filter));
    }
    public static AuditEntryView Entry(BsonDocument d) => new((DateTimeOffset?)Plain(d["at"]), d["actorId"].AsString, d["actorName"].IsBsonNull ? null : d["actorName"].AsString, d["actorRoles"].AsBsonArray.Select(r => r.AsString).ToList(), d["action"].AsString, d["actionLabel"].AsString, d["entityType"].AsString, d["entityId"].AsString, d["before"].IsBsonNull ? null : d["before"].AsString, d["after"].IsBsonNull ? null : d["after"].AsString);
}
