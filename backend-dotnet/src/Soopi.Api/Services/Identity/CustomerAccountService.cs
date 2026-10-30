using Soopi.Api.Data;
using Soopi.Api.Data.Entities;
using Soopi.Api.Data.Stores;
using Soopi.Api.Domain.Shared;
using Soopi.Api.DTOs.Identity;
using Soopi.Api.Infrastructure.Security;
using Soopi.Api.Infrastructure.Validation;
using Soopi.Api.Services.Shared;

namespace Soopi.Api.Services.Identity;

public sealed record RegisterCommand(string Phone, string Otp, string? FullName, string Password, string? Email);

/// <summary>
/// Tài khoản khách tự phục vụ trên cổng khách hàng: đăng ký và quên mật khẩu bằng OTP email. Tên đăng nhập là email. Hồ sơ khách có
/// sẵn cùng SĐT (khách từng mang máy tới) được gắn vào tài khoản để thấy phiếu cũ.
/// </summary>
public sealed class CustomerAccountService(
    CustomerProfileStore profiles,
    AccountStore accounts,
    OtpService otp,
    PasswordPolicy passwordPolicy,
    CodeGenerator codes,
    TransactionRunner transactions,
    AuthService auth,
    AuditService audit,
    RateLimiter limiter,
    TimeProvider clock)
{
    /// <summary>
    /// Báo rõ SĐT đã/chưa có tài khoản để giao diện dẫn khách sang đúng luồng (D-070) — đánh đổi quyền riêng tư nhỏ, được hạn chế
    /// bằng rate limit theo IP trước khi tra cứu.
    /// </summary>
    public async Task<OtpIssued> RequestOtpAsync(string? rawPhone, OtpPurpose? purpose, string? rawEmail, string? clientIp)
    {
        if (purpose is not (OtpPurpose.REGISTER or OtpPurpose.RESET_PASSWORD))
            throw new DomainException(ErrorCode.VALIDATION_FAILED);
        limiter.Acquire("otp-ip:" + clientIp, 20, TimeSpan.FromHours(1));
        var email = RequireEmail(rawEmail);
        if (purpose == OtpPurpose.RESET_PASSWORD)
        {
            var profile = await profiles.FindActiveByVerifiedEmailAsync(email);
            if (profile?.AccountId is null) throw new DomainException(ErrorCode.CUSTOMER_ACCOUNT_NOT_FOUND);
            return await otp.IssueAsync(profile.Phone, purpose.Value, email, clientIp);
        }
        var phone = PhoneNumber.Require(rawPhone);
        if (await RegisteredAsync(phone) || await accounts.FindByLoginAsync(email) is not null)
            throw new DomainException(ErrorCode.CUSTOMER_ACCOUNT_EXISTS);
        var existing = await profiles.FindActiveByPhoneAsync(phone);
        if (existing is not null && !string.Equals(existing.Email, email, StringComparison.OrdinalIgnoreCase))
            throw new DomainException(ErrorCode.VALIDATION_FAILED);
        return await otp.IssueAsync(phone, purpose.Value, email, clientIp);
    }

    /// <summary>Kiểm tra mọi thứ rẻ (mật khẩu, họ tên) trước khi tiêu OTP để khách không phải xin mã lại vì gõ sai mật khẩu.</summary>
    public async Task<AuthResult> RegisterAsync(RegisterCommand command, string? clientIp, string? userAgent)
    {
        var phone = PhoneNumber.Require(command.Phone);
        var email = RequireEmail(command.Email);
        passwordPolicy.Validate(email, command.Password);
        var profile = await profiles.FindActiveByPhoneAsync(phone);
        if (await RegisteredAsync(phone)) throw new DomainException(ErrorCode.CUSTOMER_ACCOUNT_EXISTS);
        if (await accounts.FindByLoginAsync(email) is not null) throw new DomainException(ErrorCode.CUSTOMER_ACCOUNT_EXISTS);
        if (profile is null && string.IsNullOrWhiteSpace(command.FullName)) throw new DomainException(ErrorCode.VALIDATION_FAILED);
        if (profile is not null && !string.Equals(profile.Email, email, StringComparison.OrdinalIgnoreCase))
            throw new DomainException(ErrorCode.VALIDATION_FAILED);
        await otp.ConsumeAsync(phone, OtpPurpose.REGISTER, email, command.Otp);
        long accountId;
        try
        {
            accountId = await transactions.InTransactionAsync(() => CreateAccountAsync(phone, command));
        }
        catch (DomainException exception)
            when (exception.Code is ErrorCode.ACCOUNT_USERNAME_DUPLICATE or ErrorCode.CUSTOMER_PHONE_DUPLICATE)
        {
            throw new DomainException(ErrorCode.CUSTOMER_ACCOUNT_EXISTS);
        }
        return await auth.SignInAsync(accountId, clientIp, userAgent);
    }

    /// <summary>Bước 1 của quên mật khẩu trên web: xác nhận mã đúng trước khi khách nhập mật khẩu mới (mã chưa bị tiêu).</summary>
    public async Task VerifyResetOtpAsync(string rawEmail, string code)
    {
        var email = RequireEmail(rawEmail);
        var profile = await profiles.FindActiveByVerifiedEmailAsync(email);
        if (profile?.AccountId is null) throw new DomainException(ErrorCode.CUSTOMER_ACCOUNT_NOT_FOUND);
        await otp.VerifyAsync(profile.Phone, OtpPurpose.RESET_PASSWORD, email, code);
    }

    /// <summary>Thu hồi mọi phiên: máy bị mất không còn đăng nhập được nữa.</summary>
    public async Task ResetPasswordAsync(string rawEmail, string code, string newPassword)
    {
        var email = RequireEmail(rawEmail);
        var profile = await profiles.FindActiveByVerifiedEmailAsync(email);
        var account = profile?.AccountId is { } id ? await accounts.FindByIdAsync(id) : null;
        if (account is null) throw new DomainException(ErrorCode.CUSTOMER_ACCOUNT_NOT_FOUND);
        passwordPolicy.Validate(account.Username, newPassword);
        await otp.ConsumeAsync(profile!.Phone, OtpPurpose.RESET_PASSWORD, email, code);
        await auth.RecoverPasswordAsync(account.Id, newPassword);
    }

    private async Task<long> CreateAccountAsync(string phone, RegisterCommand command)
    {
        var now = clock.GetUtcNow();
        var existing = await profiles.FindActiveByPhoneAsync(phone);
        if (existing?.AccountId is not null) throw new DomainException(ErrorCode.CUSTOMER_ACCOUNT_EXISTS);
        var customerCode = existing?.Code;
        var fullName = existing?.FullName;
        if (customerCode is null)
        {
            customerCode = await codes.NextAsync(BusinessCodeType.Customer);
            fullName = command.FullName!.Trim();
            await profiles.CreateAsync(customerCode, fullName, phone, RequireEmail(command.Email), now);
        }
        else await profiles.VerifyEmailAsync(customerCode, RequireEmail(command.Email));
        var account = await accounts.AddAsync(Account.Customer(RequireEmail(command.Email), PasswordHasher.Encode(command.Password), customerCode, false));
        await profiles.LinkAccountAsync(customerCode, account.Id);
        await audit.RecordAsync(
            "KH:" + customerCode, fullName, ["CUSTOMER"], "CUSTOMER_ACCOUNT_REGISTERED",
            "Đăng ký tài khoản trên cổng khách hàng", "ACCOUNT", account.Id.ToString());
        return account.Id;
    }

    /// <summary>Có tài khoản nếu hồ sơ khách đang dùng SĐT đã gắn tài khoản, hoặc SĐT đã là tên đăng nhập cũ của ai đó.</summary>
    private async Task<bool> RegisteredAsync(string phone) =>
        (await profiles.FindActiveByPhoneAsync(phone))?.AccountId is not null || await accounts.FindByLoginAsync(phone) is not null;

    internal static string RequireEmail(string? rawEmail)
    {
        var email = rawEmail?.Trim();
        if (string.IsNullOrEmpty(email) || email.Length > 100 || !new EmailAttribute().IsValid(email) || email.Any(char.IsControl))
            throw new DomainException(ErrorCode.VALIDATION_FAILED);
        return email.ToLowerInvariant();
    }
}
