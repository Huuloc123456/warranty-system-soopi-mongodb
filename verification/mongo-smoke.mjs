import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';

const base = process.env.SOOPI_URL || 'http://localhost:8081';
const results = [];
const sessions = {};
const cookies = {};
async function request(role, method, path, body, expected = 200) {
  const headers = { 'X-Requested-With': 'fetch' };
  if (role) headers.Authorization = `Bearer ${sessions[role].accessToken}`;
  if (role && path.startsWith('/api/v1/auth/')) headers.Cookie = cookies[role] || '';
  if (body && !(body instanceof FormData)) headers['Content-Type'] = 'application/json';
  const response = await fetch(base + path, { method, headers, body: body instanceof FormData ? body : body === undefined ? undefined : JSON.stringify(body) });
  const text = await response.text();
  let value; try { value = text ? JSON.parse(text) : null; } catch { value = text; }
  assert.equal(response.status, expected, `${method} ${path}: ${response.status} ${path.startsWith('/api/v1/auth/') && value?.accessToken ? '<auth response redacted>' : JSON.stringify(value)}`);
  const cookie = response.headers.get('set-cookie');
  if (cookie) cookies[role || body?.username] = cookie.split(';')[0];
  results.push({ method, path, status: response.status });
  return value;
}
assert.equal((await request(null, 'GET', '/actuator/health')).status, 'UP');
for (const role of ['admin','receptionist','dispatcher','technician','warehouse','cashier','0900000001']) {
  sessions[role] = await request(null, 'POST', '/api/v1/auth/login', { username: role, password: '1234', remember: false });
  assert(sessions[role].accessToken);
  await request(role, 'GET', '/api/v1/auth/me');
}
for (const name of ['device-categories','brands','products','warranty-policies','service-prices','suppliers','stations','parts'])
  await request('admin','GET',`/api/v1/catalog/${name}`);
