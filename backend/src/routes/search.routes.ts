import { Router, Request, Response } from 'express';
import { query } from '../lib/db';

const router = Router();

// GET /api/v1/search
router.get('/', async (req: Request, res: Response) => {
  try {
    const q = ((req.query.q as string) || '').trim();

    if (!q) {
      const topArtists = await query('SELECT id, name, avatar_url as "avatarUrl" FROM artists LIMIT 4');
      const topLanguages = await query('SELECT code, name, native_name as "nativeName" FROM languages LIMIT 6');
      return res.status(200).json({
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

    const [songsRes, artistsRes, albumsRes] = await Promise.all([
      query(
        `SELECT s.id, s.title, s.slug, s.duration_seconds as "durationSeconds",
                s.audio_url as "audioUrl", s.artwork_url as "artworkUrl",
                s.play_count as "playCount", s.valid_likes_count as "validLikesCount",
                a.id as "artistId", a.name as "artistName",
                l.name as "languageName", g.name as "genreName"
         FROM songs s
         JOIN artists a ON s.artist_id = a.id
         JOIN languages l ON s.language_id = l.id
         JOIN genres g ON s.genre_id = g.id
         WHERE (
           s.title ILIKE $1 OR 
           a.name ILIKE $1 OR 
           s.id IN (SELECT song_id FROM lyrics WHERE full_text ILIKE $1) OR
           s.id IN (SELECT l.song_id FROM lyrics l JOIN lyric_lines ll ON ll.lyrics_id = l.id WHERE ll.text ILIKE $1)
         ) AND s.status = 'PUBLISHED'
         ORDER BY s.popularity_score DESC
         LIMIT 12`,
        [pattern]
      ),
      query(
        `SELECT a.id, a.name, a.slug, a.bio, a.avatar_url as "avatarUrl", 
                a.is_verified as "isVerified", a.followers_count as "followersCount"
         FROM artists a
         WHERE a.name ILIKE $1 OR a.bio ILIKE $1
         LIMIT 6`,
        [pattern]
      ),
      query(
        `SELECT al.id, al.title, al.slug, al.cover_url as "coverUrl", a.name as "artistName"
         FROM albums al
         JOIN artists a ON al.artist_id = a.id
         WHERE al.title ILIKE $1
         LIMIT 6`,
        [pattern]
      ),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        songs: songsRes.rows,
        artists: artistsRes.rows,
        albums: albumsRes.rows,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
