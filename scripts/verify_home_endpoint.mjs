async function main() {
  const res = await fetch('http://localhost:5000/api/v1/catalog/home');
  const json = await res.json();
  console.log('--- VERIFIED HOME FEED ---');
  json.data.trending.slice(0, 5).forEach((s, i) => {
    console.log(`${i + 1}. [${s.genreName}] "${s.title}" by ${s.artistName}`);
  });
}
main();
