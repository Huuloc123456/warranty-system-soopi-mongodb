using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Driver;
using Soopi.Api.Data;
using Soopi.Api.Data.Entities;
using Soopi.Api.Data.Stores;
using Soopi.Api.Domain.Identity;
using Soopi.Api.Domain.Shared;
using Soopi.Api.Domain.Tickets;
using static Soopi.Api.Data.MongoDocuments;

namespace Soopi.Tests;

public sealed class MongoIntegrationTests : IAsyncLifetime
{
    private readonly string databaseName = "soopi_mongodb_test_" + Guid.NewGuid().ToString("N");
    private ServiceProvider provider = null!;
    public async Task InitializeAsync()
    {
        MongoMapping.Configure();
        var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Mongo:Database"] = databaseName,
        }).Build();
        provider = new ServiceCollection().AddSingleton<IConfiguration>(config)
            .AddSingleton(new MongoClient("mongodb://127.0.0.1:27017/?replicaSet=rs0&serverSelectionTimeoutMS=5000"))
            .AddSingleton(TimeProvider.System).AddScoped<AppDbContext>().AddScoped<MongoDocuments>().AddScoped<TransactionRunner>().BuildServiceProvider();
        await MongoInitializer.InitializeAsync(provider, false);
    }
    public async Task DisposeAsync()
    {
        Assert.StartsWith("soopi_mongodb_test_", databaseName);
        await provider.GetRequiredService<MongoClient>().DropDatabaseAsync(databaseName);
        await provider.DisposeAsync();
    }
    [Fact]
    public async Task PrivateSettersEnumsUtcAndCalendarDatesRoundTrip()
    {
        using var scope = provider.CreateScope(); var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var at = new DateTimeOffset(2026, 10, 9, 13, 20, 30, TimeSpan.FromHours(7));
        var device = new Device("TB-TEST", "SP-TEST", IdentifierType.SERIAL, "abc-001", "KH-TEST", new DateOnly(2026, 1, 2), new DateOnly(2027, 1, 2), null, at);
        db.Devices.Add(device); await db.SaveChangesAsync();
        var loaded = await db.Devices.FirstOrDefaultAsync(d => d.Id == device.Id);
        Assert.NotNull(loaded); Assert.Equal(at, loaded.CreatedAt); Assert.Equal(device.WarrantyExpiresOn, loaded.WarrantyExpiresOn);
        Assert.Equal(device.SerialNormalized, loaded.SerialNormalized); Assert.Equal(IdentifierType.SERIAL, loaded.IdentifierType);
    }
    [Fact]
    public async Task TrackedProfileChangesPersistAndStaleChangesAreRejected()
    {
        using var first = provider.CreateScope(); using var second = provider.CreateScope();
        var db1 = first.ServiceProvider.GetRequiredService<AppDbContext>(); var db2 = second.ServiceProvider.GetRequiredService<AppDbContext>();
        db1.Customers.Add(new Customer("KH-TRACK", "Demo", "0901234567", null, null, DateTimeOffset.UtcNow)); await db1.SaveChangesAsync();
        var a = await db1.Customers.FirstOrDefaultAsync(c => c.Id == "KH-TRACK");
        var b = await db2.Customers.FirstOrDefaultAsync(c => c.Id == "KH-TRACK");
        a!.UpdateContact(null, "first@example.invalid", null); await db1.SaveChangesAsync();
        b!.UpdateContact(null, "second@example.invalid", null); await Assert.ThrowsAsync<MongoConcurrencyException>(() => db2.SaveChangesAsync());
    }
    [Fact]
    public async Task TransactionRollsBackDocumentsButCountersAdvanceOutsideTransaction()
    {
        using var scope = provider.CreateScope(); var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var docs = scope.ServiceProvider.GetRequiredService<MongoDocuments>(); var transactions = scope.ServiceProvider.GetRequiredService<TransactionRunner>();
        await Assert.ThrowsAsync<DomainException>(() => transactions.InTransactionAsync(async () =>
        {
            await db.NextIdAsync("ROLLBACK"); await docs.InsertAsync("customers", Document(("_id", "KH-ROLLBACK")));
            throw new DomainException(ErrorCode.VALIDATION_FAILED);
        }));
        Assert.Null(await docs.GetAsync("customers", Eq("_id", "KH-ROLLBACK")));
        // Bộ đếm được cấp NGOÀI transaction nên không bị rollback: số đầu (1) đã tăng rồi bị bỏ, lần sau ra 2 (chấp nhận số nhảy).
        Assert.Equal(2, await db.NextIdAsync("ROLLBACK"));
    }
    [Fact]
    public async Task UsernameStoredNormalizedAndLookedUpCaseInsensitively()
    {
        using var scope = provider.CreateScope(); var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var accounts = new AccountStore(db);
        var created = Account.Employee("NguyenVanA", "{bcrypt}x", [Role.RECEPTIONIST], "NV-CASE", false);
        await accounts.AddAsync(created);
        Assert.Equal("nguyenvana", created.Username);
        Assert.NotNull(await accounts.FindByLoginAsync("NguyenVanA"));
        Assert.NotNull(await accounts.FindByLoginAsync("NGUYENVANA"));
        // Unique index username phải có collation không phân biệt hoa/thường (strength 2) để chặn trùng kiểu Admin/admin.
        var indexCursor = await db.Collection<BsonDocument>("accounts").Indexes.ListAsync();
        BsonDocument? usernameIndex = null;
        while (await indexCursor.MoveNextAsync())
            usernameIndex = indexCursor.Current.FirstOrDefault(i => i["name"].AsString == "account_username") ?? usernameIndex;
        Assert.NotNull(usernameIndex);
        Assert.Equal(2, usernameIndex["collation"]["strength"].ToInt32());
    }
    [Fact]
    public async Task UsernameIndexMigrationIsOptInAndAddsCollation()
    {
        using var scope = provider.CreateScope(); var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var indexes = db.Collection<BsonDocument>("accounts").Indexes;
        // Mô phỏng DB cũ: index account_username đã tồn tại nhưng KHÔNG có collation.
        await indexes.DropOneAsync("account_username");
        await indexes.CreateOneAsync(new CreateIndexModel<BsonDocument>(new BsonDocument("username", 1), new CreateIndexOptions<BsonDocument> { Name = "account_username", Unique = true }));

        // InitializeAsync KHÔNG tự ý drop/dựng lại index đang tồn tại (tránh mất ràng buộc duy nhất nếu tạo lại thất bại).
        await MongoInitializer.InitializeAsync(provider, false);
        var untouched = await FindIndexAsync(indexes, "account_username");
        Assert.NotNull(untouched);
        Assert.False(untouched.Contains("collation"));

        // Migration collation là OPT-IN: dựng index collated dưới tên riêng trước rồi mới bỏ index legacy.
        await MongoInitializer.MigrateUsernameIndexCollationAsync(provider);
        Assert.Null(await FindIndexAsync(indexes, "account_username"));
        var migrated = await FindIndexAsync(indexes, "account_username_collated");
        Assert.NotNull(migrated);
        Assert.Equal(2, migrated["collation"]["strength"].ToInt32());
    }

    private static async Task<BsonDocument?> FindIndexAsync(IMongoIndexManager<BsonDocument> indexes, string name)
    {
        var cursor = await indexes.ListAsync();
        while (await cursor.MoveNextAsync())
            if (cursor.Current.FirstOrDefault(i => i["name"].AsString == name) is { } found) return found;
        return null;
    }
    [Fact]
    public async Task ConcurrentTransactionsOnDistinctDocumentsDoNotConflictOnSharedCounter()
    {
        // Trước khi sửa: mọi transaction cùng tăng một bộ đếm (audit_logs) trong session → WriteConflict → 409.
        var results = await Task.WhenAll(Enumerable.Range(0, 8).Select(async i =>
        {
            using var scope = provider.CreateScope(); var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var docs = scope.ServiceProvider.GetRequiredService<MongoDocuments>();
            var transactions = scope.ServiceProvider.GetRequiredService<TransactionRunner>();
            var audit = new Soopi.Api.Services.Shared.AuditService(db, docs, TimeProvider.System);
            try
            {
                await transactions.InTransactionAsync(async () =>
                    await audit.RecordAsync("NV-001", "Admin", ["ADMIN"], "TEST_CONCURRENT", "Kiểm tra đồng thời", "ENTITY", "E-" + i));
                return true;
            }
            catch (DomainException ex) when (ex.Code == ErrorCode.CONCURRENT_MODIFICATION) { return false; }
        }));
        Assert.DoesNotContain(false, results);
    }
    [Fact]
    public async Task UniqueCustomerPhoneReturnsBusinessError()
    {
        using var scope = provider.CreateScope(); var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var transactions = scope.ServiceProvider.GetRequiredService<TransactionRunner>();
        await transactions.InTransactionAsync(async () => { db.Customers.Add(new Customer("KH-ONE", "One", "0901234568", null, null, DateTimeOffset.UtcNow)); await db.SaveChangesAsync(); });
        var exception = await Assert.ThrowsAsync<DomainException>(() => transactions.InTransactionAsync(async () => { db.Customers.Add(new Customer("KH-TWO", "Two", "0901234568", null, null, DateTimeOffset.UtcNow)); await db.SaveChangesAsync(); }));
        Assert.Equal(ErrorCode.CUSTOMER_PHONE_DUPLICATE, exception.Code);
    }
    [Fact]
    public async Task BinFailureRollsBackPartDeduction()
    {
        using var scope = provider.CreateScope(); var docs = scope.ServiceProvider.GetRequiredService<MongoDocuments>();
        var transactions = scope.ServiceProvider.GetRequiredService<TransactionRunner>(); var stock = new InventoryStore(docs);
        await docs.InsertAsync("parts", Document(("_id", "LK-ROLLBACK"), ("active", true), ("onHand", 10), ("reserved", 4), ("version", 0), ("bins", new BsonArray { Document(("binCode", "A1"), ("qty", 10)) })));
        await Assert.ThrowsAsync<DomainException>(() => transactions.InTransactionAsync(() => stock.IssueAsync("LK-ROLLBACK", 2, "MISSING")));
        var result = await docs.GetAsync("parts", Eq("_id", "LK-ROLLBACK"));
        Assert.Equal(10, result!["onHand"].ToInt32()); Assert.Equal(4, result["reserved"].ToInt32()); Assert.Equal(10, result["bins"][0]["qty"].ToInt32());
    }
    [Fact]
    public async Task ConcurrentReservationsCannotExceedStock()
    {
        using (var setup = provider.CreateScope())
            await setup.ServiceProvider.GetRequiredService<MongoDocuments>().InsertAsync("parts", Document(("_id", "LK-RACE"), ("active", true), ("onHand", 5), ("reserved", 0), ("version", 0), ("bins", new BsonArray())));
        var results = await Task.WhenAll(Enumerable.Range(0, 8).Select(async _ =>
        {
            using var scope = provider.CreateScope(); var transactions = scope.ServiceProvider.GetRequiredService<TransactionRunner>();
            var stock = new InventoryStore(scope.ServiceProvider.GetRequiredService<MongoDocuments>());
            try { await transactions.InTransactionAsync(() => stock.ReserveAsync("LK-RACE", 1)); return true; }
            catch (DomainException ex) when (ex.Code is ErrorCode.STOCK_INSUFFICIENT or ErrorCode.CONCURRENT_MODIFICATION) { return false; }
        }));
        using var read = provider.CreateScope(); var doc = await read.ServiceProvider.GetRequiredService<MongoDocuments>().GetAsync("parts", Eq("_id", "LK-RACE"));
        Assert.InRange(doc!["reserved"].ToInt32(), 1, 5); Assert.Equal(results.Count(r => r), doc["reserved"].ToInt32());
    }
    [Fact]
    public async Task TicketContactAndSearchFollowUpdatedCustomerProfile()
    {
        using var scope = provider.CreateScope(); var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var docs = scope.ServiceProvider.GetRequiredService<MongoDocuments>(); var store = new TicketStore(db, new ProductCatalog(docs));
        var customer = new Customer("KH-LIVE", "Khách demo", "0901234580", null, null, DateTimeOffset.UtcNow);
        db.Customers.Add(customer); await db.SaveChangesAsync();
        await docs.InsertAsync("tickets", Document(("_id", "TN-LIVE"), ("customerId", customer.Id), ("deviceId", "TB-MISSING"), ("receivedAt", DateTimeOffset.UtcNow), ("status", "RECEIVED"), ("open", true), ("version", 0), ("customerSnapshot", Document(("fullName", customer.FullName), ("phone", customer.Phone)))));
        customer.UpdateContact("0901234581", "live@example.invalid", null); await db.SaveChangesAsync();
        Assert.Equal(customer.Phone, (await store.FindAsync("TN-LIVE"))!.CustomerSnapshot["phone"]);
        var filter = new TicketFilter(null, null, null, null, customer.Phone, null, null, DateTimeOffset.UtcNow, DateTimeOffset.UtcNow.AddHours(2));
        Assert.Equal(1, await store.CountAsync(filter)); Assert.Single(await store.SearchAsync(filter, 0, 25));
    }
    [Fact]
    public async Task CatalogRejectsDanglingReferencesBeforeWriting()
    {
        using var scope = provider.CreateScope(); var docs = scope.ServiceProvider.GetRequiredService<MongoDocuments>();
        var store = new CatalogStore(docs);
        var exception = await Assert.ThrowsAsync<DomainException>(() => store.SaveAsync("products", "SP-DANGLING", new Dictionary<string, object?> { ["name"] = "Demo", ["brandId"] = "MISSING", ["deviceTypeCode"] = "MISSING" }));
        Assert.Equal(ErrorCode.VALIDATION_FAILED, exception.Code);
        Assert.Null(await docs.GetAsync("products", Eq("_id", "SP-DANGLING")));
        var malformed = await Assert.ThrowsAsync<DomainException>(() => store.SaveAsync("device_categories", "BAD", new Dictionary<string, object?> { ["name"] = "Demo", ["deviceTypes"] = new[] { "bad" } }));
        Assert.Equal(ErrorCode.VALIDATION_FAILED, malformed.Code);
    }
    [Fact]
    public async Task AbortedTransactionStillCleansItsUploadedFile()
    {
        using var scope = provider.CreateScope(); var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var docs = scope.ServiceProvider.GetRequiredService<MongoDocuments>(); var transactions = scope.ServiceProvider.GetRequiredService<TransactionRunner>();
        var root = Path.Combine(Path.GetTempPath(), "soopi-mongodb-file-test-" + Guid.NewGuid().ToString("N"));
        var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?> { ["Storage:Directory"] = root }).Build();
        var storage = new Soopi.Api.Services.Files.FileStorage(db, docs, TimeProvider.System, config, transactions);
        try
        {
            await Assert.ThrowsAsync<DomainException>(() => transactions.InTransactionAsync(async () =>
            {
                var id = await storage.StoreAsync("demo.png", "image/png", [1, 2, 3], new Soopi.Api.Services.Files.FileOwner("HANDOVER_SIGNATURE", "TN-DEMO", null, "DEMO"));
                try { await docs.InsertAsync("attachments", Document(("_id", long.Parse(id)))); }
                catch { await storage.DeleteAsync(id); throw; }
            }));
            Assert.Empty(Directory.EnumerateFiles(root, "*", SearchOption.AllDirectories));
        }
        finally
        {
            Assert.StartsWith(Path.GetFullPath(Path.GetTempPath()), Path.GetFullPath(root));
            Assert.Matches("^soopi-mongodb-file-test-[a-f0-9]{32}$", Path.GetFileName(root));
            if (Directory.Exists(root)) Directory.Delete(root, true);
        }
    }
    [Fact]
    public async Task FileStoredInTransactionIsDeletedOnRollback()
    {
        using var scope = provider.CreateScope(); var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var docs = scope.ServiceProvider.GetRequiredService<MongoDocuments>(); var transactions = scope.ServiceProvider.GetRequiredService<TransactionRunner>();
        var root = Path.Combine(Path.GetTempPath(), "soopi-mongodb-file-test-" + Guid.NewGuid().ToString("N"));
        var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?> { ["Storage:Directory"] = root }).Build();
        var storage = new Soopi.Api.Services.Files.FileStorage(db, docs, TimeProvider.System, config, transactions);
        try
        {
            // Lỗi nghiệp vụ SAU khi đã ghi tệp ra đĩa: bù trừ ở cấp transaction phải tự xóa tệp, không cần service dọn thủ công.
            await Assert.ThrowsAsync<DomainException>(() => transactions.InTransactionAsync(async () =>
            {
                await storage.StoreAsync("demo.png", "image/png", [1, 2, 3], new Soopi.Api.Services.Files.FileOwner("HANDOVER_SIGNATURE", "TN-DEMO", null, "DEMO"));
                throw new DomainException(ErrorCode.VALIDATION_FAILED);
            }));
            Assert.Empty(Directory.EnumerateFiles(root, "*", SearchOption.AllDirectories));
        }
        finally
        {
            Assert.StartsWith(Path.GetFullPath(Path.GetTempPath()), Path.GetFullPath(root));
            Assert.Matches("^soopi-mongodb-file-test-[a-f0-9]{32}$", Path.GetFileName(root));
            if (Directory.Exists(root)) Directory.Delete(root, true);
        }
    }
    [Fact]
    public async Task FileFromFailedAttemptIsDeletedWhenTransactionRetries()
    {
        using var scope = provider.CreateScope(); var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var docs = scope.ServiceProvider.GetRequiredService<MongoDocuments>(); var transactions = scope.ServiceProvider.GetRequiredService<TransactionRunner>();
        var root = Path.Combine(Path.GetTempPath(), "soopi-mongodb-file-test-" + Guid.NewGuid().ToString("N"));
        var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?> { ["Storage:Directory"] = root }).Build();
        var storage = new Soopi.Api.Services.Files.FileStorage(db, docs, TimeProvider.System, config, transactions);
        try
        {
            var attempts = 0;
            await transactions.InTransactionAsync(async () =>
            {
                attempts++;
                await storage.StoreAsync($"attempt-{attempts}.png", "image/png", [1, 2, 3], new Soopi.Api.Services.Files.FileOwner("HANDOVER_SIGNATURE", "TN-DEMO", null, "DEMO"));
                if (attempts == 1) throw new MongoConcurrencyException(); // giả lập WriteConflict ở lần đầu → retry
                return attempts;
            });
            Assert.Equal(2, attempts);
            // Tệp của lần thử đầu bị xóa khi rollback; chỉ còn tệp của lần thử thành công.
            Assert.Single(Directory.EnumerateFiles(root, "*", SearchOption.AllDirectories));
        }
        finally
        {
            Assert.StartsWith(Path.GetFullPath(Path.GetTempPath()), Path.GetFullPath(root));
            Assert.Matches("^soopi-mongodb-file-test-[a-f0-9]{32}$", Path.GetFileName(root));
            if (Directory.Exists(root)) Directory.Delete(root, true);
        }
    }
    [Fact]
    public void RollbackCompensationRunsOnlyOnDefinitiveAbort()
    {
        // Chưa gọi commit → chắc chắn transaction bị hủy → chạy bù trừ (bất kể lỗi có transient hay không).
        Assert.True(TransactionRunner.ShouldCompensateRollback(false, false));
        Assert.True(TransactionRunner.ShouldCompensateRollback(false, true));
        // Đã gọi commit: chỉ chạy bù trừ khi lỗi mang nhãn TransientTransactionError (commit bị từ chối dứt khoát).
        Assert.True(TransactionRunner.ShouldCompensateRollback(true, true));
        // Đã gọi commit nhưng lỗi không transient (UnknownTransactionCommitResult, OperationCanceledException do hết 30 giây commit…) → kết quả chưa rõ → giữ tệp.
        Assert.False(TransactionRunner.ShouldCompensateRollback(true, false));
    }

    [Fact]
    public async Task FileIsKeptWhenCommitCancelsAfterAttempt()
    {
        using var scope = provider.CreateScope(); var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var docs = scope.ServiceProvider.GetRequiredService<MongoDocuments>();
        var transactions = new CommitCancelledRunner(db);
        var root = Path.Combine(Path.GetTempPath(), "soopi-mongodb-file-test-" + Guid.NewGuid().ToString("N"));
        var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?> { ["Storage:Directory"] = root }).Build();
        var storage = new Soopi.Api.Services.Files.FileStorage(db, docs, TimeProvider.System, config, transactions);
        try
        {
            // Commit đã được gọi nhưng bị hủy do hết 30 giây (giả lập) → kết quả chưa rõ → bù trừ KHÔNG chạy.
            await Assert.ThrowsAsync<OperationCanceledException>(() => transactions.InTransactionAsync(async () =>
                await storage.StoreAsync("demo.png", "image/png", [1, 2, 3], new Soopi.Api.Services.Files.FileOwner("HANDOVER_SIGNATURE", "TN-DEMO", null, "DEMO"))));
            Assert.True(transactions.CommitCalled);
            // Tệp vừa ghi phải còn lại (không bị xóa nhầm) vì không thể biết commit có thành công hay không.
            Assert.Single(Directory.EnumerateFiles(root, "*", SearchOption.AllDirectories));
        }
        finally
        {
            Assert.StartsWith(Path.GetFullPath(Path.GetTempPath()), Path.GetFullPath(root));
            Assert.Matches("^soopi-mongodb-file-test-[a-f0-9]{32}$", Path.GetFileName(root));
            if (Directory.Exists(root)) Directory.Delete(root, true);
        }
    }

    private sealed class CommitCancelledRunner(AppDbContext db) : TransactionRunner(db)
    {
        public bool CommitCalled { get; private set; }
        protected override Task CommitAsync(IClientSessionHandle session, CancellationToken token)
        {
            CommitCalled = true;
            return Task.FromException(new OperationCanceledException("Commit hết 30 giây bị hủy (giả lập)"));
        }
    }

    [Fact]
    public async Task RealCommitCancelledByTimeoutKeepsFileAndSkipsCompensation()
    {
        // Khác FileIsKeptWhenCommitCancelsAfterAttempt (commit giả lập): ở đây vẫn gọi THẬT session.CommitTransactionAsync
        // của driver, chỉ truyền token đã bị hủy — đúng cơ chế commitTimeout 30 giây của TransactionRunner hết hạn.
        using var scope = provider.CreateScope(); var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var docs = scope.ServiceProvider.GetRequiredService<MongoDocuments>();
        var transactions = new ExpiredCommitTokenRunner(db);
        var root = Path.Combine(Path.GetTempPath(), "soopi-mongodb-file-test-" + Guid.NewGuid().ToString("N"));
        var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?> { ["Storage:Directory"] = root }).Build();
        var storage = new Soopi.Api.Services.Files.FileStorage(db, docs, TimeProvider.System, config, transactions);
        try
        {
            await Assert.ThrowsAnyAsync<OperationCanceledException>(() => transactions.InTransactionAsync(async () =>
                await storage.StoreAsync("demo.png", "image/png", [1, 2, 3], new Soopi.Api.Services.Files.FileOwner("HANDOVER_SIGNATURE", "TN-DEMO", null, "DEMO"))));
            Assert.True(transactions.CommitCalled);
            // Đã gọi commit mà bị hủy → kết quả chưa rõ → bù trừ (xóa tệp) không chạy: tệp vẫn còn đúng 1.
            Assert.Single(Directory.EnumerateFiles(root, "*", SearchOption.AllDirectories));
            // Transaction không commit nên không có document attachments nào.
            Assert.Empty(await docs.ListAsync("attachments"));
        }
        finally
        {
            Assert.StartsWith(Path.GetFullPath(Path.GetTempPath()), Path.GetFullPath(root));
            Assert.Matches("^soopi-mongodb-file-test-[a-f0-9]{32}$", Path.GetFileName(root));
            if (Directory.Exists(root)) Directory.Delete(root, true);
        }
    }

    private sealed class ExpiredCommitTokenRunner(AppDbContext db) : TransactionRunner(db)
    {
        public bool CommitCalled { get; private set; }
        protected override Task CommitAsync(IClientSessionHandle session, CancellationToken token)
        {
            CommitCalled = true;
            // Token đã hủy = commitTimeout của TransactionRunner đã hết hạn; vẫn đi qua driver thật.
            using var expired = new CancellationTokenSource();
            expired.Cancel();
            return base.CommitAsync(session, expired.Token);
        }
    }

    [Fact]
    public async Task TicketHistoryCannotBeOverwrittenByStaleVersion()
    {
        using var scope = provider.CreateScope(); var db = scope.ServiceProvider.GetRequiredService<AppDbContext>(); var store = new TicketStore(db, new ProductCatalog(new MongoDocuments(db)));
        var document = Document(("_id", "TN-TEST"), ("version", 0), ("status", "RECEIVED"), ("open", true));
        await db.InsertAsync("tickets", document);
        var a = BsonSerializer.Deserialize<Ticket>(document); var b = BsonSerializer.Deserialize<Ticket>(document);
        await store.SaveAsync(a); await Assert.ThrowsAsync<MongoConcurrencyException>(() => store.SaveAsync(b));
    }
}
