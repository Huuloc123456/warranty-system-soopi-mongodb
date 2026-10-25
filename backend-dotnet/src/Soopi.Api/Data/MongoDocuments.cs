using MongoDB.Bson;
using MongoDB.Driver;
namespace Soopi.Api.Data;

/// <summary>Danh mục và bản ghi API có cấu trúc động; tất cả filter/update được gửi trực tiếp tới MongoDB.</summary>
public sealed class MongoDocuments(AppDbContext db)
{
    public static BsonDocument Document(params (string Key, object? Value)[] fields) => new(fields.Select(f => new BsonElement(f.Key, Value(f.Value))));
    public static BsonValue Value(object? value) => value switch
    {
        null => BsonNull.Value,
        BsonValue bson => bson,
        DateTimeOffset date => new BsonDateTime(date.UtcDateTime),
        DateOnly date => new BsonString(date.ToString("yyyy-MM-dd")),
        decimal number => new BsonDecimal128(number),
        Enum item => new BsonString(item.ToString()),
        IReadOnlyDictionary<string, object?> map => new BsonDocument(map.Select(p => new BsonElement(p.Key, Value(p.Value)))),
        System.Collections.IDictionary map => new BsonDocument(map.Keys.Cast<object>().Select(k => new BsonElement(k.ToString()!, Value(map[k])))),
        System.Collections.IEnumerable items when value is not string => new BsonArray(items.Cast<object?>().Select(Value)),
        _ => BsonValue.Create(value),
    };
    public static object? Plain(BsonValue value) => value.BsonType switch
    {
        BsonType.Null => null,
        BsonType.Document => Map(value.AsBsonDocument),
        BsonType.Array => value.AsBsonArray.Select(Plain).ToList(),
        BsonType.DateTime => new DateTimeOffset(value.ToUniversalTime(), TimeSpan.Zero),
        BsonType.Decimal128 => Decimal128.ToDecimal(value.AsDecimal128),
        BsonType.String => value.AsString,
        BsonType.Boolean => value.AsBoolean,
        BsonType.Int32 => value.AsInt32,
        BsonType.Int64 => value.AsInt64,
        BsonType.Double => value.AsDouble,
        _ => value.ToString(),
    };
    public static Dictionary<string, object?> Map(BsonDocument doc) => doc.Elements.ToDictionary(e => e.Name, e => Plain(e.Value));
    public static BsonDocument Eq(string key, object? value) => Document((key, value));
    public static BsonDocument And(params BsonDocument[] conditions) => new("$and", new BsonArray(conditions.Where(c => c.ElementCount > 0)));
    public static BsonDocument Search(string query, params string[] fields) => new("$or", new BsonArray(fields.Select(field => new BsonDocument(field, new BsonRegularExpression(System.Text.RegularExpressions.Regex.Escape(query), "i")))));
    public async Task<BsonDocument?> GetAsync(string name, BsonDocument filter) => await db.Find<BsonDocument>(name, filter).FirstOrDefaultAsync();
    public async Task<List<BsonDocument>> ListAsync(string name, BsonDocument? filter = null, BsonDocument? sort = null, int skip = 0, int? limit = null)
    {
        var query = db.Find<BsonDocument>(name, filter ?? new BsonDocument());
        if (sort is not null) query = query.Sort(sort);
        if (skip > 0) query = query.Skip(skip);
        if (limit is > 0) query = query.Limit(limit);
        return await query.ToListAsync();
    }
    public Task InsertAsync(string name, BsonDocument document) => db.InsertAsync(name, document);
    public Task PutAsync(string name, BsonDocument document) => db.ReplaceAsync(name, Eq("_id", document["_id"]), document, true);
    public async Task<long> UpdateAsync(string name, BsonDocument filter, BsonDocument update, bool upsert = false) => (await db.UpdateAsync<BsonDocument>(name, filter, update, upsert)).MatchedCount;
    public Task DeleteAsync(string name, BsonDocument filter) => db.DeleteAsync<BsonDocument>(name, filter);
    public Task<long> CountAsync(string name, BsonDocument filter) => db.Session is null
        ? db.Collection<BsonDocument>(name).CountDocumentsAsync(filter) : db.Collection<BsonDocument>(name).CountDocumentsAsync(db.Session, filter);
}
