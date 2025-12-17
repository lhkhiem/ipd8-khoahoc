// Public Cart Routes
// Customer shopping cart endpoints

import { Router } from 'express';
import * as cartController from '../controllers/cartController';

const router = Router();

// All cart routes are public (support guest cart with session_id)
router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.put('/:id', cartController.updateCartItem);
router.delete('/:id', cartController.removeFromCart);
router.delete('/', cartController.clearCart);

export default router;

