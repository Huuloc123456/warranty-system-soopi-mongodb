r"""Nội dung slide thuyết trình đồ án "Quản lý Trung tâm Bảo hành Điện tử" (NoSQL/MongoDB).

Chạy: python docs/slides/build/warranty_spec.py  -> docs/slides/build/warranty-slides.json
Build: powershell -NoProfile -ExecutionPolicy Bypass -File docs/slides/build/build-bigdata-slides.ps1 \
         -SpecPath "docs\slides\build\warranty-slides.json" \
         -Out "docs\slides\QuanLyTrungTamBaoHanhDienTu-thuyet-trinh.pptx"

JSON ghi dạng ASCII (\\uXXXX) để PowerShell đọc đúng tiếng Việt. Không ghi đè hai PPT mẫu.
Nội dung bám theo báo cáo chuẩn 5 chương (Khảo sát, Phân tích, Thiết kế, Cài đặt, Thử nghiệm) và
các số liệu đã được kiểm chứng độc lập (73/73 dotnet test, 25/25 frontend, 102 smoke, ...).
"""
import json
from pathlib import Path

S = "docs\\screenshots\\"
P3 = "docs\\phase3\\screenshots\\"
E = "docs\\erd\\"
WA = "docs\\slides\\assets-warranty\\"

STRINGS = {
    "course": "CƠ SỞ DỮ LIỆU NOSQL",
    "product": "SOOPI",
    "tagline": "Hệ thống quản lý trung tâm bảo hành điện tử trên nền MongoDB",
    "advisor": "GVHD: Hồ Trung Đoàn",
    "members": "Nhóm 2 — Đỗ Lê Thanh Mẫn · Bùi Hữu Lộc · Phan Minh Thiện",
    "thanks": "CẢM ƠN THẦY CÔ VÀ CÁC BẠN ĐÃ LẮNG NGHE!",
    "team": "Nhóm 2 — Hệ thống quản lý trung tâm bảo hành điện tử",
}

SLIDES = []


def section(n, title):
    SLIDES.append({"kind": "section", "number": n, "title": title})


def slide(layout, title="", notes="", **kw):
    SLIDES.append({"kind": "slide", "layout": layout, "title": title, "notes": notes, **kw})


slide("cover", notes="Giới thiệu nhóm, giảng viên hướng dẫn và tên đề tài.")

slide("agenda",
      items=["Khảo sát hệ thống", "Phân tích hệ thống", "Thiết kế hệ thống",
             "Cài đặt hệ thống", "Thử nghiệm và triển khai"],
      notes="Bài trình bày gồm năm phần theo đúng cấu trúc báo cáo.")

# ---------------------------------------------------------------- Chương 1
section(1, "Khảo sát hệ thống")
slide("img-text", "Bài toán và hiện trạng",
      images=[{"path": S + "shared-login-receptionist.png", "alt": "Giao diện lễ tân tiếp nhận thiết bị"}],
      items=["Trung tâm bảo hành tiếp nhận thiết bị, chẩn đoán, báo giá, sửa chữa và bàn giao.",
             "Hồ sơ khách hàng, thiết bị và phiếu nằm rời rạc; thao tác thủ công dễ sai sót.",
             "Khách cần **theo dõi tiến độ** bảo hành/sửa chữa mọi lúc, không phải gọi điện.",
             "Trung tâm cần quản lý **linh kiện, tồn kho, báo giá và thanh toán** trong một hệ thống.",
             "Quy trình có nhiều bước và vai trò, cần phân quyền và truy vết rõ ràng."],
      notes="Nêu lý do chọn đề tài và điểm đau của trung tâm bảo hành khi vận hành thủ công.")
