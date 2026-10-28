using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MongoDB.Bson;
using MongoDB.Driver;
using Soopi.Api.Data;

namespace Soopi.Tests;

/// <summary>
/// Các nhánh bổ sung của luồng phiếu qua API thật, trên database kiểm thử riêng có dữ liệu demo: trả máy không sửa (giải phóng/nhập lại
/// linh kiện), điều chỉnh báo giá khi đang sửa, báo giá hết hạn.
/// </summary>
public sealed class TicketFlowGapTests : IAsyncLifetime
{
    private readonly string databaseName = "soopi_mongodb_test_api_" + Guid.NewGuid().ToString("N");
    private readonly Dictionary<string, string> tokens = [];
    private WebApplicationFactory<Program> factory = null!;
    private HttpClient client = null!;
    private int serial;

    public async Task InitializeAsync()
    {
        MongoMapping.Configure();
        factory = new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment("Development");
            builder.ConfigureAppConfiguration((_, config) => config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Mongo:Database"] = databaseName,
                ["Mongo:SeedDemo"] = "true",
            }));
        });
        client = factory.CreateClient();
        foreach (var user in new[] { "receptionist", "dispatcher", "technician", "warehouse", "cashier", "0900000001" })
        {
            var (status, body) = await SendAsync(null, HttpMethod.Post, "/api/v1/auth/login", new { username = user, password = "1234", remember = false });
            Assert.Equal(HttpStatusCode.OK, status);
            tokens[user] = body.GetProperty("accessToken").GetString()!;
        }
    }

    public async Task DisposeAsync()
    {
        Assert.StartsWith("soopi_mongodb_test_api_", databaseName);
        await factory.Services.GetRequiredService<MongoClient>().DropDatabaseAsync(databaseName);
        client.Dispose();
        await factory.DisposeAsync();
    }

    [Fact]
    public async Task ReturnWhileRepairing_RestocksIssuedParts_ThenHandsBackUnrepaired()
    {
        var code = await DiagnosedAsync(charged: false);
        var before = await PartAsync("LK-CABLE");
        await RequireAsync("technician", HttpMethod.Post, "/api/v1/stock-issues", new { ticketCode = code, lines = new[] { new { sku = "LK-CABLE", quantity = 1 } } }, HttpStatusCode.Created);
        var issue = await PendingIssueAsync(code);
        await RequireAsync("warehouse", HttpMethod.Post, $"/api/v1/stock-issues/{issue}/approve", new { lineBins = Array.Empty<object>() });
        Assert.Equal("REPAIRING", await StatusAsync(code));
        Assert.Equal(before.OnHand - 1, (await PartAsync("LK-CABLE")).OnHand);

        // Ca miễn phí đang sửa phát sinh thêm linh kiện → chờ linh kiện, kho xuất → tiếp tục sửa (lệnh sửa giữ "đang sửa").
        await RequireAsync("technician", HttpMethod.Post, "/api/v1/stock-issues", new { ticketCode = code, lines = new[] { new { sku = "LK-CABLE", quantity = 1 } } }, HttpStatusCode.Created);
        Assert.Equal("AWAITING_PARTS", await StatusAsync(code));
        await RequireAsync("warehouse", HttpMethod.Post, $"/api/v1/stock-issues/{await PendingIssueAsync(code)}/approve", new { lineBins = Array.Empty<object>() });
        Assert.Equal("REPAIRING", await StatusAsync(code));
        Assert.Equal(before.OnHand - 2, (await PartAsync("LK-CABLE")).OnHand);

        var (blank, blankBody) = await SendAsync("technician", HttpMethod.Post, $"/api/v1/tickets/{code}/return", new { reason = " " });
        Assert.Equal(HttpStatusCode.BadRequest, blank);
        Assert.Equal("VALIDATION_FAILED", blankBody.GetProperty("code").GetString());

        var returned = await RequireAsync("technician", HttpMethod.Post, $"/api/v1/tickets/{code}/return", new { reason = "Hư bo mạch, không sửa được" });
        Assert.Equal("AWAITING_RETURN", returned.GetProperty("status").GetString());
        var after = await PartAsync("LK-CABLE");
        Assert.Equal(before.OnHand, after.OnHand);
        Assert.Equal(before.Reserved, after.Reserved);
        Assert.All(await IssueStatusesAsync(code), status => Assert.Equal("RETURNED", status));

        var form = new MultipartFormDataContent { { new StringContent(JsonSerializer.Serialize(new { receiverName = "Khách", conditionOnReturn = "Như lúc nhận" }), Encoding.UTF8, "application/json"), "data" } };
        var handover = await RequireAsync("cashier", HttpMethod.Post, $"/api/v1/tickets/{code}/handover", form);
        Assert.Equal("RETURNED_UNREPAIRED", handover.GetProperty("status").GetString());
    }

    [Fact]
    public async Task ReturnWhileAwaitingParts_CancelsPendingIssueAndReleasesReservation()
    {
        var code = await DiagnosedAsync(charged: false);
        var before = await PartAsync("LK-CABLE");
        await RequireAsync("technician", HttpMethod.Post, "/api/v1/stock-issues", new { ticketCode = code, lines = new[] { new { sku = "LK-CABLE", quantity = 2 } } }, HttpStatusCode.Created);
        Assert.Equal(before.Reserved + 2, (await PartAsync("LK-CABLE")).Reserved);

        await RequireAsync("dispatcher", HttpMethod.Post, $"/api/v1/tickets/{code}/return", new { reason = "Khách đổi ý" });
        Assert.Equal("AWAITING_RETURN", await StatusAsync(code));
        Assert.Equal(before.Reserved, (await PartAsync("LK-CABLE")).Reserved);
        Assert.Equal(["CANCELLED"], await IssueStatusesAsync(code));
    }

    [Fact]
    public async Task ReturnRules_ByRoleAndState()
    {
        var received = await ReceivedAsync(charged: false);
        // KTV không trả máy phiếu chưa vào khâu kỹ thuật; lễ tân thì được (khách đổi ý tại quầy).
        Assert.Equal("RETURN_NOT_ALLOWED", await ErrorAsync("technician", HttpMethod.Post, $"/api/v1/tickets/{received}/return", new { reason = "x" }, HttpStatusCode.Conflict));
        await RequireAsync("receptionist", HttpMethod.Post, $"/api/v1/tickets/{received}/return", new { reason = "Khách đổi ý" });
        Assert.Equal("AWAITING_RETURN", await StatusAsync(received));
        Assert.Equal("RETURN_NOT_ALLOWED", await ErrorAsync("dispatcher", HttpMethod.Post, $"/api/v1/tickets/{received}/return", new { reason = "x" }, HttpStatusCode.Conflict));
        // Thu ngân không có quyền.
        var (status, _) = await SendAsync("cashier", HttpMethod.Post, $"/api/v1/tickets/{await ReceivedAsync(charged: false)}/return", new { reason = "x" });
        Assert.Equal(HttpStatusCode.Forbidden, status);
    }

    [Fact]
    public async Task ReturnWhileQuoteAwaitingApproval_CancelsQuotation()
    {
        var code = await DiagnosedAsync(charged: true);
        var quote = await QuoteAsync(code, new { vatRate = 10, lines = new[] { new { description = "Công", quantity = 1, unitPrice = 0, laborFee = 100000 } } });
        await RequireAsync("dispatcher", HttpMethod.Post, $"/api/v1/tickets/{code}/return", new { reason = "Khách lấy máy về" });
        Assert.Equal("CANCELLED", (await QuotationAsync(quote)).GetProperty("approval").GetProperty("status").GetString());
        Assert.Equal(JsonValueKind.Null, (await TicketAsync(code)).GetProperty("activeQuotationCode").ValueKind);
    }

    [Fact]
    public async Task QuotationRevision_WhileRepairing_RejectRestoresOld_AcceptIssuesOnlyDifference()
    {
        var code = await DiagnosedAsync(charged: true);
        var first = await QuoteAsync(code, new { vatRate = 10, lines = new[] { new { sku = "LK-PIN", quantity = 1, laborFee = 100000 } } });
        await RequireAsync("dispatcher", HttpMethod.Post, $"/api/v1/quotations/{first}/approve", new { });
        await RequireAsync("0900000001", HttpMethod.Post, $"/api/v1/portal/tickets/{code}/quotation-decision", new { decision = "ACCEPT" });
        Assert.Equal("AWAITING_PARTS", await StatusAsync(code));
        await RequireAsync("technician", HttpMethod.Post, "/api/v1/stock-issues", new { ticketCode = code, quotationCode = first }, HttpStatusCode.Created);
        await RequireAsync("warehouse", HttpMethod.Post, $"/api/v1/stock-issues/{await PendingIssueAsync(code)}/approve", new { lineBins = Array.Empty<object>() });
        Assert.Equal("REPAIRING", await StatusAsync(code));

        var revisedLines = new { vatRate = 10, lines = new object[] { new { sku = "LK-PIN", quantity = 1, laborFee = 100000 }, new { sku = "LK-CABLE", quantity = 1, laborFee = 50000 } } };
        var rejected = (await RequireAsync("technician", HttpMethod.Post, $"/api/v1/tickets/{code}/quotations/revision", revisedLines, HttpStatusCode.Created)).GetProperty("code").GetString()!;
        Assert.Equal("AWAITING_QUOTE_APPROVAL", await StatusAsync(code));
        Assert.Equal("SUPERSEDED", (await QuotationAsync(first)).GetProperty("approval").GetProperty("status").GetString());
        // Đang chờ duyệt điều chỉnh thì không ghi kết quả sửa được.
        Assert.Equal("REPAIR_ORDER_INVALID_STATE", await ErrorAsync("technician", HttpMethod.Post, $"/api/v1/tickets/{code}/repair/results", PassingQc(), HttpStatusCode.Conflict));

        await RequireAsync("dispatcher", HttpMethod.Post, $"/api/v1/quotations/{rejected}/reject", new { note = "Xem lại giá" });
        Assert.Equal("REPAIRING", await StatusAsync(code));
        Assert.Equal("APPROVED", (await QuotationAsync(first)).GetProperty("approval").GetProperty("status").GetString());
        Assert.Equal(first, (await TicketAsync(code)).GetProperty("activeQuotationCode").GetString());

        var revised = (await RequireAsync("technician", HttpMethod.Post, $"/api/v1/tickets/{code}/quotations/revision", revisedLines, HttpStatusCode.Created)).GetProperty("code").GetString()!;
        Assert.Equal(first, (await QuotationAsync(revised)).GetProperty("revisionOf").GetString());
        await RequireAsync("dispatcher", HttpMethod.Post, $"/api/v1/quotations/{revised}/approve", new { });
        await RequireAsync("receptionist", HttpMethod.Post, $"/api/v1/quotations/{revised}/customer-decision", new { decision = "ACCEPT" });
        Assert.Equal("AWAITING_PARTS", await StatusAsync(code));
        var pin = await PartAsync("LK-PIN");
        await RequireAsync("technician", HttpMethod.Post, "/api/v1/stock-issues", new { ticketCode = code, quotationCode = revised }, HttpStatusCode.Created);
        var issue = await PendingIssueAsync(code);
        var lines = (await IssueAsync(issue)).GetProperty("lines").EnumerateArray().Select(l => (l.GetProperty("sku").GetString(), l.GetProperty("quantity").GetInt32())).ToList();
        Assert.Equal([("LK-CABLE", 1)], lines);
        await RequireAsync("warehouse", HttpMethod.Post, $"/api/v1/stock-issues/{issue}/approve", new { lineBins = Array.Empty<object>() });
        Assert.Equal(pin.OnHand, (await PartAsync("LK-PIN")).OnHand);
        Assert.Equal("REPAIRING", await StatusAsync(code));

        await RequireAsync("technician", HttpMethod.Post, $"/api/v1/tickets/{code}/repair/results", PassingQc());
        var billing = await RequireAsync("cashier", HttpMethod.Get, $"/api/v1/tickets/{code}/billing", null);
        Assert.Equal(revised, billing.GetProperty("quotationCode").GetString());
        Assert.Equal((await QuotationAsync(revised)).GetProperty("grandTotal").GetDecimal(), billing.GetProperty("total").GetDecimal());
        await RequireAsync("cashier", HttpMethod.Post, $"/api/v1/tickets/{code}/payments", new { payerName = "Khách", method = "CASH", expectedAmount = billing.GetProperty("total").GetDecimal() }, HttpStatusCode.Created);
    }

    [Fact]
    public async Task QuotationRevision_DeclinedByCustomer_ReturnsIssuedPartsToStock()
    {
        var code = await DiagnosedAsync(charged: true);
        var first = await QuoteAsync(code, new { vatRate = 0, lines = new[] { new { sku = "LK-PIN", quantity = 1, laborFee = 0 } } });
        await RequireAsync("dispatcher", HttpMethod.Post, $"/api/v1/quotations/{first}/approve", new { });
        var pin = await PartAsync("LK-PIN");
        await RequireAsync("0900000001", HttpMethod.Post, $"/api/v1/portal/tickets/{code}/quotation-decision", new { decision = "ACCEPT" });
        await RequireAsync("technician", HttpMethod.Post, "/api/v1/stock-issues", new { ticketCode = code, quotationCode = first }, HttpStatusCode.Created);
        await RequireAsync("warehouse", HttpMethod.Post, $"/api/v1/stock-issues/{await PendingIssueAsync(code)}/approve", new { lineBins = Array.Empty<object>() });
        var revised = (await RequireAsync("technician", HttpMethod.Post, $"/api/v1/tickets/{code}/quotations/revision",
            new { vatRate = 0, lines = new[] { new { sku = "LK-PIN", quantity = 2, laborFee = 0 } } }, HttpStatusCode.Created)).GetProperty("code").GetString()!;
        await RequireAsync("dispatcher", HttpMethod.Post, $"/api/v1/quotations/{revised}/approve", new { });
        await RequireAsync("0900000001", HttpMethod.Post, $"/api/v1/portal/tickets/{code}/quotation-decision", new { decision = "DECLINE", reason = "Đắt" });
        Assert.Equal("AWAITING_RETURN", await StatusAsync(code));
        Assert.Equal(pin.OnHand, (await PartAsync("LK-PIN")).OnHand);
        Assert.Equal(["RETURNED"], await IssueStatusesAsync(code));
    }

    [Fact]
    public async Task ExpiredQuotation_CanBeRequoted()
    {
        var code = await DiagnosedAsync(charged: true);
        var quote = await QuoteAsync(code, new { vatRate = 10, validUntil = DateTime.Now.ToString("yyyy-MM-dd"), lines = new[] { new { description = "Công", quantity = 1, unitPrice = 0, laborFee = 100000 } } });
        await RequireAsync("dispatcher", HttpMethod.Post, $"/api/v1/quotations/{quote}/approve", new { });
        Assert.Equal("QUOTE_NOT_EXPIRED", await ErrorAsync("technician", HttpMethod.Post, $"/api/v1/quotations/{quote}/expire", null, HttpStatusCode.UnprocessableEntity));

        var quotations = factory.Services.GetRequiredService<MongoClient>().GetDatabase(databaseName).GetCollection<BsonDocument>("quotations");
        await quotations.UpdateOneAsync(new BsonDocument("_id", quote), new BsonDocument("$set", new BsonDocument("validUntil", DateTime.Now.AddDays(-2).ToString("yyyy-MM-dd"))));
        Assert.Equal("QUOTE_EXPIRED", await ErrorAsync("0900000001", HttpMethod.Post, $"/api/v1/portal/tickets/{code}/quotation-decision", new { decision = "ACCEPT" }, HttpStatusCode.UnprocessableEntity));

        await RequireAsync("dispatcher", HttpMethod.Post, $"/api/v1/quotations/{quote}/expire", null);
        Assert.Equal("DIAGNOSED", await StatusAsync(code));
        Assert.Equal("EXPIRED", (await QuotationAsync(quote)).GetProperty("approval").GetProperty("status").GetString());
        await QuoteAsync(code, new { vatRate = 10, lines = new[] { new { description = "Công", quantity = 1, unitPrice = 0, laborFee = 120000 } } });
        Assert.Equal("AWAITING_QUOTE_APPROVAL", await StatusAsync(code));
    }

    [Fact]
    public async Task ZeroTotalAcceptedQuotation_IsCollectedNotFree()
    {
        var code = await DiagnosedAsync(charged: true);
        var quote = await QuoteAsync(code, new { vatRate = 0, lines = new[] { new { description = "Kiểm tra, không thu phí", quantity = 1, unitPrice = 0, laborFee = 0 } } });
        await RequireAsync("dispatcher", HttpMethod.Post, $"/api/v1/quotations/{quote}/approve", new { });
        await RequireAsync("0900000001", HttpMethod.Post, $"/api/v1/portal/tickets/{code}/quotation-decision", new { decision = "ACCEPT" });
        await RequireAsync("technician", HttpMethod.Post, $"/api/v1/tickets/{code}/repair/results", PassingQc());
        var billing = await RequireAsync("cashier", HttpMethod.Get, $"/api/v1/tickets/{code}/billing", null);
        // Màn thu ngân chọn luồng theo quotationCode (không theo total = 0).
        Assert.Equal(quote, billing.GetProperty("quotationCode").GetString());
        Assert.Equal(0m, billing.GetProperty("total").GetDecimal());
        await RequireAsync("cashier", HttpMethod.Post, $"/api/v1/tickets/{code}/payments", new { payerName = "Khách", method = "CASH", expectedAmount = 0 }, HttpStatusCode.Created);
    }

    [Fact]
    public async Task AdminBackup_IsZipOfExtendedJsonWithManifest_WithoutSecrets()
    {
        await login("admin");
        using var request = new HttpRequestMessage(HttpMethod.Get, "/api/v1/admin/backup");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", tokens["admin"]);
        using var response = await client.SendAsync(request);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("application/zip", response.Content.Headers.ContentType!.MediaType);
        using var zip = new System.IO.Compression.ZipArchive(await response.Content.ReadAsStreamAsync());
        var manifest = JsonDocument.Parse(new StreamReader(zip.GetEntry("manifest.json")!.Open()).ReadToEnd()).RootElement;
        Assert.NotNull(zip.GetEntry("restore.js"));
        Assert.Null(zip.GetEntry("refresh_tokens.json"));
        long total = 0;
        foreach (var collection in manifest.GetProperty("collections").EnumerateObject())
        {
            var array = JsonDocument.Parse(new StreamReader(zip.GetEntry(collection.Name + ".json")!.Open()).ReadToEnd()).RootElement;
            Assert.Equal(collection.Value.GetInt64(), array.GetArrayLength());
            total += array.GetArrayLength();
        }
        Assert.Equal(manifest.GetProperty("documents").GetInt64(), total);
        var accounts = new StreamReader(zip.GetEntry("accounts.json")!.Open()).ReadToEnd();
        Assert.DoesNotContain("passwordHash", accounts);
        Assert.Contains("$date", new StreamReader(zip.GetEntry("customers.json")!.Open()).ReadToEnd());

        var (status, _) = await SendAsync("receptionist", HttpMethod.Get, "/api/v1/admin/backup", null);
        Assert.Equal(HttpStatusCode.Forbidden, status);
    }

    private async Task login(string user) => tokens[user] = tokens.TryGetValue(user, out var t) ? t
        : (await SendAsync(null, HttpMethod.Post, "/api/v1/auth/login", new { username = user, password = "1234", remember = false })).Body.GetProperty("accessToken").GetString()!;

    private static object PassingQc() => new
    {
        workDone = "Đã sửa",
        qcSteps = new[] { "VISUAL", "MAIN_FUNCTION", "SECONDARY", "POWER_CHARGING", "DATA", "FINAL" }.Select(step => new { step, result = "PASS" }),
        qcResult = "PASS",
    };

    private async Task<string> ReceivedAsync(bool charged)
    {
        var today = DateTime.Now.ToString("yyyy-MM-dd");
        var device = await RequireAsync("receptionist", HttpMethod.Post, "/api/v1/devices", new
        {
            customerCode = "KH-000001", productId = "SP-0003", identifierType = "SERIAL", serialOrImei = $"GAP-{Guid.NewGuid():N}"[..20] + serial++,
            warrantyActivatedOn = charged ? "2020-01-01" : today, warrantyExpiresOn = charged ? "2021-01-01" : "2030-01-01",
        }, HttpStatusCode.Created);
        var ticket = await RequireAsync("receptionist", HttpMethod.Post, "/api/v1/tickets", new
        {
            customer = new { code = "KH-000001" }, device = new { code = device.GetProperty("code").GetString() }, cosmetic = new { customerAcknowledged = true },
            reportedIssue = "Không lên nguồn", estimatedCost = 0,
        }, HttpStatusCode.Created);
        return ticket.GetProperty("code").GetString()!;
    }

    private async Task<string> DiagnosedAsync(bool charged)
    {
        var code = await ReceivedAsync(charged);
        await RequireAsync("dispatcher", HttpMethod.Post, $"/api/v1/tickets/{code}/assignment", new { technicianId = "NV-004" });
        await RequireAsync("technician", HttpMethod.Post, $"/api/v1/tickets/{code}/inspection", new
        {
            findings = "Hỏng nguồn", checklist = Array.Empty<object>(), waterDamage = false,
            classification = charged ? "OUT_OF_WARRANTY" : "FREE_WARRANTY", outOfWarrantyReason = charged ? "Hết hạn" : null,
        });
        return code;
    }

    private async Task<string> QuoteAsync(string ticket, object body) =>
        (await RequireAsync("technician", HttpMethod.Post, $"/api/v1/tickets/{ticket}/quotations", body, HttpStatusCode.Created)).GetProperty("code").GetString()!;

    private Task<JsonElement> TicketAsync(string code) => RequireAsync("dispatcher", HttpMethod.Get, $"/api/v1/tickets/{code}", null);

    private async Task<string> StatusAsync(string code) => (await TicketAsync(code)).GetProperty("status").GetString()!;

    private Task<JsonElement> QuotationAsync(string code) => RequireAsync("dispatcher", HttpMethod.Get, $"/api/v1/quotations/{code}", null);

    private async Task<(int OnHand, int Reserved)> PartAsync(string sku)
    {
        var part = await RequireAsync("warehouse", HttpMethod.Get, $"/api/v1/parts/{sku}", null);
        return (part.GetProperty("onHand").GetInt32(), part.GetProperty("reserved").GetInt32());
    }

    private async Task<List<JsonElement>> IssuesAsync(string ticket) =>
        (await RequireAsync("warehouse", HttpMethod.Get, "/api/v1/stock-issues", null)).EnumerateArray().Where(i => i.GetProperty("ticketCode").GetString() == ticket).ToList();

    private async Task<string> PendingIssueAsync(string ticket) =>
        (await IssuesAsync(ticket)).Single(i => i.GetProperty("status").GetString() == "PENDING").GetProperty("code").GetString()!;

    private async Task<JsonElement> IssueAsync(string code) => (await RequireAsync("warehouse", HttpMethod.Get, "/api/v1/stock-issues", null))
        .EnumerateArray().Single(i => i.GetProperty("code").GetString() == code);

    private async Task<List<string>> IssueStatusesAsync(string ticket) => (await IssuesAsync(ticket)).Select(i => i.GetProperty("status").GetString()!).ToList();

    private async Task<string> ErrorAsync(string user, HttpMethod method, string path, object? body, HttpStatusCode expected)
    {
        var (status, value) = await SendAsync(user, method, path, body);
        Assert.True(status == expected, $"{method} {path}: {(int)status} {value}");
        return value.GetProperty("code").GetString()!;
    }

    private async Task<JsonElement> RequireAsync(string user, HttpMethod method, string path, object? body, HttpStatusCode expected = HttpStatusCode.OK)
    {
        var (status, value) = await SendAsync(user, method, path, body);
        Assert.True(status == expected, $"{method} {path}: {(int)status} {value}");
        return value;
    }

    private async Task<(HttpStatusCode Status, JsonElement Body)> SendAsync(string? user, HttpMethod method, string path, object? body)
    {
        using var request = new HttpRequestMessage(method, path)
        {
            Content = body switch
            {
                null => null,
                HttpContent content => content,
                _ => new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json"),
            },
        };
        request.Headers.Add("X-Requested-With", "fetch");
        if (user is not null) request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", tokens[user]);
        using var response = await client.SendAsync(request);
        var text = await response.Content.ReadAsStringAsync();
        return (response.StatusCode, text.Length == 0 ? default : JsonDocument.Parse(text).RootElement.Clone());
    }
}
