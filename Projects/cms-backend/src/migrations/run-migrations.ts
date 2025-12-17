// Load environment variables từ .env.local (phải import trước khi dùng process.env)
import '../utils/loadEnv';

import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

// Provide sensible defaults to match backend config/database.ts
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'banyco',
  user: process.env.DB_USER || 'spa_cms_user',
  password: process.env.DB_PASSWORD || 'spa_cms_password',
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