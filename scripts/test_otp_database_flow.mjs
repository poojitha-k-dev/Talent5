import { Pool } from 'pg';
import { verifyPassword, hashPassword } from '../packages/utils/dist/index.js';

async function testOtpDatabaseFlow() {
  console.log('=== TESTING COMPLETE FORGOT PASSWORD + DATABASE OTP ARCHITECTURE ===\n');
  const pool = new Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/talent5_v1' });

  const testEmail = 'listener@talent5.com';

  // 1. Request OTP via forgot-password
  console.log(`1. Requesting OTP for ${testEmail}...`);
  const res1 = await fetch('http://localhost:3000/api/v1/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail }),
  });
  const data1 = await res1.json();
  console.log('Forgot-password status:', res1.status, data1.message);
  if (!res1.ok || !data1.success) throw new Error('Forgot password failed');

  // Verify DB record
  const dbCheck1 = await pool.query(
    'SELECT id, otp_hash, attempts, used, expires_at FROM password_resets WHERE email = $1 ORDER BY created_at DESC LIMIT 1',
    [testEmail]
  );
  if (dbCheck1.rows.length === 0) throw new Error('No record in password_resets table');
  const record = dbCheck1.rows[0];
  console.log('✅ PostgreSQL record created: ID =', record.id);
  console.log('Hashed OTP in DB:', record.otp_hash.slice(0, 20) + '...');
  console.log('Attempts:', record.attempts, '| Used:', record.used);

  const otp = data1.demoCode;
  if (!otp) throw new Error('Missing OTP code in response');
  console.log('Issued OTP code:', otp);

  // 2. Test wrong OTP rejection & attempt counter
  console.log('\n2. Testing incorrect OTP rejection and attempt counter...');
  const res2 = await fetch('http://localhost:3000/api/v1/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, otp: '000000' }),
  });
  const data2 = await res2.json();
  console.log('Wrong OTP status:', res2.status, '| Message:', data2.message);
  if (res2.status !== 400) throw new Error('Wrong OTP was not rejected');

  const dbCheck2 = await pool.query('SELECT attempts FROM password_resets WHERE id = $1', [record.id]);
  console.log('Updated attempts in DB:', dbCheck2.rows[0].attempts);
  if (dbCheck2.rows[0].attempts !== 1) throw new Error('Attempts count did not increment');
  console.log('✅ Attempts correctly incremented in database!');

  // 3. Test correct OTP verification
  console.log('\n3. Verifying correct OTP...');
  const res3 = await fetch('http://localhost:3000/api/v1/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, otp }),
  });
  const data3 = await res3.json();
  console.log('Verify OTP status:', res3.status, '| Message:', data3.message);
  console.log('Received resetToken:', data3.resetToken?.slice(0, 16) + '...');
  if (!res3.ok || !data3.resetToken) throw new Error('OTP verification failed to return resetToken');

  const resetToken = data3.resetToken;

  // 4. Test password mismatch rejection
  console.log('\n4. Testing password mismatch rejection...');
  const res4 = await fetch('http://localhost:3000/api/v1/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      resetToken,
      newPassword: 'SecureNewPassword2026!',
      confirmPassword: 'MismatchPassword!',
    }),
  });
  const data4 = await res4.json();
  console.log('Mismatch check status:', res4.status, '| Message:', data4.message);
  if (res4.status !== 400) throw new Error('Password mismatch was not rejected');
  console.log('✅ Correctly rejected mismatched passwords');

  // 5. Submit valid new password
  console.log('\n5. Submitting valid matching new password...');
  const res5 = await fetch('http://localhost:3000/api/v1/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      resetToken,
      newPassword: 'SecureNewPassword2026!',
      confirmPassword: 'SecureNewPassword2026!',
    }),
  });
  const data5 = await res5.json();
  console.log('Reset password status:', res5.status, '| Message:', data5.message);
  if (!res5.ok || !data5.success) throw new Error('Reset password failed');

  // Verify DB record marked used
  const dbCheck3 = await pool.query('SELECT used FROM password_resets WHERE id = $1', [record.id]);
  console.log('Token marked used in DB:', dbCheck3.rows[0].used);
  if (!dbCheck3.rows[0].used) throw new Error('Token was not marked used');
  console.log('✅ Token marked used in database!');

  // 6. Test login with newly updated password
  console.log('\n6. Testing authentication with newly updated password...');
  const res6 = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: 'SecureNewPassword2026!',
    }),
  });
  const data6 = await res6.json();
  console.log('Login status:', res6.status, '| User:', data6.data?.user?.fullName);
  if (!res6.ok || !data6.data?.token) throw new Error('Login failed with new password');
  console.log('✅ Successfully authenticated with updated password!');

  // 7. Restore original password
  console.log('\n7. Restoring original password for listener@talent5.com...');
  const origHash = await hashPassword('Talent5Listener2026!');
  await pool.query('UPDATE users SET password_hash = $1 WHERE email = $2', [origHash, testEmail]);
  await pool.end();
  console.log('✅ Original password restored successfully.');

  console.log('\n🎉 ALL ARCHITECTURAL TESTS PASSED 100%!');
}

testOtpDatabaseFlow().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
