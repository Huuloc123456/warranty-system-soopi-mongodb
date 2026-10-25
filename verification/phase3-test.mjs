import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
const base = 'http://localhost:8081';
const out = new URL('./phase3-results.json', import.meta.url);
let stamp = Date.now().toString(36).toUpperCase();
const sessions = {};
const report = process.env.PHASE3_RESUME ? JSON.parse(await readFile(out, 'utf8')) : { campaign: `P3-${stamp}`, database: 'soopi_mongodb', base, startedAt: new Date().toISOString(), cases: [], calls: [], data: { customers: [], products: [], parts: [], tickets: [] } };
if (process.env.PHASE3_RESUME) {
  stamp = report.campaign.slice(3);
  report.attempts = [...(report.attempts || []), ...report.cases.filter(c => c.status !== 'PASS')];
  report.cases = report.cases.filter(c => c.status === 'PASS');
  for (const name of ['admin','receptionist','dispatcher','technician','technician2','warehouse','cashier','0900000001']) {
    let r;
    for (let retry=0;retry<5;retry++) {
      r = await fetch(base+'/api/v1/auth/login', { method:'POST', headers:{'Content-Type':'application/json','X-Requested-With':'fetch'}, body:JSON.stringify({username:name,password:'1234',remember:false}) });
      report.calls.push({method:'POST',path:'/api/v1/auth/login',status:r.status,at:new Date().toISOString(),purpose:'Khôi phục phiên để tiếp tục lượt kiểm thử'});
      await writeFile(out,JSON.stringify(report,null,2));
      if (r.status!==429) break;
      console.log('Giới hạn đăng nhập: chờ 20 giây trước khi tiếp tục.');
      await new Promise(resolve=>setTimeout(resolve,20000));
    }
    assert.equal(r.status,200, `Resume login ${name}`); sessions[name]=await r.json();
  }
}
let active;
let scenarioIndex = 0;
const save = () => writeFile(out, JSON.stringify(report, null, 2));
async function scenario(title, steps, expected, action) {
  const index = scenarioIndex++;
  if (report.cases[index]?.status === 'PASS') return;
  active = { id: `TC-${String(report.cases.length + 1).padStart(2, '0')}`, title, steps, expected, status: 'RUNNING', startedAt: new Date().toISOString(), calls: [] };
  report.cases.push(active); await save();
  try { active.actual = await action(); active.status = 'PASS'; }
  catch (e) { active.actual = e.message; active.status = 'FAIL'; throw e; }
  finally { active.finishedAt = new Date().toISOString(); await save(); console.log(`${active.id} ${active.status} ${title}`); }
}
async function request(role, method, path, body, expected = 200) {
  const headers = { 'X-Requested-With': 'fetch' };
  if (role) headers.Authorization = `Bearer ${sessions[role].accessToken}`;
  if (body && !(body instanceof FormData)) headers['Content-Type'] = 'application/json';
  const r = await fetch(base + path, { method, headers, body: body instanceof FormData ? body : body === undefined ? undefined : JSON.stringify(body) });
  const v = r.status === 204 ? null : await r.json();
  const call = { method, path, status: r.status, code: v?.code, at: new Date().toISOString() };
  report.calls.push(call); active?.calls.push(call);
  assert.equal(r.status, expected, `${method} ${path}: expected ${expected}, got ${r.status}; ${v?.code || ''} ${v?.detail || ''}`);
  return v;
}
const today = new Date().toISOString().slice(0,10);
function testImei(prefix) {
  assert.match(prefix,/^\d{14}$/);
  const total=[...prefix].reduce((sum,d,i)=>{const n=Number(d)*(i%2===1?2:1); return sum+(n>9?n-9:n);},0);
  return prefix+((10-total%10)%10);
}
const signature = await (await import('node:fs/promises')).readFile(new URL('../artifacts/phase3/test-signature.png', import.meta.url));
await scenario('Đăng nhập sai mật khẩu', 'Nhập admin với mật khẩu sai tại API đăng nhập.', 'HTTP 401; không cấp phiên.', async () => {
  const r = await request(null,'POST','/api/v1/auth/login',{username:'admin',password:'sai-mat-khau-kiem-thu',remember:false},401);
  assert.equal(r.code,'AUTH_INVALID_CREDENTIALS'); return 'HTTP 401 AUTH_INVALID_CREDENTIALS';
});
await scenario('Đăng nhập đủ 8 tài khoản hiện có', 'Lần lượt đăng nhập admin, receptionist, dispatcher, technician, technician2, warehouse, cashier, 0900000001 bằng 1234; gọi /auth/me.', '8 phiên hợp lệ, đúng tên tài khoản và vai trò.', async () => {
  for (const name of ['admin','receptionist','dispatcher','technician','technician2','warehouse','cashier','0900000001']) {
    sessions[name] = await request(null,'POST','/api/v1/auth/login',{username:name,password:'1234',remember:false});
    const me = await request(name,'GET','/api/v1/auth/me'); assert.equal(me.username,name);
  } return '8/8 đăng nhập HTTP 200 và /auth/me HTTP 200';
});
await scenario('Tạo hồ sơ khách hàng có dữ liệu sát thực tế', 'Lễ tân tạo 3 hồ sơ với tên, số điện thoại mẫu, email .invalid và địa chỉ tại TP.HCM.', '3 mã KH mới, trạng thái ACTIVE.', async () => {
  const suffix = String(Date.now()).slice(-5);
  for (const [i, name, address] of [[1,'Nguyễn Minh Anh','12 đường Nguyễn Văn Cừ, Quận 5, TP.HCM'],[2,'Trần Hoàng Nam','45 đường Lê Văn Sỹ, Quận 3, TP.HCM'],[3,'Lê Ngọc Linh','28 đường Võ Văn Ngân, TP. Thủ Đức, TP.HCM']]) {
    const c = await request('receptionist','POST','/api/v1/customers',{fullName:name,phone:`0909${suffix}${i}`,email:`phase3.${stamp.toLowerCase()}.${i}@example.invalid`,address:address+' (kiểm thử)'},201);
    report.data.customers.push(c); assert.equal(c.status,'ACTIVE');
  } return report.data.customers.map(c=>`${c.code}: ${c.fullName}, ${c.phone}`).join('; ');
});
await scenario('Chặn số điện thoại khách hàng trùng', 'Tạo hồ sơ mới với số điện thoại của Nguyễn Minh Anh vừa tạo.', 'HTTP 409; không tạo hồ sơ thứ hai.', async () => {
  const c = report.data.customers[0]; const r = await request('receptionist','POST','/api/v1/customers',{fullName:'Hồ sơ trùng kiểm thử',phone:c.phone},409); return `HTTP 409 ${r.code}`;
});
await scenario('Tạo danh mục sản phẩm và linh kiện thực tế', 'Admin tạo Dell Latitude 5420, Apple iPhone 13 và Samsung Galaxy S23; thêm pin Dell và màn hình iPhone với giá vốn, giá bán.', '3 sản phẩm và 2 linh kiện mới; liên kết hãng và loại thiết bị hợp lệ.', async () => {
  for (const [name, brandId, deviceTypeCode] of [['Dell Latitude 5420','DELL','LAPTOP_SERIAL'],['Apple iPhone 13 128GB','APPLE','PHONE_IMEI'],['Samsung Galaxy S23 256GB','SAMSUNG','PHONE_IMEI']]) {
    const p = await request('admin','POST','/api/v1/catalog/products',{name,brandId,deviceTypeCode,productLine:'Phase 3 kiểm thử',defaultWarrantyMonths:12,active:true},201); report.data.products.push(p);
  }
  for (const [i,name,categoryCode,costPrice,servicePrice,primaryBin] of [[1,'Pin Dell Latitude 5420 63Wh','LAPTOP',650000,900000,'P3-A1'],[2,'Màn hình Apple iPhone 13 OLED','PHONE',850000,1300000,'P3-A2']]) {
    const p = await request('admin','POST','/api/v1/catalog/parts',{code:`P3-${stamp}-${i}`,name,unit:'Cái',categoryCode,brandName:i===1?'Dell':'Apple',costPrice,servicePrice,minLevel:2,primaryBin,warrantyMonths:6,supplierId:'NCC-001',active:true},201); report.data.parts.push(p);
  } return 'Đã lưu 3 sản phẩm và 2 linh kiện vào MongoDB';
});
await scenario('Từ chối danh mục tham chiếu không tồn tại', 'Admin tạo sản phẩm trỏ tới hãng KHONG-TON-TAI.', 'HTTP 400; không tạo sản phẩm với tham chiếu sai.', async () => {
  const r = await request('admin','POST','/api/v1/catalog/products',{name:'Sản phẩm tham chiếu sai',brandId:'KHONG-TON-TAI',deviceTypeCode:'PHONE_IMEI',defaultWarrantyMonths:12},400); return `HTTP 400 ${r.code}`;
});
await scenario('Nhập kho và đối chiếu tồn', 'Thủ kho lập phiếu nhập 5 pin và 5 màn hình; duyệt phiếu; đọc lại tồn mỗi mã.', 'Mỗi mã onHand=5, reserved=0, phiếu APPROVED.', async () => {
  const receipt = await request('warehouse','POST','/api/v1/stock-receipts',{supplierId:'NCC-001',receivedOn:today,note:`${report.campaign} nhập linh kiện kiểm thử`,lines:report.data.parts.map(p=>({sku:p._id,quantity:5,unitCost:p.costPrice,binCode:p.primaryBin}))},201);
  report.data.receipt = receipt.code; await request('warehouse','POST',`/api/v1/stock-receipts/${receipt.code}/approve`);
  for (const p of report.data.parts) { const stock=await request('warehouse','GET',`/api/v1/parts/${p._id}`); assert.equal(stock.onHand,5); assert.equal(stock.reserved,0); }
  return `${receipt.code}: 5 pin + 5 màn hình; tồn khớp`;
});
await scenario('Phân quyền từ chối thu ngân tạo danh mục', 'Thu ngân gọi API tạo sản phẩm.', 'HTTP 403; không cấp quyền quản trị.', async () => {
  const r = await request('cashier','POST','/api/v1/catalog/products',{name:'Sai quyền'},403); return `HTTP 403 ${r.code}`;
});
for (const [index,charged,issue,serial] of [[0,false,'Không khởi động khi dùng pin, đèn nguồn nhấp nháy','DL5420-P3-'],[1,true,'Màn hình bị sọc xanh và mất cảm ứng góc phải','IP13-P3-']]) {
  const customer = report.data.customers[index]; const product = report.data.products[index]; let ticket=report.data.tickets[index]; let quote=report.data.quote?{code:report.data.quote,grandTotal:1595000}:undefined;
  await scenario(`Tiếp nhận ${charged?'iPhone hết bảo hành':'laptop còn bảo hành'}`, 'Đăng ký thiết bị của khách; ngày kích hoạt/hết hạn; xác nhận ngoại quan; lập phiếu tiếp nhận.', 'Thiết bị được lưu, phiếu RECEIVED.', async () => {
    const device = await request('receptionist','POST','/api/v1/devices',{customerCode:customer.code,productId:product._id,identifierType:index===0?'SERIAL':'IMEI',serialOrImei:index===0?serial+stamp:testImei('359'+String(Date.now()).slice(-11)),warrantyActivatedOn:charged?'2024-06-15':'2026-05-20',warrantyExpiresOn:charged?'2025-06-15':'2027-05-20',distributor:'Soopi kiểm thử'},201);
    ticket = await request('receptionist','POST','/api/v1/tickets',{customer:{code:customer.code},device:{code:device.code},cosmetic:{customerAcknowledged:true},reportedIssue:issue+` (${report.campaign})`,estimatedCost:charged?1595000:0},201);
    assert.equal(ticket.status,'RECEIVED'); report.data.tickets.push({code:ticket.code,customer,device,charged,status:ticket.status}); return `${ticket.code}; ${device.serialOrImei}; RECEIVED`;
  });
  await scenario('Chặn phiếu mở trùng thiết bị', 'Lập thêm phiếu cho chính thiết bị đang có phiếu RECEIVED.', 'HTTP 409 DEVICE_HAS_OPEN_TICKET.', async () => {
    const device=report.data.tickets.at(-1).device; const r=await request('receptionist','POST','/api/v1/tickets',{customer:{code:customer.code},device:{code:device.code},cosmetic:{customerAcknowledged:true},reportedIssue:issue},409); assert.equal(r.code,'DEVICE_HAS_OPEN_TICKET'); return `HTTP 409 ${r.code}; ${ticket.code} giữ nguyên`;
  });
  await scenario('Phân công và chặn kỹ thuật viên không phụ trách', 'Điều phối giao NV-004; technician2 thử ghi chẩn đoán.', 'Phiếu INSPECTING; technician2 nhận HTTP 403.', async () => {
    ticket=await request('dispatcher','POST',`/api/v1/tickets/${ticket.code}/assignment`,{technicianId:'NV-004'}); assert.equal(ticket.status,'INSPECTING');
    const r=await request('technician2','POST',`/api/v1/tickets/${ticket.code}/inspection`,{findings:'Sai người phụ trách',checklist:[{item:'Nguồn',result:'FAIL'}],waterDamage:false,classification:'FREE_WARRANTY'},403); return `${ticket.code}: INSPECTING; không phụ trách HTTP 403 ${r.code}`;
  });
  await scenario(`Chẩn đoán và phân loại ${charged?'tính phí':'miễn phí'}`, 'Kỹ thuật viên phụ trách ghi kết quả, checklist, lý do và phương án sửa.', 'DIAGNOSED; phân loại đúng theo hạn bảo hành.', async () => {
    ticket=await request('technician','POST',`/api/v1/tickets/${ticket.code}/inspection`,{findings:charged?'Cáp màn hình ổn định; tấm OLED lỗi, thiết bị đã hết bảo hành.':'Đầu nối pin lỏng; không có dấu hiệu vào nước.',checklist:[{item:charged?'Màn hình':'Nguồn',result:'FAIL'}],waterDamage:false,classification:charged?'OUT_OF_WARRANTY':'FREE_WARRANTY',outOfWarrantyReason:charged?'Hết hạn bảo hành ngày 15/06/2025':null,proposedFix:charged?'Thay màn hình OLED và kiểm tra cảm ứng.':'Vệ sinh và cố định lại đầu nối pin.'}); assert.equal(ticket.status,'DIAGNOSED'); return `${ticket.code}: DIAGNOSED; ${charged?'OUT_OF_WARRANTY':'FREE_WARRANTY'}`;
  });
  if (charged) {
    await scenario('Lập và duyệt báo giá sửa iPhone', 'KTV báo giá màn hình 1.300.000 + công 150.000, VAT 10%; điều phối duyệt; lễ tân xác nhận thay khách tại quầy.', 'Tổng 1.595.000 đồng; khách đồng ý; chuyển chờ linh kiện.', async () => {
      const priorApproval = report.calls.findLast(c => c.path.startsWith('/api/v1/quotations/') && c.path.endsWith('/approve') && c.status === 200);
      if (priorApproval) quote=await request('dispatcher','GET',priorApproval.path.replace('/approve',''));
      else {
        quote=await request('technician','POST',`/api/v1/tickets/${ticket.code}/quotations`,{vatRate:10,lines:[{sku:report.data.parts[1]._id,quantity:1,laborFee:150000}]},201); assert.equal(quote.grandTotal,1595000);
        quote=await request('dispatcher','POST',`/api/v1/quotations/${quote.code}/approve`,{});
      }
      report.data.quote=quote.code;
      await request('receptionist','POST',`/api/v1/quotations/${quote.code}/customer-decision`,{decision:'ACCEPT'}); return `${quote.code}: 1.595.000 đồng; APPROVED và ACCEPT`;
    });
    await scenario('Giữ hàng và xuất đúng kệ', 'KTV yêu cầu 1 màn hình; kiểm tra reserved; thủ kho chọn P3-A2 và duyệt.', 'onHand 5 → 4; reserved 0 → 1 → 0; phiếu sang REPAIRING.', async () => {
      const sku=report.data.parts[1]._id; const issued=await request('technician','POST','/api/v1/stock-issues',{ticketCode:ticket.code,quotationCode:quote.code},201);
      assert.equal((await request('warehouse','GET',`/api/v1/parts/${sku}`)).reserved,1); await request('warehouse','POST',`/api/v1/stock-issues/${issued.code}/approve`,{lineBins:[{sku,binCode:'P3-A2'}]});
      const stock=await request('warehouse','GET',`/api/v1/parts/${sku}`); assert.equal(stock.onHand,4); assert.equal(stock.reserved,0); report.data.issue=issued.code; return `${issued.code}: tồn 4, giữ 0, xuất 1 màn hình`;
    });
  } else await scenario('Bắt đầu sửa miễn phí', 'KTV chọn bắt đầu sửa sau chẩn đoán bảo hành.', 'Phiếu REPAIRING; không lập báo giá tính phí.', async()=>{ticket=await request('technician','POST',`/api/v1/tickets/${ticket.code}/repair/start`); assert.equal(ticket.status,'REPAIRING'); return `${ticket.code}: REPAIRING`;});
  const qc = result => ({workDone:charged?'Thay màn hình OLED, kiểm tra hiển thị và cảm ứng.':'Vệ sinh và cố định đầu nối pin, cập nhật BIOS.',qcSteps:['VISUAL','MAIN_FUNCTION','SECONDARY','POWER_CHARGING','DATA','FINAL'].map((step,i)=>({step,result:result==='FAIL'&&i===1?'FAIL':'PASS'})),qcResult:result,qcDetails:result==='FAIL'?'Chức năng chính chưa đạt, cần kiểm tra lại.':'6 bước kiểm tra đạt.'});
  if (!charged) await scenario('KCS chưa đạt phải tiếp tục khắc phục', 'Ghi QC FAIL ở chức năng chính, đọc lại trạng thái.', 'Giữ REPAIRING, lưu lần kiểm định FAIL.', async()=>{ticket=await request('technician','POST',`/api/v1/tickets/${ticket.code}/repair/results`,qc('FAIL')); assert.equal(ticket.status,'REPAIRING'); return `${ticket.code}: REPAIRING; QC FAIL được lưu`;});
  await scenario('KCS đạt và hoàn tất kỹ thuật', 'Ghi 6 bước QC PASS, lưu nội dung đã sửa.', 'Phiếu COMPLETED; lịch sử các lần KCS được giữ.', async()=>{ticket=await request('technician','POST',`/api/v1/tickets/${ticket.code}/repair/results`,qc('PASS')); assert.equal(ticket.status,'COMPLETED'); return `${ticket.code}: COMPLETED, 6/6 QC PASS`;});
  await scenario(`Thanh toán ${charged?'dịch vụ':'bảo hành miễn phí'}`, 'Thu ngân đọc khoản phải thu và xác nhận thanh toán.', charged?'Ghi thanh toán CASH 1.595.000 đồng.':'Ghi xác nhận miễn phí; tổng phải thu bằng 0.', async()=>{
    const billing=await request('cashier','GET',`/api/v1/tickets/${ticket.code}/billing`); assert.equal(billing.total,charged?1595000:0);
    const payment=charged?await request('cashier','POST',`/api/v1/tickets/${ticket.code}/payments`,{payerName:customer.fullName,method:'CASH',expectedAmount:1595000},201):await request('cashier','POST',`/api/v1/tickets/${ticket.code}/payments/free-warranty`,{},201);
    report.data.tickets.at(-1).payment=payment; return `${ticket.code}: xác nhận ${charged?'1.595.000 đồng CASH':'miễn phí 0 đồng'}`;
  });
  await scenario('Bàn giao có xác nhận và chữ ký mẫu', 'Thu ngân nhập người nhận, 5 tiêu chí nghiệm thu đạt và tải ảnh chữ ký kiểm thử.', 'Phiếu DELIVERED; lưu phiếu bàn giao và ảnh chữ ký.', async()=>{
    const f=new FormData(); f.set('data',JSON.stringify({receiverName:customer.fullName,conditionOnReturn:'Thiết bị hoạt động ổn định; ngoại quan và phụ kiện như khi tiếp nhận.',rating:5,customerConfirmed:true,recheck:{cosmeticMatches:true,bootsNormally:true,mainFunctionsOk:true,accessoriesComplete:true,noNewIssues:true}})); f.set('signature',new Blob([signature],{type:'image/png'}),'chu-ky-kiem-thu.png');
    ticket=await request('cashier','POST',`/api/v1/tickets/${ticket.code}/handover`,f); assert.equal(ticket.status,'DELIVERED'); report.data.tickets.at(-1).status=ticket.status; await request('cashier','GET',`/api/v1/tickets/${ticket.code}/handover-slip`); return `${ticket.code}: DELIVERED; phiếu bàn giao HTTP 200`;
  });
  await scenario('Tra cứu thật bằng mã phiếu và số điện thoại', 'Tra cứu portal với đúng mã phiếu/số điện thoại; dùng token được cấp để xem tiến độ.', 'Chỉ xem đúng phiếu; trạng thái hoàn thành được trả về.', async()=>{
    sessions.guest=await request(null,'POST','/api/v1/portal/lookup',{code:ticket.code,phone:customer.phone}); const detail=await request('guest','GET',`/api/v1/portal/tickets/${ticket.code}`); assert(JSON.stringify(detail).includes(ticket.code)); return `${ticket.code}: lookup và chi tiết HTTP 200; tài khoản khách không cần tạo thêm`;
  });
}
await scenario('Tạo phiếu đang chờ xử lý để kiểm tra hàng đợi', 'Tiếp nhận Galaxy S23 của Lê Ngọc Linh, lỗi sạc chập chờn; chưa phân công.', 'Phiếu RECEIVED, xuất hiện trong danh sách điều phối.', async()=>{
  const customer=report.data.customers[2]; const product=report.data.products[2]; const device=await request('receptionist','POST','/api/v1/devices',{customerCode:customer.code,productId:product._id,identifierType:'IMEI',serialOrImei:testImei('358'+String(Date.now()).slice(-11)),warrantyActivatedOn:'2026-03-10',warrantyExpiresOn:'2027-03-10'},201);
  const t=await request('receptionist','POST','/api/v1/tickets',{customer:{code:customer.code},device:{code:device.code},cosmetic:{customerAcknowledged:true},reportedIssue:`Sạc chập chờn khi cắm cáp USB-C (${report.campaign})`},201); assert.equal(t.status,'RECEIVED'); report.data.tickets.push({code:t.code,customer,device,charged:false,status:t.status}); return `${t.code}: RECEIVED; ${customer.fullName}`;
});
await scenario('Báo cáo doanh thu và trạng thái', 'Admin xem báo cáo doanh thu tháng, trạng thái phiếu và KCS sửa lại.', 'Các API HTTP 200; số liệu có chứng từ từ lượt kiểm thử.', async()=>{
  report.data.revenue=await request('admin','GET','/api/v1/reports/revenue-monthly'); report.data.statuses=await request('admin','GET','/api/v1/reports/tickets-by-status'); const rework=await request('admin','GET','/api/v1/reports/repeat-repairs'); assert(JSON.stringify(rework).includes(report.data.tickets[0].code)); return '3 báo cáo HTTP 200; phiếu laptop có QC FAIL xuất hiện trong báo cáo sửa lại';
});
await scenario('Từ chối IMEI không hợp lệ', 'Lễ tân tạo điện thoại với IMEI 12345.', 'HTTP 400 IMEI_INVALID; không tạo thiết bị.', async()=>{const r=await request('receptionist','POST','/api/v1/devices',{customerCode:report.data.customers[2].code,productId:report.data.products[2]._id,identifierType:'IMEI',serialOrImei:'12345'},400); assert.equal(r.code,'IMEI_INVALID'); return 'HTTP 400 IMEI_INVALID';});
report.finishedAt=new Date().toISOString(); await save();
console.log(`COMPLETE ${report.cases.length} cases; ${report.calls.length} HTTP calls; campaign ${report.campaign}`);
