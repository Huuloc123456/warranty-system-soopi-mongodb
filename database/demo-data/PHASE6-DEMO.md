# Demo Phase6 — dữ liệu đã chuẩn bị ngày 30/10/2026

## Mở đúng dữ liệu

Tại thư mục gốc project:

```powershell
.\run.bat demo
```

Mở **http://localhost:8081/login**. Database là **`soopi_mongodb_demo`**; trong Compass dùng `mongodb://127.0.0.1:27017/?replicaSet=rs0` và Refresh. `run.bat` không có tham số sẽ mở database khác, chỉ có 13 phiếu kiểm thử cũ.

Dữ liệu đã được thêm vào MongoDB, không cần chạy lại bộ sinh hay demo-restore. Bản snapshot `database/soopi_mongodb_demo.full.js` đã xuất lại ngày 30/10/2026, gồm 210 phiếu và 13 phiếu mới dưới đây; trên máy khác nạp bằng `run.bat demo-restore` (database phải chưa có). Tệp chữ ký nằm trên đĩa, không có trong snapshot.

Các tài khoản `admin`, `receptionist`, `dispatcher`, `technician`, `technician2`, `warehouse`, `cashier`, `0900000001` có mật khẩu **`1234`** ở Development. Khách mới dùng email đã xác minh; `0900000001` là tài khoản demo cũ vẫn đăng nhập bằng SĐT.

## Điểm dừng để trình diễn

Các phiếu được tạo trong đợt `P6-20261030033028`. Tìm bằng mã đầy đủ hoặc tiền tố **`TN-2026-1030`** trong màn có ô tìm kiếm. Chọn đúng tài khoản KTV được giao; KTV khác không ghi được kết quả.

| Mã phiếu | Trạng thái chuẩn bị | Vai trò / thao tác demo tiếp theo |
|---|---|---|
| `TN-2026-1030-00001` | RECEIVED | `dispatcher`: mở chi tiết, xem SLA, phân công KTV. |
| `TN-2026-1030-00002` | INSPECTING | `technician2`: kiểm tra, lưu chẩn đoán và phân loại bảo hành. |
| `TN-2026-1030-00003` | DIAGNOSED, miễn phí | `technician`: bắt đầu sửa miễn phí. |
| `TN-2026-1030-00004` | AWAITING_QUOTE_APPROVAL | `dispatcher`: duyệt báo giá `BG-2026-1030-00001`, tổng 270.000đ. |
| `TN-2026-1030-00005` | AWAITING_CUSTOMER_CONFIRMATION | Khách `0900000001`: vào lịch sử/chi tiết, đồng ý báo giá `BG-2026-1030-00002`. Sau đó `technician` tiếp tục xử lý. |
| `TN-2026-1030-00006` | AWAITING_PARTS | `warehouse`: tìm phiếu xuất **`PX-2026-00092`**, duyệt 1 pin `LK-LAP-PIN` từ kệ **C1**. Phiếu chuyển sang REPAIRING, giao `technician2`. |
| `TN-2026-1030-00007` | REPAIRING, miễn phí | `technician`: lưu kết quả sửa và đủ 6 bước QC. Có thể trình diễn FAIL rồi PASS; FAIL giữ đang sửa. |
| `TN-2026-1030-00008` | COMPLETED, chưa thu phí | `cashier`: xác nhận thu **270.000đ**, rồi nghiệm thu, ký và bàn giao. |
| `TN-2026-1030-00009` | COMPLETED, miễn phí | `cashier`: xác nhận miễn phí trước, rồi nghiệm thu/ký bàn giao. |
| `TN-2026-1030-00010` | AWAITING_RETURN | `cashier`: hoàn tất trả máy không sửa, không giả lập QC hay thu tiền sửa. |
| `TN-2026-1030-00011` | DELIVERED | Khách `0900000001` xem lịch sử, đánh giá 5 sao; `technician` xem hai lượt QC FAIL/PASS. Đã thu 270.000đ, phiếu `PT-2026-00171`. |
| `TN-2026-1030-00012` | RETURNED_UNREPAIRED | Xem lịch sử và lý do bo mạch không thể khắc phục; đã trả nguyên trạng. |
| `TN-2026-1030-00013` | COMPLETED, đã thu phí | `cashier`: trình diễn nghiệm thu/ký bàn giao ngay. Phiếu thu `PT-2026-00172`, 270.000đ, không thu lần hai. |

Yêu cầu online chờ tiếp nhận: **`YC-2026-1030-00001`**, khách Nguyễn Thanh Hòa (demo), SĐT **`0886836199`**, serial `P6-20261030033028-ONLINE`. `receptionist` mở danh sách yêu cầu để tiếp nhận thực tế.

