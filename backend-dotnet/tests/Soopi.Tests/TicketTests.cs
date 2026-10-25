using Soopi.Api.Domain.Identity;
using Soopi.Api.Domain.Shared;
using Soopi.Api.Domain.Tickets;

namespace Soopi.Tests;

public class TicketTests
{
    private static readonly DateTimeOffset Now = new(2026, 9, 26, 3, 0, 0, TimeSpan.Zero);
    private static readonly AuthenticatedActor Receptionist = Actor("NV-004", Role.RECEPTIONIST);
    private static readonly AuthenticatedActor Dispatcher = Actor("NV-001", Role.DISPATCHER);
    private static readonly AuthenticatedActor Technician = Actor("NV-002", Role.TECHNICIAN);

    private static AuthenticatedActor Actor(string employee, Role role) =>
        new(1, employee, new HashSet<Role> { role }, RolePermissions.ForRole(role), employee, null, employee);

    private static Ticket NewTicket(string warrantyStatus = "IN_WARRANTY", DateOnly? expires = null) =>
        new("TN-2026-0926-00001", "HCM", Now, null, null, null, "KH-000001", new Dictionary<string, string>(), "TB-000001",
            new Dictionary<string, string>(), "NV-004", new WarrantyAtIntake(warrantyStatus, null, expires ?? new DateOnly(2027, 1, 1), null, null, null),
            null, new Cosmetic("NONE", false, false, "NONE", "COMPLETE", null, null, true), " Không lên nguồn ", null, 150000.5m,
            SlaLevel.STANDARD_48H, Receptionist);

    private static Ticket Diagnosed(WarrantyClassification classification, string? reason = null, string? reclass = null)
    {
        var ticket = NewTicket();
        ticket.Assign("PC-1", "PSC-1", "NV-001", "NV-002", null, null, Now, Dispatcher);
        ticket.RecordInspection("PKT-1", new InspectionInput("Hỏng IC nguồn", [], false, classification, reason, null, reclass),
            new DateOnly(2026, 9, 26), Now, Technician);
        return ticket;
    }

    private static List<QcStep?> Steps(string result = "PASS") =>
        new[] { "VISUAL", "MAIN_FUNCTION", "SECONDARY", "POWER_CHARGING", "DATA", "FINAL" }.Select(step => (QcStep?)new QcStep(step, result)).ToList();

    [Fact]
    public void NewTicket_StartsReceived_WithSlaAndRoundedCost()
    {
        var ticket = NewTicket();
        Assert.Equal(TicketStatus.RECEIVED, ticket.Status);
        Assert.Equal(Now.AddHours(48), ticket.Sla.DueAt);
        Assert.Equal(150001m, ticket.EstimatedCost);
        Assert.Equal("Không lên nguồn", ticket.ReportedIssue);
        Assert.Equal("Khách hàng bàn giao thiết bị, lập phiếu tiếp nhận.", ticket.StatusHistory.Single().Description);
        Assert.Throws<DomainException>(() => new Ticket("TN", "HCM", Now, null, null, null, "KH", new Dictionary<string, string>(), "TB",
            new Dictionary<string, string>(), "NV", new WarrantyAtIntake("IN_WARRANTY", null, null, null, null, null), null,
            new Cosmetic(null, false, false, null, null, null, null, CustomerAcknowledged: false), "Lỗi", null, 0, SlaLevel.EXPRESS_12H, Receptionist));
    }

    [Fact]
    public void FreeWarrantyFlow_WritesHistoryLikeJava()
    {
        var ticket = Diagnosed(WarrantyClassification.FREE_WARRANTY);
        ticket.StartFreeRepair(Now, Technician);
        ticket.RecordRepairResult("KQ-1", "Thay IC", Steps(), "PASS", null, Now, Technician);
        Assert.Equal(TicketStatus.COMPLETED, ticket.Status);
        Assert.Equal("DONE", ticket.RepairOrder!.Status);
        Assert.Equal("Trạng thái đổi từ \"Đang sửa chữa\" sang \"Hoàn thành\"", ticket.StatusHistory[^1].Description);
        Assert.Equal(5, ticket.StatusHistory.Count);
    }

