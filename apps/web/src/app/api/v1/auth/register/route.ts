import { NextRequest, NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db';
import { signToken } from '@/lib/auth';
import { hashPassword, slugify } from '@talent5/utils';
import { UserRole } from '@talent5/types';

export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName, username } = await req.json();

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { success: false, message: 'Email, password, and full name are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username
      ? slugify(username.trim())
      : slugify(fullName.trim()) + Math.floor(100 + Math.random() * 900);

    // Check duplicate email or username
    const existing = await query(
      'SELECT id FROM users WHERE LOWER(email) = $1 OR LOWER(username) = $2',
      [cleanEmail, cleanUsername.toLowerCase()]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: 'An account with this email or username already exists' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const client = await getClient();
    let newUserId: string;
    try {
      await client.query('BEGIN');

      const userInsert = await client.query(
        `INSERT INTO users (email, password_hash, full_name, username, auth_provider, is_verified, status)
         VALUES ($1, $2, $3, $4, 'password', FALSE, 'ACTIVE')
         RETURNING id, email, full_name as "fullName", username, avatar_url as "avatarUrl", 
                   phone, is_verified as "isVerified", status, created_at as "createdAt"`,
        [cleanEmail, passwordHash, fullName.trim(), cleanUsername]
      );

      newUserId = userInsert.rows[0].id;

      // Assign default USER role (role_id = 1)
      await client.query(
        `INSERT INTO user_roles (user_id, role_id) VALUES ($1, 1)`,
        [newUserId]
      );

      await client.query('COMMIT');

      const roles: UserRole[] = ['USER'];
      const token = signToken({
        id: newUserId,
        email: cleanEmail,
        username: cleanUsername,
        roles,
      });

      return NextResponse.json(
        {
          success: true,
          message: 'Account created successfully',
          data: {
            token,
            user: {
              ...userInsert.rows[0],
              roles,
            },
          },
        },
        { status: 201 }
      );
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create account' },
      { status: 500 }
    );
  }
}
