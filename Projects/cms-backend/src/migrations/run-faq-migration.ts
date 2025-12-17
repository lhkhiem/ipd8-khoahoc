import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
// Load environment variables từ .env.local (phải import trước khi dùng process.env)
import '../utils/loadEnv';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'banyco',
  user: process.env.DB_USER || 'spa_cms_user',
  password: process.env.DB_PASSWORD || 'spa_cms_password',
});

async function runFAQMigration() {
  try {
    console.log('Running FAQ migration...');

    // Ensure pgcrypto extension exists for gen_random_uuid()
    console.log('Ensuring pgcrypto extension...');
    await pool.query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');

    const sqlPath = path.join(__dirname, '043_create_faq_tables.sql');
    
    if (!fs.existsSync(sqlPath)) {
      console.error(`Migration file not found: ${sqlPath}`);
      process.exit(1);
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log('Running: 043_create_faq_tables.sql');
    await pool.query(sql);
    console.log('✅ FAQ migration completed successfully!');
    console.log('Tables created:');
    console.log('  - faq_categories');
    console.log('  - faq_questions');
  } catch (error: any) {
    console.error('❌ Error running FAQ migration:', error.message);
    if (error.code === '42P07') {
      console.log('Note: Tables may already exist. This is safe to ignore.');
    } else {
      process.exit(1);
    }
  } finally {
    await pool.end();
  }
}

runFAQMigration();




