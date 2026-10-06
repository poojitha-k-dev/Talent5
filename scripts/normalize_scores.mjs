import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('backend/.env') });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await pool.query(`
    UPDATE songs 
    SET popularity_score = (70.0 + (RANDOM() * 15))::numeric(5,2)
    WHERE title NOT IN (
      'Gully To Gagan', 'Pind Di Beat', 'Aa Mahiya', 'Desi-Hum', 
      'Dil Me Chupi', 'Baras Jaye', 'Bhaagam Bhaag', 'Bambookat', 
      'Jee Le Zara', 'Baarish', 'Tum Bin Mann Kaha', 'Deep Love'
    ) AND popularity_score > 88
  `);

  const top = await pool.query(`
    SELECT s.id, s.title, g.name as genre, s.popularity_score, s.play_count, a.name as artist
    FROM songs s
    JOIN genres g ON g.id = s.genre_id
    JOIN artists a ON a.id = s.artist_id
    WHERE s.status = 'PUBLISHED'
    ORDER BY s.popularity_score DESC
    LIMIT 10
  `);
  console.log('--- CURATED TOP 10 SONGS ---');
  console.table(top.rows);
}

main().catch(console.error).finally(() => pool.end());
