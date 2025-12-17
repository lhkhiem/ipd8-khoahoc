import express from 'express';
import * as reviewController from '../controllers/productReviewController';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Admin routes - get all reviews
router.get('/', authMiddleware, reviewController.getAllReviews);

// Public routes
router.get('/product/:product_id', reviewController.getProductReviews);
router.post('/', reviewController.createReview);

// Protected routes - require auth
router.put('/:id', authMiddleware, reviewController.updateReview);
router.delete('/:id', authMiddleware, reviewController.deleteReview);
router.post('/:id/react', authMiddleware, reviewController.reactToReview);

export default router;




