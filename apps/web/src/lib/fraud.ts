import { query } from './db';
import { RiskScore, LikeValidationStatus } from '@talent5/types';

export interface EvaluateLikeParams {
  userId: string;
  targetType: 'SONG' | 'DESI_CONTENT';
  targetId: string;
  ipHash?: string;
  deviceFingerprint?: string;
  userAgent?: string;
}

export async function processAndValidateLike(params: EvaluateLikeParams): Promise<{
  isValid: boolean;
  status: LikeValidationStatus;
  riskScore: RiskScore;
  reasons: string[];
}> {
  const { userId, targetType, targetId } = params;
  const reasons: string[] = [];
  let score = 0;

  // 1. Check if user is the creator of the target content (Self-engagement check)
  if (targetType === 'SONG') {
    const creatorCheck = await query(
      `SELECT a.user_id 
       FROM songs s 
       JOIN artists a ON s.artist_id = a.id 
       WHERE s.id = $1`,
      [targetId]
    );
    if (creatorCheck.rows.length > 0 && creatorCheck.rows[0].user_id === userId) {
      reasons.push('Creator self-engagement detected');
      score += 80;
    }
  } else if (targetType === 'DESI_CONTENT') {
    const desiCheck = await query(
      `SELECT cp.user_id 
       FROM desi_music_content dmc 
       JOIN creator_profiles cp ON dmc.creator_id = cp.id 
       WHERE dmc.id = $1`,
      [targetId]
    );
    if (desiCheck.rows.length > 0 && desiCheck.rows[0].user_id === userId) {
      reasons.push('Creator self-engagement on Desi content');
      score += 80;
    }
  }

  // 2. Velocity check: likes in last 60 seconds by this user
  const recentLikesRes = await query(
    `SELECT COUNT(*) as count 
     FROM likes 
     WHERE user_id = $1 AND created_at > NOW() - INTERVAL '1 minute'`,
    [userId]
  );
  const recentCount = parseInt(recentLikesRes.rows[0]?.count || '0', 10);
  if (recentCount >= 15) {
    reasons.push('Burst like activity: Exceeds 15 likes per minute threshold');
    score += 65;
  } else if (recentCount >= 8) {
    reasons.push('Elevated like frequency');
    score += 25;
  }

  // 3. User account maturity check
  const userMaturity = await query(
    `SELECT created_at, is_verified FROM users WHERE id = $1`,
    [userId]
  );
  if (userMaturity.rows.length > 0) {
    const createdAt = new Date(userMaturity.rows[0].created_at);
    const ageHours = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
    if (ageHours < 2) {
      reasons.push('New account created within 2 hours');
      score += 35;
    }
    if (!userMaturity.rows[0].is_verified) {
      score += 10;
    }
  }

  // 4. Device / IP collision check
  if (params.deviceFingerprint) {
    const deviceCollision = await query(
      `SELECT COUNT(DISTINCT user_id) as count 
       FROM likes 
       WHERE device_fingerprint = $1 AND target_id = $2 AND created_at > NOW() - INTERVAL '24 hours'`,
      [params.deviceFingerprint, targetId]
    );
    const accountsOnSameDevice = parseInt(deviceCollision.rows[0]?.count || '0', 10);
    if (accountsOnSameDevice > 2) {
      reasons.push('Multiple accounts liking same content from identical device fingerprint');
      score += 55;
    }
  }

  let riskScore: RiskScore = 'LOW';
  let status: LikeValidationStatus = 'VALID';

  if (score >= 60) {
    riskScore = 'HIGH';
    status = 'INVALID';
  } else if (score >= 30) {
    riskScore = 'MEDIUM';
    status = 'SUSPICIOUS';
  }

  return {
    isValid: status === 'VALID',
    status,
    riskScore,
    reasons,
  };
}
