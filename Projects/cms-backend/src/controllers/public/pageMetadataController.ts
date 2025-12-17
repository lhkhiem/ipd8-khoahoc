import { Request, Response } from 'express';
import PageMetadata from '../../models/PageMetadata';
import { normalizeSlug } from '../../utils/metadataHelpers';

// In-memory cache for page metadata (5 minutes TTL)
interface CacheEntry {
  data: any;
  timestamp: number;
}

const metadataCache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Cleanup old cache entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of metadataCache.entries()) {
    if (now - entry.timestamp > CACHE_TTL) {
      metadataCache.delete(key);
    }
  }
}, 10 * 60 * 1000);

/**
 * Normalize path for comparison
 */
function normalizePathForComparison(pathToNormalize: string): string {
  if (!pathToNormalize) return '/';
  
  // Remove trailing slash (except for root)
  let normalized = pathToNormalize.replace(/\/+$/, '') || '/';
  
  // Extract slug from path (e.g., /posts/slug-name -> slug-name)
  const pathParts = normalized.split('/');
  if (pathParts.length >= 3) {
    // Has prefix and slug (e.g., /posts/slug-name)
    const prefix = pathParts.slice(0, -1).join('/'); // /posts
    const slug = pathParts[pathParts.length - 1]; // slug-name
    
    // Normalize slug
    const normalizedSlug = normalizeSlug(slug);
    normalized = `${prefix}/${normalizedSlug}`;
  } else if (pathParts.length === 2 && pathParts[1]) {
    // Has slug only (e.g., /slug-name)
    const slug = pathParts[1];
    const normalizedSlug = normalizeSlug(slug);
    normalized = `/${normalizedSlug}`;
  }
  
  return normalized || '/';
}

/**
 * Get page metadata from page_metadata table
 * Supports both static pages (/products, /about) and dynamic pages (/posts/slug, /products/slug)
 */
export const getPageMetadata = async (req: Request, res: Response) => {
  try {
    let { path } = req.params;
    
    // 1. Normalize path - ensure it starts with /
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    
    // Remove query params
    if (path.includes('?')) {
      path = path.split('?')[0];
    }
    
    // Remove trailing slash (except for root)
    path = path.replace(/\/+$/, '') || '/';
    
    // 2. Normalize path for comparison
    const normalizedRequestPath = normalizePathForComparison(path);
    
    // 3. Check cache first
    const cacheKey = normalizedRequestPath;
    const cached = metadataCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      // Return cached data with cache headers
      res.set('Cache-Control', 'public, max-age=300'); // 5 minutes
      return res.json(cached.data);
    }
    
    // 4. Try to find exact match from database
    const page = await PageMetadata.findOne({
      where: { 
        path: normalizedRequestPath,
        enabled: true,
      },
      attributes: ['title', 'description', 'og_image', 'keywords'], // Only select needed fields
    });

    // 5. If not found and it's home page, check if there's a page entry for '/'
    if (!page && (path === '/' || path === '')) {
      const homePage = await PageMetadata.findOne({
        where: { 
          path: '/',
          enabled: true,
        },
        attributes: ['title', 'description', 'og_image', 'keywords'],
      });
      
      if (homePage) {
        const result = {
          title: homePage.title || 'Banyco',
          description: homePage.description || '',
          ogImage: homePage.og_image || '',
          keywords: homePage.keywords || [],
        };
        
        // Cache the result
        metadataCache.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
        });
        
        res.set('Cache-Control', 'public, max-age=300');
        return res.json(result);
      }
      
      // No metadata found, return default (also cache this)
      const defaultResult = {
        title: 'Banyco',
        description: '',
        ogImage: '',
        keywords: [],
      };
      
      metadataCache.set(cacheKey, {
        data: defaultResult,
        timestamp: Date.now(),
      });
      
      res.set('Cache-Control', 'public, max-age=300');
      return res.json(defaultResult);
    }

    // 6. If found, return metadata
    if (page) {
      const result = {
        title: page.title || '',
        description: page.description || '',
        ogImage: page.og_image || '',
        keywords: page.keywords || [],
      };
      
      // Cache the result
      metadataCache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
      });
      
      res.set('Cache-Control', 'public, max-age=300');
      return res.json(result);
    }

    // 7. Not found - cache 404 for shorter time (1 minute) to avoid repeated DB queries
    const notFoundResult = { error: 'Page metadata not found' };
    metadataCache.set(cacheKey, {
      data: notFoundResult,
      timestamp: Date.now(),
    });
    
    res.set('Cache-Control', 'public, max-age=60'); // 1 minute for 404s
    res.status(404).json(notFoundResult);
  } catch (err) {
    console.error('[getPageMetadata] Error:', err);
    res.status(500).json({ error: 'Failed to load page metadata' });
  }
};
