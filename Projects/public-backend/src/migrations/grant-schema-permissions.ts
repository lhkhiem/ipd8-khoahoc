/**
 * Grant Schema Permissions
 * - Grant permissions on schema public for existing database
 * - Useful if permissions were not set correctly
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

async function grantSchemaPermissions() {
  console.log('===========================================');
  console.log('Grant Schema Permissions');
  console.log('===========================================\n');

  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = parseInt(process.env.DB_PORT || '5432');
  const dbName = process.env.DB_NAME || 'ipd8_db_staging';
  const dbUser = process.env.DB_USER || 'ipd8_user';

  console.log('Configuration from .env.local:');
  console.log(`  DB_HOST: ${dbHost}`);
  console.log(`  DB_PORT: ${dbPort}`);
  console.log(`  DB_NAME: ${dbName}`);
  console.log(`  DB_USER: ${dbUser}\n`);

  if (dbUser === 'postgres') {
    console.log('ℹ️  Using postgres user (superuser)');
    console.log('   No need to grant permissions.\n');
    return;
  }

  // Cần password PostgreSQL superuser
  console.log('⚠️  Need PostgreSQL superuser (postgres) password to grant permissions.');
  const postgresPassword = await promptPassword('Enter PostgreSQL superuser (postgres) password: ');

  // Connect với postgres user vào database
  const pool = new Pool({
    host: dbHost,
    port: dbPort,
    database: dbName,
    user: 'postgres',
    password: postgresPassword,
  });

  const client = await pool.connect();

  try {
    console.log('\nGranting permissions on schema public...');
    
    const escapedUser = `"${dbUser.replace(/"/g, '""')}"`;
    
    // Grant usage và create trên schema public
    await client.query(`GRANT USAGE ON SCHEMA public TO ${escapedUser}`);
    await client.query(`GRANT CREATE ON SCHEMA public TO ${escapedUser}`);
    
    // Grant all privileges trên schema public
    await client.query(`GRANT ALL PRIVILEGES ON SCHEMA public TO ${escapedUser}`);
    
    // Grant privileges on existing tables (nếu có)
    await client.query(`
      GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ${escapedUser}
    `);
    
    // Grant privileges on existing sequences (nếu có)
    await client.query(`
      GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ${escapedUser}
    `);
    
    // Grant default privileges cho future tables
    await client.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ${escapedUser}`);
    await client.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ${escapedUser}`);
    
    console.log(`✓ Granted all permissions to user '${dbUser}' on schema public\n`);

    // Verify
    console.log('Verifying permissions...');
    const verifyResult = await client.query(`
      SELECT 
        has_schema_privilege($1, 'public', 'USAGE') as has_usage,
        has_schema_privilege($1, 'public', 'CREATE') as has_create
    `, [dbUser]);
    
    const hasUsage = verifyResult.rows[0]?.has_usage;
    const hasCreate = verifyResult.rows[0]?.has_create;
    
    if (hasUsage && hasCreate) {
      console.log(`✓ User '${dbUser}' has USAGE and CREATE privileges on schema public\n`);
    } else {
      console.log(`⚠️  Permissions may not be fully granted\n`);
    }

    console.log('===========================================');
    console.log('✅ Permissions granted successfully!');
    console.log('===========================================');
    console.log('\nNext steps:');
    console.log('1. Test migration: npm run migrate:test');
    console.log('2. Run migration: npm run migrate');
    console.log('===========================================');

  } catch (error: any) {
    if (error.code === '28P01') {
      console.error('\n✗ Authentication failed');
      console.error('   PostgreSQL password is incorrect');
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
    await pool.end();
  }
}

grantSchemaPermissions();






















