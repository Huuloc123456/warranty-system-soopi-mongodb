using Soopi.Api.Data;
using Soopi.Api.Data.Entities;
using Soopi.Api.Data.Stores;
using Soopi.Api.Domain.Identity;
using Soopi.Api.Domain.Shared;
using Soopi.Api.Infrastructure.Security;
using Soopi.Api.Infrastructure.Validation;
using Soopi.Api.Services.Devices;
using Soopi.Api.Services.Files;
using Soopi.Api.Services.Shared;
using Soopi.Api.Services.WarrantyRequests;
using Soopi.Api.DTOs.Identity;
using Soopi.Api.Services.Identity;

namespace Soopi.Api.Services.Portal;

public sealed record LookupResult(string AccessToken, long ExpiresIn, string Scope, string Code);

public sealed record PortalDeviceType(string? Code, string? Name, string? IdentifierType);

public sealed record PortalCategory(string? Code, string? Name, IReadOnlyList<PortalDeviceType> DeviceTypes);

public sealed record PortalStation(string? Code, string? Name, string? Address);

public sealed record PortalCatalog(IReadOnlyList<PortalCategory> Categories, IReadOnlyList<string> IdentifierTypes, IReadOnlyList<PortalStation> Stations);

public sealed record RequestAttachment(string? FileId, string? FileName, string? ContentType, long Size);

/// <summary>Không có người xử lý nội bộ (POL-06); <c>ticketCode</c> chỉ có khi YC đã chuyển thành phiếu tiếp nhận.</summary>
public sealed record RequestView(
    string? Code, string? Status, DateTimeOffset? CreatedAt, string? CategoryCode, string? DeviceTypeCode, string? BrandModel,
    string? IdentifierType, string? SerialOrImei, string? Symptom, string? PreferredStation, DateTimeOffset? PreferredFrom,
    DateTimeOffset? PreferredTo, IReadOnlyList<RequestAttachment> Attachments, string? TicketCode, string? CancelReason)
{
    public static RequestView From(Dictionary<string, object?> value) =>
        new(
            value["_id"] as string, value["status"] as string, value["createdAt"] as DateTimeOffset?, value["categoryCode"] as string,
            value["deviceTypeCode"] as string, value["brandModel"] as string, value["identifierType"] as string,
            value["serialOrImei"] as string, value["symptom"] as string, value["preferredStation"] as string,
            value["preferredFrom"] as DateTimeOffset?, value["preferredTo"] as DateTimeOffset?,
            ((List<Dictionary<string, object?>>)value["attachments"]!)
                .Select(file => new RequestAttachment(file["fileId"] as string, file["fileName"] as string, file["contentType"] as string, (long)file["size"]!))
                .ToList(),
            value["convertedTicketId"] as string, value["cancelReason"] as string);
}

public sealed record RequestSummary(string? Code, string? Status, DateTimeOffset? CreatedAt, string? BrandModel, string? SerialOrImei, string? TicketCode);

public sealed record Profile(string CustomerCode, string FullName, string Phone, string? Email, string? Address, string Username, bool EmailVerified);

/// <summary>Không lộ phiếu, nhà phân phối hay điều khoản nội bộ của chính sách (POL-06).</summary>
public sealed record OwnedDevice(
    string Code, string? ProductName, string? BrandName, string IdentifierType, string SerialOrImei,
    DateOnly? WarrantyActivatedOn, DateOnly? WarrantyExpiresOn, string WarrantyStatus);

public sealed record CustomerData([property: NotBlank] string? FullName, [property: NotBlank] string? Phone, string? Email, string? Address);

public sealed record WarrantyRequestData(
    [property: NotNull] CustomerData? Customer,
    [property: NotBlank] string? CategoryCode,
    [property: NotBlank] string? DeviceTypeCode,
    [property: NotBlank] string? BrandModel,
    [property: NotBlank] string? IdentifierType,
    [property: NotBlank] string? SerialOrImei,
    [property: NotBlank, Size(0, 2000)] string? Symptom,
    [property: NotBlank] string? PreferredStation,
    DateTimeOffset? PreferredFrom,
    DateTimeOffset? PreferredTo);

