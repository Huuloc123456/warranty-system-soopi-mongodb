import assert from 'node:assert/strict';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, join } from 'node:path';

// Hợp đồng API với bản gốc ../warranty-system-soopi: mọi route (method + đường dẫn) của bản gốc phải còn ở đây.
// So route chứ không so từng file: hai project đã phát triển riêng (đăng nhập chung, xác minh email, sửa luồng phiếu ở đây;
// tính năng mới ở bản gốc), nhưng client web chỉ phụ thuộc route.
const target = resolve(import.meta.dirname, '..');
const source = resolve(target, '../warranty-system-soopi');
const controllers = 'backend-dotnet/src/Soopi.Api/Controllers';

// Tính năng chat theo phiếu của bản gốc không đưa sang bản MongoDB: bỏ khỏi đối chiếu và không được tồn tại ở đây.
const excluded = ['backend-dotnet/src/Soopi.Api/Controllers/ChatController.cs', 'frontend-react/src/ChatBubble.tsx'];
for (const path of excluded) assert(!existsSync(join(target, path)), `Chat must not be ported: ${path}`);

// Không có app di động: bỏ API riêng của app (đăng nhập bằng refresh token trong body, đăng ký thiết bị push). OTP, đăng ký và
// quên mật khẩu của web nằm ở /api/v1/auth/{otp,register,password-reset}.
const removedRoutes = [/^\w+ \/api\/v1\/auth\/mobile\//, /^\w+ \/api\/v1\/notifications\/devices\//];
const removed = (r) => removedRoutes.some((pattern) => pattern.test(r));

async function files(root) {
  const result = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) result.push(...await files(path));
    else if (path.endsWith('.cs')) result.push(path);
  }
  return result;
}

/** "GET /api/v1/tickets/{}" — tên tham số và ràng buộc kiểu không thuộc hợp đồng. */
function route(method, prefix, template) {
  const path = template?.startsWith('/') || template?.startsWith('~/')
    ? template.replace(/^~?\//, '')
    : [prefix, template].filter(Boolean).join('/');
  return `${method.toUpperCase()} /${path.replace(/\{[^}]*\}/g, '{}').toLowerCase()}`;
}

async function routes(root) {
  const result = new Set();
  for (const file of await files(join(root, controllers))) {
    if (excluded.some((path) => join(root, path) === file)) continue;
    let pending = null;
    let prefix = '';
    for (const line of (await readFile(file, 'utf8')).split('\n')) {
      const routeAttribute = line.match(/\[Route\("([^"]*)"\)\]/);
      if (routeAttribute) pending = routeAttribute[1];
      if (/\bclass\s+\w+/.test(line)) {
        prefix = pending ?? '';
        pending = null;
      }
      for (const http of line.matchAll(/\[Http(Get|Post|Put|Patch|Delete)(?:\("([^"]*)"[^\]]*\))?\]/g)) result.add(route(http[1], prefix, http[2]));
    }
  }
  return result;
}

const original = new Set([...await routes(source)].filter((r) => !removed(r)));
const current = await routes(target);
assert.deepEqual([...current].filter(removed), [], 'Mobile-app routes must not exist here');
assert(original.size > 0, `No routes found in ${source}`);
const missing = [...original].filter((r) => !current.has(r)).sort();
const added = [...current].filter((r) => !original.has(r)).sort();
assert.deepEqual(missing, [], `Routes of the original removed here:\n${missing.join('\n')}`);

const project = await readFile(join(target, 'backend-dotnet/src/Soopi.Api/Soopi.Api.csproj'), 'utf8');
assert(project.includes('MongoDB.Driver'));
assert(!project.includes('EntityFrameworkCore.SqlServer'));
console.log(`PASS: ${original.size} original API routes preserved (chat and mobile-app routes excluded); ${added.length} added here`);
await writeFile(join(target, 'verification/contract-results.json'), JSON.stringify({
  originalRoutes: original.size, currentRoutes: current.size, excluded, removedRoutes: removedRoutes.map(String), added,
  checkedAt: new Date().toISOString(),
}, null, 2));
