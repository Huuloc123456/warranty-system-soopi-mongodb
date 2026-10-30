// Bổ sung các điểm dừng để demo trực tiếp; không xóa hay sửa chứng từ cũ.
// Chạy API riêng trên soopi_mongodb_demo tại cổng 8083 trước khi chạy script này.
import assert from 'node:assert/strict';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const base = process.env.SOOPI_URL || 'http://localhost:8083';
assert.match(base, /^http:\/\/(localhost|127\.0\.0\.1):\d+$/);
const output = new URL('./phase6-result.json', import.meta.url);
if (existsSync(output)) {
  const previous = JSON.parse(readFileSync(output, 'utf8'));
  assert.ok(!previous.startedWriting && previous.tickets.length === 0 && previous.customers.length === 0 && Object.keys(previous.documents).length === 0,
    'Đã bắt đầu ghi dữ liệu trong đợt cũ. Kiểm tra phase6-result.json; không chạy lặp.');
}
const now = new Date();
const batch = `P6-${now.toISOString().replace(/\D/g, '').slice(0, 14)}`;
const date = (offset) => new Date(now.getTime() + offset * 86400000).toISOString().slice(0, 10);
const report = { batch, database: 'soopi_mongodb_demo', api: base, createdAt: now.toISOString(), completed: false, calls: 0, customers: [], devices: [], tickets: [], documents: {}, checks: [] };
const save = () => writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
const tokens = {};
async function api(user, method, path, body) {
  const headers = { 'X-Requested-With': 'fetch' };
  if (tokens[user]) headers.Authorization = `Bearer ${tokens[user]}`;
  let payload = body;
  if (body !== undefined && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  report.calls++;
  const response = await fetch(base + '/api/v1' + path, { method, headers, body: payload });
  const text = await response.text();
  let result;
  try { result = text ? JSON.parse(text) : null; } catch { result = text; }
  assert.ok(response.ok, `${method} ${path}: HTTP ${response.status} ${JSON.stringify(result)}`);
  return result;
}
const post = (user, path, body) => api(user, 'POST', path, body);
const get = (user, path) => api(user, 'GET', path);
const checkState = async (item, expected) => {
  const ticket = await get('dispatcher', `/tickets/${item.code}`);
  assert.equal(ticket.status, expected, item.scenario);
  item.status = ticket.status;
  report.checks.push(`${item.code}: ${expected}`);
  save();
};
function imei(index) {
  const prefix = '359' + now.getTime().toString().slice(-9) + String(index).padStart(2, '0');
  const sum = [...prefix].reduce((s, v, i) => { let n = Number(v) * (i % 2 ? 2 : 1); return s + (n > 9 ? n - 9 : n); }, 0);
  return prefix + (10 - sum % 10) % 10;
}
const people = ['Nguyễn Minh Khang', 'Trần Ngọc Mai', 'Lê Hoàng Phúc', 'Phạm Thanh Trúc', 'Võ Quốc Huy', 'Đặng Thùy Linh', 'Bùi Gia Bảo', 'Đỗ Hải Yến', 'Huỳnh Đức Anh', 'Ngô Bảo Châu', 'Phan Khánh Vy', 'Lý Minh Quân'];
const cases = [
  ['Tiếp nhận mới, chờ điều phối', 'RECEIVED', false, 'SP-0201'],
  ['Đã giao kỹ thuật viên, chờ kiểm tra', 'INSPECTING', false, 'SP-0102'],
  ['Đã chẩn đoán, chờ bắt đầu sửa miễn phí', 'DIAGNOSED', false, 'SP-0202'],
  ['Báo giá mới, chờ điều phối duyệt', 'AWAITING_QUOTE_APPROVAL', true, 'SP-0101'],
  ['Khách demo đăng nhập để đồng ý báo giá', 'AWAITING_CUSTOMER_CONFIRMATION', true, 'SP-0201', true],
  ['Đã giữ pin, chờ thủ kho duyệt xuất', 'AWAITING_PARTS', false, 'SP-0201'],
  ['Đang sửa miễn phí, chờ KCS', 'REPAIRING', false, 'SP-0202'],
  ['KCS đạt, chờ thu phí 270.000 đồng', 'COMPLETED', true, 'SP-0102'],
  ['KCS đạt, chờ xác nhận miễn phí', 'COMPLETED', false, 'SP-0201'],
  ['Khách từ chối báo giá, chờ nhận máy', 'AWAITING_RETURN', true, 'SP-0101'],
  ['Đã thu phí, bàn giao và đánh giá sau KCS làm lại', 'DELIVERED', true, 'SP-0201', true],
  ['Đã trả nguyên trạng do không sửa được', 'RETURNED_UNREPAIRED', false, 'SP-0202'],
  ['Đã thu phí, chờ ký bàn giao', 'COMPLETED', true, 'SP-0102'],
];
const signature = readFileSync(new URL('./phase6-signature.png', import.meta.url));
assert.ok(signature.length > 8 && signature.length <= 200 * 1024);
assert.equal(signature.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');

try {
  assert.equal((await (await fetch(base + '/actuator/health')).json()).status, 'UP');
  const users = {};
  for (const user of ['admin', 'receptionist', 'dispatcher', 'technician', 'technician2', 'warehouse', 'cashier', '0900000001']) {
    const result = await post(null, '/auth/login', { username: user, password: '1234', remember: false });
    tokens[user] = result.accessToken;
    users[user] = result.user;
  }
  // Kiểm tra danh mục trước khi bắt đầu ghi dữ liệu.
  const products = await get('receptionist', '/catalog/products');
  const list = Array.isArray(products) ? products : products.items;
  for (const code of new Set(cases.map((c) => c[3]))) assert.ok(list.some((p) => p._id === code), `Thiếu sản phẩm ${code}`);
  const part = await get('warehouse', '/parts/LK-LAP-PIN');
  assert.equal(part.sku, 'LK-LAP-PIN');
  report.startedWriting = true; save();
  const receipt = await post('warehouse', '/stock-receipts', { supplierId: 'NCC-001', batchNo: batch, receivedOn: date(0), note: `[DEMO Phase6] ${batch}: nhập bổ sung 12 pin laptop`, lines: [{ sku: 'LK-LAP-PIN', quantity: 12, unitCost: 650000, binCode: 'C1' }] });
  await post('warehouse', `/stock-receipts/${receipt.code}/approve`);
  report.documents.receipt = receipt.code;
  save();
  for (const [index, [scenario, target, charged, productId, own]] of cases.entries()) {
    const fullName = people[index % people.length];
    const customer = own ? { code: users['0900000001'].customerId, fullName: users['0900000001'].displayName, phone: '0900000001' }
      : await post('receptionist', '/customers', { fullName, phone: '0886' + now.getTime().toString().slice(-4) + String(index + 1).padStart(2, '0'), email: `phase6.${batch.toLowerCase()}.${index + 1}@example.invalid`, address: `${20 + index * 4} Lê Văn Sỹ, TP. Hồ Chí Minh (địa chỉ demo)` });
    if (!own) report.customers.push({ code: customer.code, fullName, phone: customer.phone });
    const phoneDevice = productId.startsWith('SP-01');
    const device = await post('receptionist', '/devices', { customerCode: customer.code, productId, identifierType: phoneDevice ? 'IMEI' : 'SERIAL', serialOrImei: phoneDevice ? imei(index) : `${batch}-${index + 1}`, warrantyActivatedOn: date(charged ? -800 : -60), warrantyExpiresOn: date(charged ? -435 : 305), distributor: 'Nhà phân phối demo Phase6' });
    report.devices.push(device.code);
    const ticket = await post('receptionist', '/tickets', { customer: { code: customer.code }, device: { code: device.code }, channel: 'COUNTER', requestType: charged ? 'PAID_REPAIR' : 'WARRANTY', slaLevel: index % 3 === 0 ? 'PRIORITY_24H' : 'STANDARD_48H', cosmetic: { customerAcknowledged: true, scratches: 'LIGHT', accessories: 'COMPLETE', notes: `[DEMO Phase6] ${batch}` }, reportedIssue: phoneDevice ? 'Sạc chập chờn, pin tụt nhanh khi sử dụng' : 'Máy nóng, pin không sạc ổn định', estimatedCost: charged ? 250000 : 0 });
    const item = { code: ticket.code, scenario, expectedStatus: target, customerCode: customer.code, phone: customer.phone, productId, deviceCode: device.code, portalCustomer: !!own, status: ticket.status };
    report.tickets.push(item); save();
    await post('receptionist', `/tickets/${ticket.code}/internal-notes`, { text: `[DEMO Phase6] ${batch} - ${scenario}. Thông tin khách và nghiệp vụ chỉ dùng trình diễn.` });
    if (target === 'RECEIVED') { await checkState(item, target); continue; }
    const technician = index % 2 ? 'technician2' : 'technician';
    item.technician = technician;
    await post('dispatcher', `/tickets/${ticket.code}/assignment`, { technicianId: users[technician].employeeId, priority: 'NORMAL', note: `[DEMO Phase6] ${scenario}` });
    if (target === 'INSPECTING') { await checkState(item, target); continue; }
    await post(technician, `/tickets/${ticket.code}/inspection`, { findings: 'Đã kiểm tra nguồn, pin và cổng sạc; xác nhận lỗi theo mô tả.', checklist: ['Ngoại quan', 'Nguồn', 'Chức năng chính'].map((item) => ({ item, result: 'PASS' })), waterDamage: false, classification: charged ? 'OUT_OF_WARRANTY' : 'FREE_WARRANTY', outOfWarrantyReason: charged ? 'Đã hết hạn bảo hành theo hồ sơ thiết bị' : null, proposedFix: 'Vệ sinh cổng sạc, kiểm tra nguồn và cập nhật firmware; thay pin nếu cần.' });
    if (target === 'DIAGNOSED') { await checkState(item, target); continue; }
    if (target === 'RETURNED_UNREPAIRED') {
      await post(technician, `/tickets/${ticket.code}/return`, { reason: '[DEMO Phase6] Bo mạch không thể khắc phục, khách nhận lại nguyên trạng' });
    } else if (charged) {
      const quote = await post(technician, `/tickets/${ticket.code}/quotations`, { vatRate: 8, validUntil: date(7), lines: [{ description: 'Vệ sinh cổng sạc, kiểm tra nguồn và cập nhật firmware', quantity: 1, unitPrice: 0, laborFee: 250000 }] });
      item.quotationCode = quote.code; assert.equal(quote.grandTotal, 270000); save();
      if (target === 'AWAITING_QUOTE_APPROVAL') { await checkState(item, target); continue; }
      await post('dispatcher', `/quotations/${quote.code}/approve`, {});
      if (target === 'AWAITING_CUSTOMER_CONFIRMATION') { await checkState(item, target); continue; }
      const decision = target === 'AWAITING_RETURN' ? 'DECLINE' : 'ACCEPT';
      if (own) await post('0900000001', `/portal/tickets/${ticket.code}/quotation-decision`, { decision, reason: decision === 'DECLINE' ? 'Khách chọn mua máy mới' : null });
      else await post('receptionist', `/quotations/${quote.code}/customer-decision`, { decision, reason: decision === 'DECLINE' ? 'Khách chọn mua máy mới' : null });
      if (target === 'AWAITING_RETURN') { await checkState(item, target); continue; }
    } else if (target === 'AWAITING_PARTS') {
      const issue = await post(technician, '/stock-issues', { ticketCode: ticket.code, lines: [{ sku: 'LK-LAP-PIN', quantity: 1 }], reason: `[DEMO Phase6] ${batch} - chờ xuất pin tại kệ C1` });
      item.issueCode = issue.code; save(); await checkState(item, target); continue;
    } else await post(technician, `/tickets/${ticket.code}/repair/start`);
    if (target === 'REPAIRING') { await checkState(item, target); continue; }
    if (target !== 'RETURNED_UNREPAIRED') {
      const result = (fail) => ({ workDone: '[DEMO Phase6] Vệ sinh cổng sạc, kiểm tra mạch nguồn, cập nhật firmware và chạy thử.', qcSteps: ['VISUAL', 'MAIN_FUNCTION', 'SECONDARY', 'POWER_CHARGING', 'DATA', 'FINAL'].map((step) => ({ step, result: fail && step === 'POWER_CHARGING' ? 'FAIL' : 'PASS' })), qcResult: fail ? 'FAIL' : 'PASS', qcDetails: fail ? 'Chưa ổn định khi thử sạc; cần kiểm tra lại' : 'Tất cả tiêu chí đạt' });
      if (target === 'DELIVERED') await post(technician, `/tickets/${ticket.code}/repair/results`, result(true));
      await post(technician, `/tickets/${ticket.code}/repair/results`, result(false));
      if (target === 'DELIVERED' || index === 12) {
        const payment = await post('cashier', `/tickets/${ticket.code}/payments`, { payerName: customer.fullName, method: 'CASH', expectedAmount: 270000, note: `[DEMO Phase6] ${batch} - chứng từ mẫu, không thu tiền ngoài hệ thống` });
        item.paymentCode = payment.code; item.paid = true; save();
      }
      if (target === 'COMPLETED') { await checkState(item, target); continue; }
    }
    const form = new FormData();
    const returned = target === 'RETURNED_UNREPAIRED';
    form.set('data', JSON.stringify({ receiverName: customer.fullName, conditionOnReturn: returned ? 'Trả nguyên trạng, chưa sửa chữa (demo)' : 'Máy hoạt động ổn định sau sửa chữa (demo)', customerConfirmed: true, ...(returned ? {} : { rating: 5, recheck: { cosmeticMatches: true, bootsNormally: true, mainFunctionsOk: true, accessoriesComplete: true, noNewIssues: true } }) }));
    if (!returned) form.set('signature', new Blob([signature], { type: 'image/png' }), 'chu-ky-minh-hoa-demo.png');
    await post('cashier', `/tickets/${ticket.code}/handover`, form);
    if (own && !returned) await post('0900000001', `/portal/tickets/${ticket.code}/rating`, { rating: 5, comment: 'Dữ liệu demo: tư vấn rõ ràng, máy hoạt động ổn định sau sửa chữa.' });
    await checkState(item, target);
    await get('cashier', `/tickets/${ticket.code}/handover-slip`);
  }
  const online = new FormData();
  online.set('data', JSON.stringify({ customer: { fullName: 'Nguyễn Thanh Hòa (demo)', phone: '0886' + now.getTime().toString().slice(-4) + '99' }, categoryCode: 'LAPTOP', deviceTypeCode: 'LAPTOP_SERIAL', brandModel: 'Dell Inspiron 15 3530', identifierType: 'SERIAL', serialOrImei: `${batch}-ONLINE`, symptom: '[DEMO Phase6] Laptop không khởi động; khách hẹn mang máy đến', preferredStation: 'TRAM-01' }));
  report.documents.onlineRequest = (await post(null, '/portal/warranty-requests', online)).code;
  // Đọc lại dữ liệu từ API: tồn giữ, thanh toán, lịch sử KCS và quyền cổng khách.
  const inventory = await get('warehouse', '/parts/LK-LAP-PIN');
  assert.equal(inventory.onHand, part.onHand + 12);
  assert.equal(inventory.reserved, part.reserved + 1);
  const delivered = report.tickets.find((t) => t.status === 'DELIVERED');
  const billing = await get('cashier', `/tickets/${delivered.code}/billing`);
  assert.equal(billing.total, 270000); assert.equal(billing.paymentStatus, 'PAID');
  const repaired = await get(delivered.technician, `/tickets/${delivered.code}`);
  assert.deepEqual(repaired.repairOrder.results.map((r) => r.qcResult), ['FAIL', 'PASS']);
  for (const ticket of report.tickets.filter((t) => t.portalCustomer)) await get('0900000001', `/portal/tickets/${ticket.code}`);
  report.checks.push('Tồn kho +12, giữ thêm 1; phiếu thu 270000; QC FAIL/PASS; khách demo xem đúng 2 phiếu của mình.');
  report.completed = true; report.finishedAt = new Date().toISOString(); save();
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  report.error = error.message; save(); console.error(error); process.exitCode = 1;
}
