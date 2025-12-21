/**
 * Test Database Connection
 * Verify database credentials from .env.local
 */

import '../utils/loadEnv';
import { Sequelize } from 'sequelize';

// SECURITY: Validate tất cả database config variables
if (!process.env.DB_HOST) {
  throw new Error('DB_HOST environment variable is required. Please set it in .env.local file.');
}
if (!process.env.DB_PORT) {
  throw new Error('DB_PORT environment variable is required. Please set it in .env.local file.');
}
if (!process.env.DB_USER) {
  throw new Error('DB_USER environment variable is required. Please set it in .env.local file.');
}
if (!process.env.DB_PASSWORD) {
  throw new Error('DB_PASSWORD environment variable is required. Please set it in .env.local file.');
}
if (!process.env.DB_NAME) {
  throw new Error('DB_NAME environment variable is required. Please set it in .env.local file.');
}

const sequelize = new Sequelize({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  dialect: 'postgres',
  logging: false,
});

async function testConnection() {
  try {
    console.log('Testing database connection...');
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`Port: ${process.env.DB_PORT}`);
    console.log(`Database: ${process.env.DB_NAME}`);
    console.log(`User: ${process.env.DB_USER}`);
    console.log(`Password: ${process.env.DB_PASSWORD ? '***' : 'NOT SET'}`);
    console.log('');

    await sequelize.authenticate();
    console.log('✅ Database connection successful!');
    
    // Test query
    const [results] = await sequelize.query('SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = \'public\'');
    const count = (results as any[])[0]?.count || 0;
    console.log(`✅ Database has ${count} tables`);
    
    await sequelize.close();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Database connection failed!');
    console.error(`Error: ${error.message}`);
    
    if (error.original?.code === '28P01') {
      console.error('');
      console.error('💡 Password authentication failed!');
      console.error('   Please check:');
      console.error('   1. DB_USER in .env.local is correct');
      console.error('   2. DB_PASSWORD in .env.local is correct');
      console.error('   3. User has permission to access the database');
    } else if (error.original?.code === '3D000') {
      console.error('');
      console.error('💡 Database does not exist!');
      console.error(`   Database "${process.env.DB_NAME}" not found`);
    } else if (error.original?.code === 'ECONNREFUSED') {
      console.error('');
      console.error('💡 Cannot connect to database server!');
      console.error('   Please check:');
      console.error('   1. PostgreSQL is running');
      console.error('   2. DB_HOST and DB_PORT are correct');
    }
    
    await sequelize.close();
    process.exit(1);
  }
}

testConnection();

