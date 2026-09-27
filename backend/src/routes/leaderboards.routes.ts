import { Router, Request, Response } from 'express';
import { query } from '../lib/db';

const router = Router();

// GET /api/v1/leaderboards
router.get('/', async (req: Request, res: Response) => {
  try {
    const timeframe = (req.query.timeframe as string) || 'weekly';

    // 1. Top Validated Likes Songs (Audited engagement)
    const topLikesRes = await query(
      `SELECT s.id, s.title, s.slug, s.duration_seconds as "durationSeconds",
              s.audio_url as "audioUrl", s.artwork_url as "artworkUrl",
              s.valid_likes_count as "score", s.play_count as "playCount",
              a.id as "artistId", a.name as "artistName", a.avatar_url as "avatarUrl",
              l.name as "languageName", g.name as "genreName"
       FROM songs s
       JOIN artists a ON s.artist_id = a.id
       JOIN languages l ON s.language_id = l.id
       JOIN genres g ON s.genre_id = g.id
       WHERE s.status = 'PUBLISHED'
       ORDER BY s.valid_likes_count DESC
       LIMIT 10`
    );

    // 2. Most Streamed Songs
    const topStreamsRes = await query(
      `SELECT s.id, s.title, s.slug, s.duration_seconds as "durationSeconds",
              s.audio_url as "audioUrl", s.artwork_url as "artworkUrl",
              s.play_count as "score", s.valid_likes_count as "validLikesCount",
              a.id as "artistId", a.name as "artistName", a.avatar_url as "avatarUrl",
              l.name as "languageName"
       FROM songs s
       JOIN artists a ON s.artist_id = a.id
       JOIN languages l ON s.language_id = l.id
       WHERE s.status = 'PUBLISHED'
       ORDER BY s.play_count DESC
       LIMIT 10`
    );

    // 3. Top Desi Creators
    const topCreatorsRes = await query(
      `SELECT cp.id, cp.stage_name as "creatorName", cp.city, cp.state,
              cp.category, cp.verified_badge as "verifiedBadge",
              u.avatar_url as "avatarUrl",
              COALESCE(SUM(s.valid_likes_count), 0) as "score",
              a.followers_count as "followersCount"
       FROM creator_profiles cp
       JOIN users u ON cp.user_id = u.id
       LEFT JOIN artists a ON cp.user_id = a.user_id
       LEFT JOIN songs s ON a.id = s.artist_id
       GROUP BY cp.id, u.id, a.id
       ORDER BY "score" DESC, a.followers_count DESC
       LIMIT 10`
    );

    return res.status(200).json({
      success: true,
      timeframe,
      data: {
        topLikes: topLikesRes.rows.map((row, idx) => ({ rank: idx + 1, ...row })),
        topStreams: topStreamsRes.rows.map((row, idx) => ({ rank: idx + 1, ...row })),
        topCreators: topCreatorsRes.rows.map((row, idx) => ({ rank: idx + 1, ...row })),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
