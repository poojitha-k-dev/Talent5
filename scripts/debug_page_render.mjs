async function test() {
  const res = await fetch('http://localhost:3000/music');
  const html = await res.text();
  console.log('Status:', res.status);
  console.log('HTML length:', html.length);
  const regex = /href="([^"]+\.css[^"]*)"/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const cssUrl = match[1].startsWith('http') ? match[1] : 'http://localhost:3000' + match[1];
    const cssRes = await fetch(cssUrl);
    console.log('CSS URL:', cssUrl);
    console.log('  Status:', cssRes.status, 'Type:', cssRes.headers.get('content-type'));
    const cssText = await cssRes.text();
    console.log('  CSS Length:', cssText.length, 'Preview:', cssText.slice(0, 100));
  }

  const jsRegex = /src="([^"]+\.js[^"]*)"/g;
  let jsMatch;
  while ((jsMatch = jsRegex.exec(html)) !== null) {
    const jsUrl = jsMatch[1].startsWith('http') ? jsMatch[1] : 'http://localhost:3000' + jsMatch[1];
    const jsRes = await fetch(jsUrl);
    console.log('JS URL:', jsUrl, 'Status:', jsRes.status);
    break;
  }
}
test().catch(console.error);
