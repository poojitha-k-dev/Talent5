import pg from 'pg';
const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not set. Export it before running this script.');
  process.exit(1);
}
const pool = new Pool({
  connectionString,
  ssl:
    connectionString.includes('localhost') || connectionString.includes('127.0.0.1')
      ? false
      : { rejectUnauthorized: true, ...(process.env.DATABASE_CA_CERT ? { ca: process.env.DATABASE_CA_CERT } : {}) },
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
