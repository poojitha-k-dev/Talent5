import { NextRequest, NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db';
import { authenticateAdmin, recordAuditLog } from '@/lib/admin';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, errorResponse } = await authenticateAdmin(req);
  if (errorResponse) return errorResponse;

  const applicationId = params.id;
  const body = await req.json();
  const { action, notes } = body;

  if (!['APPROVE', 'REJECT', 'UNDER_REVIEW', 'SUSPEND'].includes(action)) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_ACTION', message: 'Action must be APPROVE, REJECT, UNDER_REVIEW, or SUSPEND.' } },
      { status: 400 }
    );
  }

  const client = await getClient();
  try {
    await client.query('BEGIN');

    // 1. Fetch application
    const appRes = await client.query(
      `SELECT * FROM creator_applications WHERE id = $1 FOR UPDATE`,
      [applicationId]
    );

    if (appRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Creator application not found.' } },
        { status: 404 }
      );
    }

    const app = appRes.rows[0];
    const oldState = { status: app.status, reviewNotes: app.review_notes };

    let newStatus = 'UNDER_REVIEW';
    if (action === 'APPROVE') newStatus = 'APPROVED';
    else if (action === 'REJECT') newStatus = 'REJECTED';
    else if (action === 'SUSPEND') newStatus = 'SUSPENDED';

    // 2. Update application status
    await client.query(
      `UPDATE creator_applications 
       SET status = $1, reviewed_by = $2, review_notes = $3
       WHERE id = $4`,
      [newStatus, user!.id, notes || null, applicationId]
    );

    // 3. If approved, provision creator profile, role, and wallet
    if (action === 'APPROVE') {
      // Upsert creator_profile
      const profRes = await client.query(
        `INSERT INTO creator_profiles (
          id, user_id, stage_name, bio, city, state, primary_language_id, category, is_approved, approved_at, verified_badge, portfolio_url
        ) VALUES (
          uuid_generate_v4(), $1, $2, $3, $4, $5, 1, $6, TRUE, NOW(), TRUE, $7
        )
        ON CONFLICT (user_id) DO UPDATE SET
          stage_name = EXCLUDED.stage_name,
          bio = EXCLUDED.bio,
          city = EXCLUDED.city,
          state = EXCLUDED.state,
          category = EXCLUDED.category,
          is_approved = TRUE,
          approved_at = NOW(),
          verified_badge = TRUE,
          portfolio_url = EXCLUDED.portfolio_url
        RETURNING id`,
        [
          app.user_id,
          app.stage_name,
          app.bio,
          app.city,
          app.state,
          app.category,
          app.portfolio_url || null,
        ]
      );

      const creatorId = profRes.rows[0].id;

      // Assign CREATOR role (role id 2 in seed or lookup)
      await client.query(
        `INSERT INTO user_roles (user_id, role_id)
         SELECT $1, id FROM roles WHERE name = 'CREATOR'
         ON CONFLICT (user_id, role_id) DO NOTHING`,
        [app.user_id]
      );

      // Provision creator_wallets
      await client.query(
        `INSERT INTO creator_wallets (id, creator_id, available_balance_inr, pending_balance_inr, approved_balance_inr, paid_balance_inr, total_earned_inr)
         VALUES (uuid_generate_v4(), $1, 0.00, 0.00, 0.00, 0.00, 0.00)
         ON CONFLICT (creator_id) DO NOTHING`,
        [creatorId]
      );
    }

    await client.query('COMMIT');

    // Record audit log
    await recordAuditLog({
      actorId: user!.id,
      action: `${action}_CREATOR_APPLICATION`,
      entityName: 'CREATOR_APPLICATION',
      entityId: applicationId,
      oldState,
      newState: { status: newStatus, reviewNotes: notes, applicant: app.stage_name },
    });

    return NextResponse.json({
      success: true,
      message: `Creator application ${newStatus.toLowerCase()} successfully.`,
      data: { applicationId, status: newStatus },
    });
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('Error updating creator application:', err);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: err.message } },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
