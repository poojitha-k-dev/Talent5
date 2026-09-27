import { Pool, QueryResult, QueryResultRow } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from root and backend directory
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres.psudcpqfsfhqkjnvuwxv:PoojithsaK@123@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true';

const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

export const pool: Pool = new Pool({
  connectionString,
  ssl: isLocal ? undefined : { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

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
