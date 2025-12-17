import fs from 'fs';
import path from 'path';
import sequelize from '../config/database';

async function runMigration(migrationFile: string) {
  try {
    const sqlPath = path.join(__dirname, '../migrations', migrationFile);
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log(`Running migration: ${migrationFile}...`);
    await sequelize.query(sql);
    console.log(`✅ Migration completed: ${migrationFile}`);
  } catch (error) {
    console.error(`❌ Migration failed: ${migrationFile}`, error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

const migrationFile = process.argv[2] || '011_topics_tags.sql';
runMigration(migrationFile);

