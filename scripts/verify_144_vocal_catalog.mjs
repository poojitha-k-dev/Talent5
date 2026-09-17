import pg from 'pg';

const { Pool } = pg;
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/talent5_v1';
const pool = new Pool({ connectionString: DATABASE_URL });

async function verify144Catalog() {
  console.log('================================================================');
  console.log('  AUDITING 144 PURE HUMAN VOCAL SONGS CATALOG');
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

    // 5. Wave 8 Additions Audit
    const wave8Check = await client.query(`
      SELECT s.title, a.name AS artist, l.name AS language, COUNT(ll.id)::int AS line_count
      FROM songs s
      JOIN artists a ON s.artist_id = a.id
      JOIN languages l ON s.language_id = l.id
      JOIN lyrics lyr ON s.id = lyr.song_id
      JOIN lyric_lines ll ON lyr.id = ll.lyrics_id
      WHERE s.slug IN (
        'gajavadana-beduve-hamsadhwani', 'krishna-nee-begane-baro-yamunakalyani', 'rama-nama-payasakke-anandabhairavi',
        'tallanisadiru-kandya-thalu-manave', 'ranga-baro-panduranga-baro', 'thugire-rangana-thugire-krishnana',
        'venkataramanane-baro-seshadrivasa', 'gummana-karayadire-purandara-dasa', 'ma-ramanan-hindolam-papanasam-sivan',
        'eppo-varuvaro-jonpuri-gopalakrishna-bharati', 'thillana-in-madhuvanthi-lalgudi', 'thillana-in-kedaragowla-venkataramana',
        'thillana-in-kalyani-ponniah-pillai', 'sarasa-samadana-kapinarayani-tyagaraja', 'ennaga-manasuku-neelambari-tyagaraja',
        'mokshamu-galada-saramati-tyagaraja', 'tharuni-njan-enthu-cheyvu-dwijavanthi', 'alarsara-parithapam-surutti-swathi-thirunal',
        'gopa-nandana-bhooshavali-swathi-thirunal', 'mor-prabhater-ei-aarati', 'sansaro-jabe-monoharveshe',
        'nutan-juger-bhore-suchitra-mitra', 'mane-pyaru-lage-shreeji-taru-naam', 'he-jagjanani-he-jagdamba',
        'rame-ram-rame-manma-raghurai', 'chet-govind-aradhiaei-baarah-maah', 'kirat-karam-ke-veechhde-baarah-maah',
        'deep-ghevoniya-dhunditi-aandhar-tukaram', 'sakhiya-wah-ghar-sabse-niyara-kabir'
      )
      GROUP BY s.title, a.name, l.name
      ORDER BY l.name, s.title
    `);

    console.log(`\nWave 8 Additions Verification (${wave8Check.rows.length} / 29 Verified):`);
    for (const row of wave8Check.rows) {
      console.log(`  ✅ ${row.title} (${row.language}) by ${row.artist} — ${row.line_count} synced lines`);
    }

    if (totalSongs !== 144 || totalDups !== 0 || missingLyrics.length !== 0 || wave8Check.rows.length !== 29) {
      console.error('Audit failed!');
      process.exit(1);
    }

    console.log('\n=== AUDIT COMPLETE: 144 VOCAL SONGS, 0 DUPLICATES, 100% SYNCED LYRICS ===\n');
  } catch (err) {
    console.error('Audit execution error:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

verify144Catalog().catch(console.error);
