import express from 'express';
import * as cartController from '../controllers/cartController';

const router = express.Router();

// All cart routes - public (user_id or session_id required)
router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.put('/:id', cartController.updateCartItem);
router.delete('/:id', cartController.removeFromCart);
router.delete('/', cartController.clearCart);

export default router;

















