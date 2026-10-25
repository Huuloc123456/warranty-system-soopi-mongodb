using MongoDB.Bson;
using Soopi.Api.Data;
using Soopi.Api.Domain.Identity;
using Soopi.Api.Domain.Shared;
using Soopi.Api.Infrastructure.Security;
using static Soopi.Api.Data.MongoDocuments;
namespace Soopi.Api.Services.Notifications;

public sealed record NotificationView(string Id, string Type, string Message, string? Link, string? EntityId, DateTimeOffset? CreatedAt, bool Read);
public sealed record Inbox(IReadOnlyList<NotificationView> Items, long UnreadCount);
public sealed class NotificationQueryService(MongoDocuments docs, CurrentActor actors)
{
    public async Task<Inbox> InboxAsync(bool unreadOnly)
    {
        var actor = actors.RequireSignedIn(); var visible = Visible(actor);
        var unread = And(visible, new BsonDocument("readBy", new BsonDocument("$ne", actor.AccountId)));
        var rows = await docs.ListAsync("notifications", unreadOnly ? unread : visible, new BsonDocument { { "createdAt", -1 }, { "_id", -1 } }, limit: 50);
        return new Inbox(rows.Select(d => new NotificationView(d["_id"].ToInt64().ToString(), d["type"].AsString, d["message"].AsString, d["link"].IsBsonNull ? null : d["link"].AsString, d["entityId"].IsBsonNull ? null : d["entityId"].AsString, (DateTimeOffset?)Plain(d["createdAt"]), d["readBy"].AsBsonArray.Contains(Value(actor.AccountId)))).ToList(), await docs.CountAsync("notifications", unread));
    }
    public async Task MarkReadAsync(string id)
    {
        var actor = actors.RequireSignedIn();
        if (!long.TryParse(id, out var number) || await docs.UpdateAsync("notifications", And(Visible(actor), Eq("_id", number)), new BsonDocument("$addToSet", new BsonDocument("readBy", actor.AccountId))) != 1) throw new DomainException(ErrorCode.NOT_FOUND);
    }
    public Task MarkAllReadAsync()
    {
        var actor = actors.RequireSignedIn();
        return docs.UpdateAsync("notifications", Visible(actor), new BsonDocument("$addToSet", new BsonDocument("readBy", actor.AccountId)));
    }
    private static BsonDocument Visible(AuthenticatedActor actor) => new("$or", new BsonArray { Eq("accountId", actor.AccountId), new BsonDocument("role", new BsonDocument("$in", new BsonArray(actor.RoleNames))) });
}
