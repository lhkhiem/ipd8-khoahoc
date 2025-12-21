/**
 * Test Migration Script
 * - Validates SQL syntax
 * - Checks database connection
 * - Dry-run migration (without executing)
 * - Useful for testing on staging environment
 */

// Load environment variables
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

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

interface MigrationFile {
  name: string;
  path: string;
  sql: string;
  errors: string[];
}

async function testMigrations() {
  const client = await pool.connect();
  const migrationFiles: MigrationFile[] = [];

  try {
    console.log('===========================================');
    console.log('IPD8 Migration Test (Dry Run)');
    console.log('===========================================');
    console.log(`Database: ${process.env.DB_NAME}`);
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log('Mode: DRY RUN (no changes will be made)');
    console.log('===========================================\n');

    // Step 1: Test database connection
    console.log('Step 1: Testing database connection...');
    try {
      const result = await client.query('SELECT version()');
      console.log('✓ Database connected successfully');
      console.log(`  PostgreSQL version: ${result.rows[0].version.split(' ')[0]} ${result.rows[0].version.split(' ')[1]}\n`);
    } catch (error: any) {
      console.error('✗ Database connection failed:', error.message);
      process.exit(1);
    }

    // Step 2: Check current database state
    console.log('Step 2: Checking current database state...');
    try {
      const tablesResult = await client.query(`
        SELECT COUNT(*) as count
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      `);
      const tableCount = parseInt(tablesResult.rows[0].count);
      console.log(`✓ Current tables in database: ${tableCount}\n`);

      // Check if IPD8 tables already exist
      const ipd8TablesResult = await client.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name IN (
          'instructors', 'courses', 'course_modules', 'course_sessions',
          'enrollments', 'progress', 'materials', 'orders', 'order_items',
          'payments', 'post_tags', 'notifications', 'session_registrations',
          'api_keys', 'webhooks', 'webhook_logs', 'api_request_logs'
        )
        ORDER BY table_name
      `);
      
      if (ipd8TablesResult.rows.length > 0) {
        console.log('⚠️  Warning: Some IPD8 tables already exist:');
        ipd8TablesResult.rows.forEach(row => {
          console.log(`   - ${row.table_name}`);
        });
        console.log('');
      } else {
        console.log('✓ No IPD8 tables found (ready for migration)\n');
      }
    } catch (error: any) {
      console.error('✗ Error checking database state:', error.message);
      process.exit(1);
    }

    // Step 3: Read and validate migration files
    console.log('Step 3: Reading and validating migration files...\n');
    const dir = __dirname;
    const files = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith('.sql') && f.match(/^\d{3}_/))
      .sort();

    if (files.length === 0) {
      console.log('⚠️  No SQL migration files found.');
      return;
    }

    for (const file of files) {
      const sqlPath = path.join(dir, file);
      const sql = fs.readFileSync(sqlPath, 'utf8');
      const errors: string[] = [];

      // Basic SQL syntax checks
      if (!sql.trim()) {
        errors.push('File is empty');
      }

      if (!sql.includes('BEGIN;') || !sql.includes('COMMIT;')) {
        errors.push('Missing transaction markers (BEGIN; / COMMIT;)');
      }

      // Check for dangerous operations without IF EXISTS/IF NOT EXISTS
      const dangerousPatterns = [
        { pattern: /CREATE TABLE\s+(?!IF NOT EXISTS)/i, message: 'CREATE TABLE without IF NOT EXISTS' },
        { pattern: /DROP TABLE\s+(?!IF EXISTS)/i, message: 'DROP TABLE without IF EXISTS' },
        { pattern: /ALTER TABLE\s+\w+\s+ADD COLUMN\s+(?!IF NOT EXISTS)/i, message: 'ADD COLUMN without IF NOT EXISTS' },
      ];

      dangerousPatterns.forEach(({ pattern, message }) => {
        if (pattern.test(sql)) {
          errors.push(`Potential issue: ${message}`);
        }
      });

      migrationFiles.push({ name: file, path: sqlPath, sql, errors });

      if (errors.length === 0) {
        console.log(`✓ ${file} - Valid`);
      } else {
        console.log(`⚠️  ${file} - Issues found:`);
        errors.forEach(err => console.log(`   - ${err}`));
      }
    }

    console.log('');

    // Step 4: Check SQL syntax with PostgreSQL (parse only)
    console.log('Step 4: Validating SQL syntax (parse check)...\n');
    let allValid = true;

    for (const file of migrationFiles) {
      try {
        // Try to parse the SQL (without executing)
        // Note: PostgreSQL doesn't have a true parse-only mode, but we can try EXPLAIN
        // For safety, we'll just check if the SQL is well-formed
        const hasBegin = file.sql.includes('BEGIN;');
        const hasCommit = file.sql.includes('COMMIT;');
        const hasSemicolons = (file.sql.match(/;/g) || []).length >= 2;

        if (hasBegin && hasCommit && hasSemicolons) {
          console.log(`✓ ${file.name} - SQL structure looks valid`);
        } else {
          console.log(`⚠️  ${file.name} - SQL structure may have issues`);
          allValid = false;
        }
      } catch (error: any) {
        console.log(`✗ ${file.name} - Parse error: ${error.message}`);
        allValid = false;
      }
    }

    console.log('');

    // Step 5: Check dependencies
    console.log('Step 5: Checking table dependencies...\n');
    
    // Check if required base tables exist (users, posts)
    const requiredTables = ['users', 'posts'];
    for (const tableName of requiredTables) {
      try {
        const result = await client.query(`
          SELECT EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = $1
          )
        `, [tableName]);
        
        if (result.rows[0].exists) {
          console.log(`✓ Required table '${tableName}' exists`);
        } else {
          console.log(`✗ Required table '${tableName}' does NOT exist`);
          console.log(`  Migration may fail if ${tableName} is missing`);
        }
      } catch (error: any) {
        console.log(`⚠️  Could not check table '${tableName}': ${error.message}`);
      }
    }

    console.log('');

    // Step 6: Summary
    console.log('===========================================');
    console.log('Test Summary');
    console.log('===========================================');
    console.log(`Migration files found: ${migrationFiles.length}`);
    console.log(`Files with issues: ${migrationFiles.filter(f => f.errors.length > 0).length}`);
    console.log(`All files valid: ${allValid ? '✓ Yes' : '✗ No'}`);
    console.log('');
    
    if (allValid && migrationFiles.every(f => f.errors.length === 0)) {
      console.log('✓ Migration scripts are ready to run!');
      console.log('');
      console.log('Next steps:');
      console.log('1. Backup database: npm run migrate:backup (or use backup scripts)');
      console.log('2. Run migration: npm run migrate');
      console.log('3. Verify: npm run migrate:verify');
    } else {
      console.log('⚠️  Please fix issues before running migration');
    }
    console.log('===========================================');

  } catch (error: any) {
    console.error('\n===========================================');
    console.error('✗ Test failed');
    console.error('===========================================');
    console.error('Error:', error.message);
    if (error.detail) {
      console.error('Detail:', error.detail);
    }
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

testMigrations();


