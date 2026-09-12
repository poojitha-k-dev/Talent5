import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authenticateAdmin } from '@/lib/admin';

export async function GET(req: NextRequest) {
  const { user, errorResponse } = await authenticateAdmin(req);
  if (errorResponse) return errorResponse;

  try {
    const [
      usersCount,
      creatorsCount,
      pendingApps,
      pendingSubmissions,
      rightsVerified,
      rightsExpired,
      payoutLiability,
      payoutPendingCount,
      fraudEventsHigh,
      engagementStats,
      recentAuditLogs,
    ] = await Promise.all([
      query(`SELECT COUNT(*) as count FROM users WHERE status = 'ACTIVE'`),
      query(`SELECT COUNT(*) as count FROM creator_profiles WHERE is_approved = TRUE`),
      query(`SELECT COUNT(*) as count FROM creator_applications WHERE status IN ('PENDING', 'UNDER_REVIEW')`),
      query(`SELECT COUNT(*) as count FROM content_submissions WHERE status IN ('SUBMITTED', 'UNDER_REVIEW')`),
      query(`SELECT COUNT(*) as count FROM rights_records WHERE status = 'VERIFIED'`),
      query(`SELECT COUNT(*) as count FROM rights_records WHERE status IN ('EXPIRED', 'RESTRICTED')`),
      query(`SELECT COALESCE(SUM(amount_inr), 0) as total FROM payout_requests WHERE status IN ('REQUESTED', 'UNDER_REVIEW')`),
      query(`SELECT COUNT(*) as count FROM payout_requests WHERE status IN ('REQUESTED', 'UNDER_REVIEW')`),
      query(`SELECT COUNT(*) as count FROM fraud_events WHERE risk_score = 'HIGH'`),
      query(`SELECT COALESCE(SUM(play_count), 0) as plays, COALESCE(SUM(valid_likes_count), 0) as likes FROM songs`),
      query(`
        SELECT a.id, a.action, a.entity_name as "entityName", a.entity_id as "entityId", 
               a.created_at as "createdAt", u.email as "actorEmail", u.full_name as "actorName"
        FROM audit_logs a
        LEFT JOIN users u ON a.actor_id = u.id
        ORDER BY a.created_at DESC
        LIMIT 8
      `),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalUsers: parseInt(usersCount.rows[0].count, 10),
        totalCreators: parseInt(creatorsCount.rows[0].count, 10),
        pendingApplications: parseInt(pendingApps.rows[0].count, 10),
        pendingSubmissions: parseInt(pendingSubmissions.rows[0].count, 10),
        rightsVerified: parseInt(rightsVerified.rows[0].count, 10),
        rightsExpired: parseInt(rightsExpired.rows[0].count, 10),
        pendingPayoutLiabilityINR: parseFloat(payoutLiability.rows[0].total),
        pendingPayoutRequestsCount: parseInt(payoutPendingCount.rows[0].count, 10),
        highRiskFraudEvents: parseInt(fraudEventsHigh.rows[0].count, 10),
        totalPlays: parseInt(engagementStats.rows[0].plays, 10),
        totalValidLikes: parseInt(engagementStats.rows[0].likes, 10),
        recentAuditLogs: recentAuditLogs.rows,
      },
    });
  } catch (err: any) {
    console.error('Error fetching admin stats:', err);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: err.message } },
      { status: 500 }
    );
  }
}
