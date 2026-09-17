async function inspectWave2() {
  const ids = [
    'BhoShambo',
    'omanathinkal',
    'kandha-sashti-kavacham',
    'BhAvayAmiraghurAmam',
    'jamendo-337588',
    'anondoloke-pragati-bodhisatwa-satarupa-subrata-anikpati'
  ];

  for (const id of ids) {
    try {
      const r = await fetch(`https://archive.org/metadata/${id}`);
      const json = await r.json();
      console.log(`\n=== ID: ${id} ===`);
      console.log(`Server: ${json.server}, Dir: ${json.dir}`);
      const mp3s = (json.files || []).filter(f => f.name.endsWith('.mp3'));
      for (const m of mp3s) {
        console.log(`  File: "${m.name}" | Length: ${m.length}s | Size: ${(m.size / 1024 / 1024).toFixed(2)} MB`);
      }
    } catch (e) {
      console.error(id, e.message);
    }
  }
}

inspectWave2();
