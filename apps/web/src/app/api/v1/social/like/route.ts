import { NextRequest, NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { processAndValidateLike } from '@/lib/fraud';
import { creditCreatorForValidLike } from '@/lib/rewards';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required to like tracks' },
        { status: 401 }
      );
    }

    const { targetType, targetId, deviceFingerprint } = await req.json();

    if (!targetType || !targetId) {
      return NextResponse.json(
        { success: false, message: 'targetType and targetId are required' },
        { status: 400 }
      );
    }

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

    // Check if like already exists (toggle action)
    const existing = await query(
      'SELECT id, status FROM likes WHERE user_id = $1 AND target_type = $2 AND target_id = $3',
      [user.id, targetType, targetId]
    );

    const client = await getClient();
    try {
      await client.query('BEGIN');

      if (existing.rows.length > 0) {
        // Unlike action
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
        return NextResponse.json({
          success: true,
          action: 'UNLIKED',
          message: 'Like removed',
        });
      }

      // New Like action: Run Anti-Fraud Validation Heuristic
      const validation = await processAndValidateLike({
        userId: user.id,
        targetType,
        targetId,
        ipHash: ip,
        deviceFingerprint: deviceFingerprint || 'web-client',
        userAgent: req.headers.get('user-agent') || 'browser',
      });

      // Insert like record
      const likeInsert = await client.query(
        `INSERT INTO likes (user_id, target_type, target_id, status, risk_score, ip_hash, device_fingerprint, user_agent)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        [
          user.id,
          targetType,
          targetId,
          validation.status,
          validation.riskScore,
          ip,
          deviceFingerprint || 'web-client',
          req.headers.get('user-agent'),
        ]
      );

      // Record engagement signals log
      await client.query(
        `INSERT INTO engagement_validation (like_id, signals)
         VALUES ($1, $2)`,
        [
          likeInsert.rows[0].id,
          JSON.stringify({
            isValid: validation.isValid,
            reasons: validation.reasons,
            riskScore: validation.riskScore,
          }),
        ]
      );

      // Update song like metrics
      if (targetType === 'SONG') {
        await client.query(
          `UPDATE songs 
           SET raw_likes_count = raw_likes_count + 1,
               valid_likes_count = CASE WHEN $1 THEN valid_likes_count + 1 ELSE valid_likes_count END
           WHERE id = $2`,
          [validation.isValid, targetId]
        );

        // If validated, credit creator
        if (validation.isValid) {
          // Find creator profile linked to artist if any
          const artistRes = await client.query(
            `SELECT cp.id as creator_id 
             FROM songs s 
             JOIN artists a ON s.artist_id = a.id 
             JOIN creator_profiles cp ON a.user_id = cp.user_id 
             WHERE s.id = $1`,
            [targetId]
          );

          if (artistRes.rows.length > 0) {
            await creditCreatorForValidLike(artistRes.rows[0].creator_id, targetId);
          }
        }
      }

      await client.query('COMMIT');

      return NextResponse.json({
        success: true,
        action: 'LIKED',
        validation: {
          isValid: validation.isValid,
          riskScore: validation.riskScore,
          status: validation.status,
        },
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Like error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error processing like' },
      { status: 500 }
    );
  }
}
