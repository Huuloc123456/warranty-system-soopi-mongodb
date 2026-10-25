using MongoDB.Bson;
using static Soopi.Api.Data.MongoDocuments;
namespace Soopi.Api.Data.Stores;

public sealed class PushDeviceStore(MongoDocuments docs)
{
    public async Task UpsertAsync(string installationId, long accountId, string platform, string pushToken, string? appVersion, DateTimeOffset now)
    {
        await docs.DeleteAsync("push_devices", Document(("pushToken", pushToken), ("_id", new BsonDocument("$ne", installationId))));
        await docs.UpdateAsync("push_devices", Eq("_id", installationId), new BsonDocument {
            {"$set",Document(("accountId",accountId),("platform",platform),("pushToken",pushToken),("appVersion",appVersion),("updatedAt",now))},
            {"$setOnInsert",Document(("registeredAt",now))}}, true);
    }
    public Task DeleteAsync(string installationId, long accountId) => docs.DeleteAsync("push_devices", Document(("_id", installationId), ("accountId", accountId)));
    public Task DeleteAllAsync(long accountId) => docs.DeleteAsync("push_devices", Eq("accountId", accountId));
    public Task DeleteTokenAsync(string pushToken) => docs.DeleteAsync("push_devices", Eq("pushToken", pushToken));
    public async Task<List<string>> TokensOfAsync(long accountId) => (await docs.ListAsync("push_devices", Eq("accountId", accountId), new BsonDocument("updatedAt", -1))).Select(d => d["pushToken"].AsString).ToList();
}
