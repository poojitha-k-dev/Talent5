async function findCleanMasters() {
  const queries = [
    'MSSubbalakshmi Annamacharya',
    'Bhai Nirmal Singh Ji Khalsa Gurbani',
    'Bhai Harjinder Singh Ji Shabad',
    'Rabindra Sangeet Vocal Suchitra Mitra',
    'Purandara Dasa Kritis Vocal'
  ];

  for (const q of queries) {
    const url = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(q + ' AND mediatype:audio')}&fl[]=identifier,title&rows=5&output=json`;
    const r = await fetch(url);
    const d = await r.json();
    console.log(`\n=== Query: "${q}" ===`);
    for (const item of (d.response?.docs || [])) {
      try {
        const mr = await fetch(`https://archive.org/metadata/${item.identifier}`);
        const mjson = await mr.json();
        const mp3s = (mjson.files || []).filter(f => f.name && f.name.endsWith('.mp3'));
        console.log(`[${item.identifier}] "${item.title}" (${mp3s.length} mp3s)`);
        mp3s.slice(0, 5).forEach(m => console.log(`   - "${m.name}" (${m.length}s, ${(m.size/1024/1024).toFixed(1)}MB)`));
      } catch (e) {}
    }
  }
}

findCleanMasters();
