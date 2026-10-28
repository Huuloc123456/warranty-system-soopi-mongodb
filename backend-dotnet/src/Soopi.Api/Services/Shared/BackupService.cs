using System.IO.Compression;
using System.Text;
using MongoDB.Bson;
using MongoDB.Bson.IO;
using MongoDB.Driver;
using Soopi.Api.Data;
using Soopi.Api.Domain.Identity;
using Soopi.Api.Domain.Shared;
using Soopi.Api.Infrastructure.Security;

namespace Soopi.Api.Services.Shared;

public sealed record BackupFile(string FileName, byte[] Content, long Documents);

/// <summary>
/// Sao lưu dữ liệu tải từ trang quản trị: tệp zip gồm mỗi collection một mảng Extended JSON chuẩn (đúng định dạng
/// mongoimport --jsonArray, giữ kiểu Date/Decimal128/Int64), manifest.json và restore.js để nạp lại bằng mongosh vào database
/// mới. Không gồm bí mật: phiên đăng nhập, OTP, thiết bị push và hash mật khẩu. Sao lưu đầy đủ để chạy lại ứng dụng dùng
/// mongodump (database/backup/backup.ps1).
/// </summary>
public sealed class BackupService(AppDbContext db, CurrentActor actors, AuditService audit, TimeProvider clock)
{
    private static readonly HashSet<string> Excluded = ["refresh_tokens", "otp_codes", "push_devices"];
    private static readonly JsonWriterSettings Canonical = new() { OutputMode = JsonOutputMode.CanonicalExtendedJson };

    public async Task<BackupFile> CreateAsync()
    {
        var actor = actors.Require(Permission.ACCOUNT_MANAGE);
        if (!actor.Roles.Contains(Role.ADMIN)) throw new DomainException(ErrorCode.ACCESS_DENIED);
        var now = clock.GetUtcNow();
        var counts = new BsonDocument();
        long total = 0;
        using var memory = new MemoryStream();
        using (var zip = new ZipArchive(memory, ZipArchiveMode.Create, leaveOpen: true))
        {
            foreach (var name in MongoInitializer.Collections.Where(c => !Excluded.Contains(c)).Order(StringComparer.Ordinal))
            {
                var count = await WriteCollectionAsync(zip, name);
                counts.Add(name, count);
                total += count;
            }
            var manifest = new BsonDocument
            {
                { "database", db.Database.DatabaseNamespace.DatabaseName },
                { "createdAt", new BsonDateTime(now.UtcDateTime) },
                { "createdBy", actor.Username },
                { "format", "Canonical Extended JSON array per collection (mongoimport --jsonArray)" },
                { "excluded", new BsonArray(Excluded.Order(StringComparer.Ordinal)) },
                { "removedFields", new BsonArray { "accounts.passwordHash" } },
                { "documents", total },
                { "collections", counts },
            };
            await WriteTextAsync(zip, "manifest.json", manifest.ToJson(new JsonWriterSettings { OutputMode = JsonOutputMode.RelaxedExtendedJson, Indent = true }));
            await WriteTextAsync(zip, "restore.js", await RestoreScriptAsync());
        }
        await audit.RecordAsync(actor.AuditId, actor.DisplayName, actor.RoleNames, "DATABASE_BACKUP", "Tải bản sao lưu dữ liệu", "DATABASE",
            db.Database.DatabaseNamespace.DatabaseName, null, $"{total} document, {counts.ElementCount} collection");
        return new BackupFile($"soopi-backup-{now.ToOffset(DbTime.Offset):yyyyMMdd-HHmm}.zip", memory.ToArray(), total);
    }

    private async Task<long> WriteCollectionAsync(ZipArchive zip, string name)
    {
        var entry = zip.CreateEntry(name + ".json", CompressionLevel.Optimal);
        await using var writer = new StreamWriter(entry.Open(), new UTF8Encoding(false));
        await writer.WriteAsync('[');
        long count = 0;
        using var cursor = await db.Collection<BsonDocument>(name).Find(FilterDefinition<BsonDocument>.Empty)
            .Sort(Builders<BsonDocument>.Sort.Ascending("_id")).ToCursorAsync();
        while (await cursor.MoveNextAsync())
            foreach (var document in cursor.Current)
            {
                if (name == "accounts") document.Remove("passwordHash");
                await writer.WriteAsync((count++ == 0 ? "\n" : ",\n") + document.ToJson(Canonical));
            }
        await writer.WriteAsync("\n]\n");
        return count;
    }

    private static async Task WriteTextAsync(ZipArchive zip, string name, string text)
    {
        await using var writer = new StreamWriter(zip.CreateEntry(name, CompressionLevel.Optimal).Open(), new UTF8Encoding(false));
        await writer.WriteAsync(text);
    }

    private static async Task<string> RestoreScriptAsync()
    {
        await using var stream = typeof(BackupService).Assembly.GetManifestResourceStream("Soopi.Api.Resources.backup-restore.js")
            ?? throw new InvalidOperationException("Thiếu tài nguyên backup-restore.js");
        using var reader = new StreamReader(stream, Encoding.UTF8);
        return await reader.ReadToEndAsync();
    }
}
