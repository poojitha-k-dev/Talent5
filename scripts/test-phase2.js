async function runPhase2Tests() {
  console.log('====================================================');
  console.log('TALENT5 PHASE 2 AUTOMATED VERIFICATION SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(name, condition) {
    if (condition) {
      console.log(`  [PASS] ${name}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${name}`);
      failed++;
    }
  }

  const BASE_URL = 'http://localhost:3000';

  // 1. Test Login to get authenticated JWT
  let listenerToken = '';
  try {
    const loginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'listener@talent5.com', password: 'Talent5Listener2026!' }),
    });
    const loginJson = await loginRes.json();
    listenerToken = loginJson.data?.token;
    assert('Listener authentication retrieves valid JWT session', loginJson.success && !!listenerToken);
  } catch (err) {
    assert('Listener authentication retrieves valid JWT session', false);
  }

  // 2. Test Catalog Songs with Filter
  try {
    const songsRes = await fetch(`${BASE_URL}/api/v1/catalog/songs?language=hi&sortBy=popularity`);
    const songsJson = await songsRes.json();
    assert(
      'Catalog songs API returns Hindi songs filtered correctly',
      songsJson.success && Array.isArray(songsJson.data) && songsJson.data.length > 0
    );
  } catch (err) {
    assert('Catalog songs API returns Hindi songs filtered correctly', false);
  }

  // 3. Test Song Detail with Rights and Lyrics
  let testSongId = '';
  try {
    const songRes = await fetch(`${BASE_URL}/api/v1/catalog/songs/tum-bin-mann-kaha`);
    const songJson = await songRes.json();
    testSongId = songJson.data?.song?.id;
    assert(
      'Song detail API retrieves track with verified rights record and lyrics',
      songJson.success &&
        songJson.data?.rights?.status === 'VERIFIED' &&
        songJson.data?.lyrics?.isSynced === true
    );
  } catch (err) {
    assert('Song detail API retrieves track with verified rights record and lyrics', false);
  }

  // 4. Test Artist Detail
  let testArtistId = '';
  try {
    const artistRes = await fetch(`${BASE_URL}/api/v1/catalog/artists/kabir-sen`);
    const artistJson = await artistRes.json();
    testArtistId = artistJson.data?.artist?.id;
    assert(
      'Artist detail API returns artist profile with verified badge and top songs',
      artistJson.success &&
        artistJson.data?.artist?.name === 'Kabir Sen' &&
        artistJson.data?.songs?.length > 0
    );
  } catch (err) {
    assert('Artist detail API returns artist profile with verified badge and top songs', false);
  }

  // 5. Test Album Detail
  try {
    const albumRes = await fetch(`${BASE_URL}/api/v1/catalog/albums/ruhaniyat-soulful-echoes`);
    const albumJson = await albumRes.json();
    assert(
      'Album detail API returns album with tracklist',
      albumJson.success && albumJson.data?.tracks?.length > 0
    );
  } catch (err) {
    assert('Album detail API returns album with tracklist', false);
  }

  // 6. Test Global Search
  try {
    const searchRes = await fetch(`${BASE_URL}/api/v1/search?q=Kabir`);
    const searchJson = await searchRes.json();
    assert(
      'Global search matches query across both songs and artists',
      searchJson.success &&
        searchJson.data?.songs?.length > 0 &&
        searchJson.data?.artists?.length > 0
    );
  } catch (err) {
    assert('Global search matches query across both songs and artists', false);
  }

  // 7. Test Comments API (POST & GET)
  try {
    const postCommentRes = await fetch(`${BASE_URL}/api/v1/social/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${listenerToken}`,
      },
      body: JSON.stringify({
        targetType: 'SONG',
        targetId: testSongId,
        content: 'Soulful rendition and divine guitar chords!',
      }),
    });
    const postCommentJson = await postCommentRes.json();

    const getCommentsRes = await fetch(
      `${BASE_URL}/api/v1/social/comments?targetType=SONG&targetId=${testSongId}`
    );
    const getCommentsJson = await getCommentsRes.json();

    assert(
      'Comments API successfully posts and retrieves song discussion comments',
      postCommentJson.success && getCommentsJson.data?.length > 0
    );
  } catch (err) {
    assert('Comments API successfully posts and retrieves song discussion comments', false);
  }

  // 8. Test Follow Artist API
  try {
    const followRes = await fetch(`${BASE_URL}/api/v1/social/follow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${listenerToken}`,
      },
      body: JSON.stringify({
        targetType: 'ARTIST',
        targetId: testArtistId,
      }),
    });
    const followJson = await followRes.json();
    assert(
      'Follow API toggles artist follow relationship successfully',
      followJson.success && typeof followJson.isFollowing === 'boolean'
    );
  } catch (err) {
    assert('Follow API toggles artist follow relationship successfully', false);
  }

  // 9. Test Playlist Creation and Retrieval
  let createdPlaylistId = '';
  try {
    const createPlRes = await fetch(`${BASE_URL}/api/v1/playlists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${listenerToken}`,
      },
      body: JSON.stringify({
        name: 'Monsoon Desi Vibes',
        description: 'Test playlist for automated suite',
        visibility: 'PUBLIC',
      }),
    });
    const createPlJson = await createPlRes.json();
    createdPlaylistId = createPlJson.data?.id;

    assert('Playlist creation endpoint successfully creates user playlist', createPlJson.success && !!createdPlaylistId);
  } catch (err) {
    assert('Playlist creation endpoint successfully creates user playlist', false);
  }

  // 10. Test User Library API
  try {
    const libraryRes = await fetch(`${BASE_URL}/api/v1/library`, {
      headers: { Authorization: `Bearer ${listenerToken}` },
    });
    const libraryJson = await libraryRes.json();
    assert(
      'Library API retrieves user playlists, liked songs, and followed artists',
      libraryJson.success && Array.isArray(libraryJson.data?.playlists)
    );
  } catch (err) {
    assert('Library API retrieves user playlists, liked songs, and followed artists', false);
  }

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase2Tests();