    [Fact]
    public void Inspection_EnforcesWarrantyRules()
    {
        var expired = NewTicket(expires: new DateOnly(2026, 1, 1));
        expired.Assign("PC-1", "PSC-1", "NV-001", "NV-002", null, null, Now, Dispatcher);
        var input = new InspectionInput("x", [], false, WarrantyClassification.FREE_WARRANTY, null, null, null);
        Assert.Equal(ErrorCode.WARRANTY_EXPIRED_CANNOT_BE_FREE,
            Assert.Throws<DomainException>(() => expired.RecordInspection("PKT", input, new DateOnly(2026, 9, 26), Now, Technician)).Code);
        Assert.Equal(ErrorCode.OUT_OF_WARRANTY_REASON_REQUIRED,
            Assert.Throws<DomainException>(() => Diagnosed(WarrantyClassification.OUT_OF_WARRANTY)).Code);
        Assert.Equal(ErrorCode.RECLASS_NOTE_REQUIRED,
            Assert.Throws<DomainException>(() => Diagnosed(WarrantyClassification.OUT_OF_WARRANTY, "Vào nước")).Code);
        Assert.Equal(TicketStatus.DIAGNOSED, Diagnosed(WarrantyClassification.OUT_OF_WARRANTY, "Vào nước", "Có dấu vào nước").Status);
    }

    [Fact]
    public void RepairResult_RequiresConsistentQc()
    {
        var ticket = Diagnosed(WarrantyClassification.FREE_WARRANTY);
        ticket.StartFreeRepair(Now, Technician);
        Assert.Equal(ErrorCode.REPAIR_QC_INCONSISTENT,
            Assert.Throws<DomainException>(() => ticket.RecordRepairResult("KQ", "x", Steps("FAIL"), "PASS", null, Now, Technician)).Code);
        Assert.Equal(ErrorCode.VALIDATION_FAILED,
            Assert.Throws<DomainException>(() => ticket.RecordRepairResult("KQ", "x", Steps().Take(5).ToList(), "PASS", null, Now, Technician)).Code);
        Assert.Equal(ErrorCode.REPAIR_QC_RESULT_INVALID,
            Assert.Throws<DomainException>(() => ticket.RecordRepairResult("KQ", "x", Steps(), "OK", null, Now, Technician)).Code);
        ticket.RecordRepairResult("KQ-1", "x", Steps("FAIL"), "FAIL", null, Now, Technician);
        Assert.Equal(TicketStatus.REPAIRING, ticket.Status);
        Assert.Single(ticket.RepairOrder!.Results);
    }

    [Fact]
    public void QuotationFlow_AndInvalidTransition()
    {
        var ticket = Diagnosed(WarrantyClassification.OUT_OF_WARRANTY, "Vào nước", "Có dấu vào nước");
        Assert.Equal(ErrorCode.START_REPAIR_FREE_ONLY, Assert.Throws<DomainException>(() => ticket.StartFreeRepair(Now, Technician)).Code);
        ticket.MarkQuotationPending("BG-1", Now, Technician);
        Assert.Equal(ErrorCode.QUOTE_NOT_FOUND, Assert.Throws<DomainException>(() => ticket.ApproveQuotation("BG-2", Now, Dispatcher)).Code);
        ticket.ApproveQuotation("BG-1", Now, Dispatcher);
        ticket.AcceptQuotation("BG-1", needsParts: true, Now, Receptionist, onBehalf: true);
        Assert.Equal(TicketStatus.AWAITING_PARTS, ticket.Status);
        Assert.Equal("Khách hàng đồng ý báo giá (xác nhận thay khách tại quầy).", ticket.StatusHistory[^1].Description);
        Assert.Equal("RECEPTIONIST", ticket.StatusHistory[^1].ActorRole);
        Assert.Equal(ErrorCode.TICKET_INVALID_TRANSITION,
            Assert.Throws<DomainException>(() => ticket.TransitionTo(TicketStatus.DELIVERED, Dispatcher, null, Now)).Code);
    }

