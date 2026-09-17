async function searchMore() {
  const terms = [
    'Jagadodharana',
    'Krishna Nee Begane',
    'Majhe Maher Pandhari',
    'Bhimsen Joshi Abhang',
    'Mitar Pyare Nu',
    'Kandha Sashti Kavasam',
    'Payoji Maine Ram Ratan',
    'Raghupati Raghav Raja Ram',
    'Tu Mera Pita'
  ];

  for (const term of terms) {
    try {
      const q = `${term} AND mediatype:audio`;
      const url = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(q)}&fl[]=identifier,title&rows=4&output=json`;
      const r = await fetch(url);
      const json = await r.json();
      console.log(`\n=== Term: "${term}" (${json.response?.docs?.length || 0}) ===`);
      for (const d of (json.response?.docs || [])) {
        console.log(`  [${d.identifier}] -> ${d.title}`);
      }
    } catch (e) {
      console.error(term, e.message);
    }
  }
}

searchMore();
