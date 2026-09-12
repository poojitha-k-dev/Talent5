import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required to enter tournament.' } },
        { status: 401 }
      );
    }

    // Check creator profile
    const creatorRes = await query(
      `SELECT id, is_approved FROM creator_profiles WHERE user_id = $1`,
      [user.id]
    );

    if (creatorRes.rows.length === 0 || !creatorRes.rows[0].is_approved) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Only verified approved creators can submit tournament entries.' } },
        { status: 403 }
      );
    }

    const creatorId = creatorRes.rows[0].id;
    const body = await req.json();
    const { contentId } = body;

    if (!contentId) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'contentId is required.' } },
        { status: 400 }
      );
    }

    // Resolve competition UUID if slug passed
    const compRes = await query(
      `SELECT id, status FROM competitions WHERE id::text = $1 OR slug = $1 LIMIT 1`,
      [params.id]
    );

    if (compRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Competition not found.' } },
        { status: 404 }
      );
    }

    const comp = compRes.rows[0];
    if (comp.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: { code: 'INACTIVE', message: 'This competition is not currently accepting entries.' } },
        { status: 400 }
      );
    }

    // Insert entry
    const insertRes = await query(
      `INSERT INTO competition_entries (
        id, competition_id, creator_id, content_id, rank, votes_count, status
      ) VALUES (
        uuid_generate_v4(), $1, $2, $3, NULL, 0, 'SUBMITTED'
      )
      ON CONFLICT (competition_id, creator_id) DO UPDATE
      SET content_id = EXCLUDED.content_id, submitted_at = NOW()
      RETURNING id`,
      [comp.id, creatorId, contentId]
    );

    return NextResponse.json({
      success: true,
      message: 'Tournament entry submitted successfully!',
      data: { entryId: insertRes.rows[0].id },
    });
  } catch (err: any) {
    console.error('Error submitting competition entry:', err);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: err.message } },
      { status: 500 }
    );
  }
}
