import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { signToken } from '@/lib/auth';
import { verifyPassword } from '@talent5/utils';
import { UserRole } from '@talent5/types';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Query user and roles
    const userRes = await query(
      `SELECT u.id, u.email, u.password_hash, u.full_name as "fullName", 
              u.username, u.avatar_url as "avatarUrl", u.phone, 
              u.is_verified as "isVerified", u.status, u.created_at as "createdAt",
              COALESCE(array_agg(r.name) FILTER (WHERE r.name IS NOT NULL), '{}') as roles
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       WHERE LOWER(u.email) = $1
       GROUP BY u.id`,
      [cleanEmail]
    );

    if (userRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const userRow = userRes.rows[0];

    if (userRow.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, message: 'Account has been suspended. Contact support.' },
        { status: 403 }
      );
    }

    const isMatch = await verifyPassword(password, userRow.password_hash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const roles: UserRole[] = userRow.roles || ['USER'];

    const token = signToken({
      id: userRow.id,
      email: userRow.email,
      username: userRow.username,
      roles,
    });

    const user = {
      id: userRow.id,
      email: userRow.email,
      fullName: userRow.fullName,
      username: userRow.username,
      avatarUrl: userRow.avatarUrl,
      phone: userRow.phone,
      isVerified: userRow.isVerified,
      status: userRow.status,
      roles,
      createdAt: userRow.createdAt,
    };

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'An unexpected authentication error occurred' },
      { status: 500 }
    );
  }
}
