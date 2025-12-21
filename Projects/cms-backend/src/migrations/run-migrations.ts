// Load environment variables từ .env.local (phải import trước khi dùng process.env)
import '../utils/loadEnv';

import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

// SECURITY: Validate tất cả database config variables (theo yêu cầu kiến trúc)
// Tất cả thông tin database phải từ .env.local, không hardcode
if (!process.env.DB_HOST) {
  throw new Error('DB_HOST environment variable is required. Please set it in .env.local file.');
}
if (!process.env.DB_PORT) {
  throw new Error('DB_PORT environment variable is required. Please set it in .env.local file.');
}
if (!process.env.DB_USER) {
  throw new Error('DB_USER environment variable is required. Please set it in .env.local file.');
}
if (!process.env.DB_PASSWORD) {
  throw new Error('DB_PASSWORD environment variable is required. Please set it in .env.local file.');
}
if (!process.env.DB_NAME) {
  throw new Error('DB_NAME environment variable is required. Please set it in .env.local file.');
}

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function runMigrations() {
  try {
    console.log('Starting migrations...');

    // Ensure pgcrypto extension exists for gen_random_uuid()
    console.log('Ensuring pgcrypto extension...');
    await pool.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');

    // Discover and run all .sql migrations in this directory in lexical order
    const dir = __dirname;
    const files = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    if (files.length === 0) {
      console.log('No SQL migration files found. Nothing to do.');
      return;
    }

    for (const file of files) {
      const sqlPath = path.join(dir, file);
      const sql = fs.readFileSync(sqlPath, 'utf8');
      console.log(`Running migration: ${file}`);
      await pool.query(sql);
      console.log(`Completed: ${file}`);
    }

    console.log('Migrations completed successfully!');
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();