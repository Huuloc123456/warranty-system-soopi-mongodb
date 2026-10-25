import assert from 'node:assert/strict';
import { browser, session } from './smoke.mjs';

const base = process.env.E2E_BASE_URL || 'http://localhost:5173';
try {
  for (const width of [1440, 390]) {
    const s = await session('CUSTOMER', '/account', width);
    try {
      await s.page.goto(base + '/register');
      await s.page.fill('#fullName', 'Khách thử');
      await s.page.fill('#phone', '0901234567');
      await s.page.fill('#email', 'owner@example.com');
      const issued = s.page.waitForRequest(r => r.url().endsWith('/auth/mobile/otp'));
      await s.page.click('.btn-otp');
      assert.deepEqual((await issued).postDataJSON(), { phone: '0901234567', email: 'owner@example.com', purpose: 'REGISTER' });
      await s.page.getByText('Mã OTP đã gửi tới owner@example.com.', { exact: true }).waitFor();
      await s.page.fill('#otp', '123456');
      await s.page.fill('#password', 'MatKhauMoi2026');
      await s.page.fill('#confirm', 'MatKhauMoi2026');
      const signedIn = s.page.waitForRequest(r => r.url().endsWith('/auth/login'));
      await s.page.click('button[type="submit"]');
      assert.equal((await signedIn).postDataJSON().username, 'owner@example.com');
      await s.page.waitForURL(base + '/account');

      await s.page.goto(base + '/forgot-password');
      await s.page.fill('#email', 'owner@example.com');
      const recovery = s.page.waitForRequest(r => r.url().endsWith('/auth/mobile/otp'));
      await s.page.click('.btn-otp');
      assert.deepEqual((await recovery).postDataJSON(), { email: 'owner@example.com', purpose: 'RESET_PASSWORD' });
      await s.page.getByText(/Mã OTP đã gửi tới email/).waitFor();
      await s.page.fill('#otp', '000000');
      await s.page.getByRole('button', { name: 'Xác nhận mã' }).click();
      await s.page.getByText('Mã xác minh không đúng hoặc đã hết hạn.').waitFor();
      assert.equal(await s.page.locator('#password').count(), 0);
      await s.page.fill('#otp', '123456');
      await s.page.getByRole('button', { name: 'Xác nhận mã' }).click();
      await s.page.getByRole('heading', { name: 'Đặt mật khẩu mới', level: 1 }).waitFor();
      await s.page.fill('#password', 'MatKhauKhac2026');
      await s.page.fill('#confirm', 'MatKhauKhac2026');
      const reset = s.page.waitForRequest(r => r.url().endsWith('/auth/mobile/password-reset'));
      await s.page.click('button[type="submit"]');
      assert.deepEqual((await reset).postDataJSON(), { email: 'owner@example.com', otp: '123456', newPassword: 'MatKhauKhac2026' });
      await s.page.getByRole('heading', { name: 'Đã đặt lại mật khẩu' }).waitFor();

      await s.page.goto(base + '/account#ho-so');
      await s.page.fill('#pf-email', 'new@example.com');
      await s.page.getByRole('button', { name: 'Gửi mã xác minh email' }).click();
      await s.page.locator('#pf-email-code').fill('123456');
      await s.page.getByRole('button', { name: 'Xác minh email', exact: true }).click();
      await s.page.waitForURL(base + '/login?email-updated=1');
      await s.page.getByText('Email đã được xác minh. Hãy đăng nhập lại bằng email mới.').waitFor();
      assert.equal(await s.page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      assert.deepEqual(s.errors, []);
      console.log(`PASS email registration, recovery and login migration (${width}px)`);
    } finally { await s.context.close(); }
  }
} finally { await browser.close(); }
