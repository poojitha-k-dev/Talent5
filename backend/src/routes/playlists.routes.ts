import { Router, Request, Response } from 'express';
import { query } from '../lib/db';
import { getUserFromRequest } from '../lib/auth';
import { slugify } from '@talent5/utils';

const router = Router();

// GET /api/v1/playlists
router.get('/', async (_req: Request, res: Response) => {
  try {
    const playlistsRes = await query(
      `SELECT p.id, p.name, p.slug, p.description, p.cover_url as "coverUrl",
              p.visibility, p.created_at as "createdAt",
              u.full_name as "curatorName",
              COUNT(ps.id) as "songCount"
       FROM playlists p
       JOIN users u ON p.user_id = u.id
       LEFT JOIN playlist_songs ps ON p.id = ps.playlist_id
       WHERE p.visibility = 'PUBLIC'
       GROUP BY p.id, u.id
       ORDER BY "songCount" DESC, p.created_at DESC
       LIMIT 20`
    );
    return res.status(200).json({ success: true, data: playlistsRes.rows });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/playlists
router.post('/', async (req: Request, res: Response) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ success: false, message: 'Authentication required' });

    const { name, description, visibility = 'PUBLIC', coverUrl } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ success: false, message: 'Playlist name is required' });

    const cleanName = name.trim();
    const slug = slugify(cleanName) + '-' + Math.floor(100 + Math.random() * 900);
    const defaultCover = coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600';

    const insertRes = await query(
      `INSERT INTO playlists (user_id, name, slug, description, visibility, cover_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, slug, description, visibility, cover_url as "coverUrl", created_at as "createdAt"`,
      [user.id, cleanName, slug, description || null, visibility, defaultCover]
    );

    return res.status(201).json({ success: true, data: insertRes.rows[0] });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/v1/playlists/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const playlistRes = await query(
      `SELECT p.*, u.full_name as "curatorName"
       FROM playlists p JOIN users u ON p.user_id = u.id WHERE p.id = $1`,
      [req.params.id]
    );
    if (playlistRes.rows.length === 0) return res.status(404).json({ success: false, message: 'Playlist not found' });

    const songsRes = await query(
      `SELECT s.*, ps.position, a.name as "artistName"
       FROM playlist_songs ps
       JOIN songs s ON ps.song_id = s.id
       JOIN artists a ON s.artist_id = a.id
       WHERE ps.playlist_id = $1 ORDER BY ps.position ASC`,
      [req.params.id]
    );

    return res.status(200).json({ success: true, data: { ...playlistRes.rows[0], songs: songsRes.rows } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
