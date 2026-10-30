using System.Text.Json.Serialization;
using Soopi.Api.Domain.Identity;
using Soopi.Api.Domain.Shared;

namespace Soopi.Api.Domain.Tickets;

public enum TicketStatus
{
    RECEIVED,
    INSPECTING,
    DIAGNOSED,
    AWAITING_QUOTE_APPROVAL,
    AWAITING_CUSTOMER_CONFIRMATION,
    AWAITING_PARTS,
    AWAITING_RETURN,
    REPAIRING,
    COMPLETED,
    DELIVERED,
    RETURNED_UNREPAIRED,
}

public enum Channel
{
    COUNTER,
    ONLINE_REQUEST,
    PHONE,
}

public enum RequestType
{
    WARRANTY,
    PAID_REPAIR,
}

public enum SlaLevel
{
    EXPRESS_12H,
    PRIORITY_24H,
    STANDARD_48H,
}

public enum Priority
{
    URGENT,
    NORMAL,
    LOW,
}

public enum WarrantyClassification
{
    FREE_WARRANTY,
    OUT_OF_WARRANTY,
    PARTIAL_WARRANTY,
}

public static class TicketEnums
{
    private static readonly Dictionary<TicketStatus, string> Labels = new()
    {
        [TicketStatus.RECEIVED] = "Đã tiếp nhận",
        [TicketStatus.INSPECTING] = "Đang kiểm tra",
        [TicketStatus.DIAGNOSED] = "Đã chẩn đoán",
        [TicketStatus.AWAITING_QUOTE_APPROVAL] = "Chờ duyệt giá",
        [TicketStatus.AWAITING_CUSTOMER_CONFIRMATION] = "Chờ khách xác nhận",
        [TicketStatus.AWAITING_PARTS] = "Chờ linh kiện",
        [TicketStatus.AWAITING_RETURN] = "Chờ trả máy",
        [TicketStatus.REPAIRING] = "Đang sửa chữa",
        [TicketStatus.COMPLETED] = "Hoàn thành",
        [TicketStatus.DELIVERED] = "Đã bàn giao",
        [TicketStatus.RETURNED_UNREPAIRED] = "Đã trả máy (không sửa)",
    };

    /// <summary>Nhãn tiếng Việt dùng trong lịch sử trạng thái và thông điệp lỗi (như dữ liệu cũ).</summary>
    public static string SqlLabel(this TicketStatus status) => Labels[status];

    public static int Hours(this SlaLevel level) => level switch
    {
        SlaLevel.EXPRESS_12H => 12,
        SlaLevel.PRIORITY_24H => 24,
        _ => 48,
    };
}

public sealed record WarrantyAtIntake(string Status, DateOnly? ActivatedOn, DateOnly? ExpiresOn, string? Distributor, string? Conditions, string? PolicyId);

public sealed record Cosmetic(
    string? Scratches, bool Dents, bool Cracks, string? Moisture, string? Accessories, string? AccessoriesNote, string? Notes, bool CustomerAcknowledged);

public sealed record Sla(SlaLevel Level, DateTimeOffset DueAt);

public sealed record AssignmentHistory(string FromTechnicianId, string TechnicianId, string ChangedBy, DateTimeOffset ChangedAt, string? Note);

public sealed record Assignment(
    string Code, string ManagerId, string TechnicianId, DateTimeOffset AssignedAt, Priority Priority, string? Note, List<AssignmentHistory> History);

public sealed record ChecklistItem(string? Item, string? Result, string? Note);

public sealed record Inspection(
    string Code, string TechnicianId, DateTimeOffset InspectedAt, string Findings, IReadOnlyList<ChecklistItem> Checklist, bool WaterDamage,
    WarrantyClassification Classification, string? OutOfWarrantyReason, string? ProposedFix, string? ReclassNote);

public sealed record QcStep(string? Step, string? Result);

public sealed record RepairResult(
    string Code, string TechnicianId, string WorkDone, IReadOnlyList<QcStep> QcSteps, string QcResult, string? QcDetails, DateTimeOffset RecordedAt);

public sealed record RepairOrder(string Code, string TechnicianId, DateTimeOffset CreatedAt, DateTimeOffset? StartedAt, string Status, List<RepairResult> Results);

public sealed record Recheck(bool CosmeticMatches, bool BootsNormally, bool MainFunctionsOk, bool AccessoriesComplete, bool NoNewIssues)
{
    public bool AllPassed() => CosmeticMatches && BootsNormally && MainFunctionsOk && AccessoriesComplete && NoNewIssues;
}

public sealed record Signature(string FileId, DateTimeOffset SignedAt);