await request('admin','GET','/api/v1/admin/customers');
await request('receptionist','GET','/api/v1/customers?q=demo');
await request('receptionist','GET','/api/v1/devices/lookup?serial=SOOPI-DEMO-001');
await request('warehouse','GET','/api/v1/parts');
await request('dispatcher','GET','/api/v1/tickets');
await request('dispatcher','GET','/api/v1/technicians/workload');
await request('dispatcher','GET','/api/v1/search?q=DEMO');
await request('0900000001','GET','/api/v1/portal/my/devices');
const stamp = Date.now().toString(36).toUpperCase();
const today = new Date().toISOString().slice(0,10);
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aG4sAAAAASUVORK5CYII=', 'base64');
const createdTickets = [];
for (const charged of [false,true]) {
  const device = await request('receptionist','POST','/api/v1/devices', {
    customerCode: 'KH-000001', productId: 'SP-0003', identifierType: 'SERIAL', serialOrImei: `MONGO-${stamp}-${charged?'CHARGED':'FREE'}`,
    warrantyActivatedOn: charged?'2020-01-01':today, warrantyExpiresOn: charged?'2021-01-01':'2030-01-01'
  },201);
  const intake = { customer: { code:'KH-000001' }, device:{ code:device.code }, cosmetic:{ customerAcknowledged:true }, reportedIssue:'Kiểm thử MongoDB — thiết bị không lên nguồn', estimatedCost:0 };
  let ticket = await request('receptionist','POST','/api/v1/tickets',intake,201);
  createdTickets.push(ticket.code);
  assert.equal(ticket.status,'RECEIVED');
  assert.equal((await request('receptionist','POST','/api/v1/tickets',intake,409)).code,'DEVICE_HAS_OPEN_TICKET');
  await request('dispatcher','GET',`/api/v1/tickets/${ticket.code}/assignment-candidates`);
  ticket = await request('dispatcher','POST',`/api/v1/tickets/${ticket.code}/assignment`,{technicianId:'NV-004'});
  assert.equal(ticket.status,'INSPECTING');
  ticket = await request('technician','POST',`/api/v1/tickets/${ticket.code}/inspection`,{
    findings:'Đã kiểm tra nguồn — dữ liệu kiểm thử', checklist:[{item:'Nguồn',result:'FAIL'}], waterDamage:false,
    classification:charged?'OUT_OF_WARRANTY':'FREE_WARRANTY', outOfWarrantyReason:charged?'Hết hạn bảo hành':null, proposedFix:'Thay linh kiện và kiểm tra lại'
  });
  assert.equal(ticket.status,'DIAGNOSED');
  await request('technician','POST',`/api/v1/tickets/${ticket.code}/customer-notes`,{text:'Đã kiểm tra thiết bị — dữ liệu demo'});
  await request('technician','POST',`/api/v1/tickets/${ticket.code}/internal-notes`,{text:'Ghi chú nội bộ kiểm thử MongoDB'});
  let quote;
  if (charged) {
    quote = await request('technician','POST',`/api/v1/tickets/${ticket.code}/quotations`,{vatRate:10,lines:[{sku:'LK-PIN',quantity:1,laborFee:150000}]},201);
    quote = await request('technician','PUT',`/api/v1/quotations/${quote.code}/lines`,{lines:[{sku:'LK-PIN',quantity:1,laborFee:150000}]});
    quote = await request('dispatcher','POST',`/api/v1/quotations/${quote.code}/approve`,{});
    await request('0900000001','POST',`/api/v1/portal/tickets/${ticket.code}/quotation-decision`,{decision:'ACCEPT'});
    const before = await request('warehouse','GET','/api/v1/parts/LK-PIN');
    const issue = await request('technician','POST','/api/v1/stock-issues',{ticketCode:ticket.code,quotationCode:quote.code},201);
    const reserved = await request('warehouse','GET','/api/v1/parts/LK-PIN');
    assert.equal(reserved.reserved,before.reserved+1);
    await request('warehouse','POST',`/api/v1/stock-issues/${issue.code}/approve`,{lineBins:[{sku:'LK-PIN',binCode:'A1'}]});
    const issued = await request('warehouse','GET','/api/v1/parts/LK-PIN');
    assert.equal(issued.onHand,before.onHand-1); assert.equal(issued.reserved,before.reserved);
  } else {
    ticket = await request('technician','POST',`/api/v1/tickets/${ticket.code}/repair/start`);
    assert.equal(ticket.status,'REPAIRING');
  }
  ticket = await request('technician','POST',`/api/v1/tickets/${ticket.code}/repair/results`,{
    workDone:'Sửa chữa hoàn tất — kiểm thử MongoDB', qcSteps:['VISUAL','MAIN_FUNCTION','SECONDARY','POWER_CHARGING','DATA','FINAL'].map(step=>({step,result:'PASS'})), qcResult:'PASS'
  });
  assert.equal(ticket.status,'COMPLETED');
  const billing = await request('cashier','GET',`/api/v1/tickets/${ticket.code}/billing`);
  if (charged) {
    const payment = await request('cashier','POST',`/api/v1/tickets/${ticket.code}/payments`,{payerName:'Khách hàng demo',method:'CASH',expectedAmount:billing.total},201);
    assert.equal(payment.amount,quote.grandTotal);
  } else await request('cashier','POST',`/api/v1/tickets/${ticket.code}/payments/free-warranty`,{},201);
  const handover = new FormData();
  handover.set('data',JSON.stringify({receiverName:'Khách hàng demo',conditionOnReturn:'Đã kiểm tra — dữ liệu demo',rating:5,customerConfirmed:true,recheck:{cosmeticMatches:true,bootsNormally:true,mainFunctionsOk:true,accessoriesComplete:true,noNewIssues:true}}));
  handover.set('signature',new Blob([png],{type:'image/png'}),'demo-signature.png');
  ticket = await request('cashier','POST',`/api/v1/tickets/${ticket.code}/handover`,handover);
  assert.equal(ticket.status,'DELIVERED');
  await request('cashier','GET',`/api/v1/tickets/${ticket.code}/handover-slip`);
  const history = await request('dispatcher','GET',`/api/v1/tickets/${ticket.code}/history`);
  assert(history);
  const portal = await request('0900000001','GET',`/api/v1/portal/tickets/${ticket.code}`);
  assert(!JSON.stringify(portal).includes('Ghi chú nội bộ kiểm thử MongoDB'));
}
for(const name of ['revenue-monthly','technician-performance','turnaround','warranty-ratio','repeat-repairs','quotation-reconciliation','tickets-by-status','sla-distribution'])
  await request('admin','GET',`/api/v1/reports/${name}`);
