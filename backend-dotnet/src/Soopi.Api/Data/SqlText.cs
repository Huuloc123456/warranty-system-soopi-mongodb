using System.Text.Json;

namespace Soopi.Api.Data;

/// <summary>Tiền VNĐ lưu DECIMAL(18,2); ứng dụng làm tròn tới đồng nên đọc ra dạng không phần lẻ (150000, không 150000.00).</summary>
public static class SqlMoney
{
    public static decimal Read(decimal value) => value / 1.0000000000000000000000000000m;

    public static decimal? Read(decimal? value) => value is null ? null : Read(value.Value);
}

/// <summary>Đọc/ghi các cột JSON (kỹ năng, checklist, kết quả QC).</summary>
public static class JsonText
{
    private static readonly JsonSerializerOptions Options = new(JsonSerializerDefaults.Web);

    public static string? Write(object? value) => value is null ? null : JsonSerializer.Serialize(value, Options);

    public static List<string> Strings(string? json) =>
        string.IsNullOrWhiteSpace(json) ? [] : JsonSerializer.Deserialize<List<string>>(json, Options) ?? [];

    public static List<Dictionary<string, JsonElement>> Objects(string? json) =>
        string.IsNullOrWhiteSpace(json) ? [] : JsonSerializer.Deserialize<List<Dictionary<string, JsonElement>>>(json, Options) ?? [];
}
