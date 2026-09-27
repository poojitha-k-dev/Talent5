import { Router, Request, Response } from 'express';
import { query } from '../lib/db';
import { getUserFromRequest } from '../lib/auth';

const router = Router();

// GET /api/v1/library
router.get('/', async (req: Request, res: Response) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ success: false, message: 'Authentication required' });

    const [likedSongsRes, playlistsRes, followedArtistsRes, savedSongsRes] = await Promise.all([
      query(
        `SELECT s.id, s.title, s.slug, s.duration_seconds as "durationSeconds",
                s.audio_url as "audioUrl", s.artwork_url as "artworkUrl",
                s.valid_likes_count as "validLikesCount", s.play_count as "playCount",
                a.id as "artistId", a.name as "artistName",
                l.name as "languageName", g.name as "genreName",
                lk.created_at as "likedAt"
         FROM likes lk
         JOIN songs s ON lk.target_id = s.id
         JOIN artists a ON s.artist_id = a.id
         JOIN languages l ON s.language_id = l.id
         JOIN genres g ON s.genre_id = g.id
         WHERE lk.user_id = $1 AND lk.target_type = 'SONG'
         ORDER BY lk.created_at DESC`,
        [user.id]
      ),
      query(
        `SELECT p.id, p.name, p.slug, p.description, p.cover_url as "coverUrl",
                p.visibility, p.created_at as "createdAt",
                COUNT(ps.id) as "songCount"
         FROM playlists p
         LEFT JOIN playlist_songs ps ON p.id = ps.playlist_id
         WHERE p.user_id = $1
         GROUP BY p.id
         ORDER BY p.created_at DESC`,
        [user.id]
      ),
      query(
        `SELECT a.id, a.name, a.slug, a.avatar_url as "avatarUrl", a.is_verified as "isVerified",
                a.followers_count as "followersCount", f.created_at as "followedAt"
         FROM follows f
         JOIN artists a ON f.artist_id = a.id
         WHERE f.follower_id = $1
         ORDER BY f.created_at DESC`,
        [user.id]
      ),
      query(
        `SELECT s.id, s.title, s.slug, s.duration_seconds as "durationSeconds",
                s.audio_url as "audioUrl", s.artwork_url as "artworkUrl",
                a.id as "artistId", a.name as "artistName",
                ss.created_at as "savedAt"
         FROM saved_songs ss
         JOIN songs s ON ss.song_id = s.id
         JOIN artists a ON s.artist_id = a.id
         WHERE ss.user_id = $1
         ORDER BY ss.created_at DESC`,
        [user.id]
      ),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        likedSongs: likedSongsRes.rows,
        playlists: playlistsRes.rows,
        followedArtists: followedArtistsRes.rows,
        savedSongs: savedSongsRes.rows,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/v1/library/save
router.post('/save', async (req: Request, res: Response) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ success: false, message: 'Authentication required' });

    const { songId } = req.body;
    if (!songId) return res.status(400).json({ success: false, message: 'songId required' });

    const existing = await query('SELECT id FROM saved_songs WHERE user_id = $1 AND song_id = $2', [user.id, songId]);
    if (existing.rows.length > 0) {
      await query('DELETE FROM saved_songs WHERE user_id = $1 AND song_id = $2', [user.id, songId]);
      return res.status(200).json({ success: true, action: 'UNSAVED' });
    }

    await query('INSERT INTO saved_songs (user_id, song_id) VALUES ($1, $2)', [user.id, songId]);
    return res.status(200).json({ success: true, action: 'SAVED' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
