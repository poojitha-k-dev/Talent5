import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authenticateAdmin } from '@/lib/admin';

export async function GET(req: NextRequest) {
  const { user, errorResponse } = await authenticateAdmin(req);
  if (errorResponse) return errorResponse;

  const url = new URL(req.url);
  const status = url.searchParams.get('status');

  try {
    let sql = `
      SELECT pr.id, pr.creator_id as "creatorId", pr.amount_inr as "amountINR",
             pr.payment_method as "paymentMethod", pr.account_ref_tokenized as "accountRefTokenized",
             pr.status, pr.transaction_ref as "transactionRef", pr.notes, pr.created_at as "createdAt",
             cp.stage_name as "creatorStageName", cp.city as "creatorCity",
             u.email as "userEmail", u.full_name as "userName",
             cw.available_balance_inr as "availableBalanceINR", cw.pending_balance_inr as "pendingBalanceINR"
      FROM payout_requests pr
      JOIN creator_profiles cp ON pr.creator_id = cp.id
      JOIN users u ON cp.user_id = u.id
      LEFT JOIN creator_wallets cw ON cp.id = cw.creator_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status && status !== 'ALL') {
      params.push(status);
      sql += ` AND pr.status = $${params.length}`;
    }

    sql += ` ORDER BY pr.created_at DESC`;

    const res = await query(sql, params);

    return NextResponse.json({
      success: true,
      data: res.rows,
    });
  } catch (err: any) {
    console.error('Error fetching admin payouts:', err);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: err.message } },
      { status: 500 }
    );
  }
}
