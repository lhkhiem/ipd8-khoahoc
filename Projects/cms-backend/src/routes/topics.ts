import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getTopics,
  getTopicById,
  createTopic,
  updateTopic,
  deleteTopic,
  updateTopicsOrder
} from '../controllers/topicController';

const router = Router();

router.get('/', getTopics);
router.get('/:id', getTopicById);
router.post('/', authMiddleware, createTopic);
router.put('/:id', authMiddleware, updateTopic);
router.patch('/:id', authMiddleware, updateTopic);
router.delete('/:id', authMiddleware, deleteTopic);
router.post('/bulk/update-order', authMiddleware, updateTopicsOrder);

export default router;
