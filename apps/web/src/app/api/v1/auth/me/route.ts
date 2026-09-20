import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized or session expired' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { user },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
