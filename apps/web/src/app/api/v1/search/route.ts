import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').trim();
    const languageCode = searchParams.get('language');
    const genreSlug = searchParams.get('genre');

    if (!q) {
      // Return popular search queries and top genres/languages
      const topArtists = await query('SELECT id, name, avatar_url as "avatarUrl" FROM artists LIMIT 4');
      const topLanguages = await query('SELECT code, name, native_name as "nativeName" FROM languages LIMIT 6');
      return NextResponse.json({
        success: true,
        data: {
          popularSearches: ['Tum Bin Mann Kaha', 'Arijit', 'Swara Tarangam', 'Punjabi Drill', 'Carnatic', 'Kabir Sen'],
          topArtists: topArtists.rows,
          topLanguages: topLanguages.rows,
          songs: [],
          artists: [],
          albums: [],
          desiContent: [],
        },
      });
    }

    const pattern = `%${q}%`;

    // 1. Search Songs
    const songsRes = await query(
      `SELECT s.id, s.title, s.slug, s.duration_seconds as "durationSeconds",
              s.audio_url as "audioUrl", s.artwork_url as "artworkUrl",
              s.play_count as "playCount", s.valid_likes_count as "validLikesCount",
              a.id as "artistId", a.name as "artistName",
              l.name as "languageName", g.name as "genreName"
       FROM songs s
       JOIN artists a ON s.artist_id = a.id
       JOIN languages l ON s.language_id = l.id
       JOIN genres g ON s.genre_id = g.id
       WHERE (s.title ILIKE $1 OR a.name ILIKE $1) AND s.status = 'PUBLISHED'
       ORDER BY s.popularity_score DESC
       LIMIT 10`,
      [pattern]
    );

    // 2. Search Artists
    const artistsRes = await query(
      `SELECT a.id, a.name, a.slug, a.bio, a.avatar_url as "avatarUrl", 
              a.is_verified as "isVerified", a.followers_count as "followersCount"
       FROM artists a
       WHERE a.name ILIKE $1 OR a.bio ILIKE $1
       LIMIT 6`,
      [pattern]
    );

    // 3. Search Albums
    const albumsRes = await query(
      `SELECT al.id, al.title, al.slug, al.cover_url as "coverUrl", al.type,
              a.id as "artistId", a.name as "artistName"
       FROM albums al
       JOIN artists a ON al.artist_id = a.id
       WHERE al.title ILIKE $1 OR a.name ILIKE $1
       LIMIT 6`,
      [pattern]
    );

    // 4. Search Desi Creator Original Music
    const desiRes = await query(
      `SELECT dmc.id, dmc.video_url as "videoUrl", s.id as "songId", s.title,
              s.artwork_url as "coverUrl", s.audio_url as "audioUrl",
              cp.stage_name as "creatorName", cp.category,
              l.name as "languageName"
       FROM desi_music_content dmc
       JOIN creator_profiles cp ON dmc.creator_id = cp.id
       JOIN songs s ON dmc.song_id = s.id
       JOIN languages l ON s.language_id = l.id
       WHERE s.title ILIKE $1 OR cp.stage_name ILIKE $1
       LIMIT 6`,
      [pattern]
    );

    return NextResponse.json({
      success: true,
      query: q,
      data: {
        songs: songsRes.rows,
        artists: artistsRes.rows,
        albums: albumsRes.rows,
        desiContent: desiRes.rows,
      },
    });
  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
