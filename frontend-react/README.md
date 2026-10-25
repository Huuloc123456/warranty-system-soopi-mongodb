# Giao diện Soopi MongoDB

Giao diện, controller phía trình duyệt và tài sản thương hiệu giữ nguyên từ Soopi. API mặc định là cùng origin; Vite chạy cổng 5174 và proxy `/api`, `/actuator` sang 8081.

```powershell
npm.cmd ci
npm.cmd run dev
npm.cmd run build
npm.cmd run lint
npm.cmd test
```

Bản build được ghi vào `../backend-dotnet/src/Soopi.Api/wwwroot`, do API phục vụ. Xem README tại thư mục project để chạy MongoDB local và tài khoản demo.
