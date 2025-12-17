import { Router } from 'express';
import multer from 'multer';
import {
  uploadFile,
  fetchRemote,
  createFolder,
  listFolders,
  listAssets,
  getAssetById,
  deleteAsset,
} from '../controllers/assetController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', listAssets);
router.get('/folders', listFolders);
router.get('/:id', getAssetById);
router.post('/folders', authMiddleware, createFolder);
router.post('/upload', authMiddleware, upload.single('file'), uploadFile);
router.post('/fetch', authMiddleware, fetchRemote);
router.delete('/:id', authMiddleware, deleteAsset);

export default router;
