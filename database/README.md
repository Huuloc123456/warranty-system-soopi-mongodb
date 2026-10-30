# Script MongoDB hiện tại của Soopi

Được xuất trực tiếp từ database `soopi_mongodb` đang chạy tại máy local. Thời điểm xuất, số lượng bản ghi và SHA-256 từng collection nằm trong `snapshot-manifest.json`.

| File | Nội dung |
|---|---|
| `soopi_mongodb.full.js` | Tạo toàn bộ collection, index và chèn toàn bộ dữ liệu tại thời điểm xuất, kể cả counter, tài khoản và nhật ký. Chạy độc lập, không cần đọc file manifest. |
| `soopi_mongodb.schema.js` | Chỉ tạo collection và index, không chèn dữ liệu. |
| `snapshot-manifest.json` | Số lượng document/index và checksum để đối chiếu. |
| `export-current.js` | Xuất lại script từ database local khi dữ liệu thay đổi. Biến `SOOPI_EXPORT_DB` chọn database nguồn khác; file mang tên database đó. |
| `soopi_mongodb_demo.full.js`, `.schema.js`, `.manifest.json` | Bản xuất dữ liệu demo 6 tháng (4.807 document, 210 phiếu, đã gồm dữ liệu Phase6; kèm validator `$jsonSchema`, TTL và text index). Nạp bằng `run.bat demo-restore`; xem [`demo-data`](demo-data). |
| [`queries/`](queries) | Bộ truy vấn cơ bản, aggregation nâng cao, index và schema chạy trong Compass/mongosh. |

## Chạy script đầy đủ

Mở PowerShell tại thư mục gốc dự án:

```powershell
mongosh 'mongodb://127.0.0.1:27017/?replicaSet=rs0' --quiet --file database/soopi_mongodb.full.js
```

Mặc định tạo database mới **`soopi_mongodb_restore`**. Script dừng trước khi ghi nếu database đích đã có bất kỳ collection nào; không tự xóa hoặc ghi đè database đang dùng.

Để chọn tên khác, đặt biến môi trường cho lần chạy:

```powershell
$env:SOOPI_RESTORE_DB = 'soopi_mongodb_copy'
try {
    mongosh 'mongodb://127.0.0.1:27017/?replicaSet=rs0' --quiet --file database/soopi_mongodb.full.js
} finally {
    Remove-Item Env:SOOPI_RESTORE_DB -ErrorAction SilentlyContinue
}
```

Có thể chọn tên `soopi_mongodb` trên máy mới, với điều kiện database đó chưa có collection. Nếu muốn ứng dụng dùng bản khôi phục mang tên khác, cấu hình `Mongo__Database` bằng tên đó.

## Chỉ tạo cấu trúc và index

```powershell
mongosh 'mongodb://127.0.0.1:27017/?replicaSet=rs0' --quiet --file database/soopi_mongodb.schema.js
```

Mặc định tạo database **`soopi_mongodb_schema`**. Biến `SOOPI_RESTORE_DB` cũng áp dụng cho script này. Không chạy schema rồi full vào cùng database: bản full đã chứa cả schema.

## Xuất lại dữ liệu hiện tại

```powershell
mongosh 'mongodb://127.0.0.1:27017/?replicaSet=rs0' --quiet --file database/export-current.js
```

Lệnh chỉ đọc database nguồn và cập nhật ba file full/schema/manifest trong thư mục này. Dữ liệu được đọc trong một transaction `snapshot`; giữ kiểu BSON bằng Extended JSON chuẩn, bao gồm `Date`, `Decimal128`, `Int64`, `Int32` và `ObjectId` nếu có. Index, partial filter, unique và collation lấy từ database thực tế, không tự thêm ràng buộc từ code khởi tạo.

## Phạm vi

- Bản full chứa dữ liệu hồ sơ khách hàng, hash mật khẩu và hash phiên đăng nhập đang lưu trong database; cần quản lý như một bản sao database.
- Collection `attachments` chỉ lưu metadata. Ảnh và chữ ký phải sao chép riêng từ `backend-dotnet/src/Soopi.Api/data/files`, hoặc đường dẫn `Storage:Directory` thực tế khi chạy ứng dụng.
- Không xuất tài khoản quản trị MongoDB, cấu hình replica set hoặc các database khác. MongoDB đích cần replica set nếu dùng để chạy ứng dụng Soopi.
- Script dừng ngay khi có lỗi. Nếu khôi phục bị gián đoạn, chọn database đích trống khác cho lần chạy tiếp theo.

## Kiểm chứng bản xuất này

Xuất lại ngày 30/10/2026: `soopi_mongodb` có 26 collection, 52 index, 700 document; `soopi_mongodb_demo` có 26 collection, 54 index, 4.807 document. Đã khôi phục cả hai bản full vào database kiểm thử riêng và đối chiếu SHA-256 với manifest: số document, dữ liệu, index và collection options khớp toàn bộ, không collection nào lệch; database kiểm thử đã được xóa. Bốn script full/schema qua `node --check`.

Lần kiểm chứng trước (bản xuất 21/10, 689 document): đã chạy cả bản full và schema trên database kiểm thử riêng. Đã đối chiếu SHA-256 dữ liệu Extended JSON chuẩn, index và collection options của từng collection; kiểm tra chặn database đã có collection và database hệ thống. Database kiểm thử đã được dọn; checksum dữ liệu nguồn sau kiểm thử vẫn khớp bản xuất. Cả ba script JavaScript đều qua kiểm tra cú pháp `node --check`.

Tham khảo cách chạy file JavaScript: [MongoDB Shell — Write Scripts](https://www.mongodb.com/docs/mongodb-shell/write-scripts/).
