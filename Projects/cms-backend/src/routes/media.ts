import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authMiddleware } from '../middleware/auth';
import { 
  listFolders, 
  createFolder,
  renameFolder,
  deleteFolder,
  uploadMedia,
  uploadMediaFromUrl,
  listMedia,
  updateMedia,
  renameMedia,
  deleteMedia
} from '../controllers/mediaController';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), 'storage', 'temp'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max (will be compressed to webp)
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Error handler for multer
const handleMulterError = (err: any, req: any, res: any, next: any) => {
  if (err) {
    console.error('[handleMulterError] Multer error:', err);
    console.error('[handleMulterError] Error code:', err.code);
    console.error('[handleMulterError] Error message:', err.message);
    
    if (err.code === 'LIMIT_FILE_SIZE') {
      console.log('[handleMulterError] File size limit exceeded');
      return res.status(413).json({ 
        error: 'File quá lớn. Giới hạn tối đa là 100MB. File sẽ được nén sau khi upload.' 
      });
    }
    if (err.message?.includes('Only image files')) {
      console.log('[handleMulterError] Invalid file type');
      return res.status(400).json({ 
        error: 'Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WebP)' 
      });
    }
    console.log('[handleMulterError] Generic multer error');
    return res.status(400).json({ error: err.message || 'Upload failed' });
  }
  next();
};

// Media routes
router.get('/', authMiddleware, listMedia);
router.post('/upload', authMiddleware, upload.single('file'), handleMulterError, uploadMedia);
router.post('/upload/by-url', authMiddleware, uploadMediaFromUrl);
router.put('/:id', authMiddleware, updateMedia);
router.post('/:id/rename', authMiddleware, renameMedia);
router.delete('/:id', authMiddleware, deleteMedia);

// Folder routes
router.get('/folders', authMiddleware, listFolders);
router.post('/folders', authMiddleware, createFolder);
router.put('/folders/:id', authMiddleware, renameFolder);
router.delete('/folders/:id', authMiddleware, deleteFolder);

export default router;
