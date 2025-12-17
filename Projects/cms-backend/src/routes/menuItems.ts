import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  updateMenuItemsOrder
} from '../controllers/menuItemController';

const router = Router();

router.get('/', getMenuItems);
router.get('/:id', getMenuItemById);
router.post('/', authMiddleware, createMenuItem);
router.put('/:id', authMiddleware, updateMenuItem);
router.patch('/:id', authMiddleware, updateMenuItem);
router.delete('/:id', authMiddleware, deleteMenuItem);
router.post('/bulk/update-order', authMiddleware, updateMenuItemsOrder);

export default router;






































