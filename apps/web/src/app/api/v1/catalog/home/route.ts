import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // 1. Trending Songs (Top popularity & play count)
    const trendingRes = await query(
      `SELECT s.id, s.title, s.slug, s.duration_seconds as "durationSeconds", 
              s.audio_url as "audioUrl", s.artwork_url as "artworkUrl",
              s.play_count as "playCount", s.valid_likes_count as "validLikesCount",
              s.release_date as "releaseDate", s.is_explicit as "isExplicit",
              s.popularity_score as "popularityScore", s.status,
              a.id as "artistId", a.name as "artistName",
              l.name as "languageName", g.name as "genreName"
       FROM songs s
       JOIN artists a ON s.artist_id = a.id
       JOIN languages l ON s.language_id = l.id
       JOIN genres g ON s.genre_id = g.id
       WHERE s.status = 'PUBLISHED'
       ORDER BY s.popularity_score DESC, s.play_count DESC
       LIMIT 8`
    );

    // 2. New Releases
    const newReleasesRes = await query(
      `SELECT s.id, s.title, s.slug, s.duration_seconds as "durationSeconds", 
              s.audio_url as "audioUrl", s.artwork_url as "artworkUrl",
              s.play_count as "playCount", s.valid_likes_count as "validLikesCount",
              s.release_date as "releaseDate", s.status,
              a.id as "artistId", a.name as "artistName",
              l.name as "languageName", g.name as "genreName"
       FROM songs s
       JOIN artists a ON s.artist_id = a.id
       JOIN languages l ON s.language_id = l.id
       JOIN genres g ON s.genre_id = g.id
       WHERE s.status = 'PUBLISHED'
       ORDER BY s.release_date DESC, s.created_at DESC
       LIMIT 8`
    );

    // 3. Featured Artists
    const artistsRes = await query(
      `SELECT a.id, a.name, a.slug, a.bio, a.avatar_url as "avatarUrl", 
              a.cover_url as "coverUrl", a.is_verified as "isVerified",
              a.total_plays as "totalPlays", a.followers_count as "followersCount",
              COUNT(s.id) as "songCount"
       FROM artists a
       LEFT JOIN songs s ON a.id = s.artist_id
       GROUP BY a.id
       ORDER BY a.followers_count DESC
       LIMIT 6`
    );

    // 4. 13 Languages with Song Counts
    const languagesRes = await query(
      `SELECT l.id, l.code, l.name, l.native_name as "nativeName", 
              COUNT(s.id) as "songCount"
       FROM languages l
       LEFT JOIN songs s ON l.id = s.language_id AND s.status = 'PUBLISHED'
       WHERE l.is_active = TRUE
       GROUP BY l.id
       ORDER BY l.id ASC`
    );

    // 5. Genres with Song Counts
    const genresRes = await query(
      `SELECT g.id, g.name, g.slug, g.description, 
              COUNT(s.id) as "songCount"
       FROM genres g
       LEFT JOIN songs s ON g.id = s.genre_id AND s.status = 'PUBLISHED'
       GROUP BY g.id
       ORDER BY "songCount" DESC, g.id ASC`
    );

    // 6. Desi Music Content
    const desiRes = await query(
      `SELECT dmc.id, dmc.video_url as "videoUrl", dmc.views_count as "viewsCount",
              s.id as "songId", s.title, s.artwork_url as "coverUrl", s.audio_url as "audioUrl",
              s.duration_seconds as "durationSeconds", s.valid_likes_count as "validLikesCount",
              s.play_count as "playCount", cp.stage_name as "creatorName",
              cp.category, cp.verified_badge as "verifiedBadge",
              l.name as "languageName", g.name as "genreName"
       FROM desi_music_content dmc
       JOIN creator_profiles cp ON dmc.creator_id = cp.id
       JOIN songs s ON dmc.song_id = s.id
       JOIN languages l ON s.language_id = l.id
       JOIN genres g ON s.genre_id = g.id
       WHERE dmc.is_featured = TRUE
       LIMIT 6`
    );

    // 7. Active Competitions
    const competitionsRes = await query(
      `SELECT id, title, slug, description, cover_url as "coverUrl", 
              prize_inr as "prizeINR", start_date as "startDate", end_date as "endDate",
              eligible_languages as "eligibleLanguages", status
       FROM competitions
       WHERE status = 'ACTIVE'
       ORDER BY prize_inr DESC
       LIMIT 4`
    );

    return NextResponse.json({
      success: true,
      data: {
        trending: trendingRes.rows,
        newReleases: newReleasesRes.rows,
        artists: artistsRes.rows,
        languages: languagesRes.rows,
        genres: genresRes.rows,
        desiContent: desiRes.rows,
        competitions: competitionsRes.rows,
      },
    });
  } catch (error: any) {
    console.error('Home feed error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
