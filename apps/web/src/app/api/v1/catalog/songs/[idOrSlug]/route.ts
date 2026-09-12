import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSongRights } from '@/lib/rights';

export async function GET(
  req: NextRequest,
  { params }: { params: { idOrSlug: string } }
) {
  try {
    const { idOrSlug } = params;

    // Support both UUID and slug matching
    const songRes = await query(
      `SELECT s.id, s.title, s.slug, s.duration_seconds as "durationSeconds",
              s.audio_url as "audioUrl", s.artwork_url as "artworkUrl",
              s.release_date as "releaseDate", s.is_explicit as "isExplicit",
              s.play_count as "playCount", s.raw_likes_count as "rawLikesCount",
              s.valid_likes_count as "validLikesCount", s.popularity_score as "popularityScore",
              s.status, s.mood, s.featured_artists as "featuredArtists",
              a.id as "artistId", a.name as "artistName", a.avatar_url as "artistAvatarUrl",
              a.is_verified as "isArtistVerified", a.followers_count as "artistFollowersCount",
              al.id as "albumId", al.title as "albumTitle", al.cover_url as "albumCoverUrl",
              l.id as "languageId", l.code as "languageCode", l.name as "languageName",
              g.id as "genreId", g.slug as "genreSlug", g.name as "genreName"
       FROM songs s
       JOIN artists a ON s.artist_id = a.id
       LEFT JOIN albums al ON s.album_id = al.id
       JOIN languages l ON s.language_id = l.id
       JOIN genres g ON s.genre_id = g.id
       WHERE s.id::text = $1 OR s.slug = $1
       LIMIT 1`,
      [idOrSlug]
    );

    if (songRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Song not found' },
        { status: 404 }
      );
    }

    const song = songRes.rows[0];

    // Increment play count asynchronously
    query(`UPDATE songs SET play_count = play_count + 1 WHERE id = $1`, [song.id]).catch(console.error);

    // Fetch Rights record
    const rights = await getSongRights(song.id);

    // Fetch Synchronized Lyrics
    const lyricsRes = await query(
      `SELECT id, is_synced as "isSynced", full_text as "fullText"
       FROM lyrics
       WHERE song_id = $1`,
      [song.id]
    );
    let lyrics = lyricsRes.rows[0] || null;
    if (lyrics) {
      const linesRes = await query(
        `SELECT id, sequence_order as "sequenceOrder", start_time_ms as "startTimeMs", 
                end_time_ms as "endTimeMs", text
         FROM lyric_lines
         WHERE lyrics_id = $1
         ORDER BY sequence_order ASC`,
        [lyrics.id]
      );
      lyrics.lines = linesRes.rows;
    }

    // Fetch Comments
    const commentsRes = await query(
      `SELECT c.id, c.content, c.created_at as "createdAt",
              u.id as "userId", u.full_name as "userName", u.username, u.avatar_url as "userAvatar"
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.target_type = 'SONG' AND c.target_id = $1
       ORDER BY c.created_at DESC
       LIMIT 20`,
      [song.id]
    );

    // Fetch Recommended Tracks in same language or genre
    const recommendedRes = await query(
      `SELECT s.id, s.title, s.slug, s.duration_seconds as "durationSeconds",
              s.audio_url as "audioUrl", s.artwork_url as "artworkUrl",
              s.valid_likes_count as "validLikesCount",
              a.id as "artistId", a.name as "artistName",
              l.name as "languageName"
       FROM songs s
       JOIN artists a ON s.artist_id = a.id
       JOIN languages l ON s.language_id = l.id
       WHERE s.id != $1 AND (s.language_id = $2 OR s.genre_id = $3) AND s.status = 'PUBLISHED'
       ORDER BY s.popularity_score DESC
       LIMIT 5`,
      [song.id, song.languageId, song.genreId]
    );

    return NextResponse.json({
      success: true,
      data: {
        song,
        rights,
        lyrics,
        comments: commentsRes.rows,
        recommendations: recommendedRes.rows,
      },
    });
  } catch (error: any) {
    console.error('Song detail query error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
