import sequelize from '../config/database';
import { QueryTypes } from 'sequelize';
import fs from 'fs';
import path from 'path';

async function createNewsletterTable() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Check if table already exists
    const [tableExists] = await sequelize.query(
      `SELECT table_name 
       FROM information_schema.tables 
       WHERE table_schema = 'public' 
       AND table_name = 'newsletter_subscriptions'`,
      { type: QueryTypes.SELECT }
    );

    if (tableExists) {
      console.log('⚠️  Table newsletter_subscriptions already exists. Skipping creation.');
      return;
    }

    console.log('📝 Creating newsletter_subscriptions table...');
    const migrationSqlPath = path.join(__dirname, '../migrations/023_create_newsletter_subscriptions.sql');
    const migrationSql = fs.readFileSync(migrationSqlPath, 'utf8');
    await sequelize.query(migrationSql);
    
    console.log('✅ Table newsletter_subscriptions created successfully');
    console.log('✅ Indexes created successfully');

  } catch (error) {
    console.error('❌ Failed to create newsletter_subscriptions table:', error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

createNewsletterTable();








