import { NextRequest, NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required to apply as a Desi Creator' },
        { status: 401 }
      );
    }

    const {
      fullName,
      stageName,
      bio,
      city,
      state,
      languages,
      category,
      genres,
      experience,
      socialLinks,
      portfolioUrl,
      samplePerformanceUrl,
      originalCompositionInfo,
      ownershipDeclaration,
      copyrightDeclaration,
    } = await req.json();

    // Strict validation
    if (!fullName || !stageName || !bio || !city || !state || !samplePerformanceUrl) {
      return NextResponse.json(
        { success: false, message: 'Please complete all required fields including sample audition link' },
        { status: 400 }
      );
    }

    if (!ownershipDeclaration || !copyrightDeclaration) {
      return NextResponse.json(
        {
          success: false,
          message:
            'You must accept both the 100% Original Ownership declaration and Copyright compliance declaration to apply.',
        },
        { status: 400 }
      );
    }

    // Check if user already has an existing pending or approved application
    const existingApp = await query(
      'SELECT id, status FROM creator_applications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [user.id]
    );

    if (existingApp.rows.length > 0 && existingApp.rows[0].status === 'PENDING') {
      return NextResponse.json(
        { success: false, message: 'You already have a pending creator application currently under review' },
        { status: 409 }
      );
    }

    const client = await getClient();
    try {
      await client.query('BEGIN');

      const appInsert = await client.query(
        `INSERT INTO creator_applications (
           user_id, full_name, stage_name, bio, city, state, languages, category,
           genres, experience, social_links, portfolio_url, sample_performance_url,
           original_composition_info, ownership_declaration, copyright_declaration, status
         ) VALUES (
           $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, 'PENDING'
         ) RETURNING id, status, created_at as "createdAt"`,
        [
          user.id,
          fullName.trim(),
          stageName.trim(),
          bio.trim(),
          city.trim(),
          state.trim(),
          languages || ['Hindi'],
          category || 'SINGER',
          genres || ['Acoustic & Unplugged'],
          experience?.trim() || 'Emerging independent artist',
          JSON.stringify(socialLinks || {}),
          portfolioUrl?.trim() || null,
          samplePerformanceUrl.trim(),
          originalCompositionInfo?.trim() || 'Original songwriting & acoustics',
          true,
          true,
        ]
      );

      // Record in audit log
      await client.query(
        `INSERT INTO audit_logs (actor_id, action, entity_name, entity_id, new_state)
         VALUES ($1, 'CREATOR_APPLICATION_SUBMITTED', 'creator_applications', $2, $3)`,
        [
          user.id,
          appInsert.rows[0].id,
          JSON.stringify({ stageName, category, city, state }),
        ]
      );

      await client.query('COMMIT');

      return NextResponse.json(
        {
          success: true,
          message: 'Creator application submitted successfully. Talent5 moderators will review your audition within 24-48 hours.',
          data: appInsert.rows[0],
        },
        { status: 201 }
      );
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Creator application error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