    [Fact]
    public void AcceptedLaborOnlyQuotation_StartsRepairDirectly()
    {
        var ticket = Diagnosed(WarrantyClassification.OUT_OF_WARRANTY, "Rơi vỡ", "Có dấu va đập");
        ticket.MarkQuotationPending("BG-1", Now, Technician);
        ticket.ApproveQuotation("BG-1", Now, Dispatcher);
        ticket.AcceptQuotation("BG-1", needsParts: false, Now, Receptionist, onBehalf: true);
        Assert.Equal(TicketStatus.REPAIRING, ticket.Status);
        Assert.Equal("IN_PROGRESS", ticket.RepairOrder!.Status);
    }

    [Fact]
    public async Task DeclinedQuotation_AwaitsReturn_ThenReturnsUnrepaired()
    {
        var ticket = Diagnosed(WarrantyClassification.OUT_OF_WARRANTY, "Rơi vỡ", "Có dấu va đập");
        ticket.MarkQuotationPending("BG-1", Now, Technician);
        ticket.ApproveQuotation("BG-1", Now, Dispatcher);
        ticket.DeclineQuotation("BG-1", Now, Receptionist, onBehalf: true);
        Assert.Equal(TicketStatus.AWAITING_RETURN, ticket.Status);
        Assert.Equal("CANCELLED", ticket.RepairOrder!.Status);
        Assert.True(ticket.Open);
        var input = new HandoverInput("Khách", "Như lúc nhận", false, null, 5, null, true);
        await ticket.HandOverAsync("PBG-1", input, null, Now, Receptionist);
        Assert.Equal(TicketStatus.RETURNED_UNREPAIRED, ticket.Status);
        Assert.Equal("Trạng thái đổi từ \"Chờ trả máy\" sang \"Đã trả máy (không sửa)\"", ticket.StatusHistory[^1].Description);
    }

    [Fact]
    public void Reassign_RecordsHistory_AndRejectsSameTechnician()
    {
        var ticket = Diagnosed(WarrantyClassification.FREE_WARRANTY);
        Assert.Equal(ErrorCode.VALIDATION_FAILED, Assert.Throws<DomainException>(() => ticket.Reassign("NV-001", "NV-002", null, Now)).Code);
        Assert.Equal("NV-002", ticket.Reassign("NV-001", "NV-005", "Đổi ca", Now));
        Assert.Equal("NV-005", ticket.RepairOrder!.TechnicianId);
        Assert.Single(ticket.Assignment!.History);
    }

    [Fact]
    public async Task CustomerCanRateOnlyAfterHandoverAndRatingIsValidated()
    {
        var ticket = Diagnosed(WarrantyClassification.FREE_WARRANTY);
        Assert.Equal(ErrorCode.TICKET_INVALID_STATE, Assert.Throws<DomainException>(() => ticket.UpdateRating(5, null, Now)).Code);
        ticket.StartFreeRepair(Now, Technician);
        ticket.RecordRepairResult("KQ-1", "Thay IC", Steps(), "PASS", null, Now, Technician);
        var input = new HandoverInput("Khách", "Bình thường", false, "6 tháng", null,
            new Recheck(true, true, true, true, true), true);
        await ticket.HandOverAsync("PBG-1", input, () => Task.FromResult(new Signature("1", Now)), Now, Receptionist);
        ticket.UpdateRating(5, "  Dịch vụ tốt  ", Now.AddHours(1));
        Assert.Equal(5, ticket.Handover!.Rating);
        Assert.Equal("Dịch vụ tốt", ticket.Handover.RatingComment);
        Assert.Equal(Now.AddHours(1), ticket.Handover.RatedAt);
        Assert.Throws<DomainException>(() => ticket.UpdateRating(0, null, Now));
        Assert.Throws<DomainException>(() => ticket.UpdateRating(6, null, Now));
        Assert.Throws<DomainException>(() => ticket.UpdateRating(5, new string('x', 1001), Now));
    }

