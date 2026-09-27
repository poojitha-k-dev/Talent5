import { Router, Request, Response } from 'express';
import { query } from '../lib/db';
import { getSongRights } from '../lib/rights';

const router = Router();

// GET /api/v1/desi
router.get('/', async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined;
    const languageCode = req.query.language as string | undefined;

    const conditions: string[] = [];
    const values: any[] = [];
    let paramIdx = 1;

    if (category) {
      conditions.push(`cp.category = $${paramIdx}`);
      values.push(category.toUpperCase());
      paramIdx++;
    }

    if (languageCode) {
      conditions.push(`l.code = $${paramIdx}`);
      values.push(languageCode.toLowerCase());
      paramIdx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const desiRes = await query(
      `SELECT dmc.id, dmc.video_url as "videoUrl", dmc.views_count as "viewsCount",
              dmc.is_featured as "isFeatured", dmc.created_at as "createdAt",
              s.id as "songId", s.title, s.duration_seconds as "durationSeconds",
              s.audio_url as "audioUrl", s.artwork_url as "coverUrl",
              s.valid_likes_count as "validLikesCount", s.raw_likes_count as "rawLikesCount",
              s.play_count as "playCount",
              cp.id as "creatorId", cp.stage_name as "creatorName", cp.city, cp.state,
              cp.category, cp.verified_badge as "verifiedBadge",
              l.id as "languageId", l.code as "languageCode", l.name as "languageName",
              g.id as "genreId", g.slug as "genreSlug", g.name as "genreName"
       FROM desi_music_content dmc
       JOIN creator_profiles cp ON dmc.creator_id = cp.id
       JOIN songs s ON dmc.song_id = s.id
       JOIN languages l ON s.language_id = l.id
       JOIN genres g ON s.genre_id = g.id
       ${whereClause}
       ORDER BY dmc.is_featured DESC, s.valid_likes_count DESC, dmc.views_count DESC
       LIMIT 30`,
      values
    );

    return res.status(200).json({
      success: true,
      data: desiRes.rows,
    });
  } catch (error: any) {
    console.error('Desi catalog query error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/v1/desi/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const desiRes = await query(
      `SELECT dmc.id, dmc.video_url as "videoUrl", dmc.views_count as "viewsCount",
              dmc.is_featured as "isFeatured", dmc.created_at as "createdAt",
              s.id as "songId", s.title, s.duration_seconds as "durationSeconds",
              s.audio_url as "audioUrl", s.artwork_url as "coverUrl",
              s.valid_likes_count as "validLikesCount", s.raw_likes_count as "rawLikesCount",
              s.play_count as "playCount",
              cp.id as "creatorId", cp.stage_name as "creatorName", cp.bio as "creatorBio",
              cp.city, cp.state, cp.category, cp.verified_badge as "verifiedBadge",
              cp.portfolio_url as "portfolioUrl",
              l.name as "languageName", g.name as "genreName"
       FROM desi_music_content dmc
       JOIN creator_profiles cp ON dmc.creator_id = cp.id
       JOIN songs s ON dmc.song_id = s.id
       JOIN languages l ON s.language_id = l.id
       JOIN genres g ON s.genre_id = g.id
       WHERE dmc.id::text = $1
       LIMIT 1`,
      [id]
    );

    if (desiRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Desi performance not found' });
    }

    const item = desiRes.rows[0];

    // Increment views count asynchronously
    query('UPDATE desi_music_content SET views_count = views_count + 1 WHERE id = $1', [item.id]).catch(console.error);

    const rights = await getSongRights(item.songId);

    const commentsRes = await query(
      `SELECT c.id, c.content, c.created_at as "createdAt",
              u.full_name as "userName", u.username, u.avatar_url as "userAvatar"
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.target_type = 'DESI_CONTENT' AND c.target_id = $1
       ORDER BY c.created_at DESC
       LIMIT 25`,
      [item.id]
    );

    return res.status(200).json({
      success: true,
      data: {
        item,
        rights,
        comments: commentsRes.rows,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
