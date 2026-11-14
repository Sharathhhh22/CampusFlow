import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend/.env if available
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const connectionString = process.env.DATABASE_URL;

async function runMigrations() {
  console.log('🚀 [CampusFlow Migration] Starting database migration runner...');

  if (!connectionString) {
    console.error('❌ [CampusFlow Migration] Error: DATABASE_URL environment variable is not defined.');
    console.log('👉 Please set DATABASE_URL in backend/.env with your Supabase direct PostgreSQL connection string.');
    console.log('   Example: postgresql://postgres.your-ref:your-pass@aws-0-region.pooler.supabase.com:6543/postgres');
    process.exit(1);
  }

  const client = new pg.Client({
    connectionString,
    ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL database.');

    // Ensure migration tracking table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS _schema_migrations (
        version TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    const migrationsDir = path.resolve(__dirname, '../../supabase/migrations');
    if (!fs.existsSync(migrationsDir)) {
      console.warn(`⚠️ Migrations directory not found at ${migrationsDir}`);
      await client.end();
      return;
    }

    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    console.log(`📁 Found ${files.length} migration file(s).`);

    for (const file of files) {
      const { rows } = await client.query(
        'SELECT version FROM _schema_migrations WHERE version = $1',
        [file]
      );

      if (rows.length > 0) {
        console.log(`⏩ [Skipped] Migration already applied: ${file}`);
        continue;
      }

      console.log(`⏳ [Applying] Migration: ${file}...`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');

      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query(
          'INSERT INTO _schema_migrations (version, applied_at) VALUES ($1, NOW())',
          [file]
        );
        await client.query('COMMIT');
        console.log(`✅ [Applied] Successfully executed: ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`❌ [Failed] Error applying migration ${file}:`, err.message);
        throw err;
      }
    }

    console.log('🎉 [CampusFlow Migration] All migrations executed successfully.');
  } catch (error) {
    console.error('💥 Migration runner failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();

