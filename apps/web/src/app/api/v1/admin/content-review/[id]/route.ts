import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/lib/db';
import { authenticateAdmin, recordAuditLog } from '@/lib/admin';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, errorResponse } = await authenticateAdmin(req);
  if (errorResponse) return errorResponse;

  const submissionId = params.id;
  const body = await req.json();
  const { action, notes } = body;

  if (!['APPROVE', 'REJECT', 'TAKEDOWN', 'UNDER_REVIEW'].includes(action)) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_ACTION', message: 'Action must be APPROVE, REJECT, TAKEDOWN, or UNDER_REVIEW.' } },
      { status: 400 }
    );
  }

  const client = await getClient();
  try {
    await client.query('BEGIN');

    const subRes = await client.query(
      `SELECT cs.*, cp.stage_name, cp.user_id as "creatorUserId"
       FROM content_submissions cs
       JOIN creator_profiles cp ON cs.creator_id = cp.id
       WHERE cs.id = $1 FOR UPDATE`,
      [submissionId]
    );

    if (subRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Content submission not found.' } },
        { status: 404 }
      );
    }

    const sub = subRes.rows[0];
    const oldState = { status: sub.status, reviewNotes: sub.review_notes };

    let newStatus = 'UNDER_REVIEW';
    if (action === 'APPROVE') newStatus = 'APPROVED';
    else if (action === 'REJECT') newStatus = 'REJECTED';
    else if (action === 'TAKEDOWN') newStatus = 'TAKEDOWN';

    await client.query(
      `UPDATE content_submissions
       SET status = $1, reviewed_by = $2, review_notes = $3
       WHERE id = $4`,
      [newStatus, user!.id, notes || null, submissionId]
    );

    if (action === 'APPROVE') {
      // Find or create artist for this creator
      let artistId: string;
      const artistRes = await client.query(
        `SELECT id FROM artists WHERE user_id = $1 LIMIT 1`,
        [sub.creatorUserId]
      );

      if (artistRes.rows.length > 0) {
        artistId = artistRes.rows[0].id;
      } else {
        const slug = sub.stage_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.floor(Math.random() * 1000);
        const newArtistRes = await client.query(
          `INSERT INTO artists (id, name, slug, bio, avatar_url, is_verified, user_id)
           VALUES (uuid_generate_v4(), $1, $2, $3, $4, TRUE, $5)
           RETURNING id`,
          [sub.stage_name, slug, `Official Talent5 verified creator artist ${sub.stage_name}.`, sub.cover_url, sub.creatorUserId]
        );
        artistId = newArtistRes.rows[0].id;
      }

      // Create song record in catalog with real duration and assets
      const songSlug = sub.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4);
      const duration = sub.duration_seconds && sub.duration_seconds > 0 ? Number(sub.duration_seconds) : 180;
      const audioUrl = sub.audio_url || '/media/placeholder-audio.mp3';
      const artworkUrl = sub.cover_url || '/media/placeholder-cover.jpg';

      const songRes = await client.query(
        `INSERT INTO songs (
          id, title, slug, artist_id, language_id, genre_id, duration_seconds, audio_url, artwork_url, status, is_explicit
        ) VALUES (
          uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7, $8, 'PUBLISHED', FALSE
        ) RETURNING id`,
        [
          sub.title,
          songSlug,
          artistId,
          sub.language_id,
          sub.genre_id,
          duration,
          audioUrl,
          artworkUrl,
        ]
      );
      const songId = songRes.rows[0].id;

      // Update content_submissions with published song id
      await client.query(
        `UPDATE content_submissions SET published_song_id = $1 WHERE id = $2`,
        [songId, submissionId]
      );

      // Transfer synchronized lyrics if provided
      let timedLines: any[] = [];
      if (sub.lyrics_timed_data) {
        if (Array.isArray(sub.lyrics_timed_data)) {
          timedLines = sub.lyrics_timed_data;
        } else if (typeof sub.lyrics_timed_data === 'string') {
          try {
            timedLines = JSON.parse(sub.lyrics_timed_data);
          } catch {
            timedLines = [];
          }
        }
      }

      const isSynced = Array.isArray(timedLines) && timedLines.length > 0;
      const syncStatus = isSynced ? 'SYNCED' : 'UNSYNCED';
      const fullText = (sub.lyrics_text || (isSynced ? timedLines.map((l: any) => l.text).join('\n') : '') || '').trim();

      if (fullText || isSynced) {
        const lyricsRes = await client.query(
          `INSERT INTO lyrics (id, song_id, language_id, is_synced, sync_status, full_text)
           VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5)
           ON CONFLICT (song_id) DO UPDATE SET is_synced = EXCLUDED.is_synced, sync_status = EXCLUDED.sync_status, full_text = EXCLUDED.full_text
           RETURNING id`,
          [songId, sub.language_id, isSynced, syncStatus, fullText || 'Instrumental / Original Track']
        );
        const lyricsId = lyricsRes.rows[0].id;

        if (isSynced) {
          await client.query(`DELETE FROM lyric_lines WHERE lyrics_id = $1`, [lyricsId]);
          for (let i = 0; i < timedLines.length; i++) {
            const line = timedLines[i];
            const startMs = line.startTimeMs || line.start_time_ms || 0;
            const endMs = line.endTimeMs || line.end_time_ms || (startMs + 3000);
            const lineText = (line.text || '').trim();
            if (lineText) {
              await client.query(
                `INSERT INTO lyric_lines (id, lyrics_id, sequence_order, start_time_ms, end_time_ms, text)
                 VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5)`,
                [lyricsId, i + 1, Math.round(startMs), Math.round(endMs), lineText]
              );
            }
          }
        }
      }

      // Upsert into desi_music_content
      await client.query(
        `INSERT INTO desi_music_content (id, submission_id, creator_id, song_id, video_url, is_featured)
         VALUES (uuid_generate_v4(), $1, $2, $3, $4, TRUE)
         ON CONFLICT (submission_id) DO UPDATE SET song_id = EXCLUDED.song_id, video_url = EXCLUDED.video_url`,
        [submissionId, sub.creator_id, songId, sub.video_url]
      );

      // Provision rights record
      await client.query(
        `INSERT INTO rights_records (
          id, song_id, rights_holder, ownership_type, license_type, license_provider, territory,
          start_date, streaming_allowed, monetization_allowed, ugc_allowed, status, reviewer_id, notes
        ) VALUES (
          uuid_generate_v4(), $1, $2, 'CREATOR_OWNED', 'Talent5 Verified Creator Master License', 'Talent5 Rights Registry', 'IN',
          CURRENT_DATE, TRUE, TRUE, TRUE, 'VERIFIED', $3, 'Approved via Admin Content Review'
        )`,
        [songId, sub.stage_name, user!.id]
      );
    } else if (action === 'TAKEDOWN') {
      // Find linked song and update status to TAKEDOWN
      await client.query(
        `UPDATE songs SET status = 'TAKEDOWN' 
         WHERE id IN (SELECT song_id FROM desi_music_content WHERE submission_id = $1 AND song_id IS NOT NULL)`,
        [submissionId]
      );
    }

    await client.query('COMMIT');

    // Record audit log
    await recordAuditLog({
      actorId: user!.id,
      action: `${action}_CONTENT_SUBMISSION`,
      entityName: 'CONTENT_SUBMISSION',
      entityId: submissionId,
      oldState,
      newState: { status: newStatus, title: sub.title, creator: sub.stage_name, notes },
    });

    return NextResponse.json({
      success: true,
      message: `Content submission ${newStatus.toLowerCase()} successfully.`,
      data: { submissionId, status: newStatus },
    });
  } catch (err: any) {
    await client.query('ROLLBACK');
    console.error('Error reviewing content submission:', err);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: err.message } },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
