import { Request, Response, NextFunction } from 'express';
import { User, UserRole } from '@talent5/types';
import { getUserFromRequest, checkUserHasRole } from './auth';
import { query } from './db';

export async function authenticateAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const allowedRoles: UserRole[] = ['ADMIN', 'SUPER_ADMIN', 'FINANCE', 'MODERATOR'];
  const user = (req as any).user || (await getUserFromRequest(req));

  if (!user) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required to access Admin Command Center.' },
    });
  }

  const hasRole = checkUserHasRole(user, allowedRoles);
  if (!hasRole) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Insufficient administrative privileges.' },
    });
  }

  (req as any).user = user;
  next();
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
        params.ipAddress || null,
        params.userAgent || null,
      ]
    );
  } catch (err) {
    console.error('Failed to record audit log:', err);
  }
}
