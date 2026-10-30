using Microsoft.AspNetCore.Http;
using Soopi.Api.Services.Portal;
using Soopi.Api.Services.Tickets;
using Soopi.Api.Services.Files;
using Soopi.Api.Services.Shared;
using Soopi.Api.Domain.Tickets;
using Soopi.Api.Domain.Shared;
using MongoDB.Bson;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.IO.Compression;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MongoDB.Driver;
using Soopi.Api.Data;
using Soopi.Api.Data.Entities;
using Soopi.Api.Data.Stores;
using Soopi.Api.Domain.Identity;
using Soopi.Api.Infrastructure.Security;
using Soopi.Api.Services.Identity;
using static Soopi.Api.Data.MongoDocuments;

namespace Soopi.Tests;

public sealed class ParityRegressionTests : IAsyncLifetime
{
    private readonly string databaseName = "soopi_mongodb_test_api_" + Guid.NewGuid().ToString("N");
    private WebApplicationFactory<Program> factory = null!;
    private HttpClient client = null!;
    private string token = "";

    public async Task InitializeAsync()
    {
        MongoMapping.Configure();
        factory = new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment("Development");
            builder.ConfigureAppConfiguration((_, config) => config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Mongo:Database"] = databaseName,
                ["Mongo:SeedDemo"] = "false",
            }));
            builder.ConfigureTestServices(services =>
            {
                services.AddSingleton<RecordingEmailSender>();
                services.AddSingleton<IEmailSender>(provider => provider.GetRequiredService<RecordingEmailSender>());
            });
        });
        client = factory.CreateClient();
        await SeedAsync();
        token = await IssueAdminTokenAsync();
    }

    public async Task DisposeAsync()
    {
        Assert.StartsWith("soopi_mongodb_test_api_", databaseName);
        await factory.Services.GetRequiredService<MongoClient>().DropDatabaseAsync(databaseName);
        client.Dispose();
        await factory.DisposeAsync();
    }


    [Fact]
    public async Task CannotDeactivateLastAdminThroughWorkStatus()
    {
        var message = new HttpRequestMessage(HttpMethod.Patch, "/api/v1/admin/employees/NV-001") {
            Content = new StringContent("{\"workStatus\":\"INACTIVE\"}", Encoding.UTF8, "application/json")
        };
        message.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        var changed = await client.SendAsync(message);
        Assert.Equal(HttpStatusCode.UnprocessableEntity, changed.StatusCode);
        var read = new HttpRequestMessage(HttpMethod.Get, "/api/v1/admin/employees");
        read.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        Assert.Equal(HttpStatusCode.OK, (await client.SendAsync(read)).StatusCode);
        using var scope = factory.Services.CreateScope();
        Assert.Equal("ACTIVE", (await scope.ServiceProvider.GetRequiredService<EmployeeRecordStore>().FindAsync("NV-001"))!.WorkStatus);
    }

    [Fact]
    public async Task AccountOwnedRequestFollowsCustomerIdRatherThanRecycledPhone()
    {
        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var store = scope.ServiceProvider.GetRequiredService<WarrantyRequestStore>();
        db.Customers.Add(new Customer("KH-A", "A", "0901111112", null, null, DateTimeOffset.UtcNow));
        db.Customers.Add(new Customer("KH-B", "B", "0901111111", null, null, DateTimeOffset.UtcNow));
        await db.SaveChangesAsync();
        await store.InsertAsync(new NewWarrantyRequest("YC-A", "A", "0901111111", null, null, "CAT", "TYPE", "MODEL", "SERIAL", "S1", "Broken", "TRAM-01", null, null, DateTimeOffset.UtcNow, "KH-A"));
        var context = new DefaultHttpContext();
        var actor = new CurrentActor(new HttpContextAccessor { HttpContext = context });
        var service = new PortalWarrantyRequestService(new PortalPolicy(db, actor), store, null!, null!, actor);
        void SetCustomer(string id) => context.Items["soopi.actor"] = new AuthenticatedActor(99, id, new HashSet<Role>{Role.CUSTOMER}, RolePermissions.ForRole(Role.CUSTOMER), null, id, id);
        SetCustomer("KH-A");
        Assert.Contains(await service.MineAsync(), x => x.Code == "YC-A");
        Assert.Equal("YC-A", (await service.GetAsync("YC-A")).Code);
        SetCustomer("KH-B");
        Assert.DoesNotContain(await service.MineAsync(), x => x.Code == "YC-A");
        await Assert.ThrowsAsync<DomainException>(() => service.GetAsync("YC-A"));
        var storage = scope.ServiceProvider.GetRequiredService<FileStorage>();
        var fileId = await storage.StoreAsync("issue.jpg", "image/jpeg", [1, 2, 3], new FileOwner("WARRANTY_REQUEST", "YC-A", null, "PORTAL"));
        try
        {
            var files = new AttachmentService(storage, actor);
            await Assert.ThrowsAsync<DomainException>(() => files.DownloadAsync(fileId));
            SetCustomer("KH-A");
            Assert.NotNull(await files.DownloadAsync(fileId));
        }
        finally { await storage.DeleteAsync(fileId); }
        var access = scope.ServiceProvider.GetRequiredService<PortalAccessService>();
        await Assert.ThrowsAsync<DomainException>(() => access.LookupAsync("YC-A", "0901111111", "127.0.0.1"));
        Assert.Equal("YC-A", (await access.LookupAsync("YC-A", "0901111112", "127.0.0.1")).Code);
    }

    [Fact]
    public async Task DeactivatingEmployeeRevokesOldAccessToken()
    {
        string workerToken;
        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var worker = Account.Employee("worker", "{bcrypt}x", [Role.TECHNICIAN], "NV-002", false);
            db.Accounts.Add(worker);
            await db.SaveChangesAsync();
            await scope.ServiceProvider.GetRequiredService<EmployeeRecordStore>().SaveAsync(
                new EmployeeRecord("NV-002", "Worker", "0900000002", null, null, [], 10, true, "ACTIVE", "TRAM-01", worker.Id));
            workerToken = factory.Services.GetRequiredService<JwtService>().IssueAccessToken(worker, "Worker");
        }
        var check = new HttpRequestMessage(HttpMethod.Get, "/api/v1/auth/me");
        check.Headers.Authorization = new AuthenticationHeaderValue("Bearer", workerToken);
        Assert.Equal(HttpStatusCode.OK, (await client.SendAsync(check)).StatusCode);
        var update = new HttpRequestMessage(HttpMethod.Patch, "/api/v1/admin/employees/NV-002")
        {
            Content = new StringContent("{\"workStatus\":\"INACTIVE\"}", Encoding.UTF8, "application/json")
        };
        update.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        Assert.Equal(HttpStatusCode.OK, (await client.SendAsync(update)).StatusCode);
        var after = new HttpRequestMessage(HttpMethod.Get, "/api/v1/auth/me");
        after.Headers.Authorization = new AuthenticationHeaderValue("Bearer", workerToken);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.SendAsync(after)).StatusCode);
    }

    [Fact]
    public async Task TechnicianQueueShowsOlderOpenTicketBeyondHundredClosedTickets()
    {
        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var store = scope.ServiceProvider.GetRequiredService<TicketStore>();
        var docs = scope.ServiceProvider.GetRequiredService<MongoDocuments>();
        var employee = new AuthenticatedActor(1, "tech", new HashSet<Role>{Role.TECHNICIAN}, RolePermissions.ForRole(Role.TECHNICIAN), "NV-002", null, "Tech");
        var now = DateTimeOffset.UtcNow;
        for (var i=0;i<101;i++) {
            var ticket = new Ticket($"TN-{i:000}", "TRAM-01", now.AddMinutes(i), null, null, null, "KH-MISSING", new Dictionary<string,string>(), $"TB-MISSING-{i}", new Dictionary<string,string>(), "NV-001", new WarrantyAtIntake("IN_WARRANTY", null, null, null, null, null), null, new Cosmetic(null,false,false,null,null,null,null,true), "Broken", null, 0m, SlaLevel.STANDARD_48H, employee);
            ticket.Assign($"PC-{i}", $"PSC-{i}", "NV-001", "NV-002", Priority.NORMAL, null, now, employee);
            await store.SaveAsync(ticket);
            if(i>0) await docs.UpdateAsync("tickets", Eq("_id", ticket.Id), new BsonDocument("$set", Document(("status","DELIVERED"),("open",false))));
        }
        var context = new DefaultHttpContext(); context.Items["soopi.actor"] = employee;
        var actor = new CurrentActor(new HttpContextAccessor{ HttpContext = context });
        var views = new TicketQueryService(store, docs, actor, scope.ServiceProvider.GetRequiredService<StaffDirectory>(), TimeProvider.System, factory.Services.GetRequiredService<IConfiguration>());
        var service = new TechnicianQueryService(scope.ServiceProvider.GetRequiredService<StaffDirectory>(), store, views, actor, TimeProvider.System);
        Assert.Single(await store.FindOpenAsync());
        Assert.Equal("TN-000", Assert.Single(await service.MyQueueAsync()).Code);
    }


    [Fact]
    public async Task MergingCustomerInvalidatesAccessTokenWithOldCustomerId()
    {
        string customerToken;
        using (var scope = factory.Services.CreateScope()) {
            var db=scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var docs=scope.ServiceProvider.GetRequiredService<MongoDocuments>();
            var account = Account.Customer("0902222221", "{bcrypt}x", "KH-SOURCE", false);
            db.Accounts.Add(account);
            db.Customers.Add(new Customer("KH-SOURCE","Source","0902222221",null,null,DateTimeOffset.UtcNow));
            db.Customers.Add(new Customer("KH-TARGET","Target","0902222222",null,null,DateTimeOffset.UtcNow));
            await db.SaveChangesAsync();
            await docs.UpdateAsync("customers",Eq("_id","KH-SOURCE"),new BsonDocument("$set",Document(("accountId",account.Id))));
            customerToken=factory.Services.GetRequiredService<JwtService>().IssueAccessToken(account,"Source");
        }
        async Task<HttpStatusCode> Profile(string accessToken) {
            var req=new HttpRequestMessage(HttpMethod.Get,"/api/v1/portal/my/profile");
            req.Headers.Authorization=new AuthenticationHeaderValue("Bearer",accessToken);
            return (await client.SendAsync(req)).StatusCode;
        }
        Assert.Equal(HttpStatusCode.OK,await Profile(customerToken));
        var merge=new HttpRequestMessage(HttpMethod.Post,"/api/v1/customers/KH-SOURCE/merge") {
            Content=new StringContent("{\"targetCode\":\"KH-TARGET\"}",Encoding.UTF8,"application/json")
        };
        merge.Headers.Authorization=new AuthenticationHeaderValue("Bearer",token);
        Assert.Equal(HttpStatusCode.OK,(await client.SendAsync(merge)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized,await Profile(customerToken));
        using var after=factory.Services.CreateScope();
        var moved=await after.ServiceProvider.GetRequiredService<AccountStore>().FindByLoginAsync("0902222221");
        Assert.Equal("KH-TARGET",moved!.CustomerId);
        var newToken=factory.Services.GetRequiredService<JwtService>().IssueAccessToken(moved,"Target");
        Assert.Equal(HttpStatusCode.OK,await Profile(newToken));
    }

    [Fact]
    public async Task CustomerRatingIsSavedAndAppearsInAdminReport()
    {
        string customerToken;
        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var docs = scope.ServiceProvider.GetRequiredService<MongoDocuments>();
            var account = Account.Customer("0903333333", "{bcrypt}x", "KH-RATING", false);
            db.Accounts.Add(account);
            db.Customers.Add(new Customer("KH-RATING", "Review customer", "0903333333", null, null, DateTimeOffset.UtcNow));
            await db.SaveChangesAsync();
            await docs.UpdateAsync("customers", Eq("_id", "KH-RATING"), new BsonDocument("$set", Document(("accountId", account.Id))));
            customerToken = factory.Services.GetRequiredService<JwtService>().IssueAccessToken(account, "Review customer");
            var now = DateTimeOffset.UtcNow;
            static AuthenticatedActor Staff(string id, Role role) =>
                new(1, id, new HashSet<Role> { role }, RolePermissions.ForRole(role), id, null, id);
            var receptionist = Staff("NV-001", Role.RECEPTIONIST);
            var dispatcher = Staff("NV-001", Role.DISPATCHER);
            var technician = Staff("NV-001", Role.TECHNICIAN);
            var ticket = new Ticket("TN-RATING", "TRAM-01", now, null, null, null, "KH-RATING",
                new Dictionary<string, string> { ["fullName"] = "Review customer", ["phone"] = "0903333333" }, "TB-RATING",
                new Dictionary<string, string> { ["productName"] = "Phone" }, "NV-001",
                new WarrantyAtIntake("IN_WARRANTY", null, DateOnly.FromDateTime(now.AddYears(1).Date), null, null, null),
                null, new Cosmetic(null, false, false, null, null, null, null, true), "Broken", null, 0m, SlaLevel.STANDARD_48H, receptionist);
            ticket.Assign("PC-RATING", "PSC-RATING", "NV-001", "NV-001", Priority.NORMAL, null, now, dispatcher);
            ticket.RecordInspection("PKT-RATING", new InspectionInput("Broken", [], false, WarrantyClassification.FREE_WARRANTY, null, null, null),
                DateOnly.FromDateTime(now.Date), now, technician);
            ticket.StartFreeRepair(now, technician);
            var steps = new[] { "VISUAL", "MAIN_FUNCTION", "SECONDARY", "POWER_CHARGING", "DATA", "FINAL" }
                .Select(step => (QcStep?)new QcStep(step, "PASS")).ToList();
            ticket.RecordRepairResult("KQ-RATING", "Fixed", steps, "PASS", null, now, technician);
            await ticket.HandOverAsync("PBG-RATING", new HandoverInput("Customer", "Good", false, null, null,
                new Recheck(true, true, true, true, true), true), () => Task.FromResult(new Signature("1", now)), now, receptionist);
            await scope.ServiceProvider.GetRequiredService<TicketStore>().SaveAsync(ticket);
        }
        var rate = new HttpRequestMessage(HttpMethod.Post, "/api/v1/portal/tickets/TN-RATING/rating")
        {
            Content = new StringContent("{\"rating\":5,\"comment\":\"Sửa nhanh\"}", Encoding.UTF8, "application/json")
        };
        rate.Headers.Authorization = new AuthenticationHeaderValue("Bearer", customerToken);
        var result = await client.SendAsync(rate);
        Assert.Equal(HttpStatusCode.OK, result.StatusCode);
        using (var doc = JsonDocument.Parse(await result.Content.ReadAsStringAsync()))
        {
            Assert.Equal(5, doc.RootElement.GetProperty("rating").GetInt32());
            Assert.Equal("Sửa nhanh", doc.RootElement.GetProperty("ratingComment").GetString());
        }
        var report = new HttpRequestMessage(HttpMethod.Get, "/api/v1/reports/customer-reviews?rating=5");
        report.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        var response = await client.SendAsync(report);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        using var body = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        Assert.Equal("TN-RATING", body.RootElement.GetProperty("reviews").GetProperty("items")[0].GetProperty("ticketCode").GetString());
        Assert.Equal(1, body.RootElement.GetProperty("customerReviewCount").GetInt32());
    }

    [Fact]
    public async Task BroadcastSendsOnlyToEligibleCustomersAndRejectsPartialSelection()
    {
        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var docs = scope.ServiceProvider.GetRequiredService<MongoDocuments>();
            for (var i = 1; i <= 3; i++)
            {
                var code = $"KH-BROADCAST-{i}";
                var account = Account.Customer($"090444444{i}", "{bcrypt}x", code, false);
                db.Accounts.Add(account);
                var customer = new Customer(code, $"Customer {i}", $"090444444{i}", null, null, DateTimeOffset.UtcNow);
                if (i == 3) customer.Archive();
                db.Customers.Add(customer);
                await db.SaveChangesAsync();
                await docs.UpdateAsync("customers", Eq("_id", code), new BsonDocument("$set", Document(("accountId", account.Id))));
            }
        }
        async Task<HttpStatusCode> Send(string? ids)
        {
            var request = new HttpRequestMessage(HttpMethod.Post, "/api/v1/admin/notifications/broadcast")
            {
                Content = new StringContent(JsonSerializer.Serialize(new { message = "Tin mới", link = "/account", customerIds = ids }), Encoding.UTF8, "application/json")
            };
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            return (await client.SendAsync(request)).StatusCode;
        }
        Assert.Equal(HttpStatusCode.NoContent, await Send("KH-BROADCAST-1"));
        Assert.Equal(HttpStatusCode.BadRequest, await Send("KH-BROADCAST-1,KH-BROADCAST-3"));
        Assert.Equal(HttpStatusCode.NoContent, await Send(null));
        using var after = factory.Services.CreateScope();
        var docsAfter = after.ServiceProvider.GetRequiredService<MongoDocuments>();
        Assert.Equal(3, await docsAfter.CountAsync("notifications", Eq("type", NotificationService.CustomAnnouncementType)));
    }

    [Fact]
    public async Task AdminCanDownloadExcelReport()
    {
        var request = new HttpRequestMessage(HttpMethod.Get, "/api/v1/reports/export?from=2026-10-01&to=2026-10-23");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        var response = await client.SendAsync(request);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", response.Content.Headers.ContentType?.MediaType);
        using var stream = new MemoryStream(await response.Content.ReadAsByteArrayAsync());
        using var workbook = new ZipArchive(stream, ZipArchiveMode.Read);
        Assert.NotNull(workbook.GetEntry("xl/workbook.xml"));
    }

    [Fact]
    public async Task EmailCodeMustMatchRegistrationAddressAndResetUsesVerifiedAddress()
    {
        var sender = factory.Services.GetRequiredService<RecordingEmailSender>();
        var issued = await client.PostAsJsonAsync("/api/v1/auth/otp",
            new { phone = "0905555555", email = "owner@example.com", purpose = "REGISTER" });
        Assert.Equal(HttpStatusCode.Accepted, issued.StatusCode);
        Assert.Equal("owner@example.com", sender.LastRecipient);
        var code = sender.LastCode;
        var wrong = await client.PostAsJsonAsync("/api/v1/auth/register",
            new { phone = "0905555555", email = "other@example.com", otp = code, fullName = "Owner",
                password = "MatKhauMoi2026" });
        Assert.Equal(HttpStatusCode.UnprocessableEntity, wrong.StatusCode);
        var registered = await client.PostAsJsonAsync("/api/v1/auth/register",
            new { phone = "0905555555", email = "owner@example.com", otp = code, fullName = "Owner",
                password = "MatKhauMoi2026" });
        Assert.Equal(HttpStatusCode.Created, registered.StatusCode);
        using var registration = JsonDocument.Parse(await registered.Content.ReadAsStringAsync());
        Assert.Equal("owner@example.com", registration.RootElement.GetProperty("user").GetProperty("username").GetString());
        var accessToken = registration.RootElement.GetProperty("accessToken").GetString();
        var phoneLogin = await client.PostAsJsonAsync("/api/v1/auth/login", new { username = "0905555555", password = "MatKhauMoi2026", remember = false });
        Assert.Equal(HttpStatusCode.Unauthorized, phoneLogin.StatusCode);
        var duplicateEmail = await client.PostAsJsonAsync("/api/v1/auth/otp",
            new { phone = "0907777777", email = "owner@example.com", purpose = "REGISTER" });
        Assert.Equal(HttpStatusCode.Conflict, duplicateEmail.StatusCode);
        var changeEmail = new HttpRequestMessage(HttpMethod.Patch, "/api/v1/portal/my/profile")
        {
            Content = JsonContent.Create(new { email = "new@example.com" })
        };
        changeEmail.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        Assert.Equal(HttpStatusCode.OK, (await client.SendAsync(changeEmail)).StatusCode);
        var unverifiedReset = await client.PostAsJsonAsync("/api/v1/auth/otp",
            new { email = "new@example.com", purpose = "RESET_PASSWORD" });
        Assert.Equal(HttpStatusCode.NotFound, unverifiedReset.StatusCode);
        var emailOtp = new HttpRequestMessage(HttpMethod.Post, "/api/v1/portal/my/email/otp")
        {
            Content = JsonContent.Create(new { email = "new@example.com" })
        };
        emailOtp.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        Assert.Equal(HttpStatusCode.OK, (await client.SendAsync(emailOtp)).StatusCode);
        Assert.Equal("new@example.com", sender.LastRecipient);
        var verifyEmail = new HttpRequestMessage(HttpMethod.Post, "/api/v1/portal/my/email/verify")
        {
            Content = JsonContent.Create(new { email = "new@example.com", code = sender.LastCode })
        };
        verifyEmail.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        var verified = await client.SendAsync(verifyEmail);
        Assert.Equal(HttpStatusCode.OK, verified.StatusCode);
        using (var profile = JsonDocument.Parse(await verified.Content.ReadAsStringAsync()))
        {
            Assert.True(profile.RootElement.GetProperty("emailVerified").GetBoolean());
            Assert.Equal("new@example.com", profile.RootElement.GetProperty("username").GetString());
        }
        var oldSession = new HttpRequestMessage(HttpMethod.Get, "/api/v1/auth/me");
        oldSession.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.SendAsync(oldSession)).StatusCode);
        var oldLogin = await client.PostAsJsonAsync("/api/v1/auth/login", new { username = "owner@example.com", password = "MatKhauMoi2026", remember = false });
        Assert.Equal(HttpStatusCode.Unauthorized, oldLogin.StatusCode);
        var newLogin = await client.PostAsJsonAsync("/api/v1/auth/login", new { username = "new@example.com", password = "MatKhauMoi2026", remember = false });
        Assert.Equal(HttpStatusCode.OK, newLogin.StatusCode);
        var reset = await client.PostAsJsonAsync("/api/v1/auth/otp",
            new { email = "new@example.com", purpose = "RESET_PASSWORD" });
        Assert.Equal(HttpStatusCode.Accepted, reset.StatusCode);
        Assert.Equal("new@example.com", sender.LastRecipient);
        var verifiedReset = await client.PostAsJsonAsync("/api/v1/auth/password-reset/verify",
            new { email = "new@example.com", otp = sender.LastCode });
        Assert.Equal(HttpStatusCode.NoContent, verifiedReset.StatusCode);
        var changedPassword = await client.PostAsJsonAsync("/api/v1/auth/password-reset",
            new { email = "new@example.com", otp = sender.LastCode, newPassword = "MatKhauKhac2026" });
        Assert.Equal(HttpStatusCode.NoContent, changedPassword.StatusCode);
        var recovered = await client.PostAsJsonAsync("/api/v1/auth/login", new { username = "new@example.com", password = "MatKhauKhac2026", remember = false });
        Assert.Equal(HttpStatusCode.OK, recovered.StatusCode);
    }

    [Fact]
    public async Task ExistingProfileCannotBeClaimedWithDifferentEmail()
    {
        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            db.Customers.Add(new Customer("KH-LEGACY", "Legacy", "0906666666", "known@example.com", null, DateTimeOffset.UtcNow));
            await db.SaveChangesAsync();
        }
        var rejected = await client.PostAsJsonAsync("/api/v1/auth/otp",
            new { phone = "0906666666", email = "attacker@example.com", purpose = "REGISTER" });
        Assert.Equal(HttpStatusCode.BadRequest, rejected.StatusCode);
        Assert.Null(factory.Services.GetRequiredService<RecordingEmailSender>().LastRecipient);
        var allowed = await client.PostAsJsonAsync("/api/v1/auth/otp",
            new { phone = "0906666666", email = "known@example.com", purpose = "REGISTER" });
        Assert.Equal(HttpStatusCode.Accepted, allowed.StatusCode);
    }

    private async Task SeedAsync()
    {
        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var docs = scope.ServiceProvider.GetRequiredService<MongoDocuments>();

        await docs.InsertAsync("service_stations", Document(("_id", "TRAM-01"), ("name", "Trạm 1"), ("active", true)));

        var adminAccount = Account.Employee("admin", "{bcrypt}x", [Role.ADMIN], "NV-001", false);
        db.Accounts.Add(adminAccount);
        await db.SaveChangesAsync(); // gán Id = 1 qua bộ đếm accounts

        var employees = new EmployeeRecordStore(db);
        await employees.SaveAsync(new EmployeeRecord("NV-001", "Quản trị", "0900000001", null, null, [], 10, true, "ACTIVE", "TRAM-01", adminAccount.Id));
    }

    private async Task<string> IssueAdminTokenAsync()
    {
        using var scope = factory.Services.CreateScope();
        var account = await scope.ServiceProvider.GetRequiredService<AccountStore>().FindByLoginAsync("admin")
            ?? throw new InvalidOperationException("Tài khoản admin chưa được seed.");
        return factory.Services.GetRequiredService<JwtService>().IssueAccessToken(account, "Quản trị");
    }
}

public sealed class RecordingEmailSender : IEmailSender
{
    public string? LastRecipient { get; private set; }
    public string LastCode { get; private set; } = "";

    public Task SendAsync(string email, string content)
    {
        LastRecipient = email;
        LastCode = System.Text.RegularExpressions.Regex.Match(content, @"\b\d{6}\b").Value;
        return Task.CompletedTask;
    }
}
