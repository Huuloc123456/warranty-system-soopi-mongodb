using Microsoft.Extensions.Caching.Memory;
using MongoDB.Driver;
using Soopi.Api.Data.Entities;
using Soopi.Api.Domain.Identity;
using Soopi.Api.Domain.Shared;
namespace Soopi.Api.Data.Stores;

public sealed record StaffMember(string Code, string FullName, IReadOnlySet<string> Skills, int MaxActiveTickets, bool OnSite, string StationCode, string AccountId);
public sealed class StaffDirectory(AppDbContext db, IMemoryCache cache)
{
    public async Task<StaffMember> RequireActiveWithRoleAsync(string? employeeId, Role role)
    {
        var employee = await db.FirstAsync<EmployeeRecord>("employees", e => e.Code == employeeId && e.WorkStatus == "ACTIVE");
        var account = employee?.AccountId is { } id ? await db.Accounts.FirstOrDefaultAsync(a => a.Id == id && a.Status == AccountStatus.ACTIVE && a.RoleRows.Any(r => r.Role == role)) : null;
        return employee is not null && account is not null ? Member(employee) : throw (role == Role.TECHNICIAN ? new DomainException(ErrorCode.TECHNICIAN_INVALID) : new DomainException(ErrorCode.EMPLOYEE_ROLE_REQUIRED, role.Label()));
    }
    public async Task<List<StaffMember>> ActiveTechniciansAsync()
    {
        var ids = (await db.Accounts.Where(a => a.Status == AccountStatus.ACTIVE && a.RoleRows.Any(r => r.Role == Role.TECHNICIAN)).ToListAsync()).Select(a => a.Id).ToList();
        return (await db.Find<EmployeeRecord>("employees", Builders<EmployeeRecord>.Filter.Where(e => e.WorkStatus == "ACTIVE" && e.AccountId != null && ids.Contains(e.AccountId.Value))).SortBy(e => e.Code).ToListAsync()).Select(Member).ToList();
    }
    public async Task<IReadOnlyDictionary<string, string>> EmployeeNamesAsync() => await cache.GetOrCreateAsync("staff:names", async entry =>
    {
        entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(60);
        return (IReadOnlyDictionary<string, string>)(await db.ListAsync<EmployeeRecord>("employees", e => true)).ToDictionary(e => e.Code, e => e.FullName);
    }) ?? new Dictionary<string, string>();
    private static StaffMember Member(EmployeeRecord e) => new(e.Code, e.FullName, e.Skills.ToHashSet(), e.MaxActiveTickets, e.OnSite, e.StationCode, e.AccountId!.Value.ToString());
}
