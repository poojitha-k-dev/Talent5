import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const artistRes = await query(
      `SELECT a.id, a.name, a.slug, a.bio, a.avatar_url as "avatarUrl", 
              a.cover_url as "coverUrl", a.is_verified as "isVerified", 
              a.total_plays as "totalPlays", a.followers_count as "followersCount",
              a.user_id as "userId", a.created_at as "createdAt",
              cp.id as "creatorProfileId", cp.category as "creatorCategory",
              cp.is_approved as "isApprovedCreator", cp.verified_badge as "creatorVerifiedBadge"
       FROM artists a
       LEFT JOIN creator_profiles cp ON a.user_id = cp.user_id
       WHERE a.id::text = $1 OR a.slug = $1
       LIMIT 1`,
      [id]
    );

    if (artistRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Artist not found' },
        { status: 404 }
      );
    }

    const artist = artistRes.rows[0];

    // Artist Top Songs
    const songsRes = await query(
      `SELECT s.id, s.title, s.slug, s.duration_seconds as "durationSeconds",
              s.audio_url as "audioUrl", s.artwork_url as "artworkUrl",
              s.play_count as "playCount", s.valid_likes_count as "validLikesCount",
              s.release_date as "releaseDate",
              l.name as "languageName", g.name as "genreName"
       FROM songs s
       JOIN languages l ON s.language_id = l.id
       JOIN genres g ON s.genre_id = g.id
       WHERE s.artist_id = $1 AND s.status = 'PUBLISHED'
       ORDER BY s.popularity_score DESC, s.play_count DESC
       LIMIT 15`,
      [artist.id]
    );

    // Artist Albums
    const albumsRes = await query(
      `SELECT al.id, al.title, al.slug, al.release_date as "releaseDate",
              al.cover_url as "coverUrl", al.type,
              COUNT(s.id) as "songCount"
       FROM albums al
       LEFT JOIN songs s ON al.id = s.album_id
       WHERE al.artist_id = $1
       GROUP BY al.id
       ORDER BY al.release_date DESC`,
      [artist.id]
    );

    // Desi Music Content (if creator)
    let desiContent: any[] = [];
    if (artist.creatorProfileId) {
      const desiRes = await query(
        `SELECT dmc.id, dmc.video_url as "videoUrl", dmc.views_count as "viewsCount",
                s.id as "songId", s.title, s.artwork_url as "coverUrl", s.audio_url as "audioUrl",
                s.duration_seconds as "durationSeconds", s.valid_likes_count as "validLikesCount"
         FROM desi_music_content dmc
         JOIN songs s ON dmc.song_id = s.id
         WHERE dmc.creator_id = $1`,
        [artist.creatorProfileId]
      );
      desiContent = desiRes.rows;
    }

    return NextResponse.json({
      success: true,
      data: {
        artist,
        songs: songsRes.rows,
        albums: albumsRes.rows,
        desiContent,
      },
    });
  } catch (error: any) {
    console.error('Artist detail error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
