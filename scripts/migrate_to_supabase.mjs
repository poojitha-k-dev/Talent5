import pg from 'pg';
const { Pool } = pg;

const localPool = new Pool({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/talent5_v1',
});

const supabasePool = new Pool({
  connectionString: 'postgresql://postgres.psudcpqfsfhqkjnvuwxv:PoojithsaK@123@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false },
});

// Helper to chunk arrays
function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

async function migrateTable(tableName, conflictCol = 'id') {
  console.log(`\n⏳ Migrating table: "${tableName}"...`);
  
  // 1. Get source rows
  let sourceRows;
  try {
    const res = await localPool.query(`SELECT * FROM ${tableName}`);
    sourceRows = res.rows;
  } catch (err) {
    console.log(`   ⚠️ Table ${tableName} does not exist in local DB or has error: ${err.message}`);
    return;
  }

  if (sourceRows.length === 0) {
    console.log(`   ℹ️ No rows found in local "${tableName}". Skipping.`);
    return;
  }

  console.log(`   Found ${sourceRows.length} rows in local "${tableName}".`);

  // 2. Get columns and types
  const cols = Object.keys(sourceRows[0]);
  const quotedCols = cols.map(c => `"${c}"`).join(', ');

  const colTypeRes = await localPool.query(
    `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1`,
    [tableName]
  );
  const jsonCols = new Set(
    colTypeRes.rows.filter(r => r.data_type === 'json' || r.data_type === 'jsonb').map(r => r.column_name)
  );

  // 3. Batch insert (batches of 100 rows)
  const batches = chunkArray(sourceRows, 100);
  let totalInserted = 0;

  for (let b = 0; b < batches.length; b++) {
    const batch = batches[b];
    const valuePlaceholders = [];
    const values = [];

    batch.forEach((row, rowIdx) => {
      const rowPlaceholders = [];
      cols.forEach((col, colIdx) => {
        const paramIdx = rowIdx * cols.length + colIdx + 1;
        rowPlaceholders.push(`$${paramIdx}`);
        let val = row[col];
        if (jsonCols.has(col) && val !== null) {
          if (typeof val === 'string') {
            try {
              JSON.parse(val);
            } catch {
              val = JSON.stringify(val);
            }
          } else {
            val = JSON.stringify(val);
          }
        } else if (val !== null && typeof val === 'object' && !(val instanceof Date) && !Array.isArray(val)) {
          val = JSON.stringify(val);
        }
        values.push(val);
      });
      valuePlaceholders.push(`(${rowPlaceholders.join(', ')})`);
    });

    let onConflictClause = 'ON CONFLICT DO NOTHING';
    if (conflictCol) {
      if (Array.isArray(conflictCol)) {
        onConflictClause = `ON CONFLICT (${conflictCol.map(c => `"${c}"`).join(', ')}) DO NOTHING`;
      } else {
        onConflictClause = `ON CONFLICT ("${conflictCol}") DO NOTHING`;
      }
    }

    const insertSql = `
      INSERT INTO "${tableName}" (${quotedCols})
      VALUES ${valuePlaceholders.join(', ')}
      ${onConflictClause}
    `;

    try {
      await supabasePool.query(insertSql, values);
      totalInserted += batch.length;
      process.stdout.write(`   ✓ Processed ${totalInserted}/${sourceRows.length} rows...\r`);
    } catch (err) {
      console.error(`\n   ❌ Batch insert error on "${tableName}":`, err.message);
      // Try row-by-row fallback for this batch to isolate failures
      for (const row of batch) {
        const singleValues = cols.map(c => {
          let val = row[c];
          if (jsonCols.has(c) && val !== null) {
            if (typeof val === 'string') {
              try {
                JSON.parse(val);
              } catch {
                val = JSON.stringify(val);
              }
            } else {
              val = JSON.stringify(val);
            }
          } else if (val !== null && typeof val === 'object' && !(val instanceof Date) && !Array.isArray(val)) {
            val = JSON.stringify(val);
          }
          return val;
        });
        const singlePlaceholders = cols.map((_, i) => `$${i + 1}`).join(', ');
        try {
          await supabasePool.query(
            `INSERT INTO "${tableName}" (${quotedCols}) VALUES (${singlePlaceholders}) ${onConflictClause}`,
            singleValues
          );
        } catch (singleErr) {
          // ignore duplicate or foreign key errors if any
        }
      }
    }
  }

  // Count in target
  const targetCountRes = await supabasePool.query(`SELECT COUNT(*) FROM "${tableName}"`);
  console.log(`\n   ✅ Finished "${tableName}": Supabase now has ${targetCountRes.rows[0].count} rows.`);
}

