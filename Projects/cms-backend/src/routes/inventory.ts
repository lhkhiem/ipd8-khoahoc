import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import {
  getInventoryStats,
  getInventoryProducts,
  getProductMovements,
  adjustStock,
  bulkAdjustStock,
  getLowStockAlerts,
  updateStockSettings,
  getStockSettings,
} from '../controllers/inventoryController';

const router = Router();

// All inventory routes require authentication
router.use(authMiddleware);

// Dashboard stats
router.get('/stats', getInventoryStats);

// Product list with inventory info
router.get('/products', getInventoryProducts);

// Stock movements
router.get('/products/:productId/movements', getProductMovements);

// Stock adjustment
router.post('/adjust', adjustStock);
router.post('/bulk-adjust', bulkAdjustStock);

// Low stock alerts
router.get('/alerts', getLowStockAlerts);

// Stock settings
router.get('/products/:productId/settings', getStockSettings);
router.put('/products/:productId/settings', updateStockSettings);

export default router;








