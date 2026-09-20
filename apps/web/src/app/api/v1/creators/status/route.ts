import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // 1. Check if user has an approved creator profile
    const profileRes = await query(
      `SELECT cp.id, cp.stage_name as "stageName", cp.bio, cp.city, cp.state,
              cp.category, cp.is_approved as "isApproved", cp.verified_badge as "verifiedBadge",
              cp.portfolio_url as "portfolioUrl", cp.created_at as "createdAt",
              cw.available_balance_inr as "availableBalanceINR",
              cw.total_earned_inr as "totalEarnedINR"
       FROM creator_profiles cp
       LEFT JOIN creator_wallets cw ON cp.id = cw.creator_id
       WHERE cp.user_id = $1`,
      [user.id]
    );

    if (profileRes.rows.length > 0) {
      return NextResponse.json({
        success: true,
        isCreator: true,
        profile: profileRes.rows[0],
      });
    }

    // 2. Check pending or recent application
    const appRes = await query(
      `SELECT id, stage_name as "stageName", category, status, created_at as "createdAt",
              review_notes as "reviewNotes"
       FROM creator_applications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [user.id]
    );

    return NextResponse.json({
      success: true,
      isCreator: false,
      application: appRes.rows[0] || null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
