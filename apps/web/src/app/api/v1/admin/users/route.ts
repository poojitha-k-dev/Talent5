import { NextRequest, NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db';
import { authenticateAdmin, recordAuditLog } from '@/lib/admin';
import { hashPassword, slugify } from '@talent5/utils';

export async function GET(req: NextRequest) {
  const { user, errorResponse } = await authenticateAdmin(req);
  if (errorResponse) return errorResponse;

  const url = new URL(req.url);
  const search = url.searchParams.get('search')?.trim() || '';
  const role = url.searchParams.get('role')?.toUpperCase() || 'ALL';
  const status = url.searchParams.get('status')?.toUpperCase() || 'ALL';
  const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '50', 10), 1), 100);
  const offset = Math.max(parseInt(url.searchParams.get('offset') || '0', 10), 0);

  try {
    // 1. Fetch Summary Breakdown
    const summaryRes = await query(`
      SELECT
        COUNT(*) as "totalUsers",
        COUNT(*) FILTER (WHERE u.is_verified = TRUE) as "verifiedUsers",
        COUNT(*) FILTER (WHERE u.status = 'ACTIVE') as "activeUsers",
        COUNT(*) FILTER (WHERE u.status = 'SUSPENDED') as "suspendedUsers",
        COUNT(*) FILTER (WHERE u.created_at >= NOW() - INTERVAL '7 days') as "newThisWeek",
        COUNT(*) FILTER (WHERE u.created_at >= NOW() - INTERVAL '30 days') as "newThisMonth",
        COUNT(*) FILTER (WHERE u.auth_provider = 'google') as "googleUsers",
        COUNT(*) FILTER (WHERE u.auth_provider = 'password') as "passwordUsers",
        COUNT(DISTINCT cp.user_id) FILTER (WHERE cp.is_approved = TRUE) as "totalCreators"
      FROM users u
      LEFT JOIN creator_profiles cp ON u.id = cp.user_id
    `);

    const summaryRow = summaryRes.rows[0];
    const totalUsers = parseInt(summaryRow.totalUsers, 10);
    const totalCreators = parseInt(summaryRow.totalCreators, 10);

    // Count admins
    const adminCountRes = await query(`
      SELECT COUNT(DISTINCT user_id) as count 
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE r.name IN ('ADMIN', 'SUPER_ADMIN', 'FINANCE', 'MODERATOR')
    `);
    const totalAdmins = parseInt(adminCountRes.rows[0].count, 10);
    const totalListeners = Math.max(0, totalUsers - totalCreators - totalAdmins);

    // 2. Build filtered query for users
    const params: any[] = [];
    let whereClauses: string[] = ['1=1'];

    if (search) {
      params.push(`%${search}%`);
      const pIdx = params.length;
      whereClauses.push(`(u.full_name ILIKE $${pIdx} OR u.email ILIKE $${pIdx} OR u.username ILIKE $${pIdx})`);
    }

    if (status !== 'ALL') {
      params.push(status);
      whereClauses.push(`u.status = $${params.length}`);
    }

    let roleFilterClause = '';
    if (role === 'CREATOR') {
      roleFilterClause = `HAVING 'CREATOR' = ANY(COALESCE(array_agg(r.name) FILTER (WHERE r.name IS NOT NULL), '{}'))`;
    } else if (role === 'ADMIN') {
      roleFilterClause = `HAVING ('ADMIN' = ANY(COALESCE(array_agg(r.name) FILTER (WHERE r.name IS NOT NULL), '{}')) OR 'SUPER_ADMIN' = ANY(COALESCE(array_agg(r.name) FILTER (WHERE r.name IS NOT NULL), '{}')) OR 'MODERATOR' = ANY(COALESCE(array_agg(r.name) FILTER (WHERE r.name IS NOT NULL), '{}')) OR 'FINANCE' = ANY(COALESCE(array_agg(r.name) FILTER (WHERE r.name IS NOT NULL), '{}')))`;
    } else if (role === 'USER' || role === 'LISTENER') {
      roleFilterClause = `HAVING NOT ('CREATOR' = ANY(COALESCE(array_agg(r.name) FILTER (WHERE r.name IS NOT NULL), '{}')) OR 'ADMIN' = ANY(COALESCE(array_agg(r.name) FILTER (WHERE r.name IS NOT NULL), '{}')) OR 'SUPER_ADMIN' = ANY(COALESCE(array_agg(r.name) FILTER (WHERE r.name IS NOT NULL), '{}')) OR 'MODERATOR' = ANY(COALESCE(array_agg(r.name) FILTER (WHERE r.name IS NOT NULL), '{}')) OR 'FINANCE' = ANY(COALESCE(array_agg(r.name) FILTER (WHERE r.name IS NOT NULL), '{}')))`;
    }

    const baseSql = `
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE ${whereClauses.join(' AND ')}
      GROUP BY u.id
      ${roleFilterClause}
    `;

    // Fetch matching users
    const listSql = `
      SELECT 
        u.id, 
        u.email, 
        u.full_name as "fullName", 
        u.username, 
        u.avatar_url as "avatarUrl", 
        u.phone, 
        u.auth_provider as "authProvider", 
        u.is_verified as "isVerified", 
        u.status, 
        u.created_at as "createdAt",
        u.updated_at as "updatedAt",
        COALESCE(array_agg(r.name) FILTER (WHERE r.name IS NOT NULL), '{}') as roles,
        EXISTS(SELECT 1 FROM creator_profiles cp WHERE cp.user_id = u.id AND cp.is_approved = TRUE) as "isCreator"
      ${baseSql}
      ORDER BY u.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    params.push(limit, offset);
    const usersRes = await query(listSql, params);

    return NextResponse.json({
      success: true,
      data: {
        users: usersRes.rows,
        summary: {
          totalUsers,
          totalCreators,
          totalListeners,
          totalAdmins,
          verifiedUsers: parseInt(summaryRow.verifiedUsers, 10),
          activeUsers: parseInt(summaryRow.activeUsers, 10),
          suspendedUsers: parseInt(summaryRow.suspendedUsers, 10),
          newThisWeek: parseInt(summaryRow.newThisWeek, 10),
          newThisMonth: parseInt(summaryRow.newThisMonth, 10),
          googleUsers: parseInt(summaryRow.googleUsers, 10),
          passwordUsers: parseInt(summaryRow.passwordUsers, 10),
        },
        pagination: {
          total: usersRes.rows.length,
          limit,
          offset,
        },
      },
    });
  } catch (err: any) {
    console.error('Error fetching admin users:', err);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: err.message } },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/admin/users
 * Create a new user or administrator account
 */
export async function POST(req: NextRequest) {
  const { user: actor, errorResponse } = await authenticateAdmin(req);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const {
      email,
      password,
      fullName,
      username,
      phone,
      roles = ['USER'],
      status = 'ACTIVE',
      isVerified = false,
    } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Email, password, and full name are required.' } },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Password must be at least 6 characters long.' } },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username
      ? slugify(username.trim())
      : slugify(fullName.trim()) + Math.floor(100 + Math.random() * 900);

    // Check duplicate email or username
    const existing = await query(
      'SELECT id, email, username FROM users WHERE LOWER(email) = $1 OR LOWER(username) = $2',
      [cleanEmail, cleanUsername.toLowerCase()]
    );

    if (existing.rows.length > 0) {
      const match = existing.rows[0];
      const conflictField = match.email.toLowerCase() === cleanEmail ? 'email address' : 'username';
      return NextResponse.json(
        { success: false, error: { code: 'CONFLICT', message: `An account with this ${conflictField} already exists.` } },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const client = await getClient();

    try {
      await client.query('BEGIN');

      const userInsert = await client.query(
        `INSERT INTO users (email, password_hash, full_name, username, phone, auth_provider, is_verified, status)
         VALUES ($1, $2, $3, $4, $5, 'password', $6, $7)
         RETURNING id, email, full_name as "fullName", username, avatar_url as "avatarUrl", 
                   phone, auth_provider as "authProvider", is_verified as "isVerified", status, 
                   created_at as "createdAt", updated_at as "updatedAt"`,
        [cleanEmail, passwordHash, fullName.trim(), cleanUsername, phone ? phone.trim() : null, isVerified, status]
      );

      const createdUser = userInsert.rows[0];
      const newUserId = createdUser.id;

      // Fetch all roles from database
      const dbRolesRes = await client.query('SELECT id, name FROM roles');
      const roleMap = new Map<string, number>();
      dbRolesRes.rows.forEach((r: { id: number; name: string }) => {
        roleMap.set(r.name.toUpperCase(), r.id);
      });

      const assignedRoles: string[] = [];
      const rolesToAssign = Array.isArray(roles) && roles.length > 0 ? roles : ['USER'];

      for (const roleName of rolesToAssign) {
        const normalized = String(roleName).trim().toUpperCase();
        const roleId = roleMap.get(normalized);
        if (roleId) {
          await client.query(
            `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [newUserId, roleId]
          );
          assignedRoles.push(normalized);
        }
      }

      // If no valid role was assigned, default to USER (role_id 1)
      if (assignedRoles.length === 0 && roleMap.has('USER')) {
        await client.query(
          `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [newUserId, roleMap.get('USER')]
        );
        assignedRoles.push('USER');
      }

      // If role includes CREATOR, ensure basic creator profile exists
      if (assignedRoles.includes('CREATOR')) {
        await client.query(
          `INSERT INTO creator_profiles (user_id, stage_name, bio, city, state, primary_language_id, category, is_approved, verified_badge)
           VALUES ($1, $2, 'Talent5 Desi Creator Profile', 'Mumbai', 'Maharashtra', 1, 'SINGER', TRUE, $3)
           ON CONFLICT (user_id) DO UPDATE SET is_approved = TRUE, verified_badge = $3`,
          [newUserId, fullName.trim(), isVerified]
        );
      }

      await client.query('COMMIT');

      // Audit log
      await recordAuditLog({
        actorId: actor!.id,
        action: 'ADMIN_CREATE_USER',
        entityName: 'USER',
        entityId: newUserId,
        newState: {
          email: cleanEmail,
          fullName: fullName.trim(),
          username: cleanUsername,
          roles: assignedRoles,
          status,
          isVerified,
        },
      });

      return NextResponse.json(
        {
          success: true,
          message: `User account created successfully with roles: ${assignedRoles.join(', ')}`,
          data: {
            ...createdUser,
            roles: assignedRoles,
            isCreator: assignedRoles.includes('CREATOR'),
          },
        },
        { status: 201 }
      );
    } catch (txErr) {
      await client.query('ROLLBACK');
      throw txErr;
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('Error creating user by admin:', err);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: err.message || 'Failed to create user' } },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/admin/users
 * Update user profile, roles, verification, status, or reset user password
 */
export async function PATCH(req: NextRequest) {
  const { user: actor, errorResponse } = await authenticateAdmin(req);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const {
      userId,
      fullName,
      email,
      username,
      phone,
      status,
      isVerified,
      roles,
      newPassword,
      notes,
    } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'User ID is required' } },
        { status: 400 }
      );
    }

    // Fetch existing user
    const existing = await query(`SELECT * FROM users WHERE id = $1`, [userId]);
    if (existing.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }
    const oldUser = existing.rows[0];

    // Check unique email if changed
    if (email && email.trim().toLowerCase() !== oldUser.email.toLowerCase()) {
      const cleanEmail = email.trim().toLowerCase();
      const dup = await query('SELECT id FROM users WHERE LOWER(email) = $1 AND id != $2', [cleanEmail, userId]);
      if (dup.rows.length > 0) {
        return NextResponse.json(
          { success: false, error: { code: 'CONFLICT', message: 'An account with this email already exists.' } },
          { status: 409 }
        );
      }
    }

    // Check unique username if changed
    if (username && slugify(username.trim()).toLowerCase() !== oldUser.username.toLowerCase()) {
      const cleanUser = slugify(username.trim());
      const dup = await query('SELECT id FROM users WHERE LOWER(username) = $1 AND id != $2', [cleanUser.toLowerCase(), userId]);
      if (dup.rows.length > 0) {
        return NextResponse.json(
          { success: false, error: { code: 'CONFLICT', message: 'This username is already taken.' } },
          { status: 409 }
        );
      }
    }

    const client = await getClient();

    try {
      await client.query('BEGIN');

      const updates: string[] = ['updated_at = NOW()'];
      const params: any[] = [userId];

      if (fullName) {
        params.push(fullName.trim());
        updates.push(`full_name = $${params.length}`);
      }

      if (email) {
        params.push(email.trim().toLowerCase());
        updates.push(`email = $${params.length}`);
      }

      if (username) {
        params.push(slugify(username.trim()));
        updates.push(`username = $${params.length}`);
      }

      if (phone !== undefined) {
        params.push(phone ? phone.trim() : null);
        updates.push(`phone = $${params.length}`);
      }

      if (status && ['ACTIVE', 'SUSPENDED', 'DELETED'].includes(status)) {
        params.push(status);
        updates.push(`status = $${params.length}`);
      }

      if (typeof isVerified === 'boolean') {
        params.push(isVerified);
        updates.push(`is_verified = $${params.length}`);
      }

      let passwordChanged = false;
      if (newPassword) {
        if (newPassword.length < 6) {
          throw new Error('New password must be at least 6 characters long.');
        }
        const pwHash = await hashPassword(newPassword);
        params.push(pwHash);
        updates.push(`password_hash = $${params.length}`);
        passwordChanged = true;
      }

      const updateSql = `
        UPDATE users 
        SET ${updates.join(', ')} 
        WHERE id = $1 
        RETURNING id, email, full_name as "fullName", username, avatar_url as "avatarUrl", 
                  phone, auth_provider as "authProvider", is_verified as "isVerified", status, 
                  created_at as "createdAt", updated_at as "updatedAt"
      `;

      const updatedRes = await client.query(updateSql, params);
      const updatedUser = updatedRes.rows[0];

      // Update Roles if provided
      let currentRoles: string[] = [];
      if (Array.isArray(roles) && roles.length > 0) {
        const dbRolesRes = await client.query('SELECT id, name FROM roles');
        const roleMap = new Map<string, number>();
        dbRolesRes.rows.forEach((r: { id: number; name: string }) => {
          roleMap.set(r.name.toUpperCase(), r.id);
        });

        // Delete existing roles
        await client.query(`DELETE FROM user_roles WHERE user_id = $1`, [userId]);

        for (const roleName of roles) {
          const normalized = String(roleName).trim().toUpperCase();
          const roleId = roleMap.get(normalized);
          if (roleId) {
            await client.query(
              `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
              [userId, roleId]
            );
            currentRoles.push(normalized);
          }
        }

        // Creator profile sync
        if (currentRoles.includes('CREATOR')) {
          await client.query(
            `INSERT INTO creator_profiles (user_id, stage_name, bio, city, state, primary_language_id, category, is_approved, verified_badge)
             VALUES ($1, $2, 'Talent5 Desi Creator Profile', 'Mumbai', 'Maharashtra', 1, 'SINGER', TRUE, $3)
             ON CONFLICT (user_id) DO UPDATE SET is_approved = TRUE, verified_badge = $3`,
            [userId, updatedUser.fullName, updatedUser.isVerified]
          );
        }
      } else {
        // Fetch current roles if not updated
        const roleQuery = await client.query(
          `SELECT r.name FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = $1`,
          [userId]
        );
        currentRoles = roleQuery.rows.map((r: { name: string }) => r.name);
      }

      await client.query('COMMIT');

      // Audit log
      const auditAction = passwordChanged
        ? 'ADMIN_RESET_PASSWORD'
        : status && status !== oldUser.status
        ? `UPDATE_USER_STATUS_${status}`
        : 'ADMIN_UPDATE_USER';

      await recordAuditLog({
        actorId: actor!.id,
        action: auditAction,
        entityName: 'USER',
        entityId: userId,
        oldState: {
          fullName: oldUser.full_name,
          email: oldUser.email,
          username: oldUser.username,
          status: oldUser.status,
          isVerified: oldUser.is_verified,
        },
        newState: {
          fullName: updatedUser.fullName,
          email: updatedUser.email,
          username: updatedUser.username,
          status: updatedUser.status,
          isVerified: updatedUser.isVerified,
          roles: currentRoles,
          passwordChanged,
          notes,
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          ...updatedUser,
          roles: currentRoles,
          isCreator: currentRoles.includes('CREATOR'),
        },
        message: passwordChanged
          ? 'User password and credentials updated successfully.'
          : 'User updated successfully.',
      });
    } catch (txErr) {
      await client.query('ROLLBACK');
      throw txErr;
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('Error updating admin user:', err);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: err.message || 'Failed to update user' } },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/admin/users
 * Delete user or administrator account (Soft or Permanent)
 */
