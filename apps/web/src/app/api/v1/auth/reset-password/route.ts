import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword } from '@talent5/utils';
import { consumeResetToken } from '@/lib/reset-tokens';

export async function POST(req: NextRequest) {
  try {
    const { resetToken, token, newPassword, confirmPassword } = await req.json();

    const activeToken = resetToken || token;

    if (!newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Please provide both password fields.' },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Passwords do not match. Please re-enter both carefully.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    if (!activeToken) {
      return NextResponse.json(
        { success: false, message: 'Missing reset verification token. Please verify your OTP first.' },
        { status: 400 }
      );
    }

    // 1. First check the PostgreSQL password_resets table for this reset_token
    const dbTokenRes = await query(
      `SELECT id, user_id as "userId", email, expires_at as "expiresAt", used
       FROM password_resets
       WHERE reset_token = $1 AND used = FALSE
       ORDER BY created_at DESC
       LIMIT 1`,
      [activeToken]
    );

    let targetUserId: string | null = null;
    let targetEmail: string | null = null;
    let resetRecordId: string | null = null;

    if (dbTokenRes.rows.length > 0) {
      const record = dbTokenRes.rows[0];

      if (new Date(record.expiresAt).getTime() < Date.now()) {
        return NextResponse.json(
          { success: false, message: 'Your reset session has expired. Please request a new verification code.' },
          { status: 400 }
        );
      }

      targetUserId = record.userId;
      targetEmail = record.email;
      resetRecordId = record.id;
    } else {
      // Fallback: check in-memory token store (e.g. from direct link verification)
      const memCheck = consumeResetToken(activeToken);
      if (memCheck.valid && memCheck.email) {
        targetEmail = memCheck.email;
      } else {
        return NextResponse.json(
          { success: false, message: 'Invalid or already used reset session. Please request a new verification code.' },
          { status: 400 }
        );
      }
    }

    // 2. Hash the new password securely using bcrypt
    const passwordHash = await hashPassword(newPassword);

    // 3. Update database
    if (targetUserId) {
      await query(
        'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
        [passwordHash, targetUserId]
      );
    } else if (targetEmail) {
      await query(
        'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE LOWER(email) = $2',
        [passwordHash, targetEmail.toLowerCase()]
      );
    }

    // 4. Mark the reset token as used (single-use protection)
    if (resetRecordId) {
      await query('UPDATE password_resets SET used = TRUE WHERE id = $1', [resetRecordId]);
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset successful! You can now sign in with your new password.',
      email: targetEmail,
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
