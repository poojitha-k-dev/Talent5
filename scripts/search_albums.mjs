async function searchIndividualTracks() {
  const terms = [
    'Annamayya',
    'Purandaradasa',
    'Gurbani Kirtan',
    'Rabindra Sangeet',
    'Meera Bhajan',
    'Kabir Bhajan',
    'Swathi Thirunal'
  ];

  for (const t of terms) {
    const url = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(t + ' AND mediatype:audio')}&fl[]=identifier,title,item_size&rows=5&output=json`;
    const r = await fetch(url);
    const d = await r.json();
    console.log(`\n=== Term: "${t}" ===`);
    for (const item of (d.response?.docs || [])) {
      // Check metadata for files
      try {
        const mr = await fetch(`https://archive.org/metadata/${item.identifier}`);
        const mjson = await mr.json();
        const mp3s = (mjson.files || []).filter(f => f.name && f.name.endsWith('.mp3'));
        if (mp3s.length > 2 && mp3s.length < 50) {
          console.log(`[ALBUM] ${item.identifier} -> "${item.title}" (${mp3s.length} tracks)`);
          mp3s.slice(0, 4).forEach(m => console.log(`   - "${m.name}" (${m.length}s, ${(m.size/1024/1024).toFixed(1)}MB)`));
        }
      } catch (err) {}
    }
  }
}

searchIndividualTracks();
