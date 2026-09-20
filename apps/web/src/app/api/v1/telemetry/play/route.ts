import { NextRequest, NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

const QUALIFIED_STREAM_THRESHOLD_SECONDS = 30;

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    const body = await req.json();
    const { songId, durationPlayedSeconds, deviceFingerprint } = body;

    if (!songId || typeof durationPlayedSeconds !== 'number') {
      return NextResponse.json(
        { success: false, message: 'songId and numeric durationPlayedSeconds are required.' },
        { status: 400 }
      );
    }

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
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

      return NextResponse.json({
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
    return NextResponse.json(
      { success: false, message: error.message || 'Telemetry recording failed.' },
      { status: 500 }
    );
  }
}
