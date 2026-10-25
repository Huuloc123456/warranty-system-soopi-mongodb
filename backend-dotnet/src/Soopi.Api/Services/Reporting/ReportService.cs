using MongoDB.Driver;
using Soopi.Api.Data;
using Soopi.Api.Data.Entities;
using Soopi.Api.Data.Stores;
using Soopi.Api.Domain.Quotations;
using Soopi.Api.Domain.Identity;
using Soopi.Api.Domain.Shared;
using Soopi.Api.Domain.Tickets;
using Soopi.Api.DTOs.Shared;
using Soopi.Api.Infrastructure.Security;

namespace Soopi.Api.Services.Reporting;

public sealed record MonthlyRevenue(string Month, long Payments, decimal Total);

public sealed record TechnicianPerformance(
    string EmployeeId, string FullName, string? Specialty, long Assigned, long Completed, long Cancelled, decimal? AvgRating, decimal? FirstPassQcRate,
    decimal? AvgRepairHours);

public sealed record CategoryTurnaround(string CategoryCode, long Delivered, decimal? AvgHours);

public sealed record Turnaround(long Delivered, decimal? AvgHours, long? MinHours, long? MaxHours, IReadOnlyList<CategoryTurnaround> ByCategory);

public sealed record WarrantyRatio(long FreeWarranty, long Charged, decimal? FreeRatePercent);

public sealed record RepeatRepair(string TicketCode, string RepairOrderCode, string TechnicianId, string? TechnicianName, long Attempts, long FailedQc,
    DateTimeOffset? LastRecordedAt);

public sealed record QuotationMismatch(string QuotationCode, decimal PartsTotal, decimal LaborTotal, decimal GrandTotal, decimal PartsFromLines,
    decimal LaborFromLines, decimal ExpectedGrandTotal);

public sealed record StatusCount(string Status, long Count);

public sealed record SlaBucket(string Level, long Breached, long AtRisk, long OnTrack);

public sealed record CustomerReviewRow(string TicketCode, string CustomerCode, string FullName, string Phone,
    string? ProductName, string StationCode, string StationName, int Rating, string? Comment, DateTimeOffset? RatedAt);

public sealed record CustomerReviewReport(PageResponse<CustomerReviewRow> Reviews, long CustomerReviewCount, decimal? AverageRating, long LegacyCount);

/// <summary>
/// Báo cáo mục 14 (R4–R12). Khoảng ngày theo giờ Việt Nam, gồm cả hai đầu; trạm tùy chọn. Số giờ = số giây / 3600 làm tròn
/// xuống (như TIMESTAMPDIFF(HOUR) của bản MySQL), không dùng DATEDIFF(HOUR) vì hàm đó đếm số lần qua mốc giờ.
/// </summary>
public sealed class ReportService(AppDbContext db, CurrentActor actors, TimeProvider clock, IConfiguration configuration)
{
    private sealed record Range(DateTimeOffset? From, DateTimeOffset? To, string? Station);

