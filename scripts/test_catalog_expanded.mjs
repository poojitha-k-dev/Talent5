async function testCatalogAndLyrics() {
  const homeRes = await fetch('http://localhost:3000/api/v1/catalog/home');
  const homeData = await homeRes.json();
  console.log('Home API status:', homeRes.status);
  console.log('  Trending songs count:', homeData.data?.trending?.length);
  console.log('  New releases count:', homeData.data?.newReleases?.length);
  console.log('  Languages count:', homeData.data?.languages?.length);

  const testSongs = [
    'bhavayami-gopalabalam',
    'brahmamokkate',
    'harivarasanam',
    'jagadoddharana',
    'chinnanchiru-kiliye',
    'devachiye-dwari',
    'dukh-bhanjan-tera-naam',
    'vaishnava-janato',
    'ekla-cholo-re',
    'raghupati-raghav-raja-ram'
  ];

  console.log('\nTesting Synced Lyrics Endpoints:');
  for (const slug of testSongs) {
    const res = await fetch(`http://localhost:3000/api/v1/lyrics/${slug}`);
    const data = await res.json();
    const lineCount = data.data?.lines?.length || 0;
    const firstLine = data.data?.lines?.[0]?.text || 'N/A';
    const secondLine = data.data?.lines?.[1]?.text || 'N/A';
    console.log(`[${slug}] -> ${lineCount} cues | L1: "${firstLine}" | L2: "${secondLine}"`);
  }
}

testCatalogAndLyrics().catch(console.error);
