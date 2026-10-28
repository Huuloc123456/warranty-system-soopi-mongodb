# Bộ truy vấn MongoDB cho demo và báo cáo

Ba file chạy được ngay trong **MongoDB Compass** (mở tab **mongosh** ở cuối cửa sổ, dán nội dung file) hoặc bằng dòng lệnh. Mặc định truy vấn database `soopi_mongodb_demo` (xem [`database/demo-data`](../demo-data)); đặt biến `SOOPI_QUERY_DB` để đổi.

```powershell
mongosh "mongodb://127.0.0.1:27017/?replicaSet=rs0" --quiet --file database/queries/01-truy-van-co-ban.js
mongosh "mongodb://127.0.0.1:27017/?replicaSet=rs0" --quiet --file database/queries/02-truy-van-nang-cao.js
mongosh "mongodb://127.0.0.1:27017/?replicaSet=rs0" --quiet --file database/queries/03-chi-muc-va-schema.js
```

Muốn xem từng stage của aggregation trong Compass: chọn collection, mở tab **Aggregations**, chuyển sang chế độ text và dán mảng pipeline của mục tương ứng.

## 01 — Truy vấn cơ bản

| # | Nội dung | Kỹ thuật |
|---|---|---|
| 1 | Danh sách khách hàng | `find` + projection, `sort`, `limit` |
| 2 | Số phiếu đang mở | `countDocuments` |
| 3 | Phiếu nhận trong tháng 9/2026 | `$gte`/`$lt` trên kiểu date |
| 4 | Phiếu đang chờ | `$in` |
| 5 | Phiếu laptop của một kỹ thuật viên | dot notation vào document nhúng |
| 6 | Phiếu từng chuyển "Chờ trả máy" | `$elemMatch` trên mảng `statusHistory` |
| 7 | Email theo mẫu, phiếu có đánh giá, danh sách hãng | `$regex`, `$exists`, `distinct` |
| 8 | Thêm, sửa, xóa | `insertOne/Many`, `updateOne/Many` (`$set`, `$inc`, `$push`), `deleteOne` trên collection tạm `demo_crud`, xóa ở cuối |

## 02 — Truy vấn nâng cao (aggregation pipeline)

Mục 1–5 chính là pipeline ứng dụng dùng cho trang Báo cáo (`Services/Reporting/ReportService.cs`).

| # | Nội dung | Stage chính |
|---|---|---|
| 1 | Doanh thu theo tháng | `$match`, `$group` + `$dateToString` (giờ VN), `$sort` |
| 2 | Phiếu theo trạng thái | `$group` |
| 3 | Tỉ lệ bảo hành miễn phí / tính phí | `$group` + `$cond`, `$project` + `$round` |
| 4 | Thời gian xử lý tổng thể và theo nhóm thiết bị | `$project` tính giờ, `$facet` |
| 5 | Phân bố SLA phiếu đang mở | `$group` + `$cond` so với thời điểm hiện tại |
| 6 | Hiệu suất kỹ thuật viên | `$group`, `$filter`/`$size`, `$lookup` sang `employees` |
| 7 | Linh kiện tiêu thụ nhiều nhất | `$unwind` mảng `lines`, `$lookup` sang `parts` |
| 8 | Khách chi tiêu nhiều nhất | `$lookup` có pipeline con, `$expr` |
| 9 | Phân bố điểm đánh giá; doanh thu lũy kế | `$bucket`; `$setWindowFields` |
| 10 | Tìm phiếu theo triệu chứng | `$text` + `textScore` (index `ticket_text`) |
| 11 | Dòng thời gian một phiếu | `$unwind` lịch sử nhúng |
| 12 | Lưu báo cáo thành collection | `$merge` (collection tạm, xóa ở cuối) |

## 03 — Chỉ mục, kế hoạch truy vấn và ràng buộc schema

| # | Nội dung |
|---|---|
| 1 | Liệt kê index unique, partial, collation, multikey, TTL, text |
| 2 | `explain("executionStats")`: IXSCAN (đọc 1 document) so với COLLSCAN (đọc toàn bộ) |
| 3 | Index partial `ticket_open_device` giữ luật "mỗi thiết bị một phiếu đang mở" |
| 4 | Validator `$jsonSchema` của 7 collection nghiệp vụ |
| 5 | Ghi phiếu thu sai schema bị MongoDB từ chối (mã 121) |
| 6 | Thống kê dung lượng dữ liệu và index |
| 7 | Trạng thái replica set (cần cho transaction đa document) |
