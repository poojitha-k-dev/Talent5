import { NextRequest, NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required to save songs to library.' },
        { status: 401 }
      );
    }

    const { songId } = await req.json();
    if (!songId) {
      return NextResponse.json(
        { success: false, message: 'songId is required.' },
        { status: 400 }
      );
    }

    const client = await getClient();
    try {
      await client.query('BEGIN');

      // Check if already saved
      const checkRes = await client.query(
        'SELECT id FROM saved_songs WHERE user_id = $1 AND song_id = $2',
        [user.id, songId]
      );

      if (checkRes.rows.length > 0) {
        // Toggle: remove from saved
        await client.query(
          'DELETE FROM saved_songs WHERE user_id = $1 AND song_id = $2',
          [user.id, songId]
        );
        await client.query('COMMIT');
        return NextResponse.json({
          success: true,
          action: 'UNSAVED',
          message: 'Song removed from saved library.',
        });
      }

      // Save track
      await client.query(
        'INSERT INTO saved_songs (user_id, song_id) VALUES ($1, $2)',
        [user.id, songId]
      );
      await client.query('COMMIT');

      return NextResponse.json({
        success: true,
        action: 'SAVED',
        message: 'Song saved to your library.',
      });
    } catch (dbErr) {
      await client.query('ROLLBACK');
      throw dbErr;
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('Save toggle error:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Failed to save song.' },
      { status: 500 }
    );
  }
}
