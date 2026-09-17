async function findWave2Tracks() {
  const queries = [
    { label: 'Endaro Mahanubhavulu', q: 'Endaro Mahanubhavulu AND mediatype:audio' },
    { label: 'Vathapi Ganapathim', q: 'Vathapi Ganapathim AND mediatype:audio' },
    { label: 'Bho Shambo', q: 'Bho Shambo AND mediatype:audio' },
    { label: 'Krishna Nee Begane Baaro', q: 'Krishna Nee Begane Baaro AND mediatype:audio' },
    { label: 'Payoji Maine Ram Ratan', q: 'Payoji Maine AND mediatype:audio' },
    { label: 'Anandaloke Mangalaloke', q: 'Anandaloke AND mediatype:audio' },
    { label: 'Omanathinkal Kidavo', q: 'Omanathinkal AND mediatype:audio' },
    { label: 'Kandha Sashti Kavasam', q: 'kandha-sashti-kavacham' },
    { label: 'Thumak Chalat', q: 'Thumak Chalat AND mediatype:audio' },
    { label: 'Chadariya Jhini', q: 'Chadariya Jhini AND mediatype:audio' },
    { label: 'Swathi Thirunal', q: 'Bhavayami Raghuramam AND mediatype:audio' }
  ];

  for (const item of queries) {
    try {
      const url = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(item.q)}&fl[]=identifier,title&rows=3&output=json`;
      const r = await fetch(url);
      const json = await r.json();
      console.log(`\n=== [${item.label}] (Found: ${json.response?.docs?.length || 0}) ===`);
      for (const d of (json.response?.docs || [])) {
        console.log(`  id: "${d.identifier}" | title: "${d.title}"`);
      }
    } catch (e) {
      console.error(item.label, e.message);
    }
  }
}

findWave2Tracks();