    public async Task<CustomerReviewReport> CustomerReviewsAsync(DateOnly? from, DateOnly? to, string? station, int? rating, string? query, int page, int size)
    {
        if (!actors.Require(Permission.REPORT_SYSTEM).Roles.Contains(Role.ADMIN)) throw new DomainException(ErrorCode.ACCESS_DENIED);
        new PageRequestParams(page, size, null).Validate();
        if (rating is < 1 or > 5 || query?.Length > 100 || page > int.MaxValue / size || to == DateOnly.MaxValue)
            throw new DomainException(ErrorCode.VALIDATION_FAILED);
        var range = RangeOf(from, to, station);
        var tickets = (await TicketsAsync("handover.ratedAt", range))
            .Where(t => t.Status is TicketStatus.DELIVERED or TicketStatus.RETURNED_UNREPAIRED && t.Handover?.Rating is not null)
            .Where(t => rating is null || t.Handover!.Rating == rating)
            .ToList();
        var customerIds = tickets.Select(t => t.CustomerId).Distinct().ToList();
        var customers = (await db.Customers.Where(c => customerIds.Contains(c.Id)).ToListAsync()).ToDictionary(c => c.Id);
        var stations = (await new MongoDocuments(db).ListAsync("service_stations")).ToDictionary(s => s["_id"].AsString, s => s.GetValue("name", s["_id"]).AsString);
        if (!string.IsNullOrWhiteSpace(query))
        {
            var needle = query.Trim();
            tickets = tickets.Where(t => t.Id.Contains(needle, StringComparison.OrdinalIgnoreCase)
                || customers.TryGetValue(t.CustomerId, out var c) && (c.FullName.Contains(needle, StringComparison.OrdinalIgnoreCase)
                    || c.Phone.Contains(needle, StringComparison.OrdinalIgnoreCase))).ToList();
        }
        var ordered = tickets.OrderByDescending(t => t.Handover!.RatedAt).ThenByDescending(t => t.Id, StringComparer.Ordinal).ToList();
        var customerReviews = ordered.Where(t => t.Handover!.RatedAt is not null).ToList();
        var rows = ordered.Skip(page * size).Take(size).Select(t =>
        {
            customers.TryGetValue(t.CustomerId, out var customer);
            return new CustomerReviewRow(t.Id, t.CustomerId, customer?.FullName ?? t.CustomerSnapshot.GetValueOrDefault("fullName", ""),
                customer?.Phone ?? t.CustomerSnapshot.GetValueOrDefault("phone", ""), t.DeviceSnapshot.GetValueOrDefault("productName"),
                t.StationCode, stations.GetValueOrDefault(t.StationCode, t.StationCode), t.Handover!.Rating!.Value,
                t.Handover.RatingComment, t.Handover.RatedAt);
        }).ToList();
        return new CustomerReviewReport(PageResponse<CustomerReviewRow>.Of(rows, page, size, ordered.Count), customerReviews.Count,
            customerReviews.Count == 0 ? null : Scaled(customerReviews.Average(t => (decimal)t.Handover!.Rating!.Value), 2),
            ordered.Count - customerReviews.Count);
    }

