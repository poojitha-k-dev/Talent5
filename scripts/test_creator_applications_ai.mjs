
const BASE_URL = 'http://localhost:3000';

async function run() {
  console.log('--- STARTING AI CREATOR AUDITION INSPECTION VERIFICATION ---');

  // 1. Authenticate Admin
  console.log('\n[TEST 1] Authenticating as Admin...');
  const loginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@talent5.com', password: 'Talent5Admin2026!' }),
  });
  const loginJson = await loginRes.json();
  if (!loginJson.success || !loginJson.data?.token) {
    throw new Error(`Admin login failed: ${JSON.stringify(loginJson)}`);
  }
  const token = loginJson.data.token;
  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
  console.log('✓ PASS: Admin authenticated successfully.');

  // 2. Fetch Creator Applications with AI Reports
  console.log('\n[TEST 2] Fetching applications queue with AI Sentinel reports...');
  const appsRes = await fetch(`${BASE_URL}/api/v1/admin/applications`, { headers: authHeaders });
  const appsJson = await appsRes.json();
  if (!appsJson.success || !Array.isArray(appsJson.data) || appsJson.data.length === 0) {
    throw new Error(`Failed to fetch applications: ${JSON.stringify(appsJson)}`);
  }
  console.log(`✓ PASS: Fetched ${appsJson.data.length} creator applications.`);

  // Verify first application structure
  const firstApp = appsJson.data[0];
  console.log(`  Sample App: "${firstApp.stageName}" (${firstApp.category}) - Status: ${firstApp.status}`);
  console.log(`  Created Date: "${firstApp.createdAt}"`);
  console.log(`  User Email: "${firstApp.userEmail}"`);
  console.log(`  AI Safety Score: ${firstApp.aiSafetyScore}/100`);
  console.log(`  AI Recommendation: ${firstApp.aiRecommendation}`);

  if (!firstApp.createdAt || isNaN(new Date(firstApp.createdAt).getTime())) {
    throw new Error('FAIL: createdAt date is invalid or missing!');
  }
  console.log('✓ PASS: Valid date verified (no Invalid Date bug).');

  if (!firstApp.aiModerationReport || !firstApp.aiModerationReport.threatAssessment) {
    throw new Error('FAIL: AI Moderation report is missing!');
  }
  console.log('✓ PASS: AI Moderation Report present with full threat assessment.');

  // 3. Test On-Demand AI Scanning Endpoint
  console.log('\n[TEST 3] Testing On-Demand AI Scan endpoint (POST /api/v1/admin/applications/:id/scan)...');
  const scanRes = await fetch(`${BASE_URL}/api/v1/admin/applications/${firstApp.id}/scan`, {
    method: 'POST',
    headers: authHeaders,
  });
  const scanJson = await scanRes.json();
  if (!scanJson.success || !scanJson.data?.aiModerationReport) {
    throw new Error(`AI Scan failed: ${JSON.stringify(scanJson)}`);
  }
  const report = scanJson.data.aiModerationReport;
  console.log(`✓ PASS: AI Scan succeeded.`);
  console.log(`  - Model Version: ${report.modelVersion}`);
  console.log(`  - Safety Score: ${report.safetyScore}/100`);
  console.log(`  - Threat Verdict: ${report.threatAssessment.verdict}`);
  console.log(`  - Human Vocal Authenticity: ${(report.audioSignalInspection.humanVocalAuthenticity * 100).toFixed(0)}%`);
  console.log(`  - Originality Score: ${(report.copyrightAndPlagiarism.originalityScore * 100).toFixed(0)}%`);
  console.log(`  - Summary: "${report.summaryFindings.substring(0, 90)}..."`);

  // 4. Test Review Action & Provisioning (PATCH /api/v1/admin/applications/:id)
  console.log('\n[TEST 4] Testing Review Action (Under Review)...');
  const reviewRes = await fetch(`${BASE_URL}/api/v1/admin/applications/${firstApp.id}`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({
      action: 'UNDER_REVIEW',
      notes: 'Audition verified by AI Sentinel. Scheduled for secondary A&R listening.',
    }),
  });
  const reviewJson = await reviewRes.json();
  if (!reviewJson.success || reviewJson.data?.status !== 'UNDER_REVIEW') {
    throw new Error(`Review action failed: ${JSON.stringify(reviewJson)}`);
  }
  console.log('✓ PASS: Application marked UNDER_REVIEW with adjudication notes.');

  console.log('\n======================================================');
  console.log('🎉 ALL AI AUDITION INSPECTOR & A&R ENDPOINTS VERIFIED 100%');
  console.log('======================================================');
}

run().catch((err) => {
  console.error('\n❌ ERROR:', err);
  process.exit(1);
});
