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
    const [eventsRes, suspiciousLikesRes, countsRes] = await Promise.all([
      query(`
        SELECT f.id, f.user_id as "userId", f.event_type as "eventType", f.risk_score as "riskScore",
               f.evidence, f.action_taken as "actionTaken", f.created_at as "createdAt",
               u.email as "userEmail", u.full_name as "userName"
        FROM fraud_events f
        LEFT JOIN users u ON f.user_id = u.id
        ORDER BY f.created_at DESC
        LIMIT 100
      `),
      query(`
        SELECT l.id, l.user_id as "userId", l.target_type as "targetType", 
               l.target_id as "targetId", l.status,
               COALESCE(l.risk_score, CASE WHEN l.status = 'INVALID' THEN 'HIGH' WHEN l.status = 'SUSPICIOUS' THEN 'MEDIUM' ELSE 'LOW' END) as "riskScore",
               l.ip_hash as "ipHash", l.device_fingerprint as "deviceFingerprint",
               l.user_agent as "userAgent",
               l.created_at as "createdAt",
               u.email as "userEmail", u.username
        FROM likes l
        LEFT JOIN users u ON l.user_id = u.id
        WHERE l.status IN ('SUSPICIOUS', 'INVALID')
        ORDER BY l.created_at DESC
        LIMIT 100
      `).catch(() => ({ rows: [] })),
      query(`
        SELECT 
          COUNT(*) FILTER (WHERE risk_score = 'HIGH' AND action_taken != 'RESOLVED')::int as high,
          COUNT(*) FILTER (WHERE risk_score = 'MEDIUM' AND action_taken != 'RESOLVED')::int as medium,
          COUNT(*) FILTER (WHERE risk_score = 'LOW' AND action_taken != 'RESOLVED')::int as low,
          COUNT(*) FILTER (WHERE action_taken = 'RESOLVED')::int as resolved,
          COUNT(*)::int as total
        FROM fraud_events
      `).catch(() => ({ rows: [{ high: 0, medium: 0, low: 0, resolved: 0, total: 0 }] })),
    ]);

    const countsRow = countsRes.rows[0] || {};
    const riskDistribution = {
      HIGH: Number(countsRow.high || 0),
      MEDIUM: Number(countsRow.medium || 0),
      LOW: Number(countsRow.low || 0),
      RESOLVED: Number(countsRow.resolved || 0),
      TOTAL: Number(countsRow.total || 0),
    };

    return res.status(200).json({
      success: true,
      data: {
        events: eventsRes.rows,
        suspiciousLikes: suspiciousLikesRes.rows,
        riskDistribution,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

router.post('/fraud/action', async (req: Request, res: Response) => {
  const adminUser = (req as any).user;
  const { action, eventId, creatorId, deductionINR, notes } = req.body;

  try {
    if (action === 'VOID_SUSPICIOUS_LIKES') {
      const updateRes = await query(
        `UPDATE likes SET status = 'VOIDED' WHERE status IN ('SUSPICIOUS', 'INVALID') RETURNING id`
      ).catch(() => ({ rowCount: 0 }));

      const count = updateRes.rowCount || 0;
      await recordAuditLog({
        actorId: adminUser?.id,
        action: 'VOID_SUSPICIOUS_LIKES',
        entityName: 'likes',
        entityId: 'BATCH',
        newState: { voidedCount: count },
      }).catch(() => {});

      return res.status(200).json({
        success: true,
        message: `Successfully voided ${count} suspicious likes from creator reward calculations.`,
      });
    }

    if (action === 'RESOLVE_ALL_EVENTS') {
      const updateRes = await query(
        `UPDATE fraud_events SET action_taken = 'RESOLVED' WHERE action_taken != 'RESOLVED' RETURNING id`
      ).catch(() => ({ rowCount: 0 }));

      const count = updateRes.rowCount || 0;
      await recordAuditLog({
        actorId: adminUser?.id,
        action: 'RESOLVE_ALL_FRAUD_EVENTS',
        entityName: 'fraud_events',
        entityId: 'BATCH',
        newState: { resolvedCount: count, resolvedBy: adminUser?.email },
      }).catch(() => {});

      return res.status(200).json({ success: true, message: `All ${count} active fraud incidents have been resolved.` });
    }

    if (action === 'RESOLVE_EVENT') {
      if (!eventId) {
        return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'eventId is required.' } });
      }

      await query(
        `UPDATE fraud_events SET action_taken = 'RESOLVED' WHERE id = $1`,
        [eventId]
      );

      await recordAuditLog({
        actorId: adminUser?.id,
        action: 'RESOLVE_FRAUD_EVENT',
        entityName: 'fraud_events',
        entityId: eventId,
        newState: { resolvedBy: adminUser?.email },
      }).catch(() => {});

      return res.status(200).json({ success: true, message: 'Fraud event resolved.' });
    }

    if (action === 'DEDUCT_WALLET') {
      if (!creatorId || !deductionINR || deductionINR <= 0) {
        return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'creatorId and positive deductionINR are required.' } });
      }

      const walletRes = await query(
        `SELECT id, balance_inr FROM creator_wallets WHERE creator_id = $1 OR user_id = $1`,
        [creatorId]
      ).catch(() => ({ rows: [] }));

      if (walletRes.rows.length > 0) {
        const wallet = walletRes.rows[0];
        const newBalance = Math.max(0, parseFloat(wallet.balance_inr || '0') - deductionINR);
        await query(
          `UPDATE creator_wallets SET balance_inr = $1, updated_at = NOW() WHERE id = $2`,
          [newBalance, wallet.id]
        );

        await query(
          `INSERT INTO wallet_transactions (wallet_id, amount_inr, transaction_type, status, description, created_at)
           VALUES ($1, $2, 'PENALTY_DEDUCTION', 'COMPLETED', $3, NOW())`,
          [wallet.id, -deductionINR, notes || 'Engagement fraud penalty deduction']
        ).catch(() => {});
      }

      await recordAuditLog({
        actorId: adminUser?.id,
        action: 'WALLET_FRAUD_PENALTY',
        entityName: 'creator_wallets',
        entityId: creatorId,
        newState: { deductionINR, notes },
      }).catch(() => {});

      return res.status(200).json({
        success: true,
        message: `₹${deductionINR} penalty deduction applied successfully to creator wallet.`,
      });
    }

    return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: `Unknown action: ${action}` } });
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
    const conditions: string[] = ['1=1'];
    const params: any[] = [];

    if (status && status !== 'ALL') {
      params.push(status);
      conditions.push(`ca.status = $${params.length}`);
    }
    if (category && category !== 'ALL') {
      params.push(category);
      conditions.push(`ca.category = $${params.length}`);
    }
    const intent = typeof req.query.intent === 'string' ? req.query.intent.toUpperCase() : 'ALL';
    if (intent && intent !== 'ALL') {
      params.push(intent);
      conditions.push(`ca.creation_intent = $${params.length}`);
    }
    const riskLevel = typeof risk === 'string' ? risk.toUpperCase() : 'ALL';
    if (riskLevel && riskLevel !== 'ALL') {
      params.push(riskLevel);
      conditions.push(`ca.plagiarism_risk_level = $${params.length}`);
    }
    if (search && String(search).trim()) {
      params.push(`%${String(search).trim()}%`);
      conditions.push(`(ca.stage_name ILIKE $${params.length} OR ca.full_name ILIKE $${params.length} OR ca.city ILIKE $${params.length} OR ca.matched_song_title ILIKE $${params.length})`);
    }

    const whereClause = 'WHERE ' + conditions.join(' AND ');

    const page = Math.max(parseInt((req.query.page as string) || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt((req.query.limit as string) || '15', 10), 1), 100);
    const offset = (page - 1) * limit;

    const countSql = `
      SELECT COUNT(*)::int as total
      FROM creator_applications ca
      LEFT JOIN users u ON ca.user_id = u.id
      ${whereClause}
    `;

    const listParams = [...params, limit, offset];
    const listSql = `
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
      ${whereClause}
      ORDER BY ca.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const [listRes, countRes, countsRes] = await Promise.all([
      query(listSql, listParams),
      query(countSql, params),
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

    const filteredTotal = parseInt(countRes.rows[0]?.total || '0', 10);
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

    return res.status(200).json({
      success: true,
      data: listRes.rows,
      counts,
      pagination: {
        page,
        limit,
        total: filteredTotal,
        totalPages: Math.max(1, Math.ceil(filteredTotal / limit)),
      },
    });
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

// ==========================================
// 10. MASTER MUSIC CATALOG & ASSET MANAGER
// ==========================================
router.get('/catalog/metadata', async (_req: Request, res: Response) => {
  try {
    const [langs, genres, artists] = await Promise.all([
      query(`SELECT id, code, name, native_name as "nativeName" FROM languages ORDER BY name ASC`),
      query(`SELECT id, name, slug FROM genres ORDER BY name ASC`),
      query(`SELECT id, name, is_verified as "isVerified" FROM artists ORDER BY name ASC LIMIT 200`),
    ]);
    return res.status(200).json({
      success: true,
      data: {
        languages: langs.rows,
        genres: genres.rows,
        artists: artists.rows,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

router.get('/catalog/songs', async (req: Request, res: Response) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const languageId = req.query.languageId ? parseInt(req.query.languageId as string, 10) : undefined;
    const genreId = req.query.genreId ? parseInt(req.query.genreId as string, 10) : undefined;
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const page = Math.max(parseInt((req.query.page as string) || '1', 10), 1);
    const limit = Math.min(parseInt((req.query.limit as string) || '15', 10), 200);
    const offset = (page - 1) * limit;

    const conditions: string[] = ['1=1'];
    const values: any[] = [];
    let idx = 1;

    if (search) {
      conditions.push(`(s.title ILIKE $${idx} OR a.name ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }
    if (languageId) {
      conditions.push(`s.language_id = $${idx}`);
      values.push(languageId);
      idx++;
    }
    if (genreId) {
      conditions.push(`s.genre_id = $${idx}`);
      values.push(genreId);
      idx++;
    }
    if (status) {
      conditions.push(`s.status = $${idx}`);
      values.push(status);
      idx++;
    }

    const whereClause = conditions.join(' AND ');

    const [statsRes, countRes, listRes] = await Promise.all([
      query(`
        SELECT 
          COUNT(*) as "totalSongs",
          COUNT(*) FILTER (WHERE status = 'PUBLISHED') as "publishedSongs",
          COUNT(*) FILTER (WHERE status = 'TAKEDOWN') as "takedownSongs",
          COUNT(*) FILTER (WHERE status = 'DRAFT' OR status = 'UNPUBLISHED') as "draftSongs",
          COALESCE(SUM(play_count), 0) as "totalPlays",
          COALESCE(SUM(valid_likes_count), 0) as "totalLikes"
        FROM songs
      `),
      query(`
        SELECT COUNT(*) as total 
        FROM songs s 
        JOIN artists a ON s.artist_id = a.id 
        WHERE ${whereClause}
      `, values),
      query(`
        SELECT 
          s.id, s.title, s.slug, s.duration_seconds as "durationSeconds",
          s.audio_url as "audioUrl", s.artwork_url as "artworkUrl",
          s.status, s.mood, s.is_explicit as "isExplicit",
          s.play_count as "playCount", s.valid_likes_count as "validLikesCount",
          s.release_date as "releaseDate", s.created_at as "createdAt",
          a.id as "artistId", a.name as "artistName", a.is_verified as "artistVerified",
          l.id as "languageId", l.name as "languageName", l.code as "languageCode",
          g.id as "genreId", g.name as "genreName",
          EXISTS(SELECT 1 FROM lyrics ly WHERE ly.song_id = s.id AND ly.is_synced = TRUE) as "hasSyncedLyrics",
          EXISTS(SELECT 1 FROM lyrics ly WHERE ly.song_id = s.id) as "hasLyrics"
        FROM songs s
        JOIN artists a ON s.artist_id = a.id
        LEFT JOIN languages l ON s.language_id = l.id
        LEFT JOIN genres g ON s.genre_id = g.id
        WHERE ${whereClause}
        ORDER BY s.created_at DESC
        LIMIT $${idx} OFFSET $${idx + 1}
      `, [...values, limit, offset]),
    ]);

    const total = parseInt(countRes.rows[0]?.total || '0', 10);

    return res.status(200).json({
      success: true,
      data: {
        songs: listRes.rows,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        stats: statsRes.rows[0],
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

router.post('/catalog/songs', async (req: Request, res: Response) => {
  const actor = (req as any).user;
  try {
    const { title, artistId, languageId, genreId, mood, durationSeconds, audioUrl, artworkUrl, isExplicit, status } = req.body;
    if (!title || !artistId || !languageId || !genreId || !audioUrl) {
      return res.status(400).json({ success: false, message: 'Title, artist, language, genre, and audio URL are required' });
    }
    const slug = `${slugify(title)}-${Date.now().toString(36)}`;
    const r = await query(
      `INSERT INTO songs (title, slug, artist_id, language_id, genre_id, mood, duration_seconds, audio_url, artwork_url, is_explicit, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        title.trim(),
        slug,
        artistId,
        languageId,
        genreId,
        mood || null,
        durationSeconds || 0,
        audioUrl.trim(),
        artworkUrl?.trim() || null,
        !!isExplicit,
        status || 'PUBLISHED',
      ]
    );

    await recordAuditLog({
      actorId: actor.id,
      action: 'ADMIN_CREATE_SONG',
      entityName: 'SONG',
      entityId: r.rows[0].id,
      newState: r.rows[0],
    });

    return res.status(201).json({ success: true, message: 'Song created in catalog', data: r.rows[0] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

router.patch('/catalog/songs/:id', async (req: Request, res: Response) => {
  const actor = (req as any).user;
  try {
    const { id } = req.params;
    const { title, mood, durationSeconds, audioUrl, artworkUrl, isExplicit, status, languageId, genreId } = req.body;

    const currentRes = await query(`SELECT * FROM songs WHERE id = $1`, [id]);
    if (currentRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Song not found' });
    }
    const oldSong = currentRes.rows[0];

    const updatedRes = await query(
      `UPDATE songs 
       SET title = COALESCE($1, title),
           mood = COALESCE($2, mood),
           duration_seconds = COALESCE($3, duration_seconds),
           audio_url = COALESCE($4, audio_url),
           artwork_url = COALESCE($5, artwork_url),
           is_explicit = COALESCE($6, is_explicit),
           status = COALESCE($7, status),
           language_id = COALESCE($8, language_id),
           genre_id = COALESCE($9, genre_id),
           updated_at = NOW()
       WHERE id = $10
       RETURNING *`,
      [
        title !== undefined ? title.trim() : null,
        mood !== undefined ? mood : null,
        durationSeconds !== undefined ? durationSeconds : null,
        audioUrl !== undefined ? audioUrl.trim() : null,
        artworkUrl !== undefined ? artworkUrl.trim() : null,
        isExplicit !== undefined ? isExplicit : null,
        status !== undefined ? status : null,
        languageId !== undefined ? languageId : null,
        genreId !== undefined ? genreId : null,
        id,
      ]
    );

    await recordAuditLog({
      actorId: actor.id,
      action: 'ADMIN_UPDATE_SONG',
      entityName: 'SONG',
      entityId: id,
      oldState: oldSong,
      newState: updatedRes.rows[0],
    });

    return res.status(200).json({ success: true, message: 'Song updated successfully', data: updatedRes.rows[0] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

router.delete('/catalog/songs/:id', async (req: Request, res: Response) => {
  const actor = (req as any).user;
  try {
    const { id } = req.params;
    const currentRes = await query(`SELECT * FROM songs WHERE id = $1`, [id]);
    if (currentRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Song not found' });
    }
    await query(`DELETE FROM songs WHERE id = $1`, [id]);

    await recordAuditLog({
      actorId: actor.id,
      action: 'ADMIN_DELETE_SONG',
      entityName: 'SONG',
      entityId: id,
      oldState: currentRes.rows[0],
    });

    return res.status(200).json({ success: true, message: 'Song removed from catalog' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// ==========================================
// 11. SYNCHRONIZED LYRICS & KARAOKE STUDIO
// ==========================================
router.get('/lyrics/overview', async (req: Request, res: Response) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const page = Math.max(parseInt((req.query.page as string) || '1', 10), 1);
    const limit = Math.min(parseInt((req.query.limit as string) || '40', 10), 100);
    const offset = (page - 1) * limit;

    const [statsRes, countRes, listRes] = await Promise.all([
      query(`
        SELECT 
          COUNT(DISTINCT s.id) as "totalSongs",
          COUNT(DISTINCT ly.song_id) as "withLyrics",
          COUNT(DISTINCT ly.song_id) FILTER (WHERE ly.is_synced = TRUE) as "syncedLyrics",
          COUNT(DISTINCT ly.song_id) FILTER (WHERE ly.is_synced = FALSE OR ly.is_synced IS NULL) as "unsyncedLyrics",
          (SELECT COUNT(*) FROM lyric_lines) as "totalLines"
        FROM songs s
        LEFT JOIN lyrics ly ON s.id = ly.song_id
      `),
      query(`
        SELECT COUNT(DISTINCT s.id) as total
        FROM songs s
        JOIN artists a ON s.artist_id = a.id
        LEFT JOIN lyrics ly ON s.id = ly.song_id
        WHERE ($1 = '' OR s.title ILIKE $1 OR a.name ILIKE $1)
          AND ($2::text IS NULL OR ly.sync_status = $2 OR ($2 = 'NONE' AND ly.id IS NULL))
      `, [search ? `%${search}%` : '', status || null]),
      query(`
        SELECT 
          s.id as "songId", s.title, s.duration_seconds as "durationSeconds",
          s.audio_url as "audioUrl", s.artwork_url as "artworkUrl",
          a.name as "artistName", l.name as "languageName",
          ly.id as "lyricsId", ly.is_synced as "isSynced", 
          COALESCE(ly.sync_status, 'UNSYNCED') as "syncStatus",
          ly.version, ly.created_at as "lyricsUpdatedAt",
          (SELECT COUNT(*) FROM lyric_lines ll WHERE ll.lyrics_id = ly.id) as "lineCount"
        FROM songs s
        JOIN artists a ON s.artist_id = a.id
        LEFT JOIN languages l ON s.language_id = l.id
        LEFT JOIN lyrics ly ON s.id = ly.song_id
        WHERE ($1 = '' OR s.title ILIKE $1 OR a.name ILIKE $1)
          AND ($2::text IS NULL OR ly.sync_status = $2 OR ($2 = 'NONE' AND ly.id IS NULL))
        ORDER BY s.created_at DESC
        LIMIT $3 OFFSET $4
      `, [search ? `%${search}%` : '', status || null, limit, offset]),
    ]);

    const total = parseInt(countRes.rows[0]?.total || '0', 10);

    return res.status(200).json({
      success: true,
      data: {
        songs: listRes.rows,
        stats: statsRes.rows[0],
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

router.get('/lyrics/song/:songId', async (req: Request, res: Response) => {
  try {
    const { songId } = req.params;
    const songRes = await query(
      `SELECT s.id, s.title, s.duration_seconds as "durationSeconds", s.audio_url as "audioUrl",
              s.artwork_url as "artworkUrl", a.name as "artistName", l.id as "languageId", l.name as "languageName"
       FROM songs s
       JOIN artists a ON s.artist_id = a.id
       LEFT JOIN languages l ON s.language_id = l.id
       WHERE s.id = $1`,
      [songId]
    );
    if (songRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Song not found' });
    }

    const lyricsRes = await query(
      `SELECT id, is_synced as "isSynced", sync_status as "syncStatus", version, full_text as "fullText"
       FROM lyrics WHERE song_id = $1`,
      [songId]
    );

    let lines: any[] = [];
    if (lyricsRes.rows.length > 0) {
      const linesRes = await query(
        `SELECT id, sequence_order as "sequenceOrder", start_time_ms as "startTimeMs", 
                end_time_ms as "endTimeMs", text
         FROM lyric_lines WHERE lyrics_id = $1 ORDER BY sequence_order ASC`,
        [lyricsRes.rows[0].id]
      );
      lines = linesRes.rows;
    }

    return res.status(200).json({
      success: true,
      data: {
        song: songRes.rows[0],
        lyrics: lyricsRes.rows[0] || null,
        lines,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

router.put('/lyrics/song/:songId', async (req: Request, res: Response) => {
  const actor = (req as any).user;
  const client = await getClient();
  try {
    const { songId } = req.params;
    const { fullText, isSynced, syncStatus, lines } = req.body;

    await client.query('BEGIN');

    let lyricsId: string;
    const existing = await client.query(`SELECT id FROM lyrics WHERE song_id = $1`, [songId]);

    if (existing.rows.length > 0) {
      lyricsId = existing.rows[0].id;
      await client.query(
        `UPDATE lyrics 
         SET full_text = COALESCE($1, full_text),
             is_synced = COALESCE($2, is_synced),
             sync_status = COALESCE($3, sync_status),
             version = version + 1
         WHERE id = $4`,
        [fullText, isSynced, syncStatus, lyricsId]
      );
    } else {
      const inserted = await client.query(
        `INSERT INTO lyrics (song_id, full_text, is_synced, sync_status, version)
         VALUES ($1, $2, $3, $4, 1) RETURNING id`,
        [songId, fullText || '', !!isSynced, syncStatus || (isSynced ? 'SYNCED' : 'UNSYNCED')]
      );
      lyricsId = inserted.rows[0].id;
    }

    if (Array.isArray(lines)) {
      await client.query(`DELETE FROM lyric_lines WHERE lyrics_id = $1`, [lyricsId]);
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line && line.text) {
          await client.query(
            `INSERT INTO lyric_lines (lyrics_id, sequence_order, start_time_ms, end_time_ms, text)
             VALUES ($1, $2, $3, $4, $5)`,
            [lyricsId, i + 1, line.startTimeMs || line.start_time_ms || 0, line.endTimeMs || line.end_time_ms || 0, line.text.trim()]
          );
        }
      }
    }

    await client.query('COMMIT');

    await recordAuditLog({
      actorId: actor.id,
      action: 'ADMIN_UPDATE_LYRICS',
      entityName: 'LYRICS',
      entityId: lyricsId,
      newState: { songId, linesCount: Array.isArray(lines) ? lines.length : undefined, syncStatus },
    });

    return res.status(200).json({ success: true, message: 'Lyrics & timings updated successfully', data: { lyricsId } });
  } catch (err: any) {
    await client.query('ROLLBACK');
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  } finally {
    client.release();
  }
});

// ==========================================
// 12. COMPETITIONS & CHALLENGES CONTROL
// ==========================================
router.get('/competitions', async (_req: Request, res: Response) => {
  try {
    const compRes = await query(`
      SELECT c.*,
             COUNT(ce.id) as "totalEntries",
             COUNT(DISTINCT ce.creator_id) as "uniqueCreators",
             COALESCE(SUM(ce.votes_count), 0) as "totalVotes"
      FROM competitions c
      LEFT JOIN competition_entries ce ON c.id = ce.competition_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);
    return res.status(200).json({ success: true, data: compRes.rows });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

router.post('/competitions', async (req: Request, res: Response) => {
  const actor = (req as any).user;
  try {
    const { title, description, rules, prizeInr, startDate, endDate, eligibleLanguages, eligibleGenres, coverUrl, status } = req.body;
    if (!title || !description || !rules || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'Title, description, rules, start date, and end date are required' });
    }
    const slug = `${slugify(title)}-${Date.now().toString(36)}`;
    const r = await query(
      `INSERT INTO competitions (title, slug, description, rules, prize_inr, start_date, end_date, eligible_languages, eligible_genres, cover_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        title.trim(),
        slug,
        description.trim(),
        rules.trim(),
        prizeInr || 0,
        startDate,
        endDate,
        eligibleLanguages || [],
        eligibleGenres || [],
        coverUrl || null,
        status || 'ACTIVE',
      ]
    );

    await recordAuditLog({
      actorId: actor.id,
      action: 'ADMIN_CREATE_COMPETITION',
      entityName: 'COMPETITION',
      entityId: r.rows[0].id,
      newState: r.rows[0],
    });

    return res.status(201).json({ success: true, message: 'Competition created successfully', data: r.rows[0] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

router.patch('/competitions/:id', async (req: Request, res: Response) => {
  const actor = (req as any).user;
  try {
    const { id } = req.params;
    const { title, description, rules, prizeInr, startDate, endDate, status, coverUrl } = req.body;

    const r = await query(
      `UPDATE competitions 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           rules = COALESCE($3, rules),
           prize_inr = COALESCE($4, prize_inr),
           start_date = COALESCE($5, start_date),
           end_date = COALESCE($6, end_date),
           status = COALESCE($7, status),
           cover_url = COALESCE($8, cover_url)
       WHERE id = $9
       RETURNING *`,
      [title, description, rules, prizeInr, startDate, endDate, status, coverUrl, id]
    );

    if (r.rows.length === 0) return res.status(404).json({ success: false, message: 'Competition not found' });

    await recordAuditLog({
      actorId: actor.id,
      action: 'ADMIN_UPDATE_COMPETITION',
      entityName: 'COMPETITION',
      entityId: id,
      newState: r.rows[0],
    });

    return res.status(200).json({ success: true, message: 'Competition updated', data: r.rows[0] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

router.get('/competitions/:id/entries', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const entriesRes = await query(
      `SELECT ce.*, cp.stage_name as "stageName", u.full_name as "creatorName", u.email as "creatorEmail",
              dmc.video_url as "videoUrl", s.title as "songTitle", s.audio_url as "audioUrl"
       FROM competition_entries ce
       JOIN creator_profiles cp ON ce.creator_id = cp.id
       JOIN users u ON cp.user_id = u.id
       LEFT JOIN desi_music_content dmc ON ce.content_id = dmc.id
       LEFT JOIN songs s ON dmc.song_id = s.id
       WHERE ce.competition_id = $1
       ORDER BY ce.votes_count DESC, ce.submitted_at ASC`,
      [id]
    );
    return res.status(200).json({ success: true, data: entriesRes.rows });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

router.patch('/competitions/entries/:entryId', async (req: Request, res: Response) => {
  const actor = (req as any).user;
  try {
    const { entryId } = req.params;
    const { rank, status, votesDelta } = req.body;

    const r = await query(
      `UPDATE competition_entries 
       SET rank = COALESCE($1, rank),
           status = COALESCE($2, status),
           votes_count = GREATEST(0, votes_count + COALESCE($3, 0))
       WHERE id = $4
       RETURNING *`,
      [rank, status, votesDelta || 0, entryId]
    );

    if (r.rows.length === 0) return res.status(404).json({ success: false, message: 'Entry not found' });

    await recordAuditLog({
      actorId: actor.id,
      action: 'ADMIN_UPDATE_COMPETITION_ENTRY',
      entityName: 'COMPETITION_ENTRY',
      entityId: entryId,
      newState: r.rows[0],
    });

    return res.status(200).json({ success: true, message: 'Entry updated', data: r.rows[0] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// ==========================================
// 13. COMMUNITY REPORTS & TAKEDOWN QUEUE
// ==========================================
router.get('/reports', async (req: Request, res: Response) => {
  try {
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const targetType = typeof req.query.targetType === 'string' ? req.query.targetType : undefined;

    const conditions: string[] = ['1=1'];
    const values: any[] = [];
    let idx = 1;

    if (status) {
      conditions.push(`r.status = $${idx}`);
      values.push(status);
      idx++;
    }
    if (targetType) {
      conditions.push(`r.target_type = $${idx}`);
      values.push(targetType);
      idx++;
    }

    const reportsRes = await query(
      `SELECT r.*, u.email as "reporterEmail", u.full_name as "reporterName",
              ru.email as "resolverEmail"
       FROM reports r
       JOIN users u ON r.reporter_id = u.id
       LEFT JOIN users ru ON r.resolved_by = ru.id
       WHERE ${conditions.join(' AND ')}
       ORDER BY r.created_at DESC`,
      values
    );

    const statsRes = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'PENDING') as pending,
        COUNT(*) FILTER (WHERE status = 'INVESTIGATING') as investigating,
        COUNT(*) FILTER (WHERE status = 'RESOLVED') as resolved,
        COUNT(*) FILTER (WHERE status = 'DISMISSED') as dismissed
      FROM reports
    `);

    return res.status(200).json({
      success: true,
      data: {
        reports: reportsRes.rows,
        stats: statsRes.rows[0],
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

router.post('/reports', async (req: Request, res: Response) => {
  try {
    const actor = (req as any).user;
    const { targetType, targetId, reason, details } = req.body;
    if (!targetType || !targetId || !reason) {
      return res.status(400).json({ success: false, message: 'Target type, target ID, and reason are required' });
    }
    const r = await query(
      `INSERT INTO reports (reporter_id, target_type, target_id, reason, details, status)
       VALUES ($1, $2, $3, $4, $5, 'PENDING')
       RETURNING *`,
      [actor.id, targetType, targetId, reason, details || null]
    );
    return res.status(201).json({ success: true, message: 'Report submitted', data: r.rows[0] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

router.patch('/reports/:id', async (req: Request, res: Response) => {
  const actor = (req as any).user;
  try {
    const { id } = req.params;
    const { status, action } = req.body; // action: 'NONE', 'TAKEDOWN_SONG', 'SUSPEND_USER'

    const reportRes = await query(`SELECT * FROM reports WHERE id = $1`, [id]);
    if (reportRes.rows.length === 0) return res.status(404).json({ success: false, message: 'Report not found' });
    const report = reportRes.rows[0];

    await query(
      `UPDATE reports SET status = $1, resolved_by = $2 WHERE id = $3`,
      [status || 'RESOLVED', actor.id, id]
    );

    // Apply auto action if requested
    if (action === 'TAKEDOWN_SONG' && report.target_type === 'SONG') {
      await query(`UPDATE songs SET status = 'TAKEDOWN' WHERE id = $1`, [report.target_id]);
    } else if (action === 'SUSPEND_USER' && (report.target_type === 'PROFILE' || report.target_type === 'CREATOR')) {
      await query(`UPDATE users SET status = 'SUSPENDED' WHERE id = $1`, [report.target_id]);
    }

    await recordAuditLog({
      actorId: actor.id,
      action: `ADMIN_RESOLVE_REPORT_${status}`,
      entityName: 'REPORT',
      entityId: id,
      newState: { status, action, targetType: report.target_type, targetId: report.target_id },
    });

    return res.status(200).json({ success: true, message: 'Report updated successfully' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// ==========================================
// 14. CREATOR WALLETS & DYNAMIC ECONOMY
// ==========================================
router.get('/wallets', async (req: Request, res: Response) => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const walletsRes = await query(`
      SELECT cw.*, cp.stage_name as "stageName", cp.category, u.id as "userId", u.full_name as "creatorName", u.email as "creatorEmail",
             (SELECT COUNT(*) FROM wallet_transactions wt WHERE wt.wallet_id = cw.id) as "txCount"
      FROM creator_wallets cw
      JOIN creator_profiles cp ON cw.creator_id = cp.id
      JOIN users u ON cp.user_id = u.id
      WHERE ($1 = '' OR cp.stage_name ILIKE $1 OR u.email ILIKE $1 OR u.full_name ILIKE $1)
      ORDER BY cw.available_balance_inr DESC
    `, [search ? `%${search}%` : '']);

    const statsRes = await query(`
      SELECT 
        COUNT(*) as "totalWallets",
        COALESCE(SUM(available_balance_inr), 0) as "totalAvailableBalance",
        COALESCE(SUM(pending_balance_inr), 0) as "totalPendingBalance",
        COALESCE(SUM(paid_balance_inr), 0) as "totalPaidBalance",
        COALESCE(SUM(total_earned_inr), 0) as "totalPlatformGross"
      FROM creator_wallets
    `);

    return res.status(200).json({
      success: true,
      data: {
        wallets: walletsRes.rows,
        stats: statsRes.rows[0],
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

router.get('/wallets/:id/transactions', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const txRes = await query(
      `SELECT * FROM wallet_transactions WHERE wallet_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [id]
    );
    return res.status(200).json({ success: true, data: txRes.rows });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

router.post('/wallets/:id/adjust', async (req: Request, res: Response) => {
  const actor = (req as any).user;
  const client = await getClient();
  try {
    const { id } = req.params;
    const { type, amountInr, notes } = req.body;
    // type: 'BONUS', 'ADJUSTMENT', 'FRAUD_DEDUCTION', 'REWARD'

    if (!type || amountInr === undefined || !notes) {
      return res.status(400).json({ success: false, message: 'Type, amount, and explanatory notes are mandatory' });
    }

    const numAmount = parseFloat(amountInr);
    if (isNaN(numAmount) || numAmount === 0) {
      return res.status(400).json({ success: false, message: 'Amount must be a non-zero valid number' });
    }

    await client.query('BEGIN');

    const walletRes = await client.query(`SELECT * FROM creator_wallets WHERE id = $1 FOR UPDATE`, [id]);
    if (walletRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Wallet not found' });
    }
    const wallet = walletRes.rows[0];

    const currentBalance = parseFloat(wallet.available_balance_inr);
    const newBalance = currentBalance + numAmount;
    if (newBalance < 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: `Deduction exceeds balance (Current: ₹${currentBalance})` });
    }

    await client.query(
      `UPDATE creator_wallets 
       SET available_balance_inr = $1,
           total_earned_inr = total_earned_inr + GREATEST(0, $2),
           updated_at = NOW()
       WHERE id = $3`,
      [newBalance, numAmount > 0 ? numAmount : 0, id]
    );

    await client.query(
      `INSERT INTO wallet_transactions (wallet_id, type, amount_inr, status, notes)
       VALUES ($1, $2, $3, 'APPROVED', $4)`,
      [id, type, Math.abs(numAmount), `[Admin Override by ${actor.email}]: ${notes}`]
    );

    await client.query('COMMIT');

    await recordAuditLog({
      actorId: actor.id,
      action: `ADMIN_WALLET_ADJUSTMENT_${type}`,
      entityName: 'CREATOR_WALLET',
      entityId: id,
      oldState: { availableBalance: currentBalance },
      newState: { availableBalance: newBalance, delta: numAmount, notes },
    });

    return res.status(200).json({ success: true, message: 'Wallet adjusted successfully', data: { newBalance } });
  } catch (err: any) {
    await client.query('ROLLBACK');
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  } finally {
    client.release();
  }
});

router.get('/reward-rules', async (_req: Request, res: Response) => {
  try {
    const rulesRes = await query(`SELECT * FROM reward_rules ORDER BY id DESC LIMIT 1`);
    return res.status(200).json({ success: true, data: rulesRes.rows[0] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

router.patch('/reward-rules', async (req: Request, res: Response) => {
  const actor = (req as any).user;
  try {
    const { rewardPerValidLikeInr, minimumPayoutInr, maximumMonthlyRewardInr, bonusRate } = req.body;
    const r = await query(
      `UPDATE reward_rules 
       SET reward_per_valid_like_inr = COALESCE($1, reward_per_valid_like_inr),
           minimum_payout_inr = COALESCE($2, minimum_payout_inr),
           maximum_monthly_reward_inr = COALESCE($3, maximum_monthly_reward_inr),
           bonus_rate = COALESCE($4, bonus_rate)
       WHERE id = (SELECT id FROM reward_rules ORDER BY id DESC LIMIT 1)
       RETURNING *`,
      [rewardPerValidLikeInr, minimumPayoutInr, maximumMonthlyRewardInr, bonusRate]
    );

    await recordAuditLog({
      actorId: actor.id,
      action: 'ADMIN_UPDATE_REWARD_RULES',
      entityName: 'REWARD_RULES',
      entityId: r.rows[0].id,
      newState: r.rows[0],
    });

    return res.status(200).json({ success: true, message: 'Reward policy updated', data: r.rows[0] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// ==========================================
// 15. EDITORIAL PLAYLISTS & HOMEPAGE CURATION
// ==========================================
router.get('/curation/playlists', async (_req: Request, res: Response) => {
  try {
    const r = await query(`
      SELECT p.*, u.full_name as "ownerName", u.email as "ownerEmail",
             COUNT(ps.song_id) as "songCount"
      FROM playlists p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN playlist_songs ps ON p.id = ps.playlist_id
      GROUP BY p.id, u.full_name, u.email
      ORDER BY p.created_at DESC
    `);
    return res.status(200).json({ success: true, data: r.rows });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

router.post('/curation/playlists', async (req: Request, res: Response) => {
  const actor = (req as any).user;
  try {
    const { name, description, coverUrl, visibility } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Playlist name is required' });
    const slug = `${slugify(name)}-${Date.now().toString(36)}`;
    const r = await query(
      `INSERT INTO playlists (user_id, name, slug, description, cover_url, visibility)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [actor.id, name.trim(), slug, description || '', coverUrl || null, visibility || 'PUBLIC']
    );

    await recordAuditLog({
      actorId: actor.id,
      action: 'ADMIN_CREATE_EDITORIAL_PLAYLIST',
      entityName: 'PLAYLIST',
      entityId: r.rows[0].id,
      newState: r.rows[0],
    });

    return res.status(201).json({ success: true, message: 'Editorial playlist created', data: r.rows[0] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

router.post('/curation/playlists/:id/songs', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { songId } = req.body;
    if (!songId) return res.status(400).json({ success: false, message: 'Song ID is required' });

    const maxPos = await query(`SELECT COALESCE(MAX(position), 0) + 1 as pos FROM playlist_songs WHERE playlist_id = $1`, [id]);
    await query(
      `INSERT INTO playlist_songs (playlist_id, song_id, position)
       VALUES ($1, $2, $3)
       ON CONFLICT (playlist_id, song_id) DO NOTHING`,
      [id, songId, maxPos.rows[0].pos]
    );
    return res.status(200).json({ success: true, message: 'Song added to playlist' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

router.delete('/curation/playlists/:id/songs/:songId', async (req: Request, res: Response) => {
  try {
    const { id, songId } = req.params;
    await query(`DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2`, [id, songId]);
    return res.status(200).json({ success: true, message: 'Song removed from playlist' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// ==========================================
// 16. BROADCASTS & PLATFORM NOTIFICATIONS
// ==========================================
router.get('/broadcasts', async (_req: Request, res: Response) => {
  try {
    const r = await query(`
      SELECT n.type, n.title, n.message, n.link, n.created_at as "createdAt",
             COUNT(n.id) as "recipientsCount"
      FROM notifications n
      GROUP BY n.type, n.title, n.message, n.link, n.created_at
      ORDER BY n.created_at DESC
      LIMIT 30
    `);
    return res.status(200).json({ success: true, data: r.rows });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

router.post('/broadcasts', async (req: Request, res: Response) => {
  const actor = (req as any).user;
  try {
    const { audience, targetUserId, title, message, link, type } = req.body;
    // audience: 'ALL_USERS', 'ALL_CREATORS', 'SPECIFIC_USER'

    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required' });
    }

    let recipientUserIds: string[] = [];

    if (audience === 'SPECIFIC_USER') {
      if (!targetUserId) return res.status(400).json({ success: false, message: 'Target user ID is required' });
      recipientUserIds = [targetUserId];
    } else if (audience === 'ALL_CREATORS') {
      const creators = await query(`SELECT user_id FROM creator_profiles WHERE is_approved = TRUE`);
      recipientUserIds = creators.rows.map((r: any) => r.user_id);
    } else {
      // ALL_USERS
      const users = await query(`SELECT id FROM users WHERE status = 'ACTIVE'`);
      recipientUserIds = users.rows.map((r: any) => r.id);
    }

    if (recipientUserIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No recipients matched the criteria' });
    }

    for (const uid of recipientUserIds) {
      await query(
        `INSERT INTO notifications (user_id, type, title, message, link)
         VALUES ($1, $2, $3, $4, $5)`,
        [uid, type || 'SYSTEM_ANNOUNCEMENT', title.trim(), message.trim(), link || null]
      );
    }

    await recordAuditLog({
      actorId: actor.id,
      action: 'ADMIN_SEND_BROADCAST',
      entityName: 'NOTIFICATIONS',
      entityId: actor.id,
      newState: { audience, count: recipientUserIds.length, title },
    });

    return res.status(201).json({
      success: true,
      message: `Notification broadcast dispatched to ${recipientUserIds.length} users`,
      data: { recipientsCount: recipientUserIds.length },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// ==========================================
// 17. STAFF RBAC & TEAM DELEGATION
// ==========================================
router.get('/team', async (_req: Request, res: Response) => {
  try {
    const [staffRes, rolesRes] = await Promise.all([
      query(`
        SELECT u.id, u.email, u.full_name as "fullName", u.username, u.avatar_url as "avatarUrl",
               u.status, u.created_at as "createdAt",
               array_agg(r.name) as roles
        FROM users u
        JOIN user_roles ur ON u.id = ur.user_id
        JOIN roles r ON ur.role_id = r.id
        WHERE r.name IN ('ADMIN', 'SUPER_ADMIN', 'MODERATOR', 'FINANCE', 'CONTENT_MANAGER')
        GROUP BY u.id
        ORDER BY u.created_at ASC
      `),
      query(`SELECT id, name, description FROM roles ORDER BY id ASC`),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        staff: staffRes.rows,
        availableRoles: rolesRes.rows,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

router.post('/team/assign-role', async (req: Request, res: Response) => {
  const actor = (req as any).user;
  try {
    const { userId, roleName } = req.body;
    if (!userId || !roleName) return res.status(400).json({ success: false, message: 'User ID and Role Name are required' });

    const roleRes = await query(`SELECT id FROM roles WHERE name = $1`, [roleName.toUpperCase()]);
    if (roleRes.rows.length === 0) return res.status(404).json({ success: false, message: `Role ${roleName} does not exist` });
    const roleId = roleRes.rows[0].id;

    await query(
      `INSERT INTO user_roles (user_id, role_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, role_id) DO NOTHING`,
      [userId, roleId]
    );

    await recordAuditLog({
      actorId: actor.id,
      action: 'ADMIN_ASSIGN_ROLE',
      entityName: 'USER_ROLE',
      entityId: userId,
      newState: { userId, roleName },
    });

    return res.status(200).json({ success: true, message: `Role ${roleName} assigned successfully` });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

router.post('/team/revoke-role', async (req: Request, res: Response) => {
  const actor = (req as any).user;
  try {
    const { userId, roleName } = req.body;
    if (!userId || !roleName) return res.status(400).json({ success: false, message: 'User ID and Role Name are required' });

    const roleRes = await query(`SELECT id FROM roles WHERE name = $1`, [roleName.toUpperCase()]);
    if (roleRes.rows.length === 0) return res.status(404).json({ success: false, message: 'Role does not exist' });
    const roleId = roleRes.rows[0].id;

    await query(`DELETE FROM user_roles WHERE user_id = $1 AND role_id = $2`, [userId, roleId]);

    await recordAuditLog({
      actorId: actor.id,
      action: 'ADMIN_REVOKE_ROLE',
      entityName: 'USER_ROLE',
      entityId: userId,
      newState: { userId, roleName },
    });

    return res.status(200).json({ success: true, message: `Role ${roleName} revoked successfully` });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

export default router;