    [Fact]
    public void ReturnUnrepaired_FromTechnicalStates_CancelsRepairOrder()
    {
        var ticket = Diagnosed(WarrantyClassification.FREE_WARRANTY);
        ticket.StartFreeRepair(Now, Technician);
        Assert.Equal(ErrorCode.RETURN_REASON_REQUIRED,
            Assert.Throws<DomainException>(() => ticket.ReturnUnrepaired(" ", Now, Technician, Role.TECHNICIAN)).Code);
        ticket.ReturnUnrepaired("Không sửa được", Now, Technician, Role.TECHNICIAN);
        Assert.Equal(TicketStatus.AWAITING_RETURN, ticket.Status);
        Assert.Equal("CANCELLED", ticket.RepairOrder!.Status);
        Assert.Equal("Trả máy không sửa: Không sửa được", ticket.StatusHistory[^1].Description);
        Assert.Equal(ErrorCode.RETURN_NOT_ALLOWED,
            Assert.Throws<DomainException>(() => ticket.ReturnUnrepaired("lần 2", Now, Dispatcher, Role.DISPATCHER)).Code);
    }

    [Fact]
    public void ReturnUnrepaired_TechnicianOnlyFromTechnicalStates_ReceptionistAnytimeBeforeCompletion()
    {
        var received = NewTicket();
        Assert.Equal(ErrorCode.RETURN_NOT_ALLOWED,
            Assert.Throws<DomainException>(() => received.ReturnUnrepaired("x", Now, Technician, Role.TECHNICIAN)).Code);
        received.ReturnUnrepaired("Khách đổi ý", Now, Receptionist, Role.RECEPTIONIST);
        Assert.Equal(TicketStatus.AWAITING_RETURN, received.Status);
        var other = Diagnosed(WarrantyClassification.FREE_WARRANTY);
        Assert.Equal(ErrorCode.NOT_ASSIGNED_TECHNICIAN,
            Assert.Throws<DomainException>(() => other.ReturnUnrepaired("x", Now, Actor("NV-009", Role.TECHNICIAN), Role.TECHNICIAN)).Code);
    }

    [Fact]
    public void QuotationAdjustment_RejectedResumesWithPreviousQuote_AcceptedKeepsRepairGoing()
    {
        var ticket = Diagnosed(WarrantyClassification.OUT_OF_WARRANTY, "Hết hạn", "Hết hạn thực tế");
        ticket.MarkQuotationPending("BG-1", Now, Technician);
        ticket.ApproveQuotation("BG-1", Now, Dispatcher);
        ticket.AcceptQuotation("BG-1", needsParts: false, Now, Receptionist, onBehalf: true);
        Assert.Equal(TicketStatus.REPAIRING, ticket.Status);

        ticket.StartQuotationAdjustment("BG-2", Now, Technician);
        Assert.Equal(TicketStatus.AWAITING_QUOTE_APPROVAL, ticket.Status);
        Assert.Equal("BG-2", ticket.ActiveQuotationId);
        Assert.Equal(ErrorCode.REPAIR_ORDER_INVALID_STATE,
            Assert.Throws<DomainException>(() => ticket.RecordRepairResult("KQ-1", "x", Steps(), "PASS", null, Now, Technician)).Code);
        ticket.RejectQuotation("BG-2", Now, Dispatcher);
        Assert.Equal(TicketStatus.REPAIRING, ticket.Status);
        Assert.Equal("BG-1", ticket.ActiveQuotationId);
        Assert.Null(ticket.Adjustment);

        ticket.StartQuotationAdjustment("BG-3", Now, Technician);
        ticket.ApproveQuotation("BG-3", Now, Dispatcher);
        ticket.AcceptQuotation("BG-3", needsParts: false, Now, Receptionist, onBehalf: true);
        Assert.Equal(TicketStatus.REPAIRING, ticket.Status);
        Assert.Equal("IN_PROGRESS", ticket.RepairOrder!.Status);
        ticket.RecordRepairResult("KQ-1", "Đã sửa", Steps(), "PASS", null, Now, Technician);
        Assert.Equal(TicketStatus.COMPLETED, ticket.Status);
    }

