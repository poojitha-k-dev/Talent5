import bcrypt from 'bcryptjs';
import { RightsRecord, RewardRule } from '@talent5/types';

// Password Security
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Formatting Helpers
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function formatCompactNumber(num: number): string {
  if (!num) return '0';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num.toString();
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Rights Verification Engine
export function isRightsActive(record: RightsRecord | null | undefined): {
  allowed: boolean;
  reason?: string;
} {
  if (!record) {
    return { allowed: false, reason: 'No rights record found for this content' };
  }

  if (record.status === 'TAKEDOWN') {
    return { allowed: false, reason: 'Content is under takedown order' };
  }

  if (record.status === 'RESTRICTED') {
    return { allowed: false, reason: 'Content license is restricted' };
  }

  if (record.status === 'EXPIRED') {
    return { allowed: false, reason: 'Content license has expired' };
  }

  if (record.endDate && new Date(record.endDate) < new Date()) {
    return { allowed: false, reason: 'Content license date has passed' };
  }

  if (!record.streamingAllowed) {
    return { allowed: false, reason: 'Streaming not permitted under current license' };
  }

  return { allowed: true };
}

// Anti-Fraud Risk Scoring for Likes & Engagement
export interface LikeSignalData {
  ipHash?: string;
  deviceFingerprint?: string;
  accountAgeDays: number;
  recentLikesCountLastMinute: number;
  isSelfLike: boolean;
  isVerifiedUser: boolean;
}

export function evaluateLikeRisk(signal: LikeSignalData): {
  isValid: boolean;
  riskScore: 'LOW' | 'MEDIUM' | 'HIGH';
  reasons: string[];
} {
  const reasons: string[] = [];
  let score = 0;

  if (signal.isSelfLike) {
    reasons.push('Creator self-engagement detected');
    score += 80;
  }

  if (signal.recentLikesCountLastMinute > 15) {
    reasons.push('Burst like pattern detected (possible bot or automated script)');
    score += 60;
  } else if (signal.recentLikesCountLastMinute > 8) {
    reasons.push('Elevated like frequency');
    score += 25;
  }

  if (signal.accountAgeDays < 1) {
    reasons.push('Fresh account created within 24 hours');
    score += 30;
  }

  if (!signal.isVerifiedUser) {
    score += 10;
  }

  let riskScore: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  if (score >= 60) {
    riskScore = 'HIGH';
  } else if (score >= 30) {
    riskScore = 'MEDIUM';
  }

  // A like is considered valid only if risk is LOW or MEDIUM and not self-engagement
  const isValid = riskScore !== 'HIGH' && !signal.isSelfLike;

  return { isValid, riskScore, reasons };
}

// Reward Calculation Engine (Pure business logic)
export function calculateCreatorReward(
  validLikesDelta: number,
  rule: RewardRule
): {
  amountINR: number;
  rateApplied: number;
} {
  if (validLikesDelta <= 0 || !rule.isActive) {
    return { amountINR: 0, rateApplied: rule.rewardPerValidLikeINR };
  }

  const baseReward = validLikesDelta * rule.rewardPerValidLikeINR;
  const bonus = rule.bonusRate ? baseReward * rule.bonusRate : 0;
  const total = Number((baseReward + bonus).toFixed(2));

  return {
    amountINR: total,
    rateApplied: rule.rewardPerValidLikeINR,
  };
}
