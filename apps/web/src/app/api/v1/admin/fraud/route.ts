import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authenticateAdmin } from '@/lib/admin';

export async function GET(req: NextRequest) {
  const { user, errorResponse } = await authenticateAdmin(req);
  if (errorResponse) return errorResponse;

  try {
    const [eventsRes, suspiciousLikesRes, riskCountsRes] = await Promise.all([
      query(`
        SELECT fe.id, fe.user_id as "userId", fe.event_type as "eventType", fe.risk_score as "riskScore",
               fe.evidence, fe.action_taken as "actionTaken", fe.created_at as "createdAt",
               u.email as "userEmail", u.full_name as "userName"
        FROM fraud_events fe
        LEFT JOIN users u ON fe.user_id = u.id
        ORDER BY fe.created_at DESC
        LIMIT 50
      `),
      query(`
        SELECT l.id, l.user_id as "userId", l.target_type as "targetType", l.target_id as "targetId",
               l.status, l.risk_score as "riskScore", l.ip_hash as "ipHash",
               l.device_fingerprint as "deviceFingerprint", l.user_agent as "userAgent", l.created_at as "createdAt",
               u.email as "userEmail", u.username
        FROM likes l
        JOIN users u ON l.user_id = u.id
        WHERE l.status IN ('SUSPICIOUS', 'INVALID')
        ORDER BY l.created_at DESC
        LIMIT 50
      `),
      query(`
        SELECT risk_score as "riskScore", COUNT(*) as count 
        FROM fraud_events 
        GROUP BY risk_score
      `),
    ]);

    const riskDistribution = {
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
    };
    riskCountsRes.rows.forEach((row: any) => {
      if (row.riskScore in riskDistribution) {
        (riskDistribution as any)[row.riskScore] = parseInt(row.count, 10);
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        events: eventsRes.rows,
        suspiciousLikes: suspiciousLikesRes.rows,
        riskDistribution,
      },
    });
  } catch (err: any) {
    console.error('Error fetching fraud cockpit data:', err);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: err.message } },
      { status: 500 }
    );
  }
}
