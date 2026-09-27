import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(fullPath);
    }
  });
  return results;
}

async function auditApiRoutes() {
  const files = walk('apps/web/src');
  const apiCalls = new Set();
  const fetchRegex = /fetch\(["'`](\/api\/v1\/[^"'`?]+)/g;

  for (const f of files) {
    const content = fs.readFileSync(f, 'utf8');
    let match;
    while ((match = fetchRegex.exec(content)) !== null) {
      apiCalls.add(match[1]);
    }
  }

  console.log('=== AUDIT: CLIENT-SIDE API CALLS ===');
  console.log('Found unique client API endpoint prefixes:', Array.from(apiCalls));

  // Check which api route files exist
  const apiDir = 'apps/web/src/app/api/v1';
  const missingApiRoutes = [];

  for (const call of apiCalls) {
    const relative = call.replace('/api/v1/', '');
    const parts = relative.split('/').filter(Boolean);
    let cur = apiDir;
    let exists = true;

    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      const direct = path.join(cur, p);
      if (fs.existsSync(direct)) {
        cur = direct;
      } else {
        const subdirs = fs.existsSync(cur) ? fs.readdirSync(cur, { withFileTypes: true }).filter(d => d.isDirectory()) : [];
        const dynamicDir = subdirs.find(d => d.name.startsWith('[') && d.name.endsWith(']'));
        if (dynamicDir) {
          cur = path.join(cur, dynamicDir.name);
        } else {
          exists = false;
          break;
        }
      }
    }

    if (!exists || (!fs.existsSync(path.join(cur, 'route.ts')) && !fs.existsSync(path.join(cur, 'route.js')))) {
      missingApiRoutes.push(call);
    }
  }

  console.log('Missing / 404 API route handlers:', missingApiRoutes);
}

auditApiRoutes();
