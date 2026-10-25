using Soopi.Api.Data.Entities;
using Soopi.Api.Domain.Identity;
namespace Soopi.Api.Data.Stores;

public sealed class AccountStore(AppDbContext db)
{
    public async Task<Account?> FindByLoginAsync(string? login)
    {
        var username = Account.Normalize(login);
        var employeeId = login?.Trim().ToUpperInvariant() ?? "";
        var account = await db.Accounts.FirstOrDefaultAsync(a => a.Username == username);
        if (account is null)
        {
            var employee = await db.FirstAsync<EmployeeRecord>("employees", e => e.Code == employeeId);
            if (employee?.AccountId is { } id) account = await db.Accounts.FirstOrDefaultAsync(a => a.Id == id);
        }
        return account is null ? null : await EnrichAsync(account);
    }
    public async Task<Account?> FindByIdAsync(long? id)
    {
        if (id is null) return null;
        var account = await db.Accounts.FirstOrDefaultAsync(a => a.Id == id);
        return account is null ? null : await EnrichAsync(account);
    }
    public async Task<Account?> FindByEmployeeIdAsync(string employeeId)
    {
        var employee = await db.FirstAsync<EmployeeRecord>("employees", e => e.Code == employeeId);
        return await FindByIdAsync(employee?.AccountId);
    }
    public async Task<List<Account>> FindEmployeeAccountsAsync()
    {
        var result = await db.Accounts.Where(a => a.PrincipalType == PrincipalType.EMPLOYEE).ToListAsync();
        foreach (var account in result) await EnrichAsync(account);
        return result;
    }
    public Task<int> CountActiveWithRoleAsync(Role role) => db.Accounts.CountAsync(a => a.Status == AccountStatus.ACTIVE && a.RoleRows.Any(r => r.Role == role));
    public async Task<Account> AddAsync(Account account) { db.Accounts.Add(account); await db.SaveChangesAsync(); return account; }
    public Task SaveAsync() => db.SaveChangesAsync();
    private async Task<Account> EnrichAsync(Account account)
    {
        account.EmployeeId = (await db.FirstAsync<EmployeeRecord>("employees", e => e.AccountId == account.Id))?.Code;
        account.CustomerId = (await db.Customers.FirstOrDefaultAsync(c => c.AccountId == account.Id))?.Id;
        return account;
    }
}
public sealed class PrincipalDirectory(AppDbContext db)
{
    public async Task<bool> ActiveAsync(Account account) => await ActiveNameAsync(account) is not null;
    public async Task<string> DisplayNameAsync(Account account) => (await PrincipalAsync(account))?.FullName ?? account.Username;
    public async Task<string?> ActiveNameAsync(Account account) => await PrincipalAsync(account) is { Status: "ACTIVE" } principal ? principal.FullName : null;
    private async Task<(string FullName, string Status)?> PrincipalAsync(Account account)
    {
        if (account.PrincipalType == PrincipalType.EMPLOYEE)
        {
            var employee = await db.FirstAsync<EmployeeRecord>("employees", e => e.AccountId == account.Id);
            return employee is null ? null : (employee.FullName, employee.WorkStatus);
        }
        var customer = await db.Customers.FirstOrDefaultAsync(c => c.AccountId == account.Id);
        return customer is null ? null : (customer.FullName, customer.Status.ToString());
    }
}
