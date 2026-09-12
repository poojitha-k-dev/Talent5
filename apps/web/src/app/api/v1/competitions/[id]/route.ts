import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const compRes = await query(
      `SELECT c.id, c.title, c.slug, c.description, c.cover_url as "coverUrl",
              c.rules, c.prize_inr as "prizeINR", c.start_date as "startDate",
              c.end_date as "endDate", c.eligible_languages as "eligibleLanguages",
              c.eligible_genres as "eligibleGenres", c.status
       FROM competitions c
       WHERE c.id::text = $1 OR c.slug = $1
       LIMIT 1`,
      [id]
    );

    if (compRes.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Competition not found' }, { status: 404 });
    }

    const competition = compRes.rows[0];

    const entriesRes = await query(
      `SELECT ce.id, ce.rank, ce.votes_count as "votesCount", ce.status,
              ce.submitted_at as "submittedAt",
              cp.id as "creatorId", cp.stage_name as "creatorName", cp.city,
              COALESCE(s.id, d.song_id) as "songId", 
              COALESCE(s.title, 'Desi Tournament Track') as "songTitle", 
              COALESCE(s.audio_url, 'https://cdn.freesound.org/previews/557/557194_11861866-lq.mp3') as "audioUrl",
              COALESCE(s.artwork_url, 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800') as "artworkUrl", 
              COALESCE(s.valid_likes_count, 0) as "validLikesCount",
              d.video_url as "videoUrl"
       FROM competition_entries ce
       JOIN creator_profiles cp ON ce.creator_id = cp.id
       LEFT JOIN desi_music_content d ON ce.content_id = d.id
       LEFT JOIN songs s ON (ce.content_id = s.id OR d.song_id = s.id)
       WHERE ce.competition_id = $1
       ORDER BY ce.votes_count DESC, ce.submitted_at ASC`,
      [competition.id]
    );

    return NextResponse.json({
      success: true,
      data: {
        competition,
        entries: entriesRes.rows,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
