import { query, getClient } from './db';
import { RewardRule } from '@talent5/types';

export async function getActiveRewardRule(): Promise<RewardRule> {
  const res = await query(
    `SELECT id, reward_per_valid_like_inr as "rewardPerValidLikeINR",
            minimum_payout_inr as "minimumPayoutINR",
            maximum_monthly_reward_inr as "maximumMonthlyRewardINR",
            bonus_rate as "bonusRate", is_active as "isActive",
            created_at as "createdAt"
     FROM reward_rules
     WHERE is_active = TRUE
     ORDER BY id DESC
     LIMIT 1`
  );

  if (res.rows.length === 0) {
    // Default fallback rule
    return {
      id: '1',
      rewardPerValidLikeINR: 0.10,
      minimumPayoutINR: 500.00,
      maximumMonthlyRewardINR: 100000.00,
      bonusRate: 0.0,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
  }

  const row = res.rows[0];
  return {
    ...row,
    rewardPerValidLikeINR: parseFloat(row.rewardPerValidLikeINR),
    minimumPayoutINR: parseFloat(row.minimumPayoutINR),
    maximumMonthlyRewardINR: parseFloat(row.maximumMonthlyRewardINR),
    bonusRate: parseFloat(row.bonusRate || '0'),
  };
}

export async function creditCreatorForValidLike(creatorId: string, contentId: string): Promise<void> {
  const rule = await getActiveRewardRule();
  if (!rule.isActive) return;

  const rewardAmount = rule.rewardPerValidLikeINR;

  const client = await getClient();
  try {
    await client.query('BEGIN');

    // 1. Record calculation entry
    await client.query(
      `INSERT INTO reward_calculations (creator_id, content_id, valid_likes_delta, rate_applied, amount_inr, status)
       VALUES ($1, $2, 1, $3, $4, 'CREDITED')`,
      [creatorId, contentId, rewardAmount, rewardAmount]
    );

    // 2. Upsert creator wallet
    await client.query(
      `INSERT INTO creator_wallets (creator_id, available_balance_inr, approved_balance_inr, total_earned_inr, updated_at)
       VALUES ($1, $2, $2, $2, NOW())
       ON CONFLICT (creator_id)
       DO UPDATE SET
         available_balance_inr = creator_wallets.available_balance_inr + $2,
         approved_balance_inr = creator_wallets.approved_balance_inr + $2,
         total_earned_inr = creator_wallets.total_earned_inr + $2,
         updated_at = NOW()`,
      [creatorId, rewardAmount]
    );

    // 3. Log transaction
    const walletRes = await client.query(
      `SELECT id FROM creator_wallets WHERE creator_id = $1`,
      [creatorId]
    );
    if (walletRes.rows.length > 0) {
      await client.query(
        `INSERT INTO wallet_transactions (wallet_id, type, amount_inr, status, notes)
         VALUES ($1, 'REWARD', $2, 'APPROVED', $3)`,
        [walletRes.rows[0].id, rewardAmount, `Engagement reward: 1 Valid Like @ ₹${rewardAmount.toFixed(2)}`]
      );
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error crediting creator wallet for valid like:', error);
    throw error;
  } finally {
    client.release();
  }
}
