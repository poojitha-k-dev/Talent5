import crypto from 'crypto';
import { getClient } from './db';
import { recordAuditLog } from './admin';

export interface PayoutWebhookPayload {
  event: 'payout.processed' | 'payout.failed' | 'payout.reversed';
  payload: {
    payout: {
      entity: {
        id: string; // Razorpay/Cashfree payout ID
        reference_id: string; // Our internal payout_requests.id
        amount: number; // in paise or rupees
        currency: 'INR';
        status: 'processed' | 'failed' | 'reversed';
        utr: string; // Bank UTR or UPI Ref
        mode: 'UPI' | 'NEFT' | 'IMPS';
        failure_reason?: string;
      };
    };
  };
}

const WEBHOOK_SECRET = process.env.PAYMENT_WEBHOOK_SECRET || 'talent5_live_webhook_secret_2026_instant_upi';

export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  if (!signature) return false;
  try {
    const expectedSignature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(rawBody)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature, 'utf8'),
      Buffer.from(expectedSignature, 'utf8')
    );
  } catch {
    return false;
  }
}

export function generateWebhookSignature(payloadString: string): string {
  return crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payloadString)
    .digest('hex');
}

export async function processPayoutWebhook(data: PayoutWebhookPayload): Promise<{ success: boolean; message: string }> {
  const payout = data.payload.payout.entity;
  const internalPayoutId = payout.reference_id;
  const client = await getClient();

  try {
    await client.query('BEGIN');

    const payoutRes = await client.query(
      `SELECT pr.*, cw.id as "walletId", cw.available_balance_inr, cw.pending_balance_inr, cw.paid_balance_inr, cp.stage_name
       FROM payout_requests pr
       JOIN creator_profiles cp ON pr.creator_id = cp.id
       JOIN creator_wallets cw ON cp.id = cw.creator_id
       WHERE pr.id = $1 FOR UPDATE`,
      [internalPayoutId]
    );

    if (payoutRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return { success: false, message: `Payout request ${internalPayoutId} not found.` };
    }

    const pr = payoutRes.rows[0];
    const amount = parseFloat(pr.amount_inr);

    if (data.event === 'payout.processed') {
      if (pr.status === 'PAID') {
        await client.query('COMMIT');
        return { success: true, message: 'Payout already marked PAID (idempotent)' };
      }

      // Mark PAID with UTR
      await client.query(
        `UPDATE payout_requests
         SET status = 'PAID', transaction_ref = $1, notes = COALESCE(notes, '') || ' [Auto-Settled via Gateway Webhook]'
         WHERE id = $2`,
        [payout.utr || `UPI/GATEWAY/${payout.id}`, internalPayoutId]
      );

      // Move from pending to paid balance
      await client.query(
        `UPDATE creator_wallets
         SET pending_balance_inr = GREATEST(0, pending_balance_inr - $1),
             paid_balance_inr = paid_balance_inr + $1
         WHERE id = $2`,
        [amount, pr.walletId]
      );

      // Add transaction
      await client.query(
        `INSERT INTO wallet_transactions (id, wallet_id, type, amount_inr, status, reference_id, notes)
         VALUES (uuid_generate_v4(), $1, 'PAYOUT', $2, 'PAID', $3, $4)`,
        [pr.walletId, -amount, internalPayoutId, `Instant UPI Disbursement UTR: ${payout.utr}`]
      );

      await client.query('COMMIT');

      await recordAuditLog({
        actorId: pr.creator_id,
        action: 'WEBHOOK_PAYOUT_SETTLED',
        entityName: 'PAYOUT_REQUEST',
        entityId: internalPayoutId,
        newState: { status: 'PAID', utr: payout.utr, amountINR: amount, creator: pr.stage_name },
      });

      return { success: true, message: `Payout ${internalPayoutId} settled successfully.` };
    } else if (data.event === 'payout.failed' || data.event === 'payout.reversed') {
      // Revert funds back to available balance
      await client.query(
        `UPDATE payout_requests
         SET status = 'REJECTED', notes = COALESCE(notes, '') || ' [Gateway Failed: ' || $1 || ']'
         WHERE id = $2`,
        [payout.failure_reason || 'Bank gateway transaction failed', internalPayoutId]
      );

      await client.query(
        `UPDATE creator_wallets
         SET pending_balance_inr = GREATEST(0, pending_balance_inr - $1),
             available_balance_inr = available_balance_inr + $1
         WHERE id = $2`,
        [amount, pr.walletId]
      );

      await client.query('COMMIT');

      await recordAuditLog({
        actorId: pr.creator_id,
        action: 'WEBHOOK_PAYOUT_FAILED_REVERSED',
        entityName: 'PAYOUT_REQUEST',
        entityId: internalPayoutId,
        newState: { status: 'REJECTED', reason: payout.failure_reason, creator: pr.stage_name },
      });

      return { success: true, message: `Payout ${internalPayoutId} failed and reversed to creator wallet.` };
    }

    await client.query('ROLLBACK');
    return { success: false, message: `Unhandled event ${data.event}` };
  } catch (err: any) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
