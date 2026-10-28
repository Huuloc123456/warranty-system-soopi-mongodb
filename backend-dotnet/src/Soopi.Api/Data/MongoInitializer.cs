using MongoDB.Bson;
using MongoDB.Driver;
using Soopi.Api.Data.Entities;
using Soopi.Api.Data.Stores;
using Soopi.Api.Domain.Identity;
using Soopi.Api.Infrastructure.Security;
using static Soopi.Api.Data.MongoDocuments;

namespace Soopi.Api.Data;

public static class MongoInitializer
{
    public static readonly string[] Collections = ["accounts", "refresh_tokens", "customers", "employees", "devices", "tickets", "quotations", "payments", "parts", "stock_receipts", "stock_issues", "stock_transfers", "warranty_requests", "attachments", "audit_logs", "notifications", "push_devices", "otp_codes", "counters", "service_stations", "device_categories", "brands", "products", "warranty_policies", "service_prices", "suppliers"];
    public static async Task InitializeAsync(IServiceProvider services, bool seedDemo)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var docs = scope.ServiceProvider.GetRequiredService<MongoDocuments>();
        var name = db.Database.DatabaseNamespace.DatabaseName;
        if (new[] { "admin", "local", "config", "service_center" }.Contains(name, StringComparer.OrdinalIgnoreCase))
            throw new InvalidOperationException("Hãy chọn database mới riêng cho Soopi MongoDB.");
        var hello = await db.Client.GetDatabase("admin").RunCommandAsync<BsonDocument>(new BsonDocument("hello", 1));
        if (!hello.Contains("setName")) throw new InvalidOperationException("Soopi MongoDB cần replica set để giữ transaction kho/thu tiền. MongoDB local đã có rs0; kiểm tra Mongo:ConnectionString.");
        var existing = (await db.Database.ListCollectionNamesAsync()).ToList();
        foreach (var collection in Collections)
            if (!existing.Contains(collection)) await db.Database.CreateCollectionAsync(collection);
        await EnsureUsernameIndexAsync(db);
        await IndexAsync(db, "device_categories", "device_type_code", new BsonDocument("deviceTypes.code", 1), true, new BsonDocument("deviceTypes.code", new BsonDocument("$type", "string")));
        await IndexAsync(db, "customers", "customer_phone", new BsonDocument("phone", 1), true, new BsonDocument("status", "ACTIVE"));
        await IndexAsync(db, "customers", "customer_account", new BsonDocument("accountId", 1), true, new BsonDocument("accountId", new BsonDocument("$type", "long")));
        await IndexAsync(db, "employees", "employee_account", new BsonDocument("accountId", 1), true, new BsonDocument("accountId", new BsonDocument("$type", "long")));
        await IndexAsync(db, "devices", "device_serial", new BsonDocument("serialNormalized", 1), true);
        await IndexAsync(db, "devices", "device_customer", new BsonDocument { { "customerId", 1 }, { "createdAt", 1 } });
        await IndexAsync(db, "tickets", "ticket_open_device", new BsonDocument("deviceId", 1), true, new BsonDocument("open", true));
        await IndexAsync(db, "tickets", "ticket_status_date", new BsonDocument { { "status", 1 }, { "receivedAt", -1 } });
        await IndexAsync(db, "tickets", "ticket_customer", new BsonDocument { { "customerId", 1 }, { "receivedAt", -1 } });
        await IndexAsync(db, "tickets", "ticket_technician", new BsonDocument { { "assignment.technicianId", 1 }, { "open", 1 }, { "sla.dueAt", 1 } });
        await IndexAsync(db, "quotations", "quote_active_ticket", new BsonDocument("ticketId", 1), true, new BsonDocument("approval.status", new BsonDocument("$in", new BsonArray { "PENDING", "APPROVED" })));
        await IndexAsync(db, "stock_issues", "issue_pending_ticket", new BsonDocument("ticketId", 1), true, new BsonDocument("status", "PENDING"));
        await IndexAsync(db, "payments", "payment_ticket", new BsonDocument("ticketId", 1), true);
        await IndexAsync(db, "payments", "payment_date", new BsonDocument("paidAt", -1));
        await IndexAsync(db, "refresh_tokens", "refresh_hash", new BsonDocument("tokenHash", 1), true);
        await IndexAsync(db, "refresh_tokens", "refresh_account", new BsonDocument { { "accountId", 1 }, { "revokedAt", 1 } });
        await IndexAsync(db, "refresh_tokens", "refresh_family", new BsonDocument("familyId", 1));
        // TTL: MongoDB tự xóa phiên/OTP hết hạn (giữ thêm ít ngày để tra soát), thay vì chỉ trông vào job dọn dẹp.
        await TtlIndexAsync(db, "refresh_tokens", "refresh_expiry", "expiresAt", TimeSpan.FromDays(7));
        await IndexAsync(db, "push_devices", "push_token", new BsonDocument("pushToken", 1), true);
        await IndexAsync(db, "otp_codes", "otp_pending", new BsonDocument { { "phone", 1 }, { "purpose", 1 }, { "createdAt", -1 } });
        await TtlIndexAsync(db, "otp_codes", "otp_expiry", "expiresAt", TimeSpan.FromDays(1));
        // Text index tìm phiếu theo triệu chứng/kết quả kiểm tra; tiếng Việt không có bộ stemming nên dùng "none".
        await db.Collection<BsonDocument>("tickets").Indexes.CreateOneAsync(new CreateIndexModel<BsonDocument>(
            new BsonDocument { { "reportedIssue", "text" }, { "inspection.findings", "text" } },
            new CreateIndexOptions<BsonDocument> { Name = "ticket_text", DefaultLanguage = "none", Weights = new BsonDocument { { "reportedIssue", 3 }, { "inspection.findings", 1 } } }));
        await IndexAsync(db, "attachments", "attachment_owner", new BsonDocument { { "ownerType", 1 }, { "ownerId", 1 } });
        await IndexAsync(db, "audit_logs", "audit_entity_date", new BsonDocument { { "entityType", 1 }, { "entityId", 1 }, { "at", -1 } });
        await IndexAsync(db, "notifications", "notification_account", new BsonDocument { { "accountId", 1 }, { "createdAt", -1 } });
        await IndexAsync(db, "notifications", "notification_role", new BsonDocument { { "role", 1 }, { "createdAt", -1 } });
        await IndexAsync(db, "warranty_requests", "request_status_date", new BsonDocument { { "status", 1 }, { "createdAt", -1 } });
        foreach (var (collection, schema) in MongoSchemas.Validators)
            await db.Database.RunCommandAsync<BsonDocument>(new BsonDocument
            {
                { "collMod", collection },
                { "validator", new BsonDocument("$jsonSchema", schema) },
                { "validationLevel", "moderate" },
                { "validationAction", "error" },
            });
        if (seedDemo && await docs.CountAsync("accounts", new BsonDocument()) == 0)
            await scope.ServiceProvider.GetRequiredService<TransactionRunner>().InTransactionAsync(() => SeedDemoAsync(db, docs));
    }
    private static Task IndexAsync(AppDbContext db, string collection, string name, BsonDocument keys, bool unique = false, BsonDocument? partial = null) =>
        db.Collection<BsonDocument>(collection).Indexes.CreateOneAsync(new CreateIndexModel<BsonDocument>(keys, new CreateIndexOptions<BsonDocument> { Name = name, Unique = unique, PartialFilterExpression = partial }));
    /// <summary>Index TTL trên một trường date; database cũ có index thường cùng tên thì chuyển sang TTL bằng collMod (giữ index).</summary>
    private static async Task TtlIndexAsync(AppDbContext db, string collection, string name, string field, TimeSpan keep)
    {
        var indexes = db.Collection<BsonDocument>(collection).Indexes;
        var seconds = (long)keep.TotalSeconds;
        var found = await FindIndexAsync(indexes, name);
        if (found is null)
            await indexes.CreateOneAsync(new CreateIndexModel<BsonDocument>(new BsonDocument(field, 1), new CreateIndexOptions<BsonDocument> { Name = name, ExpireAfter = keep }));
        else if (!found.Contains("expireAfterSeconds") || found["expireAfterSeconds"].ToInt64() != seconds)
            await db.Database.RunCommandAsync<BsonDocument>(new BsonDocument
            {
                { "collMod", collection },
                { "index", new BsonDocument { { "name", name }, { "expireAfterSeconds", seconds } } },
            });
    }
    private static readonly Collation UsernameCollation = new("en", strength: CollationStrength.Secondary);
    private const string UsernameIndexName = "account_username";
    /// <summary>Tên index collated sau migration. MongoDB không cho hai index giống hệt (cùng key + options) dù khác tên,
    /// nên không thể "tạo tạm rồi đổi tên" về tên cũ; index collated dùng tên riêng và cả hai tên đều được nhận diện.</summary>
    private const string UsernameCollatedIndexName = "account_username_collated";
    /// <summary>DB mới tạo index username có collation (chặn trùng kiểu Admin/admin); nếu index đã tồn tại (collated hay legacy) thì không tự ý đổi.</summary>
    private static async Task EnsureUsernameIndexAsync(AppDbContext db)
    {
        var indexes = db.Collection<BsonDocument>("accounts").Indexes;
        if (await FindIndexAsync(indexes, UsernameIndexName) is not null || await FindIndexAsync(indexes, UsernameCollatedIndexName) is not null) return;
        await indexes.CreateOneAsync(CollatedModel(UsernameIndexName));
    }
    /// <summary>
    /// Migration OPT-IN (không chạy tự động khi khởi động): chuyển index username legacy (không collation) sang collation.
    /// Kiểm tra trùng hoa/thường TRƯỚC, dựng index collated trước rồi mới drop index cũ, nên không bao giờ mất ràng buộc duy nhất.
    /// </summary>
    public static async Task MigrateUsernameIndexCollationAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var docs = scope.ServiceProvider.GetRequiredService<MongoDocuments>();
        var indexes = db.Collection<BsonDocument>("accounts").Indexes;

        var collated = await FindIndexAsync(indexes, UsernameCollatedIndexName) ?? await FindIndexAsync(indexes, UsernameIndexName);
        if (collated is not null && collated.Contains("collation"))
        {
            // Đã collated; dọn nốt index legacy còn sót nếu một lần migration trước bị dở dang.
            if (collated["name"].AsString == UsernameCollatedIndexName)
                await DropIndexIfExistsAsync(indexes, UsernameIndexName);
            return;
        }
        // Còn index legacy (không collation): kiểm tra trùng hoa/thường TRƯỚC khi đụng index.
        var usernames = (await docs.ListAsync("accounts")).Select(d => d.Contains("username") ? d["username"].AsString : "").ToList();
        var duplicates = usernames.GroupBy(u => u.ToLowerInvariant(), StringComparer.Ordinal).Where(g => g.Count() > 1).Select(g => g.First()).ToList();
        if (duplicates.Count > 0)
            throw new InvalidOperationException("Không thể thêm collation cho index username vì có username trùng khi không phân biệt hoa/thường: " + string.Join(", ", duplicates) + ". Hãy đổi tên các tài khoản trùng rồi chạy lại.");
        // Dựng index collated dưới tên riêng TRƯỚC (MongoDB cho phép cùng key khác options cùng tồn tại), chỉ drop index legacy
        // sau khi index collated đã tồn tại → nếu tạo mới thất bại, ràng buộc duy nhất vẫn do index cũ giữ nguyên.
        await indexes.CreateOneAsync(CollatedModel(UsernameCollatedIndexName));
        await DropIndexIfExistsAsync(indexes, UsernameIndexName);
    }
    private static async Task DropIndexIfExistsAsync(IMongoIndexManager<BsonDocument> indexes, string name)
    {
        if (await FindIndexAsync(indexes, name) is not null) await indexes.DropOneAsync(name);
    }
    private static CreateIndexModel<BsonDocument> CollatedModel(string name) =>
        new(new BsonDocument("username", 1), new CreateIndexOptions<BsonDocument> { Name = name, Unique = true, Collation = UsernameCollation });
    private static async Task<BsonDocument?> FindIndexAsync(IMongoIndexManager<BsonDocument> indexes, string name)
    {
        var cursor = await indexes.ListAsync();
        while (await cursor.MoveNextAsync())
            if (cursor.Current.FirstOrDefault(i => i["name"].AsString == name) is { } found) return found;
        return null;
    }
    private static async Task SeedDemoAsync(AppDbContext db, MongoDocuments docs)
    {
        var now = DateTimeOffset.UtcNow;
        await docs.InsertAsync("service_stations", Document(("_id", "TRAM-01"), ("name", "Soopi — trạm demo"), ("address", "Dữ liệu mẫu phát triển"), ("active", true)));
        var categories = new[] { ("PHONE", "Điện thoại", "PHONE_IMEI", "IMEI"), ("LAPTOP", "Laptop", "LAPTOP_SERIAL", "SERIAL"), ("TABLET", "Máy tính bảng", "TABLET_SERIAL", "SERIAL"), ("TV", "Tivi", "TV_SERIAL", "SERIAL"), ("AUDIO", "Âm thanh", "AUDIO_SERIAL", "SERIAL"), ("HOME", "Gia dụng", "HOME_SERIAL", "SERIAL") };
        var order = 0;
        foreach (var (code, name, type, identifier) in categories)
            await docs.InsertAsync("device_categories", Document(("_id", code), ("name", name), ("sortOrder", ++order), ("active", true), ("deviceTypes", new BsonArray { Document(("code", type), ("name", name), ("identifierType", identifier), ("diagnosticChecklist", new[] { "Ngoại quan", "Nguồn", "Chức năng chính" })) })));
        foreach (var (code, name) in new[] { ("APPLE", "Apple"), ("SAMSUNG", "Samsung"), ("DELL", "Dell") })
            await docs.InsertAsync("brands", Document(("_id", code), ("name", name), ("active", true), ("categoryCodes", categories.Select(c => c.Item1).ToArray())));
        var productNumber = 0;
        foreach (var (name, brand, type) in new[] { ("iPhone — demo", "APPLE", "PHONE_IMEI"), ("Galaxy — demo", "SAMSUNG", "PHONE_IMEI"), ("Laptop Dell — demo", "DELL", "LAPTOP_SERIAL") })
            await docs.InsertAsync("products", Document(("_id", $"SP-{++productNumber:0000}"), ("name", name), ("brandId", brand), ("deviceTypeCode", type), ("productLine", "Demo"), ("defaultWarrantyMonths", 12), ("active", true)));
        await docs.InsertAsync("warranty_policies", Document(("_id", "CS-0001"), ("scope", "BRAND"), ("brandId", "DELL"), ("productId", null), ("name", "Chính sách demo 12 tháng"), ("warrantyMonths", 12), ("conditions", "Dữ liệu mẫu; dùng kiểm thử bảo hành."), ("rejectionCases", "Vào nước, hư hỏng do tác động bên ngoài."), ("distributor", "Soopi demo"), ("active", true)));
        await docs.InsertAsync("service_prices", Document(("_id", "DV-01"), ("name", "Kiểm tra và sửa chữa — demo"), ("categoryCode", "LAPTOP"), ("price", 150000m), ("active", true)));
        await docs.InsertAsync("suppliers", Document(("_id", "NCC-001"), ("name", "Nhà cung cấp demo"), ("phone", "0900000099"), ("email", "demo@example.invalid"), ("address", "Dữ liệu mẫu"), ("active", true)));
        foreach (var (sku, name, category, bin, cost, price) in new[] { ("LK-PIN", "Pin laptop — demo", "LAPTOP", "A1", 300000m, 450000m), ("LK-SCREEN", "Màn hình — demo", "PHONE", "A2", 700000m, 950000m), ("LK-CABLE", "Cáp sạc — demo", "PHONE", "A3", 50000m, 100000m) })
            await docs.InsertAsync("parts", Document(("_id", sku), ("name", name), ("unit", "Cái"), ("categoryCode", category), ("brandName", "Demo"), ("costPrice", cost), ("servicePrice", price), ("onHand", 20), ("reserved", 0), ("minLevel", 5), ("primaryBin", bin), ("bins", new BsonArray { Document(("binCode", bin), ("qty", 20)) }), ("warrantyMonths", 6), ("supplierId", "NCC-001"), ("active", true), ("version", 0)));
        var hash = PasswordHasher.Encode("1234");
        var employeeNumber = 0;
        foreach (var (username, role, name) in new[] { ("admin", Role.ADMIN, "Quản trị demo"), ("receptionist", Role.RECEPTIONIST, "Lễ tân demo"), ("dispatcher", Role.DISPATCHER, "Điều phối demo"), ("technician", Role.TECHNICIAN, "Kỹ thuật viên demo"), ("warehouse", Role.WAREHOUSE_KEEPER, "Thủ kho demo"), ("cashier", Role.CASHIER, "Thu ngân demo"), ("technician2", Role.TECHNICIAN, "Kỹ thuật viên 2 demo") })
        {
            var code = $"NV-{++employeeNumber:000}";
            var account = Account.Employee(username, hash, [role], code, false);
            db.Accounts.Add(account); await db.SaveChangesAsync();
            await db.InsertAsync("employees", new EmployeeRecord(code, name, $"09000001{employeeNumber:00}", null, "Demo", categories.Select(c => c.Item1).ToList(), 10, true, "ACTIVE", "TRAM-01", account.Id));
        }
        var customer = new Customer("KH-000001", "Khách hàng demo", "0900000001", "customer@example.invalid", "Dữ liệu mẫu phát triển", now);
        var customerAccount = Account.Customer(customer.Phone, hash, customer.Id, false);
        db.Accounts.Add(customerAccount); await db.SaveChangesAsync();
        customer.LinkAccount(customerAccount.Id); db.Customers.Add(customer); await db.SaveChangesAsync();
        db.Devices.Add(new Device("TB-000001", "SP-0003", IdentifierType.SERIAL, "SOOPI-DEMO-001", customer.Id, DbTime.Date(now).AddMonths(-1), DbTime.Date(now).AddMonths(11), "Soopi demo", now));
        db.Devices.Add(new Device("TB-000002", "SP-0003", IdentifierType.SERIAL, "SOOPI-DEMO-002", customer.Id, DbTime.Date(now).AddYears(-2), DbTime.Date(now).AddYears(-1), "Soopi demo", now));
        await db.SaveChangesAsync();
        foreach (var (key, value) in new[] { ("NV", 7L), ("KH", 1L), ("TB", 2L), ("SP", 3L), ("CS", 1L), ("NCC", 1L) })
            await docs.PutAsync("counters", Document(("_id", key), ("value", value)));
    }
}
