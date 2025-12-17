import PageMetadata from '../models/PageMetadata';
import Asset from '../models/Asset';
import { stripHtmlAndDecode, normalizeSlug } from './metadataHelpers';

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
 * Sync product metadata to page_metadata table
 * This function is called automatically when a product is created or updated.
 * It will only update if the metadata is auto-generated (not custom).
 */
export async function syncProductMetadataToCMS(product: any) {
  try {
    // Normalize slug to match frontend normalization
    const normalizedSlug = normalizeSlug(product.slug || '');
    const path = normalizePath(`/products/${normalizedSlug}`);

    console.log(`[syncProductMetadata] Starting sync for path: ${path}`);

    // Check if custom metadata exists (not auto-generated)
    const existing = await PageMetadata.findOne({
      where: { path },
    });

    // If custom metadata exists (not auto-generated), don't override
    if (existing && existing.auto_generated === false) {
      console.log(`[syncProductMetadata] Skipping ${path} - has custom metadata (not auto-generated)`);
      return; // Keep custom metadata, don't override
    }

    // Load thumbnail image
    let thumbnailUrl = '';
    if (product.thumbnail_id) {
      const thumbnailAsset = await Asset.findByPk(product.thumbnail_id);
      if (thumbnailAsset) {
        thumbnailUrl = (thumbnailAsset as any).cdn_url || (thumbnailAsset as any).url || '';
      }
    }

    // Get description from product
    let description = product.description || '';
    if (!description && product.content) {
      if (typeof product.content === 'object' && product.content.meta?.description) {
        description = product.content.meta.description;
      } else if (typeof product.content === 'string') {
        description = product.content;
      }
    }
    if (!description) {
      description = product.name || '';
    }
    
    // Strip HTML and decode entities, limit to 160 characters for SEO
    description = stripHtmlAndDecode(description);
    if (description.length > 160) {
      description = description.substring(0, 157) + '...';
    }

    // Get keywords from brand and category
    const keywords: string[] = [];
    if (product.brand_name) {
      keywords.push(product.brand_name);
    }
    if (product.category_name) {
      keywords.push(product.category_name);
    }

    // Create/update auto-generated metadata
    const metadataData = {
      path,
      title: product.name || '',
      description: description,
      og_image: thumbnailUrl,
      keywords: keywords.length > 0 ? keywords : null,
      enabled: true,
      auto_generated: true,
    };

    if (existing) {
      // Update existing (only if auto-generated)
      if (existing.auto_generated === true) {
        await existing.update(metadataData);
        console.log(`[syncProductMetadata] Updated existing product page: ${path}`);
      }
    } else {
      // Create new
      await PageMetadata.create(metadataData);
      console.log(`[syncProductMetadata] Created new product page: ${path}`);
    }
  } catch (error: any) {
    console.error('[syncProductMetadata] Error:', error);
    // Don't throw error to avoid breaking product creation/update
  }
}
