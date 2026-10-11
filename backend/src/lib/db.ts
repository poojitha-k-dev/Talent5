import { Pool, QueryResult, QueryResultRow } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load .env from root and backend directory
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();


const connectionString = process.env.DATABASE_URL;

if (!connectionString || connectionString.trim().length === 0) {
  // Fail fast: never fall back to a hardcoded connection string containing
  // real credentials. The DATABASE_URL must be supplied by the environment.
  throw new Error('DATABASE_URL is not configured. Set the DATABASE_URL environment variable.');
}

const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

/**
 * Build the TLS configuration for remote (non-local) database connections.
 *
 * Certificate validation is always enforced for remote connections
 * (rejectUnauthorized: true). Managed providers (e.g. Supabase) whose CA chain
 * is not in Node's default trust store must supply their CA certificate via one
 * of the DATABASE_CA_CERT / DATABASE_CA_CERT_FILE environment variables.
 *
 * There is intentionally NO option to disable certificate verification.
 */
function buildSslConfig(): false | { rejectUnauthorized: true; ca?: string } {
  if (isLocal) {
    // Local Postgres typically has no TLS; keep plaintext loopback as before.
    return false;
  }

  const inlineCa = process.env.DATABASE_CA_CERT?.trim();
  const caFilePath = process.env.DATABASE_CA_CERT_FILE?.trim();

  let ca: string | undefined;
  if (inlineCa) {
    ca = inlineCa;
  } else if (caFilePath) {
    ca = fs.readFileSync(path.resolve(caFilePath), 'utf8');
  }

  return { rejectUnauthorized: true, ...(ca ? { ca } : {}) };
}

export const pool: Pool = new Pool({
  connectionString,
  ssl: buildSslConfig(),
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
    // Log the error message server-side. The full query text is only logged in
    // development to avoid leaking schema/query internals in production logs.
    const message = err instanceof Error ? err.message : String(err);
    if (process.env.NODE_ENV === 'development') {
      console.error(`[DB Error]: ${message} on query: ${text}`);
    } else {
      console.error(`[DB Error]: ${message}`);
    }
    throw err;
  }
}

export async function getClient() {
  const client = await pool.connect();
  return client;
}
