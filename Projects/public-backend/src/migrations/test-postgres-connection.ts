/**
 * Test PostgreSQL Connection
 * - Test connection với postgres user
 * - Giúp verify password trước khi tạo user
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

async function testConnection() {
  console.log('===========================================');
  console.log('Test PostgreSQL Connection');
  console.log('===========================================\n');

  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = parseInt(process.env.DB_PORT || '5432');

  console.log('Testing connection to:');
  console.log(`  Host: ${dbHost}`);
  console.log(`  Port: ${dbPort}`);
  console.log(`  User: postgres\n`);

  // Thử nhiều lần nếu password sai
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    const password = await promptPassword(
      attempts === 0 
        ? 'Enter PostgreSQL (postgres) password: '
        : `Password incorrect. Try again (${attempts + 1}/${maxAttempts}): `
    );

    const pool = new Pool({
      host: dbHost,
      port: dbPort,
      database: 'postgres',
      user: 'postgres',
      password: password,
    });

    try {
      const client = await pool.connect();
      try {
        const result = await client.query('SELECT version(), current_user');
        console.log('\n✅ Connection successful!\n');
        console.log('PostgreSQL Version:', result.rows[0].version);
        console.log('Current User:', result.rows[0].current_user);
        console.log('\n✅ Password is correct!');
        console.log('   You can now run: npm run migrate:create-user-only\n');
        
        await pool.end();
        process.exit(0);
      } finally {
        client.release();
        await pool.end();
      }
    } catch (error: any) {
      attempts++;
      
      if (error.code === '28P01') {
        if (attempts >= maxAttempts) {
          console.error('\n❌ Authentication failed after', maxAttempts, 'attempts');
          console.error('\n💡 Troubleshooting:');
          console.error('  1. Verify PostgreSQL is running');
          console.error('  2. Check if password is correct');
          console.error('  3. Try connecting with pgAdmin or psql');
          console.error('  4. Check pg_hba.conf for authentication method');
          process.exit(1);
        }
        console.error('❌ Password incorrect. Please try again.\n');
      } else if (error.code === 'ECONNREFUSED') {
        console.error('\n❌ Connection refused');
        console.error('   PostgreSQL may not be running on', dbHost + ':' + dbPort);
        console.error('\n💡 Check:');
        console.error('  1. PostgreSQL service is running');
        console.error('  2. Host and port are correct');
        process.exit(1);
      } else {
        console.error('\n❌ Error:', error.message);
        if (error.code) {
          console.error('   Error code:', error.code);
        }
        process.exit(1);
      }
    }
  }
}

testConnection();










