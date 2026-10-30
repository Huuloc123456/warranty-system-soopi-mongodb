# Dữ liệu demo 6 tháng

Đã có thêm [bộ demo trực tiếp Phase6 ngày 30/10/2026](PHASE6-DEMO.md): 13 phiếu mới ở đủ 11 trạng thái, nâng database local `soopi_mongodb_demo` lên 210 phiếu. Chạy `run.bat demo` để dùng dữ liệu đã nạp. File `database/soopi_mongodb_demo.full.js` được xuất lại ngày 30/10/2026 và đã chứa phần bổ sung Phase6 (4.825 document). Bảng bên dưới mô tả bộ sinh gốc 197 phiếu.

Database **`soopi_mongodb_demo`** chứa lịch sử vận hành giả lập của trung tâm trong khoảng 180 ngày, dùng cho demo và các truy vấn ở [`database/queries`](../queries). Database dùng hằng ngày `soopi_mongodb` không bị thay đổi.

| Nội dung | Số lượng (seed 20261028) |
|---|---|
| Phiếu tiếp nhận | 197, trải đều tháng 5–10/2026 (25–45 phiếu/tháng) |
| Trạng thái | 170 đã bàn giao, 15 trả máy không sửa, 12 đang xử lý |
| Khách hàng | 83 (cộng khách demo `0900000001`) |
| Yêu cầu bảo hành online | 27 (đa số chuyển thành phiếu, một phần bị hủy) |
| Kỹ thuật viên | 4 (2 tạo mới qua trang quản trị) |
| Danh mục | 11 hãng, 19 sản phẩm, 14 linh kiện, 4 bảng giá dịch vụ |
| Tổng document | khoảng 4.500 trong 25 collection |

Các tình huống có trong dữ liệu: bảo hành miễn phí (có hoặc không cần linh kiện), sửa có phí, điều phối trả báo giá về để lập lại, báo giá hết hạn rồi lập lại, khách từ chối báo giá, khách đổi ý ngay tại quầy, không sửa được (trả máy), kiểm tra chất lượng lần đầu chưa đạt, máy quay lại sửa lần hai, khách đánh giá trên cổng khách hàng, nhập kho định kỳ.

## Dùng ngay bản có sẵn

```powershell
.\run.bat demo-restore   # nạp database\soopi_mongodb_demo.full.js vào soopi_mongodb_demo (database phải chưa có)
.\run.bat demo           # chạy ứng dụng trên soopi_mongodb_demo tại http://localhost:8081
```

Tài khoản giống database thường (mật khẩu `1234`), cộng hai kỹ thuật viên mới `kythuat.bao` và `kythuat.ha`, mật khẩu `Soopi@Demo2026`.

Ảnh chữ ký bàn giao chỉ được lưu dạng metadata trong `attachments`; tệp ảnh nằm ở `backend-dotnet/src/Soopi.Api/data/files` của máy đã sinh dữ liệu (không có trong git). Nạp bản xuất trên máy khác thì mọi dữ liệu khác đầy đủ, riêng ảnh chữ ký của phiếu cũ không mở được; dùng `demo-generate` nếu cần đủ ảnh.

Muốn nạp lại từ đầu, xóa database cũ trong Compass (hoặc `db.getSiblingDB('soopi_mongodb_demo').dropDatabase()` trong mongosh) rồi chạy lại `demo-restore`.

## Sinh lại dữ liệu

`generate.mjs` gọi chính API của ứng dụng (đăng nhập theo từng vai trò, tạo khách, thiết bị, phiếu, báo giá, phiếu xuất, thu tiền, bàn giao…), nên mọi document đều đi qua đủ luật nghiệp vụ, mã nghiệp vụ, bộ đếm, nhật ký và `$jsonSchema`. Mỗi request gửi header `X-Demo-Now` để lùi "thời điểm hiện tại"; header này chỉ có tác dụng khi API chạy ở Development với `--Demo:ClockOverride=true` (`Infrastructure/DemoClock.cs`). Bước nào rơi vào tương lai thì dừng, nên phiếu gần đây nằm lại ở trạng thái đang xử lý.

```powershell
.\run.bat demo-generate  # mở API ở cửa sổ riêng trên soopi_mongodb_demo rồi chạy generate.mjs (khoảng 2–3 phút)
```

Hoặc chạy tay hai terminal:

```powershell
dotnet run --project backend-dotnet/src/Soopi.Api --launch-profile http -- --Mongo:Database=soopi_mongodb_demo --Demo:ClockOverride=true
node database/demo-data/generate.mjs
```

Biến môi trường của bộ sinh: `TICKETS` (mặc định 200), `DAYS` (180), `SEED` (20261028), `SOOPI_URL` (`http://localhost:8081`). Cùng `SEED` thì đầu vào giống nhau; mốc thời gian tính lùi từ lúc chạy.

Sau khi sinh, xuất lại bản có sẵn:

```powershell
$env:SOOPI_EXPORT_DB = 'soopi_mongodb_demo'
try { mongosh 'mongodb://127.0.0.1:27017/?replicaSet=rs0' --quiet --file database/export-current.js }
finally { Remove-Item Env:SOOPI_EXPORT_DB -ErrorAction SilentlyContinue }
```
