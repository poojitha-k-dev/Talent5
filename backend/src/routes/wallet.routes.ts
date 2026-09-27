import { Router, Request, Response } from 'express';
import { query, getClient } from '../lib/db';
import { getUserFromRequest } from '../lib/auth';
import { getActiveRewardRule } from '../lib/rewards';

const router = Router();

// GET /api/v1/wallet
router.get('/', async (req: Request, res: Response) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const profileRes = await query('SELECT id, stage_name FROM creator_profiles WHERE user_id = $1', [user.id]);
    if (profileRes.rows.length === 0) {
      return res.status(403).json({ success: false, message: 'Creator profile not found' });
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

    return res.status(200).json({
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
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/wallet/payout-request
router.post('/payout-request', async (req: Request, res: Response) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const profileRes = await query('SELECT id FROM creator_profiles WHERE user_id = $1', [user.id]);
    if (profileRes.rows.length === 0) {
      return res.status(403).json({ success: false, message: 'Creator profile required' });
    }

    const creatorId = profileRes.rows[0].id;
    const { amount, paymentMethod = 'UPI', accountRef } = req.body;

    const payoutAmount = parseFloat(amount);
    if (isNaN(payoutAmount) || payoutAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid payout amount' });
    }

    if (!accountRef || !accountRef.trim()) {
      return res.status(400).json({ success: false, message: 'UPI ID or Bank Account reference required' });
    }

    // Check minimum payout rule
    const rule = await getActiveRewardRule();
    if (payoutAmount < rule.minimumPayoutINR) {
      return res.status(400).json({
        success: false,
        message: `Minimum withdrawal threshold is ₹${rule.minimumPayoutINR.toFixed(2)}. Requested amount is ₹${payoutAmount.toFixed(2)}.`,
      });
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
        return res.status(400).json({
          success: false,
          message: `Insufficient available balance. You have ₹${currentAvailable.toFixed(2)} available.`,
        });
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

      return res.status(201).json({
        success: true,
        message: `Payout request for ₹${payoutAmount.toFixed(2)} submitted successfully. Talent5 finance will process to ${accountRef}.`,
        data: payoutInsert.rows[0],
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Payout error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
