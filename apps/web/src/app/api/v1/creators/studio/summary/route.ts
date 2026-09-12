import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { getActiveRewardRule } from '@/lib/rewards';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
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
      return NextResponse.json(
        { success: false, message: 'User does not possess an approved creator profile' },
        { status: 403 }
      );
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

    return NextResponse.json({
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
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
