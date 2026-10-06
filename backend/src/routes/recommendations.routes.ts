import { Router, Request, Response } from 'express';
import { query } from '../lib/db';
import { getUserFromRequest } from '../lib/auth';
import { memoryCache } from '../lib/cache';

const router = Router();

// GET /api/v1/recommendations
router.get('/', async (req: Request, res: Response) => {
  try {
    const user = await getUserFromRequest(req);
    const languageCode = req.query.language as string | undefined;
    const genreSlug = req.query.genre as string | undefined;

    const cacheKey = `recommendations:${languageCode || ''}:${genreSlug || ''}`;

    const data = await memoryCache.getOrSet(cacheKey, 60, async () => {
      // 1. Trending Desi Discoveries (High engagement ratio)
      const trendingRes = await query(`
        SELECT s.id, s.title, s.slug, s.duration_seconds as "durationSeconds",
               s.audio_url as "audioUrl", s.artwork_url as "artworkUrl", s.play_count as "playCount",
               s.valid_likes_count as "validLikesCount", s.popularity_score as "popularityScore",
               a.id as "artistId", a.name as "artistName", a.is_verified as "isVerifiedArtist",
               l.name as "languageName", l.code as "languageCode",
               g.name as "genreName", g.slug as "genreSlug"
        FROM songs s
        JOIN artists a ON s.artist_id = a.id
        JOIN languages l ON s.language_id = l.id
        JOIN genres g ON s.genre_id = g.id
        WHERE s.status = 'PUBLISHED'
        ORDER BY (s.valid_likes_count * 2 + s.play_count) DESC
        LIMIT 6
      `);

      // 2. Rising Grassroots Creators (High like conversion)
      const risingCreatorsRes = await query(`
        SELECT d.id as "desiContentId", d.video_url as "videoUrl", d.views_count as "viewsCount",
               s.id as "songId", s.title, s.audio_url as "audioUrl", s.artwork_url as "artworkUrl",
               cp.id as "creatorId", cp.stage_name as "creatorName", cp.city, cp.verified_badge as "verifiedBadge",
               cp.category, l.name as "languageName"
        FROM desi_music_content d
        JOIN creator_profiles cp ON d.creator_id = cp.id
        JOIN songs s ON d.song_id = s.id
        JOIN languages l ON s.language_id = l.id
        WHERE cp.is_approved = TRUE
        ORDER BY d.views_count DESC
        LIMIT 4
      `);

      // 3. Made for You (Regional Affinity Recommendation)
      let madeForYouSql = `
        SELECT s.id, s.title, s.slug, s.duration_seconds as "durationSeconds",
               s.audio_url as "audioUrl", s.artwork_url as "artworkUrl",
               a.name as "artistName", l.name as "languageName", g.name as "genreName"
        FROM songs s
        JOIN artists a ON s.artist_id = a.id
        JOIN languages l ON s.language_id = l.id
        JOIN genres g ON s.genre_id = g.id
        WHERE s.status = 'PUBLISHED'
      `;
      const params: any[] = [];

      if (languageCode) {
        params.push(languageCode);
        madeForYouSql += ` AND l.code = $${params.length}`;
      }

      madeForYouSql += ` ORDER BY s.created_at DESC LIMIT 6`;

      const madeForYouRes = await query(madeForYouSql, params);

      return {
        trendingDiscoveries: trendingRes.rows,
        risingCreators: risingCreatorsRes.rows,
        madeForYou: madeForYouRes.rows,
      };
    });

    res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=120');
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err: any) {
    console.error('Error computing recommendations:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err.message },
    });
  }
});

export default router;
