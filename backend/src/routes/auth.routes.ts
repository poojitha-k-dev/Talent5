import { Router, Request, Response } from 'express';
import { query, getClient } from '../lib/db';
import { signToken, getUserFromRequest, authenticate } from '../lib/auth';
import { hashPassword, verifyPassword, slugify } from '@talent5/utils';
import { UserRole } from '@talent5/types';
import { sendPasswordResetEmail, isEmailServiceConfigured } from '../lib/email';

const router = Router();

// POST /api/v1/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();

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
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const userRow = userRes.rows[0];

    if (userRow.status !== 'ACTIVE') {
      return res.status(403).json({ success: false, message: 'Account has been suspended. Contact support.' });
    }

    const isMatch = await verifyPassword(password, userRow.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
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

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
});

// POST /api/v1/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, username } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ success: false, message: 'Email, password, and full name are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username
      ? slugify(username.trim())
      : slugify(fullName.trim()) + Math.floor(100 + Math.random() * 900);

    const existing = await query(
      'SELECT id FROM users WHERE LOWER(email) = $1 OR LOWER(username) = $2',
      [cleanEmail, cleanUsername.toLowerCase()]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'An account with this email or username already exists' });
    }

    const passwordHash = await hashPassword(password);
    const client = await getClient();

    try {
      await client.query('BEGIN');

      const userInsert = await client.query(
        `INSERT INTO users (email, password_hash, full_name, username, auth_provider, is_verified, status)
         VALUES ($1, $2, $3, $4, 'password', FALSE, 'ACTIVE')
         RETURNING id, email, full_name as "fullName", username, avatar_url as "avatarUrl", 
                   phone, is_verified as "isVerified", status, created_at as "createdAt"`,
        [cleanEmail, passwordHash, fullName.trim(), cleanUsername]
      );

      const newUserId = userInsert.rows[0].id;

      // Assign default USER role (role_id = 1)
      await client.query(`INSERT INTO user_roles (user_id, role_id) VALUES ($1, 1)`, [newUserId]);

      await client.query('COMMIT');

      const roles: UserRole[] = ['USER'];
      const token = signToken({
        id: newUserId,
        email: cleanEmail,
        username: cleanUsername,
        roles,
      });

      return res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: {
          token,
          user: {
            ...userInsert.rows[0],
            roles,
          },
        },
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to create account' });
  }
});

// GET /api/v1/auth/me
router.get('/me', async (req: Request, res: Response) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized or session expired' });
    }
    return res.status(200).json({ success: true, data: { user } });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/auth/forgot-password
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const userRes = await query(
      'SELECT id, email, full_name as "fullName", auth_provider as "authProvider", password_hash as "passwordHash" FROM users WHERE LOWER(email) = $1',
      [cleanEmail]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        notRegistered: true,
        message: `The email "${cleanEmail}" is not registered on Talent5.`,
        email: cleanEmail,
      });
    }

    const user = userRes.rows[0];
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await hashPassword(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await query('UPDATE password_resets SET used = TRUE WHERE user_id = $1 AND used = FALSE', [user.id]);
    await query(
      'INSERT INTO password_resets (user_id, token_hash, expires_at, used) VALUES ($1, $2, $3, FALSE)',
      [user.id, otpHash, expiresAt]
    );

    const emailConfigured = isEmailServiceConfigured();
    let emailResult: { sent: boolean; error?: string } = { sent: false, error: 'Email delivery not configured in dev mode' };

    if (emailConfigured) {
      try {
        emailResult = await sendPasswordResetEmail({ to: cleanEmail, fullName: user.fullName, code: otp });
      } catch (err: any) {
        console.error('Email send failed:', err);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Verification code generated.',
      email: cleanEmail,
      devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/auth/reset-password
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, code, and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const userRes = await query('SELECT id FROM users WHERE LOWER(email) = $1', [cleanEmail]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const userId = userRes.rows[0].id;
    const resets = await query(
      'SELECT id, token_hash, expires_at FROM password_resets WHERE user_id = $1 AND used = FALSE ORDER BY created_at DESC LIMIT 1',
      [userId]
    );

    if (resets.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'No active password reset request found' });
    }

    const resetRecord = resets.rows[0];
    if (new Date() > new Date(resetRecord.expires_at)) {
      return res.status(400).json({ success: false, message: 'Verification code has expired' });
    }

    const isValid = await verifyPassword(code, resetRecord.token_hash);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid verification code' });
    }

    const passwordHash = await hashPassword(newPassword);
    await query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [passwordHash, userId]);
    await query('UPDATE password_resets SET used = TRUE WHERE id = $1', [resetRecord.id]);

    return res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
