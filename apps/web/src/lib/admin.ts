import { NextRequest, NextResponse } from 'next/server';
import { User, UserRole } from '@talent5/types';
import { getUserFromRequest, checkUserHasRole } from './auth';
import { query } from './db';

export async function authenticateAdmin(
  req: NextRequest,
  allowedRoles: UserRole[] = ['ADMIN', 'SUPER_ADMIN', 'FINANCE', 'MODERATOR']
): Promise<{ user: User | null; errorResponse: NextResponse | null }> {
  const user = await getUserFromRequest(req);
  if (!user) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required to access Admin Command Center.',
          },
        },
        { status: 401 }
      ),
    };
  }

  const hasRole = checkUserHasRole(user, allowedRoles);
  if (!hasRole) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Insufficient administrative privileges.',
          },
        },
        { status: 403 }
      ),
    };
  }

  return { user, errorResponse: null };
}

export async function recordAuditLog(params: {
  actorId: string;
  action: string;
  entityName: string;
  entityId: string;
  oldState?: any;
  newState?: any;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  try {
    await query(
      `INSERT INTO audit_logs (actor_id, action, entity_name, entity_id, old_state, new_state, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        params.actorId,
        params.action,
        params.entityName,
        params.entityId,
        params.oldState ? JSON.stringify(params.oldState) : null,
        params.newState ? JSON.stringify(params.newState) : null,
        params.ipAddress || '127.0.0.1',
        params.userAgent || 'Talent5-Admin-UI',
      ]
    );
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}
