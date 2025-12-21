/**
 * Verify user roles migration
 */

import '../utils/loadEnv';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || '',
  user: process.env.DB_USER || '',
  password: process.env.DB_PASSWORD || '',
});

(async () => {
  const client = await pool.connect();
  try {
    console.log('===========================================');
    console.log('Verifying User Roles Migration');
    console.log('===========================================\n');

    // Check default value
    const res1 = await client.query(
      `SELECT column_default 
       FROM information_schema.columns 
       WHERE table_name = 'users' AND column_name = 'role'`
    );
    console.log('✓ Role default:', res1.rows[0]?.column_default || 'NULL');

    // Check constraints
    const res2 = await client.query(
      `SELECT conname, pg_get_constraintdef(oid) as definition 
       FROM pg_constraint 
       WHERE conrelid = 'users'::regclass 
       AND conname LIKE '%role%'`
    );
    console.log('\n✓ Role constraints:');
    res2.rows.forEach((r: any) => {
      console.log(`  - ${r.conname}: ${r.definition}`);
    });

    // Check current user roles
    const res3 = await client.query(
      `SELECT role, COUNT(*) as count 
       FROM users 
       GROUP BY role 
       ORDER BY role`
    );
    console.log('\n✓ Current user roles:');
    if (res3.rows.length === 0) {
      console.log('  (No users found)');
    } else {
      res3.rows.forEach((r: any) => {
        console.log(`  - ${r.role}: ${r.count} user(s)`);
      });
    }

    console.log('\n===========================================');
    console.log('✓ Verification completed!');
    console.log('===========================================');
  } finally {
    client.release();
    await pool.end();
  }
})();

