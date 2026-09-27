import { Pool, QueryResult, QueryResultRow } from 'pg';

const SUPABASE_URL = 'postgresql://postgres.psudcpqfsfhqkjnvuwxv:PoojithsaK@123@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true';
const connectionString = process.env.DATABASE_URL || SUPABASE_URL;

// Global singleton pool for Next.js hot-reloading preservation
declare global {
  // eslint-disable-next-line no-var
  var pgPool: Pool | undefined;
}

export const pool: Pool = global.pgPool || new Pool({
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

if (process.env.NODE_ENV !== 'production') {
  global.pgPool = pool;
}

export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  try {
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development' && duration > 200) {
      console.warn(`[Slow Query ${duration}ms]: ${text.substring(0, 100)}...`);
    }
    return res;
  } catch (err) {
    console.error(`[DB Error]: ${err instanceof Error ? err.message : String(err)} on query: ${text}`);
    throw err;
  }
}

export async function getClient() {
  const client = await pool.connect();
  return client;
}