    public async Task<byte[]> ExportAsync(DateOnly from, DateOnly to, string? station)
    {
        actors.Require(Permission.REPORT_SYSTEM);
        actors.Require(Permission.REPORT_OPERATIONS);
        if (to == DateOnly.MaxValue) throw new DomainException(ErrorCode.VALIDATION_FAILED);
        RangeOf(from, to, station);
        var revenue = await RevenueMonthlyAsync(from, to, station);
        var statuses = await TicketsByStatusAsync(from, to, station);
        var turnaround = await TurnaroundAsync(from, to, station);
        var technicians = await TechnicianPerformanceAsync(from, to, station);
        var warranty = await WarrantyRatioAsync(from, to, station);
        return ReportWorkbook.Create(from, to, station, clock.GetUtcNow(), new(revenue, statuses, turnaround, technicians, warranty));
    }
    public async Task<List<MonthlyRevenue>> RevenueMonthlyAsync(DateOnly? from, DateOnly? to, string? station)
    {
        actors.Require(Permission.REPORT_SYSTEM);
        var range = RangeOf(from, to, station);
        var filter = Builders<Payment>.Filter.Eq(p => p.Type, "CHARGED");
        if (range.From is { } f) filter &= Builders<Payment>.Filter.Gte(p => p.PaidAt, f);
        if (range.To is { } t) filter &= Builders<Payment>.Filter.Lt(p => p.PaidAt, t);
        if (range.Station is { } st)
        {
            var codes = (await db.ListAsync<Ticket>("tickets", t => t.StationCode == st)).Select(t => t.Id).ToList();
            filter &= Builders<Payment>.Filter.In(p => p.TicketId, codes);
        }
        var payments = await db.Find<Payment>("payments", filter).ToListAsync();
        return payments.GroupBy(p => p.PaidAt.ToOffset(DbTime.Offset).ToString("yyyy-MM")).OrderByDescending(g => g.Key).Select(g => new MonthlyRevenue(g.Key, g.LongCount(), g.Sum(p => p.Amount))).ToList();
    }
    public async Task<List<TechnicianPerformance>> TechnicianPerformanceAsync(DateOnly? from, DateOnly? to, string? station)
    {
        actors.Require(Permission.REPORT_OPERATIONS);
        var items = await TicketsAsync("receivedAt", RangeOf(from, to, station));
        var employees = (await db.ListAsync<EmployeeRecord>("employees", e => true)).ToDictionary(e => e.Code);
        var accounts = await db.Accounts.Where(a => a.RoleRows.Any(r => r.Role == Role.TECHNICIAN)).ToListAsync();
        var ids = accounts.Select(a => a.Id).ToHashSet();
        var result = new List<TechnicianPerformance>();
        foreach (var group in items.Where(t => t.RepairOrder is not null).GroupBy(t => t.RepairOrder!.TechnicianId))
        {
            if (!employees.TryGetValue(group.Key, out var employee) || employee.AccountId is null || !ids.Contains(employee.AccountId.Value)) continue;
            var done = group.Where(t => t.RepairOrder!.Status == "DONE").ToList();
            var ratings = done.Where(t => t.Handover?.Rating is not null).Select(t => (decimal)t.Handover!.Rating!.Value).ToList();
            var hours = done.Where(t => t.RepairOrder!.StartedAt is not null && t.RepairOrder.Results.Any(r => r.QcResult == "PASS")).Select(t => Hours(t.RepairOrder!.StartedAt!.Value, t.RepairOrder.Results.Where(r => r.QcResult == "PASS").Max(r => r.RecordedAt))).ToList();
            result.Add(new TechnicianPerformance(group.Key, employee.FullName, employee.Specialty, group.LongCount(), done.Count, group.LongCount(t => t.RepairOrder!.Status == "CANCELLED"), ratings.Count == 0 ? null : Scaled(ratings.Average(), 2), Percent(done.LongCount(t => t.RepairOrder!.Results.All(r => r.QcResult != "FAIL")), done.Count), Average(hours)));
        }
        return result.OrderBy(r => r.AvgRating is null).ThenByDescending(r => r.AvgRating).ThenByDescending(r => r.Completed).ThenBy(r => r.EmployeeId, StringComparer.Ordinal).ToList();
    }
    public async Task<Turnaround> TurnaroundAsync(DateOnly? from, DateOnly? to, string? station)
    {
        actors.Require(Permission.REPORT_OPERATIONS);
        var items = (await TicketsAsync("handover.handedOverAt", RangeOf(from, to, station))).Where(t => t.Status == TicketStatus.DELIVERED && t.Handover is not null).ToList();
        var durations = items.Select(t => (Category: t.DeviceSnapshot.GetValueOrDefault("categoryCode", ""), Hours: Hours(t.ReceivedAt, t.Handover!.HandedOverAt))).ToList();
        var categories = durations.GroupBy(i => i.Category).OrderBy(g => g.Key, StringComparer.Ordinal).Select(g => new CategoryTurnaround(g.Key, g.LongCount(), Average(g.Select(i => i.Hours).ToList()))).ToList();
        var hours = durations.Select(i => i.Hours).ToList();
        return new Turnaround(hours.Count, Average(hours), hours.Count == 0 ? null : hours.Min(), hours.Count == 0 ? null : hours.Max(), categories);
    }
    public async Task<WarrantyRatio> WarrantyRatioAsync(DateOnly? from, DateOnly? to, string? station)
    {
        actors.Require(Permission.REPORT_OPERATIONS);
        var items = await TicketsAsync("inspection.inspectedAt", RangeOf(from, to, station));
        var free = items.LongCount(t => t.Inspection?.Classification == WarrantyClassification.FREE_WARRANTY);
        var charged = items.LongCount(t => t.Inspection?.Classification is WarrantyClassification.OUT_OF_WARRANTY or WarrantyClassification.PARTIAL_WARRANTY);
        return new WarrantyRatio(free, charged, Percent(free, free + charged));
    }
    public async Task<List<RepeatRepair>> RepeatRepairsAsync(DateOnly? from, DateOnly? to, string? station)
    {
        actors.Require(Permission.REPORT_OPERATIONS);
        var employees = (await db.ListAsync<EmployeeRecord>("employees", e => true)).ToDictionary(e => e.Code, e => e.FullName);
        var items = await TicketsAsync("receivedAt", RangeOf(from, to, station));
        return items.Where(t => t.RepairOrder?.Results.Any(r => r.QcResult == "FAIL") == true).Select(t => new RepeatRepair(t.Id, t.RepairOrder!.Code, t.RepairOrder.TechnicianId, employees.GetValueOrDefault(t.RepairOrder.TechnicianId), t.RepairOrder.Results.Count, t.RepairOrder.Results.LongCount(r => r.QcResult == "FAIL"), t.RepairOrder.Results.Max(r => r.RecordedAt))).OrderByDescending(r => r.FailedQc).ThenBy(r => r.TicketCode).ToList();
    }
    public async Task<List<QuotationMismatch>> QuotationReconciliationAsync()
    {
        actors.Require(Permission.REPORT_SYSTEM);
        var quotes = await db.ListAsync<Quotation>("quotations", q => true);
        return quotes.Select(q =>
        {
            var parts = q.Lines.Sum(l => (l.UnitPrice ?? 0) * l.Quantity); var labor = q.Lines.Sum(l => l.LaborFee ?? 0);
            return new QuotationMismatch(q.Id, q.PartsTotal, q.LaborTotal, q.GrandTotal, parts, labor, Money.Round((parts + labor) * (1 + q.VatRate / 100)));
        }).Where(r => r.PartsTotal != r.PartsFromLines || r.LaborTotal != r.LaborFromLines || r.GrandTotal != r.ExpectedGrandTotal).ToList();
    }
    public async Task<List<StatusCount>> TicketsByStatusAsync(DateOnly? from, DateOnly? to, string? station)
    {
        actors.Require(Permission.REPORT_OPERATIONS);
        return (await TicketsAsync("receivedAt", RangeOf(from, to, station))).GroupBy(t => t.Status).OrderBy(g => g.Key).Select(g => new StatusCount(g.Key.ToString(), g.LongCount())).ToList();
    }
    public async Task<List<SlaBucket>> SlaDistributionAsync()
    {
        actors.Require(Permission.REPORT_OPERATIONS);
        var now = clock.GetUtcNow(); var until = now + configuration.GetValue("Sla:AtRiskThreshold", TimeSpan.FromHours(2));
        var items = await db.Find<Ticket>("tickets", new MongoDB.Bson.BsonDocument { { "open", true }, { "status", new MongoDB.Bson.BsonDocument("$nin", new MongoDB.Bson.BsonArray { "COMPLETED", "AWAITING_RETURN" }) } }).ToListAsync();
        return items.GroupBy(t => t.Sla.Level).OrderBy(g => g.Key.ToString()).Select(g => new SlaBucket(g.Key.ToString(), g.LongCount(t => t.Sla.DueAt < now), g.LongCount(t => t.Sla.DueAt >= now && t.Sla.DueAt <= until), g.LongCount(t => t.Sla.DueAt > until))).ToList();
    }
    private Task<List<Ticket>> TicketsAsync(string timeField, Range range)
    {
        var filter = Builders<Ticket>.Filter.Empty;
        if (range.From is { } f) filter &= new MongoDB.Bson.BsonDocument(timeField, new MongoDB.Bson.BsonDocument("$gte", MongoDocuments.Value(f)));
        if (range.To is { } t) filter &= new MongoDB.Bson.BsonDocument(timeField, new MongoDB.Bson.BsonDocument("$lt", MongoDocuments.Value(t)));
        if (range.Station is { } st) filter &= Builders<Ticket>.Filter.Eq(t => t.StationCode, st);
        // shortcut: range-filtered reports aggregate in memory; use Mongo aggregation when report volumes exceed local demo needs.
        return db.Find<Ticket>("tickets", filter).ToListAsync();
    }
    private static Range RangeOf(DateOnly? from, DateOnly? to, string? station)
    {
        if (from is { } f && to is { } t && t < f) throw new DomainException(ErrorCode.VALIDATION_FAILED);
        return new Range(from is null ? null : new DateTimeOffset(from.Value.ToDateTime(TimeOnly.MinValue), DbTime.Offset), to is null ? null : new DateTimeOffset(to.Value.AddDays(1).ToDateTime(TimeOnly.MinValue), DbTime.Offset), string.IsNullOrWhiteSpace(station) ? null : station);
    }
    private static long Hours(DateTimeOffset from, DateTimeOffset to) => (long)(to - from).TotalSeconds / 3600;
    private static decimal? Scaled(decimal? value, int scale) => value is null ? null : Math.Round(value.Value, scale, MidpointRounding.AwayFromZero) + (scale == 2 ? 0.00m : 0.0m);
    private static decimal? Average(List<long> values) => values.Count == 0 ? null : Scaled((decimal)values.Average(), 2);
    private static decimal? Percent(long part, long total) => total == 0 ? null : Math.Round(part * 100m / total, 1, MidpointRounding.AwayFromZero) + 0.0m;
}
