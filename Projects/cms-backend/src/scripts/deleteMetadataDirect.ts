/**
 * Script to delete specific metadata from page_metadata table directly
 * Usage: npx ts-node src/scripts/deleteMetadataDirect.ts
 */

import sequelize from '../config/database';
import { QueryTypes } from 'sequelize';

async function deleteMetadata() {
  try {
    const pathToDelete = '/products/dau-massage-banyco-copy-copy';
    
    console.log(`🗑️  Attempting to delete metadata for path: ${pathToDelete}`);
    
    // First, check if the metadata exists
    const [existing] = await sequelize.query(
      `SELECT id, path, title, auto_generated 
       FROM page_metadata 
       WHERE path = :path`,
      {
        type: QueryTypes.SELECT,
        replacements: { path: pathToDelete },
      }
    ) as any[];
    
    if (!existing) {
      console.log(`❌ No metadata found for path: ${pathToDelete}`);
      console.log(`\n📋 Checking for similar paths...`);
      
      // Check for similar paths
      const similar = await sequelize.query(
        `SELECT id, path, title, auto_generated 
         FROM page_metadata 
         WHERE path LIKE '%dau-massage-banyco%'
         ORDER BY path`,
        {
          type: QueryTypes.SELECT,
        }
      ) as any[];
      
      if (similar.length > 0) {
        console.log(`\n📋 Found ${similar.length} similar metadata entries:`);
        similar.forEach((m) => {
          console.log(`   - ${m.path} (id: ${m.id}, auto: ${m.auto_generated})`);
        });
      }
      
      await sequelize.close();
      return;
    }
    
    console.log(`\n📋 Found metadata:`);
    console.log(`   ID: ${existing.id}`);
    console.log(`   Path: ${existing.path}`);
    console.log(`   Title: ${existing.title}`);
    console.log(`   Auto-generated: ${existing.auto_generated}`);
    
    // Delete the metadata
    const result: any = await sequelize.query(
      `DELETE FROM page_metadata 
       WHERE path = :path 
       RETURNING id, path`,
      {
        replacements: { path: pathToDelete },
      }
    ) as [any[], unknown];
    
    if (result && result[0] && result[0].length > 0) {
      console.log(`\n✅ Successfully deleted metadata:`);
      console.log(`   ID: ${result[0].id}`);
      console.log(`   Path: ${result[0].path}`);
    } else {
      console.log(`\n⚠️  Delete query executed but no rows were deleted`);
    }
    
    // Verify deletion
    const [verify] = await sequelize.query(
      `SELECT COUNT(*) as count 
       FROM page_metadata 
       WHERE path = :path`,
      {
        type: QueryTypes.SELECT,
        replacements: { path: pathToDelete },
      }
    ) as any[];
    
    if (verify && verify.count === 0) {
      console.log(`\n✅ Verification: Metadata successfully removed from database`);
    } else {
      console.log(`\n⚠️  Verification: Metadata still exists (count: ${verify?.count})`);
    }
    
  } catch (error: any) {
    console.error('❌ Error deleting metadata:', error);
    console.error('   Message:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

deleteMetadata();







