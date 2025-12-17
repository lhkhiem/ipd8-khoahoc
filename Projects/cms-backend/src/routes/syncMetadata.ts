import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import sequelize from '../config/database';
import Post from '../models/Post';
import Asset from '../models/Asset';
import Tag from '../models/Tag';
import { syncPostMetadataToCMS } from '../utils/postMetadataSync';
import { syncProductMetadataToCMS } from '../utils/productMetadataSync';

const router = Router();

/**
 * POST /api/sync-metadata
 * Sync metadata for all existing posts and products
 * Requires authentication
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    console.log('[syncMetadata] Starting metadata sync...');

    // 1. Sync all posts
    const posts = await Post.findAll({
      include: [
        { model: Asset, as: 'cover_asset', attributes: ['id', 'url', 'cdn_url'] },
        { model: Tag, as: 'tags', attributes: ['id', 'name'] },
      ],
    });

    let postsSynced = 0;
    for (const post of posts) {
      try {
        await syncPostMetadataToCMS(post);
        postsSynced++;
      } catch (error) {
        console.error(`[syncMetadata] Error syncing post ${(post as any).slug}:`, error);
      }
    }

    // 2. Sync all products
    const productsQuery = `
      SELECT 
        p.*,
        b.name as brand_name,
        (SELECT string_agg(pc.name, ', ') 
         FROM product_categories pc
         JOIN product_product_categories ppc ON pc.id = ppc.category_id
         WHERE ppc.product_id = p.id) as category_name
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      ORDER BY p.created_at DESC
    `;
    const products: any[] = await sequelize.query(productsQuery, {
      type: 'SELECT' as any,
    });

    let productsSynced = 0;
    for (const product of products) {
      try {
        await syncProductMetadataToCMS(product);
        productsSynced++;
      } catch (error) {
        console.error(`[syncMetadata] Error syncing product ${product.slug}:`, error);
      }
    }

    res.json({
      success: true,
      message: 'Metadata sync completed',
      stats: {
        posts: { synced: postsSynced, total: posts.length },
        products: { synced: productsSynced, total: products.length },
      },
    });
  } catch (error: any) {
    console.error('[syncMetadata] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sync metadata',
      message: error.message,
    });
  }
});

export default router;