slide("quad", "Yêu cầu chức năng theo vai trò",
      cards=[["Khách hàng",
              ["Đăng ký thiết bị, gửi yêu cầu bảo hành trực tuyến.",
               "Tra cứu tiến độ phiếu và lịch sử bảo hành.",
               "Xem và duyệt/từ chối báo giá sửa chữa."]],
             ["Lễ tân · Điều phối",
              ["Tiếp nhận thiết bị, lập phiếu T1.",
               "Phân công kỹ thuật viên, theo dõi hàng đợi.",
               "Tra cứu khách, thiết bị và tình trạng bảo hành."]],
             ["Kỹ thuật · Thủ kho",
              ["Chẩn đoán lỗi, lập báo giá, cập nhật tiến độ.",
               "Ghi nhận kết quả KCS (PASS/FAIL).",
               "Nhập/xuất linh kiện, trừ tồn theo kệ."]],
             ["Thu ngân · Quản trị",
              ["Thu tiền, bàn giao thiết bị và chữ ký.",
               "Quản lý tài khoản, danh mục, bảng giá.",
               "Báo cáo doanh thu, lead time và tồn kho."]]],
      notes="Đi từ nhu cầu của từng vai trò, sau đó chi tiết hóa ở chương phân tích và thiết kế.")
slide("table-text", "Biểu mẫu và phạm vi khảo sát",
      table=[["Biểu mẫu thu thập", "Thông tin chính"],
             ["Phiếu tiếp nhận (T1)", "Khách, thiết bị, serial, tình trạng, người nhận"],
             ["Phiếu báo giá", "Linh kiện, đơn giá, phí dịch vụ, trạng thái duyệt"],
             ["Phiếu bàn giao", "Kết quả sửa chữa, QC, chữ ký khách và trung tâm"],
             ["Phiếu nhập/xuất kho", "Linh kiện, số lượng, kệ, kho và người xác nhận"]],
      items=["Phạm vi: quy trình **tiếp nhận → bảo hành/sửa chữa → bàn giao** và các chứng từ kho, thu tiền đi kèm.",
             "Không khảo sát: kế toán tổng hợp, nhân sự, và kênh bán hàng ngoài trung tâm bảo hành."],
      notes="Biểu mẫu giấy là căn cứ để thiết kế các collection và luồng dữ liệu ở chương sau.")

# ---------------------------------------------------------------- Chương 2
section(2, "Phân tích hệ thống")
slide("img-text", "Sơ đồ usecase nghiệp vụ",
      images=[{"path": WA + "usecase-nghiep-vu.jpg", "alt": "Sơ đồ use case nghiệp vụ của trung tâm bảo hành"}],
      items=["**Tác nhân:** Khách hàng, Lễ tân, Điều phối, Kỹ thuật viên, Thủ kho, Thu ngân, Quản trị.",
             "Khách gửi yêu cầu, theo dõi tiến độ và duyệt báo giá qua cổng web.",
             "Lễ tân tiếp nhận thiết bị; điều phối phân công công việc.",
             "Kỹ thuật chẩn đoán và sửa chữa; thủ kho xuất linh kiện; thu ngân thu tiền và bàn giao.",
             "Quản trị cấu hình danh mục, tài khoản và phân quyền."],
      notes="Đây là Hình 2.1 trong báo cáo; mô tả ai làm gì, dẫn tới mô hình hóa quy trình và đặc tả usecase.")
slide("table-top", "Bảy quy trình nghiệp vụ",
      table=[["Quy trình", "Hoạt động chính"],
             ["Yêu cầu & Tiếp nhận", "Đăng ký thiết bị, lập phiếu, từ chối trùng phiếu mở"],
             ["Thực hiện bảo hành", "Phân công, chẩn đoán, phân loại miễn phí / tính phí"],
             ["Báo giá & Xác nhận", "Lập báo giá, duyệt nội bộ, khách đồng ý / từ chối"],
             ["Thực hiện sửa chữa", "Cập nhật tiến độ, giữ linh kiện, xuất kho, KCS"],
             ["Bàn giao thiết bị", "QC, thu tiền, chữ ký, bàn giao cho khách"],
             ["Tra cứu tiến độ", "Khách theo dõi phiếu và lịch sử qua cổng"],
             ["Nhập linh kiện", "Lập và duyệt phiếu nhập, cập nhật tồn theo kệ"]],
      items=["Mỗi quy trình ánh xạ tới một nhóm chức năng và một tập collection trong MongoDB.",
             "Luồng có phí đi qua báo giá và giữ linh kiện; luồng bảo hành miễn phí bỏ qua bước thu tiền.",
             "Khách theo dõi tiến độ qua cổng ở mọi trạng thái của phiếu."],
      notes="Bảy quy trình khớp với mô hình hóa nghiệp vụ trong báo cáo; nhấn mạnh luồng có phí và luồng bảo hành miễn phí.")