/// <summary>Như WarrantyRequestData nhưng không có khối khách: lấy từ hồ sơ tài khoản.</summary>
public sealed record OwnWarrantyRequestData(
    [property: NotBlank] string? CategoryCode,
    [property: NotBlank] string? DeviceTypeCode,
    [property: NotBlank] string? BrandModel,
    [property: NotBlank] string? IdentifierType,
    [property: NotBlank] string? SerialOrImei,
    [property: NotBlank, Size(0, 2000)] string? Symptom,
    [property: NotBlank] string? PreferredStation,
    DateTimeOffset? PreferredFrom,
    DateTimeOffset? PreferredTo);

public sealed record ProfileUpdate([Email, Size(0, 100)] string? Email, [Size(0, 255)] string? Address);

/// <summary>
/// Khách chỉ thấy phiếu/yêu cầu của mình; portal token chỉ thấy đúng mã đã tra cứu. Ngoài phạm vi → 404 (POL-03).
/// </summary>
public sealed class PortalPolicy(AppDbContext db, CurrentActor actors)
{
    /// <summary>Yêu cầu có chủ sở hữu dùng mã khách; chỉ yêu cầu vãng lai mới dùng SĐT để xác định quyền.</summary>
    public async Task RequireRequestAsync(string code, string? requestCustomerId, string? requestPhone)
    {
        var byToken = actors.PortalGrant?.AllowsRequest(code) == true;
        var byAccount = CustomerAccount is { } customerId
            && await db.Customers.AnyAsync(c => c.Id == customerId && c.Status == CustomerStatus.ACTIVE)
            && (requestCustomerId is not null ? requestCustomerId == customerId
                : await db.Customers.AnyAsync(c => c.Id == customerId && c.Phone == requestPhone));
        if (!byToken && !byAccount) throw new DomainException(ErrorCode.NOT_FOUND);
    }

    /// <summary>Hồ sơ khách của tài khoản đang đăng nhập (đã lưu trữ/gộp thì coi như không còn quyền).</summary>
    public async Task<Customer> RequireCustomerAsync()
    {
        var customerId = CustomerAccount ?? throw new DomainException(ErrorCode.ACCESS_DENIED);
        return await db.Customers.FirstOrDefaultAsync(c => c.Id == customerId && c.Status == CustomerStatus.ACTIVE)
            ?? throw new DomainException(ErrorCode.ACCESS_DENIED);
    }

    public string RequireCustomerAccount() => CustomerAccount ?? throw new DomainException(ErrorCode.ACCESS_DENIED);

    private string? CustomerAccount => actors.Actor is { } actor && actor.Roles.Contains(Role.CUSTOMER) ? actor.CustomerId : null;
}

/// <summary>Tra cứu công khai bằng Mã + SĐT (mục 9.8, D-014) và danh mục cho form đăng ký yêu cầu.</summary>
public sealed class PortalAccessService(AppDbContext db, WarrantyRequestStore requests, CatalogStore catalog, JwtService tokens, RateLimiter limiter)
{
    /// <summary>Sai mã hay sai SĐT đều trả cùng một lỗi để không lộ phiếu nào tồn tại.</summary>
    public async Task<LookupResult> LookupAsync(string code, string phone, string? clientIp)
    {
        var normalizedCode = code.Trim().ToUpperInvariant();
        limiter.Acquire("portal-lookup-ip:" + clientIp, 5, TimeSpan.FromMinutes(1));
        limiter.Acquire("portal-lookup-code:" + normalizedCode, 10, TimeSpan.FromHours(1));
        var normalizedPhone = PhoneNumber.Normalize(phone);
        var grant = normalizedPhone.Length == 0 ? null : await GrantAsync(normalizedCode, normalizedPhone);
        if (grant is null) throw new DomainException(ErrorCode.PORTAL_NOT_FOUND);
        var (token, expiresIn) = tokens.IssuePortalToken(grant);
        return new LookupResult(token, (long)expiresIn.TotalSeconds, grant.Scope.ToString(), normalizedCode);
    }

    public async Task<PortalCatalog> CatalogAsync()
    {
        var categories = (await catalog.ListAsync("device_categories"))
            .Where(value => value["active"] is true)
            .OrderBy(value => value["sortOrder"] as int? ?? 0)
            .Select(value => new PortalCategory(
                value["_id"] as string,
                value["name"] as string,
                ((IEnumerable<object?>)value["deviceTypes"]!).OfType<Dictionary<string, object?>>()
                    .Select(type => new PortalDeviceType(type["code"] as string, type["name"] as string, type["identifierType"] as string))
                    .ToList()))
            .ToList();
        var stations = (await catalog.ListAsync("service_stations"))
            .Where(value => value["active"] is true)
            .Select(value => new PortalStation(value["_id"] as string, value["name"] as string, value["address"] as string))
            .ToList();
        return new PortalCatalog(categories, ["IMEI", "SERIAL"], stations);
    }

