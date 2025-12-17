import sequelize from '../config/database';
import { QueryTypes } from 'sequelize';
import fs from 'fs';
import path from 'path';

async function addDeletedAtToOrders() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Check if column already exists
    const [columnExists] = await sequelize.query(
      `SELECT column_name 
       FROM information_schema.columns 
       WHERE table_schema = 'public' 
       AND table_name = 'orders' 
       AND column_name = 'deleted_at'`,
      { type: QueryTypes.SELECT }
    );

    if (columnExists) {
      console.log('⚠️  Column deleted_at already exists. Skipping.');
      return;
    }

    console.log('📝 Adding deleted_at column to orders table...');
    
    // Add column
    await sequelize.query(`
      ALTER TABLE orders 
      ADD COLUMN deleted_at TIMESTAMP NULL;
    `);

    // Create index
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_deleted_at ON orders(deleted_at) WHERE deleted_at IS NULL;
    `);

    console.log('✅ Column deleted_at added successfully');
    console.log('✅ Index created successfully');

  } catch (error) {
    console.error('❌ Failed to add deleted_at column:', error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

addDeletedAtToOrders();








