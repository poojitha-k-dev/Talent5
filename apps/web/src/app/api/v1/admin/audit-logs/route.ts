import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authenticateAdmin } from '@/lib/admin';

export async function GET(req: NextRequest) {
  const { user, errorResponse } = await authenticateAdmin(req);
  if (errorResponse) return errorResponse;

  const url = new URL(req.url);
  const entity = url.searchParams.get('entity');
  const action = url.searchParams.get('action');
  const limit = parseInt(url.searchParams.get('limit') || '50', 10);

  try {
    let sql = `
      SELECT a.id, a.actor_id as "actorId", a.action, a.entity_name as "entityName",
             a.entity_id as "entityId", a.old_state as "oldState", a.new_state as "newState",
             a.ip_address as "ipAddress", a.created_at as "createdAt",
             u.email as "actorEmail", u.full_name as "actorName"
      FROM audit_logs a
      LEFT JOIN users u ON a.actor_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (entity && entity !== 'ALL') {
      params.push(entity);
      sql += ` AND a.entity_name = $${params.length}`;
    }

    if (action && action !== 'ALL') {
      params.push(`%${action}%`);
      sql += ` AND a.action ILIKE $${params.length}`;
    }

    sql += ` ORDER BY a.created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const res = await query(sql, params);

    return NextResponse.json({
      success: true,
      data: res.rows,
    });
  } catch (err: any) {
    console.error('Error fetching audit logs:', err);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: err.message } },
      { status: 500 }
    );
  }
}
