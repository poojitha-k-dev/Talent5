import { Pool } from 'pg';

async function migrate() {
  const pool = new Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/talent5_v1' });
  try {
    console.log('Creating password_resets table and indexes...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        email VARCHAR(255) NOT NULL,
        otp_hash VARCHAR(255) NOT NULL,
        reset_token VARCHAR(255),
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        attempts INTEGER DEFAULT 0,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets(LOWER(email));
      CREATE INDEX IF NOT EXISTS idx_password_resets_reset_token ON password_resets(reset_token);
    `);
    console.log('✅ password_resets table successfully created in PostgreSQL!');
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
