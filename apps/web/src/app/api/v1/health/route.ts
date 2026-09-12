import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  const startTime = Date.now();
  try {
    const dbRes = await query('SELECT NOW() as current_time, count(*) as user_count FROM users');
    const latency = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      service: 'Talent5 Production API',
      status: 'HEALTHY',
      timestamp: new Date().toISOString(),
      database: {
        status: 'CONNECTED',
        latencyMs: latency,
        currentTime: dbRes.rows[0]?.current_time,
        registeredUsers: parseInt(dbRes.rows[0]?.user_count || '0', 10),
      },
      tagline: 'Real Voices. Original Stories. Desi Talent.',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        status: 'DEGRADED',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
