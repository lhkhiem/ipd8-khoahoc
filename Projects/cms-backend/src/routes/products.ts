import { Router } from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/auth';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  publishProduct,
  duplicateProduct,
  getFeaturedProducts,
  getBestSellers,
  importProducts
} from '../controllers/productController';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/best-sellers', getBestSellers);
router.get('/:id', getProductById);

// Protected routes
router.post('/import', authMiddleware, upload.single('file'), importProducts);
router.post('/', authMiddleware, createProduct);
router.put('/:id', authMiddleware, updateProduct);
router.patch('/:id', authMiddleware, updateProduct);
router.delete('/:id', authMiddleware, deleteProduct);
router.post('/:id/publish', authMiddleware, publishProduct);
router.post('/:id/duplicate', authMiddleware, duplicateProduct);

export default router;
