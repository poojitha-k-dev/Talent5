import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgresql://postgres.psudcpqfsfhqkjnvuwxv:PoojithsaK@123@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const res = await pool.query(`
    SELECT table_name, column_name 
    FROM information_schema.columns 
    WHERE table_schema = 'public'
    ORDER BY table_name, ordinal_position;
  `);
  const grouped = {};
  res.rows.forEach(r => {
    grouped[r.table_name] = grouped[r.table_name] || [];
    grouped[r.table_name].push(r.column_name);
  });
  console.log('Tables and columns:');
  for (const [table, cols] of Object.entries(grouped)) {
    console.log(`- ${table}: ${cols.slice(0, 5).join(', ')}${cols.length > 5 ? '... (' + cols.length + ' cols)' : ''}`);
  }
  await pool.end();
}

main().catch(console.error);
