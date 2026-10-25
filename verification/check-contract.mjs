import assert from 'node:assert/strict';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, relative, join } from 'node:path';
import { createHash } from 'node:crypto';

const target = resolve(import.meta.dirname,'..');
const source = resolve(target,'../warranty-system-soopi');
async function files(root) {
  const result=[];
  for(const entry of await readdir(root,{withFileTypes:true})) {
    const path=join(root,entry.name);
    if(entry.isDirectory()) result.push(...await files(path)); else result.push(path);
  }
  return result;
}
let endpoints=0;
const checked=[];
// User requested shared login for employees/customers after the initial migration.
const approvedChanges = new Set(['frontend-react/src/behaviors/login.js', 'frontend-react/src/behaviors/auth.js',
  // Ticket flow fixes (Q1–Q13): trả máy không sửa, điều chỉnh/lập lại báo giá, thu ngân báo giá 0 đ, sửa dòng báo giá.
  'backend-dotnet/src/Soopi.Api/Controllers/TicketControllers.cs', 'backend-dotnet/src/Soopi.Api/Controllers/QuotationInventoryBillingControllers.cs',
  'frontend-react/src/behaviors/api.js', 'frontend-react/src/behaviors/labels.js', 'frontend-react/src/behaviors/cashier.js',
  'frontend-react/src/behaviors/technician.js', 'frontend-react/src/behaviors/tickets.js', 'frontend-react/src/behaviors/dispatch.js']);
const changed=[];
for(const folder of ['backend-dotnet/src/Soopi.Api/Controllers','frontend-react/src','frontend-react/public']) {
  for(const path of await files(join(source,folder))) {
    const local=relative(source,path);
    const original=await readFile(path), copied=await readFile(join(target,local));
    const normalized = local.replaceAll('\\','/');
    const originalHash = createHash('sha256').update(original).digest('hex');
    const currentHash = createHash('sha256').update(copied).digest('hex');
    if (approvedChanges.has(normalized)) changed.push({ path: normalized, originalHash, currentHash });
    else assert.equal(originalHash,currentHash,`Changed API/UI source: ${local}`);
    if(path.endsWith('.cs')) endpoints += (original.toString().match(/\[Http(?:Get|Post|Put|Patch|Delete)\b/g)||[]).length;
    checked.push(local.replaceAll('\\','/'));
  }
}
const project=await readFile(join(target,'backend-dotnet/src/Soopi.Api/Soopi.Api.csproj'),'utf8');
assert(project.includes('MongoDB.Driver'));
assert(!project.includes('EntityFrameworkCore.SqlServer'));
console.log(`PASS: ${endpoints} API endpoints preserved; ${checked.length - changed.length} files unchanged; ${changed.length} approved shared-login changes`);
await writeFile(join(target,'verification/contract-results.json'),JSON.stringify({endpoints,files:checked.length,unchanged:checked.length-changed.length,changed,checkedAt:new Date().toISOString(),checked},null,2));
