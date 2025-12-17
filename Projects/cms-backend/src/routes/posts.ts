// Routes cho các endpoint liên quan đến Post
// - Tất cả route dưới /api/posts dành cho CMS (yêu cầu auth)
// - Public client sử dụng /api/public/posts

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getPosts,
  getPostById,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
  publishPost,
} from '../controllers/postController';

const router = Router();

router.use(authMiddleware);

router.get('/', getPosts);
router.get('/slug/:slug', getPostBySlug); // Must come before /:id to avoid conflict
router.get('/:id', getPostById);
router.post('/', createPost);
router.patch('/:id', updatePost);
router.delete('/:id', deletePost);
router.post('/:id/publish', publishPost);

export default router;

