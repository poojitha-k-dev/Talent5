async function inspectCollections() {
  const ids = [
    'mss-concert',
    'ecsd-3313-2-yjt-269-70',
    'm-s-subbulakshmi-tokyo-1970s',
    'DnyaneshwarHaripatha'
  ];

  for (const id of ids) {
    try {
      const r = await fetch(`https://archive.org/metadata/${id}`);
      const json = await r.json();
      console.log(`\n=== Collection: ${id} ===`);
      const mp3s = (json.files || []).filter(f => f.name && f.name.endsWith('.mp3'));
      console.log(`Found ${mp3s.length} mp3s`);
      for (const m of mp3s.slice(0, 10)) {
        console.log(`  "${m.name}" (${m.length}s, ${(m.size / 1024 / 1024).toFixed(2)} MB)`);
      }
    } catch (e) {
      console.error(id, e.message);
    }
  }
}

inspectCollections();
