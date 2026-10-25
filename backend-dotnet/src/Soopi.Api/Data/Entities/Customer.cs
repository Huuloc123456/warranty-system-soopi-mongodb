using Soopi.Api.Domain.Shared;

namespace Soopi.Api.Data.Entities;

public enum CustomerStatus
{
    ACTIVE,
    ARCHIVED,
    MERGED,
}

/// <summary>Bảng KhachHang. SĐT lưu dạng đã chuẩn hóa; UNIQUE chỉ áp cho hồ sơ đang hoạt động (filtered index).</summary>
public class Customer
{
    private Customer()
    {
    }

    public Customer(string id, string fullName, string phone, string? email, string? address, DateTimeOffset now)
    {
        Id = id;
        FullName = RequireText(fullName);
        Phone = PhoneNumber.Require(phone);
        Email = BlankToNull(email);
        Address = BlankToNull(address);
        Status = CustomerStatus.ACTIVE;
        CreatedAt = now;
    }

    public string Id { get; private set; } = "";

    public string FullName { get; private set; } = "";

    public string Phone { get; private set; } = "";

    public string? Email { get; private set; }

    /// <summary>Chỉ email đã nhận OTP mới được dùng để khôi phục mật khẩu.</summary>
    public string? VerifiedEmail { get; private set; }

    public string? Address { get; private set; }

    /// <summary>Tài khoản đăng nhập của khách (chiều ngược của TaiKhoan); chỉ luồng tài khoản khách ghi cột này.</summary>
    public long? AccountId { get; private set; }

    public CustomerStatus Status { get; private set; }

    public string? MergedInto { get; private set; }

    public DateTimeOffset CreatedAt { get; private set; }

    public void UpdateContact(string? phone, string? email, string? address)
    {
        if (phone is not null) Phone = PhoneNumber.Require(phone);
        if (email is not null)
        {
            var next = BlankToNull(email);
            if (!string.Equals(Email, next, StringComparison.OrdinalIgnoreCase)) VerifiedEmail = null;
            Email = next;
        }
        if (address is not null) Address = BlankToNull(address);
    }

    internal void LinkAccount(long? accountId) => AccountId = accountId;

    public void VerifyEmail(string email)
    {
        Email = email;
        VerifiedEmail = email;
    }

    public void Archive() => Status = CustomerStatus.ARCHIVED;

    public void MergeInto(string targetCode)
    {
        Status = CustomerStatus.MERGED;
        MergedInto = targetCode;
    }

    private static string RequireText(string? value) =>
        JavaText.IsBlank(value) ? throw new DomainException(ErrorCode.VALIDATION_FAILED) : JavaText.Trim(value);

    private static string? BlankToNull(string? value) => JavaText.IsBlank(value) ? null : JavaText.Trim(value);
}

/// <summary>Chỉ hai cột của NhanVien cần cho liên kết tài khoản; hồ sơ nhân viên đọc/ghi bằng SQL (EmployeeRecordStore).</summary>
public class EmployeeAccountLink
{
    public string Code { get; private set; } = "";

    public long? AccountId { get; private set; }
}
