import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required to access library' },
        { status: 401 }
      );
    }

    // 1. Liked Songs
    const likedSongsRes = await query(
      `SELECT s.id, s.title, s.slug, s.duration_seconds as "durationSeconds",
              s.audio_url as "audioUrl", s.artwork_url as "artworkUrl",
              s.valid_likes_count as "validLikesCount", s.play_count as "playCount",
              a.id as "artistId", a.name as "artistName",
              l.name as "languageName", g.name as "genreName",
              lk.created_at as "likedAt"
       FROM likes lk
       JOIN songs s ON lk.target_id = s.id
       JOIN artists a ON s.artist_id = a.id
       JOIN languages l ON s.language_id = l.id
       JOIN genres g ON s.genre_id = g.id
       WHERE lk.user_id = $1 AND lk.target_type = 'SONG'
       ORDER BY lk.created_at DESC`,
      [user.id]
    );

    // 2. Playlists
    const playlistsRes = await query(
      `SELECT p.id, p.name, p.slug, p.description, p.cover_url as "coverUrl",
              p.visibility, p.created_at as "createdAt",
              COUNT(ps.id) as "songCount"
       FROM playlists p
       LEFT JOIN playlist_songs ps ON p.id = ps.playlist_id
       WHERE p.user_id = $1
       GROUP BY p.id
       ORDER BY p.created_at DESC`,
      [user.id]
    );

    // 3. Followed Artists
    const followedArtistsRes = await query(
      `SELECT a.id, a.name, a.slug, a.avatar_url as "avatarUrl", a.is_verified as "isVerified",
              a.followers_count as "followersCount", f.created_at as "followedAt"
       FROM follows f
       JOIN artists a ON f.target_id = a.id
       WHERE f.follower_id = $1 AND f.target_type = 'ARTIST'
       ORDER BY f.created_at DESC`,
      [user.id]
    );

    return NextResponse.json({
      success: true,
      data: {
        likedSongs: likedSongsRes.rows,
        playlists: playlistsRes.rows,
        followedArtists: followedArtistsRes.rows,
      },
    });
  } catch (error: any) {
    console.error('Library error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
