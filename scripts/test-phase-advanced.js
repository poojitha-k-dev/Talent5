const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const JWT_SECRET = process.env.JWT_SECRET || 'talent5_super_secure_jwt_secret_key_2026_desi_music_platform_ultra';
const WEBHOOK_SECRET = process.env.PAYMENT_WEBHOOK_SECRET || 'talent5_live_webhook_secret_2026_instant_upi';

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

const adminToken = generateToken(adminUser);

function signWebhookPayload(payload) {
  return crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(JSON.stringify(payload))
    .digest('hex');
}

async function runAdvancedTests() {
  console.log('=== TALENT5 ADVANCED PRODUCTION ENHANCEMENTS TEST SUITE ===\n');
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

  // 1. PWA Manifest
  await test('PWA Web App Manifest served at /manifest.json with 200 OK', async () => {
    const res = await fetch(`${BASE_URL}/manifest.json`);
    if (res.status !== 200) throw new Error(`Expected 200 OK, got ${res.status}`);
    const json = await res.json();
    if (json.short_name !== 'Talent5' || !Array.isArray(json.shortcuts)) {
      throw new Error(`Invalid manifest structure: ${JSON.stringify(json)}`);
    }
    console.log(`   PWA Name: "${json.name}", Shortcuts: ${json.shortcuts.length}`);
  });

  // 2. PWA Service Worker
  await test('PWA Service Worker script served at /sw.js with 200 OK', async () => {
    const res = await fetch(`${BASE_URL}/sw.js`);
    if (res.status !== 200) throw new Error(`Expected 200 OK, got ${res.status}`);
    const text = await res.text();
    if (!text.includes('talent5-cache-v1') || !text.includes('addEventListener')) {
      throw new Error(`Invalid service worker content`);
    }
  });

  // 3. Media Upload URL Ticket
  let uploadKey = null;
  await test('Media Storage Presigned Ticket generation (/api/v1/media/upload-url)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/media/upload-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        fileName: 'desi-anthem-master.mp3',
        contentType: 'audio/mpeg',
        sizeBytes: 15 * 1024 * 1024, // 15MB
      }),
    });
    if (res.status !== 200) throw new Error(`Expected 200 OK, got ${res.status}`);
    const json = await res.json();
    if (!json.success || !json.data.key || !json.data.uploadUrl) {
      throw new Error(`Invalid upload ticket: ${JSON.stringify(json)}`);
    }
    uploadKey = json.data.key;
    console.log(`   Generated Ticket Key: "${uploadKey}", Driver: ${json.data.driver}`);
  });

  // 4. Media Local Binary Upload
  if (uploadKey) {
    await test('Media File Upload to Storage Driver (/api/v1/media/upload)', async () => {
      const dummyBuffer = Buffer.alloc(4096, 0x54); // 4KB dummy audio data
      const res = await fetch(`${BASE_URL}/api/v1/media/upload?key=${encodeURIComponent(uploadKey)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        body: dummyBuffer,
      });
      if (res.status !== 200) throw new Error(`Expected 200 OK, got ${res.status}`);
      const json = await res.json();
      if (!json.success || json.data.sizeBytes !== 4096) {
        throw new Error(`Failed to write file: ${JSON.stringify(json)}`);
      }
    });

    // 5. HTTP 206 Partial Content Range Streaming
    await test('Media Stream endpoint supports HTTP Range Requests (206 Partial Content)', async () => {
      const res = await fetch(`${BASE_URL}/api/v1/media/stream/${encodeURIComponent(uploadKey)}`, {
        headers: {
          Range: 'bytes=0-1023',
        },
      });
      if (res.status !== 206) throw new Error(`Expected 206 Partial Content, got ${res.status}`);
      const contentRange = res.headers.get('content-range');
      const acceptRanges = res.headers.get('accept-ranges');
      if (!contentRange || !contentRange.startsWith('bytes 0-1023/')) {
        throw new Error(`Invalid Content-Range header: ${contentRange}`);
      }
      if (acceptRanges !== 'bytes') {
        throw new Error(`Accept-Ranges header missing or invalid: ${acceptRanges}`);
      }
      console.log(`   Content-Range returned: ${contentRange}`);
    });
  }

  // 6. Payment Gateway Webhook: Signature verification rejection
  await test('Payment Webhook rejects requests with invalid HMAC signature (401)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/webhooks/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-signature': 'invalid_forged_signature_hex_123',
      },
      body: JSON.stringify({ event: 'payout.processed' }),
    });
    if (res.status !== 401) throw new Error(`Expected 401 Unauthorized, got ${res.status}`);
    const json = await res.json();
    if (json.success !== false) throw new Error(`Expected success: false`);
  });

  // 7. Payment Gateway Webhook: Legitimate signature and payout settlement
  await test('Payment Webhook processes payout.processed with valid HMAC signature', async () => {
    // 1. Create a quick requested payout in DB to settle
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: 'postgresql://postgres:postgres@localhost:5432/talent5_v1',
    });

    const testPayoutId = '55555555-5555-5555-5555-555555555555';
    await pool.query(`
      INSERT INTO payout_requests (id, creator_id, amount_inr, payment_method, account_ref_tokenized, status)
      VALUES ('${testPayoutId}', '10000000-0000-0000-0000-000000000001', 500.00, 'UPI', 'kabir@upi', 'UNDER_REVIEW')
      ON CONFLICT (id) DO UPDATE SET status = 'UNDER_REVIEW';
    `);
    await pool.end();

    const webhookPayload = {
      event: 'payout.processed',
      payload: {
        payout: {
          entity: {
            id: 'pout_gateway_test_99812',
            reference_id: testPayoutId,
            amount: 50000,
            currency: 'INR',
            status: 'processed',
            utr: 'HDFCR9202603120019284',
            mode: 'UPI',
          },
        },
      },
    };

    const signature = signWebhookPayload(webhookPayload);

    const res = await fetch(`${BASE_URL}/api/v1/webhooks/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-signature': signature,
      },
      body: JSON.stringify(webhookPayload),
    });

    if (res.status !== 200) throw new Error(`Expected 200 OK, got ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error(`Webhook processing failed: ${JSON.stringify(json)}`);
    console.log(`   Disbursement confirmed with UTR: ${webhookPayload.payload.payout.entity.utr}`);
  });

  // 8. Recommendation Engine Endpoint
  await test('Recommendation Engine returns trending and personalized tracks (/api/v1/recommendations)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/recommendations?language=hi`);
    if (res.status !== 200) throw new Error(`Expected 200 OK, got ${res.status}`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data.trendingDiscoveries) || !Array.isArray(json.data.risingCreators)) {
      throw new Error(`Invalid recommendations structure: ${JSON.stringify(json)}`);
    }
    console.log(`   Trending Discoveries: ${json.data.trendingDiscoveries.length}, Rising Creators: ${json.data.risingCreators.length}`);
  });

  console.log(`\n=========================================`);
  console.log(`TOTAL ADVANCED TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log(`=========================================\n`);

  if (failed > 0) process.exit(1);
}

runAdvancedTests();
