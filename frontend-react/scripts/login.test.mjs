import test from 'node:test';
import assert from 'node:assert/strict';
import initializeLogin from '../src/behaviors/login.js';

function setup(user, next, resumed = false) {
  const element = () => ({ hidden: true, textContent: '', listeners: {}, addEventListener(event, handler) { this.listeners[event] = handler; }, focus() {}, querySelector() { return {}; } });
  const form = element();
  form.hidden = false;
  const error = element();
  const change = element();
  const choices = element();
  choices.children = [];
  choices.querySelectorAll = () => [];
  choices.appendChild = node => choices.children.push(node);
  const elements = new Map([
    ['[data-login-form]', form], ['[data-login-error]', error],
    ['[data-change-password-form]', change], ['[data-change-password-error]', element()],
    ['[data-role-choice-list]', choices], ['login-username', { value: user.username }],
    ['login-password', { value: '1234' }], ['login-remember', { checked: false }], ['current-password', element()],
  ]);
  globalThis.document = { querySelector: key => elements.get(key), getElementById: key => elements.get(key), createElement: element };
  globalThis.location = { origin: 'http://localhost:8081', search: '?next=' + encodeURIComponent(next), href: '/login' };
  const storage = new Map();
  globalThis.sessionStorage = { setItem: (key, value) => storage.set(key, value) };
  let token = resumed ? 'existing-token' : null;
  globalThis.window = { location, LML_UI: { busy: (_, action) => action() }, LML_API: {
    tokens: { get: () => token, set: value => { token = value; }, clear: () => { token = null; } },
    auth: { login: async () => ({ accessToken: 'new-token', user }), me: async () => user },
  } };
  initializeLogin();
  return { form, error, change, choices, storage };
}

const employeeRoles = [
  ['ADMIN', '/admin'], ['RECEPTIONIST', '/receptionist'], ['DISPATCHER', '/dispatch'],
  ['TECHNICIAN', '/technician'], ['WAREHOUSE_KEEPER', '/warehouse'], ['CASHIER', '/cashier'],
];
for (const [code, landing] of employeeRoles) {
  test(`${code} can sign in from a customer link and reaches their workspace`, async () => {
    const { form, error, storage } = setup({ username: 'demo', roles: [{ code, landing }] }, '/account#lich-su');
    await form.listeners.submit({ preventDefault() {} });
    assert.equal(location.href, landing);
    assert.equal(error.hidden, true);
    assert.equal(storage.get('lml_active_role'), code);
  });
}

test('an existing employee session resumes at its workspace from the shared login', async () => {
  setup({ username: 'receptionist', roles: [{ code: 'RECEPTIONIST', landing: '/receptionist' }] }, '/account', true);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(location.href, '/receptionist');
});

test('customer login preserves an internal account destination and hash', async () => {
  const { form } = setup({ username: '0900000001', roles: [{ code: 'CUSTOMER', landing: '/account' }] }, '/account#lich-su');
  await form.listeners.submit({ preventDefault() {} });
  assert.equal(location.href, '/account#lich-su');
});

test('shared login keeps external redirects blocked', async () => {
  const { form } = setup({ username: 'admin', roles: [{ code: 'ADMIN', landing: '/admin' }] }, 'https://evil.example/account');
  await form.listeners.submit({ preventDefault() {} });
  assert.equal(location.href, '/admin');
});

test('employee must change a temporary password before entering the workspace', async () => {
  const { form, change } = setup({ username: 'demo', mustChangePassword: true, roles: [{ code: 'RECEPTIONIST', landing: '/receptionist' }] }, '/account');
  await form.listeners.submit({ preventDefault() {} });
  assert.equal(change.hidden, false);
  assert.equal(location.href, '/login');
});

test('multiple roles remain selectable when login came from a customer link', async () => {
  const { form, choices } = setup({ username: 'demo', roles: [{ code: 'ADMIN', label: 'Admin', landing: '/admin' }, { code: 'RECEPTIONIST', label: 'Lễ tân', landing: '/receptionist' }] }, '/account');
  await form.listeners.submit({ preventDefault() {} });
  assert.equal(choices.hidden, false);
  choices.children[1].listeners.click();
  assert.equal(location.href, '/receptionist');
});
