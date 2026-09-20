import pg from 'pg';

const pool = new pg.Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/talent5_v1' });

async function checkTemplateCount() {
  const res = await pool.query(`
    SELECT count(DISTINCT s.id) as count
    FROM songs s
    JOIN lyrics l ON s.id = l.song_id
    JOIN lyric_lines ll ON l.id = ll.lyrics_id
    WHERE ll.text ILIKE '%anedi parama pavana geethamu%'
       OR ll.text ILIKE '%gaavat naina neer bhaye%'
       OR ll.text ILIKE '%gaata manva maaro%'
       OR ll.text ILIKE '%tere baajhon jee nahin%'
       OR ll.text ILIKE '%enum tirunaamam paadi%'
       OR ll.text ILIKE '%endu nambide ninna paada%'
       OR ll.text ILIKE '%baje amar praane gopone%'
       OR ll.text ILIKE '%gajar kari bhakt daat%'
  `);

  console.log(`Songs with generic/template filler lines: ${res.rows[0].count} out of 339!`);

  // Let's also count songs that have fewer than 12 lines
  const shortRes = await pool.query(`
    SELECT count(DISTINCT s.id) as count
    FROM songs s
    JOIN lyrics l ON s.id = l.song_id
    JOIN lyric_lines ll ON l.id = ll.lyrics_id
    GROUP BY s.id
    HAVING count(ll.id) < 14
  `);
  console.log(`Songs with fewer than 14 lines: ${shortRes.rows.length}`);

  await pool.end();
}

checkTemplateCount().catch(console.error);