slide("text-img", "Sơ đồ usecase hệ thống & đặc tả",
      images=[{"path": WA + "usecase-he-thong.jpg", "alt": "Sơ đồ use case hệ thống quản lý trung tâm bảo hành"}],
      items=["Sơ đồ usecase hệ thống mở rộng từ usecase nghiệp vụ, gắn từng nhóm chức năng với tác nhân.",
             "Đặc tả từng usecase: tác nhân, tiền điều kiện, luồng chính và luồng ngoại lệ.",
             "Ví dụ “Tiếp nhận thiết bị”: kiểm tra serial, hạn bảo hành và phiếu mở trùng.",
             "Ví dụ “Xác nhận báo giá”: khách duyệt thì giữ linh kiện, xuất kho và trừ tồn."],
      notes="Hình 2.9 trong báo cáo; chọn hai usecase đại diện để minh họa đặc tả, không đọc toàn bộ.")

# ---------------------------------------------------------------- Chương 3
section(3, "Thiết kế hệ thống")
slide("table-text", "Kiến trúc 3 tầng",
      table=[["Tầng", "Công nghệ", "Vai trò"],
             ["Tầng giao diện", "React · Vite · TypeScript", "Trang theo vai trò, gọi REST"],
             ["Tầng máy chủ", "ASP.NET Core (.NET 10)", "API, phân quyền, nghiệp vụ"],
             ["Tầng lưu trữ", "MongoDB (rs0) · tệp trên đĩa", "Document, transaction, tệp đính kèm"]],
      items=["Frontend gọi REST tới API cổng **8081**; Vite chạy cổng **5174** và proxy về API.",
             "Mỗi request dùng **AppDbContext riêng** trên một MongoClient dùng chung.",
             "LINQ được dịch và chạy tại MongoDB, không nạp toàn bộ database vào bộ nhớ."],
      notes="Mô tả kiến trúc 3 tầng: giao diện React, API .NET và MongoDB với tệp đính kèm trên đĩa.")
slide("table-top", "Thiết kế CSDL MongoDB",
      table=[["Nhóm collection", "Collection"],
             ["Tài khoản & phiên", "accounts, employees, refresh_tokens, otp_codes, push_devices"],
             ["Nghiệp vụ bảo hành", "tickets, quotations, devices, warranty_requests, attachments"],
             ["Kho & thu tiền", "parts, stock_receipts, stock_issues, stock_transfers, payments"],
             ["Danh mục", "service_stations, device_categories, brands, products, warranty_policies, service_prices, suppliers"],
             ["Hệ thống", "audit_logs, notifications, counters"]],
      items=["Mã nghiệp vụ **TN/KH/NV/BG/PX** giữ nguyên; ngày lịch lưu **yyyy-MM-dd**, tiền lưu **Decimal128**.",
             "Dữ liệu lồng: phân công, lịch sử trạng thái, kết quả QC và bàn giao nhúng trong **tickets**.",
             "Bộ đếm **counters** cấp mã nghiệp vụ bằng **$inc** nguyên tử."],
      notes="Chỉ điểm các nhóm collection chính; chi tiết ERD ở slide kế tiếp.")
slide("img-top", "Mô hình quan hệ (ERD)",
      images=[{"path": E + "soopi_erd.png", "alt": "Sơ đồ quan hệ Soopi MongoDB"}],
      cards=[["Quan hệ (tham chiếu)", ["Phiếu tham chiếu khách, thiết bị, nhân viên, báo giá; chứng từ kho tham chiếu linh kiện và ghi lịch sử tồn theo kệ."]],
             ["Nhúng (embed)", ["Bàn giao, chẩn đoán, kết quả QC nhúng trong phiếu; vai trò nhúng trong tài khoản/nhân viên."]]],
      notes="Giải thích lựa chọn nhúng vs tham chiếu theo kiểu truy cập của từng luồng nghiệp vụ.")
