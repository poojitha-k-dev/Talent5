import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authenticateAdmin } from '@/lib/admin';

export async function GET(req: NextRequest) {
  const { user, errorResponse } = await authenticateAdmin(req);
  if (errorResponse) return errorResponse;

  const url = new URL(req.url);
  const status = url.searchParams.get('status');
  const ownershipType = url.searchParams.get('ownershipType');
  const search = url.searchParams.get('search');

  try {
    let sql = `
      SELECT rr.id, rr.song_id as "songId", rr.rights_holder as "rightsHolder",
             rr.ownership_type as "ownershipType", rr.license_type as "licenseType",
             rr.license_provider as "licenseProvider", rr.territory,
             rr.start_date as "startDate", rr.end_date as "endDate",
             rr.streaming_allowed as "streamingAllowed", rr.download_allowed as "downloadAllowed",
             rr.monetization_allowed as "monetizationAllowed", rr.karaoke_allowed as "karaokeAllowed",
             rr.ugc_allowed as "ugcAllowed", rr.proof_document_url as "proofDocumentUrl",
             rr.status, rr.notes, rr.created_at as "createdAt",
             s.title as "songTitle", s.status as "songStatus",
             a.name as "artistName"
      FROM rights_records rr
      LEFT JOIN songs s ON rr.song_id = s.id
      LEFT JOIN artists a ON s.artist_id = a.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status && status !== 'ALL') {
      params.push(status);
      sql += ` AND rr.status = $${params.length}`;
    }

    if (ownershipType && ownershipType !== 'ALL') {
      params.push(ownershipType);
      sql += ` AND rr.ownership_type = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (rr.rights_holder ILIKE $${params.length} OR s.title ILIKE $${params.length} OR a.name ILIKE $${params.length})`;
    }

    sql += ` ORDER BY rr.created_at DESC`;

    const res = await query(sql, params);

    return NextResponse.json({
      success: true,
      data: res.rows,
    });
  } catch (err: any) {
    console.error('Error fetching rights records:', err);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: err.message } },
      { status: 500 }
    );
  }
}
