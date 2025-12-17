import { Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import sequelize from '../config/database';

const router = Router();

// Export rateLimitStore để có thể clear từ health endpoint
// Note: This is a workaround - in production, use a proper rate limit store (Redis, etc.)
declare global {
  var rateLimitStore: Map<string, { count: number; resetTime: number; blocked?: boolean; blockUntil?: number }> | undefined;
}

router.get('/', (_req, res) => {
  res.json({ status: 'ok' });
});

router.get('/db', async (_req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'DB unavailable' });
  }
});

router.get('/storage', async (_req, res) => {
  try {
    const dir = process.env.UPLOAD_PATH || path.resolve(__dirname, '../../storage/uploads');
    await fs.mkdir(dir, { recursive: true });
    await fs.access(dir);
    res.json({ ok: true, dir });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'Storage not writable' });
  }
});

// Clear rate limit store (only in development)
router.post('/clear-rate-limit', (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ error: 'This endpoint is only available in development' });
  }
  
  // Access rateLimitStore from app.ts via global
  if (global.rateLimitStore) {
    const size = global.rateLimitStore.size;
    global.rateLimitStore.clear();
    res.json({ 
      success: true, 
      message: `Cleared ${size} rate limit entries`,
      cleared: size 
    });
  } else {
    res.json({ 
      success: true, 
      message: 'Rate limit store not found or already empty',
      cleared: 0 
    });
  }
});

export default router;
