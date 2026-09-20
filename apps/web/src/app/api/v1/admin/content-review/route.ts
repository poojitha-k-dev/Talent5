import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authenticateAdmin } from '@/lib/admin';

export async function GET(req: NextRequest) {
  const { user, errorResponse } = await authenticateAdmin(req);
  if (errorResponse) return errorResponse;

  const url = new URL(req.url);
  const status = url.searchParams.get('status');
  const search = url.searchParams.get('search');

  try {
    let sql = `
      SELECT cs.id, cs.creator_id as "creatorId", cs.title, cs.description, cs.category,
             cs.language_id as "languageId", cs.genre_id as "genreId", cs.audio_url as "audioUrl",
             cs.video_url as "videoUrl", cs.cover_url as "coverUrl", cs.composer, cs.lyricist,
             cs.producer, cs.featured_artists as "featuredArtists", cs.ownership_declaration as "ownershipDeclaration",
             cs.duration_seconds as "durationSeconds", cs.mood, cs.lyrics_text as "lyricsText",
             cs.lyrics_timed_data as "lyricsTimedData", cs.rights_declaration as "rightsDeclaration",
             cs.status, cs.review_notes as "reviewNotes", cs.created_at as "createdAt",
             cp.stage_name as "creatorStageName", cp.city as "creatorCity", cp.verified_badge as "isVerifiedCreator",
             l.name as "languageName", g.name as "genreName"
      FROM content_submissions cs
      JOIN creator_profiles cp ON cs.creator_id = cp.id
      JOIN languages l ON cs.language_id = l.id
      JOIN genres g ON cs.genre_id = g.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status && status !== 'ALL') {
      params.push(status);
      sql += ` AND cs.status = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (cs.title ILIKE $${params.length} OR cp.stage_name ILIKE $${params.length})`;
    }

    sql += ` ORDER BY cs.created_at DESC`;

    const res = await query(sql, params);

    return NextResponse.json({
      success: true,
      data: res.rows,
    });
  } catch (err: any) {
    console.error('Error fetching content review items:', err);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: err.message } },
      { status: 500 }
    );
  }
}
