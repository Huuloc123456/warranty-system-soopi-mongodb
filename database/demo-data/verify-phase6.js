// Chỉ đọc, đối chiếu dữ liệu Phase6 đã ghi qua API. Chạy từ thư mục gốc bằng mongosh --file.
(() => {
  const fs = require('fs');
  const path = require('path');
  const assert = require('assert').strict;
  const result = JSON.parse(fs.readFileSync('database/demo-data/phase6-result.json', 'utf8'));
  assert.equal(result.completed, true);
  assert.equal(result.database, 'soopi_mongodb_demo');
  const d = db.getSiblingDB(result.database);
  const checks = [];
  for (const item of result.tickets) {
    const t = d.tickets.findOne({ _id: item.code });
    assert.ok(t, item.code);
    assert.equal(t.status, item.expectedStatus);
    assert.equal(t.open, !['DELIVERED', 'RETURNED_UNREPAIRED'].includes(t.status));
    assert.ok(d.customers.findOne({ _id: t.customerId }));
    assert.ok(d.devices.findOne({ _id: t.deviceId, customerId: t.customerId }));
    assert.equal(t.statusHistory.at(-1).status, t.status);
    if (item.quotationCode) assert.ok(d.quotations.findOne({ _id: item.quotationCode, ticketId: item.code }));
    if (item.paymentCode) {
      const p = d.payments.findOne({ _id: item.paymentCode, ticketId: item.code });
      assert.equal(p.amount.toString(), '270000'); assert.equal(p.type, 'CHARGED');
    }
    if (t.handover?.signature) {
      const attachment = d.attachments.findOne({ _id: Long(t.handover.signature.fileId) });
      assert.ok(attachment);
      const file = path.resolve('backend-dotnet/src/Soopi.Api/data/files', attachment.storageKey);
      const bytes = fs.readFileSync(file);
      assert.equal(bytes.length, Number(attachment.size));
      assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    }
    checks.push({ code: t._id, status: t.status, open: t.open });
  }
  assert.equal(new Set(checks.map((t) => t.status)).size, 11);
  const issue = d.stock_issues.findOne({ _id: result.tickets.find((t) => t.issueCode).issueCode });
  assert.equal(issue.status, 'PENDING'); assert.equal(issue.lines[0].quantity, 1);
  const receipt = d.stock_receipts.findOne({ _id: result.documents.receipt });
  assert.equal(receipt.status, 'APPROVED'); assert.equal(receipt.lines[0].quantity, 12);
  assert.equal(d.warranty_requests.findOne({ _id: result.documents.onlineRequest }).status, 'PENDING_INTAKE');
  for (const p of d.parts.find().toArray()) {
    assert.ok(p.onHand >= p.reserved && p.reserved >= 0, p._id);
    assert.equal(p.bins.reduce((sum, bin) => sum + bin.qty, 0), p.onHand, p._id);
  }
  const delivered = d.tickets.findOne({ _id: result.tickets.find((t) => t.status === 'DELIVERED').code });
  assert.equal(delivered.repairOrder.results.map((r) => r.qcResult).join(','), 'FAIL,PASS');
  const schema = d.getCollectionInfos({ name: 'tickets' })[0].options.validator;
  assert.equal(d.tickets.countDocuments({ _id: { $in: result.tickets.map((t) => t.code) }, ...schema }), 13);
  const inventory = d.parts.findOne({ _id: 'LK-LAP-PIN' });
  const evidence = {
    checkedAt: new Date().toISOString(), database: result.database, batch: result.batch,
    serverVersion: d.version(), replicaSet: db.hello().setName,
    counts: d.getCollectionNames().sort().map((name) => ({ name, documents: d.getCollection(name).countDocuments({}) })),
    ticketStates: d.tickets.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }, { $sort: { _id: 1 } }]).toArray(),
    batchTickets: checks, inventory: { sku: inventory._id, onHand: inventory.onHand, reserved: inventory.reserved },
    mainDatabase: { tickets: db.getSiblingDB('soopi_mongodb').tickets.countDocuments({}), customers: db.getSiblingDB('soopi_mongodb').customers.countDocuments({}) },
    passed: true,
  };
  fs.writeFileSync('database/demo-data/phase6-verification.json', JSON.stringify(evidence, null, 2) + '\n');
  print(JSON.stringify(evidence, null, 2));
})();
