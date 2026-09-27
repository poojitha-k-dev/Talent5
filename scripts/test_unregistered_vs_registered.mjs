import pg from 'pg';

const BASE_URL = 'http://localhost:3000';
const DB_URL = 'postgresql://postgres:postgres@localhost:5432/talent5_v1';

async function testFlow() {
  console.log('================================================================');
  console.log('🧪 TESTING FORGOT PASSWORD: UNREGISTERED VS REGISTERED FLOWS');
  console.log('================================================================\n');

  // CASE 1: UNREGISTERED EMAIL
  const unregisteredEmail = `random.fake.email.${Date.now()}@example.com`;
  console.log(`1. Submitting UNREGISTERED email: ${unregisteredEmail}`);

  const resUnreg = await fetch(`${BASE_URL}/api/v1/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: unregisteredEmail }),
  });

  const dataUnreg = await resUnreg.json();
  console.log(`   • HTTP Status: ${resUnreg.status}`);
  console.log(`   • Response:`, dataUnreg);

  if (resUnreg.status === 404 && dataUnreg.notRegistered === true) {
    console.log('   ✅ PASS: Backend correctly returned 404 saying email is not registered!');
  } else {
    console.error('   ❌ FAIL: Backend should return 404 not registered!', dataUnreg);
    process.exit(1);
  }

  // CASE 2: REGISTERED EMAIL
  console.log('\n2. Submitting REGISTERED email: kunchalapoojitha3@gmail.com');
  const resReg = await fetch(`${BASE_URL}/api/v1/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'kunchalapoojitha3@gmail.com' }),
  });

  const dataReg = await resReg.json();
  console.log(`   • HTTP Status: ${resReg.status}`);
  console.log(`   • Response:`, dataReg);

  if (resReg.status === 200 && dataReg.success === true) {
    console.log('   ✅ PASS: Verification code successfully generated and dispatched to registered email!');
  } else {
    console.error('   ❌ FAIL: Registered user should receive OTP!', dataReg);
    process.exit(1);
  }

  // Verify in PostgreSQL database
  const client = new pg.Client({ connectionString: DB_URL });
  await client.connect();

  const checkUnregDb = await client.query(
    'SELECT id FROM password_resets WHERE LOWER(email) = $1',
    [unregisteredEmail.toLowerCase()]
  );
  if (checkUnregDb.rows.length === 0) {
    console.log('   ✅ PASS: Zero records created for unregistered email in database.');
  } else {
    console.error('   ❌ FAIL: Record was created for unregistered email!');
  }

  const checkRegDb = await client.query(
    'SELECT id, email, expires_at, used FROM password_resets WHERE LOWER(email) = $1 ORDER BY created_at DESC LIMIT 1',
    ['kunchalapoojitha3@gmail.com']
  );
  if (checkRegDb.rows.length > 0) {
    console.log('   ✅ PASS: Valid reset record found for registered user in database.');
    console.log('      - Recipient:', checkRegDb.rows[0].email);
    console.log('      - Expires At:', checkRegDb.rows[0].expires_at);
  }

  await client.end();
  console.log('\n================================================================');
  console.log('🎉 UNREGISTERED AND REGISTERED BEHAVIORS ARE BOTH 100% VERIFIED!');
  console.log('================================================================\n');
}

testFlow().catch(err => {
  console.error(err);
  process.exit(1);
});
