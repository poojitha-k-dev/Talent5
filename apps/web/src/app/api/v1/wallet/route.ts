import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { getActiveRewardRule } from '@/lib/rewards';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const profileRes = await query('SELECT id, stage_name FROM creator_profiles WHERE user_id = $1', [user.id]);
    if (profileRes.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Creator profile not found' }, { status: 403 });
    }

    const creatorId = profileRes.rows[0].id;

    // Get wallet
    const walletRes = await query(
      `SELECT id, available_balance_inr as "availableBalanceINR",
              pending_balance_inr as "pendingBalanceINR",
              approved_balance_inr as "approvedBalanceINR",
              paid_balance_inr as "paidBalanceINR",
              total_earned_inr as "totalEarnedINR",
              updated_at as "updatedAt"
       FROM creator_wallets
       WHERE creator_id = $1`,
      [creatorId]
    );

    const wallet = walletRes.rows[0] || {
      id: null,
      availableBalanceINR: 0,
      pendingBalanceINR: 0,
      approvedBalanceINR: 0,
      paidBalanceINR: 0,
      totalEarnedINR: 0,
    };

    // Get transactions
    let transactions: any[] = [];
    if (wallet.id) {
      const txRes = await query(
        `SELECT id, type, amount_inr as "amountINR", status, notes, created_at as "createdAt"
         FROM wallet_transactions
         WHERE wallet_id = $1
         ORDER BY created_at DESC
         LIMIT 50`,
        [wallet.id]
      );
      transactions = txRes.rows;
    }

    // Get payout requests
    const payoutsRes = await query(
      `SELECT id, amount_inr as "amountINR", payment_method as "paymentMethod",
              account_ref_tokenized as "accountRef", status, created_at as "createdAt",
              transaction_ref as "transactionRef", notes
       FROM payout_requests
       WHERE creator_id = $1
       ORDER BY created_at DESC`,
      [creatorId]
    );

    const rule = await getActiveRewardRule();

    return NextResponse.json({
      success: true,
      data: {
        wallet: {
          ...wallet,
          availableBalanceINR: parseFloat(wallet.availableBalanceINR || '0'),
          pendingBalanceINR: parseFloat(wallet.pendingBalanceINR || '0'),
          approvedBalanceINR: parseFloat(wallet.approvedBalanceINR || '0'),
          paidBalanceINR: parseFloat(wallet.paidBalanceINR || '0'),
          totalEarnedINR: parseFloat(wallet.totalEarnedINR || '0'),
        },
        transactions,
        payoutRequests: payoutsRes.rows,
        rule,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
