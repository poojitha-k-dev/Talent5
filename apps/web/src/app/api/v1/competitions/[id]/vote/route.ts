import { NextRequest, NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You must sign in to cast a verified community vote.',
          },
        },
        { status: 401 }
      );
    }

    const competitionId = params.id;
    const body = await req.json();
    const { entryId } = body;

    if (!entryId) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'BAD_REQUEST', message: 'entryId is required to cast a vote.' },
        },
        { status: 400 }
      );
    }

    // 1. Verify active competition
    const compRes = await query(
      `SELECT id, status, end_date FROM competitions WHERE id::text = $1 OR slug = $1`,
      [competitionId]
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
        {
          success: false,
          error: { code: 'COMPETITION_INACTIVE', message: 'Voting has concluded for this competition.' },
        },
        { status: 400 }
      );
    }

    const actualCompetitionId = comp.id;
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';

    // 2. Anti-Abuse: Prevent Duplicate Voting by user
    const existingVote = await query(
      `SELECT id FROM competition_votes WHERE competition_id = $1 AND user_id = $2`,
      [actualCompetitionId, user.id]
    );

    if (existingVote.rows.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ALREADY_VOTED',
            message: 'You have already voted in this challenge. Only one vote per user is permitted to ensure fairness.',
          },
        },
        { status: 400 }
      );
    }

    // 3. Heuristic IP rate anomaly check
    const recentIpVotes = await query(
      `SELECT count(*) FROM competition_votes 
       WHERE ip_hash = $1 AND created_at > NOW() - INTERVAL '5 minutes'`,
      [ip]
    );
    const ipCount = parseInt(recentIpVotes.rows[0].count || '0', 10);
    const isSuspicious = ipCount >= 10;
    const riskScore = isSuspicious ? 'HIGH' : 'LOW';
    const voteStatus = isSuspicious ? 'SUSPICIOUS' : 'VALID';

    const client = await getClient();
    try {
      await client.query('BEGIN');

      // Record vote into audit ledger
      await client.query(
        `INSERT INTO competition_votes (competition_id, entry_id, user_id, ip_hash, risk_score, status)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [actualCompetitionId, entryId, user.id, ip, riskScore, voteStatus]
      );

      // Atomically increment entry vote count if valid
      const voteRes = await client.query(
        `UPDATE competition_entries
         SET votes_count = votes_count + 1
         WHERE id = $1 AND competition_id = $2
         RETURNING id, votes_count as "votesCount", competition_id as "competitionId"`,
        [entryId, actualCompetitionId]
      );

      if (voteRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Entry does not exist in this competition.' } },
          { status: 404 }
        );
      }

      await client.query('COMMIT');

      return NextResponse.json({
        success: true,
        message: 'Your vote has been verified and recorded!',
        data: {
          entryId: voteRes.rows[0].id,
          votesCount: voteRes.rows[0].votesCount,
          verified: true,
        },
      });
    } catch (dbErr) {
      await client.query('ROLLBACK');
      throw dbErr;
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('Error in competition vote:', err);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: err.message || 'Voting failed.' } },
      { status: 500 }
    );
  }
}
