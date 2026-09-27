import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { query } from '@/lib/db';
import { verifyPassword } from '@talent5/utils';

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: 'Email and 6-digit verification code are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();

    // 1. Fetch latest active reset record for this email
    const recordRes = await query(
      `SELECT id, user_id as "userId", otp_hash as "otpHash", expires_at as "expiresAt", attempts, used
       FROM password_resets
       WHERE LOWER(email) = $1 AND used = FALSE
       ORDER BY created_at DESC
       LIMIT 1`,
      [cleanEmail]
    );

    if (recordRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No active verification code found. Please request a new code.' },
        { status: 400 }
      );
    }

    const record = recordRes.rows[0];

    // 2. Check maximum attempts limit (brute-force protection)
    if (record.attempts >= 5) {
      return NextResponse.json(
        { success: false, message: 'Too many incorrect attempts. Please request a new verification code.' },
        { status: 429 }
      );
    }

    // 3. Check expiration (10 minutes)
    if (new Date(record.expiresAt).getTime() < Date.now()) {
      return NextResponse.json(
        { success: false, message: 'Verification code has expired. Please request a new code.' },
        { status: 400 }
      );
    }

    // 4. Verify OTP strictly against stored hash in PostgreSQL
    const isMatch = await verifyPassword(cleanOtp, record.otpHash);

    if (!isMatch) {
      // Increment attempts
      await query('UPDATE password_resets SET attempts = attempts + 1 WHERE id = $1', [record.id]);
      const remaining = 4 - record.attempts;
      return NextResponse.json(
        {
          success: false,
          message: `Incorrect verification code. ${remaining > 0 ? `${remaining} attempts remaining.` : 'Code locked.'}`,
        },
        { status: 400 }
      );
    }

    // 5. Generate secure cryptographic reset token valid for 15 minutes
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await query(
      `UPDATE password_resets 
       SET reset_token = $1, expires_at = $2 
       WHERE id = $3`,
      [resetToken, tokenExpiry, record.id]
    );

    return NextResponse.json({
      success: true,
      message: 'Verification code confirmed. You can now set your new password.',
      resetToken,
    });
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Verification failed' },
      { status: 500 }
    );
  }
}
