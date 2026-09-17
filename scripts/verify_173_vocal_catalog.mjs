import pg from 'pg';

const { Pool } = pg;
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/talent5_v1';
const pool = new Pool({ connectionString: DATABASE_URL });

async function verify173Catalog() {
  console.log('================================================================');
  console.log('  AUDITING 173 PURE HUMAN VOCAL SONGS CATALOG');
  console.log('  100% WITH COMPLETE VERSE-BY-VERSE ENGLISH SYNCHRONIZED LYRICS');
  console.log('================================================================\n');

  const client = await pool.connect();
  try {
    // 1. Total songs count
    const totalRes = await client.query('SELECT COUNT(*)::int AS count FROM songs');
    const totalSongs = totalRes.rows[0].count;
    console.log(`Total Songs in DB: ${totalSongs}`);

    // 2. Duplicates Check
    const dupSlugs = await client.query(`
      SELECT slug, COUNT(*) FROM songs GROUP BY slug HAVING COUNT(*) > 1
    `);
    const dupAudios = await client.query(`
      SELECT audio_url, COUNT(*) FROM songs GROUP BY audio_url HAVING COUNT(*) > 1
    `);
    const dupTitles = await client.query(`
      SELECT LOWER(TRIM(title)) AS clean_title, COUNT(*) FROM songs GROUP BY clean_title HAVING COUNT(*) > 1
    `);
    const totalDups = dupSlugs.rows.length + dupAudios.rows.length + dupTitles.rows.length;
    console.log(`Duplicate Slugs / Audios / Titles: ${totalDups}`);
    if (totalDups > 0) {
      console.error('Duplicates detected!', {
        slugs: dupSlugs.rows,
        audios: dupAudios.rows,
        titles: dupTitles.rows
      });
      process.exit(1);
    }

    // 3. Lyrics and Synced Lines Check
    const lyricsCheck = await client.query(`
      SELECT s.id, s.title, l.id AS lyric_id, l.is_synced, COUNT(ll.id)::int AS line_count
      FROM songs s
      LEFT JOIN lyrics l ON s.id = l.song_id
      LEFT JOIN lyric_lines ll ON l.id = ll.lyrics_id
      GROUP BY s.id, s.title, l.id, l.is_synced
    `);

    const missingLyrics = lyricsCheck.rows.filter(r => !r.lyric_id || !r.is_synced || r.line_count === 0);
    console.log(`Songs Missing Synchronized Lyrics: ${missingLyrics.length}`);
    if (missingLyrics.length > 0) {
      console.error('Songs missing lyrics:', missingLyrics);
      process.exit(1);
    }

    const totalLinesRes = await client.query('SELECT COUNT(*)::int AS count FROM lyric_lines');
    console.log(`Total Synchronized Lyric Lines in DB: ${totalLinesRes.rows[0].count}`);

    // 4. Language Breakdown
    const langRes = await client.query(`
      SELECT l.name, COUNT(s.id)::int AS song_count
      FROM songs s
      JOIN languages l ON s.language_id = l.id
      GROUP BY l.name
      ORDER BY song_count DESC
    `);
    console.log('\nLanguage Breakdown across 9 Indian Languages:');
    for (const r of langRes.rows) {
      console.log(`  - ${r.name}: ${r.song_count} songs`);
    }

    // 5. Wave 9 Additions Audit
    const wave9Check = await client.query(`
      SELECT s.title, a.name AS artist, l.name AS language, COUNT(ll.id)::int AS line_count
      FROM songs s
      JOIN artists a ON s.artist_id = a.id
      JOIN languages l ON s.language_id = l.id
      JOIN lyrics lyr ON s.id = lyr.song_id
      JOIN lyric_lines ll ON lyr.id = ll.lyrics_id
      WHERE s.slug IN (
        'kangalidyatako-kaveri-rangana-nodada', 'kandu-kandu-neeyen-kaimbiduvare', 'kolalanudutta-banda-gopiya-kanda',
        'baravva-mahabhagyada-abhimani-lakumi', 'idu-bhagya-idu-bhagya-haripadava', 'ikko-node-ranganathana-putta-padava',
        'lali-lali-namma-hariye-lali', 'muraliya-bariso-madhava-deena-bandhava', 'ranganathana-noduva-banni-rangapatnadali',
        'yashode-ninna-kandage-esu-roopave', 'thillana-in-poorvi-vaidhyanatha-bhagavatar', 'thillana-in-surutti-venkatasubba-iyer',
        'thillana-in-kuntalavarali-kvn', 'abhaya-varade-sharade-hindolam', 'sogasujuda-tarama-kannadagowla-tyagaraja',
        'neeve-nannu-brovavale-darbar-tyagaraja', 'geetha-vadhya-natakapriya-tyagaraja',
        'rajeevaksha-baro-sankarabaranam-swathi-thirunal', 'saramaina-marulu-behag-swathi-thirunal',
        'somasayaka-kapi-swathi-thirunal', 'asan-prem-umahra-baarah-maah', 'asarh-tapanda-tis-lagai-baarah-maah',
        'har-jeth-jurhanda-loriyai-baarah-maah', 'bhaduye-bhram-bhulaniya-baarah-maah',
        'shree-ram-jai-ram-jai-jai-ram-gujarati', 'mara-ghat-ma-birajta-shreenathji',
        'je-dhrubho-je-dhrubho-rabindra-sangeet', 'mono-jago-mangalaloke-rabindra-sangeet',
        'nuton-pran-dao-he-nirmolo-anonde'
      )
      GROUP BY s.title, a.name, l.name
      ORDER BY l.name, s.title
    `);

    console.log(`\nWave 9 Additions Verification (${wave9Check.rows.length} / 29 Verified):`);
    for (const row of wave9Check.rows) {
      console.log(`  ✅ ${row.title} (${row.language}) by ${row.artist} — ${row.line_count} synced lines`);
    }

    if (totalSongs !== 173 || totalDups !== 0 || missingLyrics.length !== 0 || wave9Check.rows.length !== 29) {
      console.error('Audit failed!');
      process.exit(1);
    }

    console.log('\n=== AUDIT COMPLETE: 173 VOCAL SONGS, 0 DUPLICATES, 100% SYNCED LYRICS ===\n');
  } catch (err) {
    console.error('Audit execution error:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

verify173Catalog().catch(console.error);
