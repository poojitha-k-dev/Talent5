import { Router, Request, Response } from 'express';
import { query, getClient } from '../lib/db';
import { getUserFromRequest } from '../lib/auth';

const router = Router();
const QUALIFIED_STREAM_THRESHOLD_SECONDS = 30;

// POST /api/v1/telemetry/play
router.post('/play', async (req: Request, res: Response) => {
  try {
    const user = await getUserFromRequest(req);
    const { songId, durationPlayedSeconds, deviceFingerprint } = req.body;

    if (!songId || typeof durationPlayedSeconds !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'songId and numeric durationPlayedSeconds are required.',
      });
    }

    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const isQualified = durationPlayedSeconds >= QUALIFIED_STREAM_THRESHOLD_SECONDS;

    const client = await getClient();
    try {
      await client.query('BEGIN');

      // 1. Record play event into song_plays ledger
      await client.query(
        `INSERT INTO song_plays (song_id, user_id, duration_played_seconds, is_qualified, ip_hash, device_fingerprint)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          songId,
          user?.id || null,
          Math.round(durationPlayedSeconds),
          isQualified,
          ip,
          deviceFingerprint || 'web-browser',
        ]
      );

      // 2. If qualified stream (>= 30s), increment play counts
      if (isQualified) {
        const songUpdate = await client.query(
          `UPDATE songs 
           SET play_count = play_count + 1,
               popularity_score = popularity_score + 1
           WHERE id = $1
           RETURNING artist_id`,
          [songId]
        );

        if (songUpdate.rows.length > 0) {
          const artistId = songUpdate.rows[0].artist_id;
          await client.query(
            `UPDATE artists SET total_plays = total_plays + 1 WHERE id = $1`,
            [artistId]
          );
        }
      }

      await client.query('COMMIT');

      return res.status(200).json({
        success: true,
        data: {
          songId,
          durationPlayedSeconds,
          isQualified,
          thresholdSeconds: QUALIFIED_STREAM_THRESHOLD_SECONDS,
        },
      });
    } catch (dbErr) {
      await client.query('ROLLBACK');
      throw dbErr;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Play telemetry error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Telemetry recording failed.',
    });
  }
});

export default router;