public sealed record Handover(
    string Code, DateTimeOffset HandedOverAt, string? HandedOverBy, string ReceiverName, string ConditionOnReturn, bool ReturnedOldParts,
    string? NewWarrantyNote, int? Rating, Recheck? Recheck, Signature? Signature, bool CustomerConfirmed,
    [property: JsonIgnore] string? RatingComment = null, [property: JsonIgnore] DateTimeOffset? RatedAt = null);

public sealed record HandoverInput(
    string? ReceiverName, string? ConditionOnReturn, bool ReturnedOldParts, string? NewWarrantyNote, int? Rating, Recheck? Recheck, bool CustomerConfirmed);

public sealed record Note(DateTimeOffset At, string Text, string By, string Role);

/// <summary>Đang điều chỉnh báo giá: báo giá khách đã đồng ý trước đó và trạng thái quay lại nếu báo giá mới không thành.</summary>
public sealed record QuotationAdjustment(string PreviousQuotationId, TicketStatus ResumeStatus);

public sealed record StatusHistory(TicketStatus Status, DateTimeOffset At, string? Description, string? Actor, string? ActorName, string? ActorRole);

/// <summary>
/// Phiếu tiếp nhận (PhieuTiepNhan + bảng con) — máy trạng thái và luật nghiệp vụ chép từ Ticket.java. Mỗi lần chuyển trạng
/// thái thêm một dòng lịch sử; TicketStore ghi các dòng mới cùng transaction.
/// </summary>
public sealed class Ticket
{
    private static readonly Dictionary<TicketStatus, TicketStatus[]> Allowed = new()
    {
        [TicketStatus.RECEIVED] = [TicketStatus.INSPECTING, TicketStatus.AWAITING_RETURN],
        [TicketStatus.INSPECTING] = [TicketStatus.DIAGNOSED, TicketStatus.AWAITING_RETURN],
        [TicketStatus.DIAGNOSED] = [TicketStatus.REPAIRING, TicketStatus.AWAITING_PARTS, TicketStatus.AWAITING_QUOTE_APPROVAL, TicketStatus.AWAITING_RETURN],
        // Báo giá điều chỉnh bị từ chối/hết hạn → quay lại trạng thái sửa trước khi điều chỉnh.
        [TicketStatus.AWAITING_QUOTE_APPROVAL] = [TicketStatus.AWAITING_CUSTOMER_CONFIRMATION, TicketStatus.DIAGNOSED, TicketStatus.REPAIRING,
            TicketStatus.AWAITING_PARTS, TicketStatus.AWAITING_RETURN],
        [TicketStatus.AWAITING_CUSTOMER_CONFIRMATION] = [TicketStatus.AWAITING_PARTS, TicketStatus.REPAIRING, TicketStatus.AWAITING_RETURN, TicketStatus.DIAGNOSED],
        [TicketStatus.AWAITING_PARTS] = [TicketStatus.REPAIRING, TicketStatus.AWAITING_QUOTE_APPROVAL, TicketStatus.AWAITING_RETURN],
        [TicketStatus.REPAIRING] = [TicketStatus.COMPLETED, TicketStatus.AWAITING_PARTS, TicketStatus.AWAITING_QUOTE_APPROVAL, TicketStatus.AWAITING_RETURN],
        [TicketStatus.COMPLETED] = [TicketStatus.DELIVERED],
        [TicketStatus.AWAITING_RETURN] = [TicketStatus.RETURNED_UNREPAIRED],
        [TicketStatus.DELIVERED] = [],
        [TicketStatus.RETURNED_UNREPAIRED] = [],
    };

    /// <summary>Trạng thái được "Trả máy không sửa" (Chờ khách xác nhận đã có luồng khách từ chối báo giá).</summary>
    public static readonly IReadOnlySet<TicketStatus> Returnable = new HashSet<TicketStatus>
    {
        TicketStatus.RECEIVED, TicketStatus.INSPECTING, TicketStatus.DIAGNOSED, TicketStatus.AWAITING_QUOTE_APPROVAL, TicketStatus.AWAITING_PARTS,
        TicketStatus.REPAIRING,
    };

    /// <summary>KTV được giao chỉ trả máy khi "không sửa được" — các trạng thái đang xử lý kỹ thuật.</summary>
    public static readonly IReadOnlySet<TicketStatus> TechnicianReturnable = new HashSet<TicketStatus>
    {
        TicketStatus.INSPECTING, TicketStatus.DIAGNOSED, TicketStatus.AWAITING_PARTS, TicketStatus.REPAIRING,
    };

