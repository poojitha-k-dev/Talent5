const BASE_URL = 'http://localhost:5000';

async function main() {
  const loginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@talent5.com', password: 'Talent5Admin2026!' }),
  });
  const loginJson = await loginRes.json();
  const token = loginJson.data?.token;

  // Search for songs across genres or keywords
  const searchTerms = ['drill', 'hip-hop', 'pop', 'punjabi', 'rap', 'indie', 'desi', 'bollywood'];
  for (const term of searchTerms) {
    const res = await fetch(`${BASE_URL}/api/v1/catalog/search?q=${term}`);
    const json = await res.json();
    console.log(`Search '${term}': found ${json.data?.songs?.length || 0} songs`);
    if (json.data?.songs?.length > 0) {
      json.data.songs.slice(0, 3).forEach(s => console.log(`   - "${s.title}" (${s.genre}) by ${s.artistName}`));
    }
  }

  // Check lyrics table in admin/lyrics
  const lyricsRes = await fetch(`${BASE_URL}/api/v1/admin/lyrics`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const lyricsJson = await lyricsRes.json();
  console.log('\n--- ADMIN LYRICS SUMMARY ---');
  console.log('Total Lyrics records:', lyricsJson.data?.length);
  const syncedCount = lyricsJson.data?.filter(l => l.isSynced)?.length || 0;
  console.log('Synced records:', syncedCount);
  if (lyricsJson.data?.length > 0) {
    console.log('Sample synced songs:');
    lyricsJson.data.filter(l => l.isSynced).slice(0, 5).forEach(l => {
      console.log(`   - "${l.songTitle}" (isSynced: ${l.isSynced}, status: ${l.syncStatus})`);
    });
  }
}

main().catch(console.error);
