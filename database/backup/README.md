# Sao lưu, khôi phục, import và export

Ba cách, từ công cụ chuẩn của MongoDB đến thao tác ngay trong ứng dụng.

| Cách | Dùng khi | Công cụ |
|---|---|---|
| `backup.ps1` / `restore.ps1` | Sao lưu và khôi phục **cả database** (dữ liệu BSON, index, validator) | `mongodump` / `mongorestore` |
| `mongoexport` / `mongoimport`, hoặc Compass | Xuất/nhập **một collection** ra JSON hoặc CSV | MongoDB Database Tools hoặc Compass |
| Trang quản trị → **Sao lưu dữ liệu** | Quản trị viên tải bản sao lưu ngay trên web | API `GET /api/v1/admin/backup` (xem cuối trang) |
| `database/*.full.js` | Bản xuất dạng script mongosh, không cần Database Tools | `mongosh --file` (xem [`database/README.md`](../README.md)) |

## Cài MongoDB Database Tools

Bộ công cụ không đi kèm MongoDB Server. Tải bản zip cho Windows từ trang chính thức <https://www.mongodb.com/try/download/database-tools> (dự án dùng `mongodb-database-tools-windows-x86_64-100.19.0.zip`) và giải nén sao cho có `tools\mongodb-database-tools\bin\mongodump.exe` trong thư mục dự án. Thư mục `tools\` và `backups\` không đưa vào git.

## Sao lưu và khôi phục cả database

```powershell
.\database\backup\backup.ps1                                   # soopi_mongodb → backups\soopi_mongodb-<thời điểm>.archive.gz (+ tệp đính kèm .zip)
.\database\backup\backup.ps1 -Database soopi_mongodb_demo -SkipFiles

.\database\backup\restore.ps1 -Archive .\backups\soopi_mongodb_demo-20261028-194159.archive.gz
#   → khôi phục vào database MỚI soopi_mongodb_demo_restore; báo lỗi nếu database đích đã có dữ liệu
.\database\backup\restore.ps1 -Archive <tệp> -Target soopi_mongodb_copy
.\database\backup\restore.ps1 -Archive <tệp> -Target soopi_mongodb -Drop   # thay hẳn database đích, không hoàn tác được
```

- `--archive --gzip`: một tệp nén duy nhất (bản demo khoảng 180 KB cho 4.500 document).
- `mongorestore --nsFrom/--nsTo` đổi tên database khi khôi phục, nên có thể khôi phục song song với database đang dùng để đối chiếu.
- Index, tùy chọn collection và validator `$jsonSchema` được khôi phục cùng dữ liệu.
- Ảnh và chữ ký nằm trên đĩa (`backend-dotnet/src/Soopi.Api/data/files`), MongoDB chỉ lưu metadata; `backup.ps1` nén kèm thư mục này. Khi khôi phục, giải nén tệp `-files.zip` về đúng thư mục đó.

Đã kiểm chứng trên `soopi_mongodb_demo`: sao lưu, khôi phục sang database mới được đúng 4.532/4.532 document, đủ 7 validator và index TTL; khôi phục vào database đã có dữ liệu bị chặn.

## Export và import một collection

```powershell
$bin = ".\tools\mongodb-database-tools\bin"; $uri = "mongodb://127.0.0.1:27017/?replicaSet=rs0"

# JSON (Extended JSON giữ kiểu Date/Decimal128), mảng JSON để mở bằng trình soạn thảo
& "$bin\mongoexport.exe" --uri $uri --db soopi_mongodb_demo --collection customers --jsonArray --out backups\customers.json

# CSV cho Excel: chọn trường cụ thể
& "$bin\mongoexport.exe" --uri $uri --db soopi_mongodb_demo --collection payments --type=csv `
    --fields "_id,ticketId,type,method,amount,paidAt" --out backups\payments.csv

# Có thể lọc khi xuất (ví dụ phiếu đã bàn giao)
& "$bin\mongoexport.exe" --uri $uri --db soopi_mongodb_demo --collection tickets --query '{\"status\":\"DELIVERED\"}' --out backups\delivered.json

# Nhập lại vào database khác
& "$bin\mongoimport.exe" --uri $uri --db soopi_import --collection customers --jsonArray --file backups\customers.json
```

Đã kiểm chứng: 84 khách xuất ra JSON rồi nhập vào database mới đủ 84 document, `createdAt` vẫn là kiểu Date.

Trong **Compass**: mở collection → nút **Export Data** (chọn JSON/CSV, có thể chỉ xuất kết quả của bộ lọc đang áp) và **Add Data → Import JSON or CSV file**.

## Sao lưu trên trang quản trị

Quản trị viên vào **Quản trị → Sao lưu dữ liệu** để tải tệp `.zip` gồm mỗi collection một tệp Extended JSON (`<collection>.json`, đúng định dạng `mongoimport --jsonArray`), `manifest.json` (số document, thời điểm) và `restore.js` (nạp lại bằng mongosh vào database mới). Tệp này không chứa hash mật khẩu và phiên đăng nhập.

```powershell
Expand-Archive .\soopi-backup-20261028-1200.zip -DestinationPath .\backups\tu-web
mongosh "mongodb://127.0.0.1:27017/?replicaSet=rs0" --file .\backups\tu-web\restore.js   # → database soopi_mongodb_webrestore
```
