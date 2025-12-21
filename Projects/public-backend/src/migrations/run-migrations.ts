/**
 * Migration Runner for IPD8 Database
 * - Runs SQL migration files in order
 * - Database dùng chung với CMS Backend (cùng ipd8_db)
 */

// Load environment variables từ .env.local (phải import trước khi dùng process.env)
import '../utils/loadEnv';

import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

// SECURITY: Validate tất cả database config variables
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

// Database connection - dùng chung với CMS Backend
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('===========================================');
    console.log('IPD8 Database Migration');
    console.log('===========================================');
    console.log(`Database: ${process.env.DB_NAME}`);
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log('===========================================\n');

    // Start transaction
    await client.query('BEGIN');

    // Ensure extensions
    console.log('Ensuring PostgreSQL extensions...');
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    await client.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');
    console.log('✓ Extensions ready\n');

    // Discover and run all .sql migrations in this directory in lexical order
    const dir = __dirname;
    const files = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith('.sql') && f.match(/^\d{3}_/)) // Only numbered migration files
      .sort();

    if (files.length === 0) {
      console.log('⚠️  No SQL migration files found. Nothing to do.');
      return;
    }

    console.log(`Found ${files.length} migration file(s):\n`);

    for (const file of files) {
      const sqlPath = path.join(dir, file);
      const sql = fs.readFileSync(sqlPath, 'utf8');
      
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`Running migration: ${file}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      
      try {
        await client.query(sql);
        console.log(`✓ Completed: ${file}\n`);
      } catch (error: any) {
        console.error(`✗ Error in ${file}:`, error.message);
        throw error;
      }
    }

    // Commit transaction
    await client.query('COMMIT');
    
    console.log('===========================================');
    console.log('✓ All migrations completed successfully!');
    console.log('===========================================');
  } catch (error: any) {
    // Rollback on error
    await client.query('ROLLBACK');
    console.error('\n===========================================');
    console.error('✗ Migration failed - Transaction rolled back');
    console.error('===========================================');
    console.error('Error:', error.message);
    if (error.detail) {
      console.error('Detail:', error.detail);
    }
    if (error.hint) {
      console.error('Hint:', error.hint);
    }
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();


