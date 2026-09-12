import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/lib/db';
import { authenticateAdmin, recordAuditLog } from '@/lib/admin';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, errorResponse } = await authenticateAdmin(req, ['ADMIN', 'SUPER_ADMIN', 'FINANCE']);
  if (errorResponse) return errorResponse;

  const payoutId = params.id;
  const body = await req.json();
  const { action, transactionRef, notes } = body;

  if (!['APPROVE_AND_PAY', 'REJECT', 'UNDER_REVIEW'].includes(action)) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_ACTION', message: 'Action must be APPROVE_AND_PAY, REJECT, or UNDER_REVIEW.' } },
      { status: 400 }
    );
  }

  if (action === 'APPROVE_AND_PAY' && !transactionRef) {
    return NextResponse.json(
      { success: false, error: { code: 'MISSING_REF', message: 'Bank/UPI transaction reference number is required to settle payout.' } },
      { status: 400 }
    );
  }

  const client = await getClient();
  try {
    await client.query('BEGIN');

    const payRes = await client.query(
      `SELECT pr.*, cp.stage_name, cw.id as "walletId", cw.available_balance_inr, cw.pending_balance_inr, cw.paid_balance_inr
       FROM payout_requests pr
       JOIN creator_profiles cp ON pr.creator_id = cp.id
       JOIN creator_wallets cw ON cp.id = cw.creator_id
       WHERE pr.id = $1 FOR UPDATE`,
      [payoutId]
    );

    if (payRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Payout request not found.' } },
        { status: 404 }
      );
    }

    const pay = payRes.rows[0];
    const amount = parseFloat(pay.amount_inr);
    const oldState = { status: pay.status, transactionRef: pay.transaction_ref };

    if (pay.status === 'PAID') {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { success: false, error: { code: 'ALREADY_PAID', message: 'This payout request has already been settled.' } },
        { status: 400 }
      );
    }

    if (action === 'APPROVE_AND_PAY') {
      // Update payout request
      await client.query(
        `UPDATE payout_requests
         SET status = 'PAID', transaction_ref = $1, reviewed_by = $2, notes = COALESCE($3, notes)
         WHERE id = $4`,
        [transactionRef, user!.id, notes || null, payoutId]
      );

      // Shift balance from pending_balance_inr to paid_balance_inr
      await client.query(
        `UPDATE creator_wallets
         SET pending_balance_inr = GREATEST(0, pending_balance_inr - $1),
             paid_balance_inr = paid_balance_inr + $1
         WHERE id = $2`,
        [amount, pay.walletId]
      );

      // Record transaction
      await client.query(
        `INSERT INTO wallet_transactions (id, wallet_id, type, amount_inr, status, reference_id, notes)
         VALUES (uuid_generate_v4(), $1, 'PAYOUT', $2, 'PAID', $3, $4)`,
        [pay.walletId, -amount, payoutId, `Settled via ${pay.payment_method} Ref: ${transactionRef}`]
      );
    } else if (action === 'REJECT') {
      // Return balance from pending back to available
      await client.query(
        `UPDATE payout_requests
         SET status = 'REJECTED', reviewed_by = $1, notes = COALESCE($2, notes)
         WHERE id = $3`,
        [user!.id, notes || 'Payout request rejected by finance', payoutId]
      );

      await client.query(
        `UPDATE creator_wallets
         SET pending_balance_inr = GREATEST(0, pending_balance_inr - $1),
             available_balance_inr = available_balance_inr + $1
         WHERE id = $2`,
        [amount, pay.walletId]
      );
    } else if (action === 'UNDER_REVIEW') {
      await client.query(
        `UPDATE payout_requests
         SET status = 'UNDER_REVIEW', reviewed_by = $1, notes = COALESCE($2, notes)
         WHERE id = $3`,
        [user!.id, notes || null, payoutId]
      );
    }

    await client.query('COMMIT');

    // Record audit log
    await recordAuditLog({
      actorId: user!.id,
      action: `${action}_PAYOUT`,
      entityName: 'PAYOUT_REQUEST',
      entityId: payoutId,
      oldState,
      newState: {
        status: action === 'APPROVE_AND_PAY' ? 'PAID' : action === 'REJECT' ? 'REJECTED' : 'UNDER_REVIEW',
        amountINR: amount,
        creator: pay.stage_name,
        transactionRef,
        notes,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Payout request ${action === 'APPROVE_AND_PAY' ? 'settled and marked PAID' : action.toLowerCase()} successfully.`,
      data: { payoutId, status: action === 'APPROVE_AND_PAY' ? 'PAID' : action },
    });
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('Error settling payout:', err);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: err.message } },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