    private async Task<PortalGrant?> GrantAsync(string code, string phone)
    {
        if (code.StartsWith("TN-", StringComparison.Ordinal))
        {
            var ticket = await db.FirstAsync<Soopi.Api.Domain.Tickets.Ticket>("tickets", t => t.Id == code);
            var customer = ticket is null ? null : await db.Customers.FirstOrDefaultAsync(c => c.Id == ticket.CustomerId);
            return customer is not null && PhoneNumber.Normalize(customer.Phone) == phone ? new PortalGrant(PortalScope.TICKET, code) : null;
        }
        if (code.StartsWith("YC-", StringComparison.Ordinal))
        {
            var request = await requests.FindAsync(code);
            var linkedCustomerId = request?.GetValueOrDefault("customerId") as string;
            var linkedCustomer = linkedCustomerId is null ? null : await db.Customers.FirstOrDefaultAsync(c => c.Id == linkedCustomerId && c.Status == CustomerStatus.ACTIVE);
            var requestPhone = linkedCustomer is null && linkedCustomerId is null
                ? (request?["customer"] as Dictionary<string, object?>)?["phone"] as string : linkedCustomer?.Phone;
            return request is not null && PhoneNumber.Normalize(requestPhone) == phone
                ? new PortalGrant(PortalScope.REQUEST, code)
                : null;
        }
        return null;
    }
}

public sealed class PortalWarrantyRequestService(
    PortalPolicy policy, WarrantyRequestStore requests, WarrantyRequestSubmissionService submissions, RateLimiter limiter, CurrentActor actors)
{
    /// <summary>Tối đa 3 yêu cầu/giờ/IP (mục 11.2).</summary>
    public Task<string> SubmitAsync(WarrantyRequestData data, IReadOnlyList<Upload> uploads, string? clientIp)
    {
        limiter.Acquire("portal-warranty-request-ip:" + clientIp, 3, TimeSpan.FromHours(1));
        var customer = data.Customer!;
        return submissions.SubmitAsync(
            new SubmissionCommand(customer.FullName, customer.Phone, customer.Email, customer.Address, data.CategoryCode, data.DeviceTypeCode,
                data.BrandModel, data.IdentifierType, data.SerialOrImei, data.Symptom, data.PreferredStation, data.PreferredFrom, data.PreferredTo),
            uploads);
    }

    /// <summary>Cổng khách hàng: họ tên, SĐT, liên hệ lấy từ hồ sơ; giới hạn theo tài khoản vì thuê bao 4G dùng chung IP.</summary>
    public async Task<string> SubmitOwnAsync(OwnWarrantyRequestData data, IReadOnlyList<Upload> uploads)
    {
        actors.Require(Permission.PORTAL_SELF);
        var customer = await policy.RequireCustomerAsync();
        limiter.Acquire("portal-warranty-request-customer:" + customer.Id, 5, TimeSpan.FromHours(1));
        return await submissions.SubmitAsync(
            new SubmissionCommand(customer.FullName, customer.Phone, customer.Email, customer.Address, data.CategoryCode, data.DeviceTypeCode,
                data.BrandModel, data.IdentifierType, data.SerialOrImei, data.Symptom, data.PreferredStation, data.PreferredFrom, data.PreferredTo, customer.Id),
            uploads);
    }

    public async Task<List<RequestSummary>> MineAsync()
    {
        actors.Require(Permission.PORTAL_SELF);
        var customer = await policy.RequireCustomerAsync();
        return (await requests.FindByCustomerAsync(customer.Id, customer.Phone))
            .Select(value => new RequestSummary(value["_id"] as string, value["status"] as string, value["createdAt"] as DateTimeOffset?,
                value["brandModel"] as string, value["serialOrImei"] as string, value["convertedTicketId"] as string))
            .ToList();
    }

    public async Task<RequestView> GetAsync(string code)
    {
        actors.RequireOrPortal(Permission.PORTAL_SELF);
        var request = await requests.FindAsync(code) ?? throw new DomainException(ErrorCode.NOT_FOUND);
        await policy.RequireRequestAsync(code, request.GetValueOrDefault("customerId") as string,
            (request["customer"] as Dictionary<string, object?>)?["phone"] as string);
        return RequestView.From(request);
    }
}

