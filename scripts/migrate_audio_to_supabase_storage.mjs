import fs from 'fs';
import path from 'path';
import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables from backend/.env or root .env
dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });
dotenv.config();

const { Pool } = pg;
const PROJECT_REF = 'psudcpqfsfhqkjnvuwxv';
const SUPABASE_URL = process.env.SUPABASE_URL || `https://${PROJECT_REF}.supabase.co`;
const SUPABASE_KEY =
  process.argv[2] ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_KEY;

const DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://postgres.psudcpqfsfhqkjnvuwxv:PoojithsaK@123@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true';

const BUCKET_NAME = 'songs';
const MEDIA_DIR = path.resolve(process.cwd(), 'frontend/public/media');
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB Supabase Free Tier file limit

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function ensureBucketExists() {
  console.log(`\n📦 Checking if Supabase Storage bucket "${BUCKET_NAME}" exists...`);
  
  try {
    const listRes = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });
    const buckets = await listRes.json();
    const existing = Array.isArray(buckets) && buckets.find(b => b.name === BUCKET_NAME || b.id === BUCKET_NAME);

    if (existing) {
      console.log(`✅ Public bucket "${BUCKET_NAME}" already exists and is active.`);
      return;
    }

    const createRes = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify({
        id: BUCKET_NAME,
        name: BUCKET_NAME,
        public: true,
      }),
    });

    if (createRes.ok) {
      console.log(`✅ Public bucket "${BUCKET_NAME}" created successfully.`);
    } else {
      console.warn(`Bucket response: ${await createRes.text()}`);
    }
  } catch (err) {
    console.warn(`Bucket check error: ${err.message}`);
  }
}

async function uploadFile(fileName, filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${encodeURIComponent(fileName)}`;

  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'audio/mpeg',
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'x-upsert': 'true',
    },
    body: fileBuffer,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Upload failed (${res.status}): ${errText}`);
  }

  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${encodeURIComponent(fileName)}`;
}

async function runMigration() {
  console.log('===========================================================');
  console.log('🚀 TALENT5 SUPABASE CLOUD AUDIO STORAGE MIGRATION');
  console.log('===========================================================');
  console.log(`📡 Supabase Endpoint: ${SUPABASE_URL}`);
  console.log(`📂 Source Directory:   ${MEDIA_DIR}`);

  await ensureBucketExists();

  console.log('\n🔎 Querying already uploaded objects in Supabase Storage...');
  let existingObjects = new Set();
  try {
    const objectsRes = await pool.query(`SELECT name FROM storage.objects WHERE bucket_id = $1`, [BUCKET_NAME]);
    existingObjects = new Set(objectsRes.rows.map(r => r.name));
    console.log(`Found ${existingObjects.size} files already present in bucket "${BUCKET_NAME}".`);
  } catch (e) {
    console.warn('Could not query storage.objects, will proceed with standard uploads.');
  }

  console.log('\n🔎 Querying songs table for local audio stream paths...');
  const songsRes = await pool.query(`
    SELECT id, title, audio_url as "audioUrl"
    FROM songs
    WHERE audio_url LIKE '/api/v1/media/stream/%'
    ORDER BY id ASC
  `);

  const songsToMigrate = songsRes.rows;
  console.log(`Found ${songsToMigrate.length} songs needing cloud migration.`);

  if (songsToMigrate.length === 0) {
    console.log('✨ All songs are already migrated to cloud URLs!');
    await pool.end();
    return;
  }

  let successCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < songsToMigrate.length; i++) {
    const song = songsToMigrate[i];
    const prefix = `[${i + 1}/${songsToMigrate.length}]`;

    // Extract file name from /api/v1/media/stream/<name>
    const fileName = decodeURIComponent(song.audioUrl.replace('/api/v1/media/stream/', ''));
    const localFilePath = path.join(MEDIA_DIR, fileName);

    const publicCloudUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${encodeURIComponent(fileName)}`;

    // Check if already in bucket
    if (existingObjects.has(fileName)) {
      // Just update DB
      await pool.query('UPDATE songs SET audio_url = $1 WHERE id = $2', [publicCloudUrl, song.id]);
      console.log(`${prefix} ⚡ Already in cloud bucket: "${fileName}". Updated DB URL.`);
      successCount++;
      continue;
    }

    if (!fs.existsSync(localFilePath)) {
      console.warn(`${prefix} ⚠️ Local file not found: "${fileName}" (Song: "${song.title}"). Skipping.`);
      skippedCount++;
      continue;
    }

    const stat = fs.statSync(localFilePath);
    if (stat.size > MAX_FILE_SIZE_BYTES) {
      console.warn(`${prefix} ⚠️ File "${fileName}" is ${(stat.size / (1024*1024)).toFixed(1)}MB (exceeds 50MB limit). Skipping.`);
      skippedCount++;
      continue;
    }

    const fileSizeMb = (stat.size / (1024 * 1024)).toFixed(2);
    process.stdout.write(`${prefix} Uploading "${fileName}" (${fileSizeMb} MB)... `);

    try {
      await uploadFile(fileName, localFilePath);

      // Update in PostgreSQL
      await pool.query('UPDATE songs SET audio_url = $1 WHERE id = $2', [publicCloudUrl, song.id]);

      console.log(`✅ Done!`);
      existingObjects.add(fileName);
      successCount++;
    } catch (err) {
      console.log(`❌ Failed: ${err.message}`);
      errorCount++;
    }
  }

  console.log('\n===========================================================');
  console.log('🎉 MIGRATION SUMMARY');
  console.log('===========================================================');
  console.log(`✅ Successfully uploaded and updated: ${successCount}`);
  console.log(`⚠️ Skipped:                           ${skippedCount}`);
  console.log(`❌ Failed uploads:                    ${errorCount}`);
  console.log('===========================================================');

  await pool.end();
}

runMigration().catch(err => {
  console.error('\nFatal migration error:', err);
  process.exit(1);
});