Phiếu nhập đã duyệt: **`PN-2026-00008`**, 12 pin laptop tại C1. Ngay sau chuẩn bị, `LK-LAP-PIN` có **onHand 179, reserved 1, available 178**. Khi duyệt PX trên, onHand còn 178 và reserved về 0, nếu chưa có thao tác khác.

## Kịch bản thuyết trình khoảng 10–15 phút

1. Admin mở báo cáo lịch sử tháng 5–10/2026: doanh thu, trạng thái, tỉ lệ bảo hành. Nêu dữ liệu giả lập được lưu thật trong MongoDB, không phải giao dịch/khách hàng thực.
2. Lễ tân mở yêu cầu online hoặc phiếu `00001`; điều phối minh họa phân công và duyệt báo giá ở `00004`.
3. Khách `0900000001` đồng ý báo giá ở `00005`. Mở riêng `00011` để cho thấy tiến độ, lịch sử và đánh giá đã có.
4. Thủ kho duyệt PX `00092`, chỉ ra thay đổi onHand/reserved/available và kệ C1.
5. KTV `technician` hoàn tất QC trên `00007`; phân biệt COMPLETED với DELIVERED.
6. Thu ngân mở `00008` hoặc `00009` để xác nhận có phí/miễn phí. Dùng `00013` nếu cần trình diễn nhanh phần ký/bàn giao mà không thu tiền lại.
7. Xem phiếu `00010`/`00012` để minh họa trả máy không sửa; kết thúc bằng nhật ký và document trong Compass.

Các bước demo sẽ thay đổi trạng thái và số liệu thật trong database demo. Mã trạng thái ở bảng là thời điểm chuẩn bị, không phải cam kết dữ liệu không đổi sau khi thao tác.

## Kiểm chứng và bản sao

Nhật ký [phase6-result.json](phase6-result.json) không chứa access/refresh token. [phase6-verification.json](phase6-verification.json) ghi số liệu và kết quả đối chiếu trực tiếp MongoDB. Kiểm tra lại, từ thư mục gốc:

```powershell
mongosh 'mongodb://127.0.0.1:27017/?replicaSet=rs0' --quiet --file database/demo-data/verify-phase6.js
```

Script kiểm tra trạng thái ban đầu; sau khi demo chuyển phiếu sang bước khác thì nó sẽ báo không còn khớp mốc chuẩn bị. Đây không tự động là lỗi ứng dụng.

Bản sao đầy đủ đang có ở máy này (không đưa vào Git):

- Trước bổ sung: `backups/soopi_mongodb_demo-before-phase6-20261030.archive.gz` và `backups/soopi-files-before-phase6-20261030.zip`.
- Sẵn sàng demo: `backups/soopi_mongodb_demo-phase6-ready-20261030.archive.gz` và `backups/soopi-files-phase6-ready-20261030.zip`.

Muốn trở lại mốc trước demo, khôi phục archive vào **database tên mới còn trống** theo [hướng dẫn backup](../backup/README.md), kèm thư mục tệp, rồi chạy API với `--Mongo:Database=<tên mới>`. Không cần xóa database đang dùng. Bản sao kèm hash mật khẩu demo; chỉ dùng local.

## Tạo một bộ mới trên database demo khác

Chỉ dùng khi chủ động chuẩn bị một đợt khác. Bộ sinh cần database có danh mục demo 6 tháng và các tài khoản ở trên. Chạy API ở terminal riêng:

```powershell
dotnet run --project backend-dotnet/src/Soopi.Api --launch-profile http -- --urls=http://localhost:8083 --Mongo:Database=soopi_mongodb_demo --Sla:Alerts:Enabled=false
node database/demo-data/prepare-phase6.mjs
```

Đây là địa chỉ cho script chuẩn bị; để demo trên trình duyệt dùng `run.bat demo` tại cổng 8081 theo hướng dẫn đầu trang. Script chặn chạy lặp khi `phase6-result.json` ghi nhận đã bắt đầu tạo chứng từ. Giữ nhật ký đợt hiện có trước khi chủ động tổ chức đợt mới; không bỏ chặn để chạy lại trên dữ liệu không rõ trạng thái. Nếu preflight gặp giới hạn đăng nhập, đợi ít nhất một phút rồi chạy lại; script không giảm giới hạn bảo vệ của API.

Tên, địa chỉ và SĐT trong bộ mới là giả lập; email dùng `example.invalid`; chữ ký PNG ghi rõ minh họa. Không gửi thư/OTP, không kết nối thanh toán ngoài hệ thống. Mức VAT 8% là giá trị mẫu của báo giá demo, không phải tư vấn thuế.