/// <summary>
/// Hồ sơ và thiết bị của khách đang đăng nhập. Khách chỉ tự sửa email/địa chỉ; họ tên và SĐT (định danh đăng
/// nhập, đối chiếu phiếu) do quầy cập nhật.
/// </summary>
public sealed class PortalProfileService(
    AppDbContext db, PortalPolicy policy, DeviceService devices, TransactionRunner transactions, AuditService audit, CurrentActor actors,
    OtpService otp, AccountStore accounts, AuthService auth, SecurityVersionCache securityVersions, TimeProvider clock)
{
    public async Task<Profile> ProfileAsync()
    {
        var actor = actors.Require(Permission.PORTAL_SELF);
        return From(await policy.RequireCustomerAsync(), actor.Username);
    }

    /// <summary>null giữ nguyên, chuỗi rỗng xóa giá trị.</summary>
    public Task<Profile> UpdateContactAsync(ProfileUpdate body)
    {
        var actor = actors.Require(Permission.PORTAL_SELF);
        return transactions.InTransactionAsync(async () =>
        {
            var customer = await policy.RequireCustomerAsync();
            var before = Contact(customer);
            customer.UpdateContact(null, body.Email, body.Address);
            await db.SaveChangesAsync();
            if (before != Contact(customer))
                await audit.RecordAsync("KH:" + customer.Id, customer.FullName, ["CUSTOMER"], "CUSTOMER_CONTACT_UPDATED",
                    "Khách tự cập nhật liên hệ", "CUSTOMER", customer.Id, before, Contact(customer));
            return From(customer, actor.Username);
        });
    }

    public async Task<OtpIssued> RequestEmailOtpAsync(string rawEmail)
    {
        actors.Require(Permission.PORTAL_SELF);
        var customer = await policy.RequireCustomerAsync();
        var email = CustomerAccountService.RequireEmail(rawEmail);
        if (await accounts.FindByLoginAsync(email) is { } other && other.Id != customer.AccountId)
            throw new DomainException(ErrorCode.ACCOUNT_USERNAME_DUPLICATE);
        return await otp.IssueAsync(customer.Phone, OtpPurpose.VERIFY_EMAIL, email, actors.ClientIp);
    }

    public async Task<Profile> VerifyEmailAsync(string rawEmail, string code)
    {
        actors.Require(Permission.PORTAL_SELF);
        var customer = await policy.RequireCustomerAsync();
        var email = CustomerAccountService.RequireEmail(rawEmail);
        var account = await accounts.FindByIdAsync(customer.AccountId) ?? throw new DomainException(ErrorCode.CUSTOMER_ACCOUNT_NOT_FOUND);
        if (await accounts.FindByLoginAsync(email) is { } other && other.Id != account.Id)
            throw new DomainException(ErrorCode.ACCOUNT_USERNAME_DUPLICATE);
        await otp.ConsumeAsync(customer.Phone, OtpPurpose.VERIFY_EMAIL, email, code);
        var changed = account.Username != email;
        var result = await transactions.InTransactionAsync(async () =>
        {
            customer.VerifyEmail(email);
            if (changed)
            {
                account.ChangeUsername(email);
                await auth.RevokeAccountAsync(account.Id, clock.GetUtcNow());
            }
            await db.SaveChangesAsync();
            await audit.RecordAsync("KH:" + customer.Id, customer.FullName, ["CUSTOMER"], "CUSTOMER_EMAIL_VERIFIED",
                "Xác minh email", "CUSTOMER", customer.Id);
            return From(customer, account.Username);
        });
        if (changed) securityVersions.Evict(account.Id);
        return result;
    }

    public async Task<List<OwnedDevice>> DevicesAsync()
    {
        actors.Require(Permission.PORTAL_SELF);
        return (await devices.ListOwnedAsync())
            .Select(device => new OwnedDevice(device.Code, device.Product.GetValueOrDefault("name"), device.Product.GetValueOrDefault("brandName"),
                device.IdentifierType, device.SerialOrImei, device.WarrantyActivatedOn, device.WarrantyExpiresOn, device.Warranty.Status))
            .ToList();
    }

    private static string Contact(Customer customer) => $"Email: {customer.Email ?? "—"} — Địa chỉ: {customer.Address ?? "—"}";

    private static Profile From(Customer customer, string username) =>
        new(customer.Id, customer.FullName, customer.Phone, customer.Email, customer.Address, username, customer.VerifiedEmail is not null);
}
