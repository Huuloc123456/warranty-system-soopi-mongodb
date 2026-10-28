// Sinh dữ liệu demo phong phú cho Soopi MongoDB bằng chính API của ứng dụng (đi đúng mọi luật nghiệp vụ, mã phiếu, bộ đếm,
// nhật ký, thông báo). Mỗi phiếu có một dòng thời gian trong ~6 tháng gần đây; header X-Demo-Now lùi "thời điểm hiện tại"
// của từng request, nên API phải chạy ở Development với --Demo:ClockOverride=true. Bước nào rơi vào tương lai thì dừng,
// nên các phiếu gần đây nằm lại ở đủ trạng thái đang xử lý. Cách chạy: database/demo-data/README.md.
//
//   SOOPI_URL   địa chỉ API (mặc định http://localhost:8081)
//   SEED        hạt ngẫu nhiên (mặc định 20261028) — cùng hạt, cùng dữ liệu đầu vào
//   TICKETS     số phiếu (mặc định 200)
//   DAYS        số ngày lịch sử (mặc định 180)

const BASE = (process.env.SOOPI_URL || 'http://localhost:8081') + '/api/v1';
const SEED = Number(process.env.SEED || 20261028);
const TICKETS = Number(process.env.TICKETS || 200);
const DAYS = Number(process.env.DAYS || 180);
const NOW = Date.now();
const PASSWORD = 'Soopi@Demo2026';

