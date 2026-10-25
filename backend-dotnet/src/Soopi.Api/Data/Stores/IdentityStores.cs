using MongoDB.Bson;
using MongoDB.Driver;
using Soopi.Api.Data.Entities;
using Soopi.Api.Domain.Shared;
using static Soopi.Api.Data.MongoDocuments;
namespace Soopi.Api.Data.Stores;

public sealed record EmployeeRecord(string Code, string FullName, string Phone, string? Email, string? Specialty, IReadOnlyList<string> Skills, int MaxActiveTickets, bool OnSite, string WorkStatus, string StationCode, long? AccountId);
public sealed class EmployeeRecordStore(AppDbContext db)
{
    public Task<List<EmployeeRecord>> FindAllAsync() => db.Find<EmployeeRecord>("employees", Builders<EmployeeRecord>.Filter.Empty).SortBy(e => e.Code).ToListAsync();
    public Task<EmployeeRecord?> FindAsync(string code) => db.FirstAsync<EmployeeRecord>("employees", e => e.Code == code);
    public async Task SaveAsync(EmployeeRecord record)
    {
        if (await db.Find<BsonDocument>("service_stations", Eq("_id", record.StationCode)).FirstOrDefaultAsync() is null) throw new DomainException(ErrorCode.VALIDATION_FAILED);
        await db.ReplaceAsync("employees", Builders<EmployeeRecord>.Filter.Eq(e => e.Code, record.Code), record, true);
    }
}
public sealed record CustomerProfile(string Code, string FullName, string Phone, long? AccountId, string? Email);
public sealed class CustomerProfileStore(AppDbContext db)
{
    public async Task<CustomerProfile?> FindActiveByVerifiedEmailAsync(string email)
    {
        var c = await db.Customers.FirstOrDefaultAsync(c => c.VerifiedEmail == email && c.AccountId != null && c.Status == CustomerStatus.ACTIVE);
        return c is null ? null : new CustomerProfile(c.Id, c.FullName, c.Phone, c.AccountId, c.Email);
    }
    public async Task<CustomerProfile?> FindActiveByPhoneAsync(string phone)
    {
        var c = await db.Customers.FirstOrDefaultAsync(c => c.Phone == phone && c.Status == CustomerStatus.ACTIVE);
        return c is null ? null : new CustomerProfile(c.Id, c.FullName, c.Phone, c.AccountId, c.Email);
    }
    public async Task CreateAsync(string code, string fullName, string phone, string email, DateTimeOffset now)
    {
        var customer = new Customer(code, fullName, phone, email, null, now);
        customer.VerifyEmail(email);
        db.Customers.Add(customer); await db.SaveChangesAsync();
    }
    public async Task VerifyEmailAsync(string customerCode, string email)
    {
        var result = await db.UpdateAsync<Customer>("customers", Builders<Customer>.Filter.Eq(c => c.Id, customerCode)
            & Builders<Customer>.Filter.Eq(c => c.AccountId, null),
            Builders<Customer>.Update.Set(c => c.Email, email).Set(c => c.VerifiedEmail, email));
        if (result.MatchedCount != 1) throw new DomainException(ErrorCode.CUSTOMER_ACCOUNT_EXISTS);
        db.ClearTracking();
    }
    public async Task LinkAccountAsync(string customerCode, long accountId)
    {
        var result = await db.UpdateAsync<Customer>("customers", Builders<Customer>.Filter.Eq(c => c.Id, customerCode) & Builders<Customer>.Filter.Eq(c => c.AccountId, null), Builders<Customer>.Update.Set(c => c.AccountId, accountId));
        if (result.MatchedCount != 1) throw new DomainException(ErrorCode.CUSTOMER_ACCOUNT_EXISTS);
        db.ClearTracking();
    }
}
public sealed record PendingOtp(long Id, string Email, string CodeHash, int FailedAttempts);
public sealed class OtpStore(AppDbContext db, MongoDocuments docs, TransactionRunner transactions)
{
    public Task<long> ReplaceAsync(string phone, string purpose, string email, string codeHash, DateTimeOffset now, DateTimeOffset expiresAt, string? clientIp) => transactions.InTransactionAsync(async () =>
    {
        await docs.UpdateAsync("otp_codes", Document(("phone", phone), ("purpose", purpose), ("usedAt", null)), new BsonDocument("$set", Document(("usedAt", now))));
        var id = await db.NextIdAsync("otp_codes");
        await docs.InsertAsync("otp_codes", Document(("_id", id), ("phone", phone), ("purpose", purpose), ("email", email), ("codeHash", codeHash), ("createdAt", now), ("expiresAt", expiresAt), ("usedAt", null), ("failedAttempts", 0), ("ip", clientIp is null ? null : clientIp[..Math.Min(45, clientIp.Length)])));
        return id;
    });
    public async Task<PendingOtp?> LatestAsync(string phone, string purpose, DateTimeOffset now)
    {
        var result = (await docs.ListAsync("otp_codes", Document(("phone", phone), ("purpose", purpose), ("usedAt", null), ("expiresAt", new BsonDocument("$gt", Value(now)))), new BsonDocument { { "createdAt", -1 }, { "_id", -1 } }, limit: 1)).FirstOrDefault();
        return result is null ? null : new PendingOtp(result["_id"].ToInt64(), result.GetValue("email", BsonNull.Value).IsString ? result["email"].AsString : "", result["codeHash"].AsString, result["failedAttempts"].ToInt32());
    }
    public Task RecordFailureAsync(long id) => docs.UpdateAsync("otp_codes", Eq("_id", id), new BsonDocument("$inc", new BsonDocument("failedAttempts", 1)));
    public async Task<bool> ConsumeAsync(long id, DateTimeOffset now) => await docs.UpdateAsync("otp_codes", Document(("_id", id), ("usedAt", null)), new BsonDocument("$set", Document(("usedAt", now)))) == 1;
}
