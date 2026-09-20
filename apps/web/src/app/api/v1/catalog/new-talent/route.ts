import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const language = searchParams.get('language');

    // 1. Rising Artists (Verified independent creators)
    let artistSql = `
      SELECT a.id, a.name, a.slug, a.bio, a.avatar_url as "avatarUrl",
             a.cover_url as "coverUrl", a.is_verified as "isVerified",
             a.total_plays as "totalPlays", a.followers_count as "followersCount",
             cp.category, cp.city, cp.state,
             (
               SELECT s.title FROM songs s
               WHERE s.artist_id = a.id AND s.status = 'PUBLISHED'
               ORDER BY s.created_at DESC LIMIT 1
             ) as "latestSongTitle",
             (
               SELECT s.id FROM songs s
               WHERE s.artist_id = a.id AND s.status = 'PUBLISHED'
               ORDER BY s.created_at DESC LIMIT 1
             ) as "latestSongId"
      FROM artists a
      JOIN creator_profiles cp ON a.user_id = cp.user_id
      WHERE cp.is_approved = TRUE
    `;
    const artistParams: any[] = [];
    if (category) {
      artistParams.push(category);
      artistSql += ` AND cp.category = $${artistParams.length}`;
    }
    artistSql += ` ORDER BY a.followers_count DESC, a.total_plays DESC LIMIT 12`;
    const risingArtistsRes = await query(artistSql, artistParams);

    // Fallback if creator_profiles is small: get indie artists with songs
    let artists = risingArtistsRes.rows;
    if (artists.length < 4) {
      const fallbackArtists = await query(`
        SELECT a.id, a.name, a.slug, a.bio, a.avatar_url as "avatarUrl",
               a.cover_url as "coverUrl", a.is_verified as "isVerified",
               a.total_plays as "totalPlays", a.followers_count as "followersCount",
               'SINGER' as category, 'India' as city, 'IN' as state,
               (
                 SELECT s.title FROM songs s
                 WHERE s.artist_id = a.id AND s.status = 'PUBLISHED'
                 ORDER BY s.created_at DESC LIMIT 1
               ) as "latestSongTitle",
               (
                 SELECT s.id FROM songs s
                 WHERE s.artist_id = a.id AND s.status = 'PUBLISHED'
                 ORDER BY s.created_at DESC LIMIT 1
               ) as "latestSongId"
        FROM artists a
        WHERE a.total_plays > 0
        ORDER BY a.followers_count DESC
        LIMIT 12
      `);
      artists = fallbackArtists.rows;
    }

    // 2. New Originals (Recently published songs with valid likes & plays)
    const newOriginalsRes = await query(`
      SELECT s.id, s.title, s.slug, s.duration_seconds as "durationSeconds",
             s.audio_url as "audioUrl", s.artwork_url as "artworkUrl",
             s.play_count as "playCount", s.valid_likes_count as "validLikesCount",
             s.release_date as "releaseDate", s.created_at as "createdAt",
             a.id as "artistId", a.name as "artistName",
             l.name as "languageName", g.name as "genreName"
      FROM songs s
      JOIN artists a ON s.artist_id = a.id
      JOIN languages l ON s.language_id = l.id
      JOIN genres g ON s.genre_id = g.id
      WHERE s.status = 'PUBLISHED'
      ORDER BY s.created_at DESC
      LIMIT 10
    `);

    // 3. Trending Creators (Sorted by engagement)
    const trendingCreatorsRes = await query(`
      SELECT a.id, a.name, a.slug, a.avatar_url as "avatarUrl",
             a.followers_count as "followersCount", a.total_plays as "totalPlays",
             COALESCE(SUM(s.valid_likes_count), 0) as "totalValidLikes"
      FROM artists a
      LEFT JOIN songs s ON a.id = s.artist_id
      GROUP BY a.id
      ORDER BY "totalValidLikes" DESC, a.total_plays DESC
      LIMIT 8
    `);

    // 4. Challenges
    const challengesRes = await query(`
      SELECT id, title, slug, description, cover_url as "coverUrl",
             prize_inr as "prizeINR", end_date as "endDate"
      FROM competitions
      WHERE status = 'ACTIVE'
      LIMIT 3
    `);

    return NextResponse.json({
      success: true,
      data: {
        risingArtists: artists,
        newOriginals: newOriginalsRes.rows,
        trendingCreators: trendingCreatorsRes.rows,
        challenges: challengesRes.rows,
      },
    });
  } catch (error: any) {
    console.error('New Talent API error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
