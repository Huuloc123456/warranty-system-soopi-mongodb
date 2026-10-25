using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using Soopi.Api.Data;
using Soopi.Api.Data.Stores;
using Soopi.Api.Domain.Identity;
using Soopi.Api.Domain.Shared;
using Soopi.Api.DTOs.Identity;
using Soopi.Api.Infrastructure.Security;
using Soopi.Api.Services.Identity;
using Soopi.Api.Services.Shared;
using static Soopi.Api.Data.MongoDocuments;

namespace Soopi.Tests;

/// <summary>Regression test cho lỗi "không thêm được nhân viên mới" (ghi cứng trạm HCM): nhân viên mới thuộc trạm của admin tạo họ.</summary>
public sealed class EmployeeAdminTests : IAsyncLifetime
{
    private readonly string databaseName = "soopi_mongodb_test_" + Guid.NewGuid().ToString("N");
    private ServiceProvider provider = null!;
    private StubHttpContextAccessor accessor = null!;

    public async Task InitializeAsync()
    {
        MongoMapping.Configure();
        var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Mongo:Database"] = databaseName,
        }).Build();
        accessor = new StubHttpContextAccessor();
        provider = new ServiceCollection()
            .AddSingleton<IConfiguration>(config)
            .AddSingleton(new MongoClient("mongodb://127.0.0.1:27017/?replicaSet=rs0&serverSelectionTimeoutMS=5000"))
            .AddSingleton(TimeProvider.System)
            .AddSingleton<IMemoryCache>(new MemoryCache(new MemoryCacheOptions()))
            .AddSingleton<IHttpContextAccessor>(accessor)
            .AddSingleton<SecurityVersionCache>()
            .AddSingleton(Options.Create(new SecurityOptions()))
            .AddScoped<AppDbContext>()
            .AddScoped<MongoDocuments>()
            .AddScoped<TransactionRunner>()
            .AddScoped<EmployeeRecordStore>()
            .AddScoped<AccountStore>()
            .AddScoped<AccountPolicy>()
            .AddScoped<CodeGenerator>()
            .AddScoped<CurrentActor>()
            .AddScoped<AuditService>()
            .AddScoped<EmployeeAdminService>()
            .BuildServiceProvider();
        await MongoInitializer.InitializeAsync(provider, false);
    }

    public async Task DisposeAsync()
    {
        Assert.StartsWith("soopi_mongodb_test_", databaseName);
        await provider.GetRequiredService<MongoClient>().DropDatabaseAsync(databaseName);
        await provider.DisposeAsync();
    }

    [Fact]
    public async Task CreateEmployee_UsesAdminStationInsteadOfHardcodedHcm()
    {
        using var scope = provider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var docs = scope.ServiceProvider.GetRequiredService<MongoDocuments>();
        var employees = new EmployeeRecordStore(db);

        await docs.InsertAsync("service_stations", Document(("_id", "TRAM-01"), ("name", "Trạm 1"), ("active", true)));
        await employees.SaveAsync(new EmployeeRecord("NV-001", "Quản trị", "0900000001", null, null, [], 10, true, "ACTIVE", "TRAM-01", null));
        await docs.PutAsync("counters", Document(("_id", "NV"), ("value", 1L)));

        accessor.HttpContext = new DefaultHttpContext();
        accessor.HttpContext.Items["soopi.actor"] =
            new AuthenticatedActor(1L, "admin", new HashSet<Role> { Role.ADMIN }, RolePermissions.ForRole(Role.ADMIN), "NV-001", null, "Quản trị");

        var service = scope.ServiceProvider.GetRequiredService<EmployeeAdminService>();
        var result = await service.CreateAsync(new EmployeeCreateRequest(
            "Nhân viên mới", "0900000002", null, null, null, null, "nhanvien1", new HashSet<Role> { Role.TECHNICIAN }));

        Assert.Equal("NV-002", result.Employee.EmployeeId);
        var created = await employees.FindAsync(result.Employee.EmployeeId);
        Assert.Equal("TRAM-01", created!.StationCode);
    }

    [Fact]
    public async Task CreateEmployee_FailsClearlyWhenAdminProfileOrStationMissing()
    {
        using var scope = provider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var docs = scope.ServiceProvider.GetRequiredService<MongoDocuments>();
        var employees = new EmployeeRecordStore(db);

        await docs.InsertAsync("service_stations", Document(("_id", "TRAM-01"), ("name", "Trạm 1"), ("active", true)));
        await employees.SaveAsync(new EmployeeRecord("NV-001", "Quản trị", "0900000001", null, null, [], 10, true, "ACTIVE", "TRAM-01", null));

        // Actor trỏ tới mã NV không tồn tại → không xác định được trạm → lỗi rõ ràng thay vì gán cứng một trạm.
        accessor.HttpContext = new DefaultHttpContext();
        accessor.HttpContext.Items["soopi.actor"] =
            new AuthenticatedActor(1L, "admin", new HashSet<Role> { Role.ADMIN }, RolePermissions.ForRole(Role.ADMIN), "NV-999", null, "Quản trị");

        var service = scope.ServiceProvider.GetRequiredService<EmployeeAdminService>();
        var exception = await Assert.ThrowsAsync<DomainException>(() => service.CreateAsync(new EmployeeCreateRequest(
            "Nhân viên mới", "0900000002", null, null, null, null, "nhanvien1", new HashSet<Role> { Role.TECHNICIAN })));
        Assert.Equal(ErrorCode.VALIDATION_FAILED, exception.Code);
    }

    private sealed class StubHttpContextAccessor : IHttpContextAccessor
    {
        public HttpContext? HttpContext { get; set; }
    }
}
