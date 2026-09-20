import pg from 'pg';

const pool = new pg.Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/talent5_v1' });

async function fixLang() {
  await pool.query("UPDATE songs SET language_id = 7 WHERE slug IN ('ebar-amai-dakle-priyo-rabindra', 'aloo-amar-aloo-ogo-rabindra')");
  await pool.query("UPDATE lyrics SET language_id = 7 WHERE song_id IN (SELECT id FROM songs WHERE slug IN ('ebar-amai-dakle-priyo-rabindra', 'aloo-amar-aloo-ogo-rabindra'))");
  
  await pool.query("UPDATE songs SET language_id = 9 WHERE slug IN ('sant-param-hitkari-guru-samarth-gujarati', 'namo-namo-giriraj-kishori-gujarati', 'jaya-jaya-aarti-vighnaharta-ganesh-gujarati')");
  await pool.query("UPDATE lyrics SET language_id = 9 WHERE song_id IN (SELECT id FROM songs WHERE slug IN ('sant-param-hitkari-guru-samarth-gujarati', 'namo-namo-giriraj-kishori-gujarati', 'jaya-jaya-aarti-vighnaharta-ganesh-gujarati'))");

  const langRes = await pool.query(`
    SELECT l.name, count(s.id) as count
    FROM songs s
    JOIN languages l ON s.language_id = l.id
    GROUP BY l.name
    ORDER BY count DESC
  `);
  console.log('Fixed songs by language:');
  console.table(langRes.rows);
  await pool.end();
}

fixLang().catch(console.error);
