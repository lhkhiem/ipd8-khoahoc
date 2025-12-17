import express from 'express';

import {
  listPublishedPosts,
  getPublishedPostBySlug,
} from '../controllers/public/postController';

const router = express.Router();

router.get('/', listPublishedPosts);
router.get('/slug/:slug', getPublishedPostBySlug);

export default router;


