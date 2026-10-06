import { Router, Request, Response } from 'express';
import { query } from '../lib/db';

const router = Router();

// GET /api/v1/catalog/songs
router.get('/songs', async (req: Request, res: Response) => {
  try {
    const languageCode = typeof req.query.language === 'string' ? req.query.language : undefined;
    const genreSlug = typeof req.query.genre === 'string' ? req.query.genre : undefined;
    const artistId = typeof req.query.artistId === 'string' ? req.query.artistId : undefined;
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const sortBy = (req.query.sortBy as string) || 'popularity';
    const limit = Math.min(parseInt((req.query.limit as string) || '60', 10), 300);
    const page = Math.max(parseInt((req.query.page as string) || '1', 10), 1);
    const offset = (page - 1) * limit;

    const conditions: string[] = ["s.status = 'PUBLISHED'"];
    const values: any[] = [];
    let paramIdx = 1;

    if (languageCode) {
      conditions.push(`l.code = $${paramIdx}`);
      values.push(languageCode.toLowerCase());
      paramIdx++;
    }

    if (genreSlug) {
      conditions.push(`g.slug = $${paramIdx}`);
      values.push(genreSlug.toLowerCase());
      paramIdx++;
    }

    if (artistId) {
      conditions.push(`s.artist_id = $${paramIdx}`);
      values.push(artistId);
      paramIdx++;
    }

    if (search) {
      conditions.push(`(s.title ILIKE $${paramIdx} OR a.name ILIKE $${paramIdx})`);
      values.push(`%${search.trim()}%`);
      paramIdx++;
    }

    let orderByClause = 's.popularity_score DESC, s.play_count DESC';
    if (sortBy === 'recent') {
      orderByClause = 's.release_date DESC, s.created_at DESC';
    } else if (sortBy === 'likes') {
      orderByClause = 's.valid_likes_count DESC';
    } else if (sortBy === 'title') {
      orderByClause = 's.title ASC';
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await query(
      `SELECT count(*) as total
       FROM songs s
       JOIN artists a ON s.artist_id = a.id
       JOIN languages l ON s.language_id = l.id
       JOIN genres g ON s.genre_id = g.id
       ${whereClause}`,
      values
    );
    const total = parseInt(countRes.rows[0]?.total || '0', 10);

    const queryText = `
      SELECT s.id, s.title, s.slug, s.duration_seconds as "durationSeconds",
             s.audio_url as "audioUrl", s.artwork_url as "artworkUrl",
             s.release_date as "releaseDate", s.is_explicit as "isExplicit",
             s.play_count as "playCount", s.raw_likes_count as "rawLikesCount",
             s.valid_likes_count as "validLikesCount", s.popularity_score as "popularityScore",
             s.status, a.id as "artistId", a.name as "artistName", a.is_verified as "isArtistVerified",
             al.id as "albumId", al.title as "albumTitle",
             l.id as "languageId", l.code as "languageCode", l.name as "languageName",
             g.id as "genreId", g.slug as "genreSlug", g.name as "genreName"
      FROM songs s
      JOIN artists a ON s.artist_id = a.id
      LEFT JOIN albums al ON s.album_id = al.id
      JOIN languages l ON s.language_id = l.id
      JOIN genres g ON s.genre_id = g.id
      ${whereClause}
      ORDER BY ${orderByClause}
      LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
    `;

    values.push(limit, offset);
    const songsRes = await query(queryText, values);

    return res.status(200).json({
      success: true,
      data: songsRes.rows,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Songs query error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/v1/catalog/songs/:idOrSlug
router.get('/songs/:idOrSlug', async (req: Request, res: Response) => {
  try {
    const { idOrSlug } = req.params;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

    const condition = isUuid ? 's.id = $1' : 's.slug = $1';
    const queryText = `
      SELECT s.id, s.title, s.slug, s.duration_seconds as "durationSeconds",
             s.audio_url as "audioUrl", s.artwork_url as "artworkUrl",
             s.release_date as "releaseDate", s.is_explicit as "isExplicit",
             s.play_count as "playCount", s.valid_likes_count as "validLikesCount",
             s.raw_likes_count as "rawLikesCount",
             s.popularity_score as "popularityScore", s.mood,
             a.id as "artistId", a.name as "artistName", a.bio as "artistBio",
             a.avatar_url as "artistAvatarUrl", a.is_verified as "isArtistVerified",
             al.id as "albumId", al.title as "albumTitle", al.cover_url as "albumCoverUrl",
             l.id as "languageId", l.code as "languageCode", l.name as "languageName",
             g.id as "genreId", g.slug as "genreSlug", g.name as "genreName"
      FROM songs s
      JOIN artists a ON s.artist_id = a.id
      LEFT JOIN albums al ON s.album_id = al.id
      JOIN languages l ON s.language_id = l.id
      JOIN genres g ON s.genre_id = g.id
      WHERE ${condition} AND s.status = 'PUBLISHED'
      LIMIT 1
    `;

    const songRes = await query(queryText, [idOrSlug]);

    if (songRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Song not found' });
    }

    const song = songRes.rows[0];

    // Fetch synchronized lyrics
    const lyricsRes = await query(
      `SELECT l.id, l.song_id as "songId", l.language_id as "languageId",
              l.is_synced as "isSynced", l.sync_status as "syncStatus",
              l.version, l.full_text as "fullText"
       FROM lyrics l
       WHERE l.song_id = $1`,
      [song.id]
    );

    let lyrics = null;
    if (lyricsRes.rows.length > 0) {
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
      lyrics = {
        id: lyric.id,
        isSynced: lyric.isSynced,
        syncStatus: lyric.syncStatus,
        fullText: lyric.fullText,
        lines: linesRes.rows,
      };
    }

    // Fetch rights record
    const rightsRes = await query(
      `SELECT id, rights_holder as "rightsHolder", ownership_type as "ownershipType", license_type as "licenseType", created_at as "createdAt"
       FROM rights_records
       WHERE song_id = $1
       LIMIT 1`,
      [song.id]
    );

    // Fetch recommendations
    const recRes = await query(
      `SELECT s.id, s.title, s.slug, s.duration_seconds as "durationSeconds",
              s.audio_url as "audioUrl", s.artwork_url as "artworkUrl",
              s.play_count as "playCount", s.valid_likes_count as "validLikesCount",
              s.popularity_score as "popularityScore",
              a.id as "artistId", a.name as "artistName", l.name as "languageName",
              g.name as "genreName", g.slug as "genreSlug"
       FROM songs s
       JOIN artists a ON s.artist_id = a.id
       JOIN languages l ON s.language_id = l.id
       JOIN genres g ON s.genre_id = g.id
       WHERE s.id != $1 AND s.status = 'PUBLISHED'
       ORDER BY (s.genre_id = $2) DESC, s.popularity_score DESC
       LIMIT 6`,
      [song.id, song.genreId]
    );

    return res.status(200).json({
      success: true,
      data: {
        song,
        lyrics,
        rights: rightsRes.rows[0] || null,
        comments: [],
        recommended: recRes.rows,
        recommendations: recRes.rows,
      },
    });
  } catch (error: any) {
    console.error('Song by id error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/v1/catalog/artists
router.get('/artists', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt((req.query.limit as string) || '50', 10), 100);
    const artistsRes = await query(
      `SELECT a.id, a.name, a.bio, a.avatar_url as "avatarUrl", a.is_verified as "isVerified", 
              COUNT(s.id) as "songCount", COALESCE(SUM(s.play_count), 0) as "totalPlays"
       FROM artists a
       LEFT JOIN songs s ON a.id = s.artist_id AND s.status = 'PUBLISHED'
       GROUP BY a.id
       ORDER BY "totalPlays" DESC
       LIMIT $1`,
      [limit]
    );
    return res.status(200).json({ success: true, data: artistsRes.rows });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/v1/catalog/artists/:id
router.get('/artists/:id', async (req: Request, res: Response) => {
  try {
    const artistRes = await query(`SELECT * FROM artists WHERE id = $1`, [req.params.id]);
    if (artistRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Artist not found' });
    }
    const songsRes = await query(
      `SELECT s.id, s.title, s.slug, s.duration_seconds as "durationSeconds", s.audio_url as "audioUrl", s.artwork_url as "artworkUrl", s.play_count as "playCount", s.valid_likes_count as "validLikesCount"
       FROM songs s WHERE s.artist_id = $1 AND s.status = 'PUBLISHED' ORDER BY s.play_count DESC`,
      [req.params.id]
    );
    return res.status(200).json({ success: true, data: { ...artistRes.rows[0], songs: songsRes.rows } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/v1/catalog/albums
router.get('/albums', async (req: Request, res: Response) => {
  try {
    const albumsRes = await query(
      `SELECT al.id, al.title, al.cover_url as "coverUrl", al.release_date as "releaseDate", a.name as "artistName"
       FROM albums al JOIN artists a ON al.artist_id = a.id ORDER BY al.release_date DESC LIMIT 50`
    );
    return res.status(200).json({ success: true, data: albumsRes.rows });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/v1/catalog/albums/:id
router.get('/albums/:id', async (req: Request, res: Response) => {
  try {
    const albumRes = await query(
      `SELECT al.id, al.title, al.cover_url as "coverUrl", al.release_date as "releaseDate",
              al.type, a.id as "artistId", a.name as "artistName",
              l.name as "languageName"
       FROM albums al
       JOIN artists a ON al.artist_id = a.id
       LEFT JOIN languages l ON al.language_id = l.id
       WHERE al.id = $1`,
      [req.params.id]
    );
    if (albumRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Album not found' });
    }
    const tracksRes = await query(
      `SELECT s.id, s.title, s.slug, s.duration_seconds as "durationSeconds",
              s.audio_url as "audioUrl", s.artwork_url as "artworkUrl",
              s.play_count as "playCount", s.valid_likes_count as "validLikesCount",
              a.name as "artistName"
       FROM songs s
       JOIN artists a ON s.artist_id = a.id
       WHERE s.album_id = $1 AND s.status = 'PUBLISHED'
       ORDER BY s.created_at ASC`,
      [req.params.id]
    );
    return res.status(200).json({
      success: true,
      data: {
        album: albumRes.rows[0],
        tracks: tracksRes.rows,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/v1/catalog/languages
router.get('/languages', async (_req: Request, res: Response) => {
  try {
    const r = await query('SELECT * FROM languages WHERE is_active = TRUE ORDER BY name ASC');
    return res.status(200).json({ success: true, data: r.rows });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/v1/catalog/genres
router.get('/genres', async (_req: Request, res: Response) => {
  try {
    const r = await query('SELECT * FROM genres ORDER BY name ASC');
    return res.status(200).json({ success: true, data: r.rows });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/v1/catalog/home
router.get('/home', async (_req: Request, res: Response) => {
  try {
    const [trending, featured, newReleases, languages, genres] = await Promise.all([
      query(`SELECT s.id, s.title, s.slug, s.duration_seconds as "durationSeconds", s.audio_url as "audioUrl", s.artwork_url as "artworkUrl", s.play_count as "playCount", s.valid_likes_count as "validLikesCount", s.popularity_score as "popularityScore", a.id as "artistId", a.name as "artistName", l.name as "languageName", g.name as "genreName", g.slug as "genreSlug" FROM songs s JOIN artists a ON s.artist_id = a.id JOIN languages l ON s.language_id = l.id JOIN genres g ON s.genre_id = g.id WHERE s.status = 'PUBLISHED' ORDER BY s.popularity_score DESC LIMIT 12`),
      query(`SELECT s.id, s.title, s.slug, s.duration_seconds as "durationSeconds", s.audio_url as "audioUrl", s.artwork_url as "artworkUrl", s.play_count as "playCount", s.valid_likes_count as "validLikesCount", s.popularity_score as "popularityScore", a.id as "artistId", a.name as "artistName", l.name as "languageName", g.name as "genreName", g.slug as "genreSlug" FROM songs s JOIN artists a ON s.artist_id = a.id JOIN languages l ON s.language_id = l.id JOIN genres g ON s.genre_id = g.id WHERE s.status = 'PUBLISHED' ORDER BY s.valid_likes_count DESC LIMIT 12`),
      query(`SELECT s.id, s.title, s.slug, s.duration_seconds as "durationSeconds", s.audio_url as "audioUrl", s.artwork_url as "artworkUrl", s.play_count as "playCount", s.valid_likes_count as "validLikesCount", s.popularity_score as "popularityScore", a.id as "artistId", a.name as "artistName", l.name as "languageName", g.name as "genreName", g.slug as "genreSlug" FROM songs s JOIN artists a ON s.artist_id = a.id JOIN languages l ON s.language_id = l.id JOIN genres g ON s.genre_id = g.id WHERE s.status = 'PUBLISHED' ORDER BY s.release_date DESC LIMIT 12`),
      query(`SELECT * FROM languages WHERE is_active = TRUE ORDER BY name ASC`),
      query(`SELECT * FROM genres ORDER BY name ASC`),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        trending: trending.rows,
        featured: featured.rows,
        newReleases: newReleases.rows,
        languages: languages.rows,
        genres: genres.rows,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/v1/catalog/new-talent
router.get('/new-talent', async (_req: Request, res: Response) => {
  try {
    const creatorsRes = await query(`
      SELECT cp.*, u.full_name as "fullName", u.username, u.avatar_url as "avatarUrl"
      FROM creator_profiles cp
      JOIN users u ON cp.user_id = u.id
      WHERE cp.is_approved = TRUE
      ORDER BY cp.created_at DESC
      LIMIT 20
    `);
    return res.status(200).json({ success: true, data: creatorsRes.rows });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
