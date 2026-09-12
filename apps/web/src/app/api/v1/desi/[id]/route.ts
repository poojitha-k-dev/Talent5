import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSongRights } from '@/lib/rights';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const desiRes = await query(
      `SELECT dmc.id, dmc.video_url as "videoUrl", dmc.views_count as "viewsCount",
              dmc.is_featured as "isFeatured", dmc.created_at as "createdAt",
              s.id as "songId", s.title, s.duration_seconds as "durationSeconds",
              s.audio_url as "audioUrl", s.artwork_url as "coverUrl",
              s.valid_likes_count as "validLikesCount", s.raw_likes_count as "rawLikesCount",
              s.play_count as "playCount",
              cp.id as "creatorId", cp.stage_name as "creatorName", cp.bio as "creatorBio",
              cp.city, cp.state, cp.category, cp.verified_badge as "verifiedBadge",
              cp.portfolio_url as "portfolioUrl",
              l.name as "languageName", g.name as "genreName"
       FROM desi_music_content dmc
       JOIN creator_profiles cp ON dmc.creator_id = cp.id
       JOIN songs s ON dmc.song_id = s.id
       JOIN languages l ON s.language_id = l.id
       JOIN genres g ON s.genre_id = g.id
       WHERE dmc.id::text = $1
       LIMIT 1`,
      [id]
    );

    if (desiRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Desi performance not found' },
        { status: 404 }
      );
    }

    const item = desiRes.rows[0];

    // Increment views count asynchronously
    query('UPDATE desi_music_content SET views_count = views_count + 1 WHERE id = $1', [item.id]).catch(console.error);

    const rights = await getSongRights(item.songId);

    const commentsRes = await query(
      `SELECT c.id, c.content, c.created_at as "createdAt",
              u.full_name as "userName", u.username, u.avatar_url as "userAvatar"
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.target_type = 'DESI_CONTENT' AND c.target_id = $1
       ORDER BY c.created_at DESC
       LIMIT 25`,
      [item.id]
    );

    return NextResponse.json({
      success: true,
      data: {
        item,
        rights,
        comments: commentsRes.rows,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
