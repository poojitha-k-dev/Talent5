import { NextRequest, NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required to follow artists' },
        { status: 401 }
      );
    }

    const { targetType, targetId } = await req.json();

    if (!targetType || !targetId) {
      return NextResponse.json(
        { success: false, message: 'targetType and targetId are required' },
        { status: 400 }
      );
    }

    const client = await getClient();
    try {
      await client.query('BEGIN');

      const existing = await client.query(
        'SELECT id FROM follows WHERE follower_id = $1 AND target_type = $2 AND target_id = $3',
        [user.id, targetType, targetId]
      );

      if (existing.rows.length > 0) {
        // Unfollow
        await client.query(
          'DELETE FROM follows WHERE follower_id = $1 AND target_type = $2 AND target_id = $3',
          [user.id, targetType, targetId]
        );

        if (targetType === 'ARTIST') {
          await client.query(
            'UPDATE artists SET followers_count = GREATEST(0, followers_count - 1) WHERE id = $1',
            [targetId]
          );
        }

        await client.query('COMMIT');
        return NextResponse.json({
          success: true,
          action: 'UNFOLLOWED',
          isFollowing: false,
        });
      }

      // Follow
      await client.query(
        'INSERT INTO follows (follower_id, target_type, target_id) VALUES ($1, $2, $3)',
        [user.id, targetType, targetId]
      );

      if (targetType === 'ARTIST') {
        await client.query(
          'UPDATE artists SET followers_count = followers_count + 1 WHERE id = $1',
          [targetId]
        );
      }

      await client.query('COMMIT');
      return NextResponse.json({
        success: true,
        action: 'FOLLOWED',
        isFollowing: true,
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
