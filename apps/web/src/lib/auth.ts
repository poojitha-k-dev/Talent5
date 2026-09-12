import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
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
    { expiresIn: JWT_EXPIRATION }
  );
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function extractTokenFromHeader(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  // Check cookie fallback
  const cookieToken = req.cookies.get('talent5_token')?.value;
  return cookieToken || null;
}

export async function getUserFromRequest(req: NextRequest): Promise<User | null> {
  const token = extractTokenFromHeader(req);
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload || !payload.sub) return null;

  const userRes = await query(
    `SELECT u.id, u.email, u.full_name as "fullName", u.username, u.avatar_url as "avatarUrl", 
            u.phone, u.is_verified as "isVerified", u.status, u.created_at as "createdAt", u.updated_at as "updatedAt",
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
  if (user.roles.includes('SUPER_ADMIN')) return true; // Super admin possesses all privileges
  return allowedRoles.some((role) => user.roles.includes(role));
}
