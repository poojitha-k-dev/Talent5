import { Router, Request, Response } from 'express';
import crypto from 'crypto';
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

// GET /api/v1/auth/google
router.get('/google', async (req: Request, res: Response) => {
  try {
    const redirectPath = (req.query.redirect as string) || '/';
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    const frontendUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.FRONTEND_URL || 'http://localhost:3000';

    // Support instant development mock sign-in for testing without Google Cloud setup
    if (req.query.mock === 'true' && process.env.NODE_ENV !== 'production') {
      const mockEmail = (req.query.email as string) || 'google.user@talent5.com';
      const mockName = (req.query.name as string) || 'Google User';
      const mockGoogleId = `mock_google_id_${mockEmail.replace(/[^a-z0-9]/gi, '_')}`;
      const client = await getClient();
      let userRow: any;
      let roles: UserRole[] = ['USER'];

      try {
        await client.query('BEGIN');
        const existing = await client.query(
          `SELECT id, email, username, full_name as "fullName", avatar_url as "avatarUrl", 
                  auth_provider as "authProvider", google_id as "googleId"
           FROM users 
           WHERE google_id = $1 OR LOWER(email) = $2 
           LIMIT 1`,
          [mockGoogleId, mockEmail.toLowerCase()]
        );

        if (existing.rows.length > 0) {
          userRow = existing.rows[0];
        } else {
          const uName = slugify(mockName) + Math.floor(100 + Math.random() * 900);
          const ins = await client.query(
            `INSERT INTO users (email, password_hash, full_name, username, auth_provider, google_id, is_verified, status)
             VALUES ($1, NULL, $2, $3, 'google', $4, TRUE, 'ACTIVE')
             RETURNING id, email, username, full_name as "fullName", avatar_url as "avatarUrl"`,
            [mockEmail.toLowerCase(), mockName, uName, mockGoogleId]
          );
          userRow = ins.rows[0];
          await client.query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, 1) ON CONFLICT DO NOTHING', [userRow.id]);
        }
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }

      const token = signToken({ id: userRow.id, email: userRow.email, username: userRow.username, roles });
      return res.redirect(`${frontendUrl}/login?google_auth=success&token=${token}&redirect=${encodeURIComponent(redirectPath)}`);
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const isConfigured = Boolean(
      clientId &&
      clientId !== 'your_google_client_id.apps.googleusercontent.com' &&
      !clientId.includes('your_google') &&
      !clientId.includes('placeholder')
    );

    if (!isConfigured) {
      const errorMsg = encodeURIComponent(
        'Google Sign-In is not yet configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file, or use demo accounts / mock login.'
      );
      return res.redirect(`${frontendUrl}/login?error=${errorMsg}`);
    }

    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
    const protocol = (req.headers['x-forwarded-proto'] as string) || 'http';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;
    const redirectUri = `${baseUrl}/api/v1/auth/google/callback`;

    const statePayload = {
      csrf: crypto.randomBytes(16).toString('hex'),
      redirect: redirectPath,
      timestamp: Date.now(),
    };
    const state = Buffer.from(JSON.stringify(statePayload)).toString('base64url');

    const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    googleAuthUrl.searchParams.set('client_id', clientId!);
    googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
    googleAuthUrl.searchParams.set('response_type', 'code');
    googleAuthUrl.searchParams.set('scope', 'openid email profile');
    googleAuthUrl.searchParams.set('access_type', 'offline');
    googleAuthUrl.searchParams.set('prompt', 'select_account');
    googleAuthUrl.searchParams.set('state', state);

    return res.redirect(googleAuthUrl.toString());
  } catch (error: any) {
    console.error('Google OAuth init error:', error);
    const frontendUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(error.message || 'OAuth initialization failed')}`);
  }
});

// GET /api/v1/auth/google/callback
router.get('/google/callback', async (req: Request, res: Response) => {
  const frontendUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.FRONTEND_URL || 'http://localhost:3000';

  try {
    const code = req.query.code as string;
    const state = req.query.state as string;
    const error = req.query.error as string;

    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
    const protocol = (req.headers['x-forwarded-proto'] as string) || 'http';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;

    if (error) {
      console.warn('[Talent5 OAuth] Google returned error:', error);
      return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent('Google sign-in was canceled.')}`);
    }

    if (!code) {
      return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent('Missing authorization code from Google.')}`);
    }

    let targetRedirect = '/';
    if (state) {
      try {
        const decoded = JSON.parse(Buffer.from(state, 'base64url').toString('utf8'));
        if (decoded.redirect) targetRedirect = decoded.redirect;
      } catch (e) {
        console.warn('[Talent5 OAuth] Failed to decode state payload:', e);
      }
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${baseUrl}/api/v1/auth/google/callback`;

    if (!clientId || !clientSecret) {
      return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent('Google OAuth credentials not configured on server.')}`);
    }

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text();
      console.error('[Talent5 OAuth] Google token exchange failed:', errBody);
      return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent('Google authorization failed. Please try again.')}`);
    }

    const tokenData: any = await tokenRes.json();
    const accessToken = tokenData.access_token;

    const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userinfoRes.ok) {
      throw new Error('Failed to fetch verified user info from Google.');
    }

    const googleUser: any = await userinfoRes.json();
    const googleId = googleUser.sub;
    const email = googleUser.email?.trim().toLowerCase();
    const fullName = googleUser.name?.trim() || googleUser.given_name || 'Google User';
    const avatarUrl = googleUser.picture || null;

    if (!email) {
      return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent('Google account does not have an associated email.')}`);
    }

    const client = await getClient();
    let userRow: any;
    let roles: UserRole[] = ['USER'];

    try {
      await client.query('BEGIN');

      const existingRes = await client.query(
        `SELECT id, email, username, full_name as "fullName", avatar_url as "avatarUrl", 
                auth_provider as "authProvider", google_id as "googleId"
         FROM users 
         WHERE google_id = $1 OR LOWER(email) = $2 
         LIMIT 1`,
        [googleId, email]
      );

      if (existingRes.rows.length > 0) {
        userRow = existingRes.rows[0];
        if (!userRow.googleId) {
          await client.query(
            `UPDATE users 
             SET google_id = $1, 
                 is_verified = TRUE,
                 avatar_url = COALESCE(avatar_url, $2),
                 updated_at = NOW()
             WHERE id = $3`,
            [googleId, avatarUrl, userRow.id]
          );
        }
      } else {
        const baseUsername = slugify(fullName) || 'user';
        let candidateUsername = `${baseUsername}${Math.floor(100 + Math.random() * 900)}`;

        const unameCheck = await client.query('SELECT id FROM users WHERE username = $1', [candidateUsername]);
        if (unameCheck.rows.length > 0) {
          candidateUsername = `${baseUsername}${Date.now().toString().slice(-4)}`;
        }

        const insertRes = await client.query(
          `INSERT INTO users (
             email, password_hash, full_name, username, avatar_url, 
             google_id, auth_provider, is_verified, status
           )
           VALUES ($1, NULL, $2, $3, $4, $5, 'google', TRUE, 'ACTIVE')
           RETURNING id, email, username, full_name as "fullName", avatar_url as "avatarUrl"`,
          [email, fullName, candidateUsername, avatarUrl, googleId]
        );

        userRow = insertRes.rows[0];

        await client.query(
          `INSERT INTO user_roles (user_id, role_id)
           SELECT $1, id FROM roles WHERE name = 'USER'
           ON CONFLICT DO NOTHING`,
          [userRow.id]
        );
      }

      const rolesRes = await client.query(
        `SELECT r.name 
         FROM roles r 
         JOIN user_roles ur ON r.id = ur.role_id 
         WHERE ur.user_id = $1`,
        [userRow.id]
      );
      if (rolesRes.rows.length > 0) {
        roles = rolesRes.rows.map((r: any) => r.name as UserRole);
      }

      await client.query('COMMIT');
    } catch (dbErr) {
      await client.query('ROLLBACK');
      throw dbErr;
    } finally {
      client.release();
    }

    const jwtToken = signToken({
      id: userRow.id,
      email: userRow.email,
      username: userRow.username,
      roles,
    });

    const redirectUrl = new URL('/login', frontendUrl);
    redirectUrl.searchParams.set('google_auth', 'success');
    redirectUrl.searchParams.set('token', jwtToken);
    redirectUrl.searchParams.set('redirect', targetRedirect);

    res.cookie('talent5_token', jwtToken, {
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    console.log(`[Talent5 OAuth] Google authentication successful for: ${email} (google_id: ${googleId})`);
    return res.redirect(redirectUrl.toString());
  } catch (error: any) {
    console.error('[Talent5 OAuth] Google callback error:', error);
    return res.redirect(`${frontendUrl}/login?error=${encodeURIComponent(error.message || 'Google authentication failed')}`);
  }
});

export default router;