    private static readonly HashSet<string> QcSteps = ["VISUAL", "MAIN_FUNCTION", "SECONDARY", "POWER_CHARGING", "DATA", "FINAL"];
    private static readonly HashSet<string> QcStepResults = ["PASS", "FAIL", "NA"];
    private static readonly HashSet<string> ChecklistResults = ["PENDING", "PASS", "FAIL", "NA"];

    internal Ticket()
    {
    }

    public Ticket(
        string id, string stationCode, DateTimeOffset receivedAt, Channel? channel, RequestType? requestType, string? warrantyRequestId,
        string customerId, IReadOnlyDictionary<string, string> customerSnapshot, string deviceId, IReadOnlyDictionary<string, string> deviceSnapshot,
        string receivedBy, WarrantyAtIntake warrantyAtIntake, string? sealCondition, Cosmetic? cosmetic, string? reportedIssue,
        DateTimeOffset? promisedReturnAt, decimal? estimatedCost, SlaLevel slaLevel, AuthenticatedActor actor)
    {
        if (JavaText.IsBlank(reportedIssue) || cosmetic is null || !cosmetic.CustomerAcknowledged
            || (promisedReturnAt is { } promised && promised < receivedAt) || estimatedCost is null || estimatedCost < 0)
            throw new DomainException(ErrorCode.VALIDATION_FAILED);
        Id = id;
        StationCode = stationCode;
        ReceivedAt = receivedAt;
        Channel = channel ?? Tickets.Channel.COUNTER;
        RequestType = requestType ?? Tickets.RequestType.WARRANTY;
        WarrantyRequestId = warrantyRequestId;
        CustomerId = customerId;
        CustomerSnapshot = customerSnapshot;
        DeviceId = deviceId;
        DeviceSnapshot = deviceSnapshot;
        ReceivedBy = receivedBy;
        WarrantyAtIntake = warrantyAtIntake;
        SealCondition = sealCondition;
        Cosmetic = cosmetic;
        ReportedIssue = JavaText.Trim(reportedIssue);
        PromisedReturnAt = promisedReturnAt;
        EstimatedCost = Money.Round(estimatedCost.Value);
        Sla = new Sla(slaLevel, receivedAt.AddHours(slaLevel.Hours()));
        Status = TicketStatus.RECEIVED;
        StatusHistory.Add(new StatusHistory(
            TicketStatus.RECEIVED, receivedAt, "Khách hàng bàn giao thiết bị, lập phiếu tiếp nhận.", actor.EmployeeId, actor.DisplayName, "RECEPTIONIST"));
    }

    public string Id { get; internal set; } = "";

    public string StationCode { get; internal set; } = "";

    public DateTimeOffset ReceivedAt { get; internal set; }

    public Channel Channel { get; internal set; }

    public RequestType RequestType { get; internal set; }

    public string? WarrantyRequestId { get; internal set; }

    public string CustomerId { get; internal set; } = "";

    public IReadOnlyDictionary<string, string> CustomerSnapshot { get; internal set; } = new Dictionary<string, string>();

    public string DeviceId { get; internal set; } = "";

    public IReadOnlyDictionary<string, string> DeviceSnapshot { get; internal set; } = new Dictionary<string, string>();

    public string ReceivedBy { get; internal set; } = "";

    public WarrantyAtIntake WarrantyAtIntake { get; internal set; } = null!;

    public string? SealCondition { get; internal set; }

    public Cosmetic Cosmetic { get; internal set; } = null!;

    public string ReportedIssue { get; internal set; } = "";

    public DateTimeOffset? PromisedReturnAt { get; internal set; }

    public decimal EstimatedCost { get; internal set; }

    public Sla Sla { get; internal set; } = null!;

    public TicketStatus Status { get; internal set; }

    public bool Open => Status is not (TicketStatus.DELIVERED or TicketStatus.RETURNED_UNREPAIRED);

    public Assignment? Assignment { get; internal set; }

    public Inspection? Inspection { get; internal set; }

    public RepairOrder? RepairOrder { get; internal set; }

    public string? ActiveQuotationId { get; internal set; }

    /// <summary>Báo giá điều chỉnh đang chờ duyệt/khách xác nhận; null khi không điều chỉnh.</summary>
    public QuotationAdjustment? Adjustment { get; internal set; }

    public Handover? Handover { get; internal set; }

    public List<Note> CustomerNotes { get; internal set; } = [];

    public List<Note> InternalNotes { get; internal set; } = [];

    public List<StatusHistory> StatusHistory { get; internal set; } = [];

    /// <summary>PhienBan khi nạp (null = phiếu mới chưa ghi).</summary>
    public int? Version { get; internal set; }

