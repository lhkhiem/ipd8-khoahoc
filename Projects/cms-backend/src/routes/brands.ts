import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getBrands,
  getBrandById,
  getBrandBySlug,
  createBrand,
  updateBrand,
  deleteBrand
} from '../controllers/brandController';

const router = Router();

router.get('/', getBrands);
router.get('/slug/:slug', getBrandBySlug);
router.get('/:id', getBrandById);
router.post('/', authMiddleware, createBrand);
router.put('/:id', authMiddleware, updateBrand);
router.delete('/:id', authMiddleware, deleteBrand);

export default router;
