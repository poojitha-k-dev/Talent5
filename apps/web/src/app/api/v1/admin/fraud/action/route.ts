import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/lib/db';
import { authenticateAdmin, recordAuditLog } from '@/lib/admin';

export async function POST(req: NextRequest) {
  const { user, errorResponse } = await authenticateAdmin(req);
  if (errorResponse) return errorResponse;

  const body = await req.json();
  const { action, eventId, creatorId, deductionINR, notes } = body;

  if (!['VOID_SUSPICIOUS_LIKES', 'RESOLVE_EVENT', 'DEDUCT_WALLET'].includes(action)) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_ACTION', message: 'Action must be VOID_SUSPICIOUS_LIKES, RESOLVE_EVENT, or DEDUCT_WALLET.' } },
      { status: 400 }
    );
  }

  const client = await getClient();
  try {
    await client.query('BEGIN');

    if (action === 'VOID_SUSPICIOUS_LIKES') {
      const voidRes = await client.query(
        `UPDATE likes SET status = 'INVALID' WHERE status = 'SUSPICIOUS' RETURNING id`
      );

      await client.query('COMMIT');

      await recordAuditLog({
        actorId: user!.id,
        action: 'VOID_SUSPICIOUS_LIKES',
        entityName: 'LIKES',
        entityId: '00000000-0000-0000-0000-000000000000',
        newState: { countVoided: voidRes.rowCount, notes },
      });

      return NextResponse.json({
        success: true,
        message: `Successfully marked ${voidRes.rowCount} suspicious likes as INVALID.`,
        data: { countVoided: voidRes.rowCount },
      });
    }

    if (action === 'RESOLVE_EVENT') {
      if (!eventId) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { success: false, error: { code: 'MISSING_ID', message: 'eventId required.' } },
          { status: 400 }
        );
      }

      await client.query(
        `UPDATE fraud_events SET action_taken = 'RESOLVED' WHERE id = $1`,
        [eventId]
      );

      await client.query('COMMIT');

      await recordAuditLog({
        actorId: user!.id,
        action: 'RESOLVE_FRAUD_EVENT',
        entityName: 'FRAUD_EVENT',
        entityId: eventId,
        newState: { actionTaken: 'RESOLVED', notes },
      });

      return NextResponse.json({
        success: true,
        message: 'Fraud event resolved successfully.',
      });
    }

    if (action === 'DEDUCT_WALLET') {
      if (!creatorId || !deductionINR || deductionINR <= 0) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_PARAMS', message: 'creatorId and positive deductionINR required.' } },
          { status: 400 }
        );
      }

      const walletRes = await client.query(
        `SELECT id, available_balance_inr FROM creator_wallets WHERE creator_id = $1 FOR UPDATE`,
        [creatorId]
      );

      if (walletRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { success: false, error: { code: 'WALLET_NOT_FOUND', message: 'Creator wallet not found.' } },
          { status: 404 }
        );
      }

      const wallet = walletRes.rows[0];
      const newAvailable = Math.max(0, parseFloat(wallet.available_balance_inr) - deductionINR);

      await client.query(
        `UPDATE creator_wallets SET available_balance_inr = $1 WHERE id = $2`,
        [newAvailable, wallet.id]
      );

      await client.query(
        `INSERT INTO wallet_transactions (id, wallet_id, type, amount_inr, status, notes)
         VALUES (uuid_generate_v4(), $1, 'FRAUD_DEDUCTION', $2, 'APPROVED', $3)`,
        [wallet.id, -deductionINR, notes || 'Engagement fraud deduction issued by Admin']
      );

      await client.query('COMMIT');

      await recordAuditLog({
        actorId: user!.id,
        action: 'DEDUCT_FRAUD_WALLET',
        entityName: 'CREATOR_WALLET',
        entityId: wallet.id,
        oldState: { availableBalanceINR: wallet.available_balance_inr },
        newState: { availableBalanceINR: newAvailable, deductionINR, notes },
      });

      return NextResponse.json({
        success: true,
        message: `₹${deductionINR} deducted from creator wallet for fraudulent engagement.`,
      });
    }

    await client.query('ROLLBACK');
    return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Unhandled action.' } }, { status: 400 });
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('Error handling fraud action:', err);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: err.message } },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
