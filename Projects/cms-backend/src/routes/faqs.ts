import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getFAQCategories,
  getFAQCategoryById,
  createFAQCategory,
  updateFAQCategory,
  deleteFAQCategory,
  getFAQQuestions,
  getFAQQuestionById,
  createFAQQuestion,
  updateFAQQuestion,
  deleteFAQQuestion,
  getFAQsWithCategories,
} from '../controllers/faqController';

const router = Router();

// Public routes (no auth required)
router.get('/public', getFAQsWithCategories);

// Category routes
router.get('/categories', authMiddleware, getFAQCategories);
router.get('/categories/:id', authMiddleware, getFAQCategoryById);
router.post('/categories', authMiddleware, createFAQCategory);
router.put('/categories/:id', authMiddleware, updateFAQCategory);
router.patch('/categories/:id', authMiddleware, updateFAQCategory);
router.delete('/categories/:id', authMiddleware, deleteFAQCategory);

// Question routes
router.get('/questions', authMiddleware, getFAQQuestions);
router.get('/questions/:id', authMiddleware, getFAQQuestionById);
router.post('/questions', authMiddleware, createFAQQuestion);
router.put('/questions/:id', authMiddleware, updateFAQQuestion);
router.patch('/questions/:id', authMiddleware, updateFAQQuestion);
router.delete('/questions/:id', authMiddleware, deleteFAQQuestion);

export default router;




