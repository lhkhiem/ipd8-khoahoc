import sequelize from '../config/database';
import * as fs from 'fs';
import * as path from 'path';

async function runInventoryMigration() {
  try {
    console.log('Running inventory management migration...');
    
    const sqlPath = path.join(__dirname, '040_inventory_management.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Executing SQL...');
    await sequelize.query(sql);
    
    console.log('✅ Migration 040_inventory_management.sql completed successfully!');
    
    // Verify tables were created
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('stock_movements', 'stock_settings')
    `);
    
    console.log('Created tables:', tables);
    
  } catch (error: any) {
    console.error('❌ Migration error:', error.message);
    if (error.original) {
      console.error('Original error:', error.original.message);
    }
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

runInventoryMigration();








