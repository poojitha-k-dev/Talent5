import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(req);
    const body = await req.json();
    const { entryId } = body;

    if (!entryId) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'entryId is required to vote.' } },
        { status: 400 }
      );
    }

    // Atomically increment vote
    const voteRes = await query(
      `UPDATE competition_entries
       SET votes_count = votes_count + 1
       WHERE id = $1
       RETURNING id, votes_count as "votesCount", competition_id as "competitionId"`,
      [entryId]
    );

    if (voteRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Competition entry not found.' } },
        { status: 404 }
      );
    }

    const updated = voteRes.rows[0];

    return NextResponse.json({
      success: true,
      message: 'Vote registered successfully!',
      data: {
        entryId: updated.id,
        votesCount: updated.votesCount,
      },
    });
  } catch (err: any) {
    console.error('Error recording competition vote:', err);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: err.message } },
      { status: 500 }
    );
  }
}
