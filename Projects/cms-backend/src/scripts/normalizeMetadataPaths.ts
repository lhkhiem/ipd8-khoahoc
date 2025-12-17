/**
 * Script to normalize paths in existing metadata
 * This ensures all metadata paths match the normalized format used by the frontend
 * 
 * Usage: npx ts-node src/scripts/normalizeMetadataPaths.ts
 */

import sequelize from '../config/database';

const DEFAULTS = {
  seo: {
    home: { title: 'Banyco', description: '', ogImage: '', slug: '/' },
    pages: [],
  },
};

/**
 * Normalize slug in path to match frontend normalization
 */
function normalizeSlug(slug: string): string {
  if (!slug) return '';
  
  // Decode URL-encoded characters first
  try {
    slug = decodeURIComponent(slug);
  } catch (e) {
    // If decode fails, use original slug
  }
  
  return slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '-') // Replace special chars with dash
    .replace(/-+/g, '-') // Replace multiple dashes with single dash
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
}

/**
 * Normalize path to match frontend normalization
 */
function normalizePath(path: string): string {
  if (!path) return '/';
  
  // Remove trailing slash (except for root)
  let normalized = path.replace(/\/+$/, '') || '/';
  
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

async function normalizeMetadataPaths() {
  try {
    console.log('🚀 Starting metadata path normalization...\n');

    // 1. Fetch current SEO settings
    const [seoRow] = await sequelize.query(
      'SELECT value FROM settings WHERE namespace = :ns',
      {
        type: 'SELECT' as any,
        replacements: { ns: 'seo' },
      }
    ) as any[];

    const seoSettings = seoRow?.[0]?.value ?? DEFAULTS.seo;
    const existingPages = seoSettings.pages || [];

    if (existingPages.length === 0) {
      console.log('ℹ️  No metadata pages found. Nothing to normalize.');
      return;
    }

    console.log(`📋 Found ${existingPages.length} metadata entries\n`);

    // 2. Normalize paths and track changes
    let normalizedCount = 0;
    let unchangedCount = 0;
    const pathMap = new Map<string, string>(); // old path -> new path
    const duplicates: string[] = []; // paths that would create duplicates

    const normalizedPages = existingPages.map((page: any) => {
      const oldPath = page.path || '/';
      const newPath = normalizePath(oldPath);
      
      if (oldPath !== newPath) {
        console.log(`  ↻ Normalizing: "${oldPath}" → "${newPath}"`);
        normalizedCount++;
        pathMap.set(oldPath, newPath);
        
        // Check if new path already exists
        const existingWithNewPath = existingPages.find((p: any) => p.path === newPath && p !== page);
        if (existingWithNewPath) {
          duplicates.push(newPath);
          console.log(`    ⚠️  Warning: New path "${newPath}" already exists!`);
        }
      } else {
        unchangedCount++;
      }
      
      return {
        ...page,
        path: newPath,
      };
    });

    // 3. Handle duplicates by merging or removing
    if (duplicates.length > 0) {
      console.log(`\n⚠️  Found ${duplicates.length} duplicate paths after normalization:`);
      duplicates.forEach(dup => console.log(`    - ${dup}`));
      console.log('\n💡 Keeping the first entry for each duplicate path...\n');
      
      // Remove duplicates, keeping the first occurrence
      const seen = new Set<string>();
      const deduplicatedPages = normalizedPages.filter((page: any) => {
        if (seen.has(page.path)) {
          console.log(`  ✗ Removing duplicate: "${page.path}"`);
          return false;
        }
        seen.add(page.path);
        return true;
      });
      
      normalizedPages.length = 0;
      normalizedPages.push(...deduplicatedPages);
    }

    // 4. Save normalized metadata
    const updatedSettings = {
      ...seoSettings,
      pages: normalizedPages,
    };

    await sequelize.query(
      `INSERT INTO settings (namespace, value, updated_at)
       VALUES (:ns, :val::jsonb, NOW())
       ON CONFLICT (namespace) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
      {
        type: 'INSERT' as any,
        replacements: {
          ns: 'seo',
          val: JSON.stringify(updatedSettings),
        },
      }
    );

    console.log('\n✅ Metadata path normalization completed!');
    console.log(`   - Total entries: ${existingPages.length}`);
    console.log(`   - Normalized: ${normalizedCount}`);
    console.log(`   - Unchanged: ${unchangedCount}`);
    console.log(`   - Duplicates removed: ${duplicates.length}`);
    console.log('\n💡 All metadata paths are now normalized and ready to use!');
  } catch (error) {
    console.error('❌ Error normalizing metadata paths:', error);
    throw error;
  }
}

// Run the script
normalizeMetadataPaths()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await sequelize.close();
  });














