import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/lib/db';
import { authenticateAdmin, recordAuditLog } from '@/lib/admin';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, errorResponse } = await authenticateAdmin(req);
  if (errorResponse) return errorResponse;

  const rightsId = params.id;
  const body = await req.json();
  const { action, notes, newEndDate } = body;

  if (!['VERIFY', 'RESTRICT', 'TAKEDOWN', 'RENEW'].includes(action)) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_ACTION', message: 'Action must be VERIFY, RESTRICT, TAKEDOWN, or RENEW.' } },
      { status: 400 }
    );
  }

  const client = await getClient();
  try {
    await client.query('BEGIN');

    const rightsRes = await client.query(
      `SELECT rr.*, s.title as "songTitle" FROM rights_records rr LEFT JOIN songs s ON rr.song_id = s.id WHERE rr.id = $1 FOR UPDATE OF rr`,
      [rightsId]
    );

    if (rightsRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Rights record not found.' } },
        { status: 404 }
      );
    }

    const rec = rightsRes.rows[0];
    const oldState = { status: rec.status, endDate: rec.end_date, notes: rec.notes };

    let newStatus = rec.status;
    let updateEndDate = rec.end_date;

    if (action === 'VERIFY') newStatus = 'VERIFIED';
    else if (action === 'RESTRICT') newStatus = 'RESTRICTED';
    else if (action === 'TAKEDOWN') newStatus = 'TAKEDOWN';
    else if (action === 'RENEW') {
      newStatus = 'VERIFIED';
      if (newEndDate) updateEndDate = newEndDate;
    }

    await client.query(
      `UPDATE rights_records 
       SET status = $1, end_date = $2, notes = COALESCE($3, notes), reviewer_id = $4
       WHERE id = $5`,
      [newStatus, updateEndDate, notes || null, user!.id, rightsId]
    );

    // If TAKEDOWN, synchronize linked song status
    if (action === 'TAKEDOWN' && rec.song_id) {
      await client.query(
        `UPDATE songs SET status = 'TAKEDOWN' WHERE id = $1`,
        [rec.song_id]
      );
    } else if ((action === 'VERIFY' || action === 'RENEW') && rec.song_id) {
      await client.query(
        `UPDATE songs SET status = 'PUBLISHED' WHERE id = $1 AND status = 'TAKEDOWN'`,
        [rec.song_id]
      );
    }

    await client.query('COMMIT');

    // Record audit log
    await recordAuditLog({
      actorId: user!.id,
      action: `${action}_RIGHTS_RECORD`,
      entityName: 'RIGHTS_RECORD',
      entityId: rightsId,
      oldState,
      newState: { status: newStatus, songTitle: rec.songTitle, rightsHolder: rec.rights_holder, notes },
    });

    return NextResponse.json({
      success: true,
      message: `Rights record updated to ${newStatus}.`,
      data: { rightsId, status: newStatus },
    });
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('Error updating rights record:', err);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: err.message } },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