    public void Assign(string assignmentCode, string repairOrderCode, string managerId, string technicianId, Priority? priority, string? note,
        DateTimeOffset now, AuthenticatedActor actor)
    {
        if (Status != TicketStatus.RECEIVED) throw new DomainException(ErrorCode.TICKET_INVALID_STATE);
        Assignment = new Assignment(assignmentCode, managerId, technicianId, now, priority ?? Priority.NORMAL, BlankToNull(note), []);
        RepairOrder = new RepairOrder(repairOrderCode, technicianId, now, null, "PENDING", []);
        TransitionTo(TicketStatus.INSPECTING, actor, null, now, "DISPATCHER");
    }

    public string Reassign(string managerId, string technicianId, string? note, DateTimeOffset now)
    {
        if (Assignment is null || Status is TicketStatus.RECEIVED or TicketStatus.COMPLETED or TicketStatus.DELIVERED
                or TicketStatus.AWAITING_RETURN or TicketStatus.RETURNED_UNREPAIRED)
            throw new DomainException(ErrorCode.REASSIGN_NOT_ALLOWED);
        var previous = Assignment.TechnicianId;
        if (previous == technicianId) throw new DomainException(ErrorCode.VALIDATION_FAILED);
        Assignment.History.Add(new AssignmentHistory(previous, technicianId, managerId, now, BlankToNull(note)));
        Assignment = Assignment with { ManagerId = managerId, TechnicianId = technicianId, Note = note is null ? Assignment.Note : BlankToNull(note) };
        RepairOrder = RepairOrder! with { TechnicianId = technicianId };
        return previous;
    }

    public void RecordInspection(string inspectionCode, InspectionInput input, DateOnly receivedDate, DateTimeOffset now, AuthenticatedActor actor)
    {
        if (Status != TicketStatus.INSPECTING) throw new DomainException(ErrorCode.TICKET_INVALID_STATE);
        RequireAssigned(actor);
        Inspection = ValidatedInspection(inspectionCode, input, receivedDate, now, actor);
        TransitionTo(TicketStatus.DIAGNOSED, actor, null, now, "TECHNICIAN");
    }

    public void ReviseInspection(InspectionInput input, DateOnly receivedDate, DateTimeOffset now, AuthenticatedActor actor)
    {
        if (Status != TicketStatus.DIAGNOSED || Inspection is null) throw new DomainException(ErrorCode.TICKET_INVALID_STATE);
        RequireAssigned(actor);
        Inspection = ValidatedInspection(Inspection.Code, input, receivedDate, now, actor);
    }

    public void StartFreeRepair(DateTimeOffset now, AuthenticatedActor actor)
    {
        if (Status != TicketStatus.DIAGNOSED) throw new DomainException(ErrorCode.TICKET_INVALID_STATE);
        RequireAssigned(actor);
        if (Inspection?.Classification != WarrantyClassification.FREE_WARRANTY) throw new DomainException(ErrorCode.START_REPAIR_FREE_ONLY);
        if (RepairOrder?.Status != "PENDING") throw new DomainException(ErrorCode.REPAIR_ORDER_INVALID_STATE);
        RepairOrder = RepairOrder with { StartedAt = now, Status = "IN_PROGRESS" };
        TransitionTo(TicketStatus.REPAIRING, actor, null, now, "TECHNICIAN");
    }

    /// <summary>Ca miễn phí xin linh kiện khi chẩn đoán xong hoặc phát sinh thêm trong lúc sửa (đang sửa → chờ linh kiện).</summary>
    public void RequestFreeParts(DateTimeOffset now, AuthenticatedActor actor)
    {
        if (Status is not (TicketStatus.DIAGNOSED or TicketStatus.AWAITING_PARTS or TicketStatus.REPAIRING))
            throw new DomainException(ErrorCode.TICKET_INVALID_STATE);
        if (actor.Roles.Contains(Role.TECHNICIAN)) RequireAssigned(actor);
        if (Inspection?.Classification != WarrantyClassification.FREE_WARRANTY) throw new DomainException(ErrorCode.STOCK_ISSUE_FREE_ONLY);
        if (Status != TicketStatus.AWAITING_PARTS) TransitionTo(TicketStatus.AWAITING_PARTS, actor, null, now, StockActorRole(actor));
    }

    public void StartRepairWithIssuedParts(DateTimeOffset now, AuthenticatedActor actor)
    {
        if (Status != TicketStatus.AWAITING_PARTS) throw new DomainException(ErrorCode.TICKET_INVALID_STATE);
        StartOrContinueRepair(now);
        TransitionTo(TicketStatus.REPAIRING, actor, null, now, "WAREHOUSE_KEEPER");
    }

