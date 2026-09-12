import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const compsRes = await query(
      `SELECT c.id, c.title, c.slug, c.description, c.cover_url as "coverUrl",
              c.prize_inr as "prizeINR", c.start_date as "startDate", c.end_date as "endDate",
              c.eligible_languages as "eligibleLanguages", c.eligible_genres as "eligibleGenres",
              c.status, COUNT(ce.id) as "entriesCount"
       FROM competitions c
       LEFT JOIN competition_entries ce ON c.id = ce.competition_id
       GROUP BY c.id
       ORDER BY c.status ASC, c.prize_inr DESC`
    );

    return NextResponse.json({
      success: true,
      data: compsRes.rows,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
