// Public User Routes
// Customer account management endpoints

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import * as userController from '../controllers/public/userController';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Profile routes
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);

// Address routes
router.get('/addresses', userController.getAddresses);
router.post('/addresses', userController.addAddress);
router.put('/addresses/:id', userController.updateAddress);
router.delete('/addresses/:id', userController.deleteAddress);

// Wishlist routes
router.get('/wishlist', userController.getWishlist);
router.post('/wishlist/add', userController.addToWishlist);
router.delete('/wishlist/:id', userController.removeFromWishlist);

export default router;

