using System.Security.Cryptography;
using System.Text;
using Soopi.Api.Data;
using Microsoft.Extensions.Options;
using Soopi.Api.Data.Entities;
using Soopi.Api.Data.Stores;
using Soopi.Api.Domain.Identity;
using Soopi.Api.Domain.Shared;
using Soopi.Api.DTOs.Identity;
using Soopi.Api.Infrastructure.Security;
using Soopi.Api.Services.Shared;

namespace Soopi.Api.Services.Identity;

public sealed class AuthService(
    AppDbContext db,
    AccountStore accounts,
    PrincipalDirectory principals,
    JwtService jwt,
    PasswordPolicy passwordPolicy,
    RateLimiter rateLimiter,
    AuditService audit,
    IOptions<SecurityOptions> options,
    SecurityVersionCache securityVersions,
    TransactionRunner transactions,
    TimeProvider clock)
{
    private SecurityOptions Settings => options.Value;

    /// <summary>Lỗi nghiệp vụ (sai mật khẩu, khóa tạm) vẫn ghi bộ đếm đăng nhập sai và nhật ký trước khi báo lỗi.</summary>
    public async Task<AuthResult> LoginAsync(string username, string password, bool remember, string? ip, string? userAgent)
    {
        var (account, displayName) = await AuthenticateAsync(username, password, ip);
        return await IssueAsync(account, displayName, remember, Guid.NewGuid().ToString(), ip, userAgent);
    }

    /// <summary>Mở phiên (không "ghi nhớ") cho tài khoản khách vừa đăng ký, đã xác minh OTP thay cho mật khẩu.</summary>
    public Task<AuthResult> SignInAsync(long accountId, string? ip, string? userAgent) =>
        transactions.InTransactionAsync(async () =>
        {
            var account = await RequireActiveAccountAsync(accountId);
            account.RegisterSuccessfulLogin(clock.GetUtcNow());
            await accounts.SaveAsync();
            return await IssueAsync(account, await principals.DisplayNameAsync(account), false, Guid.NewGuid().ToString(), ip, userAgent);
        });

    public async Task<AuthResult> RefreshAsync(string rawToken, string? ip, string? userAgent)
    {
        var token = await db.RefreshTokens.FirstOrDefaultAsync(t => t.TokenHash == Hash(rawToken))
            ?? throw new DomainException(ErrorCode.AUTH_TOKEN_INVALID);
        var now = clock.GetUtcNow();
        if (token.RevokedAt is not null)
        {
            await RevokeFamilyAsync(token.FamilyId, now);
            await AuditReuseAsync(token);
            throw new DomainException(ErrorCode.AUTH_REFRESH_REUSED);
        }
        if (!token.Active(now)) throw new DomainException(ErrorCode.AUTH_TOKEN_INVALID);
        try
        {
            return await transactions.InTransactionAsync(async () =>
        {
            token = await db.RefreshTokens.FirstOrDefaultAsync(t => t.TokenHash == Hash(rawToken))
                ?? throw new DomainException(ErrorCode.AUTH_TOKEN_INVALID);
            now = clock.GetUtcNow();
            if (token.RevokedAt is not null) throw new DomainException(ErrorCode.AUTH_REFRESH_REUSED);
            if (!token.Active(now)) throw new DomainException(ErrorCode.AUTH_TOKEN_INVALID);
            var account = await RequireActiveAccountAsync(token.AccountId);
            var result = await IssueAsync(account, await principals.DisplayNameAsync(account), token.Remember, token.FamilyId, ip, userAgent);
            token.Rotate(now, Hash(result.RefreshToken));
            await db.SaveChangesAsync();
            return result;
        });
        }
        catch (DomainException exception) when (exception.Code == ErrorCode.AUTH_REFRESH_REUSED)
        {
            await RevokeFamilyAsync(token.FamilyId, now);
            await AuditReuseAsync(token);
            throw;
        }
    }

    public async Task LogoutAsync(string? rawToken, bool all)
    {
        if (string.IsNullOrWhiteSpace(rawToken)) return;
        var token = await db.RefreshTokens.FirstOrDefaultAsync(t => t.TokenHash == Hash(rawToken));
        if (token is null) return;
        if (all) await RevokeAccountAsync(token.AccountId, clock.GetUtcNow());
        else
        {
            token.Revoke(clock.GetUtcNow());
            await db.SaveChangesAsync();
        }
    }

    public async Task<UserView> MeAsync(AuthenticatedActor actor)
    {
        var account = await accounts.FindByIdAsync(actor.AccountId) ?? throw new DomainException(ErrorCode.AUTH_TOKEN_REVOKED);
        return View(account, actor.DisplayName ?? account.Username);
    }

    /// <summary>Phiên mới sau khi đổi mật khẩu không "ghi nhớ".</summary>
    public Task<AuthResult> ChangePasswordAsync(
        AuthenticatedActor actor, string currentPassword, string newPassword, string? ip, string? userAgent) =>
        transactions.InTransactionAsync(() => ChangePasswordOnceAsync(actor, currentPassword, newPassword, ip, userAgent));

    private async Task<AuthResult> ChangePasswordOnceAsync(
        AuthenticatedActor actor, string currentPassword, string newPassword, string? ip, string? userAgent)
    {
        var account = await accounts.FindByIdAsync(actor.AccountId) ?? throw new DomainException(ErrorCode.AUTH_TOKEN_REVOKED);
        // Chặn dò "mật khẩu hiện tại" bằng token/phiên đánh cắp: giới hạn tần suất giống màn đăng nhập.
        rateLimiter.CheckLogin(ip, actor.Username);
        if (!PasswordHasher.Matches(currentPassword, account.PasswordHash)) throw new DomainException(ErrorCode.AUTH_INVALID_CREDENTIALS);
        passwordPolicy.Validate(account.Username, newPassword);
        // Giữ nguyên mật khẩu (vd. mật khẩu mặc định sau khi đặt lại, D-076) không được tính là đã đổi.
        if (newPassword == currentPassword) throw new DomainException(ErrorCode.AUTH_PASSWORD_POLICY);
        var now = clock.GetUtcNow();
        account.ChangePassword(PasswordHasher.Encode(newPassword), now);
        await accounts.SaveAsync();
        securityVersions.Evict(account.Id);
        await RevokeAccountAsync(account.Id, now);
        await AuditAsync(account, "AUTH_PASSWORD_CHANGED", "Đổi mật khẩu");
        return await IssueAsync(account, actor.DisplayName ?? account.Username, false, Guid.NewGuid().ToString(), ip, userAgent);
    }

    /// <summary>Quên mật khẩu (chủ tài khoản đã xác minh OTP): thu hồi mọi phiên; mật khẩu đã kiểm tra chính sách trước.</summary>
    public Task RecoverPasswordAsync(long accountId, string newPassword) =>
        transactions.InTransactionAsync(async () =>
        {
            var account = await accounts.FindByIdAsync(accountId) ?? throw new DomainException(ErrorCode.NOT_FOUND);
            var now = clock.GetUtcNow();
            account.RecoverPassword(PasswordHasher.Encode(newPassword), now);
            await accounts.SaveAsync();
            securityVersions.Evict(account.Id);
            await RevokeAccountAsync(account.Id, now);
            await AuditAsync(account, "AUTH_PASSWORD_RECOVERED", "Đặt lại mật khẩu bằng OTP");
        });

    public Task RevokeAccountAsync(long accountId, DateTimeOffset at) =>
        db.RefreshTokens.Where(t => t.AccountId == accountId && t.RevokedAt == null)
            .ExecuteUpdateAsync(set => set.SetProperty(t => t.RevokedAt, at));

    public static string Hash(string value) => Convert.ToHexStringLower(SHA256.HashData(Encoding.UTF8.GetBytes(value)));

    public static UserView View(Account account, string displayName)
    {
        var roles = account.Roles.Select(RoleView.From).ToList();
        var permissions = RolePermissions.ForRoles(account.Roles).Select(p => p.ToString()).Order(StringComparer.Ordinal).ToList();
        return new UserView(
            account.Id.ToString(),
            account.Username,
            displayName,
            account.EmployeeId,
            account.CustomerId,
            roles,
            permissions,
            roles[0].Landing,
            account.MustChangePassword);
    }

    private async Task<(Account Account, string DisplayName)> AuthenticateAsync(string username, string password, string? ip)
    {
        var normalized = Account.Normalize(username);
        rateLimiter.CheckLogin(ip, normalized);
        var account = await accounts.FindByLoginAsync(username);
        var matches = PasswordHasher.Matches(password, account?.PasswordHash ?? PasswordHasher.DummyHash);
        if (account is null || !matches) await FailedLoginAsync(account, normalized);
        var now = clock.GetUtcNow();
        if (account!.TemporarilyLocked(now)) throw new DomainException(ErrorCode.AUTH_TEMPORARILY_LOCKED);
        var displayName = account.Status == AccountStatus.LOCKED ? null : await principals.ActiveNameAsync(account);
        if (displayName is null) throw new DomainException(ErrorCode.AUTH_ACCOUNT_LOCKED);
        account.RegisterSuccessfulLogin(now);
        await accounts.SaveAsync();
        await AuditAsync(account, "AUTH_LOGIN_SUCCESS", "Đăng nhập thành công");
        return (account, displayName);
    }

    private async Task FailedLoginAsync(Account? account, string normalized)
    {
        var now = clock.GetUtcNow();
        if (account is not null && account.TemporarilyLocked(now)) throw new DomainException(ErrorCode.AUTH_TEMPORARILY_LOCKED);
        if (account is not null)
        {
            var locked = account.RegisterFailedLogin(now, Settings.Login.MaxFailedAttempts, Settings.Login.TemporaryLock);
            await accounts.SaveAsync();
            await AuditAsync(account, "AUTH_LOGIN_FAILED", "Đăng nhập thất bại");
            if (locked) throw new DomainException(ErrorCode.AUTH_TEMPORARILY_LOCKED);
        }
        else
        {
            await audit.RecordAsync(normalized, normalized, ["ANONYMOUS"], "AUTH_LOGIN_FAILED", "Đăng nhập thất bại", "ACCOUNT", normalized);
        }
        throw new DomainException(ErrorCode.AUTH_INVALID_CREDENTIALS);
    }

    private async Task<AuthResult> IssueAsync(Account account, string displayName, bool remember, string familyId, string? ip, string? userAgent)
    {
        var rawRefresh = RandomToken();
        var now = clock.GetUtcNow();
        var refreshTtl = remember ? Settings.Jwt.RefreshTokenRememberTtl : Settings.Jwt.RefreshTokenTtl;
        db.RefreshTokens.Add(new RefreshToken(Hash(rawRefresh), account.Id, familyId, now, now + refreshTtl, remember, Safe(ip), Safe(userAgent)));
        await db.SaveChangesAsync();
        return new AuthResult(
            jwt.IssueAccessToken(account, displayName),
            (long)Settings.Jwt.AccessTokenTtl.TotalSeconds,
            rawRefresh,
            remember,
            (long)refreshTtl.TotalSeconds,
            View(account, displayName));
    }

    private async Task<Account> RequireActiveAccountAsync(long id)
    {
        var account = await accounts.FindByIdAsync(id) ?? throw new DomainException(ErrorCode.AUTH_TOKEN_REVOKED);
        if (account.Status != AccountStatus.ACTIVE || !await principals.ActiveAsync(account))
            throw new DomainException(ErrorCode.AUTH_TOKEN_REVOKED);
        return account;
    }

    private Task RevokeFamilyAsync(string familyId, DateTimeOffset at) =>
        db.RefreshTokens.Where(t => t.FamilyId == familyId && t.RevokedAt == null)
            .ExecuteUpdateAsync(set => set.SetProperty(t => t.RevokedAt, at));

    private Task AuditAsync(Account account, string action, string label) =>
        audit.RecordAsync(AuditId(account), account.Username, account.Roles.Select(r => r.ToString()), action, label, "ACCOUNT", account.Id.ToString());

    private Task AuditReuseAsync(RefreshToken token) =>
        audit.RecordAsync(
            token.AccountId.ToString(), token.AccountId.ToString(), ["UNKNOWN"],
            "AUTH_REFRESH_REUSE_DETECTED", "Phát hiện dùng lại refresh token", "ACCOUNT", token.AccountId.ToString());

    /// <summary>Nhật ký theo quy ước: mã NV, "KH:&lt;mã KH&gt;", hoặc mã tài khoản nếu chưa gắn hồ sơ.</summary>
    private static string AuditId(Account account) =>
        account.EmployeeId ?? (account.CustomerId is not null ? "KH:" + account.CustomerId : account.Id.ToString());

    private static string RandomToken() => Base64UrlEncode(RandomNumberGenerator.GetBytes(32));

    private static string Base64UrlEncode(byte[] bytes) => Convert.ToBase64String(bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_');

    private static string Safe(string? value) => value is null ? "" : value[..Math.Min(value.Length, 500)];
}
