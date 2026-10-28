// =============================================================================================================
// TRUY VẤN CƠ BẢN — Soopi MongoDB
// Chạy trong MongoDB Compass (tab mongosh ở cuối cửa sổ) hoặc:  mongosh "mongodb://127.0.0.1:27017/?replicaSet=rs0" --file 01-truy-van-co-ban.js
// Database: soopi_mongodb_demo (dữ liệu demo 6 tháng). Đổi DB_NAME nếu cần.
// Phần CRUD (mục 8) chỉ ghi vào collection tạm "demo_crud" và xóa ở cuối, không đụng dữ liệu ứng dụng.
// =============================================================================================================
const DB_NAME = (typeof process !== 'undefined' && process.env.SOOPI_QUERY_DB) || 'soopi_mongodb_demo';
const d = db.getSiblingDB(DB_NAME);
const show = (title, value) => { print('\n— ' + title); printjson(value); };

// 1. find + projection: danh sách khách hàng (chỉ họ tên, SĐT), sắp xếp theo tên, 5 dòng đầu
show('1. Khách hàng (projection, sort, limit)',
  d.customers.find({ status: 'ACTIVE' }, { _id: 1, fullName: 1, phone: 1 }).sort({ fullName: 1 }).limit(5).toArray());

// 2. Lọc theo giá trị và đếm: số phiếu đang mở
show('2. Số phiếu đang mở (countDocuments)', d.tickets.countDocuments({ open: true }));

// 3. Toán tử so sánh + khoảng thời gian: phiếu tiếp nhận trong tháng 9/2026 (giờ VN)
show('3. Phiếu tiếp nhận tháng 9/2026 ($gte/$lt trên date)',
  d.tickets.find({ receivedAt: { $gte: ISODate('2026-08-31T17:00:00Z'), $lt: ISODate('2026-09-30T17:00:00Z') } },
    { _id: 1, status: 1, receivedAt: 1, 'deviceSnapshot.productName': 1 }).sort({ receivedAt: 1 }).limit(5).toArray());

// 4. $in: phiếu đang chờ (nhiều trạng thái)
show('4. Phiếu đang chờ ($in)',
  d.tickets.find({ status: { $in: ['AWAITING_PARTS', 'AWAITING_CUSTOMER_CONFIRMATION', 'AWAITING_QUOTE_APPROVAL', 'COMPLETED'] } },
    { _id: 1, status: 1, customerId: 1 }).toArray());

// 5. Truy vấn trường lồng (dot notation) trong document nhúng: phiếu laptop của một kỹ thuật viên
show('5. Phiếu laptop do NV-008 xử lý (dot notation vào document nhúng)',
  d.tickets.find({ 'deviceSnapshot.categoryCode': 'LAPTOP', 'assignment.technicianId': 'NV-008' },
    { _id: 1, 'deviceSnapshot.productName': 1, status: 1 }).limit(5).toArray());

// 6. Mảng: $elemMatch trên lịch sử trạng thái — phiếu từng bị trả máy không sửa
show('6. Phiếu từng chuyển "Chờ trả máy" ($elemMatch trên mảng statusHistory)',
  d.tickets.find({ statusHistory: { $elemMatch: { status: 'AWAITING_RETURN' } } }, { _id: 1, status: 1 }).limit(5).toArray());

// 7. $regex (không phân biệt hoa thường) + $exists + distinct
show('7a. Khách có email Gmail/example ($regex)',
  d.customers.find({ email: { $regex: '@example\\.com$', $options: 'i' } }, { fullName: 1, email: 1 }).limit(5).toArray());
show('7b. Phiếu có đánh giá ($exists)', d.tickets.countDocuments({ 'handover.rating': { $exists: true, $ne: null } }));
show('7c. Các hãng có sản phẩm (distinct)', d.products.distinct('brandId'));

// 8. CRUD trên collection tạm demo_crud: insertOne / insertMany / updateOne ($set, $inc, $push) / deleteOne
const crud = d.getCollection('demo_crud');
crud.drop();
show('8a. insertOne', crud.insertOne({ _id: 'LK-DEMO-01', name: 'Linh kiện demo', onHand: 10, tags: ['demo'] }));
show('8b. insertMany', crud.insertMany([{ _id: 'LK-DEMO-02', name: 'Pin demo', onHand: 3 }, { _id: 'LK-DEMO-03', name: 'Cáp demo', onHand: 0 }]));
show('8c. updateOne $set + $inc + $push', crud.updateOne({ _id: 'LK-DEMO-01' }, { $set: { name: 'Linh kiện demo (sửa)' }, $inc: { onHand: -2 }, $push: { tags: 'đã-xuất' } }));
show('8d. updateMany có điều kiện', crud.updateMany({ onHand: { $lt: 5 } }, { $set: { lowStock: true } }));
show('8e. find sau khi sửa', crud.find().toArray());
show('8f. deleteOne', crud.deleteOne({ _id: 'LK-DEMO-03' }));
show('8g. còn lại', crud.countDocuments());
crud.drop();
