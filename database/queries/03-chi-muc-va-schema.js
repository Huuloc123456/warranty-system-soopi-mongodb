// =============================================================================================================
// CHỈ MỤC, KẾ HOẠCH TRUY VẤN VÀ RÀNG BUỘC SCHEMA — Soopi MongoDB
// Chạy trong Compass (tab mongosh) hoặc mongosh --file. Compass cũng xem được trực quan ở tab Indexes, Explain Plan,
// và Validation của từng collection. Database mặc định: soopi_mongodb_demo.
// =============================================================================================================
const DB_NAME = (typeof process !== 'undefined' && process.env.SOOPI_QUERY_DB) || 'soopi_mongodb_demo';
const d = db.getSiblingDB(DB_NAME);
const show = (title, value) => { print('\n— ' + title); printjson(value); };

// 1. Liệt kê index đặc biệt: unique, partial, collation, multikey, TTL, text
const special = [];
d.getCollectionNames().sort().forEach((c) => d[c].getIndexes().filter((i) => i.name !== '_id_').forEach((i) => special.push({
  collection: c, name: i.name, key: i.key,
  kind: [i.unique && 'unique', i.partialFilterExpression && 'partial', i.collation && 'collation', i.expireAfterSeconds !== undefined && `TTL ${i.expireAfterSeconds}s`, i.weights && 'text'].filter(Boolean).join(', ') || 'thường',
})));
show('1. Các index (trừ _id)', special);

// 2. Explain: truy vấn có index (IXSCAN) và không có index (COLLSCAN) — so sánh số document phải đọc
const plan = (cursor) => { const e = cursor.explain('executionStats'); const s = JSON.stringify(e.queryPlanner.winningPlan);
  return { stage: s.includes('IXSCAN') ? 'IXSCAN' : 'COLLSCAN', index: (s.match(/"indexName":"([^"]+)"/) || [])[1] || null,
    returned: e.executionStats.nReturned, docsExamined: e.executionStats.totalDocsExamined, keysExamined: e.executionStats.totalKeysExamined }; };
const someCustomer = d.tickets.findOne({}, { customerId: 1 }).customerId;
show('2a. Phiếu của một khách (index ticket_customer)', plan(d.tickets.find({ customerId: someCustomer }).sort({ receivedAt: -1 })));
show('2b. Phiếu theo tên sản phẩm (không có index → quét toàn bộ)', plan(d.tickets.find({ 'deviceSnapshot.productName': 'iPhone 15 128GB' })));
show('2c. Hàng đợi kỹ thuật viên (index ghép ticket_technician)', plan(d.tickets.find({ 'assignment.technicianId': 'NV-004', open: true }).sort({ 'sla.dueAt': 1 })));

// 3. Index partial bảo vệ luật nghiệp vụ: mỗi thiết bị chỉ một phiếu đang mở (ticket_open_device, {open: true})
show('3. Định nghĩa ticket_open_device', d.tickets.getIndexes().find((i) => i.name === 'ticket_open_device'));

// 4. Validator $jsonSchema của các collection nghiệp vụ
const validators = {};
d.getCollectionInfos({ 'options.validator': { $exists: true } }).forEach((c) => {
  const schema = c.options.validator.$jsonSchema;
  validators[c.name] = { title: schema.title, required: schema.required, level: c.options.validationLevel, action: c.options.validationAction };
});
show('4. Collection có $jsonSchema', validators);

// 5. Thử ghi document sai schema → MongoDB từ chối (mã lỗi 121 DocumentValidationFailure)
try {
  d.payments.insertOne({ _id: 'PT-TEST-SAI', ticketId: 'TN-X', type: 'CHARGED', paidAt: new Date(), amount: -5, method: 'BITCOIN', cashierId: 'NV-006' });
  print('\n— 5. (không mong đợi) document sai đã được ghi'); d.payments.deleteOne({ _id: 'PT-TEST-SAI' });
} catch (error) {
  show('5. Ghi phiếu thu sai (amount âm, kiểu double; method lạ) bị từ chối', { code: error.code, codeName: error.code === 121 ? 'DocumentValidationFailure' : error.codeName,
    rules: (error.errInfo?.details?.schemaRulesNotSatisfied || []).flatMap((r) => (r.propertiesNotSatisfied || []).map((p) => p.propertyName)) });
}

// 6. Thống kê dung lượng: số document, kích thước dữ liệu và index của các collection chính
show('6. Thống kê collection', ['tickets', 'payments', 'quotations', 'customers', 'audit_logs', 'notifications'].map((c) => {
  const s = d.runCommand({ collStats: c });
  return { collection: c, documents: s.count, avgDocBytes: s.avgObjSize, dataKB: Math.round(s.size / 1024), indexKB: Math.round(s.totalIndexSize / 1024), indexes: s.nindexes };
}));

// 7. Replica set (cần cho transaction đa document)
const status = db.getSiblingDB('admin').runCommand({ replSetGetStatus: 1 });
show('7. Replica set', { set: status.set, members: status.members.map((m) => `${m.name} ${m.stateStr}`) });
