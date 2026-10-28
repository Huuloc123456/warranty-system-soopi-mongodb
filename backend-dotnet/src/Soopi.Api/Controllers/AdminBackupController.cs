using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Soopi.Api.Services.Shared;

namespace Soopi.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/admin/backup")]
public sealed class AdminBackupController(BackupService backups) : ControllerBase
{
    /// <summary>Tải bản sao lưu dữ liệu (zip Extended JSON + manifest + restore.js). Chỉ quản trị viên.</summary>
    [HttpGet]
    public async Task<FileContentResult> Download()
    {
        var backup = await backups.CreateAsync();
        Response.Headers.CacheControl = "no-store";
        Response.Headers["X-Backup-Documents"] = backup.Documents.ToString(System.Globalization.CultureInfo.InvariantCulture);
        return File(backup.Content, "application/zip", backup.FileName);
    }
}