slide("img-text", "Thiết kế giao diện",
      images=[{"path": S + "admin-desktop.png", "alt": "Trang quản trị trên desktop"}],
      items=["Đăng nhập chung **/login**, sau đó chuyển theo vai trò.",
             "Khách: **/account** (tổng quan, lịch sử, phiếu, yêu cầu mới, hồ sơ).",
             "Nhân viên: **/receptionist**, **/dispatch**, **/technician**, **/warehouse**, **/cashier**.",
             "Quản trị **/admin**; tra cứu công khai cho khách vãng lai **/portal**.",
             "Bảng chuyển thành **thẻ trên điện thoại** (responsive)."],
      notes="Điểm qua 14 màn hình trong mục 3.3; nhấn mạnh đăng nhập chung và responsive.")
slide("text-img", "Năm nhóm chức năng hệ thống",
      images=[{"path": P3 + "03-thanh-toan-ban-giao.png", "alt": "Màn hình thanh toán và bàn giao"}],
      items=["**Tiếp nhận & Dịch vụ khách hàng:** đăng ký yêu cầu, tiếp nhận, bàn giao, thanh toán.",
             "**Báo giá & Phê duyệt:** lập báo giá, duyệt nội bộ, khách xác nhận / từ chối.",
             "**Kỹ thuật & Phân công:** phân công, chẩn đoán, phân loại bảo hành, tiến độ, KCS.",
             "**Kho linh kiện & Tồn kho:** nhập kho, yêu cầu xuất, xác nhận xuất và trừ tồn.",
             "**Quản trị & Báo cáo:** tài khoản, danh mục, báo cáo doanh thu/lead time/tồn kho."],
      notes="Năm nhóm khớp với mục 3.4 báo cáo; mỗi nhóm đều có chức năng con và phân quyền riêng.")

# ---------------------------------------------------------------- Chương 4
section(4, "Cài đặt hệ thống")
slide("table-text", "Môi trường và thành phần",
      table=[["Thành phần", "Cụ thể"],
             ["Backend", "ASP.NET Core .NET 10 · MongoDB.Driver 3.12.0"],
             ["Frontend", "React 19 · Vite · TypeScript"],
             ["Database", "MongoDB local, replica set **rs0**"],
             ["Cổng", "API 8081 · Vite 5174"],
             ["Chạy", "**run.bat** (build frontend + chạy API)"]],
      items=["Mọi tài khoản đăng nhập tại **http://localhost:8081/login**.",
             "Mật khẩu demo chung **1234**; sau khi đăng nhập chuyển theo vai trò.",
             "**Mongo:ConnectionString** / **Mongo:Database** trong **appsettings.json**."],
      notes="Mô tả cách dựng môi trường local bằng một lệnh run.bat.")
slide("compare", "Tổ chức mã nguồn và cấu hình",
      cards=[["backend-dotnet", ["Tầng API ASP.NET Core với controllers, DTO và luật nghiệp vụ.",
                                 "Lớp lưu trữ dùng MongoDB C# Driver.",
                                 "Dữ liệu demo seed qua **Mongo:SeedDemo** (chỉ Development)."]],
             ["frontend-react + verification", ["Giao diện React theo thiết kế và tài sản thương hiệu.",
                                                "**verification/** chứa đối chiếu contract và smoke HTTP.",
                                                "User Secrets và Project độc lập; không đặt URI có mật khẩu vào Git."]]],
      notes="Nhấn mạnh tổ chức hai project backend/frontend và cấu hình database độc lập.")
slide("compare", "Cài đặt MongoDB và bảo toàn dữ liệu",
      cards=[["Transaction & nhất quán", ["Transaction kho/thu tiền dùng một session, snapshot read + majority write.",
                                          "Xung đột thử lại tối đa 3 lần; commit chưa rõ kết quả thử lại, giới hạn 30 giây.",
                                          "Bộ đếm mã nghiệp vụ bằng **$inc** nguyên tử ngoài transaction (số có thể nhảy khi rollback)."]],
             ["Index & bảo mật", ["Unique/partial index bảo vệ username, serial, số điện thoại, phiếu mở, báo giá...",
                                  "Refresh token lưu hash và xoay vòng theo họ token.",
                                  "Nội dung tệp lưu trên đĩa, metadata và quyền sở hữu trong MongoDB."]]],
      notes="Đây là các quyết định kỹ thuật bảo đảm nhất quán; giải thích vì sao bộ đếm nằm ngoài transaction.")

