async function search(q) {
  const url = 'https://archive.org/advancedsearch.php?q=' + encodeURIComponent(q) + '&fl[]=identifier,title,downloads&sort[]=downloads+desc&rows=10&output=json';
  const res = await fetch(url);
  const data = await res.json();
  console.log('Results for:', q);
  for (const d of (data.response?.docs || [])) {
    console.log(' ', d.identifier, '|', d.title, '| downloads:', d.downloads);
  }
}

async function main() {
  await search('Kumar Gandharva Kabir mediatype:audio');
  await search('Anup Jalota Bhajan mediatype:audio');
  await search('MS Subbulakshmi Hindi Bhajan mediatype:audio');
}

main().catch(console.error);
