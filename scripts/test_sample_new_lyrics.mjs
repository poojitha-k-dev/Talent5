import http from 'http';

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function testAllLanguages() {
  const songsRes = await fetchJson('http://localhost:3000/api/v1/catalog/songs?limit=400');
  const items = songsRes.data?.items || songsRes.items || songsRes.data || [];
  console.log(`Fetched total songs from API: ${items.length}`);

  const byLang = {};
  for (const item of items) {
    const lang = item.languageName || 'Unknown';
    if (!byLang[lang]) byLang[lang] = [];
    byLang[lang].push(item);
  }

  for (const [lang, list] of Object.entries(byLang)) {
    const sample = list[0];
    const lyr = await fetchJson('http://localhost:3000/api/v1/lyrics/' + sample.id);
    const lines = lyr.data?.lines || [];
    const durSec = sample.durationSeconds;
    console.log(`\n--- [${lang.toUpperCase()}] (${list.length} songs sampled) ---`);
    console.log(`Track: "${sample.title}" by ${sample.artistName} (${durSec}s)`);
    console.log(`Lines: ${lines.length} | Contiguous: ${lines[0]?.startTimeMs}ms -> ${lines[lines.length-1]?.endTimeMs}ms (Expected ${durSec * 1000}ms)`);
    console.log(`  Line 1: ${lines[0]?.text}`);
    console.log(`  Line 2: ${lines[1]?.text}`);
    console.log(`  Line 3: ${lines[2]?.text}`);
    console.log(`  Line N: ${lines[lines.length-1]?.text}`);
  }
}

testAllLanguages().catch(console.error);
