import PageMetadata from '../models/PageMetadata';
import Asset from '../models/Asset';
import { stripHtmlAndDecode, normalizeSlug } from './metadataHelpers';

/**
 * Normalize path to match how it's stored in database
 */
function normalizePath(path: string): string {
  if (!path) return '';
  
  if (path.startsWith('/posts/')) {
    const slug = path.replace('/posts/', '');
    return `/posts/${normalizeSlug(slug)}`;
  }
  
  // For other paths, return as-is
  return path;
}

/**
 * Sync post metadata to page_metadata table
 * This function is called automatically when a post is created or updated.
 * It will only update if the metadata is auto-generated (not custom).
 */
export async function syncPostMetadataToCMS(post: any) {
  try {
    // Normalize slug to match frontend normalization
    const normalizedSlug = normalizeSlug(post.slug || '');
    const path = normalizePath(`/posts/${normalizedSlug}`);

    console.log(`[syncPostMetadata] Starting sync for path: ${path}`);

    // Check if custom metadata exists (not auto-generated)
    const existing = await PageMetadata.findOne({
      where: { path },
    });

    // If custom metadata exists (not auto-generated), don't override
    if (existing && existing.auto_generated === false) {
      console.log(`[syncPostMetadata] Skipping ${path} - has custom metadata (not auto-generated)`);
      return; // Keep custom metadata, don't override
    }

    // Load cover image
    let coverUrl = '';
    if (post.cover_asset_id) {
      const coverAsset = await Asset.findByPk(post.cover_asset_id);
      if (coverAsset) {
        coverUrl = (coverAsset as any).cdn_url || (coverAsset as any).url || '';
      }
    }

    // Load tags
    let tagNames: string[] = [];
    try {
      const tags = await (post as any).getTags?.() || [];
      tagNames = tags.map((t: any) => t.name || '').filter(Boolean);
    } catch (err) {
      console.warn('[syncPostMetadata] Could not load tags:', err);
    }

    // Create/update auto-generated metadata
    // Clean description: strip HTML and decode entities
    let description = post.excerpt || post.title || '';
    description = stripHtmlAndDecode(description);
    if (description.length > 160) {
      description = description.substring(0, 157) + '...';
    }
    
    const metadataData = {
      path,
      title: post.title || '',
      description: description,
      og_image: coverUrl,
      keywords: tagNames.length > 0 ? tagNames : null,
      enabled: true,
      auto_generated: true,
    };

    if (existing) {
      // Update existing (only if auto-generated)
      if (existing.auto_generated === true) {
        await existing.update(metadataData);
        console.log(`[syncPostMetadata] Updated existing post page: ${path}`);
      }
    } else {
      // Create new
      await PageMetadata.create(metadataData);
      console.log(`[syncPostMetadata] Created new post page: ${path}`);
    }
  } catch (error: any) {
    console.error('[syncPostMetadata] Error:', error);
    // Don't throw error to avoid breaking post creation/update
  }
}