    public void ConfirmPartsReady(DateTimeOffset now, AuthenticatedActor actor)
    {
        if (Status != TicketStatus.AWAITING_PARTS) throw new DomainException(ErrorCode.TICKET_INVALID_STATE);
        if (actor.Roles.Contains(Role.TECHNICIAN)) RequireAssigned(actor);
        StartOrContinueRepair(now);
        TransitionTo(TicketStatus.REPAIRING, actor, null, now, StockActorRole(actor));
    }

    /// <summary>
    /// Trả máy không sửa: khách đổi ý hoặc không sửa được. Phiếu chuyển "Chờ trả máy", lệnh sửa bị hủy; báo giá đang hiệu lực và
    /// linh kiện do tầng dịch vụ xử lý cùng transaction. KTV chỉ trả máy phiếu mình được giao, ở các trạng thái kỹ thuật.
    /// </summary>
    public void ReturnUnrepaired(string? reason, DateTimeOffset now, AuthenticatedActor actor, Role actorRole)
    {
        if (!Returnable.Contains(Status)) throw new DomainException(ErrorCode.RETURN_NOT_ALLOWED);
        if (actorRole == Role.TECHNICIAN)
        {
            if (!TechnicianReturnable.Contains(Status)) throw new DomainException(ErrorCode.RETURN_NOT_ALLOWED);
            RequireAssigned(actor);
        }
        if (JavaText.IsBlank(reason)) throw new DomainException(ErrorCode.RETURN_REASON_REQUIRED);
        if (RepairOrder is not null) RepairOrder = RepairOrder with { Status = "CANCELLED" };
        ActiveQuotationId = null;
        Adjustment = null;
        TransitionTo(TicketStatus.AWAITING_RETURN, actor, "Trả máy không sửa: " + JavaText.Trim(reason), now, actorRole.ToString());
    }

    /// <summary>
    /// Phát sinh hạng mục khi đang sửa/chờ linh kiện (ca tính phí): báo giá mới thay thế báo giá khách đã đồng ý, đi lại vòng duyệt
    /// và khách xác nhận. Bị từ chối duyệt hoặc hết hạn thì quay lại trạng thái trước với báo giá cũ.
    /// </summary>
    public void StartQuotationAdjustment(string quotationCode, DateTimeOffset now, AuthenticatedActor actor)
    {
        if (Status is not (TicketStatus.REPAIRING or TicketStatus.AWAITING_PARTS)) throw new DomainException(ErrorCode.TICKET_INVALID_STATE);
        RequireAssigned(actor);
        if (ActiveQuotationId is null) throw new DomainException(ErrorCode.QUOTE_ADJUST_NOT_ALLOWED);
        Adjustment = new QuotationAdjustment(ActiveQuotationId, Status);
        ActiveQuotationId = quotationCode;
        TransitionTo(TicketStatus.AWAITING_QUOTE_APPROVAL, actor, null, now, "TECHNICIAN");
    }

    /// <summary>Báo giá quá hạn khách chưa trả lời: lập lại (về "Đã chẩn đoán"), hoặc báo giá điều chỉnh thì quay lại báo giá cũ.</summary>
    public void ExpireQuotation(string quotationCode, DateTimeOffset now, AuthenticatedActor actor, Role actorRole)
    {
        RequireActiveQuotation(quotationCode, TicketStatus.AWAITING_CUSTOMER_CONFIRMATION);
        if (actorRole == Role.TECHNICIAN) RequireAssigned(actor);
        ResumeOrRediagnose(actor, now, actorRole.ToString(), $"Báo giá {quotationCode} hết hiệu lực");
    }

    /// <summary>BR-27: KCS chỉ "Đạt"/"Chưa đạt"; đủ 6 bước QC, mỗi bước đúng một lần, khớp kết quả tổng.</summary>
    public void RecordRepairResult(string resultCode, string? workDone, IReadOnlyList<QcStep?>? qcSteps, string? qcResult, string? qcDetails,
        DateTimeOffset now, AuthenticatedActor actor)
    {
        // Lệnh sửa vẫn "đang sửa" khi chờ duyệt báo giá điều chỉnh / chờ thêm linh kiện — chỉ ghi kết quả ở "Đang sửa chữa".
        if (Status != TicketStatus.REPAIRING || RepairOrder?.Status != "IN_PROGRESS") throw new DomainException(ErrorCode.REPAIR_ORDER_INVALID_STATE);
        RequireAssigned(actor);
        if (actor.EmployeeId != RepairOrder.TechnicianId) throw new DomainException(ErrorCode.NOT_ASSIGNED_TECHNICIAN);
        if (qcResult is not ("PASS" or "FAIL")) throw new DomainException(ErrorCode.REPAIR_QC_RESULT_INVALID);
        if (JavaText.IsBlank(workDone) || qcSteps is null || qcSteps.Any(step => step is null))
            throw new DomainException(ErrorCode.VALIDATION_FAILED);
        var steps = qcSteps.Select(step => step!).ToList();
        if (steps.Count != QcSteps.Count || !steps.Select(step => step.Step).ToHashSet().SetEquals(QcSteps)
            || steps.Any(step => !QcStepResults.Contains(step.Result ?? "null")))
            throw new DomainException(ErrorCode.VALIDATION_FAILED);
        var hasFailure = steps.Any(step => step.Result == "FAIL");
        if ((hasFailure && qcResult == "PASS") || (!hasFailure && qcResult == "FAIL")) throw new DomainException(ErrorCode.REPAIR_QC_INCONSISTENT);
        var results = new List<RepairResult>(RepairOrder.Results)
        {
            new(resultCode, actor.EmployeeId!, JavaText.Trim(workDone), steps, qcResult, BlankToNull(qcDetails), now),
        };
        RepairOrder = RepairOrder with { Status = qcResult == "PASS" ? "DONE" : "IN_PROGRESS", Results = results };
        if (qcResult == "PASS") TransitionTo(TicketStatus.COMPLETED, actor, null, now, "TECHNICIAN");
    }

