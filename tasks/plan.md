# Soopi MongoDB local

Người dùng đã xác nhận: tạo project riêng từ Soopi, database mới `soopi_mongodb`, giữ toàn bộ nghiệp vụ và giao diện ASP.NET Core .NET 10 + React.

## Thiết kế
- MongoDB C# Driver 3.12.0; không dùng SQL Server hoặc trình thông dịch SQL.
- MongoDB local `127.0.0.1:27017`, replica set `rs0` đã được kiểm tra chỉ đọc.
- Phiếu, báo giá và chứng từ kho là document với chi tiết/lịch sử nhúng. Mã nghiệp vụ và hợp đồng API giữ nguyên.
- Transaction đa document dùng một session theo request, kiểm phiên bản khi lưu phiếu; các unique index bảo vệ quy tắc và bộ đếm nguyên tử.
- Giao diện, logo, accessibility và responsive kế thừa PRODUCT.md/DESIGN.md; không thiết kế lại.
- Khởi tạo database mới với danh mục và tài khoản demo được ghi rõ là dữ liệu phát triển; không sao chép dữ liệu thật từ SQL Server hoặc service_center.
- API chạy cổng 8081, frontend 5174 để tách bản gốc.

## Kiểm chứng
Chạy test miền nghiệp vụ, test serialization MongoDB, test transaction/unique index/tồn kho trên database kiểm thử riêng; build và test frontend; smoke toàn bộ nhóm API và luồng nhận máy → sửa chữa → thu tiền → bàn giao. Đối chiếu method/route với bản gốc.

## Nguồn
- https://www.mongodb.com/docs/drivers/csharp/current/crud/transactions/
- https://www.mongodb.com/docs/drivers/csharp/current/serialization/class-mapping/
- https://www.nuget.org/packages/MongoDB.Driver/3.12.0
