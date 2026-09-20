import pg from 'pg';

const pool = new pg.Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/talent5_v1' });

async function testSync() {
  const songs = await pool.query(`
    SELECT DISTINCT ON (l.name) s.id, s.title, s.duration_seconds, l.name as lang
    FROM songs s
    JOIN languages l ON s.language_id = l.id
    ORDER BY l.name
  `);

  console.log('Testing Synchronized Lyrics API across all 9 languages:\n');
  for (const s of songs.rows) {
    const res = await fetch(`http://localhost:3000/api/v1/lyrics/${s.id}`);
    if (!res.ok) {
      console.error(`Failed to fetch lyrics for ${s.title}: ${res.status}`);
      continue;
    }
    const data = await res.json();
    const lines = data.data?.lines || [];
    const minStart = lines[0]?.startTimeMs;
    const maxEnd = lines[lines.length - 1]?.endTimeMs;
    const totalExpected = s.duration_seconds * 1000;
    const isContiguous = minStart === 0 && maxEnd === totalExpected;

    console.log(`[${s.lang}] "${s.title}" (${s.duration_seconds}s)`);
    console.log(`  Lines: ${lines.length} | Start: ${minStart}ms | End: ${maxEnd}ms (Expected: ${totalExpected}ms) | Contiguous: ${isContiguous ? 'YES ✅' : 'NO ❌'}`);
    console.log(`  Line 1 (0ms): "${lines[0]?.text}"`);
    console.log(`  Line 2 (${(lines[1]?.startTimeMs/1000).toFixed(1)}s): "${lines[1]?.text}"`);
    console.log('');
  }

  await pool.end();
}

testSync();
