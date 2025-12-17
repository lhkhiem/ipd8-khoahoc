import sequelize from '../config/database';
import * as fs from 'fs';
import * as path from 'path';

// List of new migrations to run
const newMigrations = [
  '012_shopping_cart.sql',
  '013_orders.sql',
  '014_wishlist.sql',
  '015_product_reviews.sql',
];

async function runNewMigrations() {
  try {
    console.log('Running new e-commerce migrations...');

    for (const fileName of newMigrations) {
      const sqlPath = path.join(__dirname, fileName);
      
      if (!fs.existsSync(sqlPath)) {
        console.log(`Skipping ${fileName} (file not found)`);
        continue;
      }

      const sql = fs.readFileSync(sqlPath, 'utf8');
      console.log(`Running: ${fileName}`);
      
      await sequelize.query(sql);
      console.log(`Completed: ${fileName}`);
    }

    console.log('All new migrations completed successfully!');
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

runNewMigrations();

















