// IMPORTANT: Disable dev logs in production - must be first import
import './utils/disableDevLogs';

// Load environment variables từ .env.local (phải import trước khi dùng process.env)
import './utils/loadEnv';

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import sequelize from './config/database';

// Import models to initialize associations
import './models';

// Middleware
import { requestLogger } from './middleware/logger';
import { securityHeaders } from './middleware/securityHeaders';
import { rateLimiter, authRateLimiter } from './middleware/rateLimiter';
import { inputSanitizer } from './middleware/inputValidator';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

export const app = express();

// CORS configuration - chỉ cho phép Public Frontend
const buildAllowedOrigins = (): string[] => {
  const origins: string[] = [];
  
  // 1. Ưu tiên: Lấy từ ALLOWED_ORIGINS (comma-separated list)
  if (process.env.ALLOWED_ORIGINS) {
    const envOrigins = process.env.ALLOWED_ORIGINS.split(',')
      .map(origin => origin.trim())
      .filter(origin => origin.length > 0);
    origins.push(...envOrigins);
  }
  
  // 2. Development origins
  if (process.env.NODE_ENV === 'development') {
    const devOrigins = [
      process.env.PUBLIC_FRONTEND_URL || 'http://localhost:3100',
      'http://localhost:3100',
      'http://127.0.0.1:3100',
    ];
    origins.push(...devOrigins);
  }
  
  // 3. Production domains từ environment variables
  if (process.env.PUBLIC_FRONTEND_URL && process.env.PUBLIC_FRONTEND_URL.startsWith('http')) {
    origins.push(process.env.PUBLIC_FRONTEND_URL);
  }
  
  // Remove duplicates
  return [...new Set(origins)];
};

const allowedOrigins = buildAllowedOrigins();

if (process.env.NODE_ENV === 'development') {
  console.log('[CORS] Allowed origins:', allowedOrigins);
}

app.use(cors({
  origin: (origin, callback) => {
    // Request không có Origin → cho phép (server-to-server, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    // Normalize origin (remove trailing slash)
    const normalizedOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
    
    if (allowedOrigins.includes(normalizedOrigin) || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    console.warn(`[CORS] Origin not allowed: ${origin}`);
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Serve static files (avatars, uploads) from shared-storage
import path from 'path';
import fs from 'fs';

// Get backend root directory (where .env.local is located)
const getBackendRoot = (): string => {
  // Backend root is 2 levels up from src/app.ts
  return path.resolve(__dirname, '..');
};

const getUploadDir = (): string => {
  let uploadPath: string;
  const backendRoot = getBackendRoot();
  
  // Check if STORAGE_UPLOADS_PATH is set and is a valid path (not a template variable)
  const storageUploadsPath = process.env.STORAGE_UPLOADS_PATH;
  if (storageUploadsPath && !storageUploadsPath.includes('${') && !storageUploadsPath.includes('$SHARED')) {
    uploadPath = path.isAbsolute(storageUploadsPath)
      ? storageUploadsPath
      : path.resolve(backendRoot, storageUploadsPath);
  } else if (process.env.SHARED_STORAGE_PATH) {
    const sharedPath = path.isAbsolute(process.env.SHARED_STORAGE_PATH)
      ? process.env.SHARED_STORAGE_PATH
      : path.resolve(backendRoot, process.env.SHARED_STORAGE_PATH);
    uploadPath = path.join(sharedPath, 'uploads');
  } else {
    uploadPath = path.join(backendRoot, 'uploads');
  }
  
  return uploadPath;
};

const uploadDir = getUploadDir();
if (fs.existsSync(uploadDir)) {
  app.use('/uploads', express.static(uploadDir));
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Static Files] Serving uploads from: ${uploadDir}`);
  }
} else {
  console.warn(`[Static Files] Upload directory not found: ${uploadDir}`);
  console.warn(`[Static Files] Backend root: ${getBackendRoot()}`);
  console.warn(`[Static Files] SHARED_STORAGE_PATH: ${process.env.SHARED_STORAGE_PATH}`);
}

// Request logging (early, to log all requests)
app.use(requestLogger);

// Security headers
app.use(securityHeaders);

// Input sanitization
app.use(inputSanitizer);

// Rate limiting (general - applied to all routes)
app.use(rateLimiter);

// Health check endpoint (before routes, no auth required)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'public-backend', timestamp: new Date().toISOString() });
});

// Import routes
import publicAuthRoutes from './routes/publicAuth';
import publicCoursesRoutes from './routes/publicCourses';
import publicInstructorsRoutes from './routes/publicInstructors';
import publicEnrollmentsRoutes from './routes/publicEnrollments';
import publicPaymentsRoutes from './routes/publicPayments';
import publicProfileRoutes from './routes/publicProfile';
import publicUserProfileRoutes from './routes/publicUserProfile';

// Public API routes
app.use('/api/public/auth', publicAuthRoutes);
app.use('/api/public/courses', publicCoursesRoutes);
app.use('/api/public/instructors', publicInstructorsRoutes);
app.use('/api/public/enrollments', publicEnrollmentsRoutes);
app.use('/api/public/payments', publicPaymentsRoutes);
app.use('/api/public/profile', publicProfileRoutes);
app.use('/api/public/users/me', publicUserProfileRoutes);

// 404 handler (must be before error handler)
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

export async function ready() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
}

