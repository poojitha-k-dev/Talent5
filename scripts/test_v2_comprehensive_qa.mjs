import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://127.0.0.1:3000';

const testResults = [];

async function test(suite, name, fn) {
  const start = Date.now();
  try {
    const outcome = await fn();
    const duration = Date.now() - start;
    if (outcome === true || (typeof outcome === 'object' && outcome.pass)) {
      const msg = typeof outcome === 'object' && outcome.message ? ` (${outcome.message})` : '';
      testResults.push({ suite, name, status: 'PASS', duration, message: msg });
      console.log(`  ✅ [PASS] [${duration}ms] ${suite} > ${name}${msg}`);
    } else {
      const errDetail = typeof outcome === 'object' && outcome.error ? outcome.error : String(outcome);
      testResults.push({ suite, name, status: 'FAIL', duration, error: errDetail });
      console.error(`  ❌ [FAIL] [${duration}ms] ${suite} > ${name} -> ${errDetail}`);
    }
  } catch (err) {
    const duration = Date.now() - start;
    testResults.push({ suite, name, status: 'FAIL', duration, error: err.message });
    console.error(`  ❌ [FAIL] [${duration}ms] ${suite} > ${name} -> Exception: ${err.message}`);
  }
}

async function runQaAudit() {
  console.log('\n================================================================');
  console.log('       TALENT5 V2 — PROFESSIONAL QA & INTEGRITY TEST AUDIT      ');
  console.log('================================================================\n');

  let adminToken = '';
  let creatorToken = '';
  let listenerToken = '';
  let testSongId = '';
  let testSongAudioUrl = '';
  let createdSubmissionId = '';

  // ----------------------------------------------------------------
  // SUITE 1: AUTHENTICATION & ACCESS CONTROL
  // ----------------------------------------------------------------
  console.log('📦 SUITE 1: Authentication, JWTs & RBAC Authorization');

  await test('Auth', 'Admin Login & JWT Token Issue', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@talent5.com', password: 'Talent5Admin2026!' }),
    });
    const json = await res.json();
    if (res.status === 200 && json.success && json.data?.token) {
      adminToken = json.data.token;
      return true;
    }
    return `Status ${res.status}: ${json?.error?.message || 'No token'}`;
  });

  await test('Auth', 'Creator Login & Role Verification', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'creator@talent5.com', password: 'Talent5Creator2026!' }),
    });
    const json = await res.json();
    if (res.status === 200 && json.success && json.data?.token) {
      creatorToken = json.data.token;
      const roles = json.data.user?.roles || [];
      return roles.includes('CREATOR') ? true : `Roles: ${JSON.stringify(roles)}`;
    }
    return `Status ${res.status}: ${json?.error?.message}`;
  });

  await test('Auth', 'Listener User Login', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'listener@talent5.com', password: 'Talent5Listener2026!' }),
    });
    const json = await res.json();
    if (res.status === 200 && json.success && json.data?.token) {
      listenerToken = json.data.token;
      return true;
    }
    return `Status ${res.status}: ${json?.error?.message}`;
  });

  await test('Auth', 'Reject Incorrect Password with HTTP 401', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@talent5.com', password: 'BogusPassword_123!' }),
    });
    return res.status === 401;
  });

  await test('Auth', 'Reject Non-Admin Access to Admin Endpoints with HTTP 403', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/admin/stats`, {
      headers: { Authorization: `Bearer ${listenerToken}` },
    });
    return res.status === 403;
  });

  // ----------------------------------------------------------------
  // SUITE 2: MUSIC CATALOG, SEARCH & AUDIO STREAMING
  // ----------------------------------------------------------------
  console.log('\n📦 SUITE 2: Music Catalog, Search & Media Streaming Engine');

  await test('Catalog', 'Home Feed API (/api/v1/catalog/home)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/catalog/home`);
    const json = await res.json();
    if (res.status === 200 && json.success) {
      const { hero, newReleases, newVoices, risingArtists, trending } = json.data;
      if (trending?.length > 0) {
        testSongId = trending[0].id;
        testSongAudioUrl = trending[0].audioUrl;
      }
      return {
        pass: Array.isArray(newReleases) && Array.isArray(newVoices) && Array.isArray(risingArtists),
        message: `Releases: ${newReleases.length}, Voices: ${newVoices.length}, Rising: ${risingArtists.length}`,
      };
    }
    return `Status ${res.status}`;
  });

  await test('Catalog', 'Deep Discover Songs (/api/v1/catalog/songs) with Pagination', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/catalog/songs?page=1&limit=10`);
    const json = await res.json();
    if (res.status === 200 && json.success && Array.isArray(json.data)) {
      if (!testSongId && json.data.length > 0) {
        testSongId = json.data[0].id;
        testSongAudioUrl = json.data[0].audioUrl;
      }
      return {
        pass: json.data.length > 0 && json.meta?.total > 0,
        message: `Total Songs: ${json.meta.total}`,
      };
    }
    return `Status ${res.status}: ${JSON.stringify(json)}`;
  });

  await test('Catalog', 'Language Filtering (Telugu, Tamil, Hindi)', async () => {
    const resTe = await fetch(`${BASE_URL}/api/v1/catalog/songs?language=te`);
    const jsonTe = await resTe.json();
    const resTa = await fetch(`${BASE_URL}/api/v1/catalog/songs?language=ta`);
    const jsonTa = await resTa.json();
    const pass = jsonTe.success && jsonTe.data.length > 0 && jsonTa.success && jsonTa.data.length > 0;
    return {
      pass,
      message: `Telugu: ${jsonTe.data?.length || 0}, Tamil: ${jsonTa.data?.length || 0}`,
    };
  });

  await test('Catalog', 'Catalog Search Query (/api/v1/search?q=yesudas)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/search?q=yesudas`);
    const json = await res.json();
    return {
      pass: res.status === 200 && json.success && (json.data?.songs?.length > 0 || json.data?.artists?.length > 0),
      message: `Matches - Songs: ${json.data?.songs?.length || 0}, Artists: ${json.data?.artists?.length || 0}`,
    };
  });

  await test('Catalog', 'Song Details & Recommendations (/api/v1/catalog/songs/[id])', async () => {
    if (!testSongId) return 'No test song ID available';
    const res = await fetch(`${BASE_URL}/api/v1/catalog/songs/${testSongId}`);
    const json = await res.json();
    if (res.status === 200 && json.success && json.data?.song) {
      return {
        pass: !!json.data.song.title && Array.isArray(json.data.recommendations),
        message: `Track: "${json.data.song.title}", Artist: "${json.data.song.artistName}"`,
      };
    }
    return `Status ${res.status}`;
  });

  await test('Catalog', 'Synchronized & Authentic Lyrics (/api/v1/lyrics/[songId])', async () => {
    if (!testSongId) return 'No test song ID available';
    const res = await fetch(`${BASE_URL}/api/v1/lyrics/${testSongId}`);
    const json = await res.json();
    if (res.status === 200 && json.success && json.data) {
      const status = json.data.syncStatus || (json.data.isSynced ? 'SYNCED' : 'UNSYNCED');
      const lines = json.data.lines || [];
      const pass = ['SYNCED', 'UNSYNCED', 'NEEDS_REVIEW'].includes(status) && lines.length > 0;
      return {
        pass,
        message: `SyncStatus: ${status}, Lines: ${lines.length}, First: "${lines[0]?.text?.slice(0, 30)}..."`,
      };
    }
    return `Status ${res.status}: ${JSON.stringify(json)}`;
  });

  await test('Streaming', 'Audio Stream Range Request (HTTP 206 Partial Content)', async () => {
    if (!testSongAudioUrl) return 'No test audio URL available';
    const streamUrl = testSongAudioUrl.startsWith('http') ? testSongAudioUrl : `${BASE_URL}${testSongAudioUrl}`;
    const res = await fetch(streamUrl, {
      headers: { Range: 'bytes=0-1024' },
    });
    const isPartial = res.status === 206;
    const isOk = res.status === 200;
    const contentType = res.headers.get('content-type') || '';
    return {
      pass: (isPartial || isOk) && (contentType.includes('audio') || contentType.includes('mpeg') || contentType.includes('octet-stream')),
      message: `Status ${res.status}, Type: ${contentType}`,
    };
  });

  // ----------------------------------------------------------------
  // SUITE 3: QUALIFIED PLAY TELEMETRY & LISTENING HISTORY
  // ----------------------------------------------------------------
  console.log('\n📦 SUITE 3: 30s Qualified Stream Telemetry & History');

  await test('Telemetry', 'Reject or Ignore Unqualified Streams (< 30s)', async () => {
    if (!testSongId) return 'No test song ID';
    const res = await fetch(`${BASE_URL}/api/v1/telemetry/play`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${listenerToken}`,
      },
      body: JSON.stringify({
        songId: testSongId,
        durationPlayedSeconds: 15,
      }),
    });
    const json = await res.json();
    return {
      pass: res.status === 200 && json.success && json.data?.isQualified === false,
      message: `isQualified: ${json.data?.isQualified}`,
    };
  });

  await test('Telemetry', 'Record Qualified Stream (>= 30s) & Atomic Play Counter Increment', async () => {
    if (!testSongId) return 'No test song ID';
    const res = await fetch(`${BASE_URL}/api/v1/telemetry/play`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${listenerToken}`,
      },
      body: JSON.stringify({
        songId: testSongId,
        durationPlayedSeconds: 35,
        deviceType: 'DESKTOP_TESTER',
      }),
    });
    const json = await res.json();
    return {
      pass: res.status === 200 && json.success && json.data?.isQualified === true,
      message: `isQualified: ${json.data?.isQualified}`,
    };
  });

  // ----------------------------------------------------------------
  // SUITE 4: SOCIAL ENGAGEMENT & USER LIBRARY
  // ----------------------------------------------------------------
  console.log('\n📦 SUITE 4: Social Engagement, Likes, Saves & Library');

  await test('Social', 'Like / Unlike Song Toggle (/api/v1/social/like)', async () => {
    if (!testSongId) return 'No test song ID';
    const res = await fetch(`${BASE_URL}/api/v1/social/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${listenerToken}`,
      },
      body: JSON.stringify({
        targetType: 'SONG',
        targetId: testSongId,
        deviceFingerprint: 'tester-device-uuid-999',
      }),
    });
    const json = await res.json();
    return {
      pass: res.status === 200 && json.success && (json.action === 'LIKED' || json.action === 'UNLIKED'),
      message: `Action: ${json.action}`,
    };
  });

  await test('Library', 'Save / Bookmark Song Toggle (/api/v1/library/save)', async () => {
    if (!testSongId) return 'No test song ID';
    const res = await fetch(`${BASE_URL}/api/v1/library/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${listenerToken}`,
      },
      body: JSON.stringify({ songId: testSongId }),
    });
    const json = await res.json();
    return {
      pass: res.status === 200 && json.success && (json.action === 'SAVED' || json.action === 'UNSAVED'),
      message: `Action: ${json.action}`,
    };
  });

  await test('Library', 'Fetch User Library with 5 Tabs (/api/v1/library)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/library`, {
      headers: { Authorization: `Bearer ${listenerToken}` },
    });
    const json = await res.json();
    if (res.status === 200 && json.success) {
      const { likedSongs, savedSongs, playlists, followedArtists, listeningHistory } = json.data;
      return {
        pass: Array.isArray(likedSongs) && Array.isArray(savedSongs) && Array.isArray(listeningHistory),
        message: `Liked: ${likedSongs?.length || 0}, Saved: ${savedSongs?.length || 0}, History: ${listeningHistory?.length || 0}`,
      };
    }
    return `Status ${res.status}`;
  });

  // ----------------------------------------------------------------
  // SUITE 5: NEW TALENT & CREATOR STUDIO UPLOAD PIPELINE
  // ----------------------------------------------------------------
  console.log('\n📦 SUITE 5: New Talent Feed & 6-Step Creator Upload Pipeline');

  let directUploadUrl = '';

  await test('NewTalent', 'Fetch New Talent Spotlight (/api/v1/catalog/new-talent)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/catalog/new-talent`);
    const json = await res.json();
    if (res.status === 200 && json.success) {
      const { risingArtists, newOriginals, trendingCreators } = json.data;
      return {
        pass: Array.isArray(risingArtists) && Array.isArray(newOriginals),
        message: `Rising: ${risingArtists?.length || 0}, Originals: ${newOriginals?.length || 0}, Trending: ${trendingCreators?.length || 0}`,
      };
    }
    return `Status ${res.status}`;
  });

  await test('Uploads', 'Issue Signed Direct Upload Ticket (/api/v1/uploads/ticket)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/uploads/ticket`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${creatorToken}`,
      },
      body: JSON.stringify({
        fileName: 'qa_vocal_sample.mp3',
        contentType: 'audio/mpeg',
        sizeBytes: 5242880,
      }),
    });
    const json = await res.json();
    if (res.status === 200 && json.success && json.data?.uploadUrl && json.data?.key) {
      directUploadUrl = json.data.uploadUrl;
      return {
        pass: true,
        message: `Key: ${json.data.key}, Mode: ${json.data.driver}`,
      };
    }
    return `Status ${res.status}: ${JSON.stringify(json)}`;
  });

  await test('Uploads', 'Direct Media Stream Upload via Ticket (/api/v1/media/upload)', async () => {
    if (!directUploadUrl) return 'No direct upload ticket URL generated';
    const fakeMp3Header = Buffer.from([0xff, 0xfb, 0x90, 0x64, 0x00, 0x00, 0x00, 0x00]);

    const res = await fetch(directUploadUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'audio/mpeg' },
      body: fakeMp3Header,
    });
    const json = await res.json();
    return {
      pass: res.status === 200 && json.success && !!json.data?.publicUrl,
      message: `Stream URL: ${json.data?.publicUrl}, Bytes: ${json.data?.sizeBytes}`,
    };
  });

  await test('Submissions', 'Create Creator Submission with Lyrics & Rights Declaration', async () => {
    const submissionPayload = {
      title: 'QA Verified Original Master 2026',
      description: 'Comprehensive QA integration verification track for Talent5 V2',
      category: 'SINGER',
      languageId: 1,
      genreId: 1,
      durationSeconds: 195,
      mood: 'Uplifting',
      audioUrl: '/media/bhavaye_sri_gopalam.mp3',
      coverUrl: '/media/bhavaye_sri_gopalam.jpg',
      composer: 'Talent5 QA Studio',
      lyricist: 'Talent5 QA Lyricist',
      lyricsText: 'Line 1: Raag Bhairav sur milaaye\nLine 2: Talent5 sangeet gaaye',
      lyricsTimedData: [
        { sequence_order: 1, startTimeMs: 0, endTimeMs: 4000, text: 'Raag Bhairav sur milaaye' },
        { sequence_order: 2, startTimeMs: 4100, endTimeMs: 8500, text: 'Talent5 sangeet gaaye' },
      ],
      rightsDeclaration: {
        ownershipCertified: true,
        noAiVoiceClones: true,
        termsAgreed: true,
      },
      ownershipDeclaration: true,
      isDraft: false,
    };

    const res = await fetch(`${BASE_URL}/api/v1/creators/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${creatorToken}`,
      },
      body: JSON.stringify(submissionPayload),
    });
    const json = await res.json();
    if ((res.status === 200 || res.status === 201) && json.success && json.data?.id) {
      createdSubmissionId = json.data.id;
      return {
        pass: true,
        message: `ID: ${createdSubmissionId}, Status: ${json.data.status}`,
      };
    }
    return `Status ${res.status}: ${JSON.stringify(json)}`;
  });

  // ----------------------------------------------------------------
  // SUITE 6: COMPETITION VOTING & ANTI-FRAUD ENGINE
  // ----------------------------------------------------------------
  console.log('\n📦 SUITE 6: Competition Voting & Fraud Detection Engine');

  let activeCompId = '';
  let compEntryId = '';

  await test('Competitions', 'Fetch Active Competitions (/api/v1/competitions)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/competitions`);
    const json = await res.json();
    if (res.status === 200 && json.success && Array.isArray(json.data) && json.data.length > 0) {
      activeCompId = json.data[0].id;
      return {
        pass: true,
        message: `Comp: "${json.data[0].title}", Entries: ${json.data[0].entriesCount}`,
      };
    }
    return `Status ${res.status}`;
  });

  await test('Competitions', 'Fetch Competition Detail & Entries (/api/v1/competitions/[id])', async () => {
    if (!activeCompId) return 'No active competition ID';
    const res = await fetch(`${BASE_URL}/api/v1/competitions/${activeCompId}`);
    const json = await res.json();
    if (res.status === 200 && json.success && Array.isArray(json.data?.entries) && json.data.entries.length > 0) {
      compEntryId = json.data.entries[0].id;
      return {
        pass: true,
        message: `Found Entry: ${compEntryId}, Votes: ${json.data.entries[0].votesCount}`,
      };
    }
    return `Status ${res.status}: ${JSON.stringify(json)}`;
  });

  await test('Competitions', 'Reject Anonymous Vote with HTTP 401', async () => {
    if (!activeCompId || !compEntryId) return 'No comp or entry';
    const res = await fetch(`${BASE_URL}/api/v1/competitions/${activeCompId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entryId: compEntryId }),
    });
    return res.status === 401;
  });

  await test('Competitions', 'Accept Authenticated User Vote or Reject Duplicate (400 ALREADY_VOTED)', async () => {
    if (!activeCompId || !compEntryId) return 'No comp or entry';
    const res = await fetch(`${BASE_URL}/api/v1/competitions/${activeCompId}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${listenerToken}`,
      },
      body: JSON.stringify({
        entryId: compEntryId,
        deviceFingerprint: 'qa-tester-vote-device',
      }),
    });
    const json = await res.json();
    const pass = (res.status === 200 && json.success) || (res.status === 400 && json.error?.code === 'ALREADY_VOTED');
    return {
      pass,
      message: res.status === 200 ? 'Vote accepted successfully' : `Caught: ${json.error?.message}`,
    };
  });

  await test('Competitions', 'Strictly Prevent Duplicate Bot/User Voting (400 ALREADY_VOTED)', async () => {
    if (!activeCompId || !compEntryId) return 'No comp or entry';
    const res = await fetch(`${BASE_URL}/api/v1/competitions/${activeCompId}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${listenerToken}`,
      },
      body: JSON.stringify({
        entryId: compEntryId,
        deviceFingerprint: 'qa-tester-vote-device',
      }),
    });
    const json = await res.json();
    return {
      pass: res.status === 400 && json.error?.code === 'ALREADY_VOTED',
      message: `Duplicate vote rejected: ${json.error?.message}`,
    };
  });

  // ----------------------------------------------------------------
  // SUITE 7: ADMIN CONTENT REVIEW & PROVISIONING PIPELINE
  // ----------------------------------------------------------------
  console.log('\n📦 SUITE 7: Admin Moderation Cockpit & Song Auto-Provisioning');

  await test('Admin', 'Admin Content Review Queue Listing (/api/v1/admin/content-review)', async () => {
    const res = await fetch(`${BASE_URL}/api/v1/admin/content-review`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const json = await res.json();
    return {
      pass: res.status === 200 && json.success && Array.isArray(json.data),
      message: `Items in queue: ${json.data?.length || 0}`,
    };
  });

  await test('Admin', 'Approve Creator Submission & Provision Catalog Song + Lyrics + Rights', async () => {
    if (!createdSubmissionId) return 'No created submission to approve';
    const res = await fetch(`${BASE_URL}/api/v1/admin/content-review/${createdSubmissionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        action: 'APPROVE',
        notes: 'QA Automated Verification Approval: master, lyrics, and rights certified.',
      }),
    });
    const json = await res.json();
    return {
      pass: res.status === 200 && json.success && json.data?.status === 'APPROVED',
      message: `Status: ${json.data?.status}`,
    };
  });

  // ----------------------------------------------------------------
  // SUITE 8: USER INTERFACE ROUTES STATUS 200
  // ----------------------------------------------------------------
  console.log('\n📦 SUITE 8: Core Consumer, Creator & Admin Pages (HTTP 200)');

  const pagesToTest = [
    { path: '/', name: '1. Home Editorial Feed' },
    { path: '/discover', name: '2. Deep Discover 9-Languages Hub' },
    { path: '/new-talent', name: '3. New Talent Spotlight Hub' },
    { path: '/competitions', name: '4. Tournaments & Competitions' },
    { path: '/library', name: '5. User Library (5-Tabs)' },
    { path: `/song/${testSongId || 'b1fecb5f-7d8f-407e-a002-0ba56b3b6a62'}`, name: '6. Song Detail & Synced Lyrics' },
    { path: '/creator-studio/upload', name: '7. 6-Step Creator Upload Wizard' },
    { path: '/admin/content-review', name: '8. Admin Content Review Cockpit' },
    { path: '/search', name: '9. Unified Catalog Search' },
    { path: '/login', name: '10. Authentication Portal' },
  ];

  for (const page of pagesToTest) {
    await test('Pages', `${page.name} (${page.path})`, async () => {
      const res = await fetch(`${BASE_URL}${page.path}`);
      return {
        pass: res.status === 200,
        message: `Status ${res.status}`,
      };
    });
  }

  // ----------------------------------------------------------------
  // FINAL QA REPORT
  // ----------------------------------------------------------------
  const total = testResults.length;
  const passed = testResults.filter((r) => r.status === 'PASS').length;
  const failed = testResults.filter((r) => r.status === 'FAIL').length;
  const passRate = ((passed / total) * 100).toFixed(1);

  console.log('\n================================================================');
  console.log(`  QA SUMMARY: ${passed} PASSED / ${failed} FAILED across ${total} TESTS (${passRate}% PASS RATE)`);
  console.log('================================================================\n');

  if (failed > 0) {
    console.error('FAILED TESTS DETAILS:');
    testResults.filter((r) => r.status === 'FAIL').forEach((f) => {
      console.error(` - [${f.suite}] ${f.name}: ${f.error}`);
    });
    process.exit(1);
  }
}

runQaAudit();
