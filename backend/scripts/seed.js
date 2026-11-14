import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const connectionString = process.env.DATABASE_URL;

async function runSeed() {
  console.log('🌱 [CampusFlow Seed] Starting database seeding...');

  if (!connectionString) {
    console.error('❌ [CampusFlow Seed] Error: DATABASE_URL is not defined in backend/.env.');
    process.exit(1);
  }

  const client = new pg.Client({
    connectionString,
    ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database.');

    const seedFile = path.resolve(__dirname, '../../supabase/seed.sql');
    if (!fs.existsSync(seedFile)) {
      console.error(`❌ Seed file not found at: ${seedFile}`);
      process.exit(1);
    }

    const sql = fs.readFileSync(seedFile, 'utf-8');
    console.log('⏳ Executing seed queries...');
    await client.query(sql);
    console.log('🎉 [CampusFlow Seed] Seeding completed successfully!');
  } catch (err) {
    console.error('💥 Seeding error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runSeed();