// ---------- Ngẫu nhiên có hạt ----------
let state = SEED >>> 0;
const rand = () => { state = (state + 0x6d2b79f5) >>> 0; let t = state; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const pick = (list) => list[Math.floor(rand() * list.length)];
const chance = (p) => rand() < p;
const between = (a, b) => a + Math.floor(rand() * (b - a + 1));
const weighted = (pairs) => { let r = rand() * pairs.reduce((s, [, w]) => s + w, 0); for (const [v, w] of pairs) if ((r -= w) <= 0) return v; return pairs[0][0]; };

// ---------- Thời gian (giờ Việt Nam) ----------
const HOUR = 3600e3, DAY = 24 * HOUR;
const vnIso = (ms) => new Date(ms + 7 * HOUR).toISOString().replace('Z', '+07:00');
const vnDate = (ms) => new Date(ms + 7 * HOUR).toISOString().slice(0, 10);
/** Dời mốc vào giờ làm việc 8:00–17:30, bỏ Chủ nhật. */
function workTime(ms) {
  for (;;) {
    const d = new Date(ms + 7 * HOUR);
    const h = d.getUTCHours() + d.getUTCMinutes() / 60;
    if (d.getUTCDay() === 0) { ms += (24 - h + 8) * HOUR; continue; }
    if (h < 8) { ms += (8 - h) * HOUR; continue; }
    if (h > 17.5) { ms += (24 - h + 8) * HOUR; continue; }
    return ms;
  }
}
const later = (ms, minH, maxH) => workTime(ms + (minH + rand() * (maxH - minH)) * HOUR);

// ---------- HTTP ----------
const tokens = {};
const stats = { calls: 0, failed: 0, errors: {} };
async function api(user, method, path, body, at) {
  const headers = { 'X-Requested-With': 'fetch' };
  if (user) headers.Authorization = `Bearer ${tokens[user]}`;
  if (at) headers['X-Demo-Now'] = vnIso(at);
  let payload;
  if (body instanceof FormData) payload = body;
  else if (body !== undefined) { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(body); }
  stats.calls++;
  const response = await fetch(BASE + path, { method, headers, body: payload });
  const text = await response.text();
  let value; try { value = text ? JSON.parse(text) : null; } catch { value = text; }
  if (!response.ok) {
    stats.failed++;
    const key = `${method} ${path.replace(/[A-Z]{2,4}-[\w-]+/g, '{code}')} → ${response.status} ${value?.code ?? ''}`;
    stats.errors[key] = (stats.errors[key] || 0) + 1;
    const error = new Error(key); error.code = value?.code; throw error;
  }
  return value;
}
async function login(user, password = '1234') {
  let result;
  try {
    result = await api(null, 'POST', '/auth/login', { username: user, password, remember: false });
  } catch (error) {
    // API giới hạn 10 lần đăng nhập/phút/IP: chờ hết cửa sổ rồi thử lại một lần.
    if (error.code !== 'RATE_LIMITED') throw error;
    stats.failed--; delete stats.errors[error.message];
    console.log('  (chờ 61 giây do giới hạn đăng nhập)');
    await new Promise((resolve) => setTimeout(resolve, 61e3));
    result = await api(null, 'POST', '/auth/login', { username: user, password, remember: false });
  }
  tokens[user] = result.accessToken;
  return result;
}

// ---------- Dữ liệu nền ----------
const HO = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
const DEM = ['Văn', 'Thị', 'Minh', 'Ngọc', 'Thanh', 'Hoàng', 'Gia', 'Quốc', 'Thu', 'Hải', 'Bảo', 'Anh', 'Đức', 'Khánh'];
const TEN = ['An', 'Bình', 'Châu', 'Dũng', 'Giang', 'Hà', 'Hải', 'Hạnh', 'Hiếu', 'Hùng', 'Hương', 'Khoa', 'Lan', 'Linh', 'Long', 'Mai', 'Nam', 'Nhi', 'Phát', 'Phúc', 'Quân', 'Quyên', 'Sơn', 'Tâm', 'Thảo', 'Thịnh', 'Trang', 'Tú', 'Tuấn', 'Vy', 'Yến'];
const DISTRICTS = ['Quận 1', 'Quận 3', 'Quận 5', 'Quận 7', 'Quận 10', 'Bình Thạnh', 'Gò Vấp', 'Phú Nhuận', 'Tân Bình', 'Tân Phú', 'Thủ Đức', 'Bình Tân'];
const STREETS = ['Lê Lợi', 'Nguyễn Huệ', 'Cách Mạng Tháng 8', 'Lý Thường Kiệt', 'Nguyễn Trãi', 'Điện Biên Phủ', 'Võ Văn Tần', 'Phan Xích Long', 'Hoàng Văn Thụ', 'Lê Văn Sỹ'];

const BRANDS = [
  ['XIAOMI', 'Xiaomi', ['PHONE', 'TABLET', 'TV', 'HOME']], ['OPPO', 'OPPO', ['PHONE', 'AUDIO']], ['ASUS', 'ASUS', ['LAPTOP', 'TABLET']],
  ['HP', 'HP', ['LAPTOP']], ['LENOVO', 'Lenovo', ['LAPTOP', 'TABLET']], ['SONY', 'Sony', ['TV', 'AUDIO']], ['LG', 'LG', ['TV', 'HOME', 'AUDIO']],
  ['PANASONIC', 'Panasonic', ['HOME', 'TV']],
];
// [mã, tên, hãng, loại thiết bị, nhóm, tháng BH]
const PRODUCTS = [
  ['SP-0101', 'iPhone 15 128GB', 'APPLE', 'PHONE_IMEI', 'PHONE', 12], ['SP-0102', 'Galaxy S24 256GB', 'SAMSUNG', 'PHONE_IMEI', 'PHONE', 12],
  ['SP-0103', 'Redmi Note 13 Pro', 'XIAOMI', 'PHONE_IMEI', 'PHONE', 18], ['SP-0104', 'OPPO Reno11 5G', 'OPPO', 'PHONE_IMEI', 'PHONE', 12],
  ['SP-0201', 'Dell Inspiron 15 3530', 'DELL', 'LAPTOP_SERIAL', 'LAPTOP', 12], ['SP-0202', 'ASUS Vivobook 15 OLED', 'ASUS', 'LAPTOP_SERIAL', 'LAPTOP', 24],
  ['SP-0203', 'HP Pavilion 14', 'HP', 'LAPTOP_SERIAL', 'LAPTOP', 12], ['SP-0204', 'Lenovo IdeaPad Slim 5', 'LENOVO', 'LAPTOP_SERIAL', 'LAPTOP', 24],
  ['SP-0301', 'iPad Air M2', 'APPLE', 'TABLET_SERIAL', 'TABLET', 12], ['SP-0302', 'Galaxy Tab S9 FE', 'SAMSUNG', 'TABLET_SERIAL', 'TABLET', 12],
  ['SP-0401', 'Sony Bravia 55 inch 4K', 'SONY', 'TV_SERIAL', 'TV', 24], ['SP-0402', 'LG OLED evo 55', 'LG', 'TV_SERIAL', 'TV', 24],
  ['SP-0501', 'Sony WH-1000XM5', 'SONY', 'AUDIO_SERIAL', 'AUDIO', 12], ['SP-0502', 'LG XBoom Go XG5', 'LG', 'AUDIO_SERIAL', 'AUDIO', 12],
  ['SP-0601', 'Panasonic Inverter 1.5HP', 'PANASONIC', 'HOME_SERIAL', 'HOME', 24], ['SP-0602', 'Xiaomi Robot Vacuum S10', 'XIAOMI', 'HOME_SERIAL', 'HOME', 12],
];
// [SKU, tên, nhóm, kệ, giá vốn, giá dịch vụ, tháng BH]
const PARTS = [
  ['LK-PHONE-PIN', 'Pin điện thoại', 'PHONE', 'B1', 250000, 450000, 6], ['LK-PHONE-MH', 'Màn hình điện thoại OLED', 'PHONE', 'B2', 1200000, 1900000, 6],
  ['LK-PHONE-SAC', 'Cụm chân sạc', 'PHONE', 'B3', 120000, 250000, 3], ['LK-LAP-PIN', 'Pin laptop 3 cell', 'LAPTOP', 'C1', 650000, 1100000, 12],
  ['LK-LAP-BP', 'Bàn phím laptop', 'LAPTOP', 'C2', 300000, 550000, 6], ['LK-LAP-SSD', 'SSD NVMe 512GB', 'LAPTOP', 'C3', 900000, 1350000, 24],
  ['LK-TAB-MH', 'Màn hình máy tính bảng', 'TABLET', 'D1', 1500000, 2300000, 6], ['LK-TV-NGUON', 'Bo nguồn tivi', 'TV', 'E1', 800000, 1400000, 6],
  ['LK-TV-LED', 'Thanh LED nền tivi', 'TV', 'E2', 450000, 850000, 6], ['LK-AUD-PIN', 'Pin tai nghe/loa', 'AUDIO', 'F1', 180000, 350000, 6],
  ['LK-HOME-BOARD', 'Bo mạch điều khiển gia dụng', 'HOME', 'G1', 700000, 1250000, 12],
];
const SYMPTOMS = {
  PHONE: ['Không lên nguồn', 'Pin tụt nhanh, sập nguồn khi còn 20%', 'Màn hình sọc, cảm ứng loạn', 'Không nhận sạc', 'Loa ngoài rè, mic không thu'],
  LAPTOP: ['Không khởi động, đèn nguồn chớp', 'Bàn phím liệt vài phím', 'Pin không sạc vào', 'Máy nóng và tự tắt', 'Ổ cứng báo lỗi, chạy chậm'],
  TABLET: ['Màn hình nứt, cảm ứng không nhận', 'Không lên nguồn', 'Sạc rất chậm'],
  TV: ['Có tiếng nhưng không có hình', 'Không lên nguồn, đèn đỏ chớp', 'Màn hình tối một nửa'],
  AUDIO: ['Một bên tai nghe không có tiếng', 'Không kết nối Bluetooth', 'Pin chỉ dùng được 1 giờ'],
  HOME: ['Không làm lạnh, báo lỗi E4', 'Máy chạy ồn, rung mạnh', 'Không nhận lệnh điều khiển'],
};
const WORK = ['Thay linh kiện hỏng, vệ sinh bo mạch', 'Cân chỉnh và cập nhật firmware', 'Hàn lại chân linh kiện, kiểm tra nguồn', 'Thay thế module, chạy thử 2 giờ'];
const QC = ['VISUAL', 'MAIN_FUNCTION', 'SECONDARY', 'POWER_CHARGING', 'DATA', 'FINAL'];
const CHECKLIST = ['Ngoại quan', 'Nguồn', 'Chức năng chính'];

function luhnImei() {
  const digits = Array.from({ length: 14 }, (_, i) => (i === 0 ? 3 : between(0, 9)));
  const sum = digits.reduce((s, d, i) => { if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9; } return s + d; }, 0);
  return digits.join('') + ((10 - (sum % 10)) % 10);
}
let serialCounter = 0;
const serialFor = (product) => (product[3] === 'PHONE_IMEI' ? luhnImei() : `${product[2].slice(0, 3)}${SEED % 1000}${String(++serialCounter).padStart(6, '0')}`);
const usedPhones = new Set(['0900000001']);
function phone() { for (;;) { const p = '09' + String(between(10000000, 99999999)); if (!usedPhones.has(p)) { usedPhones.add(p); return p; } } }
function personName() { return `${pick(HO)} ${pick(DEM)} ${pick(TEN)}`; }
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aG4sAAAAASUVORK5CYII=', 'base64');

