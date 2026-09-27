
const BASE_URL = 'http://localhost:3000';

async function run() {
  console.log('--- STARTING USER MANAGEMENT & ADMIN LOGIN VERIFICATION ---');

  // 1. Check /admin/login page HTML for default credentials
  console.log('\n[TEST 1] Verifying /admin/login page has no default credentials shown...');
  const adminLoginPageRes = await fetch(`${BASE_URL}/admin/login`);
  const adminLoginHtml = await adminLoginPageRes.text();

  if (adminLoginHtml.includes('Fill Default Admin Key') || adminLoginHtml.includes('Talent5Admin2026!') || adminLoginHtml.includes('Rapid Development Credentials')) {
    throw new Error('FAIL: /admin/login page still contains default credentials or prefill buttons!');
  }
  console.log('✓ PASS: /admin/login page has NO default credentials or demo boxes!');

  // 2. Log in as admin to get auth token
  console.log('\n[TEST 2] Logging in as admin to obtain clearance token...');
  const loginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@talent5.com', password: 'Talent5Admin2026!' }),
  });
  const loginJson = await loginRes.json();
  if (!loginJson.success || !loginJson.data?.token) {
    throw new Error(`FAIL: Admin login failed: ${JSON.stringify(loginJson)}`);
  }
  const token = loginJson.data.token;
  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
  console.log('✓ PASS: Admin authenticated successfully. Token acquired.');

  // 3. GET /api/v1/admin/users
  console.log('\n[TEST 3] Fetching users directory...');
  const getUsersRes = await fetch(`${BASE_URL}/api/v1/admin/users`, { headers: authHeaders });
  const getUsersJson = await getUsersRes.json();
  if (!getUsersJson.success || !Array.isArray(getUsersJson.data?.users)) {
    throw new Error(`FAIL: GET /api/v1/admin/users failed: ${JSON.stringify(getUsersJson)}`);
  }
  console.log(`✓ PASS: Fetched ${getUsersJson.data.users.length} users. Total in DB: ${getUsersJson.data.summary.totalUsers}`);

  // 4. POST /api/v1/admin/users - Create a listener user
  console.log('\n[TEST 4] Adding new listener user...');
  const testUserEmail = `testuser_${Date.now()}@example.com`;
  const initialPassword = 'InitialSecretPass2026!';
  const createUserRes = await fetch(`${BASE_URL}/api/v1/admin/users`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      fullName: 'Test Auditor User',
      email: testUserEmail,
      username: `testauditor_${Date.now()}`,
      phone: '+91 9998887776',
      password: initialPassword,
      roles: ['USER'],
      status: 'ACTIVE',
      isVerified: true,
    }),
  });
  const createUserJson = await createUserRes.json();
  if (!createUserJson.success || !createUserJson.data?.id) {
    throw new Error(`FAIL: Create user failed: ${JSON.stringify(createUserJson)}`);
  }
  const createdUserId = createUserJson.data.id;
  console.log(`✓ PASS: User created with ID: ${createdUserId}, Email: ${testUserEmail}`);

  // Verify created user can log in with initial password
  const testLoginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testUserEmail, password: initialPassword }),
  });
  const testLoginJson = await testLoginRes.json();
  if (!testLoginJson.success) {
    throw new Error(`FAIL: Newly created user could not log in: ${JSON.stringify(testLoginJson)}`);
  }
  console.log('✓ PASS: Newly created user successfully authenticated with initial password.');

  // 5. POST /api/v1/admin/users - Create an admin user
  console.log('\n[TEST 5] Adding new administrator user...');
  const testAdminEmail = `testadmin_${Date.now()}@example.com`;
  const createAdminRes = await fetch(`${BASE_URL}/api/v1/admin/users`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      fullName: 'Regional Sub Admin',
      email: testAdminEmail,
      username: `subadmin_${Date.now()}`,
      password: 'AdminKeySec2026!',
      roles: ['ADMIN'],
      status: 'ACTIVE',
      isVerified: true,
    }),
  });
  const createAdminJson = await createAdminRes.json();
  if (!createAdminJson.success || !createAdminJson.data?.roles.includes('ADMIN')) {
    throw new Error(`FAIL: Create admin failed: ${JSON.stringify(createAdminJson)}`);
  }
  const createdAdminId = createAdminJson.data.id;
  console.log(`✓ PASS: Admin created with ID: ${createdAdminId}, Roles: ${createAdminJson.data.roles.join(', ')}`);

  // 6. PATCH /api/v1/admin/users - Update user details and roles
  console.log('\n[TEST 6] Updating user details and promoting to CREATOR...');
  const updateUserRes = await fetch(`${BASE_URL}/api/v1/admin/users`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({
      userId: createdUserId,
      fullName: 'Test Auditor Promoted',
      roles: ['USER', 'CREATOR'],
      phone: '+91 9112233445',
    }),
  });
  const updateUserJson = await updateUserRes.json();
  if (!updateUserJson.success || updateUserJson.data.fullName !== 'Test Auditor Promoted') {
    throw new Error(`FAIL: Update user failed: ${JSON.stringify(updateUserJson)}`);
  }
  console.log(`✓ PASS: User details updated: ${updateUserJson.data.fullName}, Roles: ${updateUserJson.data.roles.join(', ')}`);

  // 7. PATCH /api/v1/admin/users - Reset user password
  console.log('\n[TEST 7] Resetting user password...');
  const newPassword = 'NewResetPassword2026#';
  const resetPwRes = await fetch(`${BASE_URL}/api/v1/admin/users`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({
      userId: createdUserId,
      newPassword: newPassword,
    }),
  });
  const resetPwJson = await resetPwRes.json();
  if (!resetPwJson.success) {
    throw new Error(`FAIL: Reset password failed: ${JSON.stringify(resetPwJson)}`);
  }
  console.log('✓ PASS: Password reset API returned success.');

  // Verify old password fails and new password succeeds
  const oldPwLoginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testUserEmail, password: initialPassword }),
  });
  const oldPwLoginJson = await oldPwLoginRes.json();
  if (oldPwLoginJson.success) {
    throw new Error('FAIL: Old password still worked after reset!');
  }
  console.log('✓ PASS: Old password rejected as expected.');

  const newPwLoginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testUserEmail, password: newPassword }),
  });
  const newPwLoginJson = await newPwLoginRes.json();
  if (!newPwLoginJson.success) {
    throw new Error(`FAIL: New password login failed: ${JSON.stringify(newPwLoginJson)}`);
  }
  console.log('✓ PASS: New password authentication succeeded.');

  // 8. DELETE /api/v1/admin/users - Permanent delete created users
  console.log('\n[TEST 8] Deleting test users...');
  const delUserRes = await fetch(`${BASE_URL}/api/v1/admin/users`, {
    method: 'DELETE',
    headers: authHeaders,
    body: JSON.stringify({ userId: createdUserId, permanent: true }),
  });
  const delUserJson = await delUserRes.json();
  if (!delUserJson.success) {
    throw new Error(`FAIL: Delete user failed: ${JSON.stringify(delUserJson)}`);
  }
  console.log(`✓ PASS: Test user ${createdUserId} permanently deleted.`);

  const delAdminRes = await fetch(`${BASE_URL}/api/v1/admin/users`, {
    method: 'DELETE',
    headers: authHeaders,
    body: JSON.stringify({ userId: createdAdminId, permanent: true }),
  });
  const delAdminJson = await delAdminRes.json();
  if (!delAdminJson.success) {
    throw new Error(`FAIL: Delete admin failed: ${JSON.stringify(delAdminJson)}`);
  }
  console.log(`✓ PASS: Test admin ${createdAdminId} permanently deleted.`);

  // 9. Verify self-deletion prevention for active admin
  console.log('\n[TEST 9] Verifying self-deletion prevention for admin...');
  const selfDelRes = await fetch(`${BASE_URL}/api/v1/admin/users`, {
    method: 'DELETE',
    headers: authHeaders,
    body: JSON.stringify({ userId: loginJson.data.user.id, permanent: true }),
  });
  const selfDelJson = await selfDelRes.json();
  if (selfDelRes.ok || selfDelJson.success) {
    throw new Error('FAIL: Admin was allowed to delete their own account!');
  }
  console.log(`✓ PASS: Admin self-deletion prevented: "${selfDelJson.error?.message}"`);

  console.log('\n========================================');
  console.log('🎉 ALL USER MANAGEMENT & SECURITY CLEARANCE TESTS PASSED (100%)');
  console.log('========================================');
}

run().catch((err) => {
  console.error('\n❌ TEST FAILED:', err.message);
  process.exit(1);
});
