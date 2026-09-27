const BASE_URL = 'http://localhost:3000';

async function testForgotPasswordWorkflow() {
  console.log('=== TESTING INTERACTIVE FORGOT PASSWORD WORKFLOW ===\n');

  const testEmail = 'listener@talent5.com';
  const newTestPassword = 'Talent5UpdatedPass2026!';
  const originalPassword = 'Talent5Listener2026!';

  // Step 1: Request verification code (Ask for mail again)
  console.log('1. Submitting Forgot Password for:', testEmail);
  const forgotRes = await fetch(`${BASE_URL}/api/v1/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail }),
  });
  const forgotJson = await forgotRes.json();
  console.log('Forgot password response status:', forgotRes.status);
  console.log('Forgot password response data:', forgotJson);

  if (!forgotRes.ok || !forgotJson.success) {
    throw new Error(`Forgot password failed: ${forgotJson.message}`);
  }

  const verificationCode = forgotJson.demoCode;
  console.log('Issued verification code:', verificationCode);

  // Step 2: Test password mismatch validation (Asking two times to reverify)
  console.log('\n2. Testing password mismatch rejection...');
  const mismatchRes = await fetch(`${BASE_URL}/api/v1/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      code: verificationCode,
      newPassword: 'PasswordOne123!',
      confirmPassword: 'PasswordDifferent456!',
    }),
  });
  const mismatchJson = await mismatchRes.json();
  console.log('Mismatch status:', mismatchRes.status, '| Message:', mismatchJson.message);
  if (mismatchRes.status !== 400 || !mismatchJson.message.includes('do not match')) {
    throw new Error('Password mismatch validation failed!');
  }
  console.log('✅ Correctly rejected mismatched passwords');

  // Step 3: Test password length validation (< 6 chars)
  console.log('\n3. Testing short password rejection...');
  const shortRes = await fetch(`${BASE_URL}/api/v1/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      code: verificationCode,
      newPassword: '123',
      confirmPassword: '123',
    }),
  });
  const shortJson = await shortRes.json();
  console.log('Short password status:', shortRes.status, '| Message:', shortJson.message);
  if (shortRes.status !== 400 || !shortJson.message.includes('at least 6 characters')) {
    throw new Error('Short password validation failed!');
  }
  console.log('✅ Correctly rejected short password');

  // Step 4: Successfully reset password with dual confirmation matching
  console.log('\n4. Submitting valid password reset with matching dual confirmation...');
  const resetRes = await fetch(`${BASE_URL}/api/v1/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      code: verificationCode,
      newPassword: newTestPassword,
      confirmPassword: newTestPassword,
    }),
  });
  const resetJson = await resetRes.json();
  console.log('Reset response status:', resetRes.status, '| Message:', resetJson.message);
  if (!resetRes.ok || !resetJson.success) {
    throw new Error(`Password reset failed: ${resetJson.message}`);
  }
  console.log('✅ Password successfully updated in PostgreSQL database!');

  // Step 5: Test login with the newly updated password
  console.log('\n5. Testing login with the newly updated password...');
  const loginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: newTestPassword }),
  });
  const loginJson = await loginRes.json();
  console.log('Login status with new password:', loginRes.status);
  if (!loginRes.ok || !loginJson.success || !loginJson.data?.token) {
    throw new Error(`Login with new password failed: ${loginJson.message}`);
  }
  console.log('✅ Successfully authenticated and issued JWT with updated password!');

  // Step 6: Restore original password for ongoing test suite compatibility
  console.log('\n6. Restoring original password for test suite compatibility...');
  const restoreForgotRes = await fetch(`${BASE_URL}/api/v1/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail }),
  });
  const restoreForgotJson = await restoreForgotRes.json();
  const restoreCode = restoreForgotJson.demoCode;

  const restoreResetRes = await fetch(`${BASE_URL}/api/v1/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      code: restoreCode,
      newPassword: originalPassword,
      confirmPassword: originalPassword,
    }),
  });
  console.log('Original password restoration status:', restoreResetRes.status);
  console.log('\n🎉 ALL FORGOT PASSWORD WORKFLOW TESTS PASSED PERFECTLY!\n');
}

testForgotPasswordWorkflow().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
