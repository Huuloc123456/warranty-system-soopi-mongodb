// Chờ API Soopi sẵn sàng (dùng trong run.bat demo-generate). Hết 3 phút thì báo lỗi.
const url = (process.env.SOOPI_URL || 'http://localhost:8081') + '/actuator/health';
const started = Date.now();
for (;;) {
  try { if ((await fetch(url)).ok) break; } catch { /* API chưa lên */ }
  if (Date.now() - started > 180e3) { console.error('API chưa chạy sau 3 phút: ' + url); process.exit(1); }
  await new Promise((resolve) => setTimeout(resolve, 2000));
}
console.log('API sẵn sàng.');
