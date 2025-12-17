import express from 'express';
import * as wishlistController from '../controllers/wishlistController';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

// All wishlist routes - require auth
router.get('/', authMiddleware, wishlistController.getWishlist);
router.post('/add', authMiddleware, wishlistController.addToWishlist);
router.delete('/:user_id/:product_id', authMiddleware, wishlistController.removeFromWishlist);
router.get('/check', authMiddleware, wishlistController.checkWishlist);

export default router;

















