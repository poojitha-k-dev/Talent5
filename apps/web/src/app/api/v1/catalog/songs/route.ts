import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const languageCode = searchParams.get('language');
    const genreSlug = searchParams.get('genre');
    const artistId = searchParams.get('artistId');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'popularity';
    const limit = Math.min(parseInt(searchParams.get('limit') || '60', 10), 300);
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const offset = (page - 1) * limit;

    const conditions: string[] = ["s.status = 'PUBLISHED'"];
    const values: any[] = [];
    let paramIdx = 1;

    if (languageCode) {
      conditions.push(`l.code = $${paramIdx}`);
      values.push(languageCode.toLowerCase());
      paramIdx++;
    }

    if (genreSlug) {
      conditions.push(`g.slug = $${paramIdx}`);
      values.push(genreSlug.toLowerCase());
      paramIdx++;
    }

    if (artistId) {
      conditions.push(`s.artist_id = $${paramIdx}`);
      values.push(artistId);
      paramIdx++;
    }

    if (search) {
      conditions.push(`(s.title ILIKE $${paramIdx} OR a.name ILIKE $${paramIdx})`);
      values.push(`%${search.trim()}%`);
      paramIdx++;
    }

    let orderByClause = 's.popularity_score DESC, s.play_count DESC';
    if (sortBy === 'recent') {
      orderByClause = 's.release_date DESC, s.created_at DESC';
    } else if (sortBy === 'likes') {
      orderByClause = 's.valid_likes_count DESC';
    } else if (sortBy === 'title') {
      orderByClause = 's.title ASC';
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Total count query
    const countRes = await query(
      `SELECT count(*) as total
       FROM songs s
       JOIN artists a ON s.artist_id = a.id
       JOIN languages l ON s.language_id = l.id
       JOIN genres g ON s.genre_id = g.id
       ${whereClause}`,
      values
    );
    const total = parseInt(countRes.rows[0]?.total || '0', 10);

    // Main records query
    const queryText = `
      SELECT s.id, s.title, s.slug, s.duration_seconds as "durationSeconds",
             s.audio_url as "audioUrl", s.artwork_url as "artworkUrl",
             s.release_date as "releaseDate", s.is_explicit as "isExplicit",
             s.play_count as "playCount", s.raw_likes_count as "rawLikesCount",
             s.valid_likes_count as "validLikesCount", s.popularity_score as "popularityScore",
             s.status, a.id as "artistId", a.name as "artistName", a.is_verified as "isArtistVerified",
             al.id as "albumId", al.title as "albumTitle",
             l.id as "languageId", l.code as "languageCode", l.name as "languageName",
             g.id as "genreId", g.slug as "genreSlug", g.name as "genreName"
      FROM songs s
      JOIN artists a ON s.artist_id = a.id
      LEFT JOIN albums al ON s.album_id = al.id
      JOIN languages l ON s.language_id = l.id
      JOIN genres g ON s.genre_id = g.id
      ${whereClause}
      ORDER BY ${orderByClause}
      LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
    `;

    values.push(limit, offset);

    const songsRes = await query(queryText, values);

    return NextResponse.json({
      success: true,
      data: songsRes.rows,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Songs query error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
