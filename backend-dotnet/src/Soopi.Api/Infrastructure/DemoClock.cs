using System.Globalization;

namespace Soopi.Api.Infrastructure;

/// <summary>
/// Chỉ dùng khi sinh dữ liệu demo (Development + <c>Demo:ClockOverride=true</c>): header <c>X-Demo-Now</c> đặt "thời điểm hiện tại"
/// cho request đó, để bộ sinh dữ liệu chạy đúng nghiệp vụ qua API nhưng với mốc thời gian trong quá khứ (mã phiếu theo ngày, SLA,
/// lịch sử trạng thái, phiếu thu…). Không có header (đăng nhập, job nền) thì là giờ thật. Không bao giờ đăng ký ở môi trường khác.
/// </summary>
public sealed class DemoClock(IHttpContextAccessor http) : TimeProvider
{
    public const string Header = "X-Demo-Now";

    public override DateTimeOffset GetUtcNow()
    {
        var value = http.HttpContext?.Request.Headers[Header].ToString();
        return !string.IsNullOrEmpty(value)
            && DateTimeOffset.TryParse(value, CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal, out var now)
                ? now.ToUniversalTime()
                : base.GetUtcNow();
    }
}
