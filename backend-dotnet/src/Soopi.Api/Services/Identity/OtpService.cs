using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using System.Net;
using System.Net.Mail;
using Soopi.Api.Data.Stores;
using Soopi.Api.Domain.Shared;
using Soopi.Api.DTOs.Identity;
using Soopi.Api.Infrastructure.Security;

namespace Soopi.Api.Services.Identity;

public sealed class EmailDeliveryException : Exception;

public interface IEmailSender
{
    Task SendAsync(string email, string content);
}

public sealed class SmtpEmailSender(IConfiguration configuration) : IEmailSender
{
    public async Task SendAsync(string email, string content)
    {
        var password = configuration["Email:AppPassword"];
        if (string.IsNullOrWhiteSpace(password)) throw new EmailDeliveryException();
        try
        {
            using var message = new MailMessage(configuration["Email:From"] ?? "hsostd74@gmail.com", email)
            {
                Subject = "Mã xác minh Soopi",
                Body = content,
                SubjectEncoding = Encoding.UTF8,
                BodyEncoding = Encoding.UTF8,
            };
            using var client = new SmtpClient(configuration["Email:Host"] ?? "smtp.gmail.com", configuration.GetValue("Email:Port", 587))
            {
                EnableSsl = true,
                UseDefaultCredentials = false,
                Credentials = new NetworkCredential(message.From!.Address, password),
            };
            using var timeout = new CancellationTokenSource(TimeSpan.FromSeconds(15));
            await client.SendMailAsync(message, timeout.Token);
        }
        catch (Exception exception) when (exception is SmtpException or FormatException or OperationCanceledException
            or InvalidOperationException or IOException or System.Security.Authentication.AuthenticationException)
        {
            throw new EmailDeliveryException();
        }
    }
}

/// <summary>
/// OTP 6 chữ số gửi qua email: sống 5 phút, dùng một lần, tối đa 5 lần nhập sai. Không chạy trong transaction của người gọi
/// để lần nhập sai luôn được ghi lại kể cả khi thao tác chính thất bại.
/// </summary>
public sealed partial class OtpService
{
    private static readonly TimeSpan Ttl = TimeSpan.FromMinutes(5);
    private static readonly TimeSpan ResendAfter = TimeSpan.FromSeconds(60);
    private const int MaxFailedAttempts = 5;
    private const string DefaultTemplate = "Ma xac minh Soopi: {code}. Ma het han sau 5 phut.";

    private readonly OtpStore store;
    private readonly IEmailSender emailSender;
    private readonly RateLimiter limiter;
    private readonly TimeProvider clock;
    private readonly ILogger<OtpService> logger;
    private readonly string template;

    public OtpService(OtpStore store, IEmailSender emailSender, RateLimiter limiter, TimeProvider clock, IConfiguration configuration, ILogger<OtpService> logger)
    {
        this.store = store;
        this.emailSender = emailSender;
        this.limiter = limiter;
        this.clock = clock;
        this.logger = logger;
        var configured = configuration["Email:OtpTemplate"];
        template = string.IsNullOrWhiteSpace(configured) ? DefaultTemplate : configured;
        if (!template.Contains("{code}", StringComparison.Ordinal))
            throw new InvalidOperationException("Email:OtpTemplate phải chứa {code}");
    }

    /// <summary>Chờ 60 giây mới gửi lại trong cùng một luồng; trần 5 mã/giờ tính chung mọi luồng.</summary>
    public async Task<OtpIssued> IssueAsync(string phone, OtpPurpose purpose, string email, string? clientIp)
    {
        limiter.Acquire("otp-phone:" + phone + ":" + purpose, 1, ResendAfter);
        limiter.Acquire("otp-phone-hour:" + phone, 5, TimeSpan.FromHours(1));
        var code = RandomNumberGenerator.GetInt32(1_000_000).ToString("D6");
        var now = clock.GetUtcNow();
        var id = await store.ReplaceAsync(phone, purpose.ToString(), email, Hash(code), now, now + Ttl, clientIp);
        try
        {
            await emailSender.SendAsync(email, template.Replace("{code}", code));
        }
        catch (EmailDeliveryException)
        {
            logger.LogWarning("Không gửi được OTP {Purpose} cho số {Phone}", purpose, Mask(phone));
            await store.ConsumeAsync(id, now);
            throw new DomainException(ErrorCode.OTP_SEND_FAILED);
        }
        return new OtpIssued((long)Ttl.TotalSeconds, (long)ResendAfter.TotalSeconds);
    }

    /// <summary>Sai mã, hết hạn, đã dùng hay sai quá số lần đều trả cùng một lỗi.</summary>
    public async Task ConsumeAsync(string phone, OtpPurpose purpose, string email, string? code)
    {
        var pending = await MatchAsync(phone, purpose, email, code);
        if (!await store.ConsumeAsync(pending.Id, clock.GetUtcNow())) throw new DomainException(ErrorCode.OTP_INVALID);
    }

    /// <summary>
    /// Kiểm mã mà không tiêu (web chỉ mở bước đặt mật khẩu khi mã đúng). Lần sai vẫn được đếm chung với ConsumeAsync nên
    /// tổng số lần thử của một mã vẫn tối đa 5.
    /// </summary>
    public Task VerifyAsync(string phone, OtpPurpose purpose, string email, string? code) => MatchAsync(phone, purpose, email, code);

    private async Task<PendingOtp> MatchAsync(string phone, OtpPurpose purpose, string email, string? code)
    {
        var pending = await store.LatestAsync(phone, purpose.ToString(), clock.GetUtcNow());
        if (pending is null || pending.FailedAttempts >= MaxFailedAttempts ||
            !string.Equals(pending.Email, email, StringComparison.OrdinalIgnoreCase)) throw new DomainException(ErrorCode.OTP_INVALID);
        var matches = code is not null
            && SixDigits().IsMatch(code)
            && CryptographicOperations.FixedTimeEquals(Encoding.ASCII.GetBytes(Hash(code)), Encoding.ASCII.GetBytes(pending.CodeHash.Trim()));
        if (!matches)
        {
            await store.RecordFailureAsync(pending.Id);
            throw new DomainException(ErrorCode.OTP_INVALID);
        }
        return pending;
    }

    private static string Hash(string code) => AuthService.Hash(code);

    private static string Mask(string phone) => phone.Length <= 4 ? "****" : new string('*', phone.Length - 4) + phone[^4..];

    [GeneratedRegex("^[0-9]{6}$")]
    private static partial Regex SixDigits();
}