// ---------- Kịch bản ----------
const start = workTime(NOW - DAYS * DAY);
const technicians = ['NV-004', 'NV-007'];
const techUser = { 'NV-004': 'technician', 'NV-007': 'technician2' };
const customers = [];
const counts = { tickets: 0, delivered: 0, returned: 0, open: 0, online: 0, receipts: 0 };

async function setupCatalog() {
  await login('admin'); await login('receptionist'); await login('dispatcher'); await login('technician'); await login('technician2');
  await login('warehouse'); await login('cashier'); await login('0900000001');
  for (const [code, name, categories] of BRANDS)
    await api('admin', 'POST', '/catalog/brands', { code, name, categoryCodes: categories }, start).catch(() => {});
  for (const [code, name, brandId, deviceTypeCode, , months] of PRODUCTS)
    await api('admin', 'POST', '/catalog/products', { code, name, brandId, deviceTypeCode, productLine: 'Demo', defaultWarrantyMonths: months }, start).catch(() => {});
  for (const [code, name, categoryCode, primaryBin, costPrice, servicePrice, warrantyMonths] of PARTS)
    await api('admin', 'POST', '/catalog/parts', { code, name, unit: 'Cái', categoryCode, brandName: 'Linh kiện thay thế', costPrice, servicePrice, minLevel: 4, primaryBin, warrantyMonths, supplierId: 'NCC-001' }, start).catch(() => {});
  for (const [code, name, categoryCode, price] of [['DV-02', 'Kiểm tra và sửa chữa điện thoại', 'PHONE', 120000], ['DV-03', 'Kiểm tra và sửa chữa tivi', 'TV', 250000], ['DV-04', 'Kiểm tra và sửa chữa gia dụng', 'HOME', 200000]])
    await api('admin', 'POST', '/catalog/service-prices', { code, name, categoryCode, price }, start).catch(() => {});
  // Hai kỹ thuật viên mới: tạo, đăng nhập bằng mật khẩu tạm, đổi mật khẩu như lần đầu thật.
  for (const [fullName, specialty, skills, username] of [['Phạm Quốc Bảo', 'Laptop & máy tính bảng', ['LAPTOP', 'TABLET'], 'kythuat.bao'], ['Võ Thị Thu Hà', 'Điện tử gia dụng & tivi', ['TV', 'HOME', 'AUDIO'], 'kythuat.ha']]) {
    try {
      const created = await api('admin', 'POST', '/admin/employees', { fullName, phone: phone(), specialty, skills, maxActiveTickets: 12, username, roles: ['TECHNICIAN'] }, start);
      await login(username, created.temporaryPassword);
      await api(username, 'POST', '/auth/change-password', { currentPassword: created.temporaryPassword, newPassword: PASSWORD });
      await login(username, PASSWORD);
      technicians.push(created.employee.employeeId); techUser[created.employee.employeeId] = username;
    } catch {
      // Chạy lại trên cùng database: tài khoản đã có.
      try { const me = await login(username, PASSWORD); technicians.push(me.user.employeeId); techUser[me.user.employeeId] = username; } catch { /* bỏ qua */ }
    }
  }
}

