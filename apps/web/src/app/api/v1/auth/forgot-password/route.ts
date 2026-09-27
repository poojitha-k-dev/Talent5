import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword } from '@talent5/utils';
import { sendPasswordResetEmail, isEmailServiceConfigured } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Check if user exists in database
    const userRes = await query(
      'SELECT id, email, full_name as "fullName", auth_provider as "authProvider", password_hash as "passwordHash" FROM users WHERE LOWER(email) = $1',
      [cleanEmail]
    );

    // If email is NOT registered in database, inform the user clearly
    if (userRes.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          notRegistered: true,
          message: `The email "${cleanEmail}" is not registered on Talent5. Please check the spelling or create a free account.`,
          email: cleanEmail,
        },
        { status: 404 }
      );
    }

    const user = userRes.rows[0];

    // If account was created with Google OAuth and has no password, refuse OTP generation
    if (user.authProvider === 'google' && !user.passwordHash) {
      return NextResponse.json(
        {
          success: false,
          isGoogleAccount: true,
          message: 'This account uses Google Sign-In. Please continue with Google to sign in.',
          email: cleanEmail,
        },
        { status: 400 }
      );
    }

    // 2. Generate secure 6-digit OTP (10 minutes expiry)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await hashPassword(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Invalidate any older unused OTPs for this user
    await query(
      'UPDATE password_resets SET used = TRUE WHERE user_id = $1 AND used = FALSE',
      [user.id]
    );

    // 3. Store OTP hash in database (protects plain OTP from database compromise)
    await query(
      `INSERT INTO password_resets (user_id, email, otp_hash, expires_at, attempts, used)
       VALUES ($1, $2, $3, $4, 0, FALSE)`,
      [user.id, cleanEmail, otpHash, expiresAt]
    );

    // 4. Send verification email via Gmail SMTP
    const emailResult = await sendPasswordResetEmail({
      to: cleanEmail,
      fullName: user.fullName || 'User',
      code: otp,
    });

    if (!emailResult.sent) {
      return NextResponse.json(
        {
          success: false,
          message: emailResult.error || 'Failed to send verification email via Gmail SMTP. Check server terminal logs.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${cleanEmail}. Please check your Gmail inbox.`,
      email: cleanEmail,
    });
  } catch (error: any) {
    console.error('Forgot password error:', error.message || error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