await request('admin','GET','/api/v1/audit-logs');
await request('dispatcher','GET','/api/v1/notifications');
await request('dispatcher','POST','/api/v1/notifications/read-all',undefined,204);
const receipt = await request('warehouse','POST','/api/v1/stock-receipts',{supplierId:'NCC-001',receivedOn:today,note:'Kiểm thử nhập kho MongoDB',lines:[{sku:'LK-CABLE',quantity:2,unitCost:50000,binCode:'A3'}]},201);
await request('warehouse','PUT',`/api/v1/stock-receipts/${receipt.code}/lines`,{lines:[{sku:'LK-CABLE',quantity:3,unitCost:50000,binCode:'A3'}]});
await request('warehouse','POST',`/api/v1/stock-receipts/${receipt.code}/approve`);
const transfer = await request('warehouse','POST','/api/v1/stock-transfers',{sku:'LK-CABLE',quantity:1,fromBin:'A3',toBin:`DEMO-${stamp}`,reason:'Kiểm thử điều chuyển MongoDB'},201);
await request('warehouse','POST',`/api/v1/stock-transfers/${transfer.code}/approve`);
await request('warehouse','GET','/api/v1/stock-receipts');
await request('warehouse','GET','/api/v1/stock-transfers');
const submission = new FormData();
submission.set('data',JSON.stringify({customer:{fullName:'Khách hàng demo',phone:'0900000001'},categoryCode:'LAPTOP',deviceTypeCode:'LAPTOP_SERIAL',brandModel:'Laptop demo',identifierType:'SERIAL',serialOrImei:`PUBLIC-${stamp}`,symptom:'Kiểm thử yêu cầu online MongoDB',preferredStation:'TRAM-01'}));
submission.set('files',new Blob([png],{type:'image/png'}),'demo-device.png');
const online = await request(null,'POST','/api/v1/portal/warranty-requests',submission,201);
const onlineDetail = await request('receptionist','GET',`/api/v1/warranty-requests/${online.code}`);
assert.equal(onlineDetail.attachments.length,1);
const grant = await request(null,'POST','/api/v1/portal/lookup',{code:online.code,phone:'0900000001'});
sessions.guest = grant;
await request('guest','GET',`/api/v1/portal/warranty-requests/${online.code}`);
await request('0900000001','GET','/api/v1/portal/my/warranty-requests');
const download = await fetch(`${base}/api/v1/files/${onlineDetail.attachments[0].fileId}`,{headers:{Authorization:`Bearer ${grant.accessToken}`}});
assert.equal(download.status,200); assert.deepEqual(Buffer.from(await download.arrayBuffer()),png);
results.push({method:'GET',path:'/api/v1/files/{id}',status:200});
await request('receptionist','POST',`/api/v1/warranty-requests/${online.code}/cancel`,{reason:'Hoàn tất kiểm thử demo'});
await request('0900000001','PUT',`/api/v1/notifications/devices/demo-${stamp}`,{platform:'ANDROID',pushToken:`demo-${stamp}`,appVersion:'demo'},204);
await request('0900000001','DELETE',`/api/v1/notifications/devices/demo-${stamp}`,undefined,204);
const oldCookie = cookies.admin;
sessions.admin = await request('admin','POST','/api/v1/auth/refresh');
await request('admin','GET','/api/v1/auth/me');
cookies.admin = oldCookie;
assert.equal((await request('admin','POST','/api/v1/auth/refresh',undefined,401)).code,'AUTH_REFRESH_REUSED');
await request('admin','POST','/api/v1/auth/logout',undefined,204);
console.log(`PASS ${results.length} MongoDB API checks`);
await writeFile(new URL('./mongo-smoke-results.json', import.meta.url), JSON.stringify({ database: 'soopi_mongodb', base, checkedAt: new Date().toISOString(), createdTickets, results }, null, 2));
