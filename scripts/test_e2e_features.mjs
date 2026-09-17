const BASE_URL = 'http://127.0.0.1:3000';

const results = [];

async function assert(suite, name, fn) {
  try {
    const res = await fn();
    if (res === true) {
      results.push({ suite, name, status: 'PASS' });
      console.log(`  ✅ [PASS] ${name}`);
    } else {
      results.push({ suite, name, status: 'FAIL', details: String(res) });
      console.error(`  ❌ [FAIL] ${name} — ${res}`);
    }
  } catch (err) {
    results.push({ suite, name, status: 'FAIL', details: err.message });
    console.error(`  ❌ [FAIL] ${name} — Exception: ${err.message}`);
  }
}

async function runAllTests() {
  console.log('\n==================================================');
  console.log('  TALENT5 COMPREHENSIVE E2E FUNCTIONALITY TEST SUITE');
  console.log('==================================================\n');

  let adminToken = '';
  let creatorToken = '';
  let listenerToken = '';
  let songIdWithLyrics = '';

  // 1. AUTHENTICATION & SECURITY
  console.log('1. Testing Authentication & Session Management...');
  await assert('Auth', 'Admin User Login & JWT Generation', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@talent5.com', password: 'Talent5Admin2026!' }),
    });
    const json = await res.json();
    if (res.status === 200 && json.success && json.data.token) {
      adminToken = json.data.token;
      return true;
    }
    return `Status ${res.status}: ${JSON.stringify(json)}`;
  });

  await assert('Auth', 'Creator User Login & Role Validation', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'creator@talent5.com', password: 'Talent5Creator2026!' }),
    });
    const json = await res.json();
    if (res.status === 200 && json.success && json.data.token) {
      creatorToken = json.data.token;
      return json.data.user.roles.includes('CREATOR') ? true : 'Missing CREATOR role';
    }
    return `Status ${res.status}: ${JSON.stringify(json)}`;
  });

  await assert('Auth', 'Listener User Login', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'listener@talent5.com', password: 'Talent5Listener2026!' }),
    });
    const json = await res.json();
    if (res.status === 200 && json.success && json.data.token) {
      listenerToken = json.data.token;
      return true;
    }
    return `Status ${res.status}: ${JSON.stringify(json)}`;
  });

  await assert('Auth', 'Reject Unauthorized / Wrong Password with 401', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@talent5.com', password: 'WrongPassword999!' }),
    });
    return res.status === 401;
  });

  // 2. CATALOG & MUSIC STREAMING API
  console.log('\n2. Testing Catalog, Streaming & Rights API...');
  await assert('Catalog', 'Home Catalog (Trending, Releases, Languages, Genres)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/catalog/home`);
    const json = await res.json();
    if (res.status === 200 && json.success && json.data.trending.length > 0) {
      songIdWithLyrics = json.data.trending[0].id;
      return true;
    }
    return false;
  });

  await assert('Catalog', '13-Language Catalog Filtering Support', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/catalog/songs?language=hi`);
    const json = await res.json();
    return res.status === 200 && json.success && Array.isArray(json.data);
  });

  await assert('Catalog', 'Synchronized Lyrics Endpoint & Timestamped Cues', async () => {
    if (!songIdWithLyrics) return 'No songId available';
    const res = await fetch(`${BASE_URL}/api/v1/lyrics/${songIdWithLyrics}`);
    const json = await res.json();
    return res.status === 200 && json.success && Array.isArray(json.data.lines) && json.data.lines.length > 0;
  });

  // 3. DESI ORIGINALS HUB & ENGAGEMENT ECONOMICS
  console.log('\n3. Testing Desi Hub & Creator Reward Economics...');
  await assert('Desi', 'Fetch Grassroots Desi Feed', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/desi`);
    const json = await res.json();
    return res.status === 200 && json.success && Array.isArray(json.data) && json.data.length > 0;
  });

  await assert('Economics', 'Record Validated Like (₹0.10 Creator Reward Engine)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/social/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${listenerToken}`,
      },
      body: JSON.stringify({
        targetType: 'SONG',
        targetId: songIdWithLyrics,
        deviceFingerprint: 'test-device-uuid-1234',
      }),
    });
    const json = await res.json();
    return res.status === 200 && json.success && (json.action === 'LIKED' || json.action === 'UNLIKED');
  });

  // 4. COMPETITIONS & TOURNAMENTS
  console.log('\n4. Testing Tournaments & Competitions...');
  await assert('Competitions', 'Fetch Live Tournament Challenges & Prize Pools', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/competitions`);
    const json = await res.json();
    return res.status === 200 && json.success && Array.isArray(json.data) && json.data.length > 0;
  });

  // 5. ADMIN COMMAND CENTER & GOVERNANCE
  console.log('\n5. Testing Admin Cockpit & Operational Radars...');
  await assert('Admin', 'Admin Metrics Overview Dashboard', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const json = await res.json();
    return res.status === 200 && json.success && typeof json.data.totalUsers === 'number';
  });

  await assert('Admin', 'A&R Content Review Queue', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/admin/content-review`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const json = await res.json();
    return res.status === 200 && json.success && Array.isArray(json.data);
  });

  await assert('Admin', 'Anti-Fraud Heuristics & Anomaly Cockpit', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/admin/fraud`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const json = await res.json();
    return res.status === 200 && json.success && Array.isArray(json.data.events);
  });

  await assert('Admin', 'Creator Payout Settlement Queue', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/admin/payouts`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const json = await res.json();
    return res.status === 200 && json.success && Array.isArray(json.data);
  });

  await assert('Admin', 'Rights Provenance & Licensing Radar', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/admin/rights`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const json = await res.json();
    return res.status === 200 && json.success && Array.isArray(json.data);
  });

  // 6. CLIENT PAGES & FOOTER ROUTES STATUS 200
  console.log('\n6. Testing All Core Consumer & Footer Pages Status 200...');
  const pages = [
    { path: '/', name: 'Landing Page' },
    { path: '/home', name: 'Discover Feed' },
    { path: '/music', name: 'Music Catalog' },
    { path: '/desi', name: 'Desi Originals Hub' },
    { path: '/karaoke', name: 'AI Singing Lab' },
    { path: '/competitions', name: 'Competitions Arena' },
    { path: '/leaderboards', name: 'Leaderboard' },
    { path: '/library', name: 'Library' },
    { path: '/login', name: 'Auth Portal' },
    { path: '/about', name: 'About Us & Manifesto Page' },
    { path: '/rights', name: 'Rights & Copyright Policy Page' },
    { path: '/terms', name: 'Terms of Service Page' },
    { path: '/privacy', name: 'Privacy Policy Page' },
  ];

  for (const page of pages) {
    await assert('Pages', `${page.name} (${page.path})`, async () => {
      const res = await fetch(`${BASE_URL}${page.path}`);
      return res.status === 200;
    });
  }

  // Summary
  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;

  console.log('\n==================================================');
  console.log(`  TEST RESULTS SUMMARY: ${passed} PASSED / ${failed} FAILED (${results.length} TOTAL)`);
  console.log('==================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests();
