using MongoDB.Bson;
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
        // Aggregation pipeline chạy tại MongoDB: lọc phiếu thu có phí → (lọc trạm qua $lookup phiếu) → gom theo tháng giờ VN.
        var pipeline = new List<BsonDocument> { new("$match", DateRange(new BsonDocument("type", "CHARGED"), "paidAt", range)) };
        if (range.Station is { } st)
        {
            pipeline.Add(new BsonDocument("$lookup", new BsonDocument { { "from", "tickets" }, { "localField", "ticketId" }, { "foreignField", "_id" }, { "as", "ticket" } }));
            pipeline.Add(new BsonDocument("$match", new BsonDocument("ticket.stationCode", st)));
        }
        pipeline.Add(new BsonDocument("$group", new BsonDocument
        {
            { "_id", new BsonDocument("$dateToString", new BsonDocument { { "format", "%Y-%m" }, { "date", "$paidAt" }, { "timezone", VietnamZone } }) },
            { "payments", new BsonDocument("$sum", 1) },
            { "total", new BsonDocument("$sum", "$amount") },
        }));
        pipeline.Add(new BsonDocument("$sort", new BsonDocument("_id", -1)));
        var rows = await AggregateAsync("payments", pipeline);
        return rows.Select(r => new MonthlyRevenue(r["_id"].AsString, r["payments"].ToInt64(), r["total"].ToDecimal())).ToList();
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
        var range = RangeOf(from, to, station);
        var match = TicketMatch(new BsonDocument { { "status", "DELIVERED" }, { "handover.handedOverAt", new BsonDocument("$type", "date") } }, "handover.handedOverAt", range);
        // Số giờ = số giây trọn / 3600 làm tròn xuống (như Hours()); $facet tính tổng thể và theo nhóm thiết bị trong một lượt.
        var hours = new BsonDocument("$toLong", new BsonDocument("$floor", new BsonDocument("$divide", new BsonArray
        {
            new BsonDocument("$floor", new BsonDocument("$divide", new BsonArray { new BsonDocument("$subtract", new BsonArray { "$handover.handedOverAt", "$receivedAt" }), 1000 })),
            3600,
        })));
        BsonDocument Stats(BsonValue key, bool range) => new BsonDocument
        {
            { "_id", key }, { "n", new BsonDocument("$sum", 1) }, { "sum", new BsonDocument("$sum", "$hours") },
        }.AddRange(range ? new BsonDocument { { "min", new BsonDocument("$min", "$hours") }, { "max", new BsonDocument("$max", "$hours") } } : new BsonDocument());
        var pipeline = new List<BsonDocument>
        {
            new("$match", match),
            new("$project", new BsonDocument { { "category", new BsonDocument("$ifNull", new BsonArray { "$deviceSnapshot.categoryCode", "" }) }, { "hours", hours } }),
            new("$facet", new BsonDocument
            {
                { "overall", new BsonArray { new BsonDocument("$group", Stats(BsonNull.Value, true)) } },
                { "byCategory", new BsonArray { new BsonDocument("$group", Stats("$category", false)) } },
            }),
        };
        var facet = (await AggregateAsync("tickets", pipeline)).Single();
        var overall = facet["overall"].AsBsonArray.Select(v => v.AsBsonDocument).FirstOrDefault();
        var categories = facet["byCategory"].AsBsonArray.Select(v => v.AsBsonDocument).OrderBy(c => c["_id"].AsString, StringComparer.Ordinal)
            .Select(c => new CategoryTurnaround(c["_id"].AsString, c["n"].ToInt64(), AverageOf(c["sum"].ToInt64(), c["n"].ToInt64()))).ToList();
        return overall is null
            ? new Turnaround(0, null, null, null, categories)
            : new Turnaround(overall["n"].ToInt64(), AverageOf(overall["sum"].ToInt64(), overall["n"].ToInt64()), overall["min"].ToInt64(), overall["max"].ToInt64(), categories);
    }
    public async Task<WarrantyRatio> WarrantyRatioAsync(DateOnly? from, DateOnly? to, string? station)
    {
        actors.Require(Permission.REPORT_OPERATIONS);
        var pipeline = new List<BsonDocument>
        {
            new("$match", TicketMatch(new BsonDocument(), "inspection.inspectedAt", RangeOf(from, to, station))),
            new("$group", new BsonDocument
            {
                { "_id", BsonNull.Value },
                { "free", CountWhen(new BsonDocument("$eq", new BsonArray { "$inspection.classification", "FREE_WARRANTY" })) },
                { "charged", CountWhen(new BsonDocument("$in", new BsonArray { "$inspection.classification", new BsonArray { "OUT_OF_WARRANTY", "PARTIAL_WARRANTY" } })) },
            }),
        };
        var row = (await AggregateAsync("tickets", pipeline)).FirstOrDefault();
        long free = row?["free"].ToInt64() ?? 0, charged = row?["charged"].ToInt64() ?? 0;
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
        var pipeline = new List<BsonDocument>
        {
            new("$match", TicketMatch(new BsonDocument(), "receivedAt", RangeOf(from, to, station))),
            new("$group", new BsonDocument { { "_id", "$status" }, { "count", new BsonDocument("$sum", 1) } }),
        };
        // Thứ tự theo vòng đời phiếu (thứ tự enum), không theo bảng chữ cái.
        return (await AggregateAsync("tickets", pipeline)).OrderBy(r => Enum.Parse<TicketStatus>(r["_id"].AsString))
            .Select(r => new StatusCount(r["_id"].AsString, r["count"].ToInt64())).ToList();
    }
    public async Task<List<SlaBucket>> SlaDistributionAsync()
    {
        actors.Require(Permission.REPORT_OPERATIONS);
        var now = clock.GetUtcNow(); var until = now + configuration.GetValue("Sla:AtRiskThreshold", TimeSpan.FromHours(2));
        BsonValue At(DateTimeOffset value) => MongoDocuments.Value(value);
        var pipeline = new List<BsonDocument>
        {
            new("$match", new BsonDocument { { "open", true }, { "status", new BsonDocument("$nin", new BsonArray { "COMPLETED", "AWAITING_RETURN" }) } }),
            new("$group", new BsonDocument
            {
                { "_id", "$sla.level" },
                { "breached", CountWhen(new BsonDocument("$lt", new BsonArray { "$sla.dueAt", At(now) })) },
                { "atRisk", CountWhen(new BsonDocument("$and", new BsonArray { new BsonDocument("$gte", new BsonArray { "$sla.dueAt", At(now) }), new BsonDocument("$lte", new BsonArray { "$sla.dueAt", At(until) }) })) },
                { "onTrack", CountWhen(new BsonDocument("$gt", new BsonArray { "$sla.dueAt", At(until) })) },
            }),
        };
        return (await AggregateAsync("tickets", pipeline)).OrderBy(r => r["_id"].AsString, StringComparer.Ordinal)
            .Select(r => new SlaBucket(r["_id"].AsString, r["breached"].ToInt64(), r["atRisk"].ToInt64(), r["onTrack"].ToInt64())).ToList();
    }
    private const string VietnamZone = "+07:00";
    private Task<List<BsonDocument>> AggregateAsync(string collection, List<BsonDocument> pipeline) =>
        db.Collection<BsonDocument>(collection).Aggregate<BsonDocument>(pipeline).ToListAsync();
    private static BsonDocument CountWhen(BsonValue condition) => new("$sum", new BsonDocument("$cond", new BsonArray { condition, 1, 0 }));
    /// <summary>Điều kiện $match: khoảng [From, To) trên một trường date (gộp với điều kiện sẵn có của trường đó).</summary>
    private static BsonDocument DateRange(BsonDocument match, string timeField, Range range)
    {
        var window = new BsonDocument();
        if (range.From is { } f) window.Add("$gte", MongoDocuments.Value(f));
        if (range.To is { } t) window.Add("$lt", MongoDocuments.Value(t));
        if (window.ElementCount == 0) return match;
        var result = new BsonDocument(match);
        result[timeField] = match.Contains(timeField) ? new BsonDocument(match[timeField].AsBsonDocument).AddRange(window) : window;
        return result;
    }
    /// <summary>Như TicketsAsync nhưng là $match cho pipeline: khoảng thời gian trên timeField và trạm.</summary>
    private static BsonDocument TicketMatch(BsonDocument match, string timeField, Range range)
    {
        var result = DateRange(match, timeField, range);
        if (range.Station is { } st) result = new BsonDocument(result) { { "stationCode", st } };
        return result;
    }
    /// <summary>Trung bình như Average(): (double)tổng / số lượng, làm tròn 2 chữ số.</summary>
    private static decimal? AverageOf(long sum, long count) => count == 0 ? null : Scaled((decimal)((double)sum / count), 2);
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
