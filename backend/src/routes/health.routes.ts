import { Router, Request, Response } from 'express';
import { query } from '../lib/db';

const router = Router();

// GET /api/v1/health
router.get('/', async (req: Request, res: Response) => {
  const startTime = Date.now();
  try {
    const dbRes = await query('SELECT NOW() as current_time, count(*) as user_count FROM users');
    const latency = Date.now() - startTime;

    return res.status(200).json({
      success: true,
      service: 'Talent5 Production Express API',
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
    return res.status(500).json({
      success: false,
      status: 'DEGRADED',
      error: error.message,
    });
  }
});

export default router;
