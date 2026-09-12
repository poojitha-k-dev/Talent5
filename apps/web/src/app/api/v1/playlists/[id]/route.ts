import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const playlistRes = await query(
      `SELECT p.id, p.name, p.slug, p.description, p.cover_url as "coverUrl",
              p.visibility, p.created_at as "createdAt",
              u.id as "userId", u.full_name as "curatorName", u.username as "curatorUsername"
       FROM playlists p
       JOIN users u ON p.user_id = u.id
       WHERE p.id::text = $1 OR p.slug = $1
       LIMIT 1`,
      [id]
    );

    if (playlistRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Playlist not found' },
        { status: 404 }
      );
    }

    const playlist = playlistRes.rows[0];

    const songsRes = await query(
      `SELECT s.id, s.title, s.slug, s.duration_seconds as "durationSeconds",
              s.audio_url as "audioUrl", s.artwork_url as "artworkUrl",
              s.play_count as "playCount", s.valid_likes_count as "validLikesCount",
              a.id as "artistId", a.name as "artistName",
              l.name as "languageName", ps.position, ps.added_at as "addedAt"
       FROM playlist_songs ps
       JOIN songs s ON ps.song_id = s.id
       JOIN artists a ON s.artist_id = a.id
       JOIN languages l ON s.language_id = l.id
       WHERE ps.playlist_id = $1
       ORDER BY ps.position ASC`,
      [playlist.id]
    );

    return NextResponse.json({
      success: true,
      data: {
        playlist,
        songs: songsRes.rows,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = params;
    const { songId } = await req.json();

    if (!songId) {
      return NextResponse.json(
        { success: false, message: 'songId is required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const ownerCheck = await query('SELECT user_id FROM playlists WHERE id = $1', [id]);
    if (ownerCheck.rows.length === 0 || ownerCheck.rows[0].user_id !== user.id) {
      return NextResponse.json(
        { success: false, message: 'You can only add tracks to your own playlists' },
        { status: 403 }
      );
    }

    // Determine current position
    const posRes = await query('SELECT COALESCE(MAX(position), 0) + 1 as next_pos FROM playlist_songs WHERE playlist_id = $1', [id]);
    const nextPos = posRes.rows[0].next_pos;

    await query(
      `INSERT INTO playlist_songs (playlist_id, song_id, position)
       VALUES ($1, $2, $3)
       ON CONFLICT (playlist_id, song_id) DO NOTHING`,
      [id, songId, nextPos]
    );

    return NextResponse.json({
      success: true,
      message: 'Song added to playlist',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = params;
    const { searchParams } = new URL(req.url);
    const songId = searchParams.get('songId');

    if (!songId) {
      return NextResponse.json(
        { success: false, message: 'songId query parameter required' },
        { status: 400 }
      );
    }

    const ownerCheck = await query('SELECT user_id FROM playlists WHERE id = $1', [id]);
    if (ownerCheck.rows.length === 0 || ownerCheck.rows[0].user_id !== user.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    await query(
      'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2',
      [id, songId]
    );

    return NextResponse.json({
      success: true,
      message: 'Song removed from playlist',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
