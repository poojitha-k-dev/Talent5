import { NextRequest, NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db';
import { signToken } from '@/lib/auth';
import { slugify } from '@talent5/utils';
import { UserRole } from '@talent5/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;

    // Handle user cancellation on Google consent screen
    if (error) {
      console.warn('[Talent5 OAuth] Google returned error:', error);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent('Google sign-in was canceled.')}`, baseUrl)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent('Missing authorization code from Google.')}`, baseUrl)
      );
    }

    // Parse state
    let targetRedirect = '/';
    let csrfToken: string | null = null;
    if (state) {
      try {
        const decoded = JSON.parse(Buffer.from(state, 'base64url').toString('utf8'));
        if (decoded.redirect) targetRedirect = decoded.redirect;
        if (decoded.csrf) csrfToken = decoded.csrf;
      } catch (e) {
        console.warn('[Talent5 OAuth] Failed to decode state payload:', e);
      }
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${baseUrl}/api/v1/auth/google/callback`;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent('Google OAuth credentials not configured on server.')}`, baseUrl)
      );
    }

    // 1. Exchange authorization code for access token with Google
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
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent('Google authorization failed. Please try again.')}`, baseUrl)
      );
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // 2. Fetch verified Google profile
    const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userinfoRes.ok) {
      throw new Error('Failed to fetch verified user info from Google.');
    }

    const googleUser = await userinfoRes.json();
    // googleUser: { sub, name, given_name, family_name, picture, email, email_verified }
    const googleId = googleUser.sub;
    const email = googleUser.email?.trim().toLowerCase();
    const fullName = googleUser.name?.trim() || googleUser.given_name || 'Google User';
    const avatarUrl = googleUser.picture || null;

    if (!email) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent('Google account does not have an associated email.')}`, baseUrl)
      );
    }

    // 3. Find or Create User in PostgreSQL
    const client = await getClient();
    let userRow: any;
    let roles: UserRole[] = ['USER'];

    try {
      await client.query('BEGIN');

      // Check if user exists by google_id OR email
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
        // If not already linked with google_id, link it now and mark verified
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
        // Create brand new Google user
        // Generate a clean unique username
        const baseUsername = slugify(fullName) || 'user';
        let candidateUsername = `${baseUsername}${Math.floor(100 + Math.random() * 900)}`;

        // Ensure username is not already taken
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

        // Assign default USER role
        await client.query(
          `INSERT INTO user_roles (user_id, role_id)
           SELECT $1, id FROM roles WHERE name = 'USER'
           ON CONFLICT DO NOTHING`,
          [userRow.id]
        );
      }

      // Fetch user roles
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

    // 4. Issue Talent5 JWT
    const jwtToken = signToken({
      id: userRow.id,
      email: userRow.email,
      username: userRow.username,
      roles,
    });

    // 5. Construct redirect back to UI with session parameters
    const redirectUrl = new URL('/login', baseUrl);
    redirectUrl.searchParams.set('google_auth', 'success');
    redirectUrl.searchParams.set('token', jwtToken);
    redirectUrl.searchParams.set('redirect', targetRedirect);

    const response = NextResponse.redirect(redirectUrl);

    // Set talent5_token cookie
    response.cookies.set('talent5_token', jwtToken, {
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    // Clear state cookie
    response.cookies.set('talent5_oauth_state', '', { path: '/', maxAge: 0 });

    console.log(`[Talent5 OAuth] Google authentication successful for: ${email} (google_id: ${googleId})`);
    return response;
  } catch (error: any) {
    console.error('[Talent5 OAuth] Google callback error:', error);
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message || 'Google authentication failed')}`, baseUrl)
    );
  }
}
