import { Router, Request, Response } from 'express';
import { query, getClient } from '../lib/db';
import { getUserFromRequest } from '../lib/auth';
import { getActiveRewardRule } from '../lib/rewards';

const router = Router();

// POST /api/v1/creators/apply
router.post('/apply', async (req: Request, res: Response) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Authentication required to apply as a Desi Creator' });
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
    } = req.body;

    // Strict validation
    if (!fullName || !stageName || !bio || !city || !state || !samplePerformanceUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please complete all required fields including sample audition link',
      });
    }

    if (!ownershipDeclaration || !copyrightDeclaration) {
      return res.status(400).json({
        success: false,
        message: 'You must accept both the 100% Original Ownership declaration and Copyright compliance declaration to apply.',
      });
    }

    // Check if user already has an existing pending or approved application
    const existingApp = await query(
      'SELECT id, status FROM creator_applications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [user.id]
    );

    if (existingApp.rows.length > 0 && existingApp.rows[0].status === 'PENDING') {
      return res.status(409).json({
        success: false,
        message: 'You already have a pending creator application currently under review',
      });
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

      return res.status(201).json({
        success: true,
        message: 'Creator application submitted successfully. Talent5 moderators will review your audition within 24-48 hours.',
        data: appInsert.rows[0],
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Creator application error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/v1/creators/status
router.get('/status', async (req: Request, res: Response) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    // 1. Check if user has an approved creator profile
    const profileRes = await query(
      `SELECT cp.id, cp.stage_name as "stageName", cp.bio, cp.city, cp.state,
              cp.category, cp.is_approved as "isApproved", cp.verified_badge as "verifiedBadge",
              cp.portfolio_url as "portfolioUrl", cp.created_at as "createdAt",
              cw.available_balance_inr as "availableBalanceINR",
              cw.total_earned_inr as "totalEarnedINR"
       FROM creator_profiles cp
       LEFT JOIN creator_wallets cw ON cp.id = cw.creator_id
       WHERE cp.user_id = $1`,
      [user.id]
    );

    if (profileRes.rows.length > 0) {
      return res.status(200).json({
        success: true,
        isCreator: true,
        profile: profileRes.rows[0],
      });
    }

    // 2. Check pending or recent application
    const appRes = await query(
      `SELECT id, stage_name as "stageName", category, status, created_at as "createdAt",
              review_notes as "reviewNotes"
       FROM creator_applications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [user.id]
    );

    return res.status(200).json({
      success: true,
      isCreator: false,
      application: appRes.rows[0] || null,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/v1/creators/studio/summary
router.get('/studio/summary', async (req: Request, res: Response) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    // Get Creator Profile
    const profileRes = await query(
      `SELECT cp.id, cp.stage_name as "stageName", cp.bio, cp.city, cp.state,
              cp.category, cp.verified_badge as "verifiedBadge", cp.created_at as "createdAt",
              a.id as "artistId", a.followers_count as "followersCount"
       FROM creator_profiles cp
       LEFT JOIN artists a ON cp.user_id = a.user_id
       WHERE cp.user_id = $1`,
      [user.id]
    );

    if (profileRes.rows.length === 0) {
      return res.status(403).json({ success: false, message: 'User does not possess an approved creator profile' });
    }

    const profile = profileRes.rows[0];

    // Get Wallet details
    const walletRes = await query(
      `SELECT available_balance_inr as "availableBalanceINR",
              pending_balance_inr as "pendingBalanceINR",
              approved_balance_inr as "approvedBalanceINR",
              paid_balance_inr as "paidBalanceINR",
              total_earned_inr as "totalEarnedINR"
       FROM creator_wallets
       WHERE creator_id = $1`,
      [profile.id]
    );

    const wallet = walletRes.rows[0] || {
      availableBalanceINR: 0,
      pendingBalanceINR: 0,
      approvedBalanceINR: 0,
      paidBalanceINR: 0,
      totalEarnedINR: 0,
    };

    // Aggregate metrics across songs and videos
    const metricsRes = await query(
      `SELECT COALESCE(SUM(s.play_count), 0) as "totalPlays",
              COALESCE(SUM(s.raw_likes_count), 0) as "totalRawLikes",
              COALESCE(SUM(s.valid_likes_count), 0) as "totalValidLikes",
              COALESCE(SUM(dmc.views_count), 0) as "totalViews"
       FROM songs s
       JOIN artists a ON s.artist_id = a.id
       LEFT JOIN desi_music_content dmc ON dmc.creator_id = $1
       WHERE a.user_id = $2`,
      [profile.id, user.id]
    );

    const metrics = metricsRes.rows[0] || {
      totalPlays: 0,
      totalRawLikes: 0,
      totalValidLikes: 0,
      totalViews: 0,
    };

    // Get Published Tracks
    const songsRes = await query(
      `SELECT s.id, s.title, s.duration_seconds as "durationSeconds",
              s.artwork_url as "artworkUrl", s.play_count as "playCount",
              s.valid_likes_count as "validLikesCount", s.raw_likes_count as "rawLikesCount",
              s.status, s.release_date as "releaseDate",
              l.name as "languageName", g.name as "genreName"
       FROM songs s
       JOIN artists a ON s.artist_id = a.id
       JOIN languages l ON s.language_id = l.id
       JOIN genres g ON s.genre_id = g.id
       WHERE a.user_id = $1
       ORDER BY s.play_count DESC`,
      [user.id]
    );

    // Get Submissions (Drafts & Under Review)
    const submissionsRes = await query(
      `SELECT cs.id, cs.title, cs.category, cs.status, cs.created_at as "createdAt",
              cs.review_notes as "reviewNotes",
              l.name as "languageName", g.name as "genreName"
       FROM content_submissions cs
       JOIN languages l ON cs.language_id = l.id
       JOIN genres g ON cs.genre_id = g.id
       WHERE cs.creator_id = $1
       ORDER BY cs.created_at DESC`,
      [profile.id]
    );

    // Active reward rules
    const rewardRule = await getActiveRewardRule();

    return res.status(200).json({
      success: true,
      data: {
        profile,
        wallet,
        metrics: {
          totalPlays: parseInt(metrics.totalPlays, 10),
          totalViews: parseInt(metrics.totalViews, 10),
          totalRawLikes: parseInt(metrics.totalRawLikes, 10),
          totalValidLikes: parseInt(metrics.totalValidLikes, 10),
          followersCount: parseInt(profile.followersCount || '0', 10),
          invalidLikesDeducted: Math.max(
            0,
            parseInt(metrics.totalRawLikes, 10) - parseInt(metrics.totalValidLikes, 10)
          ),
        },
        songs: songsRes.rows,
        submissions: submissionsRes.rows,
        rewardRule,
      },
    });
  } catch (error: any) {
    console.error('Studio summary error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/v1/creators/submissions
router.get('/submissions', async (req: Request, res: Response) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const profileRes = await query('SELECT id FROM creator_profiles WHERE user_id = $1', [user.id]);
    if (profileRes.rows.length === 0) {
      return res.status(403).json({ success: false, message: 'Creator profile not found' });
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

    return res.status(200).json({
      success: true,
      data: submissionsRes.rows,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/creators/submissions
router.post('/submissions', async (req: Request, res: Response) => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const profileRes = await query('SELECT id, stage_name FROM creator_profiles WHERE user_id = $1', [user.id]);
    if (profileRes.rows.length === 0) {
      return res.status(403).json({ success: false, message: 'Only approved creators can submit original content' });
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
    } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Song title is required.' });
    }

    if (!isDraft) {
      if (!languageId || !genreId || !audioUrl) {
        return res.status(400).json({
          success: false,
          message: 'Title, Language, Genre, and Audio asset URL are required for submission.',
        });
      }

      if (!ownershipDeclaration) {
        return res.status(400).json({
          success: false,
          message: 'You must confirm original rights declaration to submit for platform review.',
        });
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

      return res.status(201).json({
        success: true,
        message: 'Content submitted for review. Talent5 content moderators will verify rights and audio standards.',
        data: subInsert.rows[0],
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Submission error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
