// Load environment variables từ .env.local (phải import trước khi dùng process.env)
import '../utils/loadEnv';

import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const filename = process.argv[2];

if (!filename) {
  console.error('Usage: ts-node run-single.ts <migration-file.sql>');
  process.exit(1);
}

const sqlPath = path.join(__dirname, filename);

if (!fs.existsSync(sqlPath)) {
  console.error(`Migration file not found: ${sqlPath}`);
  process.exit(1);
}

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'banyco',
  user: process.env.DB_USER || 'spa_cms_user',
  password: process.env.DB_PASSWORD || 'spa_cms_password',
});

async function runSingle() {
  try {
    console.log(`Running migration: ${filename}`);
    await pool.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    await pool.query(sql);
    console.log(`Completed: ${filename}`);
  } catch (error) {
    console.error(`Error running migration ${filename}:`, error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runSingle();

