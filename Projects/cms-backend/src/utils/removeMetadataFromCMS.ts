import PageMetadata from '../models/PageMetadata';
import { normalizeSlug } from './metadataHelpers';
import sequelize from '../config/database';
import { Op } from 'sequelize';

/**
 * Normalize path to match how it's stored in database
 */
function normalizePath(path: string): string {
  if (!path) return '';
  
  // Extract slug from path if it's a product/post path
  if (path.startsWith('/products/')) {
    const slug = path.replace('/products/', '');
    return `/products/${normalizeSlug(slug)}`;
  }
  
  if (path.startsWith('/posts/')) {
    const slug = path.replace('/posts/', '');
    return `/posts/${normalizeSlug(slug)}`;
  }
  
  // For other paths, return as-is
  return path;
}

/**
 * Extract base slug from path (without copy suffixes)
 * Example: /products/dau-massage-banyco-copy-copy -> dau-massage-banyco
 */
function extractBaseSlug(path: string): string | null {
  if (!path) return null;
  
  if (path.startsWith('/products/')) {
    const slug = path.replace('/products/', '');
    // Remove common copy suffixes: -copy, -copy-copy, etc.
    const baseSlug = slug.replace(/-copy(-copy)*$/i, '');
    return baseSlug;
  }
  
  if (path.startsWith('/posts/')) {
    const slug = path.replace('/posts/', '');
    const baseSlug = slug.replace(/-copy(-copy)*$/i, '');
    return baseSlug;
  }
  
  return null;
}

/**
 * Remove metadata from page_metadata table when post/product is deleted
 * This function removes:
 * 1. The exact path metadata
 * 2. All related metadata (including copies like -copy, -copy-copy, etc.)
 */
export async function removeMetadataFromCMS(path: string) {
  try {
    // Normalize path to match how it's stored
    const normalizedPath = normalizePath(path);
    console.log(`[removeMetadataFromCMS] Removing metadata for path: ${path} (normalized: ${normalizedPath})`);
    
    // Extract base slug to find all related metadata (including copies)
    const baseSlug = extractBaseSlug(normalizedPath);
    let deletedCount = 0;
    
    if (baseSlug && normalizedPath.startsWith('/products/')) {
      // Find all metadata that matches base slug or its copies
      // This will match: /products/dau-massage-banyco, /products/dau-massage-banyco-copy, etc.
      const basePath = `/products/${baseSlug}`;
      
      // Find exact match and copies (ending with -copy, -copy-copy, etc.)
      const allRelated = await PageMetadata.findAll({
        where: {
          path: {
            [Op.or]: [
              { [Op.eq]: basePath }, // Exact match
              { [Op.like]: `${basePath}-copy` }, // Single copy
              { [Op.like]: `${basePath}-copy-%` }, // Multiple copies (copy-copy, copy-copy-copy, etc.)
            ],
          },
        },
      });
      
      if (allRelated.length > 0) {
        // Delete all related metadata
        const pathsToDelete = allRelated.map((p) => p.path);
        deletedCount = await PageMetadata.destroy({
          where: {
            path: {
              [Op.in]: pathsToDelete,
            },
          },
        });
        
        console.log(`[removeMetadataFromCMS] Removed ${deletedCount} metadata entries for paths: ${pathsToDelete.join(', ')}`);
      }
    } else if (baseSlug && normalizedPath.startsWith('/posts/')) {
      // Same logic for posts
      const basePath = `/posts/${baseSlug}`;
      
      const allRelated = await PageMetadata.findAll({
        where: {
          path: {
            [Op.or]: [
              { [Op.eq]: basePath }, // Exact match
              { [Op.like]: `${basePath}-copy` }, // Single copy
              { [Op.like]: `${basePath}-copy-%` }, // Multiple copies
            ],
          },
        },
      });
      
      if (allRelated.length > 0) {
        const pathsToDelete = allRelated.map((p) => p.path);
        deletedCount = await PageMetadata.destroy({
          where: {
            path: {
              [Op.in]: pathsToDelete,
            },
          },
        });
        
        console.log(`[removeMetadataFromCMS] Removed ${deletedCount} metadata entries for paths: ${pathsToDelete.join(', ')}`);
      }
    } else {
      // For other paths, delete exact match only
      deletedCount = await PageMetadata.destroy({
        where: { path: normalizedPath },
      });
      
      if (deletedCount > 0) {
        console.log(`[removeMetadataFromCMS] Successfully removed metadata for ${normalizedPath}`);
      } else {
        console.warn(`[removeMetadataFromCMS] No metadata found to remove for path: ${normalizedPath}`);
      }
    }
    
    if (deletedCount === 0) {
      console.warn(`[removeMetadataFromCMS] No metadata found to remove for path: ${normalizedPath}`);
    }
  } catch (error: any) {
    console.error('[removeMetadataFromCMS] Error:', error);
    // Don't throw error to avoid breaking deletion
  }
}
