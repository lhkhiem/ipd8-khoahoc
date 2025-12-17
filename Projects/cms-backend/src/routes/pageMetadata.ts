import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getAllPageMetadata,
  getPageMetadata,
  savePageMetadata,
  deletePageMetadata,
} from '../controllers/pageMetadataController';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get all page metadata
router.get('/', getAllPageMetadata);

// Get single page metadata
router.get('/:path(*)', getPageMetadata);

// Create or update page metadata
router.post('/', savePageMetadata);
router.put('/:path(*)', savePageMetadata);
router.patch('/:path(*)', savePageMetadata);

// Delete page metadata
router.delete('/:path(*)', deletePageMetadata);

export default router;








