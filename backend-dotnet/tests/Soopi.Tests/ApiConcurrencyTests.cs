using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MongoDB.Driver;
using Soopi.Api.Data;
using Soopi.Api.Data.Entities;
using Soopi.Api.Data.Stores;
using Soopi.Api.Domain.Identity;
using Soopi.Api.Infrastructure.Security;
using static Soopi.Api.Data.MongoDocuments;

namespace Soopi.Tests;

/// <summary>
/// Regression test cho lỗi bộ đếm dùng chung gây CONCURRENT_MODIFICATION: gửi ≥7 PATCH song song lên các nhân viên KHÁC NHAU
/// (cùng chia sẻ bộ đếm <c>audit_logs</c> trong transaction) phải trả HTTP 200, không có request nào 409, và dữ liệu thực sự được lưu.
/// Trước khi sửa, kết quả đo được là ~57% request 409 do hai transaction cùng tăng một document <c>counters</c>.
/// </summary>
public sealed class ApiConcurrencyTests : IAsyncLifetime
{
    private const int Employees = 8; // 8 nhân viên khác nhau NV-002..NV-009
    private const int Rounds = 3;    // lặp nhiều vòng (tổng 24 PATCH)

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
    public async Task ConcurrentPatchesOnDistinctEmployeesNeverReturn409AndPersist()
    {
        for (var round = 1; round <= Rounds; round++)
        {
            var codes = Enumerable.Range(2, Employees).Select(i => $"NV-{i:000}").ToList();
            var responses = await Task.WhenAll(codes.Select(code => PatchAsync(code, $"{code} vòng {round}")));

            Assert.DoesNotContain(responses, response => response.StatusCode == HttpStatusCode.Conflict);
            for (var index = 0; index < responses.Length; index++)
                Assert.True(responses[index].IsSuccessStatusCode,
                    $"PATCH {codes[index]} vòng {round} trả {(int)responses[index].StatusCode} {responses[index].StatusCode}, mong đợi 200 (không có 409).");
        }

        // Kiểm chứng dữ liệu thực sự được lưu (không chỉ HTTP 200).
        using var scope = factory.Services.CreateScope();
        var employees = new EmployeeRecordStore(scope.ServiceProvider.GetRequiredService<AppDbContext>());
        for (var i = 2; i <= Employees + 1; i++)
        {
            var code = $"NV-{i:000}";
            Assert.Equal($"{code} vòng {Rounds}", (await employees.FindAsync(code))!.FullName);
        }
    }

    private async Task<HttpResponseMessage> PatchAsync(string code, string fullName)
    {
        var message = new HttpRequestMessage(HttpMethod.Patch, $"/api/v1/admin/employees/{code}")
        {
            Content = new StringContent(
                JsonSerializer.Serialize(new Dictionary<string, object?> { ["fullName"] = fullName }),
                Encoding.UTF8,
                "application/json"),
        };
        message.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return await client.SendAsync(message);
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
        for (var i = 2; i <= Employees + 1; i++)
            await employees.SaveAsync(new EmployeeRecord($"NV-{i:000}", $"Nhân viên {i}", $"09000000{i:00}", null, null, [], 10, true, "ACTIVE", "TRAM-01", null));
    }

    private async Task<string> IssueAdminTokenAsync()
    {
        using var scope = factory.Services.CreateScope();
        var account = await scope.ServiceProvider.GetRequiredService<AccountStore>().FindByLoginAsync("admin")
            ?? throw new InvalidOperationException("Tài khoản admin chưa được seed.");
        return factory.Services.GetRequiredService<JwtService>().IssueAccessToken(account, "Quản trị");
    }
}