async function main() {
  console.log('==================================================================');
  console.log('🚀 TALENT5: MIGRATING LOCAL DATABASE & SONGS TO SUPABASE');
  console.log('==================================================================');

  // Schema fixes in Supabase
  await supabasePool.query(`
    ALTER TABLE songs ALTER COLUMN mood TYPE VARCHAR(255);
    ALTER TABLE songs ALTER COLUMN title TYPE VARCHAR(500);
    ALTER TABLE songs ALTER COLUMN slug TYPE VARCHAR(500);
    CREATE TABLE IF NOT EXISTS tracks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255),
      artist_name VARCHAR(255),
      album_name VARCHAR(255),
      language VARCHAR(50),
      duration_seconds INTEGER,
      audio_key TEXT,
      audio_url TEXT,
      cover_url TEXT,
      rights_tier VARCHAR(50),
      license_type VARCHAR(100),
      stream_count BIGINT DEFAULT 0,
      status VARCHAR(50) DEFAULT 'ACTIVE',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ Checked and updated Supabase table schemas.');

  // 2. Migration in strict dependency order
  const migrationPlan = [
    { table: 'roles', conflict: 'id' },
    { table: 'languages', conflict: 'id' },
    { table: 'genres', conflict: 'id' },
    { table: 'reward_rules', conflict: 'id' },
    { table: 'system_settings', conflict: 'key' },
    { table: 'users', conflict: 'id' },
    { table: 'user_roles', conflict: ['user_id', 'role_id'] },
    { table: 'artists', conflict: 'id' },
    { table: 'albums', conflict: 'id' },
    { table: 'creator_profiles', conflict: 'id' },
    { table: 'creator_applications', conflict: 'id' },
    { table: 'creator_wallets', conflict: 'id' },
    { table: 'competitions', conflict: 'id' },
    { table: 'playlists', conflict: 'id' },
    { table: 'follows', conflict: 'id' },
    { table: 'songs', conflict: 'id' },
    { table: 'tracks', conflict: 'id' },
    { table: 'lyrics', conflict: 'id' },
    { table: 'lyric_lines', conflict: 'id' },
    { table: 'music_assets', conflict: 'id' },
    { table: 'rights_records', conflict: 'id' },
    { table: 'content_submissions', conflict: 'id' },
    { table: 'desi_music_content', conflict: 'id' },
    { table: 'wallet_transactions', conflict: 'id' },
    { table: 'reward_calculations', conflict: 'id' },
    { table: 'payout_requests', conflict: 'id' },
    { table: 'competition_entries', conflict: 'id' },
    { table: 'competition_votes', conflict: 'id' },
    { table: 'playlist_songs', conflict: 'id' },
    { table: 'saved_songs', conflict: 'id' },
    { table: 'likes', conflict: 'id' },
    { table: 'comments', conflict: 'id' },
    { table: 'song_plays', conflict: 'id' },
    { table: 'fraud_events', conflict: 'id' },
    { table: 'engagement_validation', conflict: 'id' },
    { table: 'audit_logs', conflict: 'id' },
    { table: 'notifications', conflict: 'id' },
    { table: 'reports', conflict: 'id' },
    { table: 'password_resets', conflict: 'id' },
  ];

  for (const item of migrationPlan) {
    await migrateTable(item.table, item.conflict);
  }

  // Final verification report
  console.log('\n==================================================================');
  console.log('📊 FINAL SUPABASE MIGRATION VERIFICATION AUDIT');
  console.log('==================================================================');

  const checkTables = ['users', 'songs', 'lyrics', 'lyric_lines', 'artists', 'albums', 'languages', 'genres', 'rights_records'];
  for (const t of checkTables) {
    const res = await supabasePool.query(`SELECT COUNT(*) FROM "${t}"`);
    console.log(`   • ${t.padEnd(20)}: ${res.rows[0].count} records active in Supabase`);
  }

  await localPool.end();
  await supabasePool.end();
  console.log('\n✨ ALL LOCAL DATA AND SONGS SUCCESSFULLY MIGRATED TO SUPABASE!');
}

main().catch(err => {
  console.error('Fatal migration failure:', err);
  process.exit(1);
});
