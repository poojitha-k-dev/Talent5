import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const targetType = searchParams.get('targetType') || 'SONG';
    const targetId = searchParams.get('targetId');

    if (!targetId) {
      return NextResponse.json(
        { success: false, message: 'targetId is required' },
        { status: 400 }
      );
    }

    const commentsRes = await query(
      `SELECT c.id, c.content, c.created_at as "createdAt",
              u.id as "userId", u.full_name as "userName", u.username, u.avatar_url as "userAvatar"
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.target_type = $1 AND c.target_id = $2
       ORDER BY c.created_at DESC
       LIMIT 50`,
      [targetType, targetId]
    );

    return NextResponse.json({
      success: true,
      data: commentsRes.rows,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required to post comments' },
        { status: 401 }
      );
    }

    const { targetType, targetId, content } = await req.json();

    if (!targetType || !targetId || !content || !content.trim()) {
      return NextResponse.json(
        { success: false, message: 'targetType, targetId, and comment content are required' },
        { status: 400 }
      );
    }

    const insertRes = await query(
      `INSERT INTO comments (user_id, target_type, target_id, content)
       VALUES ($1, $2, $3, $4)
       RETURNING id, content, created_at as "createdAt"`,
      [user.id, targetType, targetId, content.trim()]
    );

    return NextResponse.json({
      success: true,
      message: 'Comment posted',
      data: {
        ...insertRes.rows[0],
        userId: user.id,
        userName: user.fullName,
        username: user.username,
        userAvatar: user.avatarUrl,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
