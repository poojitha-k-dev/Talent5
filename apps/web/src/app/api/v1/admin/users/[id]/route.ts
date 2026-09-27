import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { authenticateAdmin } from '@/lib/admin';
import { PATCH as updateHandler, DELETE as deleteHandler } from '../route';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user: actor, errorResponse } = await authenticateAdmin(req);
  if (errorResponse) return errorResponse;

  try {
    const userId = params.id;
    const res = await query(
      `SELECT 
        u.id, 
        u.email, 
        u.full_name as "fullName", 
        u.username, 
        u.avatar_url as "avatarUrl", 
        u.phone, 
        u.auth_provider as "authProvider", 
        u.is_verified as "isVerified", 
        u.status, 
        u.created_at as "createdAt",
        u.updated_at as "updatedAt",
        COALESCE(array_agg(r.name) FILTER (WHERE r.name IS NOT NULL), '{}') as roles,
        EXISTS(SELECT 1 FROM creator_profiles cp WHERE cp.user_id = u.id AND cp.is_approved = TRUE) as "isCreator"
       FROM users u
       LEFT JOIN user_roles ur ON u.id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.id
       WHERE u.id = $1
       GROUP BY u.id`,
      [userId]
    );

    if (res.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: res.rows[0],
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: err.message } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    body.userId = params.id;

    // Delegate to main PATCH handler with updated body
    const nextReq = new NextRequest(req.url, {
      method: 'PATCH',
      headers: req.headers,
      body: JSON.stringify(body),
    });

    return updateHandler(nextReq);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: err.message } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const url = new URL(req.url);
  url.searchParams.set('userId', params.id);

  const nextReq = new NextRequest(url.toString(), {
    method: 'DELETE',
    headers: req.headers,
  });

  return deleteHandler(nextReq);
}
