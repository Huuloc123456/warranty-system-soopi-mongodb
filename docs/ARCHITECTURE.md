# Kiến trúc Soopi MongoDB

## Kế thừa

Giữ nguyên controller, DTO, luật phân quyền, máy trạng thái, luật tính tiền, giao diện React và tài sản thương hiệu từ Soopi. URL/JSON API được giữ cho frontend và client hiện có. Project và User Secrets độc lập; backend 8081, Vite 5174.

## Lưu trữ

MongoDB.Driver 3.12.0, database mới `soopi_mongodb` trên replica set local `rs0`. Mỗi request dùng AppDbContext riêng cùng MongoClient dùng chung; truy vấn LINQ được dịch và chạy tại MongoDB, không nạp toàn bộ database vào bộ nhớ. Các entity tài khoản/hồ sơ được theo dõi riêng, so sánh document gốc khi lưu để tránh mất cập nhật.

| Collection | Dữ liệu |
|---|---|
| `accounts`, `employees`, `customers`, `refresh_tokens`, `otp_codes` | Tài khoản, vai trò nhúng, hồ sơ và phiên đăng nhập |
| `devices` | Thiết bị với serial chuẩn hóa và ngày bảo hành |
| `tickets` | Phiếu với phân công, chẩn đoán, lịch sử trạng thái, ghi chú, kết quả QC và bàn giao nhúng |
| `quotations` | Báo giá, dòng chi tiết, duyệt nội bộ và quyết định khách |
| `parts` | Linh kiện, tồn thực tế, lượng đã giữ và tồn theo kệ nhúng |
| `stock_receipts`, `stock_issues`, `stock_transfers`, `payments` | Chứng từ nhập/xuất/điều chuyển và thu tiền |
| `warranty_requests`, `attachments` | Yêu cầu online và metadata tệp; nội dung tệp trên đĩa |
| `audit_logs`, `notifications` | Nhật ký và thông báo, danh sách tài khoản đã đọc nhúng |
| `counters` | Bộ đếm mã nghiệp vụ/ID bằng `$inc` nguyên tử |
| `service_stations`, `device_categories`, `brands`, `products`, `warranty_policies`, `service_prices`, `suppliers` | Danh mục; loại thiết bị nhúng trong nhóm |

Thời điểm lưu BSON DateTime UTC; ngày lịch lưu chuỗi `yyyy-MM-dd`; tiền lưu Decimal128. Mã nghiệp vụ dạng TN/KH/NV/BG/PX được giữ, không đổi sang ObjectId ở API.

## Nhất quán và bảo vệ dữ liệu

Transaction kho/thu tiền dùng một session, snapshot read concern và majority write concern. Không chạy song song các thao tác trong cùng transaction. Xung đột được thử lại tối đa 3 lần; callback sau commit chạy sau khi commit thành công. Commit chưa rõ kết quả được thử lại trên cùng transaction, giới hạn thời gian 30 giây.

Unique/partial index bảo vệ tên đăng nhập, serial, số điện thoại khách đang hoạt động, thiết bị có phiếu mở, báo giá đang hiệu lực, phiếu xuất đang chờ và một phiếu thu mỗi phiếu tiếp nhận. Phiếu kiểm `version` khi lưu. Giữ/trừ tồn dùng update có điều kiện, cùng transaction với chứng từ. Tham chiếu danh mục được kiểm trước khi ghi; loại thiết bị có unique multikey index.

Refresh token chỉ lưu hash, xoay vòng theo họ token; đọc lại trong transaction khi thử lại. Phát hiện dùng lại token thu hồi họ token đó. Phân quyền và kiểm quyền sở hữu tệp/portal vẫn ở backend.

Validator `$jsonSchema` (`Data/MongoSchemas.cs`) trên `tickets`, `quotations`, `payments`, `customers`, `devices`, `parts`, `stock_issues`: trường bắt buộc, kiểu BSON (tiền decimal, thời điểm date), tập trạng thái, tiền tố mã nghiệp vụ, tồn kho không âm. `validationLevel: moderate`, `validationAction: error`; áp bằng `collMod` mỗi lần khởi động nên database cũ cũng nhận. Đây là lớp phòng thủ dưới luật nghiệp vụ của API.

Index TTL tự xóa refresh token sau hạn 7 ngày và OTP sau hạn 1 ngày (database cũ có index thường được chuyển sang TTL bằng `collMod`). Text index `ticket_text` trên triệu chứng và kết quả kiểm tra, `default_language: none` vì MongoDB không có bộ stemming tiếng Việt.

## Báo cáo bằng aggregation pipeline

Doanh thu theo tháng, phiếu theo trạng thái, tỉ lệ bảo hành, thời gian xử lý và phân bố SLA chạy bằng aggregation pipeline tại MongoDB (`$match`, `$lookup`, `$group` + `$dateToString` giờ VN, `$cond`, `$facet`). Kết quả đã đối chiếu từng byte với bản tổng hợp trong bộ nhớ trước đó trên 30 truy vấn mẫu. Hiệu suất kỹ thuật viên, sửa lặp lại, đối soát báo giá và đánh giá khách vẫn lọc tại MongoDB rồi tổng hợp trong bộ nhớ.

## Giới hạn đã ghi nhận

OTP gửi qua Gmail SMTP khi có mật khẩu ứng dụng; không có push hay app di động, thông báo chỉ hiển thị trong web. Không chuyển dữ liệu SQL Server hay `service_center` sang database mới.

## Tài liệu chính thức

- https://www.mongodb.com/docs/drivers/csharp/current/crud/transactions/
- https://www.mongodb.com/docs/drivers/csharp/current/serialization/class-mapping/
- https://www.nuget.org/packages/MongoDB.Driver/3.12.0
