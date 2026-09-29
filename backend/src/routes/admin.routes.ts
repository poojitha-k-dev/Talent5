import { Router, Request, Response } from 'express';
import { query, getClient } from '../lib/db';
import { authenticateAdmin, recordAuditLog } from '../lib/admin';
import { hashPassword, slugify } from '@talent5/utils';
import { runAuditionInspection } from '../lib/auditionModel';

const router = Router();

// Apply admin authentication to all routes in this router
router.use(authenticateAdmin);

// ==========================================
// 1. STATS & TELEMETRY
// ==========================================
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const [
      usersCount,
      creatorsCount,
      pendingApps,
      pendingSubmissions,
      rightsVerified,
      rightsExpired,
      payoutLiability,
      payoutPendingCount,
      fraudEventsHigh,
      engagementStats,
      recentAuditLogs,
      userMetricsRes,
      recentSignupsRes,
    ] = await Promise.all([
      query(`SELECT COUNT(*) as count FROM users WHERE status = 'ACTIVE'`),
      query(`SELECT COUNT(*) as count FROM creator_profiles WHERE is_approved = TRUE`),
      query(`SELECT COUNT(*) as count FROM creator_applications WHERE status IN ('PENDING', 'UNDER_REVIEW')`),
      query(`SELECT COUNT(*) as count FROM content_submissions WHERE status IN ('SUBMITTED', 'UNDER_REVIEW')`),
      query(`SELECT COUNT(*) as count FROM rights_records WHERE status = 'VERIFIED'`),
      query(`SELECT COUNT(*) as count FROM rights_records WHERE status IN ('EXPIRED', 'RESTRICTED')`),
      query(`SELECT COALESCE(SUM(amount_inr), 0) as total FROM payout_requests WHERE status IN ('REQUESTED', 'UNDER_REVIEW')`),
      query(`SELECT COUNT(*) as count FROM payout_requests WHERE status IN ('REQUESTED', 'UNDER_REVIEW')`),
      query(`SELECT COUNT(*) as count FROM fraud_events WHERE risk_score = 'HIGH'`),
      query(`SELECT COALESCE(SUM(play_count), 0) as plays, COALESCE(SUM(valid_likes_count), 0) as likes FROM songs`),
      query(`
        SELECT a.id, a.action, a.entity_name as "entityName", a.entity_id as "entityId", 
               a.created_at as "createdAt", u.email as "actorEmail", u.full_name as "actorName"
        FROM audit_logs a
        LEFT JOIN users u ON a.actor_id = u.id
        ORDER BY a.created_at DESC
        LIMIT 8
      `),
      query(`
        SELECT
          COUNT(*) as "totalUsers",
          COUNT(*) FILTER (WHERE u.is_verified = TRUE) as "verifiedUsers",
          COUNT(*) FILTER (WHERE u.created_at >= NOW() - INTERVAL '7 days') as "newThisWeek",
          COUNT(*) FILTER (WHERE u.created_at >= NOW() - INTERVAL '30 days') as "newThisMonth",
          COUNT(DISTINCT cp.user_id) FILTER (WHERE cp.is_approved = TRUE) as "totalCreators"
        FROM users u
        LEFT JOIN creator_profiles cp ON u.id = cp.user_id
      `),
      query(`
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
          COALESCE(array_agg(r.name) FILTER (WHERE r.name IS NOT NULL), '{}') as roles,
          EXISTS(SELECT 1 FROM creator_profiles cp WHERE cp.user_id = u.id AND cp.is_approved = TRUE) as "isCreator"
        FROM users u
        LEFT JOIN user_roles ur ON u.id = ur.user_id
        LEFT JOIN roles r ON ur.role_id = r.id
        GROUP BY u.id
        ORDER BY u.created_at DESC
        LIMIT 15
      `),
    ]);

    const userMetrics = userMetricsRes.rows[0];
    const totalUsersCount = parseInt(userMetrics.totalUsers, 10);
    const totalCreatorsCount = parseInt(userMetrics.totalCreators, 10);

    return res.status(200).json({
      success: true,
      data: {
        totalUsers: parseInt(usersCount.rows[0].count, 10),
        totalCreators: parseInt(creatorsCount.rows[0].count, 10),
        pendingApplications: parseInt(pendingApps.rows[0].count, 10),
        pendingSubmissions: parseInt(pendingSubmissions.rows[0].count, 10),
        rightsVerified: parseInt(rightsVerified.rows[0].count, 10),
        rightsExpired: parseInt(rightsExpired.rows[0].count, 10),
        pendingPayoutLiabilityINR: parseFloat(payoutLiability.rows[0].total),
        pendingPayoutRequestsCount: parseInt(payoutPendingCount.rows[0].count, 10),
        highRiskFraudEvents: parseInt(fraudEventsHigh.rows[0].count, 10),
        totalPlays: parseInt(engagementStats.rows[0].plays, 10),
        totalValidLikes: parseInt(engagementStats.rows[0].likes, 10),
        recentAuditLogs: recentAuditLogs.rows,
        userBreakdown: {
          totalUsers: totalUsersCount,
          totalCreators: totalCreatorsCount,
          totalListeners: Math.max(0, totalUsersCount - totalCreatorsCount),
          verifiedUsers: parseInt(userMetrics.verifiedUsers, 10),
          newThisWeek: parseInt(userMetrics.newThisWeek, 10),
          newThisMonth: parseInt(userMetrics.newThisMonth, 10),
        },
        recentSignups: recentSignupsRes.rows,
      },
    });
  } catch (err: any) {
    console.error('Stats error:', err);
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// ==========================================
// 2. USERS MANAGEMENT
// ==========================================
router.get('/users', async (req: Request, res: Response) => {
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  const role = typeof req.query.role === 'string' ? req.query.role.toUpperCase() : 'ALL';
  const status = typeof req.query.status === 'string' ? req.query.status.toUpperCase() : 'ALL';
  const limit = Math.min(Math.max(parseInt((req.query.limit as string) || '50', 10), 1), 100);
  const offset = Math.max(parseInt((req.query.offset as string) || '0', 10), 0);

  try {
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

    const adminCountRes = await query(`
      SELECT COUNT(DISTINCT user_id) as count 
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE r.name IN ('ADMIN', 'SUPER_ADMIN', 'FINANCE', 'MODERATOR')
    `);
    const totalAdmins = parseInt(adminCountRes.rows[0].count, 10);
    const totalListeners = Math.max(0, totalUsers - totalCreators - totalAdmins);

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
    } else if (role === 'ADMIN' || role === 'ADMINS' || role === 'STAFF') {
      roleFilterClause = `HAVING ('ADMIN' = ANY(COALESCE(array_agg(r.name) FILTER (WHERE r.name IS NOT NULL), '{}')) OR 'SUPER_ADMIN' = ANY(COALESCE(array_agg(r.name) FILTER (WHERE r.name IS NOT NULL), '{}')) OR 'MODERATOR' = ANY(COALESCE(array_agg(r.name) FILTER (WHERE r.name IS NOT NULL), '{}')) OR 'FINANCE' = ANY(COALESCE(array_agg(r.name) FILTER (WHERE r.name IS NOT NULL), '{}')))`;
    } else if (role === 'USER' || role === 'USERS' || role === 'NORMAL' || role === 'WEBSITE_USERS') {
      roleFilterClause = `HAVING NOT ('ADMIN' = ANY(COALESCE(array_agg(r.name) FILTER (WHERE r.name IS NOT NULL), '{}')) OR 'SUPER_ADMIN' = ANY(COALESCE(array_agg(r.name) FILTER (WHERE r.name IS NOT NULL), '{}')) OR 'MODERATOR' = ANY(COALESCE(array_agg(r.name) FILTER (WHERE r.name IS NOT NULL), '{}')) OR 'FINANCE' = ANY(COALESCE(array_agg(r.name) FILTER (WHERE r.name IS NOT NULL), '{}')))`;
    } else if (role === 'LISTENER') {
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

    return res.status(200).json({
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
    console.error('Admin users error:', err);
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// POST /api/v1/admin/users
router.post('/users', async (req: Request, res: Response) => {
  const actor = (req as any).user;
  try {
    const { email, password, fullName, username, phone, roles = ['USER'], status = 'ACTIVE', isVerified = false } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Email, password, and full name are required.' } });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Password must be at least 6 characters long.' } });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username ? slugify(username.trim()) : slugify(fullName.trim()) + Math.floor(100 + Math.random() * 900);

    const existing = await query('SELECT id FROM users WHERE LOWER(email) = $1 OR LOWER(username) = $2', [cleanEmail, cleanUsername.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, error: { code: 'CONFLICT', message: 'An account with this email or username already exists.' } });
    }

    const passwordHash = await hashPassword(password);
    const client = await getClient();

    try {
      await client.query('BEGIN');

      const userInsert = await client.query(
        `INSERT INTO users (email, password_hash, full_name, username, phone, auth_provider, is_verified, status)
         VALUES ($1, $2, $3, $4, $5, 'password', $6, $7)
         RETURNING id, email, full_name as "fullName", username, avatar_url as "avatarUrl", phone, auth_provider as "authProvider", is_verified as "isVerified", status, created_at as "createdAt", updated_at as "updatedAt"`,
        [cleanEmail, passwordHash, fullName.trim(), cleanUsername, phone ? phone.trim() : null, isVerified, status]
      );

      const createdUser = userInsert.rows[0];
      const newUserId = createdUser.id;

      const dbRolesRes = await client.query('SELECT id, name FROM roles');
      const roleMap = new Map<string, number>();
      dbRolesRes.rows.forEach((r: { id: number; name: string }) => roleMap.set(r.name.toUpperCase(), r.id));

      const assignedRoles: string[] = [];
      const rolesToAssign = Array.isArray(roles) && roles.length > 0 ? roles : ['USER'];

      for (const roleName of rolesToAssign) {
        const normalized = String(roleName).trim().toUpperCase();
        const roleId = roleMap.get(normalized);
        if (roleId) {
          await client.query(`INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [newUserId, roleId]);
          assignedRoles.push(normalized);
        }
      }

      if (assignedRoles.length === 0 && roleMap.has('USER')) {
        await client.query(`INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [newUserId, roleMap.get('USER')]);
        assignedRoles.push('USER');
      }

      if (assignedRoles.includes('CREATOR')) {
        await client.query(
          `INSERT INTO creator_profiles (user_id, stage_name, bio, city, state, primary_language_id, category, is_approved, verified_badge)
           VALUES ($1, $2, 'Talent5 Desi Creator Profile', 'Mumbai', 'Maharashtra', 1, 'SINGER', TRUE, $3)
           ON CONFLICT (user_id) DO UPDATE SET is_approved = TRUE, verified_badge = $3`,
          [newUserId, fullName.trim(), isVerified]
        );
      }

      await client.query('COMMIT');

      await recordAuditLog({
        actorId: actor.id,
        action: 'ADMIN_CREATE_USER',
        entityName: 'USER',
        entityId: newUserId,
        newState: { email: cleanEmail, fullName: fullName.trim(), username: cleanUsername, roles: assignedRoles, status, isVerified },
      });

      return res.status(201).json({
        success: true,
        message: `User created successfully with roles: ${assignedRoles.join(', ')}`,
        data: { ...createdUser, roles: assignedRoles, isCreator: assignedRoles.includes('CREATOR') },
      });
    } catch (txErr) {
      await client.query('ROLLBACK');
      throw txErr;
    } finally {
      client.release();
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// PATCH /api/v1/admin/users
router.patch('/users', async (req: Request, res: Response) => {
  const actor = (req as any).user;
  try {
    const { userId, fullName, email, username, phone, status, isVerified, roles, newPassword, notes } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'User ID is required' } });
    }

    const existing = await query(`SELECT * FROM users WHERE id = $1`, [userId]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
    }
    const oldUser = existing.rows[0];

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
        if (newPassword.length < 6) throw new Error('New password must be at least 6 characters long.');
        const pwHash = await hashPassword(newPassword);
        params.push(pwHash);
        updates.push(`password_hash = $${params.length}`);
        passwordChanged = true;
      }

      const updateSql = `
        UPDATE users 
        SET ${updates.join(', ')} 
        WHERE id = $1 
        RETURNING id, email, full_name as "fullName", username, avatar_url as "avatarUrl", phone, auth_provider as "authProvider", is_verified as "isVerified", status, created_at as "createdAt", updated_at as "updatedAt"
      `;

      const updatedRes = await client.query(updateSql, params);
      const updatedUser = updatedRes.rows[0];

      let currentRoles: string[] = [];
      if (Array.isArray(roles) && roles.length > 0) {
        const dbRolesRes = await client.query('SELECT id, name FROM roles');
        const roleMap = new Map<string, number>();
        dbRolesRes.rows.forEach((r: { id: number; name: string }) => roleMap.set(r.name.toUpperCase(), r.id));

        await client.query(`DELETE FROM user_roles WHERE user_id = $1`, [userId]);

        for (const roleName of roles) {
          const normalized = String(roleName).trim().toUpperCase();
          const roleId = roleMap.get(normalized);
          if (roleId) {
            await client.query(`INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [userId, roleId]);
            currentRoles.push(normalized);
          }
        }
      } else {
        const roleQuery = await client.query(`SELECT r.name FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = $1`, [userId]);
        currentRoles = roleQuery.rows.map((r: { name: string }) => r.name);
      }

      await client.query('COMMIT');

      await recordAuditLog({
        actorId: actor.id,
        action: passwordChanged ? 'ADMIN_RESET_PASSWORD' : 'ADMIN_UPDATE_USER',
        entityName: 'USER',
        entityId: userId,
        oldState: { status: oldUser.status, isVerified: oldUser.is_verified },
        newState: { status: updatedUser.status, isVerified: updatedUser.isVerified, roles: currentRoles, passwordChanged, notes },
      });

      return res.status(200).json({
        success: true,
        data: { ...updatedUser, roles: currentRoles, isCreator: currentRoles.includes('CREATOR') },
        message: passwordChanged ? 'User password updated successfully.' : 'User updated successfully.',
      });
    } catch (txErr) {
      await client.query('ROLLBACK');
      throw txErr;
    } finally {
      client.release();
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// DELETE /api/v1/admin/users
router.delete('/users', async (req: Request, res: Response) => {
  const actor = (req as any).user;
  try {
    const userId = (req.query.userId as string) || req.body?.userId;
    const permanent = req.query.permanent !== 'false' && req.body?.permanent !== false;

    if (!userId) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'User ID is required' } });
    }

    if (userId === actor.id) {
      return res.status(400).json({ success: false, error: { code: 'FORBIDDEN', message: 'Security restriction: You cannot delete your currently authenticated administrator account.' } });
    }

    const targetRes = await query('SELECT id, email, full_name, username, status FROM users WHERE id = $1', [userId]);
    if (targetRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
    }
    const targetUser = targetRes.rows[0];

    if (!permanent) {
      await query(`UPDATE users SET status = 'DELETED', updated_at = NOW() WHERE id = $1`, [userId]);
      return res.status(200).json({ success: true, message: `User ${targetUser.email} deactivated.` });
    }

    const client = await getClient();
    try {
      await client.query('BEGIN');
      await client.query('UPDATE creator_applications SET reviewed_by = NULL WHERE reviewed_by = $1', [userId]);
      await client.query('UPDATE content_submissions SET reviewed_by = NULL WHERE reviewed_by = $1', [userId]);
      await client.query('UPDATE rights_records SET reviewer_id = NULL WHERE reviewer_id = $1', [userId]);
      await client.query('UPDATE payout_requests SET reviewed_by = NULL WHERE reviewed_by = $1', [userId]);
      await client.query('UPDATE reports SET resolved_by = NULL WHERE resolved_by = $1', [userId]);
      await client.query('UPDATE audit_logs SET actor_id = NULL WHERE actor_id = $1', [userId]);
      await client.query('UPDATE fraud_events SET user_id = NULL WHERE user_id = $1', [userId]);
      await client.query('UPDATE song_plays SET user_id = NULL WHERE user_id = $1', [userId]);
      await client.query('UPDATE artists SET user_id = NULL WHERE user_id = $1', [userId]);
      await client.query('DELETE FROM users WHERE id = $1', [userId]);
      await client.query('COMMIT');

      await recordAuditLog({
        actorId: actor.id,
        action: 'ADMIN_PERMANENT_DELETE_USER',
        entityName: 'USER',
        entityId: userId,
        oldState: { email: targetUser.email, fullName: targetUser.full_name },
      });

      return res.status(200).json({ success: true, message: `Account (${targetUser.email}) permanently deleted.` });
    } catch (txErr) {
      await client.query('ROLLBACK');
      throw txErr;
    } finally {
      client.release();
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// GET /api/v1/admin/users/:id
router.get('/users/:id', async (req: Request, res: Response) => {
  try {
    const userRes = await query(`
      SELECT u.id, u.email, u.full_name as "fullName", u.username, u.avatar_url as "avatarUrl", 
             u.phone, u.auth_provider as "authProvider", u.is_verified as "isVerified", u.status, 
             u.created_at as "createdAt", u.updated_at as "updatedAt",
             COALESCE(array_agg(r.name) FILTER (WHERE r.name IS NOT NULL), '{}') as roles,
             EXISTS(SELECT 1 FROM creator_profiles cp WHERE cp.user_id = u.id AND cp.is_approved = TRUE) as "isCreator"
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.id = $1
      GROUP BY u.id
    `, [req.params.id]);

    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
    }
    return res.status(200).json({ success: true, data: userRes.rows[0] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// Single user PATCH /api/v1/admin/users/:id
router.patch('/users/:id', async (req: Request, res: Response) => {
  req.body.userId = req.params.id;
  // Delegate to PATCH /users
  const fakeReq = { ...req, body: { ...req.body, userId: req.params.id } };
  return (router as any).handle(fakeReq, res);
});

// Single user DELETE /api/v1/admin/users/:id
router.delete('/users/:id', async (req: Request, res: Response) => {
  req.query.userId = req.params.id;
  const fakeReq = { ...req, query: { ...req.query, userId: req.params.id } };
  return (router as any).handle(fakeReq, res);
});

// ==========================================
// 3. SETTINGS
// ==========================================
router.get('/settings', async (_req: Request, res: Response) => {
  try {
    const settingsRes = await query('SELECT key, value, description FROM system_settings');
    const settingsMap: Record<string, any> = {};
    settingsRes.rows.forEach((row: any) => {
      settingsMap[row.key] = typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
    });
    return res.status(200).json({ success: true, data: settingsMap });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

router.post('/settings', async (req: Request, res: Response) => {
  try {
    const { settings } = req.body;
    for (const [key, val] of Object.entries(settings)) {
      await query(
        `INSERT INTO system_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
        [key, JSON.stringify(val)]
      );
    }
    return res.status(200).json({ success: true, message: 'Settings saved' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// ==========================================
// 4. RIGHTS, PAYOUTS, FRAUD, AUDIT LOGS, AUDITIONS
// ==========================================
router.get('/rights', async (_req: Request, res: Response) => {
  try {
    const r = await query(`
      SELECT rr.*, s.title as "songTitle", s.audio_url as "audioUrl", u.email as "creatorEmail", u.full_name as "creatorName"
      FROM rights_records rr
      JOIN songs s ON rr.song_id = s.id
      JOIN users u ON rr.creator_id = u.id
      ORDER BY rr.created_at DESC
      LIMIT 100
    `);
    return res.status(200).json({ success: true, data: r.rows });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

router.patch('/rights/:id', async (req: Request, res: Response) => {
  const actor = (req as any).user;
  try {
    const { status, notes } = req.body;
    await query(`UPDATE rights_records SET status = $1, reviewer_id = $2, review_notes = $3, updated_at = NOW() WHERE id = $4`, [status, actor.id, notes, req.params.id]);
    return res.status(200).json({ success: true, message: 'Rights record updated' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

router.get('/payouts', async (_req: Request, res: Response) => {
  try {
    const r = await query(`
      SELECT p.*, u.email, u.full_name as "creatorName"
      FROM payout_requests p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
      LIMIT 100
    `);
    return res.status(200).json({ success: true, data: r.rows });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

router.patch('/payouts/:id', async (req: Request, res: Response) => {
  const actor = (req as any).user;
  try {
    const { status, referenceId, notes } = req.body;
    await query(`UPDATE payout_requests SET status = $1, transaction_reference = $2, reviewed_by = $3, review_notes = $4, processed_at = NOW() WHERE id = $5`, [status, referenceId, actor.id, notes, req.params.id]);
    return res.status(200).json({ success: true, message: 'Payout updated' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

router.get('/fraud', async (_req: Request, res: Response) => {
  try {
    const r = await query(`SELECT f.*, u.email, u.full_name as "userName" FROM fraud_events f LEFT JOIN users u ON f.user_id = u.id ORDER BY f.created_at DESC LIMIT 100`);
    return res.status(200).json({ success: true, data: r.rows });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

router.get('/audit-logs', async (_req: Request, res: Response) => {
  try {
    const r = await query(`SELECT a.*, u.email as "actorEmail", u.full_name as "actorName" FROM audit_logs a LEFT JOIN users u ON a.actor_id = u.id ORDER BY a.created_at DESC LIMIT 200`);
    return res.status(200).json({ success: true, data: r.rows });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

router.get('/applications', async (req: Request, res: Response) => {
  try {
    const { status, category, search, risk } = req.query;
    let sql = `
      SELECT 
        ca.id,
        ca.user_id as "userId",
        ca.full_name as "fullName",
        ca.stage_name as "stageName",
        ca.bio,
        ca.city,
        ca.state,
        ca.languages,
        ca.category,
        ca.genres,
        ca.experience,
        ca.social_links as "socialLinks",
        ca.portfolio_url as "portfolioUrl",
        ca.sample_performance_url as "samplePerformanceUrl",
        ca.original_composition_info as "originalCompositionInfo",
        ca.ownership_declaration as "ownershipDeclaration",
        ca.copyright_declaration as "copyrightDeclaration",
        ca.status,
        ca.reviewed_by as "reviewedBy",
        ca.review_notes as "reviewNotes",
        ca.created_at as "createdAt",
        ca.ai_moderation_report as "aiModerationReport",
        ca.ai_safety_score as "aiSafetyScore",
        ca.ai_recommendation as "aiRecommendation",
        ca.creation_intent as "creationIntent",
        ca.performed_song_reference as "performedSongReference",
        ca.plagiarism_risk_level as "plagiarismRiskLevel",
        ca.matched_song_title as "matchedSongTitle",
        ca.matched_song_artist as "matchedSongArtist",
        ca.similarity_percentage as "similarityPercentage",
        ca.plagiarism_details as "plagiarismDetails",
        u.email as "userEmail",
        u.phone as "userPhone"
      FROM creator_applications ca
      LEFT JOIN users u ON ca.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];
    if (status && status !== 'ALL') {
      params.push(status);
      sql += ` AND ca.status = $${params.length}`;
    }
    if (category && category !== 'ALL') {
      params.push(category);
      sql += ` AND ca.category = $${params.length}`;
    }
    const intent = typeof req.query.intent === 'string' ? req.query.intent.toUpperCase() : 'ALL';
    if (intent && intent !== 'ALL') {
      params.push(intent);
      sql += ` AND ca.creation_intent = $${params.length}`;
    }
    const riskLevel = typeof risk === 'string' ? risk.toUpperCase() : 'ALL';
    if (riskLevel && riskLevel !== 'ALL') {
      params.push(riskLevel);
      sql += ` AND ca.plagiarism_risk_level = $${params.length}`;
    }
    if (search && String(search).trim()) {
      params.push(`%${String(search).trim()}%`);
      sql += ` AND (ca.stage_name ILIKE $${params.length} OR ca.full_name ILIKE $${params.length} OR ca.city ILIKE $${params.length} OR ca.matched_song_title ILIKE $${params.length})`;
    }
    sql += ` ORDER BY ca.created_at DESC LIMIT 100`;

    const [r, countsRes] = await Promise.all([
      query(sql, params),
      query(`
        SELECT 
          COUNT(*)::int as total,
          COUNT(*) FILTER (WHERE status = 'PENDING')::int as pending,
          COUNT(*) FILTER (WHERE status = 'UNDER_REVIEW')::int as under_review,
          COUNT(*) FILTER (WHERE status = 'APPROVED')::int as approved,
          COUNT(*) FILTER (WHERE status = 'REJECTED')::int as rejected,
          COUNT(*) FILTER (WHERE creation_intent = 'ORIGINAL_CREATION')::int as original_creation,
          COUNT(*) FILTER (WHERE creation_intent = 'VOCAL_SHOWCASE')::int as vocal_showcase,
          COUNT(*) FILTER (WHERE plagiarism_risk_level = 'HIGH_PLAGIARISM_ALERT')::int as high_plagiarism
        FROM creator_applications
      `).catch(() => ({ rows: [{ total: 0, pending: 0, under_review: 0, approved: 0, rejected: 0, original_creation: 0, vocal_showcase: 0, high_plagiarism: 0 }] })),
    ]);

    const countsRow = countsRes.rows[0] || {};
    const counts = {
      total: Number(countsRow.total || 0),
      pending: Number(countsRow.pending || 0),
      underReview: Number(countsRow.under_review || 0),
      approved: Number(countsRow.approved || 0),
      rejected: Number(countsRow.rejected || 0),
      originalCreation: Number(countsRow.original_creation || 0),
      vocalShowcase: Number(countsRow.vocal_showcase || 0),
      highPlagiarism: Number(countsRow.high_plagiarism || 0),
    };

    return res.status(200).json({ success: true, data: r.rows, counts });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

router.post('/applications/:id/scan', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const appRes = await query(`SELECT * FROM creator_applications WHERE id = $1`, [id]);
    if (appRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Application not found' } });
    }
    const app = appRes.rows[0];

    const report = await runAuditionInspection({
      id: app.id,
      fullName: app.full_name,
      stageName: app.stage_name,
      bio: app.bio,
      city: app.city,
      state: app.state,
      languages: app.languages,
      category: app.category,
      genres: app.genres,
      experience: app.experience,
      samplePerformanceUrl: app.sample_performance_url,
      portfolioUrl: app.portfolio_url,
      originalCompositionInfo: app.original_composition_info,
      ownershipDeclaration: app.ownership_declaration,
      copyrightDeclaration: app.copyright_declaration,
      creationIntent: app.creation_intent,
      performedSongReference: app.performed_song_reference,
    });

    await query(
      `UPDATE creator_applications 
       SET ai_moderation_report = $1,
           ai_safety_score = $2,
           ai_recommendation = $3,
           plagiarism_risk_level = $4,
           matched_song_title = $5,
           matched_song_artist = $6,
           similarity_percentage = $7,
           plagiarism_details = $8
       WHERE id = $9`,
      [
        JSON.stringify(report),
        report.safetyScore,
        report.recommendation,
        report.plagiarismReport.plagiarismRiskLevel,
        report.plagiarismReport.matchedSongTitle,
        report.plagiarismReport.matchedSongArtist,
        report.plagiarismReport.similarityPercentage,
        JSON.stringify(report.plagiarismReport),
        id,
      ]
    );

    return res.status(200).json({
      success: true,
      message: 'AI Audition & Plagiarism Inspection completed',
      data: {
        aiModerationReport: report,
        aiSafetyScore: report.safetyScore,
        aiRecommendation: report.recommendation,
        plagiarismReport: report.plagiarismReport,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

router.patch('/applications/:id', async (req: Request, res: Response) => {
  const actor = (req as any).user;
  try {
    const { id } = req.params;
    const action = (req.body.action || req.body.status || '').toUpperCase();
    const notes = req.body.notes || '';

    let newStatus = 'UNDER_REVIEW';
    if (action === 'APPROVE' || action === 'APPROVED') newStatus = 'APPROVED';
    else if (action === 'REJECT' || action === 'REJECTED') newStatus = 'REJECTED';
    else if (action === 'UNDER_REVIEW') newStatus = 'UNDER_REVIEW';
    else if (action === 'SUSPEND' || action === 'SUSPENDED') newStatus = 'SUSPENDED';

    const client = await getClient();
    try {
      await client.query('BEGIN');

      const appRes = await client.query(`SELECT * FROM creator_applications WHERE id = $1`, [id]);
      if (appRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Application not found' } });
      }
      const app = appRes.rows[0];

      await client.query(
        `UPDATE creator_applications 
         SET status = $1, reviewed_by = $2, review_notes = $3 
         WHERE id = $4`,
        [newStatus, actor.id, notes, id]
      );

      // If approved, provision creator profile and assign CREATOR role
      if (newStatus === 'APPROVED') {
        const creatorRoleIdRes = await client.query(`SELECT id FROM roles WHERE name = 'CREATOR'`);
        if (creatorRoleIdRes.rows.length > 0) {
          await client.query(
            `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [app.user_id, creatorRoleIdRes.rows[0].id]
          );
        }

        // Provision or update creator profile
        await client.query(
          `INSERT INTO creator_profiles (user_id, stage_name, bio, city, state, category, is_approved, verified_badge)
           VALUES ($1, $2, $3, $4, $5, $6, TRUE, TRUE)
           ON CONFLICT (user_id) DO UPDATE SET 
             stage_name = EXCLUDED.stage_name,
             bio = EXCLUDED.bio,
             city = EXCLUDED.city,
             state = EXCLUDED.state,
             category = EXCLUDED.category,
             is_approved = TRUE,
             verified_badge = TRUE`,
          [
            app.user_id,
            app.stage_name || app.full_name,
            app.bio || 'Verified Talent5 Desi Music Creator',
            app.city || 'Mumbai',
            app.state || 'Maharashtra',
            app.category || 'SINGER',
          ]
        );
      }

      await client.query('COMMIT');

      await recordAuditLog({
        actorId: actor.id,
        action: `ADMIN_${newStatus}_CREATOR_APPLICATION`,
        entityName: 'CREATOR_APPLICATION',
        entityId: id,
        newState: { status: newStatus, reviewNotes: notes, applicantId: app.user_id },
      });

      return res.status(200).json({
        success: true,
        message: `Application ${newStatus.toLowerCase()} successfully`,
        data: { status: newStatus },
      });
    } catch (txErr) {
      await client.query('ROLLBACK');
      throw txErr;
    } finally {
      client.release();
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

router.get('/content-review', async (_req: Request, res: Response) => {
  try {
    const r = await query(`SELECT cs.*, u.email, u.full_name as "creatorName" FROM content_submissions cs JOIN users u ON cs.user_id = u.id ORDER BY cs.created_at DESC LIMIT 100`);
    return res.status(200).json({ success: true, data: r.rows });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

router.patch('/content-review/:id', async (req: Request, res: Response) => {
  const actor = (req as any).user;
  try {
    const { status, notes } = req.body;
    await query(`UPDATE content_submissions SET status = $1, reviewed_by = $2, review_notes = $3 WHERE id = $4`, [status, actor.id, notes, req.params.id]);
    return res.status(200).json({ success: true, message: 'Content review updated' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

export default router;
