async function searchVocals() {
  const queries = [
    { lang: 'Tamil Vocal', q: 'mediatype:audio AND (\"Alai Payudhe\" OR \"Alaipayuthey\" OR \"Chinnanchiru Kiliye\" OR \"Bharathiyar\") AND (Vocal OR Smt OR Vidwan) AND format:(MP3)' },
    { lang: 'Kannada Vocal', q: 'mediatype:audio AND (\"Bhagyada Lakshmi\" OR \"Jagadodharana\" OR \"Purandara Dasa\") AND (Vocal OR Subbulakshmi OR Balamuralikrishna) AND format:(MP3)' },
    { lang: 'Malayalam Vocal', q: 'mediatype:audio AND (\"Swathi Thirunal\" OR \"Yesudas\" OR \"Malayalam\") AND (Vocal OR Singer) AND format:(MP3)' },
  ];

  for (const item of queries) {
    const searchUrl = 'https://archive.org/advancedsearch.php?q=' + encodeURIComponent(item.q) + '&fl[]=identifier,title,creator&rows=5&output=json';
    try {
      const res = await fetch(searchUrl).then(r => r.json());
      console.log(`=== ${item.lang} ===`);
      for (const d of res.response.docs) {
        console.log(d.identifier, '|', d.title);
        const f = await fetch(`https://archive.org/metadata/${d.identifier}/files`).then(r => r.json());
        const mp3 = (f.result || []).filter(x => x.name && x.name.endsWith('.mp3') && !x.name.includes('_vbr') && x.size > 1000000 && x.size < 20000000);
        for (const m of mp3.slice(0, 2)) {
          console.log('   ->', m.name, '| Size:', m.size);
        }
      }
    } catch (e) {
      console.log(item.lang, 'error:', e.message);
    }
  }
}
searchVocals();
