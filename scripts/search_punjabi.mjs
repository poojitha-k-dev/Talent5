async function searchPunjabi() {
  const terms = ['Bhai Harjinder Singh Shabad', 'Dukh Bhanjan Tera Naam', 'Satnam Waheguru Simran', 'Heer Waris Shah'];
  for (const t of terms) {
    const url = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(t + ' AND mediatype:audio')}&fl[]=identifier,title&rows=3&output=json`;
    const r = await fetch(url);
    const d = await r.json();
    console.log(`=== ${t} ===`);
    (d.response?.docs || []).forEach(x => console.log(' ', x.identifier, x.title));
  }
}
searchPunjabi();
