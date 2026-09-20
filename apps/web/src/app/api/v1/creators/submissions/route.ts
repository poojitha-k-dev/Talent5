import { NextRequest, NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const profileRes = await query('SELECT id FROM creator_profiles WHERE user_id = $1', [user.id]);
    if (profileRes.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Creator profile not found' }, { status: 403 });
    }

    const submissionsRes = await query(
      `SELECT cs.id, cs.title, cs.description, cs.category, cs.audio_url as "audioUrl",
              cs.video_url as "videoUrl", cs.cover_url as "coverUrl", cs.status,
              cs.composer, cs.lyricist, cs.producer, cs.created_at as "createdAt",
              cs.review_notes as "reviewNotes",
              l.name as "languageName", g.name as "genreName"
       FROM content_submissions cs
       JOIN languages l ON cs.language_id = l.id
       JOIN genres g ON cs.genre_id = g.id
       WHERE cs.creator_id = $1
       ORDER BY cs.created_at DESC`,
      [profileRes.rows[0].id]
    );

    return NextResponse.json({
      success: true,
      data: submissionsRes.rows,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const profileRes = await query('SELECT id, stage_name FROM creator_profiles WHERE user_id = $1', [user.id]);
    if (profileRes.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Only approved creators can submit original content' },
        { status: 403 }
      );
    }

    const creator = profileRes.rows[0];

    const {
      title,
      description,
      category = 'SINGER',
      languageId,
      genreId,
      mood,
      audioUrl,
      videoUrl,
      coverUrl,
      storageKey,
      durationSeconds = 0,
      composer,
      lyricist,
      producer,
      featuredArtists,
      lyricsText,
      lyricsTimedData,
      ownershipDeclaration,
      rightsDeclaration,
      isDraft = false,
    } = await req.json();

    if (!title) {
      return NextResponse.json(
        { success: false, message: 'Song title is required.' },
        { status: 400 }
      );
    }

    if (!isDraft) {
      if (!languageId || !genreId || !audioUrl) {
        return NextResponse.json(
          { success: false, message: 'Title, Language, Genre, and Audio asset URL are required for submission.' },
          { status: 400 }
        );
      }

      if (!ownershipDeclaration) {
        return NextResponse.json(
          { success: false, message: 'You must confirm original rights declaration to submit for platform review.' },
          { status: 400 }
        );
      }
    }

    const submissionStatus = isDraft ? 'DRAFT' : 'SUBMITTED';

    const client = await getClient();
    try {
      await client.query('BEGIN');

      const subInsert = await client.query(
        `INSERT INTO content_submissions (
           creator_id, title, description, category, language_id, genre_id,
           audio_url, video_url, cover_url, storage_key, duration_seconds, mood,
           composer, lyricist, producer, featured_artists,
           lyrics_text, lyrics_timed_data, ownership_declaration, rights_declaration, status
         ) VALUES (
           $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
         ) RETURNING id, title, status, created_at as "createdAt"`,
        [
          creator.id,
          title.trim(),
          description?.trim() || null,
          category,
          languageId ? parseInt(languageId, 10) : 1,
          genreId ? parseInt(genreId, 10) : 1,
          audioUrl?.trim() || null,
          videoUrl?.trim() || null,
          coverUrl?.trim() || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600',
          storageKey || null,
          durationSeconds || 0,
          mood || null,
          composer?.trim() || creator.stage_name,
          lyricist?.trim() || creator.stage_name,
          producer?.trim() || null,
          featuredArtists || [],
          lyricsText || null,
          lyricsTimedData ? JSON.stringify(lyricsTimedData) : null,
          !!ownershipDeclaration,
          rightsDeclaration ? JSON.stringify(rightsDeclaration) : null,
          submissionStatus,
        ]
      );

      // Audit log
      await client.query(
        `INSERT INTO audit_logs (actor_id, action, entity_name, entity_id, new_state)
         VALUES ($1, $2, 'content_submissions', $3, $4)`,
        [user.id, isDraft ? 'CONTENT_DRAFT_SAVED' : 'CONTENT_SUBMITTED', subInsert.rows[0].id, JSON.stringify(subInsert.rows[0])]
      );

      await client.query('COMMIT');

      return NextResponse.json(
        {
          success: true,
          message: 'Content submitted for review. Talent5 content moderators will verify rights and audio standards.',
          data: subInsert.rows[0],
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
    console.error('Submission error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
