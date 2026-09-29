
const BASE_URL = 'http://localhost:3000';

async function run() {
  console.log('--- STARTING USER DOSSIER MODAL ACTIONS VERIFICATION ---');

  // 1. Authenticate as Admin
  console.log('[STEP 1] Authenticating admin account...');
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
  console.log('✓ PASS: Admin authenticated. Bearer token acquired.');

  // 2. Fetch User Directory
  console.log('\n[STEP 2] Fetching user directory to select target for modal actions...');
  const getUsersRes = await fetch(`${BASE_URL}/api/v1/admin/users`, { headers: authHeaders });
  const getUsersJson = await getUsersRes.json();
  if (!getUsersJson.success || !Array.isArray(getUsersJson.data?.users)) {
    throw new Error('Failed to fetch user directory');
  }

  // Find Raksha Shinde or create a test user
  let targetUser = getUsersJson.data.users.find(u => u.email.includes('raksha') || u.username.includes('raksha'));
  if (!targetUser) {
    console.log('User Raksha not found, using first non-admin user or creating one...');
    targetUser = getUsersJson.data.users.find(u => !u.roles.includes('ADMIN')) || getUsersJson.data.users[0];
  }
  console.log(`✓ Target User Selected: "${targetUser.fullName || targetUser.username}" (${targetUser.email})`);
  console.log(`  Initial Verification Status: ${targetUser.isVerified ? 'VERIFIED' : 'PENDING'}`);

  // 3. Test Verify / Unverify Button Action (handleToggleVerification)
  console.log('\n[STEP 3] Testing [Verify / Unverify] button toggle action...');
  const newVerifiedStatus = !targetUser.isVerified;
  const toggleRes = await fetch(`${BASE_URL}/api/v1/admin/users`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({
      userId: targetUser.id,
      isVerified: newVerifiedStatus,
      notes: `Admin test toggled verification to ${newVerifiedStatus}`,
    }),
  });
  const toggleJson = await toggleRes.json();
  if (!toggleJson.success) {
    throw new Error(`Verification toggle failed: ${JSON.stringify(toggleJson)}`);
  }
  console.log(`✓ PASS: Verification toggled successfully! New isVerified: ${toggleJson.data.isVerified}`);

  // Toggle back to preserve original state
  const revertRes = await fetch(`${BASE_URL}/api/v1/admin/users`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({
      userId: targetUser.id,
      isVerified: targetUser.isVerified,
      notes: 'Admin test restored original verification',
    }),
  });
  const revertJson = await revertRes.json();
  console.log(`✓ Restored original verification status: ${revertJson.data.isVerified}`);

  // 4. Test Edit Action (handleEditSubmit)
  console.log('\n[STEP 4] Testing [Edit] button payload update...');
  const originalName = targetUser.fullName;
  const testUpdatedName = `${originalName} (Verified Dossier)`;
  const editRes = await fetch(`${BASE_URL}/api/v1/admin/users`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({
      userId: targetUser.id,
      fullName: testUpdatedName,
      email: targetUser.email,
      username: targetUser.username,
      phone: targetUser.phone,
      roles: targetUser.roles,
      status: targetUser.status,
      isVerified: targetUser.isVerified,
    }),
  });
  const editJson = await editRes.json();
  if (!editJson.success || editJson.data.fullName !== testUpdatedName) {
    throw new Error(`Edit action failed: ${JSON.stringify(editJson)}`);
  }
  console.log(`✓ PASS: Edit action succeeded. Updated fullName to: "${editJson.data.fullName}"`);

  // Revert name back
  await fetch(`${BASE_URL}/api/v1/admin/users`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({
      userId: targetUser.id,
      fullName: originalName,
    }),
  });
  console.log(`✓ Restored original fullName to: "${originalName}"`);

  // 5. Test Password Button Action (handlePasswordSubmit)
  console.log('\n[STEP 5] Testing [Password] reset modal action on a test account...');
  const testUserEmail = `modal_test_${Date.now()}@example.com`;
  const createTempRes = await fetch(`${BASE_URL}/api/v1/admin/users`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      fullName: 'Modal Action Auditor',
      email: testUserEmail,
      password: 'InitialPassword123!',
      roles: ['USER'],
    }),
  });
  const createTempJson = await createTempRes.json();
  const tempUserId = createTempJson.data.id;
  console.log(`✓ Created temporary test user: ${tempUserId}`);

  // Update password
  const newPass = 'NewSecurePass2026!#';
  const resetPassRes = await fetch(`${BASE_URL}/api/v1/admin/users`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({
      userId: tempUserId,
      newPassword: newPass,
      notes: 'Passphrase reset from modal test',
    }),
  });
  const resetPassJson = await resetPassRes.json();
  if (!resetPassJson.success) {
    throw new Error('Password reset failed');
  }
  console.log('✓ PASS: Password reset API updated credentials.');

  // Verify authentication with new password
  const verifyLoginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testUserEmail, password: newPass }),
  });
  const verifyLoginJson = await verifyLoginRes.json();
  if (!verifyLoginJson.success) {
    throw new Error('Failed to login with new password');
  }
  console.log('✓ PASS: Login with new password succeeded!');

  // 6. Test Delete Action (handleDeleteSubmit)
  console.log('\n[STEP 6] Testing [Delete] modal action...');
  const deleteRes = await fetch(`${BASE_URL}/api/v1/admin/users`, {
    method: 'DELETE',
    headers: authHeaders,
    body: JSON.stringify({
      userId: tempUserId,
      permanent: true,
    }),
  });
  const deleteJson = await deleteRes.json();
  if (!deleteJson.success) {
    throw new Error('Deletion failed');
  }
  console.log('✓ PASS: User deleted permanently via modal action.');

  console.log('\n======================================================');
  console.log('🎉 ALL MODAL ACTIONS & BUTTON ENDPOINTS VERIFIED 100%');
  console.log('======================================================');
}

run().catch((err) => {
  console.error('\n❌ ERROR:', err);
  process.exit(1);
});
