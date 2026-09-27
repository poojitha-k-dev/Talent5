import { Pool } from 'pg';
import { hashPassword } from '../packages/utils/dist/index.js';

async function run() {
  console.log('=== TESTING VERIFICATION LINK PASSWORD RESET FLOW ===\n');

  // 1. Request verification link
  console.log('1. Requesting password reset verification link for kunchalapoojitha3@gmail.com...');
  const res1 = await fetch('http://localhost:3000/api/v1/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'kunchalapoojitha3@gmail.com' }),
  });
  const data1 = await res1.json();
  console.log('Status:', res1.status);
  console.log('Reset Link:', data1.resetLink);
  console.log('Token:', data1.token);

  if (!data1.token || !data1.resetLink) {
    throw new Error('Failed to generate verification link');
  }

  // 2. Validate token endpoint
  console.log('\n2. Verifying token via /api/v1/auth/verify-reset-token...');
  const res2 = await fetch(`http://localhost:3000/api/v1/auth/verify-reset-token?token=${data1.token}`);
  const data2 = await res2.json();
  console.log('Token verification result:', data2);
  if (!data2.valid || data2.email !== 'kunchalapoojitha3@gmail.com') {
    throw new Error('Token verification failed');
  }

  // 3. Test dual password mismatch
  console.log('\n3. Testing dual password mismatch rejection...');
  const res3 = await fetch('http://localhost:3000/api/v1/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: data1.token,
      newPassword: 'MyNewSecret2026!',
      confirmPassword: 'MismatchSecret!',
    }),
  });
  const data3 = await res3.json();
  console.log('Mismatch check:', res3.status, data3.message);
  if (res3.status !== 400) throw new Error('Expected 400 for password mismatch');

  // 4. Test successful password reset with matching dual confirmation
  console.log('\n4. Submitting valid matching passwords via token...');
  const res4 = await fetch('http://localhost:3000/api/v1/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: data1.token,
      newPassword: 'PoojithaSecurePassword2026!',
      confirmPassword: 'PoojithaSecurePassword2026!',
    }),
  });
  const data4 = await res4.json();
  console.log('Reset result:', res4.status, data4.message);
  if (res4.status !== 200 || !data4.success) throw new Error('Reset password failed');

  // 5. Verify token is consumed and cannot be reused
  console.log('\n5. Verifying token cannot be reused...');
  const res5 = await fetch(`http://localhost:3000/api/v1/auth/verify-reset-token?token=${data1.token}`);
  const data5 = await res5.json();
  console.log('Second verification status:', res5.status, data5.message);
  if (data5.valid) throw new Error('Token should be invalidated after use');

  // 6. Test login with newly updated password
  console.log('\n6. Testing login with newly updated password...');
  const res6 = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'kunchalapoojitha3@gmail.com',
      password: 'PoojithaSecurePassword2026!',
    }),
  });
  const data6 = await res6.json();
  console.log('Login result:', res6.status, data6.data?.user?.fullName);
  if (res6.status !== 200 || !data6.data?.token) throw new Error('Login failed with new password');

  console.log('\n🎉 ALL VERIFICATION LINK TESTS PASSED WITH FLYING COLORS!');
}

run().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
