import { NextRequest, NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { getActiveRewardRule } from '@/lib/rewards';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const profileRes = await query('SELECT id FROM creator_profiles WHERE user_id = $1', [user.id]);
    if (profileRes.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Creator profile required' }, { status: 403 });
    }

    const creatorId = profileRes.rows[0].id;
    const { amount, paymentMethod = 'UPI', accountRef } = await req.json();

    const payoutAmount = parseFloat(amount);
    if (isNaN(payoutAmount) || payoutAmount <= 0) {
      return NextResponse.json({ success: false, message: 'Invalid payout amount' }, { status: 400 });
    }

    if (!accountRef || !accountRef.trim()) {
      return NextResponse.json({ success: false, message: 'UPI ID or Bank Account reference required' }, { status: 400 });
    }

    // Check minimum payout rule
    const rule = await getActiveRewardRule();
    if (payoutAmount < rule.minimumPayoutINR) {
      return NextResponse.json(
        {
          success: false,
          message: `Minimum withdrawal threshold is ₹${rule.minimumPayoutINR.toFixed(2)}. Requested amount is ₹${payoutAmount.toFixed(2)}.`,
        },
        { status: 400 }
      );
    }

    const client = await getClient();
    try {
      await client.query('BEGIN');

      // Check current available balance
      const walletRes = await client.query(
        'SELECT id, available_balance_inr FROM creator_wallets WHERE creator_id = $1 FOR UPDATE',
        [creatorId]
      );

      if (walletRes.rows.length === 0) {
        throw new Error('Wallet not initialized');
      }

      const wallet = walletRes.rows[0];
      const currentAvailable = parseFloat(wallet.available_balance_inr);

      if (currentAvailable < payoutAmount) {
        return NextResponse.json(
          {
            success: false,
            message: `Insufficient available balance. You have ₹${currentAvailable.toFixed(2)} available.`,
          },
          { status: 400 }
        );
      }

      // 1. Insert Payout Request
      const payoutInsert = await client.query(
        `INSERT INTO payout_requests (creator_id, amount_inr, payment_method, account_ref_tokenized, status)
         VALUES ($1, $2, $3, $4, 'REQUESTED')
         RETURNING id, amount_inr as "amountINR", status, created_at as "createdAt"`,
        [creatorId, payoutAmount, paymentMethod, accountRef.trim()]
      );

      // 2. Atomically shift available balance into pending payout balance
      await client.query(
        `UPDATE creator_wallets
         SET available_balance_inr = available_balance_inr - $1,
             pending_balance_inr = pending_balance_inr + $1,
             updated_at = NOW()
         WHERE id = $2`,
        [payoutAmount, wallet.id]
      );

      // 3. Log Wallet Transaction
      await client.query(
        `INSERT INTO wallet_transactions (wallet_id, type, amount_inr, status, reference_id, notes)
         VALUES ($1, 'PAYOUT', $2, 'PENDING', $3, $4)`,
        [
          wallet.id,
          -payoutAmount,
          payoutInsert.rows[0].id,
          `Withdrawal requested to ${paymentMethod}: ${accountRef.trim()}`,
        ]
      );

      // 4. Audit Log
      await client.query(
        `INSERT INTO audit_logs (actor_id, action, entity_name, entity_id, new_state)
         VALUES ($1, 'PAYOUT_REQUESTED', 'payout_requests', $2, $3)`,
        [
          user.id,
          payoutInsert.rows[0].id,
          JSON.stringify({ amount: payoutAmount, paymentMethod, accountRef }),
        ]
      );

      await client.query('COMMIT');

      return NextResponse.json(
        {
          success: true,
          message: `Payout request for ₹${payoutAmount.toFixed(2)} submitted successfully. Talent5 finance will process to ${accountRef}.`,
          data: payoutInsert.rows[0],
        },
        { status: 201 }
      );
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Payout error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
