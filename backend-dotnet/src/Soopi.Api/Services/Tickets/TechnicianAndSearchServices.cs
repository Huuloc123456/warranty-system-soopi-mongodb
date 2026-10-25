using Soopi.Api.Data;
using Soopi.Api.Data.Stores;
using Soopi.Api.Domain.Identity;
using Soopi.Api.Domain.Tickets;
using Soopi.Api.Infrastructure.Security;

namespace Soopi.Api.Services.Tickets;

public sealed record WorkloadView(
    string TechnicianId, string FullName, IReadOnlySet<string> Skills, long ActiveTickets, int MaxActiveTickets, int LoadPercent, long AtRiskSla,
    bool OnSite, bool Overloaded);

public sealed record CandidateView(
    string TechnicianId, string FullName, IReadOnlySet<string> Skills, bool SkillMatch, string Reason, long ActiveTickets, int MaxActiveTickets,
    int LoadPercent, long AtRiskSla, bool OnSite, bool Overloaded);

public sealed class TechnicianQueryService(StaffDirectory staff, TicketStore tickets, TicketQueryService views, CurrentActor actors, TimeProvider clock)
{
    public async Task<List<WorkloadView>> WorkloadAsync()
    {
        actors.Require(Permission.TICKET_ASSIGN);
        var (members, loads) = await RosterAsync();
        return members.Select(member => Workload(member, loads)).ToList();
    }

    public async Task<List<CandidateView>> CandidatesAsync(string ticketCode)
    {
        actors.Require(Permission.TICKET_ASSIGN);
        var device = (await views.RequireAsync(ticketCode)).DeviceSnapshot;
        var (members, loads) = await RosterAsync();
        return members.Select(member =>
        {
            var load = Workload(member, loads);
            var matches = new[] { "categoryCode", "deviceTypeCode", "deviceTypeName" }
                .Any(key => device.TryGetValue(key, out var value) && member.Skills.Contains(value));
            return new CandidateView(member.Code, member.FullName, member.Skills, matches,
                matches ? "Phù hợp chuyên môn thiết bị" : "Chưa có kỹ năng khớp nhóm thiết bị", load.ActiveTickets, load.MaxActiveTickets,
                load.LoadPercent, load.AtRiskSla, member.OnSite, load.Overloaded);
        }).ToList();
    }

    public async Task<List<TicketView>> MyQueueAsync()
    {
        var actor = actors.Require(Permission.TICKET_READ_ASSIGNED);
        var queue = (await tickets.FindActiveForTechnicianAsync(actor.EmployeeId!))
            .OrderBy(ticket => ticket.Sla.DueAt)
            .ThenBy(ticket => (int)ticket.Assignment!.Priority);
        return await views.ViewsAsync(queue, actor);
    }

    private async Task<(List<StaffMember> Members, Dictionary<string, TechnicianLoad> Loads)> RosterAsync()
    {
        var now = clock.GetUtcNow();
        return (await staff.ActiveTechniciansAsync(), await tickets.TechnicianLoadsAsync(now, now + views.AtRiskThreshold));
    }

    private static WorkloadView Workload(StaffMember member, Dictionary<string, TechnicianLoad> loads)
    {
        var load = loads.GetValueOrDefault(member.Code, TechnicianLoad.None);
        var percent = (int)Math.Round(load.Active * 100.0 / member.MaxActiveTickets, MidpointRounding.AwayFromZero);
        return new WorkloadView(member.Code, member.FullName, member.Skills, load.Active, member.MaxActiveTickets, percent, load.AtRisk, member.OnSite,
            load.Active >= member.MaxActiveTickets);
    }
}

public sealed record SearchHit(string? Code, string? Status, string? Summary);

public sealed record SearchResult(
    IReadOnlyList<SearchHit> Tickets, IReadOnlyList<SearchHit> WarrantyRequests, IReadOnlyList<SearchHit> Quotations, IReadOnlyList<SearchHit> StockIssues);

/// <summary>
/// Tìm kiếm toàn cục ở header (mục 11.4): theo mã TN/YC/BG/PX, serial/IMEI, SĐT. Chỉ trả bản tóm tắt; phiếu đi qua
/// TicketQueryService nên tự áp POL-01/POL-04, các nhóm khác không chứa giá vốn hay ghi chú nội bộ.
/// </summary>
public sealed class GlobalSearchService(TicketQueryService tickets, MongoDocuments docs, CurrentActor actors)
{
    private const int Limit = 5;

    public async Task<SearchResult> SearchAsync(string? query)
    {
        var permissions = actors.RequireSignedIn().Permissions;
        var q = query?.Trim() ?? "";
        if (q.Length < 2) return new SearchResult([], [], [], []);
        var ticketHits = permissions.Contains(Permission.TICKET_READ_ALL) || permissions.Contains(Permission.TICKET_READ_ASSIGNED)
            ? (await tickets.SearchAsync(null, null, null, null, q, null, null, 0, 25)).Items.Take(Limit)
                .Select(ticket => new SearchHit(ticket.Code, ticket.Status, string.Join(" — ",
                    new[] { ticket.Customer?.FullName, ticket.Device.GetValueOrDefault("productName"), ticket.Device.GetValueOrDefault("serialOrImei") }
                        .Where(part => !string.IsNullOrWhiteSpace(part)))))
                .ToList()
            : [];
        var requests = permissions.Contains(Permission.WARRANTY_REQUEST_HANDLE)
            ? (await docs.ListAsync("warranty_requests", MongoDocuments.Search(q, "_id", "customer.phone", "serialOrImei"), limit: Limit))
                .Select(d => new SearchHit(d["_id"].AsString, d["status"].AsString, string.Join(" — ", new[] { d["customer"]["fullName"].AsString, d["brandModel"].AsString, d["serialOrImei"].AsString }.Where(v => !string.IsNullOrWhiteSpace(v))))).ToList() : [];
        var quotations = permissions.Contains(Permission.QUOTE_REVIEW)
            ? (await docs.ListAsync("quotations", MongoDocuments.Search(q, "_id", "ticketId"), limit: Limit)).Select(d => new SearchHit(d["_id"].AsString, d["approval"]["status"].AsString, d["ticketId"].AsString)).ToList() : [];
        var stockIssues = permissions.Contains(Permission.STOCK_ISSUE_PROCESS)
            ? (await docs.ListAsync("stock_issues", MongoDocuments.Search(q, "_id", "ticketId"), limit: Limit)).Select(d => new SearchHit(d["_id"].AsString, d["status"].AsString, d["ticketId"].AsString)).ToList() : [];
        return new SearchResult(ticketHits, requests, quotations, stockIssues);
    }
}
