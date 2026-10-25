# Danh sách tài khoản Soopi MongoDB

Đối chiếu trực tiếp database `soopi_mongodb` ngày 09/10/2026: có **8 tài khoản**, tất cả đang hoạt động.

Trang đăng nhập chung: **http://localhost:8081/login**.

| Tên đăng nhập | Mật khẩu demo | Vai trò | Trạng thái | Trang sau đăng nhập |
|---|---|---|---|---|
| `admin` | `1234` | Quản trị viên | Hoạt động | `/admin` |
| `receptionist` | `1234` | Lễ tân | Hoạt động | `/receptionist` |
| `dispatcher` | `1234` | Điều phối | Hoạt động | `/dispatch` |
| `technician` | `1234` | Kỹ thuật viên | Hoạt động | `/technician` |
| `warehouse` | `1234` | Thủ kho | Hoạt động | `/warehouse` |
| `cashier` | `1234` | Thu ngân | Hoạt động | `/cashier` |
| `technician2` | `1234` | Kỹ thuật viên 2 | Hoạt động | `/technician` |
| `0900000001` | `1234` | Khách hàng demo | Hoạt động | `/account` |

Đây là tài khoản demo để sử dụng trên máy cá nhân. Mật khẩu trong file là mật khẩu đã được đặt theo yêu cầu; MongoDB chỉ lưu bản băm BCrypt.

File ghi nhận danh sách tại thời điểm trên, không tự cập nhật khi thêm tài khoản hoặc đổi mật khẩu.