    /// <summary>
    /// BR-32, BR-34, BR-35. <paramref name="signature"/> chỉ được gọi sau khi mọi điều kiện hợp lệ để không lưu file chữ ký cho
    /// lần bàn giao bị từ chối; null nghĩa là không có chữ ký.
    /// </summary>
    public async Task HandOverAsync(string handoverCode, HandoverInput input, Func<Task<Signature>>? signature, DateTimeOffset now, AuthenticatedActor actor)
    {
        if (Status is not (TicketStatus.COMPLETED or TicketStatus.AWAITING_RETURN)) throw new DomainException(ErrorCode.HANDOVER_INVALID_STATE);
        if (JavaText.IsBlank(input.ReceiverName) || JavaText.IsBlank(input.ConditionOnReturn)
            || input.Rating is < 1 or > 5)
            throw new DomainException(ErrorCode.VALIDATION_FAILED);
        if (Status == TicketStatus.AWAITING_RETURN && BlankToNull(input.NewWarrantyNote) is not null)
            throw new DomainException(ErrorCode.HANDOVER_CANCELLED_NO_WARRANTY);
        if (Status == TicketStatus.COMPLETED && (input.Recheck is null || !input.Recheck.AllPassed() || signature is null || !input.CustomerConfirmed))
            throw new DomainException(ErrorCode.VALIDATION_FAILED);
        Handover = new Handover(
            handoverCode, now, actor.EmployeeId, JavaText.Trim(input.ReceiverName), JavaText.Trim(input.ConditionOnReturn), input.ReturnedOldParts,
            BlankToNull(input.NewWarrantyNote), input.Rating, input.Recheck, signature is null ? null : await signature(), input.CustomerConfirmed);
        TransitionTo(Status == TicketStatus.COMPLETED ? TicketStatus.DELIVERED : TicketStatus.RETURNED_UNREPAIRED, actor, null, now, HandoverActorRole(actor));
    }

    public void UpdateRating(int rating, string? comment, DateTimeOffset now)
    {
        if (rating is < 1 or > 5 || comment?.Length > 1000) throw new DomainException(ErrorCode.VALIDATION_FAILED);
        if (Status is not (TicketStatus.DELIVERED or TicketStatus.RETURNED_UNREPAIRED))
            throw new DomainException(ErrorCode.TICKET_INVALID_STATE);
        if (Handover is null) throw new DomainException(ErrorCode.HANDOVER_INVALID_STATE);
        Handover = Handover with { Rating = rating, RatingComment = string.IsNullOrWhiteSpace(comment) ? null : comment.Trim(), RatedAt = now };
    }

    public void MarkQuotationPending(string quotationCode, DateTimeOffset now, AuthenticatedActor actor)
    {
        if (Status != TicketStatus.DIAGNOSED) throw new DomainException(ErrorCode.TICKET_INVALID_STATE);
        RequireAssigned(actor);
        if (Inspection is null || Inspection.Classification == WarrantyClassification.FREE_WARRANTY)
            throw new DomainException(ErrorCode.QUOTE_NOT_CHARGEABLE);
        if (ActiveQuotationId is not null) throw new DomainException(ErrorCode.QUOTE_ACTIVE_EXISTS);
        ActiveQuotationId = quotationCode;
        TransitionTo(TicketStatus.AWAITING_QUOTE_APPROVAL, actor, null, now, "TECHNICIAN");
    }

