/**
 * Create Database User Only
 * - Chỉ tạo user PostgreSQL, không tạo database
 * - Hữu ích khi chỉ cần tạo user trước
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

async function createUserOnly() {
  console.log('===========================================');
  console.log('Create PostgreSQL User');
  console.log('===========================================\n');

  // Đọc thông tin từ .env.local
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = parseInt(process.env.DB_PORT || '5432');
  const dbUser = process.env.DB_USER || 'ipd8_user';
  const dbPassword = process.env.DB_PASSWORD || '';

  console.log('Configuration from .env.local:');
  console.log(`  DB_HOST: ${dbHost}`);
  console.log(`  DB_PORT: ${dbPort}`);
  console.log(`  DB_USER: ${dbUser}`);
  console.log(`  DB_PASSWORD: ${dbPassword ? '*** (set)' : '(not set)'}\n`);

  // Nếu DB_USER là 'postgres', không cần tạo
  if (dbUser === 'postgres') {
    console.log('ℹ️  Using default postgres user');
    console.log('   No need to create new user.\n');
    return;
  }

  // Cần password PostgreSQL superuser để tạo user
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
      
      // Kiểm tra xem user có quyền CREATEDB chưa
      const userInfo = await client.query(
        `SELECT rolcreatedb FROM pg_roles WHERE rolname = $1`,
        [dbUser]
      );
      
      if (userInfo.rows[0]?.rolcreatedb) {
        console.log(`✓ User '${dbUser}' has CREATEDB privilege\n`);
      } else {
        console.log(`⚠️  User '${dbUser}' exists but doesn't have CREATEDB privilege`);
        console.log('   Granting CREATEDB privilege...');
        const escapedUser = `"${dbUser.replace(/"/g, '""')}"`;
        await client.query(`ALTER USER ${escapedUser} WITH CREATEDB`);
        console.log(`✓ Granted CREATEDB privilege to '${dbUser}'\n`);
      }
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
        console.log(`✓ User '${dbUser}' created with password from .env.local`);
        console.log(`  Password: *** (from .env.local)\n`);
      } else {
        await client.query(`CREATE USER ${escapedUser} WITH CREATEDB`);
        console.log(`✓ User '${dbUser}' created (no password set)`);
        console.log(`  ⚠️  Please set password for user '${dbUser}' in PostgreSQL`);
        console.log(`  Run: ALTER USER ${escapedUser} WITH PASSWORD 'your_password';\n`);
      }
    }

    // Verify user có thể connect
    console.log('Step 3: Verifying user...');
    try {
      const verifyPool = new Pool({
        host: dbHost,
        port: dbPort,
        database: 'postgres',
        user: dbUser,
        password: dbPassword || '',
      });

      const verifyClient = await verifyPool.connect();
      try {
        await verifyClient.query('SELECT current_user');
        console.log(`✓ User '${dbUser}' can connect successfully\n`);
      } catch (error: any) {
        if (error.code === '28P01') {
          console.log(`⚠️  User '${dbUser}' created but cannot connect`);
          console.log(`   Password may be incorrect or not set\n`);
        } else {
          throw error;
        }
      } finally {
        verifyClient.release();
        await verifyPool.end();
      }
    } catch (error: any) {
      console.log(`⚠️  Could not verify user connection: ${error.message}\n`);
    }

    console.log('===========================================');
    console.log('✅ User setup complete!');
    console.log('===========================================');
    console.log(`\nUser: ${dbUser}`);
    console.log(`Host: ${dbHost}:${dbPort}`);
    console.log(`Password: ${dbPassword ? 'Set (from .env.local)' : 'Not set'}`);
    console.log('\nNext steps:');
    console.log('1. If password not set, set it: ALTER USER ' + dbUser + " WITH PASSWORD 'your_password';");
    console.log('2. Create staging database: npm run migrate:create-user');
    console.log('3. Or setup full: npm run migrate:create-user');
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

createUserOnly();

