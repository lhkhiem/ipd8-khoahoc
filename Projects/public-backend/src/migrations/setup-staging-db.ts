/**
 * Setup Staging Database Script
 * - Kiểm tra database staging có tồn tại không
 * - Tạo database nếu chưa có
 * - Hữu ích để setup staging environment
 */

import '../utils/loadEnv';
import { Pool } from 'pg';

// Connect to postgres database (default) để tạo database mới
const adminPool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: 'postgres', // Connect to default postgres database
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

const stagingDbName = process.env.DB_NAME || 'ipd8_db_staging';

async function setupStagingDatabase() {
  const client = await adminPool.connect();

  try {
    console.log('===========================================');
    console.log('Setup Staging Database');
    console.log('===========================================');
    console.log(`Target database: ${stagingDbName}`);
    console.log(`Host: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`User: ${process.env.DB_USER || 'postgres'}`);
    console.log('===========================================\n');

    // Step 1: Test connection
    console.log('Step 1: Testing database connection...');
    try {
      const result = await client.query('SELECT version()');
      console.log('✓ Connected to PostgreSQL');
      console.log(`  Version: ${result.rows[0].version.split(' ')[0]} ${result.rows[0].version.split(' ')[1]}\n`);
    } catch (error: any) {
      console.error('✗ Connection failed:', error.message);
      console.error('\n💡 Troubleshooting:');
      console.error('  1. Check DB_HOST, DB_PORT, DB_USER, DB_PASSWORD in .env.local');
      console.error('  2. Ensure PostgreSQL is running');
      console.error('  3. Verify user has permission to create databases');
      process.exit(1);
    }

    // Step 2: Check if database exists
    console.log('Step 2: Checking if database exists...');
    try {
      const checkResult = await client.query(
        `SELECT 1 FROM pg_database WHERE datname = $1`,
        [stagingDbName]
      );

      if (checkResult.rows.length > 0) {
        console.log(`✓ Database '${stagingDbName}' already exists\n`);
        
        // Check if database has tables
        const stagingPool = new Pool({
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432'),
          database: stagingDbName,
          user: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD || '',
        });
        const stagingClient = await stagingPool.connect();

        try {
          const tablesResult = await stagingClient.query(`
            SELECT COUNT(*) as count
            FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_type = 'BASE TABLE'
          `);
          const tableCount = parseInt(tablesResult.rows[0].count);
          console.log(`  Current tables: ${tableCount}`);
          
          if (tableCount > 0) {
            console.log(`  ⚠️  Database already has ${tableCount} tables`);
            console.log(`  💡 If you want to start fresh, drop and recreate the database`);
          } else {
            console.log(`  ✓ Database is empty, ready for migration`);
          }
        } catch (error: any) {
          console.log(`  ⚠️  Could not check tables: ${error.message}`);
        } finally {
          stagingClient.release();
          await stagingPool.end();
        }

        console.log('\n✅ Database is ready for migration!');
        return;
      } else {
        console.log(`✗ Database '${stagingDbName}' does not exist\n`);
      }
    } catch (error: any) {
      console.error('✗ Error checking database:', error.message);
      process.exit(1);
    }

    // Step 3: Create database
    console.log('Step 3: Creating staging database...');
    try {
      // Terminate existing connections to the database (if any)
      await client.query(`
        SELECT pg_terminate_backend(pid)
        FROM pg_stat_activity
        WHERE datname = $1 AND pid <> pg_backend_pid()
      `, [stagingDbName]);

      // Create database
      await client.query(`CREATE DATABASE ${stagingDbName}`);
      console.log(`✓ Database '${stagingDbName}' created successfully\n`);
    } catch (error: any) {
      if (error.code === '42P04') {
        console.log(`✓ Database '${stagingDbName}' already exists (created by another process)\n`);
      } else {
        console.error('✗ Error creating database:', error.message);
        console.error('\n💡 Troubleshooting:');
        console.error('  1. Ensure user has CREATEDB privilege');
        console.error('  2. Check if database name is valid');
        process.exit(1);
      }
    }

    // Step 4: Verify database
    console.log('Step 4: Verifying database...');
    const verifyPool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: stagingDbName,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
    });
    const verifyClient = await verifyPool.connect();

    try {
      await verifyClient.query('SELECT 1');
      console.log(`✓ Successfully connected to '${stagingDbName}'\n`);
    } catch (error: any) {
      console.error('✗ Error verifying database:', error.message);
      process.exit(1);
    } finally {
      verifyClient.release();
      await verifyPool.end();
    }

    console.log('===========================================');
    console.log('✅ Staging database setup complete!');
    console.log('===========================================');
    console.log('\nNext steps:');
    console.log('1. Run test migration: npm run migrate:test');
    console.log('2. Backup database (optional): npm run migrate:backup');
    console.log('3. Run migration: npm run migrate');
    console.log('===========================================');

  } catch (error: any) {
    console.error('\n===========================================');
    console.error('✗ Setup failed');
    console.error('===========================================');
    console.error('Error:', error.message);
    if (error.detail) {
      console.error('Detail:', error.detail);
    }
    process.exit(1);
  } finally {
    client.release();
    await adminPool.end();
  }
}

setupStagingDatabase();

