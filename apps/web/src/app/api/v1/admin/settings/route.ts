import { NextRequest, NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db';
import { authenticateAdmin, recordAuditLog } from '@/lib/admin';

export async function GET(req: NextRequest) {
  const { user, errorResponse } = await authenticateAdmin(req);
  if (errorResponse) return errorResponse;

  try {
    const [rulesRes, settingsRes] = await Promise.all([
      query(`SELECT * FROM reward_rules WHERE is_active = TRUE ORDER BY id DESC LIMIT 1`),
      query(`SELECT key, value, category, description, updated_at as "updatedAt" FROM system_settings ORDER BY category, key`),
    ]);

    const settingsMap: Record<string, any> = {};
    settingsRes.rows.forEach((row: any) => {
      settingsMap[row.key] = {
        value: row.value,
        category: row.category,
        description: row.description,
        updatedAt: row.updatedAt,
      };
    });

    const rule = rulesRes.rows[0] || {
      id: 1,
      reward_per_valid_like_inr: 0.10,
      minimum_payout_inr: 500.00,
      maximum_monthly_reward_inr: 100000.00,
      bonus_rate: 0.05,
      is_active: true,
    };

    return NextResponse.json({
      success: true,
      data: {
        rewardRule: {
          id: rule.id,
          rewardPerValidLikeINR: parseFloat(rule.reward_per_valid_like_inr),
          minimumPayoutINR: parseFloat(rule.minimum_payout_inr),
          maximumMonthlyRewardINR: parseFloat(rule.maximum_monthly_reward_inr),
          bonusRate: parseFloat(rule.bonus_rate),
          isActive: rule.is_active,
        },
        systemSettings: settingsMap,
      },
    });
  } catch (err: any) {
    console.error('Error fetching admin settings:', err);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: err.message } },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const { user, errorResponse } = await authenticateAdmin(req, ['ADMIN', 'SUPER_ADMIN']);
  if (errorResponse) return errorResponse;

  const body = await req.json();
  const { rewardRule, systemSettings } = body;

  const client = await getClient();
  try {
    await client.query('BEGIN');

    // Update reward rules
    if (rewardRule) {
      await client.query(
        `UPDATE reward_rules
         SET reward_per_valid_like_inr = $1,
             minimum_payout_inr = $2,
             maximum_monthly_reward_inr = $3,
             bonus_rate = $4
         WHERE id = $5`,
        [
          rewardRule.rewardPerValidLikeINR,
          rewardRule.minimumPayoutINR,
          rewardRule.maximumMonthlyRewardINR,
          rewardRule.bonusRate,
          rewardRule.id || 1,
        ]
      );
    }

    // Update system settings keys
    if (systemSettings && typeof systemSettings === 'object') {
      for (const [key, val] of Object.entries(systemSettings)) {
        await client.query(
          `INSERT INTO system_settings (key, value, category, description, updated_at)
           VALUES ($1, $2::jsonb, 'platform', 'Dynamic admin setting', NOW())
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
          [key, JSON.stringify(val)]
        );
      }
    }

    await client.query('COMMIT');

    await recordAuditLog({
      actorId: user!.id,
      action: 'UPDATE_SYSTEM_SETTINGS_AND_REWARDS',
      entityName: 'SYSTEM_SETTINGS',
      entityId: '00000000-0000-0000-0000-000000000000',
      newState: { rewardRule, systemSettings },
    });

    return NextResponse.json({
      success: true,
      message: 'System settings and reward parameters updated successfully.',
    });
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('Error updating settings:', err);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: err.message } },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
