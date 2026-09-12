import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const albumRes = await query(
      `SELECT al.id, al.title, al.slug, al.release_date as "releaseDate", 
              al.cover_url as "coverUrl", al.type,
              a.id as "artistId", a.name as "artistName", a.avatar_url as "artistAvatarUrl",
              l.name as "languageName", g.name as "genreName"
       FROM albums al
       JOIN artists a ON al.artist_id = a.id
       LEFT JOIN languages l ON al.language_id = l.id
       LEFT JOIN genres g ON al.genre_id = g.id
       WHERE al.id::text = $1 OR al.slug = $1
       LIMIT 1`,
      [id]
    );

    if (albumRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Album not found' },
        { status: 404 }
      );
    }

    const album = albumRes.rows[0];

    const tracksRes = await query(
      `SELECT s.id, s.title, s.slug, s.duration_seconds as "durationSeconds",
              s.audio_url as "audioUrl", s.artwork_url as "artworkUrl",
              s.play_count as "playCount", s.valid_likes_count as "validLikesCount",
              a.name as "artistName"
       FROM songs s
       JOIN artists a ON s.artist_id = a.id
       WHERE s.album_id = $1 AND s.status = 'PUBLISHED'
       ORDER BY s.created_at ASC`,
      [album.id]
    );

    return NextResponse.json({
      success: true,
      data: {
        album,
        tracks: tracksRes.rows,
      },
    });
  } catch (error: any) {
    console.error('Album detail error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
