import { useState } from 'react';
import { api, errorText, useBusy } from './customer';

const pad = (n: number) => String(n).padStart(2, '0');

/** Sao lưu dữ liệu cho quản trị viên: tải tệp zip (Extended JSON + manifest + restore.js) từ GET /admin/backup. */
export function DataBackup() {
  const [busy, run] = useBusy();
  const [error, setError] = useState('');
  const [done, setDone] = useState('');

  const download = () => void run(async () => {
    setError('');
    setDone('');
    try {
      const file: Blob = await api().get('/admin/backup');
      const now = new Date();
      const name = `soopi-backup-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}.zip`;
      const url = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url;
      link.download = name;
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setDone(`Đã tải ${name} (${Math.max(1, Math.round(file.size / 1024))} KB).`);
    } catch (e) {
      setError(errorText(e));
    }
  });

  return (
    <section className="card" aria-labelledby="backup-title">
      <div className="card__header">
        <div>
          <h2 className="card__title" id="backup-title">Sao lưu dữ liệu</h2>
          <div className="card__title-meta">Tải bản sao toàn bộ dữ liệu nghiệp vụ trong MongoDB về máy</div>
        </div>
        <button type="button" className="btn btn--primary btn--sm" onClick={download} disabled={busy} aria-busy={busy || undefined}>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <path d="M10 3v9m-3-3 3 3 3-3M4 12v4h12v-4" />
          </svg>
          {busy ? 'Đang tạo bản sao lưu…' : 'Tải bản sao lưu'}
        </button>
      </div>
      <div className="card__body stack">
        <p>
          Tệp <code>.zip</code> gồm mỗi collection một tệp Extended JSON (giữ đúng kiểu ngày, số tiền), tệp <code>manifest.json</code> ghi số
          document từng collection và <code>restore.js</code> để nạp lại bằng mongosh vào một database mới.
        </p>
        <p className="form-field__helper">
          Không gồm mật khẩu (hash), phiên đăng nhập và mã OTP. Bản này dùng để lưu trữ và đối chiếu; khôi phục đầy đủ để chạy lại hệ
          thống dùng mongodump/mongorestore trên máy chủ.
        </p>
        <pre className="code-block"><code>mongosh "mongodb://127.0.0.1:27017/?replicaSet=rs0" --file restore.js</code></pre>
        {error && <div className="form-field__error" role="alert">{error}</div>}
        {done && <div className="status-badge status-badge--success" role="status">{done}</div>}
      </div>
    </section>
  );
}
