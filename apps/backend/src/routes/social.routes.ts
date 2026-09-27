import { Router, Request, Response } from 'express';
import { query, getClient } from '../lib/db';
import { getUserFromRequest } from '../lib/auth';
import { processAndValidateLike } from '../lib/fraud';
import { creditCreatorForValidLike } from '../lib/rewards';

const router = Router();

// POST /api/v1/social/like
router.post('/like', async (req: Request, res: Response) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Authentication required to like tracks' });
    }

    const { targetType, targetId, deviceFingerprint } = req.body;
    if (!targetType || !targetId) {
      return res.status(400).json({ success: false, message: 'targetType and targetId are required' });
    }

    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

    const existing = await query(
      'SELECT id, status FROM likes WHERE user_id = $1 AND target_type = $2 AND target_id = $3',
      [user.id, targetType, targetId]
    );

    const client = await getClient();
    try {
      await client.query('BEGIN');

      if (existing.rows.length > 0) {
        const wasValid = existing.rows[0].status === 'VALID';
        await client.query(
          'DELETE FROM likes WHERE user_id = $1 AND target_type = $2 AND target_id = $3',
          [user.id, targetType, targetId]
        );

        if (targetType === 'SONG') {
          await client.query(
            `UPDATE songs 
             SET raw_likes_count = GREATEST(0, raw_likes_count - 1),
                 valid_likes_count = CASE WHEN $1 THEN GREATEST(0, valid_likes_count - 1) ELSE valid_likes_count END
             WHERE id = $2`,
            [wasValid, targetId]
          );
        }

        await client.query('COMMIT');
        return res.status(200).json({ success: true, action: 'UNLIKED', message: 'Like removed' });
      }

      // Fraud detection & validation
      const validation = await processAndValidateLike({
        userId: user.id,
        targetType: targetType as 'SONG' | 'DESI_CONTENT',
        targetId,
        ipHash: ip,
        deviceFingerprint,
      });

      await client.query(
        `INSERT INTO likes (user_id, target_type, targetId, ip_address, device_fingerprint, status, is_valid)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [user.id, targetType, targetId, ip, deviceFingerprint || null, validation.status, validation.isValid]
      );

      if (targetType === 'SONG') {
        await client.query(
          `UPDATE songs 
           SET raw_likes_count = raw_likes_count + 1,
               valid_likes_count = CASE WHEN $1 THEN valid_likes_count + 1 ELSE valid_likes_count END
           WHERE id = $2`,
          [validation.isValid, targetId]
        );

        if (validation.isValid) {
          const songRes = await client.query('SELECT artist_id FROM songs WHERE id = $1', [targetId]);
          if (songRes.rows.length > 0 && songRes.rows[0].artist_id) {
            await creditCreatorForValidLike(songRes.rows[0].artist_id, targetId);
          }
        }
      }

      await client.query('COMMIT');

      return res.status(200).json({
        success: true,
        action: 'LIKED',
        isValid: validation.isValid,
        status: validation.status,
      });
    } catch (txErr) {
      await client.query('ROLLBACK');
      throw txErr;
    } finally {
      client.release();
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/v1/social/likes
router.get('/likes', async (req: Request, res: Response) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    const r = await query(
      `SELECT target_id as "targetId", target_type as "targetType", created_at as "createdAt"
       FROM likes WHERE user_id = $1 ORDER BY created_at DESC`,
      [user.id]
    );
    return res.status(200).json({ success: true, data: r.rows });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/v1/social/follow
router.post('/follow', async (req: Request, res: Response) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ success: false, message: 'Authentication required' });

    const { artistId } = req.body;
    if (!artistId) return res.status(400).json({ success: false, message: 'artistId is required' });

    const existing = await query('SELECT id FROM follows WHERE follower_id = $1 AND artist_id = $2', [user.id, artistId]);
    if (existing.rows.length > 0) {
      await query('DELETE FROM follows WHERE follower_id = $1 AND artist_id = $2', [user.id, artistId]);
      return res.status(200).json({ success: true, action: 'UNFOLLOWED' });
    }

    await query('INSERT INTO follows (follower_id, artist_id) VALUES ($1, $2)', [user.id, artistId]);
    return res.status(200).json({ success: true, action: 'FOLLOWED' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/v1/social/comments
router.get('/comments', async (req: Request, res: Response) => {
  try {
    const songId = req.query.songId as string;
    if (!songId) return res.status(400).json({ success: false, message: 'songId required' });

    const r = await query(
      `SELECT c.*, u.full_name as "userName", u.username, u.avatar_url as "userAvatar"
       FROM comments c JOIN users u ON c.user_id = u.id
       WHERE c.song_id = $1 ORDER BY c.created_at DESC LIMIT 50`,
      [songId]
    );
    return res.status(200).json({ success: true, data: r.rows });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/v1/social/comments
router.post('/comments', async (req: Request, res: Response) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ success: false, message: 'Authentication required' });

    const { songId, text } = req.body;
    if (!songId || !text) return res.status(400).json({ success: false, message: 'songId and text required' });

    const r = await query(
      `INSERT INTO comments (user_id, song_id, text) VALUES ($1, $2, $3) RETURNING *`,
      [user.id, songId, text.trim()]
    );
    return res.status(201).json({ success: true, data: r.rows[0] });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
