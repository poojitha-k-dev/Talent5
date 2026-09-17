import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { songId: string } }
) {
  try {
    const { songId } = params;
    if (!songId) {
      return NextResponse.json(
        { success: false, message: 'Song ID is required' },
        { status: 400 }
      );
    }

    const lyricsRes = await query(
      `SELECT l.id, l.song_id as "songId", l.language_id as "languageId", 
              l.is_synced as "isSynced", l.full_text as "fullText"
       FROM lyrics l
       JOIN songs s ON l.song_id = s.id
       WHERE s.id::text = $1 OR s.slug = $1`,
      [songId]
    );

    if (lyricsRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No lyrics registered for this song' },
        { status: 404 }
      );
    }

    const lyric = lyricsRes.rows[0];

    const linesRes = await query(
      `SELECT id, sequence_order as "sequenceOrder", 
              start_time_ms as "startTimeMs", end_time_ms as "endTimeMs", text
       FROM lyric_lines
       WHERE lyrics_id = $1
       ORDER BY sequence_order ASC`,
      [lyric.id]
    );

    return NextResponse.json({
      success: true,
      data: {
        ...lyric,
        lines: linesRes.rows,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
