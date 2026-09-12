import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const languageCode = searchParams.get('language');

    const conditions: string[] = [];
    const values: any[] = [];
    let paramIdx = 1;

    if (category) {
      conditions.push(`cp.category = $${paramIdx}`);
      values.push(category.toUpperCase());
      paramIdx++;
    }

    if (languageCode) {
      conditions.push(`l.code = $${paramIdx}`);
      values.push(languageCode.toLowerCase());
      paramIdx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const desiRes = await query(
      `SELECT dmc.id, dmc.video_url as "videoUrl", dmc.views_count as "viewsCount",
              dmc.is_featured as "isFeatured", dmc.created_at as "createdAt",
              s.id as "songId", s.title, s.duration_seconds as "durationSeconds",
              s.audio_url as "audioUrl", s.artwork_url as "coverUrl",
              s.valid_likes_count as "validLikesCount", s.raw_likes_count as "rawLikesCount",
              s.play_count as "playCount",
              cp.id as "creatorId", cp.stage_name as "creatorName", cp.city, cp.state,
              cp.category, cp.verified_badge as "verifiedBadge",
              l.id as "languageId", l.code as "languageCode", l.name as "languageName",
              g.id as "genreId", g.slug as "genreSlug", g.name as "genreName"
       FROM desi_music_content dmc
       JOIN creator_profiles cp ON dmc.creator_id = cp.id
       JOIN songs s ON dmc.song_id = s.id
       JOIN languages l ON s.language_id = l.id
       JOIN genres g ON s.genre_id = g.id
       ${whereClause}
       ORDER BY dmc.is_featured DESC, s.valid_likes_count DESC, dmc.views_count DESC
       LIMIT 30`,
      values
    );

    return NextResponse.json({
      success: true,
      data: desiRes.rows,
    });
  } catch (error: any) {
    console.error('Desi catalog query error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
