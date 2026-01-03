/**
 * Multer Upload Middleware
 * Handles file uploads for avatars and other media
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Get backend root directory (where .env.local is located)
const getBackendRoot = (): string => {
  // Backend root is 2 levels up from src/middleware/upload.ts
  return path.resolve(__dirname, '../..');
};

// Get upload directory from environment or use default
const getUploadDir = (): string => {
  let uploadPath: string;
  const backendRoot = getBackendRoot();
  
  console.log('[Upload] Backend root directory:', backendRoot);
  console.log('[Upload] Current working directory:', process.cwd());
  console.log('[Upload] SHARED_STORAGE_PATH env:', process.env.SHARED_STORAGE_PATH);
  console.log('[Upload] STORAGE_UPLOADS_PATH env:', process.env.STORAGE_UPLOADS_PATH);
  
  // Check if STORAGE_UPLOADS_PATH is set and is a valid path (not a template variable)
  const storageUploadsPath = process.env.STORAGE_UPLOADS_PATH;
  if (storageUploadsPath && !storageUploadsPath.includes('${') && !storageUploadsPath.includes('$SHARED')) {
    // Resolve to absolute path from backend root
    uploadPath = path.isAbsolute(storageUploadsPath) 
      ? storageUploadsPath
      : path.resolve(backendRoot, storageUploadsPath);
    console.log('[Upload] Using STORAGE_UPLOADS_PATH:', storageUploadsPath);
    console.log('[Upload] Resolved to:', uploadPath);
  } else if (process.env.SHARED_STORAGE_PATH) {
    // Resolve to absolute path from backend root (handle relative paths like ../../shared-storage)
    const sharedPath = path.isAbsolute(process.env.SHARED_STORAGE_PATH)
      ? process.env.SHARED_STORAGE_PATH
      : path.resolve(backendRoot, process.env.SHARED_STORAGE_PATH);
    uploadPath = path.join(sharedPath, 'uploads');
    console.log('[Upload] Using SHARED_STORAGE_PATH:', process.env.SHARED_STORAGE_PATH);
    console.log('[Upload] Resolved shared path to:', sharedPath);
    console.log('[Upload] Resolved upload path to:', uploadPath);
  } else {
    uploadPath = path.join(backendRoot, 'uploads');
    console.log('[Upload] Using default path:', uploadPath);
  }
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
    console.log('[Upload] Created upload directory:', uploadPath);
  }
  
  // Verify directory exists and is writable
  if (!fs.existsSync(uploadPath)) {
    console.error('[Upload] ERROR: Upload directory does not exist:', uploadPath);
  } else {
    try {
      fs.accessSync(uploadPath, fs.constants.W_OK);
      console.log('[Upload] Upload directory is writable:', uploadPath);
    } catch (err) {
      console.error('[Upload] ERROR: Upload directory is not writable:', uploadPath);
    }
  }
  
  return uploadPath;
};

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const uploadDir = getUploadDir();
      const avatarDir = path.join(uploadDir, 'avatars');
      
      // Create avatars subdirectory if it doesn't exist
      if (!fs.existsSync(avatarDir)) {
        fs.mkdirSync(avatarDir, { recursive: true });
        console.log('[Upload] Created avatars directory:', avatarDir);
      }
      
      // Verify directory exists and is writable
      if (!fs.existsSync(avatarDir)) {
        console.error('[Upload] ERROR: Avatars directory does not exist:', avatarDir);
        return cb(new Error('Failed to create avatars directory'), avatarDir);
      }
      
      try {
        fs.accessSync(avatarDir, fs.constants.W_OK);
        console.log('[Upload] Avatars directory is writable:', avatarDir);
      } catch (err) {
        console.error('[Upload] ERROR: Avatars directory is not writable:', avatarDir);
        return cb(new Error('Avatars directory is not writable'), avatarDir);
      }
      
      console.log('[Upload] Saving file to:', avatarDir);
      cb(null, avatarDir);
    } catch (error: any) {
      console.error('[Upload] ERROR in destination callback:', error);
      cb(error, '');
    }
  },
  filename: (req, file, cb) => {
    try {
      // Generate unique filename: userId-timestamp.extension
      const userId = (req as any).user?.id || 'unknown';
      const timestamp = Date.now();
      const ext = path.extname(file.originalname);
      const filename = `${userId}-${timestamp}${ext}`;
      console.log('[Upload] Generated filename:', filename);
      cb(null, filename);
    } catch (error: any) {
      console.error('[Upload] ERROR in filename callback:', error);
      cb(error, '');
    }
  },
});

// File filter - only allow images
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check file type
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'));
  }
};

// Configure multer
export const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1 * 1024 * 1024, // 1MB max file size
  },
});

// Helper to get avatar URL
export const getAvatarUrl = (filename: string): string => {
  // Use relative URL or environment variable
  // In production, use PUBLIC_FRONTEND_URL or CDN URL
  // In development, use relative path or localhost
  if (process.env.NODE_ENV === 'production') {
    // Production: Use full URL from environment or relative path
    const baseUrl = process.env.PUBLIC_API_URL || process.env.API_BASE_URL || '';
    if (baseUrl) {
      return `${baseUrl}/uploads/avatars/${filename}`;
    }
    // Fallback to relative URL
    return `/uploads/avatars/${filename}`;
  } else {
    // Development: Use relative URL (better for localhost)
    // Frontend will resolve it correctly
    return `/uploads/avatars/${filename}`;
  }
};

