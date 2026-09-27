import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authenticateAdmin, recordAuditLog } from '@/lib/admin';

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
      roleFilterClause = `HAVING ('ADMIN' = ANY(COALESCE(array_agg(r.name) FILTER (WHERE r.name IS NOT NULL), '{}')) OR 'SUPER_ADMIN' = ANY(COALESCE(array_agg(r.name) FILTER (WHERE r.name IS NOT NULL), '{}')))`;
    } else if (role === 'USER' || role === 'LISTENER') {
      roleFilterClause = `HAVING NOT ('CREATOR' = ANY(COALESCE(array_agg(r.name) FILTER (WHERE r.name IS NOT NULL), '{}')) OR 'ADMIN' = ANY(COALESCE(array_agg(r.name) FILTER (WHERE r.name IS NOT NULL), '{}')) OR 'SUPER_ADMIN' = ANY(COALESCE(array_agg(r.name) FILTER (WHERE r.name IS NOT NULL), '{}')))`;
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

export async function PATCH(req: NextRequest) {
  const { user, errorResponse } = await authenticateAdmin(req);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { userId, status, isVerified, notes } = body;

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
        { status: 400 }
      );
    }
    const oldUser = existing.rows[0];

    const updates: string[] = ['updated_at = NOW()'];
    const params: any[] = [userId];

    if (status && ['ACTIVE', 'SUSPENDED', 'DELETED'].includes(status)) {
      params.push(status);
      updates.push(`status = $${params.length}`);
    }

    if (typeof isVerified === 'boolean') {
      params.push(isVerified);
      updates.push(`is_verified = $${params.length}`);
    }

    const updateSql = `
      UPDATE users 
      SET ${updates.join(', ')} 
      WHERE id = $1 
      RETURNING id, email, full_name as "fullName", username, is_verified as "isVerified", status, updated_at as "updatedAt"
    `;

    const updatedRes = await query(updateSql, params);
    const updatedUser = updatedRes.rows[0];

    // Audit log
    await recordAuditLog({
      actorId: user!.id,
      action: status ? `UPDATE_USER_STATUS_${status}` : 'UPDATE_USER_VERIFICATION',
      entityName: 'USER',
      entityId: userId,
      oldState: { status: oldUser.status, isVerified: oldUser.is_verified },
      newState: { status: updatedUser.status, isVerified: updatedUser.isVerified, notes },
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully',
    });
  } catch (err: any) {
    console.error('Error updating admin user:', err);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: err.message } },
      { status: 500 }
    );
  }
}