    public void ApproveQuotation(string quotationCode, DateTimeOffset now, AuthenticatedActor actor)
    {
        RequireActiveQuotation(quotationCode, TicketStatus.AWAITING_QUOTE_APPROVAL);
        TransitionTo(TicketStatus.AWAITING_CUSTOMER_CONFIRMATION, actor, null, now, "DISPATCHER");
    }

    public void RejectQuotation(string quotationCode, DateTimeOffset now, AuthenticatedActor actor)
    {
        RequireActiveQuotation(quotationCode, TicketStatus.AWAITING_QUOTE_APPROVAL);
        ResumeOrRediagnose(actor, now, "DISPATCHER", null);
    }

    /// <summary>
    /// T7a: còn linh kiện có SKU chưa xuất (<paramref name="needsParts"/>) thì chờ linh kiện; không thì vào/tiếp tục sửa ngay. Báo giá
    /// điều chỉnh được đồng ý thay hẳn báo giá cũ.
    /// </summary>
    public void AcceptQuotation(string quotationCode, bool needsParts, DateTimeOffset now, AuthenticatedActor actor, bool onBehalf)
    {
        RequireActiveQuotation(quotationCode, TicketStatus.AWAITING_CUSTOMER_CONFIRMATION);
        if (!needsParts) StartOrContinueRepair(now);
        Adjustment = null;
        TransitionTo(needsParts ? TicketStatus.AWAITING_PARTS : TicketStatus.REPAIRING, actor, onBehalf ? "Khách hàng đồng ý báo giá (xác nhận thay khách tại quầy)." : null, now,
            DecisionRole(actor, onBehalf));
    }

    public void DeclineQuotation(string quotationCode, DateTimeOffset now, AuthenticatedActor actor, bool onBehalf)
    {
        RequireActiveQuotation(quotationCode, TicketStatus.AWAITING_CUSTOMER_CONFIRMATION);
        Adjustment = null;
        RepairOrder = RepairOrder! with { Status = "CANCELLED" };
        TransitionTo(TicketStatus.AWAITING_RETURN, actor, onBehalf ? "Khách hàng từ chối báo giá (xác nhận thay khách tại quầy)." : null, now,
            DecisionRole(actor, onBehalf));
    }

    public void AddCustomerNote(string? text, DateTimeOffset now, AuthenticatedActor actor) => CustomerNotes.Add(NewNote(text, now, actor));

    public void AddInternalNote(string? text, DateTimeOffset now, AuthenticatedActor actor) => InternalNotes.Add(NewNote(text, now, actor));

    public void TransitionTo(TicketStatus target, AuthenticatedActor actor, string? description, DateTimeOffset now) =>
        TransitionTo(target, actor, description, now, actor.RoleNames.FirstOrDefault() ?? "");

    private void TransitionTo(TicketStatus target, AuthenticatedActor actor, string? description, DateTimeOffset now, string actorRole)
    {
        if (!Allowed[Status].Contains(target)) throw new DomainException(ErrorCode.TICKET_INVALID_TRANSITION);
        var previous = Status;
        Status = target;
        StatusHistory.Add(new StatusHistory(
            target, now, description ?? $"Trạng thái đổi từ \"{previous.SqlLabel()}\" sang \"{target.SqlLabel()}\"",
            ActorCode(actor), actor.DisplayName, actorRole));
    }

    /// <summary>Lệnh sửa chưa bắt đầu thì bắt đầu; đang sửa dở (sau điều chỉnh báo giá / xin thêm linh kiện) thì giữ nguyên.</summary>
    private void StartOrContinueRepair(DateTimeOffset now)
    {
        if (RepairOrder?.Status == "IN_PROGRESS") return;
        if (RepairOrder?.Status != "PENDING") throw new DomainException(ErrorCode.REPAIR_ORDER_INVALID_STATE);
        RepairOrder = RepairOrder with { StartedAt = now, Status = "IN_PROGRESS" };
    }

    /// <summary>Báo giá điều chỉnh không thành → báo giá cũ và trạng thái trước; báo giá thường → về "Đã chẩn đoán" để lập lại.</summary>
    private void ResumeOrRediagnose(AuthenticatedActor actor, DateTimeOffset now, string actorRole, string? reason)
    {
        if (Adjustment is { } adjustment)
        {
            ActiveQuotationId = adjustment.PreviousQuotationId;
            Adjustment = null;
            TransitionTo(adjustment.ResumeStatus, actor,
                $"{reason ?? "Báo giá điều chỉnh không được duyệt"} — tiếp tục theo báo giá {adjustment.PreviousQuotationId}.", now, actorRole);
            return;
        }
        ActiveQuotationId = null;
        TransitionTo(TicketStatus.DIAGNOSED, actor, reason is null ? null : reason + " — lập lại báo giá.", now, actorRole);
    }