async function restock(at) {
  const lines = PARTS.map(([sku, , , bin, cost]) => ({ sku, quantity: 25, unitCost: cost, binCode: bin }));
  const receipt = await api('warehouse', 'POST', '/stock-receipts', { supplierId: 'NCC-001', receivedOn: vnDate(at), note: 'Nhập kho định kỳ', lines }, at);
  await api('warehouse', 'POST', `/stock-receipts/${receipt.code}/approve`, undefined, later(at, 0.5, 2));
  counts.receipts++;
}

async function newCustomer(at, fullName = personName(), customerPhone = phone()) {
  const c = await api('receptionist', 'POST', '/customers', {
    fullName, phone: customerPhone, email: chance(0.6) ? `${fullName.split(' ').pop().toLowerCase()}${between(10, 99)}@example.com`.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd') : null,
    address: `${between(1, 300)} ${pick(STREETS)}, ${pick(DISTRICTS)}, TP.HCM`,
  }, at);
  const customer = { code: c.code, fullName, phone: customerPhone, devices: [] };
  customers.push(customer);
  return customer;
}

async function newDevice(customer, product, charged, at) {
  const received = new Date(at);
  const activated = new Date(received); activated.setUTCMonth(activated.getUTCMonth() - (charged ? product[5] + between(2, 12) : between(1, product[5] - 1)));
  const expires = new Date(activated); expires.setUTCMonth(expires.getUTCMonth() + product[5]);
  const d = await api('receptionist', 'POST', '/devices', {
    customerCode: customer.code, productId: product[0], identifierType: product[3] === 'PHONE_IMEI' ? 'IMEI' : 'SERIAL', serialOrImei: serialFor(product),
    warrantyActivatedOn: vnDate(activated.getTime()), warrantyExpiresOn: vnDate(expires.getTime()), distributor: 'Nhà phân phối chính hãng',
  }, at);
  const device = { code: d.code, product, charged, expiresMs: expires.getTime() };
  customer.devices.push(device);
  return device;
}

