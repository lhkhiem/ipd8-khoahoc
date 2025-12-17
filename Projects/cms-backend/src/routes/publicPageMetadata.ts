import { Router } from 'express';
import { getPageMetadata } from '../controllers/public/pageMetadataController';
import sequelize from '../config/database';

const router = Router();

// Debug endpoint to check all SEO data - MUST be before :path(*) route
router.get('/-debug-all', async (req, res) => {
  try {
    const [seoRow] = await sequelize.query(
      'SELECT value FROM settings WHERE namespace = :ns',
      {
        type: 'SELECT' as any,
        replacements: { ns: 'seo' },
      }
    ) as any[];

    const seoSettings = seoRow?.[0]?.value || { pages: [] };
    res.json(seoSettings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Public route - no auth required
// Path can include slashes, so we use :path(*) to match everything
router.get('/:path(*)', getPageMetadata);

export default router;

