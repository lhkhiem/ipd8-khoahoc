/**
 * Create Database User Script
 * - Tạo user PostgreSQL nếu chưa có
 * - Setup staging database
 * - Hỗ trợ nhập password PostgreSQL thủ công
 */

import '../utils/loadEnv';
import { Pool } from 'pg';
import * as readline from 'readline';

// Tạo interface để nhập password từ terminal
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

async function createDatabaseUser() {
  console.log('===========================================');
  console.log('Create Database User & Setup Staging DB');
  console.log('===========================================\n');

  // Đọc thông tin từ .env.local
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = parseInt(process.env.DB_PORT || '5432');
  const dbName = process.env.DB_NAME || 'ipd8_db_staging';
  const dbUser = process.env.DB_USER || 'postgres';
  const dbPassword = process.env.DB_PASSWORD || '';

  console.log('Configuration from .env.local:');
  console.log(`  DB_HOST: ${dbHost}`);
  console.log(`  DB_PORT: ${dbPort}`);
  console.log(`  DB_NAME: ${dbName}`);
  console.log(`  DB_USER: ${dbUser}`);
  console.log(`  DB_PASSWORD: ${dbPassword ? '*** (set)' : '(not set)'}\n`);

  // Nếu DB_USER là 'postgres', không cần tạo user mới
  if (dbUser === 'postgres') {
    console.log('ℹ️  Using default postgres user (superuser)');
    console.log('   No need to create new user.\n');
    
    // Cần postgres password để tạo database
    const postgresPassword = dbPassword || await promptPassword('Enter PostgreSQL (postgres) password: ');
    
    // Chỉ cần tạo database staging
    await setupStagingDatabase(dbHost, dbPort, dbName, dbUser, dbPassword, postgresPassword);
    return;
  }

  // Cần password PostgreSQL superuser để tạo user
  // Password trong .env.local là cho DB_USER, không phải postgres
  console.log('⚠️  Need PostgreSQL superuser (postgres) password to create user.');
  console.log('   This is different from DB_PASSWORD in .env.local\n');
  const postgresPassword = await promptPassword('Enter PostgreSQL superuser (postgres) password: ');

  // Connect với postgres user để tạo user mới
  const adminPool = new Pool({
    host: dbHost,
    port: dbPort,
    database: 'postgres',
    user: 'postgres',
    password: postgresPassword,
  });

  const client = await adminPool.connect();

  try {
    console.log('\nStep 1: Checking if user exists...');
    
    // Kiểm tra user đã tồn tại chưa
    const userCheck = await client.query(
      `SELECT 1 FROM pg_roles WHERE rolname = $1`,
      [dbUser]
    );

    if (userCheck.rows.length > 0) {
      console.log(`✓ User '${dbUser}' already exists\n`);
    } else {
      console.log(`✗ User '${dbUser}' does not exist\n`);
      console.log('Step 2: Creating user...');
      
      // Tạo user mới
      // PostgreSQL không hỗ trợ parameterized queries cho CREATE USER
      // Cần escape username và password đúng cách
      const userPassword = dbPassword || '';
      
      // Escape username và password để tránh SQL injection
      const escapedUser = client.escapeIdentifier ? 
        client.escapeIdentifier(dbUser) : 
        `"${dbUser.replace(/"/g, '""')}"`;
      
      if (userPassword) {
        // Escape password - replace single quotes với double single quotes
        const escapedPassword = userPassword.replace(/'/g, "''");
        await client.query(
          `CREATE USER ${escapedUser} WITH PASSWORD '${escapedPassword}' CREATEDB`
        );
        console.log(`✓ User '${dbUser}' created with password from .env.local\n`);
      } else {
        await client.query(`CREATE USER ${escapedUser} WITH CREATEDB`);
        console.log(`✓ User '${dbUser}' created (no password set)`);
        console.log(`  ⚠️  Please set password for user '${dbUser}' in PostgreSQL\n`);
      }
    }

    // Tạo database staging
    await setupStagingDatabase(dbHost, dbPort, dbName, dbUser, dbPassword, postgresPassword);

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
      process.exit(1);
    }
  } finally {
    client.release();
    await adminPool.end();
  }
}

async function setupStagingDatabase(
  host: string,
  port: number,
  dbName: string,
  user: string,
  userPassword: string,
  postgresPassword: string
) {
  console.log('\nStep 3: Setting up staging database...');
  
  // Connect với postgres database để tạo database mới (cần superuser)
  const adminPool = new Pool({
    host,
    port,
    database: 'postgres',
    user: 'postgres',
    password: postgresPassword, // Luôn dùng postgres password để tạo database
  });

  const adminClient = await adminPool.connect();

  try {
    // Kiểm tra database đã tồn tại chưa
    const dbCheck = await adminClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (dbCheck.rows.length > 0) {
      console.log(`✓ Database '${dbName}' already exists\n`);
    } else {
      // Terminate existing connections
      await adminClient.query(`
        SELECT pg_terminate_backend(pid)
        FROM pg_stat_activity
        WHERE datname = $1 AND pid <> pg_backend_pid()
      `, [dbName]);

      // Tạo database
      await adminClient.query(`CREATE DATABASE ${dbName}`);
      console.log(`✓ Database '${dbName}' created\n`);
    }

    // Grant privileges cho user (nếu không phải postgres)
    if (user !== 'postgres') {
      await adminClient.query(`GRANT ALL PRIVILEGES ON DATABASE ${dbName} TO ${user}`);
      console.log(`✓ Granted privileges to user '${user}'\n`);
    }

    // Verify connection với user mới tạo
    console.log('Step 4: Verifying connection...');
    const verifyPool = new Pool({
      host,
      port,
      database: dbName,
      user,
      password: userPassword, // Password của user mới tạo
    });

    const verifyClient = await verifyPool.connect();
    try {
      await verifyClient.query('SELECT version()');
      console.log(`✓ Successfully connected to '${dbName}' with user '${user}'\n`);
    } finally {
      verifyClient.release();
      await verifyPool.end();
    }

    console.log('===========================================');
    console.log('✅ Setup complete!');
    console.log('===========================================');
    console.log('\nNext steps:');
    console.log('1. Run test migration: npm run migrate:test');
    console.log('2. Run migration: npm run migrate');
    console.log('===========================================');

  } catch (error: any) {
    if (error.code === '28P01') {
      console.error('\n✗ Authentication failed');
      console.error('   Need PostgreSQL superuser password to create database');
      console.error('\n💡 Options:');
      console.error('   1. Use postgres user in .env.local');
      console.error('   2. Or enter PostgreSQL password when prompted');
      process.exit(1);
    } else {
      console.error('\n✗ Error:', error.message);
      if (error.detail) {
        console.error('   Detail:', error.detail);
      }
      process.exit(1);
    }
  } finally {
    adminClient.release();
    await adminPool.end();
  }
}

createDatabaseUser();