    [Fact]
    public void ExpiredQuotation_ReturnsToDiagnosed_OrResumesAdjustment()
    {
        var ticket = Diagnosed(WarrantyClassification.OUT_OF_WARRANTY, "Hết hạn", "Hết hạn thực tế");
        ticket.MarkQuotationPending("BG-1", Now, Technician);
        ticket.ApproveQuotation("BG-1", Now, Dispatcher);
        ticket.ExpireQuotation("BG-1", Now, Dispatcher, Role.DISPATCHER);
        Assert.Equal(TicketStatus.DIAGNOSED, ticket.Status);
        Assert.Null(ticket.ActiveQuotationId);

        ticket.MarkQuotationPending("BG-2", Now, Technician);
        ticket.ApproveQuotation("BG-2", Now, Dispatcher);
        ticket.AcceptQuotation("BG-2", needsParts: true, Now, Receptionist, onBehalf: true);
        ticket.StartQuotationAdjustment("BG-3", Now, Technician);
        ticket.ApproveQuotation("BG-3", Now, Dispatcher);
        ticket.ExpireQuotation("BG-3", Now, Technician, Role.TECHNICIAN);
        Assert.Equal(TicketStatus.AWAITING_PARTS, ticket.Status);
        Assert.Equal("BG-2", ticket.ActiveQuotationId);
    }

    [Fact]
    public void QuotationStatuses_SupersedeRestoreExpireCancel()
    {
        var quote = new Soopi.Api.Domain.Quotations.Quotation("BG-1", "TN-1", null, "NV-002", Now, new DateOnly(2026, 9, 26), new DateOnly(2026, 9, 27), 10, null,
            [Soopi.Api.Domain.Quotations.QuotationLine.Of(1, null, "Công", 1, 0, 100000)]);
        Assert.Equal(ErrorCode.QUOTE_ADJUST_NOT_ALLOWED, Assert.Throws<DomainException>(quote.Supersede).Code);
        quote.Approve("NV-001", null, Now);
        Assert.Equal(ErrorCode.QUOTE_NOT_EXPIRED, Assert.Throws<DomainException>(() => quote.Expire(new DateOnly(2026, 9, 27))).Code);
        quote.Expire(new DateOnly(2026, 9, 28));
        Assert.Equal("EXPIRED", quote.Approval.Status);
        Assert.False(quote.Active);

        var accepted = new Soopi.Api.Domain.Quotations.Quotation("BG-2", "TN-1", null, "NV-002", Now, new DateOnly(2026, 9, 26), null, 10, null,
            [Soopi.Api.Domain.Quotations.QuotationLine.Of(1, null, "Công", 1, 0, 100000)]);
        accepted.Approve("NV-001", null, Now);
        accepted.Accept("NV-004", "COUNTER", new DateOnly(2026, 9, 26), Now);
        accepted.Supersede();
        Assert.False(accepted.Active);
        accepted.RestoreSuperseded();
        Assert.Equal("APPROVED", accepted.Approval.Status);
        accepted.Cancel();
        Assert.Equal("CANCELLED", accepted.Approval.Status);
    }
}
