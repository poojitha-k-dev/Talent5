import { Pool, QueryResult, QueryResultRow } from 'pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/talent5_v1';

// Global singleton pool for Next.js hot-reloading preservation
declare global {
  // eslint-disable-next-line no-var
  var pgPool: Pool | undefined;
}

const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

export const pool: Pool = global.pgPool || new Pool({
  connectionString,
  ssl: isLocal ? undefined : { rejectUnauthorized: false },
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
