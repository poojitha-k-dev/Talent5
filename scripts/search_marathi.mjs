async function searchMarathi() {
  const terms = ['Abhangwani', 'Sant Tukaram', 'Sant Dnyaneshwar', 'Panduranga', 'Vitthal Geete'];
  for (const t of terms) {
    const url = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(t + ' AND mediatype:audio')}&fl[]=identifier,title&rows=3&output=json`;
    const r = await fetch(url);
    const d = await r.json();
    console.log(`=== ${t} ===`);
    (d.response?.docs || []).forEach(x => console.log(' ', x.identifier, x.title));
  }
}
searchMarathi();
