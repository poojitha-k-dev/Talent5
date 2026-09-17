async function queryCommons() {
  const categories = [
    'Category:Audio_files_of_Carnatic_music',
    'Category:Audio_files_of_Rabindra_Sangeet',
    'Category:Audio_files_of_Hindustani_classical_music'
  ];

  for (const cat of categories) {
    try {
      const url = `https://commons.wikimedia.org/w/api.php?action=query&list=categorymembers&cmtitle=${cat}&cmtype=file&cmlimit=20&format=json`;
      const r = await fetch(url);
      const json = await r.json();
      console.log(`\n=== Category: ${cat} ===`);
      for (const m of (json.query?.categorymembers || [])) {
        console.log(`  File: "${m.title}"`);
      }
    } catch (e) {
      console.error(cat, e.message);
    }
  }
}

queryCommons();