export async function DELETE(req: NextRequest) {
  const { user: actor, errorResponse } = await authenticateAdmin(req);
  if (errorResponse) return errorResponse;

  try {
    let userId = req.nextUrl.searchParams.get('userId');
    let permanent = req.nextUrl.searchParams.get('permanent') !== 'false';

    if (!userId) {
      try {
        const body = await req.json();
        userId = body.userId;
        if (typeof body.permanent === 'boolean') {
          permanent = body.permanent;
        }
      } catch {
        // no body
      }
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'User ID is required for deletion.' } },
        { status: 400 }
      );
    }

    // Safety: Admin cannot delete their own account
    if (userId === actor!.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Security policy violation: You cannot delete your currently authenticated administrator account.',
          },
        },
        { status: 400 }
      );
    }

    // Check user exists
    const targetRes = await query('SELECT id, email, full_name, username, status FROM users WHERE id = $1', [userId]);
    if (targetRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'User account not found.' } },
        { status: 404 }
      );
    }
    const targetUser = targetRes.rows[0];

    if (!permanent) {
      // Soft Delete
      await query(
        `UPDATE users SET status = 'DELETED', updated_at = NOW() WHERE id = $1`,
        [userId]
      );

      await recordAuditLog({
        actorId: actor!.id,
        action: 'ADMIN_SOFT_DELETE_USER',
        entityName: 'USER',
        entityId: userId,
        oldState: { status: targetUser.status },
        newState: { status: 'DELETED' },
      });

      return NextResponse.json({
        success: true,
        message: `User ${targetUser.email} has been deactivated and marked as DELETED.`,
      });
    }

    // Permanent hard delete
    const client = await getClient();
    try {
      await client.query('BEGIN');

      // 1. Safely nullify non-cascading foreign keys
      await client.query('UPDATE creator_applications SET reviewed_by = NULL WHERE reviewed_by = $1', [userId]);
      await client.query('UPDATE content_submissions SET reviewed_by = NULL WHERE reviewed_by = $1', [userId]);
      await client.query('UPDATE rights_records SET reviewer_id = NULL WHERE reviewer_id = $1', [userId]);
      await client.query('UPDATE payout_requests SET reviewed_by = NULL WHERE reviewed_by = $1', [userId]);
      await client.query('UPDATE reports SET resolved_by = NULL WHERE resolved_by = $1', [userId]);
      await client.query('UPDATE audit_logs SET actor_id = NULL WHERE actor_id = $1', [userId]);
      await client.query('UPDATE fraud_events SET user_id = NULL WHERE user_id = $1', [userId]);
      await client.query('UPDATE song_plays SET user_id = NULL WHERE user_id = $1', [userId]);
      await client.query('UPDATE artists SET user_id = NULL WHERE user_id = $1', [userId]);

      // 2. Cascade delete will handle user_roles, creator_profiles, creator_applications, likes, playlists, etc.
      await client.query('DELETE FROM users WHERE id = $1', [userId]);

      await client.query('COMMIT');

      // Audit log
      await recordAuditLog({
        actorId: actor!.id,
        action: 'ADMIN_PERMANENT_DELETE_USER',
        entityName: 'USER',
        entityId: userId,
        oldState: {
          email: targetUser.email,
          fullName: targetUser.full_name,
          username: targetUser.username,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Account (${targetUser.email}) and associated credentials have been permanently deleted from database.`,
      });
    } catch (txErr) {
      await client.query('ROLLBACK');
      throw txErr;
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('Error deleting user by admin:', err);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: err.message || 'Failed to delete user' } },
      { status: 500 }
    );
  }
}
