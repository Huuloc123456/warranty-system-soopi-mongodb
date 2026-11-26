# Kịch bản thuyết trình và demo Soopi — Nhóm 2

**Thời lượng dự kiến 12 phút, chưa tính hỏi đáp.** Lời thoại bám theo [slide NoSQL 19 trang](Group2_QuanLyTrungTamBaoHanhDienTu_SlideNoSQL.pptx). Phần demo dùng các phiếu đã chuẩn bị trong [bộ dữ liệu Phase 6](../database/demo-data/PHASE6-DEMO.md).

| Thời gian | Người trình bày đề xuất | Nội dung |
| --- | --- | --- |
| 00:00–02:00 | Đỗ Lê Thanh Mẫn | Slide 1–5 · Bài toán, vai trò và công cụ |
| 02:00–04:30 | Bùi Hữu Lộc | Slide 6–16 · Mô hình document, nhất quán và truy vấn |
| 04:30–10:45 | Phan Minh Thiện | Slide 17 · Demo web và Compass |
| 10:45–12:00 | Phan Minh Thiện | Slide 18–19 · Kết quả, giới hạn và kết luận |

## Chuẩn bị trước giờ trình bày

1. Trên máy chưa có database demo, chạy `./run.bat demo-restore` một lần từ thư mục gốc. Snapshot Git gồm document và metadata tệp. Muốn xem lại tệp đính kèm đã tạo, chuẩn bị cả thư mục tệp theo [hướng dẫn Phase 6](../database/demo-data/PHASE6-DEMO.md). Phần ký trực tiếp dùng chữ ký mới vẽ trên màn hình.
2. Chạy `./run.bat demo` và kiểm tra terminal hiển thị database `soopi_mongodb_demo`. Nếu cổng 8081 đang phục vụ database `soopi_mongodb`, dừng phiên đó từ terminal đã mở nó trước khi chạy chế độ demo.
3. Mở [trang đăng nhập local](http://localhost:8081/login). Chuẩn bị phiên đăng nhập riêng cho từng vai trò sẽ chiếu, chẳng hạn dùng các hồ sơ trình duyệt khác nhau. Danh sách tài khoản và mật khẩu Development có trong [README](../README.md#tài-khoản-demo).
4. Mở MongoDB Compass, kết nối `mongodb://127.0.0.1:27017/?replicaSet=rs0`, chọn `soopi_mongodb_demo`. Chuẩn bị sẵn bộ lọc phiếu và pipeline ở mục demo MongoDB để dán khi trình bày.
5. Trước khi tập hoặc trình bày, đối chiếu trạng thái của các mã trong bảng bên dưới với [bảng Phase 6](../database/demo-data/PHASE6-DEMO.md#điểm-dừng-để-trình-diễn). Các thao tác xác nhận ghi vào database demo. Khi tập lại trên cùng dữ liệu, mở mốc đã ghi nhận hoặc dùng bản sao khôi phục vào database tên mới theo hướng dẫn Phase 6.

```powershell
.\run.bat demo-restore  # Chỉ dùng khi máy chưa có database demo
.\run.bat demo
```

## Lời thoại theo slide

### Slide 1–3 · Bài toán và quy trình

> Em chào thầy và các bạn. Nhóm 2 xin trình bày Soopi, hệ thống quản lý trung tâm bảo hành điện tử trên MongoDB. Khi khách mang một thiết bị đến, lễ tân cần biết máy nào được nhận, điều phối cần biết ai đang xử lý, còn khách cần biết chi phí và thời điểm có thể nhận máy. Nhóm dùng mã phiếu tiếp nhận để nối các bước này. Khách gửi yêu cầu và theo dõi tiến độ, lễ tân tiếp nhận, điều phối giao việc, kỹ thuật viên chẩn đoán và sửa, thủ kho xuất linh kiện, thu ngân thu phí và bàn giao. Quản trị viên quản lý tài khoản, danh mục và xem báo cáo.

### Slide 4–5 · Vì sao dùng MongoDB và dùng công cụ gì

> Khi mở chi tiết một phiếu, nhân viên thường cần xem phân công, chẩn đoán, lịch sử và kết quả sửa cùng lúc. MongoDB cho phép nhóm lưu những dữ liệu đó trong cùng một document. Các ca đang xử lý có thể bổ sung kết quả theo từng bước, còn các trường quan trọng vẫn được kiểm tra kiểu và giá trị bằng validator. Nhóm dùng Compass để quan sát document, chạy aggregation và xem kế hoạch truy vấn. `mongosh` dùng để chạy các script kiểm tra, còn MongoDB Database Tools dùng để sao lưu và khôi phục dữ liệu BSON.

> Sau đây, em mời bạn Lộc trình bày cách nhóm thiết kế dữ liệu và bảo vệ các quy tắc nghiệp vụ.

### Slide 6–8 · Nhúng, tham chiếu và số liệu demo

> Trong collection `tickets`, nhóm nhúng phân công, chẩn đoán, lịch sử trạng thái, kết quả kiểm tra sau sửa và bàn giao. `customerId` và `deviceId` tham chiếu hồ sơ gốc. Phiếu cũng lưu bản chụp tên khách và thông tin thiết bị tại thời điểm lập phiếu, nhờ vậy thông tin trên chứng từ cũ vẫn có ý nghĩa khi hồ sơ gốc được cập nhật. Báo giá, phiếu xuất và phiếu thu nằm ở các collection riêng vì có vòng đời và quy tắc ghi riêng.

> Số liệu trên slide phản ánh lần chụp bộ dữ liệu sáu tháng dùng khi làm slide. Bản Phase 6 dùng để trình diễn hôm nay có 210 phiếu trong snapshot, gồm 13 phiếu được đặt ở các mốc khác nhau để nhóm có thể mở thẳng vào từng công đoạn.

### Slide 9–10 · Index, validator và transaction

> Chỉ mục `ticket_open_device` là unique trên `deviceId` với điều kiện `open: true`. Vì vậy một thiết bị có thể có nhiều phiếu trong lịch sử, nhưng tại một thời điểm chỉ có một phiếu mở. `$jsonSchema` kiểm tra lớp lưu trữ, ví dụ trường tiền của phiếu thu phải có kiểu decimal và giá trị hợp lệ. Khi thủ kho xuất linh kiện, ứng dụng cập nhật chứng từ, tồn kho và trạng thái phiếu trong transaction để các thay đổi cùng thành công hoặc cùng được hủy.

### Slide 11–16 · Aggregation và kết nối ứng dụng

> Để tính doanh thu theo tháng, nhóm lọc các khoản đã thu có loại `CHARGED`, đổi `paidAt` sang tháng theo giờ Việt Nam, rồi nhóm và cộng `amount`. Các truy vấn khác dùng `$lookup` để lấy tên kỹ thuật viên hoặc `$unwind` để tách từng dòng linh kiện trước khi thống kê. Với Explain, nhóm xem số document được kiểm tra và trả về để đánh giá tác dụng của chỉ mục trên truy vấn cụ thể. Số liệu đó mô tả truy vấn đã đo trên slide.

> Giao diện React gọi API ASP.NET Core, API truy cập MongoDB bằng C# Driver. Khi trình diễn, ứng dụng dùng database `soopi_mongodb_demo` trên replica set local `rs0`. Bản sao lưu đầy đủ cần cả dữ liệu MongoDB và thư mục tệp, vì chữ ký và ảnh được lưu trên đĩa. Em mời bạn Thiện chuyển sang phần thao tác.

### Slide 17 · Dẫn vào demo

> Để mọi người thấy được các bước trong thời gian ngắn, nhóm sẽ chuyển qua những phiếu mẫu đã đứng sẵn ở từng công đoạn. Mỗi lần chuyển, em sẽ đọc mã phiếu mới và vai trò đang thao tác. Toàn bộ khách hàng, giao dịch và chữ ký dùng trong phần này là dữ liệu minh họa.

### Slide 18–19 · Kết quả và kết luận

> Slide này tổng hợp kết quả kiểm thử tại thời điểm nhóm làm tài liệu. Qua các phiếu vừa mở, nhóm đã minh họa cách dữ liệu được ghi từ lúc tiếp nhận đến bàn giao. Phần aggregation cho thấy cách dùng dữ liệu đã lưu để lập báo cáo. Môi trường trình diễn dùng replica set một nút và một số báo cáo vẫn có bước tổng hợp trong ứng dụng. Nếu triển khai rộng hơn, nhóm sẽ kiểm chứng khả năng chuyển đổi dự phòng trên replica set nhiều nút và đo các truy vấn trên bộ dữ liệu lớn hơn. Nhóm em cảm ơn thầy và các bạn đã lắng nghe. Nhóm xin nhận câu hỏi.

### Nếu dùng bộ slide báo cáo 28 trang

Với [bộ slide theo cấu trúc báo cáo](slides/QuanLyTrungTamBaoHanhDienTu-thuyet-trinh.pptx), dùng phần mở đầu và nghiệp vụ ở trang 1–10, lời thoại về mô hình document và kiến trúc ở trang 12–16, phần nhất quán dữ liệu ở trang 18–20. Đi qua kết quả kiểm thử ở trang 22–26, chuyển sang demo khi tới trang 28 rồi dùng lời kết. Khi chiếu số liệu kiểm thử, đọc mốc ngày ghi trên bộ slide đang chiếu.

## Demo web · 04:30–09:30

Thời gian đã tính cả chuyển màn hình. Dùng mã đầy đủ để tìm. Khi một thao tác đã được thực hiện trong buổi tập, chiếu trạng thái đã lưu và đọc câu thoại tương ứng.

| Mốc | Tài khoản và thao tác | Lời thoại và kết quả cần chỉ trên màn hình |
| --- | --- | --- |
| 04:30 | `admin` → **Báo cáo & Thống kê** → kỳ 12 tháng gần nhất, chỉ các cột tháng 5–10/2026 nếu đang nằm trong kỳ. | “Đây là doanh thu và tình trạng xử lý được tổng hợp từ dữ liệu demo. Các tháng trên biểu đồ theo thời điểm hiện tại của ứng dụng.” Nếu kỳ hiện tại không phủ dữ liệu, chuyển sang pipeline theo thời gian cố định ở phần Compass. |
| 04:55 | `receptionist` → **Yêu cầu bảo hành trực tuyến** → nhập `YC-2026-1030-00001`, tải yêu cầu lên form tiếp nhận. Dừng khi thấy thông tin tự điền. | “Khách gửi yêu cầu trước. Lễ tân kiểm tra thiết bị, bổ sung ngoại quan và các thông tin tại quầy trước khi tạo phiếu tiếp nhận.” |
| 05:25 | `dispatcher` → mở `TN-2026-1030-00001`, chỉ hạn SLA và khu vực **Phân công kỹ thuật viên**. Chuyển sang `TN-2026-1030-00004`, mở báo giá `BG-2026-1030-00001` và phê duyệt. | “Điều phối nhìn thời hạn và giao việc cho kỹ thuật viên. Với phiếu có phí này, báo giá 270.000 đồng sau phê duyệt nội bộ sẽ sang trạng thái chờ khách xác nhận.” |
| 06:10 | Khách `0900000001` → **Lịch sử bảo hành** → mở `TN-2026-1030-00005` → **Đồng ý báo giá**, xác nhận nếu có hộp thoại. | “Đây là báo giá của một phiếu khác, đã được duyệt nội bộ từ trước. Quyết định của khách được lưu vào báo giá và công việc tiếp tục theo nhu cầu linh kiện của ca này.” |
| 06:50 | `warehouse` → **Phiếu xuất kho** → mở `PX-2026-00092` → duyệt thực xuất một pin `LK-LAP-PIN` tại kệ `C1`. | “Kho đã giữ trước một pin. Khi thực xuất, tồn thực tế giảm một và giữ chỗ giảm một, nên tồn khả dụng giữ nguyên.” Ở mốc chuẩn bị, tồn thực tế/giữ chỗ/khả dụng chuyển `179/1/178` thành `178/0/178`. Phiếu `TN-2026-1030-00006` chuyển sang `REPAIRING`. |
| 07:35 | `technician` → mở `TN-2026-1030-00007` → nhập việc đã làm, ví dụ “Vệ sinh cổng sạc và kiểm tra chức năng”, chọn **Đạt** cho cả sáu bước QC, rồi xác nhận hoàn tất sửa chữa. | “Kỹ thuật viên ghi lại công việc và kết quả kiểm tra từng bước. Khi đạt, phiếu sang `COMPLETED`, nghĩa là sửa xong và chờ bàn giao.” |
| 08:20 | `cashier` → mở `TN-2026-1030-00008` → kiểm tra tổng 270.000 đồng → chọn **Tiền mặt** → **Xác nhận đã thanh toán**. Kiểm tra lại thiết bị, vẽ chữ ký minh họa, tích xác nhận khách đã nhận máy và bấm **Hoàn tất bàn giao**. | “Phiếu thu được lưu trước. Sau khi xác nhận tình trạng thiết bị và ký nhận, phiếu chuyển sang `DELIVERED`. Hệ thống lúc này ghi nhận thiết bị đã được trả cho khách.” |
| 09:10 | Khách `0900000001` → mở `TN-2026-1030-00011` trong **Lịch sử bảo hành**. | “Đây là một ca đã bàn giao và có đánh giá 5 sao. Khách có thể xem lại tiến độ và thông tin của phiếu thuộc tài khoản mình.” |

Khi cần rút ngắn, dùng `TN-2026-1030-00013` với tài khoản `cashier` để vào ngay bước ký. Phiếu này đã có phiếu thu `PT-2026-00172`. Nếu cần minh họa một ngoại lệ, mở `TN-2026-1030-00012` để xem lý do trả nguyên trạng, hoặc mở lịch sử QC của `TN-2026-1030-00011` bằng `technician` để chỉ hai lượt `FAIL` rồi `PASS`. Nếu web gặp sự cố, mở [ảnh kiểm thử Phase 3](phase3/screenshots) để minh họa giao diện và nói rõ đây là ảnh của đợt kiểm thử trước.

## Demo MongoDB Compass · 09:30–10:45

Trong **Documents** của `soopi_mongodb_demo.tickets`, dán bộ lọc sau rồi mở `statusHistory`, `repairOrder.results` và `handover`. Phiếu này đã có sẵn lịch sử hai lượt kiểm tra và bàn giao. Nếu vừa bàn giao thành công ở bước thu ngân, có thể đổi mã sang `TN-2026-1030-00008` để đối chiếu thay đổi vừa ghi.

```json
{ "_id": "TN-2026-1030-00011" }
```

> Đây là document phía sau màn hình chi tiết. `statusHistory` lưu các lần chuyển trạng thái, `repairOrder.results` lưu từng lần kiểm tra, còn `handover` lưu kết quả bàn giao.

Trong tab **mongosh** của Compass, dán đoạn sau. Khoảng thời gian cố định từ tháng 5 đến hết tháng 10/2026 theo giờ Việt Nam giúp demo lặp lại vào ngày khác.

```javascript
db.getSiblingDB('soopi_mongodb_demo').payments.aggregate([
  {
    $match: {
      type: 'CHARGED',
      paidAt: { $gte: ISODate('2026-04-30T17:00:00Z'), $lt: ISODate('2026-10-31T17:00:00Z') },
    },
  },
  {
    $group: {
      _id: { $dateToString: { format: '%Y-%m', date: '$paidAt', timezone: '+07:00' } },
      payments: { $sum: 1 },
      total: { $sum: '$amount' },
    },
  },
  { $sort: { _id: 1 } },
]).toArray();
```

> `$match` lấy các phiếu thu có tính phí trong kỳ. `$group` cho mỗi tháng số phiếu thu và tổng tiền, rồi `$sort` sắp theo thời gian. Khoản vừa ghi nhận hôm nay chỉ xuất hiện ở kết quả này nếu ngày thu thuộc kỳ tháng 5–10/2026.

Nếu được hỏi về index, mở tab **Indexes** của `tickets` và chỉ `ticket_open_device`. Có thể chạy phép đo chỉ đọc sau. Trong kết quả, tìm `IXSCAN` hoặc `EXPRESS_IXSCAN` tùy phiên bản MongoDB, rồi so sánh `nReturned` với `totalDocsExamined`. Trên dữ liệu chuẩn bị, cả hai số đều là 1.

```javascript
db.getSiblingDB('soopi_mongodb_demo').tickets
  .find({ _id: 'TN-2026-1030-00011' })
  .explain('executionStats');
```

Truy vấn này minh họa index `_id_`. Ví dụ đo các chỉ mục nghiệp vụ và so sánh với `COLLSCAN` có trong [bộ truy vấn MongoDB](../database/queries/README.md#03--chỉ-mục-kế-hoạch-truy-vấn-và-ràng-buộc-schema).

## Câu hỏi có thể gặp

- **Vì sao nhúng lịch sử trong phiếu nhưng lưu thanh toán riêng?** Lịch sử đi cùng phiếu trong hầu hết lần đọc chi tiết. Thanh toán có mã chứng từ riêng, được dùng cho báo cáo doanh thu và chịu ràng buộc mỗi phiếu chỉ có một bản ghi thanh toán.
- **Nếu hai người cùng tiếp nhận một thiết bị thì sao?** Unique partial index `ticket_open_device` chặn hai phiếu `open: true` cùng `deviceId` ngay tại database. Phiếu đã đóng nằm ngoài điều kiện của index.
- **QC đạt rồi vì sao còn bước bàn giao?** QC ghi nhận thiết bị đạt kiểm tra sau sửa và đưa phiếu sang `COMPLETED`. Bàn giao ghi nhận kết quả kiểm tra lại và xác nhận khách đã nhận thiết bị, rồi đưa phiếu sang `DELIVERED`.
- **Vì sao giữ chỗ giảm mà tồn khả dụng giữ nguyên?** Tồn khả dụng bằng tồn thực tế trừ lượng đã giữ. Một đơn vị đã được trừ khỏi phần khả dụng từ lúc giữ chỗ. Khi thực xuất, cả tồn thực tế và lượng đã giữ cùng giảm một.
- **Snapshot trong Git có đủ để xem chữ ký đã lưu không?** Snapshot có metadata và tham chiếu tệp. Muốn mở nội dung chữ ký cũ, cần khôi phục cả thư mục tệp bên cạnh database.
