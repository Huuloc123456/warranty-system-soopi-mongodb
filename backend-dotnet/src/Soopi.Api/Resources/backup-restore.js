// Nạp bản sao lưu tải từ trang quản trị Soopi vào một database MỚI (không ghi đè database đang có).
// Giải nén tệp zip, rồi chạy:
//   mongosh "mongodb://127.0.0.1:27017/?replicaSet=rs0" --file <thư mục giải nén>/restore.js
// Đổi tên database đích bằng biến môi trường SOOPI_RESTORE_DB (mặc định soopi_mongodb_webrestore).
// Bản sao lưu không có hash mật khẩu, phiên đăng nhập và OTP: dùng để lưu trữ, tra cứu, đối chiếu. Muốn chạy lại ứng dụng
// trên dữ liệu khôi phục, dùng mongodump/mongorestore (database/backup trong mã nguồn).
(() => {
  const fs = require('fs');
  const path = require('path');
  const dir = path.dirname(__filename);
  const manifest = EJSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'), { relaxed: true });
  const targetName = process.env.SOOPI_RESTORE_DB || 'soopi_mongodb_webrestore';
  const target = db.getSiblingDB(targetName);
  if (['admin', 'local', 'config'].includes(targetName)) throw new Error('Không nạp vào database hệ thống: ' + targetName);
  if (target.getCollectionNames().length > 0) throw new Error('Database ' + targetName + ' đã có dữ liệu. Chọn database trống bằng SOOPI_RESTORE_DB.');
  let total = 0;
  for (const name of Object.keys(manifest.collections)) {
    const documents = EJSON.parse(fs.readFileSync(path.join(dir, name + '.json'), 'utf8'), { relaxed: false });
    target.createCollection(name);
    if (documents.length) target.getCollection(name).insertMany(documents, { ordered: true });
    total += documents.length;
    print(name.padEnd(20) + String(documents.length).padStart(6));
  }
  print('Đã nạp ' + total + '/' + manifest.documents + ' document vào ' + targetName + ' (bản sao lưu lúc ' + new Date(manifest.createdAt).toISOString() + ').');
  if (total !== manifest.documents) throw new Error('Số document không khớp manifest.');
})();
