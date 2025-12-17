/**
 * Script to delete specific metadata from page_metadata table
 * Usage: npx ts-node src/scripts/deleteMetadata.ts
 */

import sequelize from '../config/database';
import PageMetadata from '../models/PageMetadata';
import { normalizeSlug } from '../utils/metadataHelpers';
import { Op } from 'sequelize';

async function deleteMetadata() {
  try {
    const pathToDelete = '/products/dau-massage-banyco-copy-copy';
    
    // Normalize the path
    const normalizedPath = pathToDelete.startsWith('/products/')
      ? `/products/${normalizeSlug(pathToDelete.replace('/products/', ''))}`
      : pathToDelete;
    
    console.log(`🗑️  Attempting to delete metadata for path: ${pathToDelete}`);
    console.log(`   Normalized path: ${normalizedPath}`);
    
    // Find the metadata
    const metadata = await PageMetadata.findOne({
      where: { path: normalizedPath },
    });
    
    if (!metadata) {
      console.log(`❌ No metadata found for path: ${normalizedPath}`);
      console.log(`   Checking for similar paths...`);
      
      // Check for similar paths
      const similar = await PageMetadata.findAll({
        where: {
          path: {
            [Op.like]: '%dau-massage-banyco%',
          },
        },
      });
      
      if (similar.length > 0) {
        console.log(`\n📋 Found ${similar.length} similar metadata entries:`);
        similar.forEach((m) => {
          console.log(`   - ${m.path} (id: ${m.id})`);
        });
      }
      
      return;
    }
    
    console.log(`\n📋 Found metadata:`);
    console.log(`   ID: ${metadata.id}`);
    console.log(`   Path: ${metadata.path}`);
    console.log(`   Title: ${metadata.title}`);
    console.log(`   Auto-generated: ${metadata.auto_generated}`);
    
    // Delete the metadata
    await metadata.destroy();
    
    console.log(`\n✅ Successfully deleted metadata for path: ${normalizedPath}`);
    
  } catch (error: any) {
    console.error('❌ Error deleting metadata:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

deleteMetadata();







