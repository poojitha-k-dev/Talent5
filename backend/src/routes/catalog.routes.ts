import { Router, Request, Response } from 'express';
import { query } from '../lib/db';
import { memoryCache } from '../lib/cache';

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

    const cacheKey = `catalog:songs:${languageCode || ''}:${genreSlug || ''}:${artistId || ''}:${search || ''}:${sortBy}:${limit}:${page}`;

    const cachedData = await memoryCache.getOrSet(cacheKey, 45, async () => {
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

      // Count query: only join tables that are actually filtered
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

      return {
        data: songsRes.rows,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    });

    res.setHeader('Cache-Control', 'public, max-age=15, stale-while-revalidate=60');
    return res.status(200).json({
      success: true,
      data: cachedData.data,
      meta: cachedData.meta,
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
    const cacheKey = `catalog:song:${idOrSlug}`;

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    const resultData = await memoryCache.getOrSet(cacheKey, 30, async () => {
      const condition = isUuid ? 's.id = $1' : 's.slug = $1';
      const queryText = `
        SELECT s.id, s.title, s.slug, s.duration_seconds as "durationSeconds",
               s.audio_url as "audioUrl", s.artwork_url as "artworkUrl",
               s.lyrics_timed_data as "lyricsTimedData", s.raw_lyrics as "rawLyrics",
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
        return null;
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

      return {
        song,
        lyrics,
        rights: rightsRes.rows[0] || null,
        comments: [],
        recommended: recRes.rows,
        recommendations: recRes.rows,
      };
    });

    if (!resultData) {
      return res.status(404).json({ success: false, message: 'Song not found' });
    }

    res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=120');
    return res.status(200).json({
      success: true,
      data: resultData,
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
    const cacheKey = `catalog:artists:${limit}`;

    const data = await memoryCache.getOrSet(cacheKey, 60, async () => {
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
      return artistsRes.rows;
    });

    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=180');
    return res.status(200).json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/v1/catalog/artists/:id
router.get('/artists/:id', async (req: Request, res: Response) => {
  try {
    const cacheKey = `catalog:artist:${req.params.id}`;
    const data = await memoryCache.getOrSet(cacheKey, 60, async () => {
      const artistRes = await query(`SELECT * FROM artists WHERE id = $1`, [req.params.id]);
      if (artistRes.rows.length === 0) return null;
      const songsRes = await query(
        `SELECT s.id, s.title, s.slug, s.duration_seconds as "durationSeconds", s.audio_url as "audioUrl", s.artwork_url as "artworkUrl", s.play_count as "playCount", s.valid_likes_count as "validLikesCount"
         FROM songs s WHERE s.artist_id = $1 AND s.status = 'PUBLISHED' ORDER BY s.play_count DESC`,
        [req.params.id]
      );
      return { ...artistRes.rows[0], songs: songsRes.rows };
    });

    if (!data) {
      return res.status(404).json({ success: false, message: 'Artist not found' });
    }

    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=180');
    return res.status(200).json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/v1/catalog/albums
router.get('/albums', async (req: Request, res: Response) => {
  try {
    const cacheKey = 'catalog:albums:all';
    const data = await memoryCache.getOrSet(cacheKey, 120, async () => {
      const albumsRes = await query(
        `SELECT al.id, al.title, al.cover_url as "coverUrl", al.release_date as "releaseDate", a.name as "artistName"
         FROM albums al JOIN artists a ON al.artist_id = a.id ORDER BY al.release_date DESC LIMIT 50`
      );
      return albumsRes.rows;
    });

    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=180');
    return res.status(200).json({ success: true, data });
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
    const cacheKey = 'catalog:languages';
    const data = await memoryCache.getOrSet(cacheKey, 300, async () => {
      const r = await query('SELECT * FROM languages WHERE is_active = TRUE ORDER BY name ASC');
      return r.rows;
    });

    res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
    return res.status(200).json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/v1/catalog/genres
router.get('/genres', async (_req: Request, res: Response) => {
  try {
    const cacheKey = 'catalog:genres';
    const data = await memoryCache.getOrSet(cacheKey, 300, async () => {
      const r = await query('SELECT * FROM genres ORDER BY name ASC');
      return r.rows;
    });

    res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
    return res.status(200).json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/v1/catalog/home
router.get('/home', async (_req: Request, res: Response) => {
  try {
    const cacheKey = 'catalog:home:v2';
    const data = await memoryCache.getOrSet(cacheKey, 30, async () => {
      const [heroTracks, trending, featured, newReleases, languages, genres, topArtists, stats] = await Promise.all([
        query(`
          SELECT s.id, s.title, s.slug, s.duration_seconds as "durationSeconds", 
                 s.audio_url as "audioUrl", s.artwork_url as "artworkUrl",
                 s.play_count as "playCount", s.valid_likes_count as "validLikesCount", 
                 s.popularity_score as "popularityScore", s.mood,
                 a.id as "artistId", a.name as "artistName", a.bio as "artistBio", 
                 a.avatar_url as "artistAvatarUrl", a.followers_count as "artistFollowersCount",
                 a.is_verified as "isArtistVerified",
                 al.id as "albumId", al.title as "albumTitle",
                 l.id as "languageId", l.name as "languageName", l.code as "languageCode",
                 g.id as "genreId", g.name as "genreName", g.slug as "genreSlug"
          FROM songs s
          JOIN artists a ON s.artist_id = a.id
          LEFT JOIN albums al ON s.album_id = al.id
          JOIN languages l ON s.language_id = l.id
          JOIN genres g ON s.genre_id = g.id
          WHERE s.status = 'PUBLISHED'
          ORDER BY s.popularity_score DESC, s.play_count DESC
          LIMIT 6
        `),
        query(`
          SELECT s.id, s.title, s.slug, s.duration_seconds as "durationSeconds", 
                 s.audio_url as "audioUrl", s.artwork_url as "artworkUrl", 
                 s.play_count as "playCount", s.valid_likes_count as "validLikesCount", 
                 s.popularity_score as "popularityScore",
                 a.id as "artistId", a.name as "artistName", a.is_verified as "isArtistVerified",
                 al.title as "albumTitle",
                 l.name as "languageName", l.code as "languageCode", g.name as "genreName" 
          FROM songs s 
          JOIN artists a ON s.artist_id = a.id 
          LEFT JOIN albums al ON s.album_id = al.id
          JOIN languages l ON s.language_id = l.id 
          JOIN genres g ON s.genre_id = g.id
          WHERE s.status = 'PUBLISHED' 
          ORDER BY s.popularity_score DESC, s.play_count DESC 
          LIMIT 12
        `),
        query(`
          SELECT s.id, s.title, s.slug, s.duration_seconds as "durationSeconds", 
                 s.audio_url as "audioUrl", s.artwork_url as "artworkUrl", 
                 s.play_count as "playCount", s.valid_likes_count as "validLikesCount", 
                 s.popularity_score as "popularityScore",
                 a.id as "artistId", a.name as "artistName", a.is_verified as "isArtistVerified",
                 al.title as "albumTitle",
                 l.name as "languageName", l.code as "languageCode", g.name as "genreName" 
          FROM songs s 
          JOIN artists a ON s.artist_id = a.id 
          LEFT JOIN albums al ON s.album_id = al.id
          JOIN languages l ON s.language_id = l.id 
          JOIN genres g ON s.genre_id = g.id
          WHERE s.status = 'PUBLISHED' 
          ORDER BY s.valid_likes_count DESC, s.popularity_score DESC 
          LIMIT 12
        `),
        query(`
          SELECT s.id, s.title, s.slug, s.duration_seconds as "durationSeconds", 
                 s.audio_url as "audioUrl", s.artwork_url as "artworkUrl", 
                 s.play_count as "playCount", s.valid_likes_count as "validLikesCount", 
                 s.popularity_score as "popularityScore",
                 a.id as "artistId", a.name as "artistName", a.is_verified as "isArtistVerified",
                 al.title as "albumTitle",
                 l.name as "languageName", l.code as "languageCode", g.name as "genreName" 
          FROM songs s 
          JOIN artists a ON s.artist_id = a.id 
          LEFT JOIN albums al ON s.album_id = al.id
          JOIN languages l ON s.language_id = l.id 
          JOIN genres g ON s.genre_id = g.id
          WHERE s.status = 'PUBLISHED' 
          ORDER BY s.release_date DESC, s.created_at DESC 
          LIMIT 12
        `),
        query(`
          SELECT l.id, l.code, l.name, l.native_name as "nativeName",
                 COUNT(s.id)::int as "songCount",
                 COALESCE(
                   (SELECT s2.artwork_url FROM songs s2 WHERE s2.language_id = l.id AND s2.status = 'PUBLISHED' AND s2.artwork_url IS NOT NULL ORDER BY s2.play_count DESC LIMIT 1),
                   'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800'
                 ) as "artworkUrl"
          FROM languages l
          LEFT JOIN songs s ON l.id = s.language_id AND s.status = 'PUBLISHED'
          WHERE l.is_active = TRUE
          GROUP BY l.id, l.code, l.name, l.native_name
          HAVING COUNT(s.id) > 0
          ORDER BY "songCount" DESC
        `),
        query(`
          SELECT g.id, g.name, g.slug, g.description, 
                 COUNT(s.id)::int as "songCount",
                 COALESCE(
                   (SELECT s2.artwork_url FROM songs s2 WHERE s2.genre_id = g.id AND s2.status = 'PUBLISHED' AND s2.artwork_url IS NOT NULL ORDER BY s2.play_count DESC LIMIT 1),
                   'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800'
                 ) as "artworkUrl"
          FROM genres g
          LEFT JOIN songs s ON g.id = s.genre_id AND s.status = 'PUBLISHED'
          GROUP BY g.id, g.name, g.slug, g.description
          ORDER BY "songCount" DESC, g.name ASC
        `),
        query(`
          SELECT a.id, a.name, a.bio, a.avatar_url as "avatarUrl", a.is_verified as "isVerified",
                 COALESCE(a.followers_count, 0) as "followersCount",
                 COUNT(s.id)::int as "songCount",
                 COALESCE(SUM(s.play_count), 0)::bigint as "totalPlays",
                 (SELECT g.name FROM songs s3 JOIN genres g ON s3.genre_id = g.id WHERE s3.artist_id = a.id AND s3.status = 'PUBLISHED' LIMIT 1) as "genreName"
          FROM artists a
          JOIN songs s ON a.id = s.artist_id AND s.status = 'PUBLISHED'
          GROUP BY a.id, a.name, a.bio, a.avatar_url, a.is_verified, a.followers_count
          ORDER BY "totalPlays" DESC, "songCount" DESC
          LIMIT 12
        `),
        query(`
          SELECT 
            (SELECT COUNT(*)::int FROM songs WHERE status = 'PUBLISHED') as "totalSongs",
            (SELECT COALESCE(SUM(play_count), 0)::bigint FROM songs WHERE status = 'PUBLISHED') as "totalPlays",
            (SELECT COUNT(DISTINCT artist_id)::int FROM songs WHERE status = 'PUBLISHED') as "totalArtists",
            (SELECT COUNT(DISTINCT language_id)::int FROM songs WHERE status = 'PUBLISHED') as "totalLanguages"
        `),
      ]);

      return {
        heroTracks: heroTracks.rows,
        trending: trending.rows,
        featured: featured.rows,
        newReleases: newReleases.rows,
        languages: languages.rows,
        genres: genres.rows,
        topArtists: topArtists.rows,
        stats: stats.rows[0],
      };
    });

    res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=120');
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/v1/catalog/new-talent
router.get('/new-talent', async (_req: Request, res: Response) => {
  try {
    const cacheKey = 'catalog:new-talent';
    const data = await memoryCache.getOrSet(cacheKey, 60, async () => {
      const creatorsRes = await query(`
        SELECT cp.*, u.full_name as "fullName", u.username, u.avatar_url as "avatarUrl"
        FROM creator_profiles cp
        JOIN users u ON cp.user_id = u.id
        WHERE cp.is_approved = TRUE
        ORDER BY cp.created_at DESC
        LIMIT 20
      `);
      return creatorsRes.rows;
    });

    res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=120');
    return res.status(200).json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
