async function testApis() {
  const testUrls = [
    'http://localhost:3000/api/v1/lyrics/samaja-vara-gamana',
    'http://localhost:3000/api/v1/lyrics/bhagyada-lakshmi-baramma',
    'http://localhost:3000/api/v1/lyrics/kurai-onrum-illai',
    'http://localhost:3000/api/v1/lyrics/bambookat',
    'http://localhost:3000/api/v1/catalog/home'
  ];

  for (const url of testUrls) {
    try {
      const res = await fetch(url);
      const data = await res.json();
      console.log(`URL: ${url} -> Status: ${res.status}`);
      if (url.includes('lyrics')) {
        console.log(`  Lines count: ${data.lines ? data.lines.length : 'NO LINES'}`);
        if (data.lines && data.lines.length > 0) {
          console.log(`  Line 1: "${data.lines[0].text}" [${data.lines[0].startTimeMs}ms - ${data.lines[0].endTimeMs}ms]`);
          console.log(`  Line 2: "${data.lines[1].text}" [${data.lines[1].startTimeMs}ms - ${data.lines[1].endTimeMs}ms]`);
        }
      } else if (url.includes('home')) {
        console.log(`  Featured count: ${data.data?.featured?.length || 0}`);
        console.log(`  Trending count: ${data.data?.trending?.length || 0}`);
        console.log(`  Categories/Languages: ${Object.keys(data.data || {}).join(', ')}`);
      }
    } catch (e) {
      console.error(`Error fetching ${url}:`, e.message);
    }
  }
}

testApis();
