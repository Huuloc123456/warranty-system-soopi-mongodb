using System.Linq.Expressions;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Conventions;
using MongoDB.Bson.Serialization.Serializers;
using MongoDB.Driver;
using MongoDB.Driver.Linq;
using Soopi.Api.Data.Entities;

namespace Soopi.Api.Data;

/// <summary>MongoDB session theo request; theo dõi entity tài khoản/hồ sơ đang chỉnh sửa.</summary>
public sealed class AppDbContext(MongoClient client, IConfiguration configuration)
{
    public MongoClient Client { get; } = client;
    public IMongoDatabase Database { get; } = client.GetDatabase(configuration["Mongo:Database"] ?? "soopi_mongodb");
    public IClientSessionHandle? Session { get; set; }
    private readonly Dictionary<object, (string Collection, BsonDocument? Original)> tracked = new(ReferenceEqualityComparer.Instance);
    public MongoSet<Account> Accounts => new(this, "accounts");
    public MongoSet<RefreshToken> RefreshTokens => new(this, "refresh_tokens");
    public MongoSet<Customer> Customers => new(this, "customers");
    public MongoSet<Device> Devices => new(this, "devices");
    public MongoSet<Payment> Payments => new(this, "payments");
    public MongoSet<EmployeeAccountLink> EmployeeLinks => new(this, "employees");
    public IMongoCollection<T> Collection<T>(string name) => Database.GetCollection<T>(name);
    public IQueryable<T> Query<T>(string name) => Session is null ? Collection<T>(name).AsQueryable() : Collection<T>(name).AsQueryable(Session);
    public IFindFluent<T, T> Find<T>(string name, FilterDefinition<T> filter) => Session is null ? Collection<T>(name).Find(filter) : Collection<T>(name).Find(Session, filter);
    public Task<List<T>> ListAsync<T>(string name, Expression<Func<T, bool>> filter) => Find(name, (FilterDefinition<T>)filter).ToListAsync();
    public Task<T?> FirstAsync<T>(string name, Expression<Func<T, bool>> filter) => Find(name, (FilterDefinition<T>)filter).FirstOrDefaultAsync()!;
    public Task InsertAsync<T>(string name, T item) => Session is null ? Collection<T>(name).InsertOneAsync(item) : Collection<T>(name).InsertOneAsync(Session, item);
    public Task<UpdateResult> UpdateAsync<T>(string name, FilterDefinition<T> filter, UpdateDefinition<T> update, bool upsert = false) => Session is null
        ? Collection<T>(name).UpdateManyAsync(filter, update, new UpdateOptions { IsUpsert = upsert })
        : Collection<T>(name).UpdateManyAsync(Session, filter, update, new UpdateOptions { IsUpsert = upsert });
    public Task<DeleteResult> DeleteAsync<T>(string name, FilterDefinition<T> filter, CancellationToken cancellationToken = default) => Session is null
        ? Collection<T>(name).DeleteManyAsync(filter, cancellationToken) : Collection<T>(name).DeleteManyAsync(Session, filter, cancellationToken: cancellationToken);
    public Task<ReplaceOneResult> ReplaceAsync<T>(string name, FilterDefinition<T> filter, T item, bool upsert = false) => Session is null
        ? Collection<T>(name).ReplaceOneAsync(filter, item, new ReplaceOptions { IsUpsert = upsert })
        : Collection<T>(name).ReplaceOneAsync(Session, filter, item, new ReplaceOptions { IsUpsert = upsert });
    public async Task<long> NextIdAsync(string scope)
    {
        var collection = Collection<BsonDocument>("counters");
        var filter = Builders<BsonDocument>.Filter.Eq("_id", scope);
        var update = Builders<BsonDocument>.Update.Inc("value", 1L);
        var options = new FindOneAndUpdateOptions<BsonDocument> { IsUpsert = true, ReturnDocument = ReturnDocument.After };
        // Cấp số NGOÀI transaction. Document counters là điểm tranh chấp chung của mọi transaction (audit_logs,
        // notifications, TN-yyyy-MMdd…): ghi trong session khiến hai transaction cùng tăng một bộ đếm bị WriteConflict
        // (MongoDB không giống SQL Server về khóa). Ghi ngoài session thì không tranh chấp; nếu transaction rollback,
        // số đã tăng vẫn bị bỏ (chấp nhận số bị nhảy), giống sequence tách rời khỏi transaction.
        var result = await collection.FindOneAndUpdateAsync(filter, update, options);
        return result["value"].ToInt64();
    }
    internal void Track(object item, string name, bool added = false)
    {
        if (!tracked.ContainsKey(item)) tracked[item] = (name, added ? null : item.ToBsonDocument(item.GetType()));
    }
    public void ClearTracking() => tracked.Clear();
    public async Task<int> SaveChangesAsync()
    {
        var count = 0;
        foreach (var (item, state) in tracked.ToArray())
        {
            var document = item.ToBsonDocument(item.GetType());
            if (state.Original is not null && document.Equals(state.Original)) continue;
            if (state.Original is null && document["_id"].IsInt64 && document["_id"].AsInt64 == 0)
            {
                var id = await NextIdAsync(state.Collection);
                item.GetType().GetProperty("Id")!.SetValue(item, id);
                document["_id"] = id;
            }
            if (state.Original is null) await InsertAsync(state.Collection, document);
            else
            {
                // Compare original fields to prevent lost updates to login counters and refresh rotation.
                var replaced = await ReplaceAsync(state.Collection, state.Original, document);
                if (replaced.MatchedCount != 1) throw new MongoConcurrencyException();
            }
            tracked[item] = (state.Collection, document); count++;
        }
        return count;
    }
    public async Task<bool> CanConnectAsync()
    {
        try { await Database.RunCommandAsync<BsonDocument>(new BsonDocument("ping", 1)); return true; }
        catch (MongoException) { return false; }
    }
}
public sealed class MongoConcurrencyException : Exception;
public class MongoQuery<T>(AppDbContext context, string collection, IQueryable<T> query) : IOrderedQueryable<T>
{
    internal AppDbContext Context => context;
    internal string CollectionName => collection;
    internal IQueryable<T> Inner => query;
    public Type ElementType => typeof(T);
    public Expression Expression => query.Expression;
    public IQueryProvider Provider => new MongoTrackingProvider(context, collection, query.Provider);
    public IEnumerator<T> GetEnumerator() => query.GetEnumerator();
    System.Collections.IEnumerator System.Collections.IEnumerable.GetEnumerator() => GetEnumerator();
}
public sealed class MongoSet<T>(AppDbContext context, string name) : MongoQuery<T>(context, name, context.Query<T>(name))
{
    public void Add(T item) => Context.Track(item!, CollectionName, true);
}
internal sealed class MongoTrackingProvider(AppDbContext context, string name, IQueryProvider provider) : IQueryProvider
{
    public IQueryable CreateQuery(Expression expression) => throw new NotSupportedException("Use generic queries");
    public IQueryable<T> CreateQuery<T>(Expression expression) => new MongoQuery<T>(context, name, provider.CreateQuery<T>(expression));
    public object? Execute(Expression expression) => provider.Execute(expression);
    public T Execute<T>(Expression expression) => provider.Execute<T>(expression);
}
public static class MongoQueryExtensions
{
    public static IQueryable<T> AsNoTracking<T>(this IQueryable<T> query) => query;
    public static async Task<List<T>> ToListAsync<T>(this IQueryable<T> query, CancellationToken cancellationToken = default)
    {
        var mongo = query as MongoQuery<T>;
        var result = await MongoQueryable.ToListAsync(mongo?.Inner ?? query, cancellationToken);
        if (typeof(T) == typeof(Account) || typeof(T) == typeof(Customer) || typeof(T) == typeof(Device) || typeof(T) == typeof(RefreshToken) || typeof(T) == typeof(Payment))
            if (mongo is not null) foreach (var item in result) mongo.Context.Track(item!, mongo.CollectionName);
        return result;
    }
    public static async Task<T?> FirstOrDefaultAsync<T>(this IQueryable<T> query) => (await query.Take(1).ToListAsync()).FirstOrDefault();
    public static Task<T?> FirstOrDefaultAsync<T>(this IQueryable<T> query, Expression<Func<T, bool>> predicate) => query.Where(predicate).FirstOrDefaultAsync();
    public static Task<int> CountAsync<T>(this IQueryable<T> query) => MongoQueryable.CountAsync(query is MongoQuery<T> q ? q.Inner : query);
    public static Task<int> CountAsync<T>(this IQueryable<T> query, Expression<Func<T, bool>> predicate) => query.Where(predicate).CountAsync();
    public static Task<long> LongCountAsync<T>(this IQueryable<T> query) => MongoQueryable.LongCountAsync(query is MongoQuery<T> q ? q.Inner : query);
    public static Task<bool> AnyAsync<T>(this IQueryable<T> query, Expression<Func<T, bool>> predicate) => MongoQueryable.AnyAsync(((MongoQuery<T>)query.Where(predicate)).Inner);
    public static Task ExecuteUpdateAsync<T>(this IQueryable<T> query, Func<MongoSetter<T>, MongoSetter<T>> update)
    {
        var q = (MongoQuery<T>)query;
        return q.Context.UpdateAsync(q.CollectionName, Filter<T>(query.Expression), update(new MongoSetter<T>()).Update!);
    }
    public static Task ExecuteDeleteAsync<T>(this IQueryable<T> query, CancellationToken cancellationToken = default)
    {
        var q = (MongoQuery<T>)query;
        return q.Context.DeleteAsync(q.CollectionName, Filter<T>(query.Expression), cancellationToken);
    }
    private static FilterDefinition<T> Filter<T>(Expression expression)
    {
        var filter = Builders<T>.Filter.Empty;
        while (expression is MethodCallExpression call)
        {
            if (call.Method.Name != "Where") throw new NotSupportedException("Bulk mutations only accept Where filters");
            var predicate = (Expression<Func<T, bool>>)((UnaryExpression)call.Arguments[1]).Operand;
            filter &= Builders<T>.Filter.Where(predicate); expression = call.Arguments[0];
        }
        return filter;
    }
}
public sealed class MongoSetter<T>
{
    internal UpdateDefinition<T>? Update { get; private set; }
    public MongoSetter<T> SetProperty<TValue>(Expression<Func<T, TValue>> field, TValue value)
    {
        var next = Builders<T>.Update.Set(field, value);
        Update = Update is null ? next : Builders<T>.Update.Combine(Update, next); return this;
    }
}
public static class MongoMapping
{
    private static readonly object Sync = new();
    private static bool initialized;
    public static void Configure()
    {
        lock (Sync)
        {
            if (initialized) return;
            BsonSerializer.RegisterSerializer(new UtcOffsetSerializer());
            BsonSerializer.RegisterSerializer(new DateOnlySerializer(BsonType.String));
            BsonSerializer.RegisterSerializer(new DecimalSerializer(BsonType.Decimal128));
            ConventionRegistry.Register("Soopi", new ConventionPack { new CamelCaseElementNameConvention(), new EnumRepresentationConvention(BsonType.String), new IgnoreExtraElementsConvention(true) }, type => type.Assembly == typeof(AppDbContext).Assembly);
            foreach (var type in typeof(AppDbContext).Assembly.GetTypes().Where(t => t.IsClass && !t.IsAbstract && !typeof(Exception).IsAssignableFrom(t) && !t.ContainsGenericParameters && !t.Name.StartsWith('<') && t != typeof(EmployeeAccountLink) && (t.Namespace?.StartsWith("Soopi.Api.Domain.") == true || t.Namespace == "Soopi.Api.Data.Entities")))
            {
                if (BsonClassMap.IsClassMapRegistered(type)) continue;
                var map = new BsonClassMap(type); map.AutoMap();
                var properties = type.GetProperties(System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.DeclaredOnly);
                foreach (var property in properties.Where(p => p.SetMethod is not null && p.GetIndexParameters().Length == 0 && p.Name != "EqualityContract")) map.MapMember(property);
                var constructor = type.GetConstructor(System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.NonPublic, null, Type.EmptyTypes, null);
                if (constructor is not null) map.SetCreator(() => constructor.Invoke(null));
                foreach (var property in type.GetProperties().Where(p => p.SetMethod is null && map.GetMemberMap(p.Name) is not null)) map.UnmapMember(property);
                foreach (var property in properties.Where(p => Attribute.IsDefined(p, typeof(System.ComponentModel.DataAnnotations.Schema.NotMappedAttribute)))) map.UnmapMember(property);
                if (type == typeof(Payment)) map.GetMemberMap(nameof(Payment.Amount)).SetSerializer(new PaymentAmountSerializer());
                BsonClassMap.RegisterClassMap(map);
            }
            BsonClassMap.RegisterClassMap<Stores.EmployeeRecord>(map => { map.AutoMap(); map.MapIdMember(e => e.Code); });
            BsonClassMap.RegisterClassMap<EmployeeAccountLink>(map => { map.AutoMap(); map.MapIdMember(e => e.Code); });
            initialized = true;
        }
    }
}
public sealed class UtcOffsetSerializer : StructSerializerBase<DateTimeOffset>
{
    public override DateTimeOffset Deserialize(BsonDeserializationContext context, BsonDeserializationArgs args) => DateTimeOffset.FromUnixTimeMilliseconds(context.Reader.ReadDateTime());
    public override void Serialize(BsonSerializationContext context, BsonSerializationArgs args, DateTimeOffset value) => context.Writer.WriteDateTime(value.ToUnixTimeMilliseconds());
}
public sealed class PaymentAmountSerializer : StructSerializerBase<decimal>
{
    public override decimal Deserialize(BsonDeserializationContext context, BsonDeserializationArgs args)
    {
        var value = Decimal128.ToDecimal(context.Reader.ReadDecimal128());
        return decimal.Truncate(value) == value ? decimal.Round(value, 0) : value;
    }
    public override void Serialize(BsonSerializationContext context, BsonSerializationArgs args, decimal value) => context.Writer.WriteDecimal128(new Decimal128(value));
}