# ---------------------------------------------------------------- Chương 5
section(5, "Thử nghiệm và triển khai")
slide("stats", "Kết quả kiểm thử",
      stats=[["73/73", "backend .NET (21/10/2026)"],
             ["25/25", "frontend React (09/10/2026)"],
             ["102", "smoke HTTP (09/10/2026)"],
             ["10", "integration MongoDB (09/10/2026)"]],
      cards=[["Nguồn số liệu", ["**73/73 backend** là kết quả sau vòng sửa ngày 21/10/2026, chạy trên DB test riêng.",
                                 "**25/25 frontend, 102 smoke, 10 integration** ghi trong tài liệu kiểm chứng 09/10/2026 — chưa chạy lại cùng lượt."]],
             ["Trình duyệt thật", ["Đăng nhập từng vai trò; trang quản trị hiển thị 7 nhân viên.",
                                   "Responsive 1440×900 và 390×844; bảng chuyển thành thẻ."]]],
      notes="Backend 73/73 là kết quả ngày 21/10/2026; frontend 25/25, 102 smoke và 10 integration là số liệu lịch sử ngày 09/10, chưa chạy lại cùng lượt. Bộ test mới bao gồm nhánh commit bị hủy: giữ tệp, không bù trừ; token hủy trước khi lệnh tới server, chưa thử trường hợp server đã commit nhưng client hết giờ chờ.")
slide("table-top", "Kịch bản API đã thực thi",
      table=[["Nhóm kịch bản", "Luồng kiểm tra"],
             ["Bảo hành miễn phí", "Đăng ký → tiếp nhận → phân công → chẩn đoán → QC → bàn giao"],
             ["Sửa chữa có phí", "Báo giá → duyệt → khách đồng ý → giữ linh kiện → xuất kho → thu tiền"],
             ["Kho", "Tạo/sửa/duyệt phiếu nhập, điều chuyển và liệt kê chứng từ"],
             ["Cổng khách", "Yêu cầu online với PNG, tra cứu token, tải đúng bytes tệp"],
             ["Báo cáo", "Doanh thu, hiệu suất, lead time, tỷ lệ bảo hành, SLA"]],
      items=["Từ chối **phiếu mở trùng**, đối chiếu báo giá và ghi nhật ký/thông báo trong từng luồng.",
             "Đối chiếu dữ liệu MongoDB bằng mongosh sau đợt chạy.",
             "Đăng ký/gỡ thiết bị push demo; đánh dấu thông báo đã đọc."],
      notes="Các luồng kiểm thử khớp với mục 5.3 báo cáo; có thể mở API demo nếu có thời gian.")
slide("img-text", "Kiểm tra giao diện trên trình duyệt",
      images=[{"path": S + "admin-mobile-top.png", "alt": "Giao diện quản trị trên điện thoại"}],
      items=["Đăng nhập **admin** và **receptionist** từ trang chung; chuyển hướng đúng theo vai trò.",
             "Khách **0900000001** vào **/account#lich-su** xem phiếu của mình.",
             "Responsive 1440×900 và 390×844; bảng dữ liệu chuyển thành thẻ trên màn hình nhỏ.",
             "Bằng chứng giao diện lưu trong docs/screenshots."],
      notes="Bằng chứng giao diện có trong docs/screenshots; nhấn mạnh đăng nhập chung và responsive.")
