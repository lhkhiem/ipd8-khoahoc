/**
 * Run a single migration file
 * Usage: ts-node src/migrations/run-single-migration.ts 003_update_user_roles.sql
 */

// Load environment variables từ .env.local
import '../utils/loadEnv';

import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

// Get migration file name from command line args
const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error('Usage: ts-node src/migrations/run-single-migration.ts <migration-file.sql>');
  process.exit(1);
}

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

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function runSingleMigration() {
  const client = await pool.connect();
  
  try {
    console.log('===========================================');
    console.log('IPD8 Database Migration - Single File');
    console.log('===========================================');
    console.log(`Database: ${process.env.DB_NAME}`);
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`Migration file: ${migrationFile}`);
    console.log('===========================================\n');

    // Start transaction
    await client.query('BEGIN');

    // Ensure extensions
    console.log('Ensuring PostgreSQL extensions...');
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    await client.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');
    console.log('✓ Extensions ready\n');

    // Read and run migration file
    const migrationPath = path.join(__dirname, migrationFile);
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${migrationPath}`);
    }

    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Running migration: ${migrationFile}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    
    try {
      await client.query(sql);
      console.log(`✓ Completed: ${migrationFile}\n`);
    } catch (error: any) {
      console.error(`✗ Error in ${migrationFile}:`, error.message);
      if (error.detail) {
        console.error('Detail:', error.detail);
      }
      if (error.hint) {
        console.error('Hint:', error.hint);
      }
      throw error;
    }

    // Commit transaction
    await client.query('COMMIT');
    
    console.log('===========================================');
    console.log('✓ Migration completed successfully!');
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

runSingleMigration();