const handoverForm = (full, rating) => {
  const f = new FormData();
  f.set('data', JSON.stringify(full
    ? { receiverName: 'Khách hàng', conditionOnReturn: 'Hoạt động bình thường sau sửa chữa', rating, customerConfirmed: true, returnedOldParts: chance(0.3),
        recheck: { cosmeticMatches: true, bootsNormally: true, mainFunctionsOk: true, accessoriesComplete: true, noNewIssues: true } }
    : { receiverName: 'Khách hàng', conditionOnReturn: 'Trả nguyên trạng, chưa sửa chữa', customerConfirmed: true }));
  if (full) f.set('signature', new Blob([png], { type: 'image/png' }), 'chu-ky.png');
  return f;
};

/** Một phiếu trọn vòng đời; mỗi bước chỉ chạy nếu mốc thời gian của nó đã qua. */
async function ticketLifecycle(at, options = {}) {
  const due = (t) => t < NOW - 10 * 60e3;
  const customer = options.customer ?? (customers.length < 12 || chance(0.45) ? await newCustomer(at) : pick(customers));
  const reuse = customer.devices.filter((d) => !d.open);
  const charged = options.charged ?? chance(0.4);
  const product = options.product ?? pick(PRODUCTS);
  const device = !options.newDevice && reuse.length && chance(0.15) ? pick(reuse) : await newDevice(customer, product, charged, at);
  // Máy quay lại sửa lần nữa: hết hạn bảo hành từ lần trước thì thành ca tính phí.
  device.charged = device.expiresMs < at + DAY;
  const category = device.product[4];
  const t = await api('receptionist', 'POST', '/tickets', {
    customer: { code: customer.code }, device: { code: device.code }, warrantyRequestCode: options.request ?? null,
    channel: options.request ? 'ONLINE_REQUEST' : weighted([['COUNTER', 85], ['PHONE', 15]]), slaLevel: weighted([['STANDARD_48H', 70], ['PRIORITY_24H', 22], ['EXPRESS_12H', 8]]),
    cosmetic: { customerAcknowledged: true, scratches: weighted([['NONE', 60], ['LIGHT', 35], ['HEAVY', 5]]) },
    reportedIssue: options.symptom ?? pick(SYMPTOMS[category]), estimatedCost: device.charged ? between(2, 20) * 50000 : 0,
  }, at);
  const code = t.code; counts.tickets++; device.open = true;
  const finish = (kind) => { device.open = false; counts[kind]++; };
  if (chance(0.03) && due(at + HOUR)) { // khách đổi ý ngay tại quầy
    await api('receptionist', 'POST', `/tickets/${code}/return`, { reason: 'Khách đổi ý, nhận lại máy' }, later(at, 0.2, 1));
    await api('cashier', 'POST', `/tickets/${code}/handover`, handoverForm(false), later(at, 1, 3));
    return finish('returned');
  }
  let now = later(at, 0.5, 6);
  if (!due(now)) return counts.open++;
  const tech = pick(technicians), techLogin = techUser[tech];
  await api('dispatcher', 'POST', `/tickets/${code}/assignment`, { technicianId: tech, priority: weighted([['NORMAL', 75], ['URGENT', 15], ['LOW', 10]]) }, now);
  now = later(now, 1, 20); if (!due(now)) return counts.open++;
  await api(techLogin, 'POST', `/tickets/${code}/inspection`, {
    findings: `Kiểm tra: ${t.reportedIssue.toLowerCase()} — xác định nguyên nhân`, checklist: CHECKLIST.map((item) => ({ item, result: chance(0.7) ? 'PASS' : 'FAIL' })),
    waterDamage: false, classification: device.charged ? 'OUT_OF_WARRANTY' : 'FREE_WARRANTY', outOfWarrantyReason: device.charged ? 'Thiết bị đã hết hạn bảo hành' : null,
    proposedFix: 'Thay thế linh kiện hỏng và kiểm tra lại',
  }, now);
  if (chance(0.3)) await api(techLogin, 'POST', `/tickets/${code}/customer-notes`, { text: 'Đã chẩn đoán xong, đang chuẩn bị sửa.' }, later(now, 0.1, 1));
  const partsOfCategory = PARTS.filter((p) => p[2] === category);
  const part = partsOfCategory.length ? pick(partsOfCategory) : null;

  if (!device.charged) {
    now = later(now, 0.5, 8); if (!due(now)) return counts.open++;
    if (chance(0.04)) { // không sửa được
      await api(techLogin, 'POST', `/tickets/${code}/repair/start`, undefined, now);
      now = later(now, 2, 24); if (!due(now)) return counts.open++;
      await api(techLogin, 'POST', `/tickets/${code}/return`, { reason: 'Hư bo mạch chính, hãng ngừng cung cấp linh kiện' }, now);
      now = later(now, 4, 48); if (!due(now)) return counts.open++;
      await api('cashier', 'POST', `/tickets/${code}/handover`, handoverForm(false), now);
      return finish('returned');
    }
    if (part && chance(0.4)) {
      const issue = await api(techLogin, 'POST', '/stock-issues', { ticketCode: code, lines: [{ sku: part[0], quantity: 1 }] }, now);
      now = later(now, 1, 12); if (!due(now)) return counts.open++;
      await api('warehouse', 'POST', `/stock-issues/${issue.code}/approve`, { lineBins: [] }, now);
    } else await api(techLogin, 'POST', `/tickets/${code}/repair/start`, undefined, now);
  } else {
    // Ca tính phí: báo giá → duyệt (đôi khi trả về) → khách quyết định.
    const lines = () => [part && chance(0.65) ? { sku: part[0], quantity: 1, laborFee: between(2, 6) * 50000 } : { description: 'Công sửa chữa', quantity: 1, unitPrice: 0, laborFee: between(3, 10) * 50000 }];
    now = later(now, 0.5, 6); if (!due(now)) return counts.open++;
    let quote = await api(techLogin, 'POST', `/tickets/${code}/quotations`, { vatRate: 8, validUntil: vnDate(now + 7 * DAY), lines: lines() }, now);
    now = later(now, 1, 10); if (!due(now)) return counts.open++;
    if (chance(0.12)) {
      await api('dispatcher', 'POST', `/quotations/${quote.code}/reject`, { note: 'Xem lại tiền công cho phù hợp bảng giá' }, now);
      now = later(now, 1, 8); if (!due(now)) return counts.open++;
      quote = await api(techLogin, 'POST', `/tickets/${code}/quotations`, { vatRate: 8, validUntil: vnDate(now + 7 * DAY), lines: lines() }, now);
      now = later(now, 1, 8); if (!due(now)) return counts.open++;
    }
    await api('dispatcher', 'POST', `/quotations/${quote.code}/approve`, {}, now);
    now = later(now, 2, 48); if (!due(now)) return counts.open++;
    if (chance(0.05)) { // khách không trả lời tới khi quá hạn → lập lại
      now = workTime(now + 9 * DAY); if (!due(now)) return counts.open++;
      await api('dispatcher', 'POST', `/quotations/${quote.code}/expire`, undefined, now);
      now = later(now, 1, 6); if (!due(now)) return counts.open++;
      quote = await api(techLogin, 'POST', `/tickets/${code}/quotations`, { vatRate: 8, validUntil: vnDate(now + 7 * DAY), lines: lines() }, now);
      now = later(now, 1, 6); if (!due(now)) return counts.open++;
      await api('dispatcher', 'POST', `/quotations/${quote.code}/approve`, {}, now);
      now = later(now, 2, 24); if (!due(now)) return counts.open++;
    }
    const decide = (decision, reason) => customer.code === 'KH-000001'
      ? api('0900000001', 'POST', `/portal/tickets/${code}/quotation-decision`, { decision, reason }, now)
      : api('receptionist', 'POST', `/quotations/${quote.code}/customer-decision`, { decision, reason }, now);
    if (chance(0.15)) {
      await decide('DECLINE', pick(['Chi phí cao hơn dự kiến', 'Khách muốn mua máy mới', 'Khách sửa ở nơi khác']));
      now = later(now, 4, 72); if (!due(now)) return counts.open++;
      await api('cashier', 'POST', `/tickets/${code}/handover`, handoverForm(false), now);
      return finish('returned');
    }
    await decide('ACCEPT');
    const ticket = await api(techLogin, 'GET', `/tickets/${code}`, undefined, now);
    if (ticket.status === 'AWAITING_PARTS') {
      now = later(now, 0.5, 4); if (!due(now)) return counts.open++;
      const issue = await api(techLogin, 'POST', '/stock-issues', { ticketCode: code, quotationCode: quote.code }, now);
      now = later(now, 1, 12); if (!due(now)) return counts.open++;
      await api('warehouse', 'POST', `/stock-issues/${issue.code}/approve`, { lineBins: [] }, now);
    }
  }
  // Sửa và QC (đôi khi lần đầu chưa đạt).
  now = later(now, 2, 30); if (!due(now)) return counts.open++;
  if (chance(0.1)) {
    await api(techLogin, 'POST', `/tickets/${code}/repair/results`, { workDone: pick(WORK), qcSteps: QC.map((step, i) => ({ step, result: i === 1 ? 'FAIL' : 'PASS' })), qcResult: 'FAIL', qcDetails: 'Chức năng chính chưa ổn định' }, now);
    now = later(now, 2, 24); if (!due(now)) return counts.open++;
  }
  await api(techLogin, 'POST', `/tickets/${code}/repair/results`, { workDone: pick(WORK), qcSteps: QC.map((step) => ({ step, result: chance(0.15) ? 'NA' : 'PASS' })), qcResult: 'PASS' }, now);
  now = later(now, 2, 72); if (!due(now)) return counts.open++;
  const billing = await api('cashier', 'GET', `/tickets/${code}/billing`, undefined, now);
  if (billing.quotationCode) await api('cashier', 'POST', `/tickets/${code}/payments`, { payerName: customer.fullName, method: weighted([['CASH', 45], ['BANK_TRANSFER', 35], ['E_WALLET', 12], ['CARD', 8]]), expectedAmount: billing.total }, now);
  else await api('cashier', 'POST', `/tickets/${code}/payments/free-warranty`, {}, now);
  now = later(now, 0.1, 1);
  await api('cashier', 'POST', `/tickets/${code}/handover`, handoverForm(true, weighted([[5, 55], [4, 30], [3, 10], [2, 4], [1, 1]])), now);
  if (customer.code === 'KH-000001' && due(now + DAY))
    await api('0900000001', 'POST', `/portal/tickets/${code}/rating`, { rating: 5, comment: 'Sửa nhanh, nhân viên tư vấn rõ ràng.' }, later(now, 4, 24)).catch(() => {});
  return finish('delivered');
}

