import { Router, Request, Response } from 'express';
import { query } from '../lib/db';

const router = Router();

// GET /api/v1/lyrics/:songId
router.get('/:songId', async (req: Request, res: Response) => {
  try {
    const { songId } = req.params;
    if (!songId) {
      return res.status(400).json({ success: false, message: 'Song ID is required' });
    }

    const lyricsRes = await query(
      `SELECT l.id, l.song_id as "songId", l.language_id as "languageId", 
              l.is_synced as "isSynced", l.sync_status as "syncStatus",
              l.version, l.full_text as "fullText"
       FROM lyrics l
       JOIN songs s ON l.song_id = s.id
       WHERE s.id::text = $1 OR s.slug = $1`,
      [songId]
    );

    if (lyricsRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No lyrics registered for this song' });
    }

    const lyric = lyricsRes.rows[0];

    const linesRes = await query(
      `SELECT id, sequence_order as "sequenceOrder", 
              start_time_ms as "startTimeMs", end_time_ms as "endTimeMs",
              text, COALESCE(words, '[]'::jsonb) as "words"
       FROM lyric_lines
       WHERE lyrics_id = $1
       ORDER BY sequence_order ASC`,
      [lyric.id]
    );

    return res.status(200).json({
      success: true,
      data: {
        ...lyric,
        lines: linesRes.rows,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
