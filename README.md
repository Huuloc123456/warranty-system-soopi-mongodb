# Soopi — MongoDB local

Project riêng từ `../warranty-system-soopi`, giữ ASP.NET Core .NET 10, React/Vite/TypeScript, toàn bộ controller và giao diện. Lớp lưu trữ dùng MongoDB C# Driver; không cần SQL Server.

## Chạy trên máy hiện tại

MongoDB local đã có replica set `rs0`. Chạy `run.bat` tại thư mục project, rồi mở **http://localhost:8081**. Launcher cài frontend từ lockfile nếu cần, build giao diện và chạy API. Dừng bằng Ctrl+C. Nếu API đang mở từ phiên Codex, dừng phiên đó trước khi chạy lại để tránh trùng cổng.

```powershell
.\run.bat
```

Database: **`soopi_mongodb`**. Trong MongoDB Compass dùng connection hiện có và bấm Refresh. Nếu cần tạo connection mới:

```text
mongodb://127.0.0.1:27017/?replicaSet=rs0
```

Collection, unique index và dữ liệu demo được tạo khi chạy lần đầu ở Development; các lần sau không ghi đè tài khoản/danh mục. Không đọc hay sao chép dữ liệu từ `service_center` hoặc SQL Server. Database mới có các chứng từ demo do bộ kiểm chứng tạo, được ghi rõ là kiểm thử.

### Dữ liệu demo 6 tháng (cho báo cáo NoSQL)

```powershell
.\run.bat demo-restore   # nạp 4.825 document vào soopi_mongodb_demo (một lần)
.\run.bat demo           # chạy ứng dụng trên soopi_mongodb_demo
```

Bộ truy vấn cơ bản, aggregation nâng cao, index và `$jsonSchema` để chạy trong Compass nằm ở [`database/queries`](database/queries). Cách sinh lại dữ liệu: [`database/demo-data`](database/demo-data).

Chuẩn bị thuyết trình: [13 tình huống demo Phase6 đã lưu trong MongoDB local](database/demo-data/PHASE6-DEMO.md).

## Tài khoản demo

Mật khẩu chung trong Development: **`1234`**.

Tất cả tài khoản dùng chung trang **http://localhost:8081/login**. Sau khi đăng nhập, ứng dụng chuyển đến trang theo vai trò; nhân viên mở liên kết từ trang khách hàng cũng được chuyển về màn hình công việc của mình.

| Tên đăng nhập | Vai trò |
|---|---|
| `admin` | Quản trị viên |
| `receptionist` | Lễ tân |
| `dispatcher` | Điều phối |
| `technician`, `technician2` | Kỹ thuật viên |
| `warehouse` | Thủ kho |
| `cashier` | Thu ngân |
| `0900000001` | Khách hàng demo |

Đây là tài khoản và dữ liệu giả để phát triển local. `Mongo:SeedDemo` mặc định tắt, chỉ được bật trong cấu hình Development; production yêu cầu khóa JWT RSA riêng như bản gốc.

## Phát triển

```powershell
# API, cổng 8081
dotnet run --project backend-dotnet/src/Soopi.Api --launch-profile http

# Frontend ở terminal khác, cổng 5174 và proxy về API 8081
Set-Location frontend-react
npm.cmd run dev
```

`Mongo:ConnectionString` và `Mongo:Database` nằm trong `backend-dotnet/src/Soopi.Api/appsettings.json`. Khi cấu hình môi trường khác dùng biến `Mongo__ConnectionString`, `Mongo__Database` hoặc User Secrets của project mới (`soopi-mongodb-local`). Không đặt URI có mật khẩu vào Git.

### Gửi mã xác minh qua email

Ứng dụng gửi OTP đăng ký, xác minh email và khôi phục mật khẩu từ `hsostd74@gmail.com` qua Gmail SMTP (`smtp.gmail.com:587`, STARTTLS). Cần bật xác minh hai bước cho tài khoản Gmail rồi tạo **mật khẩu ứng dụng**; lưu mật khẩu đó dưới khóa `Email:AppPassword` trong .NET User Secrets hoặc biến môi trường `Email__AppPassword`, không ghi vào `appsettings.json` hay Git. Nếu chưa cấu hình, API trả `OTP_SEND_FAILED` và không ghi mã OTP vào log. Xem [hướng dẫn mật khẩu ứng dụng của Google](https://support.google.com/mail/answer/185833?hl=vi).

Khách đăng ký mới dùng email đã xác minh để đăng nhập và khôi phục mật khẩu. Tài khoản cũ vẫn đăng nhập bằng số điện thoại cho tới khi khách mở **Hồ sơ cá nhân** và chọn **Gửi mã xác minh email**; sau khi xác minh, tên đăng nhập chuyển sang email và các phiên cũ bị thu hồi. Đổi email sẽ yêu cầu xác minh lại. Màn Quên mật khẩu chỉ nhận email đã xác minh.

`run.bat initdb` chỉ khởi tạo database/index/demo. File tải lên và chữ ký vẫn lưu tại `backend-dotnet/src/Soopi.Api/data/files`; MongoDB lưu metadata và quyền sở hữu, giữ cơ chế lưu tệp của Soopi. Khi sao lưu cần giữ cả database và thư mục này.

## Kiểm chứng

```powershell
dotnet test backend-dotnet/Soopi.slnx
node verification/check-contract.mjs
# API phải đang chạy. Lệnh này tạo dữ liệu demo/chứng từ kiểm thử trong soopi_mongodb.
node verification/mongo-smoke.mjs

Set-Location frontend-react
npm.cmd run build
npm.cmd run lint
npm.cmd test
```

Test integration dùng database `soopi_mongodb_test_<GUID>` riêng và chỉ dọn đúng database test vừa tạo. MongoDB cần hoạt động với replica set; không dùng database thật cho bộ test.

Xem [kết quả kiểm chứng](docs/VERIFICATION.md) và [kiến trúc MongoDB](docs/ARCHITECTURE.md).
