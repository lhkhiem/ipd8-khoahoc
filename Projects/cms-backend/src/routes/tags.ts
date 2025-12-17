import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getTags,
  getTagById,
  createTag,
  updateTag,
  deleteTag
} from '../controllers/tagController';

const router = Router();

router.get('/', getTags);
router.get('/:id', getTagById);
router.post('/', authMiddleware, createTag);
router.put('/:id', authMiddleware, updateTag);
router.patch('/:id', authMiddleware, updateTag);
router.delete('/:id', authMiddleware, deleteTag);

export default router;
