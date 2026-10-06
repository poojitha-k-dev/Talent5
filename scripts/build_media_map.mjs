import fs from 'fs';
import path from 'path';

const map = {};

const scriptsDir = path.resolve('scripts');
const files = fs.readdirSync(scriptsDir);

for (const file of files) {
  if (!file.endsWith('.mjs') && !file.endsWith('.js') && !file.endsWith('.json')) continue;
  try {
    const content = fs.readFileSync(path.join(scriptsDir, file), 'utf8');

    // Case 1: key then url
    const regex1 = /key:\s*['"]([^'"]+)['"][\s\S]*?url:\s*['"](https:\/\/[^'"]+)['"]/g;
    let m;
    while ((m = regex1.exec(content)) !== null) {
      const key = m[1].trim();
      const url = m[2].trim();
      if (key && url && !map[key]) {
        map[key] = url;
      }
    }

    // Case 2: url then key
    const regex2 = /url:\s*['"](https:\/\/[^'"]+)['"][\s\S]*?key:\s*['"]([^'"]+)['"]/g;
    while ((m = regex2.exec(content)) !== null) {
      const url = m[1].trim();
      const key = m[2].trim();
      if (key && url && !map[key]) {
        map[key] = url;
      }
    }

    // Case 3: file and ARCHIVE_BASE in seed_34_new_vocal_gems.mjs
    if (content.includes('ARCHIVE_BASE')) {
      const regex3 = /key:\s*['"]([^'"]+)['"][\s\S]*?file:\s*['"]([^'"]+)['"]/g;
      const baseMatch = content.match(/ARCHIVE_BASE\s*=\s*['"]([^'"]+)['"]/);
      if (baseMatch) {
        const base = baseMatch[1];
        while ((m = regex3.exec(content)) !== null) {
          const key = m[1].trim();
          const filePart = m[2].trim();
          if (key && !map[key]) {
            map[key] = base + encodeURIComponent(filePart);
          }
        }
      }
    }
  } catch (err) {
    console.error('Error parsing', file, err);
  }
}

console.log('Total mapped keys found:', Object.keys(map).length);

const outDir = path.resolve('apps/web/src/lib');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(
  path.join(outDir, 'media-catalog-map.json'),
  JSON.stringify(map, null, 2)
);
console.log('Saved mapping to apps/web/src/lib/media-catalog-map.json');