    private Inspection ValidatedInspection(string code, InspectionInput input, DateOnly receivedDate, DateTimeOffset now, AuthenticatedActor actor)
    {
        if (JavaText.IsBlank(input.Findings) || input.Classification is not { } classification)
            throw new DomainException(ErrorCode.VALIDATION_FAILED);
        var checklist = input.Checklist?.ToList() ?? [];
        if (checklist.Any(item => item is null || JavaText.IsBlank(item.Item) || !ChecklistResults.Contains(item.Result ?? "")))
            throw new DomainException(ErrorCode.VALIDATION_FAILED);
        if (classification == WarrantyClassification.FREE_WARRANTY)
        {
            if (WarrantyAtIntake.ExpiresOn is not { } expires || expires < receivedDate) throw new DomainException(ErrorCode.WARRANTY_EXPIRED_CANNOT_BE_FREE);
            if (input.WaterDamage) throw new DomainException(ErrorCode.WATER_DAMAGE_CANNOT_BE_FREE);
        }
        else if (JavaText.IsBlank(input.OutOfWarrantyReason))
        {
            throw new DomainException(ErrorCode.OUT_OF_WARRANTY_REASON_REQUIRED);
        }
        var differsFromIntake = (WarrantyAtIntake.Status == "IN_WARRANTY" && classification != WarrantyClassification.FREE_WARRANTY)
            || (WarrantyAtIntake.Status is "OUT_OF_WARRANTY" or "NOT_ACTIVATED" && classification != WarrantyClassification.OUT_OF_WARRANTY);
        if (differsFromIntake && JavaText.IsBlank(input.ReclassNote)) throw new DomainException(ErrorCode.RECLASS_NOTE_REQUIRED);
        return new Inspection(code, actor.EmployeeId!, now, JavaText.Trim(input.Findings), checklist.Select(item => item!).ToList(), input.WaterDamage, classification,
            BlankToNull(input.OutOfWarrantyReason), BlankToNull(input.ProposedFix), BlankToNull(input.ReclassNote));
    }

    private void RequireAssigned(AuthenticatedActor actor)
    {
        if (Assignment is null || Assignment.TechnicianId != actor.EmployeeId) throw new DomainException(ErrorCode.NOT_ASSIGNED_TECHNICIAN);
    }

    private void RequireActiveQuotation(string quotationCode, TicketStatus expectedStatus)
    {
        if (Status != expectedStatus) throw new DomainException(ErrorCode.TICKET_INVALID_STATE);
        if (ActiveQuotationId != quotationCode) throw new DomainException(ErrorCode.QUOTE_NOT_FOUND);
    }

    private static string DecisionRole(AuthenticatedActor actor, bool onBehalf) =>
        !onBehalf ? "CUSTOMER" : actor.Roles.Contains(Role.RECEPTIONIST) ? "RECEPTIONIST" : "DISPATCHER";

    private static string StockActorRole(AuthenticatedActor actor) =>
        actor.Roles.Contains(Role.WAREHOUSE_KEEPER) ? "WAREHOUSE_KEEPER" : actor.Roles.Contains(Role.DISPATCHER) ? "DISPATCHER" : "TECHNICIAN";

    private static string HandoverActorRole(AuthenticatedActor actor) =>
        actor.Roles.Contains(Role.CASHIER) ? "CASHIER" : actor.Roles.Contains(Role.RECEPTIONIST) ? "RECEPTIONIST" : "DISPATCHER";

    private static string ActorCode(AuthenticatedActor actor) => actor.EmployeeId ?? "KH:" + actor.CustomerId;

    private static Note NewNote(string? text, DateTimeOffset now, AuthenticatedActor actor)
    {
        if (JavaText.IsBlank(text)) throw new DomainException(ErrorCode.VALIDATION_FAILED);
        var role = actor.Roles.Contains(Role.DISPATCHER) ? "DISPATCHER"
            : actor.Roles.Contains(Role.RECEPTIONIST) ? "RECEPTIONIST"
            : actor.Roles.Contains(Role.TECHNICIAN) ? "TECHNICIAN"
            : actor.RoleNames.FirstOrDefault() ?? "";
        return new Note(now, JavaText.Trim(text), ActorCode(actor), role);
    }

    private static string? BlankToNull(string? value) => JavaText.IsBlank(value) ? null : JavaText.Trim(value);
}

public sealed record InspectionInput(
    string? Findings, IReadOnlyList<ChecklistItem?>? Checklist, bool WaterDamage, WarrantyClassification? Classification,
    string? OutOfWarrantyReason, string? ProposedFix, string? ReclassNote);
