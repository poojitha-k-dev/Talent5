import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgresql://postgres.psudcpqfsfhqkjnvuwxv:PoojithsaK@123@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false },
});

// All 39 tables identified by Supabase Advisor linter
const ALL_TABLES = [
  'tracks',
  'users',
  'user_roles',
  'roles',
  'artists',
  'albums',
  'languages',
  'genres',
  'songs',
  'music_assets',
  'rights_records',
  'creator_profiles',
  'lyrics',
  'creator_applications',
  'lyric_lines',
  'content_submissions',
  'desi_music_content',
  'likes',
  'engagement_validation',
  'fraud_events',
  'song_plays',
  'saved_songs',
  'reward_rules',
  'reward_calculations',
  'creator_wallets',
  'wallet_transactions',
  'payout_requests',
  'playlists',
  'playlist_songs',
  'follows',
  'comments',
  'competitions',
  'competition_entries',
  'competition_votes',
  'notifications',
  'reports',
  'audit_logs',
  'system_settings',
  'password_resets',
];

// Tables that should be publicly readable by anon and authenticated users (catalog, public posts, metadata)
const PUBLIC_READ_TABLES = new Set([
  'albums',
  'artists',
  'comments',
  'competition_entries',
  'competitions',
  'creator_profiles',
  'desi_music_content',
  'follows',
  'genres',
  'languages',
  'likes',
  'lyric_lines',
  'lyrics',
  'playlist_songs',
  'playlists',
  'reward_rules',
  'songs',
  'system_settings',
  'tracks',
]);

async function main() {
  console.log('🚀 Starting Supabase Row Level Security (RLS) Remediation Migration...');
  console.log(`Targeting ${ALL_TABLES.length} tables in public schema.\n`);

  const client = await pool.connect();

  try {
    let enabledCount = 0;
    let policiesCreated = 0;

    for (const table of ALL_TABLES) {
      console.log(`🔒 Configuring RLS for table: "public"."${table}"...`);

      // 1. Enable RLS
      await client.query(`ALTER TABLE public."${table}" ENABLE ROW LEVEL SECURITY;`);
      enabledCount++;

      // 2. Drop existing policies we manage to allow clean re-runs
      await client.query(`DROP POLICY IF EXISTS "Allow service_role full access" ON public."${table}";`);
      await client.query(`DROP POLICY IF EXISTS "Allow postgres full access" ON public."${table}";`);
      await client.query(`DROP POLICY IF EXISTS "Allow public read access" ON public."${table}";`);

      // 3. Create full access policy for service_role
      await client.query(`
        CREATE POLICY "Allow service_role full access" 
        ON public."${table}" 
        FOR ALL 
        TO service_role 
        USING (true) 
        WITH CHECK (true);
      `);
      policiesCreated++;

      // 4. Create full access policy for postgres role
      await client.query(`
        CREATE POLICY "Allow postgres full access" 
        ON public."${table}" 
        FOR ALL 
        TO postgres 
        USING (true) 
        WITH CHECK (true);
      `);
      policiesCreated++;

      // 5. If this is a catalog or publicly viewable table, allow SELECT for anon and authenticated
      if (PUBLIC_READ_TABLES.has(table)) {
        await client.query(`
          CREATE POLICY "Allow public read access" 
          ON public."${table}" 
          FOR SELECT 
          TO anon, authenticated 
          USING (true);
        `);
        policiesCreated++;
        console.log(`   ✅ Enabled RLS + Public SELECT Read + Service Full Access`);
      } else {
        console.log(`   🛡️ Enabled RLS + Secured (Service & Postgres Full Access Only)`);
      }
    }

    console.log(`\n🎉 Successfully processed ${enabledCount} tables and created ${policiesCreated} security policies.`);

    // Verification
    console.log('\n🔍 Verifying RLS status across public schema tables:');
    const verifyRes = await client.query(`
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename;
    `);

    const withRls = verifyRes.rows.filter(r => r.rowsecurity);
    const withoutRls = verifyRes.rows.filter(r => !r.rowsecurity);

    console.log(` - Tables WITH RLS: ${withRls.length} / ${verifyRes.rows.length}`);
    console.log(` - Tables WITHOUT RLS: ${withoutRls.length}`);

    if (withoutRls.length > 0) {
      console.warn('⚠️ Remaining tables without RLS:', withoutRls.map(r => r.tablename));
    } else {
      console.log('✅ ALL tables in public schema now have Row Level Security ENABLED! Supabase 0013_rls_disabled_in_public advisor error is 100% resolved.');
    }
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
