import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserRole, JWTPayload } from '@talent5/types';
import { query } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'talent5_super_secure_jwt_secret_key_2026_desi_music_platform_ultra';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '7d';

export function signToken(payload: { id: string; email: string; roles: UserRole[]; username: string }): string {
  return jwt.sign(
    {
      sub: payload.id,
      email: payload.email,
      roles: payload.roles,
      username: payload.username,
    },
    JWT_SECRET,
    { expiresIn: (JWT_EXPIRATION as any) || '7d' }
  );
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function extractTokenFromHeader(req: Request): string | null {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  // Check cookie fallback
  const cookies = req.headers['cookie'];
  if (cookies) {
    const match = cookies.match(/talent5_token=([^;]+)/);
    if (match) return match[1];
  }
  return null;
}

export async function getUserFromRequest(req: Request): Promise<User | null> {
  const token = extractTokenFromHeader(req);
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload || !payload.sub) return null;

  const userRes = await query(
    `SELECT u.id, u.email, u.full_name as "fullName", u.username, u.avatar_url as "avatarUrl", 
            u.phone, u.auth_provider as "authProvider", u.is_verified as "isVerified", u.status, u.created_at as "createdAt", u.updated_at as "updatedAt",
            COALESCE(array_agg(r.name) FILTER (WHERE r.name IS NOT NULL), '{}') as roles
     FROM users u
     LEFT JOIN user_roles ur ON u.id = ur.user_id
     LEFT JOIN roles r ON ur.role_id = r.id
     WHERE u.id = $1 AND u.status = 'ACTIVE'
     GROUP BY u.id`,
    [payload.sub]
  );

  if (userRes.rows.length === 0) return null;
  return userRes.rows[0] as User;
}

export function checkUserHasRole(user: User | null, allowedRoles: UserRole[]): boolean {
  if (!user) return false;
  if (user.roles.includes('SUPER_ADMIN')) return true;
  return allowedRoles.some((role) => user.roles.includes(role));
}

// Express Middleware: Require Authentication
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }
    (req as any).user = user;
    next();
  } catch (err: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
}

// Express Middleware: Require Specific Role(s)
export function requireRoles(allowedRoles: UserRole[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user || (await getUserFromRequest(req));
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }
    (req as any).user = user;
    if (!checkUserHasRole(user, allowedRoles)) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Insufficient privileges' },
      });
    }
    next();
  };
}
