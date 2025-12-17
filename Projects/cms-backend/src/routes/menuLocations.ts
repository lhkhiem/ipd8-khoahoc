import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getMenuLocations,
  getMenuLocationById,
  createMenuLocation,
  updateMenuLocation,
  deleteMenuLocation
} from '../controllers/menuLocationController';

const router = Router();

router.get('/', getMenuLocations);
router.get('/:id', getMenuLocationById);
router.post('/', authMiddleware, createMenuLocation);
router.put('/:id', authMiddleware, updateMenuLocation);
router.patch('/:id', authMiddleware, updateMenuLocation);
router.delete('/:id', authMiddleware, deleteMenuLocation);

export default router;






































