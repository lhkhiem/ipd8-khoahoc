import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getProductAttributes,
  getProductAttributeById,
  createProductAttribute,
  updateProductAttribute,
  deleteProductAttribute,
} from '../controllers/productAttributeController';

const router = Router();

router.get('/', getProductAttributes);
router.get('/:id', getProductAttributeById);
router.post('/', authMiddleware, createProductAttribute);
router.put('/:id', authMiddleware, updateProductAttribute);
router.patch('/:id', authMiddleware, updateProductAttribute);
router.delete('/:id', authMiddleware, deleteProductAttribute);

export default router;




