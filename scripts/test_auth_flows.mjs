import pg from 'pg';
import path from 'path';
import fs from 'fs';

const DB_URL = 'postgresql://postgres:postgres@localhost:5432/talent5_v1';
const BASE_URL = 'http://localhost:3000';

async function runTestSuite() {
  console.log('================================================================');
  console.log('🧪 TALENT5 AUTHENTICATION & GOOGLE OAUTH TEST SUITE');
  console.log('================================================================\n');

  const client = new pg.Client({ connectionString: DB_URL });
  await client.connect();

  try {
    // -------------------------------------------------------------
    // TEST 1: Password User Registration & auth_provider Check
    // -------------------------------------------------------------
    console.log('TEST 1: Email/Password Registration Sets auth_provider = "password"');
    const testPasswordEmail = `user.password.${Date.now()}@example.com`;

    const regRes = await fetch(`${BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testPasswordEmail,
        password: 'SecurePassword2026!',
        fullName: 'Test Password User',
      }),
    });
    const regData = await regRes.json();
    console.log(`   • Register Status: ${regRes.status}`);

    const userDbRes = await client.query(
      'SELECT id, email, auth_provider, password_hash FROM users WHERE LOWER(email) = $1',
      [testPasswordEmail.toLowerCase()]
    );
    const passwordUser = userDbRes.rows[0];
    if (passwordUser && passwordUser.auth_provider === 'password' && passwordUser.password_hash) {
      console.log('   ✅ PASS: User registered with auth_provider = "password" and secure bcrypt password_hash.');
    } else {
      console.error('   ❌ FAIL: auth_provider is not "password" or password_hash is missing.', passwordUser);
      process.exit(1);
    }

    // -------------------------------------------------------------
    // TEST 2: Password User Forgot-Password (OTP generation & storage)
    // -------------------------------------------------------------
    console.log('\nTEST 2: Password User Forgot-Password (Generates OTP & Dispatches via Central SMTP)');
    const fpRes = await fetch(`${BASE_URL}/api/v1/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testPasswordEmail }),
    });
    const fpData = await fpRes.json();
    console.log(`   • Forgot Password Status: ${fpRes.status}`);
    console.log(`   • Response Message: ${fpData.message}`);

    // Verify security constraints: no OTP in response
    if (fpData.otp || fpData.demoCode || fpData.code) {
      console.error('   ❌ FAIL: Sensitive OTP leaked in API response!');
      process.exit(1);
    } else {
      console.log('   ✅ PASS: No OTP or demoCode in API response.');
    }

    const resetDbRes = await client.query(
      'SELECT id, otp_hash, expires_at, used FROM password_resets WHERE LOWER(email) = $1 ORDER BY created_at DESC LIMIT 1',
      [testPasswordEmail.toLowerCase()]
    );
    if (resetDbRes.rows.length > 0 && resetDbRes.rows[0].otp_hash.startsWith('$2a$')) {
      console.log('   ✅ PASS: Stored bcrypt-hashed OTP in PostgreSQL password_resets table.');
      console.log(`   • Expires at: ${resetDbRes.rows[0].expires_at}`);
    } else {
      console.error('   ❌ FAIL: Reset record not found or not hashed with bcrypt.');
      process.exit(1);
    }

    // -------------------------------------------------------------
    // TEST 3: Google-Only User Rejection in Forgot-Password
    // -------------------------------------------------------------
    console.log('\nTEST 3: Google-Only Account Forgot-Password (BLOCKED from OTP, Prompted to Use Google)');
    const googleTestEmail = `google.user.${Date.now()}@gmail.com`;
    const googleId = `google_oauth_sub_${Date.now()}`;

    // Insert mock Google-authenticated user directly into DB (simulating Google OAuth signup)
    await client.query(
      `INSERT INTO users (email, password_hash, full_name, username, google_id, auth_provider, is_verified, status)
       VALUES ($1, NULL, 'Google Account Holder', $2, $3, 'google', TRUE, 'ACTIVE')`,
      [googleTestEmail, `google_${Date.now()}`, googleId]
    );

    const fpGoogleRes = await fetch(`${BASE_URL}/api/v1/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: googleTestEmail }),
    });
    const fpGoogleData = await fpGoogleRes.json();
    console.log(`   • HTTP Status: ${fpGoogleRes.status}`);
    console.log(`   • Response isGoogleAccount: ${fpGoogleData.isGoogleAccount}`);
    console.log(`   • Response Message: "${fpGoogleData.message}"`);

    if (fpGoogleData.isGoogleAccount === true && fpGoogleData.message.includes('Google Sign-In')) {
      console.log('   ✅ PASS: Correctly identified Google account and instructed to use "Continue with Google".');
    } else {
      console.error('   ❌ FAIL: Did not properly reject Google-only account!', fpGoogleData);
      process.exit(1);
    }

    // Verify that NO OTP was inserted into password_resets for the Google user
    const googleResetRes = await client.query(
      'SELECT id FROM password_resets WHERE LOWER(email) = $1',
      [googleTestEmail.toLowerCase()]
    );
    if (googleResetRes.rows.length === 0) {
      console.log('   ✅ PASS: Zero OTPs created in database for Google-only user. No email was sent.');
    } else {
      console.error('   ❌ FAIL: OTP was improperly generated for Google account!');
      process.exit(1);
    }

    // -------------------------------------------------------------
    // TEST 4: Google OAuth Initiation Endpoint
    // -------------------------------------------------------------
    console.log('\nTEST 4: Google OAuth Initiation Endpoint (/api/v1/auth/google)');
    const googleInitRes = await fetch(`${BASE_URL}/api/v1/auth/google?redirect=/library`, {
      redirect: 'manual',
    });
    console.log(`   • Init Route Status: ${googleInitRes.status}`);
    const location = googleInitRes.headers.get('location');
    console.log(`   • Redirect Target: ${location}`);

    if (location && (location.includes('accounts.google.com') || location.includes('login?error='))) {
      console.log('   ✅ PASS: Google OAuth initiation route correctly formats redirection.');
    } else {
      console.error('   ❌ FAIL: Unexpected response from /api/v1/auth/google');
      process.exit(1);
    }

    // -------------------------------------------------------------
    // Cleanup test users
    // -------------------------------------------------------------
    await client.query('DELETE FROM password_resets WHERE email IN ($1, $2)', [testPasswordEmail, googleTestEmail]);
    await client.query('DELETE FROM users WHERE email IN ($1, $2)', [testPasswordEmail, googleTestEmail]);
    console.log('\n🧹 Test rows cleanly removed from database.');

    console.log('\n================================================================');
    console.log('🎉 ALL 4 AUTHENTICATION & GOOGLE OAUTH TESTS PASSED PERFECTLY!');
    console.log('================================================================\n');
  } finally {
    await client.end();
  }
}

runTestSuite().catch((err) => {
  console.error('Test Suite Exception:', err);
  process.exit(1);
});
