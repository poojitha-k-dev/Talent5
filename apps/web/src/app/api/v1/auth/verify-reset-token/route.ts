import { NextRequest, NextResponse } from 'next/server';
import { verifyResetToken } from '@/lib/reset-tokens';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { valid: false, message: 'Missing reset token in verification link.' },
        { status: 400 }
      );
    }

    const result = verifyResetToken(token);

    if (!result.valid) {
      return NextResponse.json(
        { valid: false, message: 'This password reset link is invalid or has expired. Please request a new link.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      email: result.email,
      message: 'Token is valid.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { valid: false, message: error.message || 'Verification failed.' },
      { status: 500 }
    );
  }
}
