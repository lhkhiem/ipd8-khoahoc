/**
 * Multer configuration for course materials upload
 * Supports various file types (PDF, DOC, DOCX, images, videos, etc.)
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure shared-storage directory exists
const MATERIALS_UPLOAD_DIR = path.join(process.cwd(), '../../shared-storage/uploads/materials');

// Create directory if it doesn't exist
if (!fs.existsSync(MATERIALS_UPLOAD_DIR)) {
  fs.mkdirSync(MATERIALS_UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, MATERIALS_UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9-_]/g, '_');
    cb(null, `${sanitizedName}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow various file types for course materials
  const allowedMimeTypes = [
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    // Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    // Videos
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo',
    // Archives
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    // Text
    'text/plain',
    'text/csv',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`));
  }
};

export const uploadMaterial = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB max
  },
  fileFilter: fileFilter,
});

export const MATERIALS_UPLOAD_PATH = MATERIALS_UPLOAD_DIR;

