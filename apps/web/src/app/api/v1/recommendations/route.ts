import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    const url = new URL(req.url);
    const languageCode = url.searchParams.get('language');
    const genreSlug = url.searchParams.get('genre');

    // 1. Trending Desi Discoveries (High engagement ratio)
    const trendingRes = await query(`
      SELECT s.id, s.title, s.slug, s.duration_seconds as "durationSeconds",
             s.audio_url as "audioUrl", s.artwork_url as "artworkUrl", s.play_count as "playCount",
             s.valid_likes_count as "validLikesCount", s.popularity_score as "popularityScore",
             a.id as "artistId", a.name as "artistName", a.is_verified as "isVerifiedArtist",
             l.name as "languageName", l.code as "languageCode",
             g.name as "genreName", g.slug as "genreSlug"
      FROM songs s
      JOIN artists a ON s.artist_id = a.id
      JOIN languages l ON s.language_id = l.id
      JOIN genres g ON s.genre_id = g.id
      WHERE s.status = 'PUBLISHED'
      ORDER BY (s.valid_likes_count * 2 + s.play_count) DESC
      LIMIT 6
    `);

    // 2. Rising Grassroots Creators (High like conversion)
    const risingCreatorsRes = await query(`
      SELECT d.id as "desiContentId", d.video_url as "videoUrl", d.views_count as "viewsCount",
             s.id as "songId", s.title, s.audio_url as "audioUrl", s.artwork_url as "artworkUrl",
             cp.id as "creatorId", cp.stage_name as "creatorName", cp.city, cp.verified_badge as "verifiedBadge",
             cp.category, l.name as "languageName"
      FROM desi_music_content d
      JOIN creator_profiles cp ON d.creator_id = cp.id
      JOIN songs s ON d.song_id = s.id
      JOIN languages l ON s.language_id = l.id
      WHERE cp.is_approved = TRUE
      ORDER BY d.views_count DESC
      LIMIT 4
    `);

    // 3. Made for You (Regional Affinity Recommendation)
    let madeForYouSql = `
      SELECT s.id, s.title, s.slug, s.duration_seconds as "durationSeconds",
             s.audio_url as "audioUrl", s.artwork_url as "artworkUrl",
             a.name as "artistName", l.name as "languageName", g.name as "genreName"
      FROM songs s
      JOIN artists a ON s.artist_id = a.id
      JOIN languages l ON s.language_id = l.id
      JOIN genres g ON s.genre_id = g.id
      WHERE s.status = 'PUBLISHED'
    `;
    const params: any[] = [];

    if (languageCode) {
      params.push(languageCode);
      madeForYouSql += ` AND l.code = $${params.length}`;
    }

    madeForYouSql += ` ORDER BY s.created_at DESC LIMIT 6`;

    const madeForYouRes = await query(madeForYouSql, params);

    return NextResponse.json({
      success: true,
      data: {
        trendingDiscoveries: trendingRes.rows,
        risingCreators: risingCreatorsRes.rows,
        madeForYou: madeForYouRes.rows,
      },
    });
  } catch (err: any) {
    console.error('Error computing recommendations:', err);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: err.message } },
      { status: 500 }
    );
  }
}
