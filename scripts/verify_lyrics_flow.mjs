async function main() {
  const homeRes = await fetch('http://localhost:5000/api/v1/catalog/home');
  const homeJson = await homeRes.json();
  const topSong = homeJson.data.trending[0];
  console.log('Top Spotlight Song:', topSong.title, '| Genre:', topSong.genreName, '| Artist:', topSong.artistName);

  const lyrRes = await fetch(`http://localhost:5000/api/v1/lyrics/${topSong.id}`);
  const lyrJson = await lyrRes.json();
  console.log('Lyrics status:', lyrJson.data?.syncStatus, 'isSynced:', lyrJson.data?.isSynced);
  console.log('Lines count:', lyrJson.data?.lines?.length);
  if (lyrJson.data?.lines?.length > 0) {
    lyrJson.data.lines.forEach((l, i) => {
      console.log(`  Line ${i + 1}: [${l.startTimeMs}ms - ${l.endTimeMs}ms] "${l.text}"`);
    });
  }
}
main().catch(console.error);
