/**
 * Create Staging Database Only
 * - Chỉ tạo database staging, không tạo user
 * - User phải đã tồn tại trước
 */

import '../utils/loadEnv';
import { Pool } from 'pg';
import * as readline from 'readline';

function promptPassword(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function createDatabaseOnly() {
  console.log('===========================================');
  console.log('Create Staging Database');
  console.log('===========================================\n');

  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = parseInt(process.env.DB_PORT || '5432');
  const dbName = process.env.DB_NAME || 'ipd8_db_staging';
  const dbUser = process.env.DB_USER || 'ipd8_user';
  const dbPassword = process.env.DB_PASSWORD || '';

  console.log('Configuration from .env.local:');
  console.log(`  DB_HOST: ${dbHost}`);
  console.log(`  DB_PORT: ${dbPort}`);
  console.log(`  DB_NAME: ${dbName}`);
  console.log(`  DB_USER: ${dbUser}`);
  console.log(`  DB_PASSWORD: ${dbPassword ? '*** (set)' : '(not set)'}\n`);

  // Cần password PostgreSQL superuser để tạo database
  console.log('⚠️  Need PostgreSQL superuser (postgres) password to create database.');
  const postgresPassword = await promptPassword('Enter PostgreSQL superuser (postgres) password: ');

  // Connect với postgres user để tạo database
  const adminPool = new Pool({
    host: dbHost,
    port: dbPort,
    database: 'postgres',
    user: 'postgres',
    password: postgresPassword,
  });

  const client = await adminPool.connect();

  try {
    console.log('\nStep 1: Checking if database exists...');
    
    // Kiểm tra database đã tồn tại chưa
    const dbCheck = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (dbCheck.rows.length > 0) {
      console.log(`✓ Database '${dbName}' already exists\n`);
    } else {
      console.log(`✗ Database '${dbName}' does not exist\n`);
      console.log('Step 2: Creating database...');
      
      // Terminate existing connections (nếu có)
      try {
        await client.query(`
          SELECT pg_terminate_backend(pid)
          FROM pg_stat_activity
          WHERE datname = $1 AND pid <> pg_backend_pid()
        `, [dbName]);
      } catch (error) {
        // Ignore errors if no connections exist
      }

      // Tạo database
      const escapedDbName = `"${dbName.replace(/"/g, '""')}"`;
      await client.query(`CREATE DATABASE ${escapedDbName}`);
      console.log(`✓ Database '${dbName}' created\n`);
    }

    // Grant privileges cho user (nếu không phải postgres)
    if (dbUser !== 'postgres') {
      console.log('Step 3: Granting privileges...');
      const escapedUser = `"${dbUser.replace(/"/g, '""')}"`;
      const escapedDbName = `"${dbName.replace(/"/g, '""')}"`;
      
      // Grant database privileges
      await client.query(`GRANT ALL PRIVILEGES ON DATABASE ${escapedDbName} TO ${escapedUser}`);
      console.log(`✓ Granted database privileges to user '${dbUser}'`);
      
      // Grant schema privileges - cần connect vào database mới tạo
      const schemaPool = new Pool({
        host: dbHost,
        port: dbPort,
        database: dbName,
        user: 'postgres',
        password: postgresPassword,
      });
      
      const schemaClient = await schemaPool.connect();
      try {
        // Grant usage và create trên schema public
        await schemaClient.query(`GRANT USAGE ON SCHEMA public TO ${escapedUser}`);
        await schemaClient.query(`GRANT CREATE ON SCHEMA public TO ${escapedUser}`);
        
        // Grant all privileges trên schema public
        await schemaClient.query(`GRANT ALL PRIVILEGES ON SCHEMA public TO ${escapedUser}`);
        
        // Grant default privileges cho future tables
        await schemaClient.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ${escapedUser}`);
        await schemaClient.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ${escapedUser}`);
        
        console.log(`✓ Granted schema privileges to user '${dbUser}'\n`);
      } finally {
        schemaClient.release();
        await schemaPool.end();
      }
    }

    // Verify connection với user
    console.log('Step 4: Verifying connection...');
    const verifyPool = new Pool({
      host: dbHost,
      port: dbPort,
      database: dbName,
      user: dbUser,
      password: dbPassword,
    });

    const verifyClient = await verifyPool.connect();
    try {
      const result = await verifyClient.query('SELECT version(), current_database(), current_user');
      console.log(`✓ Successfully connected to '${dbName}'`);
      console.log(`  Database: ${result.rows[0].current_database}`);
      console.log(`  User: ${result.rows[0].current_user}\n`);
    } catch (error: any) {
      if (error.code === '28P01') {
        console.log(`⚠️  Database created but cannot connect with user '${dbUser}'`);
        console.log(`   Password may be incorrect\n`);
      } else {
        throw error;
      }
    } finally {
      verifyClient.release();
      await verifyPool.end();
    }

    console.log('===========================================');
    console.log('✅ Database setup complete!');
    console.log('===========================================');
    console.log(`\nDatabase: ${dbName}`);
    console.log(`User: ${dbUser}`);
    console.log(`Host: ${dbHost}:${dbPort}`);
    console.log('\nNext steps:');
    console.log('1. Test migration: npm run migrate:test');
    console.log('2. Run migration: npm run migrate');
    console.log('===========================================');

  } catch (error: any) {
    if (error.code === '28P01') {
      console.error('\n✗ Authentication failed');
      console.error('   PostgreSQL password is incorrect');
      console.error('\n💡 Please run again and enter correct password');
      process.exit(1);
    } else {
      console.error('\n✗ Error:', error.message);
      if (error.detail) {
        console.error('   Detail:', error.detail);
      }
      if (error.hint) {
        console.error('   Hint:', error.hint);
      }
      process.exit(1);
    }
  } finally {
    client.release();
    await adminPool.end();
  }
}

createDatabaseOnly();

