// =============================================================================================================
// TRUY VẤN NÂNG CAO — Aggregation Pipeline (Soopi MongoDB)
// Chạy trong Compass (tab mongosh) hoặc mongosh --file. Có thể dán từng mảng "pipeline" vào tab Aggregations của Compass
// (chọn collection tương ứng) để xem kết quả từng stage. Database mặc định: soopi_mongodb_demo.
// Mục 1–5 là chính các pipeline ứng dụng dùng cho trang Báo cáo (Services/Reporting/ReportService.cs).
// =============================================================================================================
const DB_NAME = (typeof process !== 'undefined' && process.env.SOOPI_QUERY_DB) || 'soopi_mongodb_demo';
const d = db.getSiblingDB(DB_NAME);
const show = (title, value) => { print('\n— ' + title); printjson(value); };
const VN = '+07:00';

// 1. Doanh thu theo tháng ($match → $group theo $dateToString giờ VN → $sort)
const revenueByMonth = [
  { $match: { type: 'CHARGED' } },
  { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$paidAt', timezone: VN } }, payments: { $sum: 1 }, total: { $sum: '$amount' } } },
  { $sort: { _id: -1 } },
];
show('1. Doanh thu theo tháng [payments]', d.payments.aggregate(revenueByMonth).toArray());

// 2. Số phiếu theo trạng thái
show('2. Phiếu theo trạng thái [tickets]', d.tickets.aggregate([
  { $group: { _id: '$status', count: { $sum: 1 } } },
  { $sort: { count: -1 } },
]).toArray());

// 3. Tỉ lệ bảo hành miễn phí / tính phí ($cond trong $group)
show('3. Tỉ lệ bảo hành [tickets]', d.tickets.aggregate([
  { $match: { 'inspection.classification': { $exists: true } } },
  { $group: {
      _id: null,
      free: { $sum: { $cond: [{ $eq: ['$inspection.classification', 'FREE_WARRANTY'] }, 1, 0] } },
      charged: { $sum: { $cond: [{ $in: ['$inspection.classification', ['OUT_OF_WARRANTY', 'PARTIAL_WARRANTY']] }, 1, 0] } } } },
  { $project: { _id: 0, free: 1, charged: 1, freePercent: { $round: [{ $multiply: [{ $divide: ['$free', { $add: ['$free', '$charged'] }] }, 100] }, 1] } } },
]).toArray());

// 4. Thời gian xử lý (giờ) tổng thể và theo nhóm thiết bị trong MỘT lượt ($project tính giờ → $facet)
show('4. Thời gian xử lý — $facet [tickets]', d.tickets.aggregate([
  { $match: { status: 'DELIVERED', 'handover.handedOverAt': { $type: 'date' } } },
  { $project: { category: '$deviceSnapshot.categoryCode',
      hours: { $toLong: { $floor: { $divide: [{ $subtract: ['$handover.handedOverAt', '$receivedAt'] }, 3600000] } } } } },
  { $facet: {
      overall: [{ $group: { _id: null, delivered: { $sum: 1 }, avgHours: { $avg: '$hours' }, minHours: { $min: '$hours' }, maxHours: { $max: '$hours' } } }],
      byCategory: [{ $group: { _id: '$category', delivered: { $sum: 1 }, avgHours: { $avg: '$hours' } } }, { $sort: { avgHours: -1 } }],
  } },
]).toArray());

// 5. Phân bố SLA của phiếu đang mở (so sánh với thời điểm hiện tại)
const now = new Date(), soon = new Date(Date.now() + 2 * 3600e3);
show('5. Phân bố SLA phiếu đang mở [tickets]', d.tickets.aggregate([
  { $match: { open: true, status: { $nin: ['COMPLETED', 'AWAITING_RETURN'] } } },
  { $group: { _id: '$sla.level',
      breached: { $sum: { $cond: [{ $lt: ['$sla.dueAt', now] }, 1, 0] } },
      atRisk: { $sum: { $cond: [{ $and: [{ $gte: ['$sla.dueAt', now] }, { $lte: ['$sla.dueAt', soon] }] }, 1, 0] } },
      onTrack: { $sum: { $cond: [{ $gt: ['$sla.dueAt', soon] }, 1, 0] } } } },
]).toArray());

// 6. Hiệu suất kỹ thuật viên: $group → $lookup sang employees (join giữa hai collection) → $project → $sort
show('6. Hiệu suất kỹ thuật viên — $lookup [tickets → employees]', d.tickets.aggregate([
  { $match: { 'assignment.technicianId': { $exists: true } } },
  { $group: { _id: '$assignment.technicianId', assigned: { $sum: 1 },
      delivered: { $sum: { $cond: [{ $eq: ['$status', 'DELIVERED'] }, 1, 0] } },
      avgRating: { $avg: '$handover.rating' },
      qcFailures: { $sum: { $size: { $filter: { input: { $ifNull: ['$repairOrder.results', []] }, cond: { $eq: ['$$this.qcResult', 'FAIL'] } } } } } } },
  { $lookup: { from: 'employees', localField: '_id', foreignField: '_id', as: 'employee' } },
  { $project: { _id: 0, technician: '$_id', name: { $first: '$employee.fullName' }, assigned: 1, delivered: 1, qcFailures: 1, avgRating: { $round: ['$avgRating', 2] } } },
  { $sort: { delivered: -1 } },
]).toArray());

// 7. Linh kiện tiêu thụ nhiều nhất: $unwind mảng lines → $group → $lookup parts → giá trị theo giá vốn
show('7. Top linh kiện đã xuất — $unwind + $lookup [stock_issues → parts]', d.stock_issues.aggregate([
  { $match: { status: 'ISSUED' } },
  { $unwind: '$lines' },
  { $group: { _id: '$lines.sku', quantity: { $sum: '$lines.quantity' }, cost: { $sum: { $multiply: ['$lines.quantity', '$lines.unitCost'] } } } },
  { $lookup: { from: 'parts', localField: '_id', foreignField: '_id', as: 'part' } },
  { $project: { sku: '$_id', _id: 0, name: { $first: '$part.name' }, quantity: 1, cost: 1, onHandNow: { $first: '$part.onHand' } } },
  { $sort: { quantity: -1 } },
  { $limit: 5 },
]).toArray());

// 8. Khách hàng chi tiêu nhiều nhất: $lookup có pipeline con (join payments qua tickets)
show('8. Top khách hàng theo doanh thu — $lookup với pipeline con [customers]', d.customers.aggregate([
  { $lookup: { from: 'tickets', localField: '_id', foreignField: 'customerId', as: 'tickets', pipeline: [{ $project: { _id: 1 } }] } },
  { $lookup: { from: 'payments', let: { ids: '$tickets._id' }, as: 'payments', pipeline: [
      { $match: { $expr: { $and: [{ $in: ['$ticketId', '$$ids'] }, { $eq: ['$type', 'CHARGED'] }] } } },
      { $group: { _id: null, total: { $sum: '$amount' }, n: { $sum: 1 } } } ] } },
  { $project: { _id: 1, fullName: 1, tickets: { $size: '$tickets' }, spent: { $ifNull: [{ $first: '$payments.total' }, 0] } } },
  { $sort: { spent: -1 } },
  { $limit: 5 },
]).toArray());

// 9. Phân bố điểm đánh giá ($bucket) và xu hướng doanh thu lũy kế theo tháng ($setWindowFields)
show('9a. Phân bố điểm đánh giá — $bucket [tickets]', d.tickets.aggregate([
  { $match: { 'handover.rating': { $gte: 1 } } },
  { $bucket: { groupBy: '$handover.rating', boundaries: [1, 3, 4, 5, 6], default: 'khác', output: { tickets: { $sum: 1 } } } },
]).toArray());
show('9b. Doanh thu lũy kế — $setWindowFields [payments]', d.payments.aggregate([
  ...revenueByMonth.slice(0, 2),
  { $sort: { _id: 1 } },
  { $setWindowFields: { sortBy: { _id: 1 }, output: { cumulative: { $sum: '$total', window: { documents: ['unbounded', 'current'] } } } } },
]).toArray());

// 10. Tìm kiếm toàn văn bằng text index (ticket_text) — xếp theo điểm liên quan
show('10. $text: phiếu có triệu chứng "nguồn" [tickets]', d.tickets.find(
  { $text: { $search: 'nguồn' } }, { score: { $meta: 'textScore' }, reportedIssue: 1, status: 1 },
).sort({ score: { $meta: 'textScore' } }).limit(5).toArray());

// 11. Lịch sử một phiếu: $unwind statusHistory theo thứ tự thời gian (document nhúng → dòng thời gian)
const sample = d.tickets.findOne({ status: 'DELIVERED' }, { _id: 1 });
show('11. Dòng thời gian phiếu ' + sample._id + ' — $unwind statusHistory', d.tickets.aggregate([
  { $match: { _id: sample._id } },
  { $unwind: '$statusHistory' },
  { $project: { _id: 0, at: { $dateToString: { format: '%d/%m/%Y %H:%M', date: '$statusHistory.at', timezone: VN } }, status: '$statusHistory.status', by: '$statusHistory.actorName' } },
]).toArray());

// 12. Lưu kết quả báo cáo thành collection (materialized view) bằng $merge — ghi vào report_revenue_monthly
d.payments.aggregate([...revenueByMonth, { $merge: { into: 'report_revenue_monthly', whenMatched: 'replace', whenNotMatched: 'insert' } }]);
show('12. $merge → report_revenue_monthly', d.report_revenue_monthly.find().sort({ _id: -1 }).limit(3).toArray());
d.report_revenue_monthly.drop();
