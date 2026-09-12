const jwt = require('jsonwebtoken');

const BASE_URL = 'http://localhost:3000/api/v1';
const JWT_SECRET = process.env.JWT_SECRET || 'talent5_super_secure_jwt_secret_key_2026_desi_music_platform_ultra';

function generateToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      username: user.username,
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

const adminUser = {
  id: 'a0000000-0000-0000-0000-000000000001',
  email: 'admin@talent5.com',
  roles: ['SUPER_ADMIN', 'ADMIN'],
  username: 'admin',
};

const listenerUser = {
  id: 'a0000000-0000-0000-0000-000000000003',
  email: 'listener@talent5.com',
  roles: ['USER'],
  username: 'pooja',
};

const adminToken = generateToken(adminUser);
const listenerToken = generateToken(listenerUser);

async function runTests() {
  console.log('=== TALENT5 PHASE 5 & 6 ADMIN COMMAND CENTER TESTS ===\n');
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ FAIL: ${name}`);
      console.error(`   ${err.message}`);
      failed++;
    }
  }

  // 1. RBAC Guard: Listener denied access
  await test('RBAC Guard blocks unauthorized listener from /admin/stats (403)', async () => {
    const res = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${listenerToken}` },
    });
    if (res.status !== 403) throw new Error(`Expected 403 Forbidden, got ${res.status}`);
    const json = await res.json();
    if (json.success !== false) throw new Error(`Expected success: false`);
  });

  // 2. Admin Stats: Admin access allowed
  await test('Admin accesses /admin/stats and retrieves platform KPIs', async () => {
    const res = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (res.status !== 200) throw new Error(`Expected 200 OK, got ${res.status}`);
    const json = await res.json();
    if (!json.success || !json.data.totalUsers || json.data.pendingApplications === undefined) {
      throw new Error(`Invalid stats response: ${JSON.stringify(json)}`);
    }
    console.log(`   Pending Auditions: ${json.data.pendingApplications}, Liability: ₹${json.data.pendingPayoutLiabilityINR}`);
  });

  // 3. Creator Applications List
  let pendingAppId = null;
  await test('Admin lists creator applications at /admin/applications', async () => {
    const res = await fetch(`${BASE_URL}/admin/applications`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (res.status !== 200) throw new Error(`Expected 200 OK, got ${res.status}`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data) || json.data.length === 0) {
      throw new Error(`Expected applications array, got: ${JSON.stringify(json)}`);
    }
    const pending = json.data.find(a => a.status === 'PENDING');
    if (pending) pendingAppId = pending.id;
    console.log(`   Retrieved ${json.data.length} applications (first: "${json.data[0].stageName}")`);
  });

  // 4. Creator Application Review Action (Approve)
  if (pendingAppId) {
    await test(`Admin approves audition application (${pendingAppId})`, async () => {
      const res = await fetch(`${BASE_URL}/admin/applications/${pendingAppId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          action: 'APPROVE',
          notes: 'Audition verified by Talent5 Head of A&R. Exceptional vocal technique.',
        }),
      });
      if (res.status !== 200) throw new Error(`Expected 200 OK, got ${res.status}`);
      const json = await res.json();
      if (!json.success || json.data.status !== 'APPROVED') {
        throw new Error(`Failed to approve application: ${JSON.stringify(json)}`);
      }
    });
  }

  // 5. Content Review List
  let submissionId = null;
  await test('Admin lists content submissions at /admin/content-review', async () => {
    const res = await fetch(`${BASE_URL}/admin/content-review`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (res.status !== 200) throw new Error(`Expected 200 OK, got ${res.status}`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data) || json.data.length === 0) {
      throw new Error(`Expected content submissions array, got: ${JSON.stringify(json)}`);
    }
    const submitted = json.data.find(s => s.status === 'SUBMITTED');
    if (submitted) submissionId = submitted.id;
    console.log(`   Retrieved ${json.data.length} submissions (first: "${json.data[0].title}")`);
  });

  // 6. Content Review Action (Approve & Publish with Rights)
  if (submissionId) {
    await test(`Admin approves content submission (${submissionId}) and issues rights`, async () => {
      const res = await fetch(`${BASE_URL}/admin/content-review/${submissionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          action: 'APPROVE',
          notes: 'Master audio and copyright verified. Published to Desi Originals Hub.',
        }),
      });
      if (res.status !== 200) throw new Error(`Expected 200 OK, got ${res.status}`);
      const json = await res.json();
      if (!json.success || json.data.status !== 'APPROVED') {
        throw new Error(`Failed to approve submission: ${JSON.stringify(json)}`);
      }
    });
  }

  // 7. Rights & Licensing Management
  let rightsId = null;
  await test('Admin lists rights records at /admin/rights with ownership types', async () => {
    const res = await fetch(`${BASE_URL}/admin/rights`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (res.status !== 200) throw new Error(`Expected 200 OK, got ${res.status}`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data) || json.data.length === 0) {
      throw new Error(`Expected rights records array, got: ${JSON.stringify(json)}`);
    }
    rightsId = json.data[0].id;
    console.log(`   Retrieved ${json.data.length} rights records (first status: ${json.data[0].status})`);
  });

  // 8. Rights Restriction / Takedown Action
  if (rightsId) {
    await test(`Admin modifies rights record status (${rightsId}) to RESTRICTED`, async () => {
      const res = await fetch(`${BASE_URL}/admin/rights/${rightsId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          action: 'RESTRICT',
          notes: 'Restricted pending territory re-negotiation.',
        }),
      });
      if (res.status !== 200) throw new Error(`Expected 200 OK, got ${res.status}`);
      const json = await res.json();
      if (!json.success || json.data.status !== 'RESTRICTED') {
        throw new Error(`Failed to update rights: ${JSON.stringify(json)}`);
      }
    });
  }

  // 9. Fraud Cockpit & Suspicious Likes
  await test('Admin accesses Anti-Fraud Cockpit at /admin/fraud', async () => {
    const res = await fetch(`${BASE_URL}/admin/fraud`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (res.status !== 200) throw new Error(`Expected 200 OK, got ${res.status}`);
    const json = await res.json();
    if (!json.success || !json.data.events || !json.data.riskDistribution) {
      throw new Error(`Invalid fraud response: ${JSON.stringify(json)}`);
    }
    console.log(`   High Risk Events: ${json.data.riskDistribution.HIGH}, Suspicious Likes: ${json.data.suspiciousLikes.length}`);
  });

  // 10. Fraud Action: Void Suspicious Likes
  await test('Admin voids suspicious engagement likes via /admin/fraud/action', async () => {
    const res = await fetch(`${BASE_URL}/admin/fraud/action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        action: 'VOID_SUSPICIOUS_LIKES',
        notes: 'Mass bot velocity mitigation triggered by Admin',
      }),
    });
    if (res.status !== 200) throw new Error(`Expected 200 OK, got ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error(`Failed void action: ${JSON.stringify(json)}`);
  });

  // 11. Payout Settlement
  let payoutId = null;
  await test('Admin lists pending payout requests at /admin/payouts', async () => {
    const res = await fetch(`${BASE_URL}/admin/payouts`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (res.status !== 200) throw new Error(`Expected 200 OK, got ${res.status}`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data) || json.data.length === 0) {
      throw new Error(`Expected payouts array, got: ${JSON.stringify(json)}`);
    }
    const requested = json.data.find(p => p.status === 'REQUESTED' || p.status === 'UNDER_REVIEW');
    if (requested) payoutId = requested.id;
    console.log(`   Retrieved ${json.data.length} payout requests (first amount: ₹${json.data[0].amountINR})`);
  });

  // 12. Payout Settlement Action (Approve & Settle)
  if (payoutId) {
    await test(`Admin settles payout request (${payoutId}) with UTR Ref`, async () => {
      const res = await fetch(`${BASE_URL}/admin/payouts/${payoutId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          action: 'APPROVE_AND_PAY',
          transactionRef: `UPI/TALENT5/${Date.now()}`,
          notes: 'Settlement disbursed via ICICI Bank Corporate Gateway.',
        }),
      });
      if (res.status !== 200) throw new Error(`Expected 200 OK, got ${res.status}`);
      const json = await res.json();
      if (!json.success || json.data.status !== 'PAID') {
        throw new Error(`Failed to settle payout: ${JSON.stringify(json)}`);
      }
    });
  }

  // 13. Audit Logs Trail
  await test('Admin views immutable audit ledger at /admin/audit-logs', async () => {
    const res = await fetch(`${BASE_URL}/admin/audit-logs`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (res.status !== 200) throw new Error(`Expected 200 OK, got ${res.status}`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data) || json.data.length === 0) {
      throw new Error(`Expected audit logs array, got: ${JSON.stringify(json)}`);
    }
    console.log(`   Audit log entries captured: ${json.data.length} (latest: "${json.data[0].action}")`);
  });

  // 14. Settings & Dynamic Reward Rules
  await test('Admin retrieves & updates platform settings & reward rates at /admin/settings', async () => {
    // Get
    const getRes = await fetch(`${BASE_URL}/admin/settings`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (getRes.status !== 200) throw new Error(`Expected 200 OK, got ${getRes.status}`);
    const getJson = await getRes.json();
    if (!getJson.success || !getJson.data.rewardRule) {
      throw new Error(`Invalid settings response: ${JSON.stringify(getJson)}`);
    }

    // Put
    const putRes = await fetch(`${BASE_URL}/admin/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        rewardRule: {
          id: getJson.data.rewardRule.id,
          rewardPerValidLikeINR: 0.12,
          minimumPayoutINR: 500.00,
          maximumMonthlyRewardINR: 100000.00,
          bonusRate: 0.05,
        },
        systemSettings: {
          platform_tagline: 'Real Voices. Original Stories. Desi Talent.',
          anti_fraud_threshold: '80',
        },
      }),
    });
    if (putRes.status !== 200) throw new Error(`Expected 200 OK, got ${putRes.status}`);
    const putJson = await putRes.json();
    if (!putJson.success) throw new Error(`Failed to update settings: ${JSON.stringify(putJson)}`);
  });

  console.log(`\n=========================================`);
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log(`=========================================\n`);

  if (failed > 0) process.exit(1);
}

runTests();
