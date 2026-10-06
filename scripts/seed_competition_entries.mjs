import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('backend/.env') });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  console.log('Seeding rich competition entries...');

  const comps = (await pool.query('SELECT id, title FROM competitions')).rows;
  const creators = (await pool.query('SELECT id, stage_name, city FROM creator_profiles LIMIT 6')).rows;
  const songs = (await pool.query("SELECT id, title, audio_url, artwork_url FROM songs WHERE status = 'PUBLISHED' LIMIT 8")).rows;

  if (comps.length > 0 && creators.length > 0 && songs.length > 0) {
    for (let cIdx = 0; cIdx < comps.length; cIdx++) {
      const comp = comps[cIdx];
      console.log(`Processing comp: "${comp.title}" (${comp.id})`);

      for (let i = 0; i < Math.min(creators.length, 4); i++) {
        const creator = creators[i];
        const song = songs[(cIdx * 3 + i) % songs.length];
        const votes = 850 + (i * 320) + (cIdx * 150);

        // Check if entry already exists
        const exists = await pool.query(
          'SELECT id FROM competition_entries WHERE competition_id = $1 AND creator_id = $2',
          [comp.id, creator.id]
        );

        if (exists.rows.length === 0) {
          await pool.query(`
            INSERT INTO competition_entries 
              (id, competition_id, creator_id, content_id, rank, votes_count, status, submitted_at)
            VALUES 
              (gen_random_uuid(), $1, $2, $3, $4, $5, 'QUALIFIED', NOW() - INTERVAL '3 days')
          `, [comp.id, creator.id, song.id, i + 1, votes]);
          console.log(`  + Added entry for ${creator.stage_name} with "${song.title}" (${votes} votes)`);
        }
      }
    }
  }
}

main().catch(console.error).finally(() => pool.end());
