import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  checkCategoryRelationships,
} from '../controllers/productCategoryController';

const router = Router();

// Must be before /:id to avoid route conflicts
router.get('/slug/:slug', getCategoryBySlug);
router.get('/:id/relationships', authMiddleware, checkCategoryRelationships);
router.get('/:id', getCategoryById);
router.get('/', getCategories);
router.post('/', authMiddleware, createCategory);
router.put('/:id', authMiddleware, updateCategory);
router.delete('/:id', authMiddleware, deleteCategory);

export default router;
