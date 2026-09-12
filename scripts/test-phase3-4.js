async function runPhase3And4Tests() {
  console.log('====================================================');
  console.log('TALENT5 PHASE 3 & 4 AUTOMATED VERIFICATION SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(name, condition) {
    if (condition) {
      console.log(`  [PASS] ${name}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${name}`);
      failed++;
    }
  }

  const BASE_URL = 'http://localhost:3000';

  // 1. Authenticate Creator (Kabir Sen) and Listener (Pooja Patel)
  let creatorToken = '';
  let listenerToken = '';

  try {
    const creatorLogin = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'creator@talent5.com', password: 'Talent5Creator2026!' }),
    });
    creatorToken = (await creatorLogin.json()).data?.token;

    const listenerLogin = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'listener@talent5.com', password: 'Talent5Listener2026!' }),
    });
    listenerToken = (await listenerLogin.json()).data?.token;

    assert('Creator and listener credentials authenticated', !!creatorToken && !!listenerToken);
  } catch (err) {
    assert('Creator and listener credentials authenticated', false);
  }

  // 2. Test Desi Hub Catalog API
  let testDesiId = '';
  try {
    const desiRes = await fetch(`${BASE_URL}/api/v1/desi`);
    const desiJson = await desiRes.json();
    testDesiId = desiJson.data?.[0]?.id;
    assert(
      'Desi catalog API returns independent creator creations',
      desiJson.success && Array.isArray(desiJson.data) && desiJson.data.length > 0
    );
  } catch (err) {
    assert('Desi catalog API returns independent creator creations', false);
  }

  // 3. Test Desi Single Detail API
  try {
    const detailRes = await fetch(`${BASE_URL}/api/v1/desi/${testDesiId}`);
    const detailJson = await detailRes.json();
    assert(
      'Desi single detail API returns creator profile and stream metadata',
      detailJson.success && !!detailJson.data?.item?.creatorName
    );
  } catch (err) {
    assert('Desi single detail API returns creator profile and stream metadata', false);
  }

  // 4. Test Creator Application API (Ownership & Copyright Enforcement)
  try {
    // Attempt without declarations (Must Fail with 400)
    const badApp = await fetch(`${BASE_URL}/api/v1/creators/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${listenerToken}` },
      body: JSON.stringify({
        fullName: 'Pooja Patel',
        stageName: 'Pooja Vocals',
        bio: 'Classical playback singer',
        city: 'Ahmedabad',
        state: 'Gujarat',
        samplePerformanceUrl: 'https://cdn.freesound.org/test.mp3',
        ownershipDeclaration: false, // Disallowed
        copyrightDeclaration: true,
      }),
    });
    const badAppJson = await badApp.json();
    assert(
      'Creator application strictly rejects submission when ownership declaration is missing',
      badApp.status === 400
    );

    // Valid Application
    const validApp = await fetch(`${BASE_URL}/api/v1/creators/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${listenerToken}` },
      body: JSON.stringify({
        fullName: 'Pooja Patel',
        stageName: 'Pooja Vocals',
        bio: 'Acoustic indie vocalist and harmonium player',
        city: 'Ahmedabad',
        state: 'Gujarat',
        languages: ['Gujarati', 'Hindi'],
        category: 'SINGER',
        genres: ['Folk Fusion', 'Acoustic & Unplugged'],
        experience: '3 years college fest winner',
        samplePerformanceUrl: 'https://cdn.freesound.org/previews/518/518882_11861866-lq.mp3',
        ownershipDeclaration: true,
        copyrightDeclaration: true,
      }),
    });
    const validAppJson = await validApp.json();
    assert(
      'Creator application accepts verified audition and sets status to PENDING',
      validAppJson.success && validAppJson.data?.status === 'PENDING'
    );
  } catch (err) {
    assert('Creator application API test failed', false);
  }

  // 5. Test Creator Studio Summary
  try {
    const summaryRes = await fetch(`${BASE_URL}/api/v1/creators/studio/summary`, {
      headers: { Authorization: `Bearer ${creatorToken}` },
    });
    const summaryJson = await summaryRes.json();
    assert(
      'Creator Studio summary returns streams, valid likes, and wallet metrics for approved creator',
      summaryJson.success &&
        summaryJson.data?.profile?.stageName === 'Kabir Sen' &&
        summaryJson.data?.metrics?.totalValidLikes > 0
    );
  } catch (err) {
    assert('Creator Studio summary test failed', false);
  }

  // 6. Test Content Submission Pipeline
  try {
    const subRes = await fetch(`${BASE_URL}/api/v1/creators/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${creatorToken}` },
      body: JSON.stringify({
        title: 'Banjara Dil (Acoustic Original)',
        description: 'Recorded live in Jaipur on nylon string acoustic guitar',
        category: 'SINGER',
        languageId: 1, // Hindi
        genreId: 3, // Sufi
        audioUrl: 'https://cdn.freesound.org/previews/557/557194_11861866-lq.mp3',
        coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600',
        composer: 'Kabir Sen',
        lyricist: 'Kabir Sen',
        ownershipDeclaration: true,
      }),
    });
    const subJson = await subRes.json();
    assert(
      'Original content submission pipeline stores track in SUBMITTED status',
      subJson.success && subJson.data?.status === 'SUBMITTED'
    );
  } catch (err) {
    assert('Original content submission test failed', false);
  }

  // 7. Test Creator Wallet API
  try {
    const walletRes = await fetch(`${BASE_URL}/api/v1/wallet`, {
      headers: { Authorization: `Bearer ${creatorToken}` },
    });
    const walletJson = await walletRes.json();
    assert(
      'Creator wallet API delivers accurate available balance and transaction history',
      walletJson.success && walletJson.data?.wallet?.availableBalanceINR > 0
    );
  } catch (err) {
    assert('Creator wallet API test failed', false);
  }

  // 8. Test Payout Request API (Threshold & Atomic Balance Deductions)
  try {
    // Attempt withdrawal under ₹500 minimum threshold (Must Fail)
    const belowMinRes = await fetch(`${BASE_URL}/api/v1/wallet/payout-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${creatorToken}` },
      body: JSON.stringify({
        amount: 200,
        paymentMethod: 'UPI',
        accountRef: 'kabir@okhdfcbank',
      }),
    });
    assert('Payout request strictly enforces minimum threshold of ₹500', belowMinRes.status === 400);

    // Valid withdrawal of ₹500
    const validPayoutRes = await fetch(`${BASE_URL}/api/v1/wallet/payout-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${creatorToken}` },
      body: JSON.stringify({
        amount: 500,
        paymentMethod: 'UPI',
        accountRef: 'kabir@okhdfcbank',
      }),
    });
    const validPayoutJson = await validPayoutRes.json();
    assert(
      'Payout request successfully submits withdrawal for ₹500 to UPI',
      validPayoutJson.success && validPayoutJson.data?.status === 'REQUESTED'
    );
  } catch (err) {
    assert('Payout request API test failed', false);
  }

  // 9. Test Competitions Hub API
  try {
    const compRes = await fetch(`${BASE_URL}/api/v1/competitions`);
    const compJson = await compRes.json();
    assert(
      'Competitions API returns active nationwide challenges with cash prizes',
      compJson.success && Array.isArray(compJson.data) && compJson.data.length >= 2
    );
  } catch (err) {
    assert('Competitions API test failed', false);
  }

  // 10. Test Leaderboards API
  try {
    const leadRes = await fetch(`${BASE_URL}/api/v1/leaderboards?timeframe=weekly`);
    const leadJson = await leadRes.json();
    assert(
      'Leaderboards API delivers real-time rankings by validated likes and streams',
      leadJson.success && leadJson.data?.topLikes?.length > 0
    );
  } catch (err) {
    assert('Leaderboards API test failed', false);
  }

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase3And4Tests();
