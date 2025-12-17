import sequelize from '../config/database';

/**
 * Create page_metadata table using Sequelize
 */
async function createPageMetadataTable() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Check if table already exists
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'page_metadata'
    `) as any[];

    if (tables && tables.length > 0) {
      console.log('⚠️  Table page_metadata already exists');
      return;
    }

    // Create table
    console.log('📝 Creating page_metadata table...');
    
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS page_metadata (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        path VARCHAR(500) NOT NULL UNIQUE,
        title VARCHAR(500),
        description TEXT,
        og_image VARCHAR(1000),
        keywords TEXT[],
        enabled BOOLEAN DEFAULT TRUE,
        auto_generated BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_page_metadata_path ON page_metadata(path)
    `);

    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS idx_page_metadata_auto_generated ON page_metadata(auto_generated)
    `);

    console.log('✅ Table page_metadata created successfully');
    console.log('✅ Indexes created successfully');

    await sequelize.close();
  } catch (error: any) {
    console.error('❌ Failed to create table:', error);
    process.exit(1);
  }
}

// Run
createPageMetadataTable();








