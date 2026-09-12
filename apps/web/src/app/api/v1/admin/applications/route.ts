import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authenticateAdmin } from '@/lib/admin';

export async function GET(req: NextRequest) {
  const { user, errorResponse } = await authenticateAdmin(req);
  if (errorResponse) return errorResponse;

  const url = new URL(req.url);
  const status = url.searchParams.get('status');
  const category = url.searchParams.get('category');
  const search = url.searchParams.get('search');

  try {
    let sql = `
      SELECT ca.id, ca.user_id as "userId", ca.full_name as "fullName", ca.stage_name as "stageName",
             ca.bio, ca.city, ca.state, ca.languages, ca.category, ca.genres, ca.experience,
             ca.social_links as "socialLinks", ca.portfolio_url as "portfolioUrl",
             ca.sample_performance_url as "samplePerformanceUrl", ca.original_composition_info as "originalCompositionInfo",
             ca.ownership_declaration as "ownershipDeclaration", ca.copyright_declaration as "copyrightDeclaration",
             ca.status, ca.review_notes as "reviewNotes", ca.created_at as "createdAt",
             u.email as "userEmail", u.phone as "userPhone", u.avatar_url as "userAvatar"
      FROM creator_applications ca
      JOIN users u ON ca.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status && status !== 'ALL') {
      params.push(status);
      sql += ` AND ca.status = $${params.length}`;
    }

    if (category && category !== 'ALL') {
      params.push(category);
      sql += ` AND ca.category = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (ca.stage_name ILIKE $${params.length} OR ca.full_name ILIKE $${params.length} OR ca.city ILIKE $${params.length})`;
    }

    sql += ` ORDER BY ca.created_at DESC`;

    const res = await query(sql, params);

    return NextResponse.json({
      success: true,
      data: res.rows,
    });
  } catch (err: any) {
    console.error('Error fetching creator applications:', err);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: err.message } },
      { status: 500 }
    );
  }
}
