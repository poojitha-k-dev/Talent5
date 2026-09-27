import { Router, Request, Response } from 'express';
import { query } from '../lib/db';
import { getUserFromRequest } from '../lib/auth';

const router = Router();

// GET /api/v1/competitions
router.get('/', async (_req: Request, res: Response) => {
  try {
    const compsRes = await query(
      `SELECT c.id, c.title, c.slug, c.description, c.cover_url as "coverUrl",
              c.prize_inr as "prizeINR", c.start_date as "startDate", c.end_date as "endDate",
              c.eligible_languages as "eligibleLanguages", c.eligible_genres as "eligibleGenres",
              c.status, COUNT(ce.id) as "entriesCount"
       FROM competitions c
       LEFT JOIN competition_entries ce ON c.id = ce.competition_id
       GROUP BY c.id
       ORDER BY c.status ASC, c.prize_inr DESC`
    );
    return res.status(200).json({ success: true, data: compsRes.rows });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/v1/competitions/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
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
      return res.status(404).json({ success: false, message: 'Competition not found' });
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

    return res.status(200).json({ success: true, data: { competition, entries: entriesRes.rows } });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/competitions/:id/vote
router.post('/:id/vote', async (req: Request, res: Response) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ success: false, message: 'Authentication required' });

    const { entryId } = req.body;
    if (!entryId) return res.status(400).json({ success: false, message: 'entryId required' });

    const existing = await query('SELECT id FROM competition_votes WHERE user_id = $1 AND competition_id = $2', [user.id, req.params.id]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'You have already voted in this competition.' });
    }

    await query('INSERT INTO competition_votes (user_id, competition_id, entry_id) VALUES ($1, $2, $3)', [user.id, req.params.id, entryId]);
    await query('UPDATE competition_entries SET votes_count = votes_count + 1 WHERE id = $1', [entryId]);

    return res.status(200).json({ success: true, message: 'Vote recorded' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