async function onlineRequest(at) {
  const customer = chance(0.5) && customers.length ? pick(customers) : null;
  const product = pick(PRODUCTS);
  const fullName = customer?.fullName ?? personName();
  const requestPhone = customer?.phone ?? phone();
  const f = new FormData();
  f.set('data', JSON.stringify({ customer: { fullName, phone: requestPhone }, categoryCode: product[4], deviceTypeCode: product[3],
    brandModel: product[1], identifierType: product[3] === 'PHONE_IMEI' ? 'IMEI' : 'SERIAL', serialOrImei: serialFor(product), symptom: pick(SYMPTOMS[product[4]]), preferredStation: 'TRAM-01' }));
  const request = await api(null, 'POST', '/portal/warranty-requests', f, at);
  counts.online++;
  const next = later(at, 2, 30);
  if (next >= NOW) return;
  if (chance(0.2)) return api('receptionist', 'POST', `/warranty-requests/${request.code}/cancel`, { reason: 'Khách không mang máy đến sau 7 ngày' }, workTime(at + 8 * DAY)).catch(() => {});
  const owner = customer ?? await newCustomer(next, fullName, requestPhone);
  await ticketLifecycle(next, { customer: owner, request: request.code, product, charged: false, newDevice: true });
}

// ---------- Chạy ----------
console.log(`Sinh dữ liệu: ${TICKETS} phiếu trong ${DAYS} ngày, seed ${SEED}, API ${BASE}`);
await setupCatalog();
const events = [];
for (let m = 0; m <= DAYS / 30; m++) events.push({ at: workTime(start + m * 30 * DAY), run: restock });
for (let i = 0; i < TICKETS; i++) {
  // Phân bố nghiêng về các tháng gần đây (trung tâm đông dần): lũy thừa > 1 dồn khoảng lùi về gần 0.
  const at = workTime(NOW - DAYS * DAY * Math.pow(rand(), 1.35));
  events.push({ at, run: chance(0.12) ? onlineRequest : ticketLifecycle });
}
events.sort((a, b) => a.at - b.at);
let done = 0;
for (const event of events) {
  try { await event.run(event.at); } catch { /* đã đếm trong stats.errors */ }
  if (++done % 25 === 0) console.log(`  ${done}/${events.length} sự kiện, ${stats.calls} lệnh API`);
}
console.log('\nKết quả:', counts, `| ${customers.length} khách | ${stats.calls} lệnh API, ${stats.failed} lỗi`);
if (stats.failed) console.log('Lỗi theo loại:', stats.errors);
