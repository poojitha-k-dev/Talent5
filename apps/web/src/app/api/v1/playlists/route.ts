import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { slugify } from '@talent5/utils';

export async function GET() {
  try {
    const playlistsRes = await query(
      `SELECT p.id, p.name, p.slug, p.description, p.cover_url as "coverUrl",
              p.visibility, p.created_at as "createdAt",
              u.full_name as "curatorName",
              COUNT(ps.id) as "songCount"
       FROM playlists p
       JOIN users u ON p.user_id = u.id
       LEFT JOIN playlist_songs ps ON p.id = ps.playlist_id
       WHERE p.visibility = 'PUBLIC'
       GROUP BY p.id, u.id
       ORDER BY "songCount" DESC, p.created_at DESC
       LIMIT 20`
    );

    return NextResponse.json({
      success: true,
      data: playlistsRes.rows,
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
        { success: false, message: 'Authentication required to create playlists' },
        { status: 401 }
      );
    }

    const { name, description, visibility = 'PUBLIC', coverUrl } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: 'Playlist name is required' },
        { status: 400 }
      );
    }

    const cleanName = name.trim();
    const slug = slugify(cleanName) + '-' + Math.floor(100 + Math.random() * 900);

    const defaultCover =
      coverUrl ||
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600';

    const insertRes = await query(
      `INSERT INTO playlists (user_id, name, slug, description, cover_url, visibility)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, slug, description, cover_url as "coverUrl", visibility, created_at as "createdAt"`,
      [user.id, cleanName, slug, description?.trim() || null, defaultCover, visibility]
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Playlist created successfully',
        data: insertRes.rows[0],
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
