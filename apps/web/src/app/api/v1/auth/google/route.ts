import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const redirectPath = searchParams.get('redirect') || '/';

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const isConfigured = Boolean(
      clientId &&
      clientId !== 'your_google_client_id.apps.googleusercontent.com' &&
      !clientId.includes('your_google')
    );

    if (!isConfigured) {
      // Provide clear error message if credentials haven't been provided in .env.local yet
      const errorMsg = encodeURIComponent(
        'Google OAuth is not yet configured with your Google Cloud Console Client ID. Please set GOOGLE_CLIENT_ID in apps/web/.env.local.'
      );
      return NextResponse.redirect(new URL(`/login?error=${errorMsg}`, req.url));
    }

    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;
    const redirectUri = `${baseUrl}/api/v1/auth/google/callback`;

    // Secure state payload containing random token and return URL
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

    const response = NextResponse.redirect(googleAuthUrl.toString());
    // Store CSRF state in cookie for callback validation
    response.cookies.set('talent5_oauth_state', statePayload.csrf, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Google OAuth init error:', error);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message || 'OAuth init failed')}`, req.url)
    );
  }
}