slide("compare", "Lỗi phát hiện và cách khắc phục",
      cards=[["Đã khắc phục", ["Username: index collation đã chạy trên **soopi_mongodb — 21/10/2026**.",
                                "8 nhân viên × 3 vòng PATCH: 24/24 HTTP 200 trên bản sao soopi_mongodb_verify_20261021; không suy rộng thành kiểm thử tải.",
                                "Tạo nhân viên thuộc trạm của admin (không gán cứng).",
                                "F-01: lưới Tồn kho kiểm lại ngày 21/10 trên DB riêng; **PASS, giữ FAIL 09/10**.",
                                "Chỉ tin proxy đã khai báo ở **X-Forwarded-For**; xóa code chết."]],
             ["Giới hạn / đánh đổi", ["Báo cáo tổng hợp trong bộ nhớ sau khi lọc ngày/trạm.",
                                      "Access token trong sessionStorage (đánh đổi; refresh token trong cookie HttpOnly).",
                                      "Mật khẩu demo **1234** chỉ dùng ở môi trường local.",
                                      "SMS/push vẫn ở chế độ log, chưa tích hợp nhà cung cấp thật.",
                                      "Commit bị hủy do hết thời gian chờ: giữ tệp, không bù trừ; chưa thử server đã commit."]]],
      notes="Ngày 21/10/2026, migration index account_username_collated (unique, en/strength 2) đã chạy trên soopi_mongodb sau sao lưu và kiểm tra username trùng. Ca 8 nhân viên × 3 vòng PATCH chỉ chạy trên bản sao soopi_mongodb_verify_20261021: 24/24 HTTP 200. F-01 chỉ kiểm lại lưới Tồn kho trên DB riêng soopi_ui_f01_20261021: LK-PIN hiện Laptop, lọc trả 1 SKU, đủ 6 nhóm; giữ nguyên FAIL lịch sử 09/10. Test TransactionRunner: commit bị hủy do hết thời gian chờ thì giữ tệp, không bù trừ; token hủy trước khi lệnh tới server, chưa phủ server đã commit nhưng client hết giờ chờ. Dọn tệp khi transaction rollback vẫn giữ nguyên. Cả bộ backend đạt 73/73, không bỏ qua test.")
slide("text-img", "Kết quả đạt được",
      images=[{"path": S + "admin-desktop.png", "alt": "Hệ thống bảo hành trên desktop"}],
      items=["Triển khai được luồng bảo hành chính: tiếp nhận, báo giá, sửa chữa, kho, thu tiền, bàn giao.",
             "Hệ thống chạy trên nền **MongoDB** với API ASP.NET Core và giao diện React.",
             "Cổng khách hàng và tra cứu công khai; đăng nhập chung cho mọi vai trò.",
             "Backend 73/73 test ngày 21/10; frontend 25/25 theo tài liệu 09/10.",
             "Ngày 21/10: migration trên DB thật; F-01 PASS tại lưới Tồn kho trên DB riêng, giữ FAIL 09/10."],
      notes="Tổng kết ngày 21/10/2026: 73/73 backend, migration đã chạy trên soopi_mongodb; 8×3 PATCH trên bản sao soopi_mongodb_verify_20261021. F-01 PASS chỉ tại lưới Tồn kho trên soopi_ui_f01_20261021, không thay FAIL ngày 09/10 hoặc suy rộng ra toàn UI. Test commit bị hủy không phủ server đã commit nhưng client hết giờ chờ.")
slide("quad", "Hướng phát triển",
      cards=[["Báo cáo", ["Chuyển tổng hợp trong bộ nhớ sang aggregation pipeline khi dữ liệu lớn."]],
             ["Bảo mật", ["Thêm CSP, đưa access token vào cookie HttpOnly hoặc BFF."]],
             ["Tích hợp", ["Kết nối SMS/push thật, kênh bán hàng và đồng bộ hãng sản xuất."]],
             ["Mở rộng", ["Thử tải lớn, replica-set failover và triển khai đa trạm."]]],
      notes="Ưu tiên đóng các giới hạn đã ghi nhận trước khi mở rộng quy mô.")

slide("end",
      items=["Sẵn sàng demo luồng tiếp nhận, báo giá, sửa chữa và bàn giao.",
             "Mời thầy cô và các bạn đặt câu hỏi."],
      notes="Cảm ơn và mời đặt câu hỏi; giữ API chạy sẵn để demo nếu cần.")

out = Path(__file__).with_name("warranty-slides.json")
out.write_text(json.dumps({"strings": STRINGS, "slides": SLIDES}, ensure_ascii=True, indent=1), encoding="ascii")
print(out, sum(1 for s in SLIDES if s["kind"] == "slide"), "content slides +",
      sum(1 for s in SLIDES if s["kind"] == "section"), "sections")
