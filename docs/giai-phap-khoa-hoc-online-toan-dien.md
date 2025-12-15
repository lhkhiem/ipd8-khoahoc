# GIẢI PHÁP TOÀN DIỆN HỆ THỐNG KHÓA HỌC ONLINE
## Kiến Trúc NextJS 14 + NodeJS + PostgreSQL + S3 Storage

---

## MỤC LỤC

1. [Tổng Quan Hệ Thống](#1-tổng-quan-hệ-thống)
2. [Kiến Trúc Tổng Thể](#2-kiến-trúc-tổng-thể)
3. [Frontend - NextJS 14](#3-frontend---nextjs-14)
4. [Backend - NodeJS](#4-backend---nodejs)
5. [Database - PostgreSQL](#5-database---postgresql)
6. [Video Storage & Streaming](#6-video-storage--streaming)
7. [Bảo Mật Video](#7-bảo-mật-video)
8. [Google Meet Integration](#8-google-meet-integration)
9. [Hệ Thống Gói User](#9-hệ-thống-gói-user)
10. [CMS & Admin Dashboard](#10-cms--admin-dashboard)
11. [Hệ Thống Backup Tự Động](#11-hệ-thống-backup-tự-động)
12. [Monitoring & Analytics](#12-monitoring--analytics)
13. [Bảo Mật Toàn Diện](#13-bảo-mật-toàn-diện)
14. [Optimization & Performance](#14-optimization--performance)
15. [Deployment Guide](#15-deployment-guide)
16. [Maintenance & Troubleshooting](#16-maintenance--troubleshooting)

---

## 1. TỔNG QUAN HỆ THỐNG

### 1.1 Yêu Cầu Hệ Thống

**Tài nguyên VPS:**
- 4 CPU cores
- 6 GB RAM
- 30 GB SSD NVME
- Bandwidth: ~100-200 Mbps

**Tech Stack:**
- **Frontend:** NextJS 14 (App Router)
- **Backend:** NodeJS (Express.js/Fastify)
- **Database:** PostgreSQL 16
- **Cache:** Redis
- **Storage:** S3-compatible (AWS S3/DigitalOcean Spaces/Vultr)
- **CDN:** Cloudflare (Free/Pro)

**Tính năng chính:**
- ✅ Streaming video real-time với bảo mật cao
- ✅ Chống download video (HLS + AES-128)
- ✅ Google Meet integration cho live classes
- ✅ Hệ thống gói user (Vàng, Bạc, Đồng)
- ✅ CMS với thống kê chi tiết
- ✅ Backup tự động với email notification
- ✅ Bảo mật tuyệt đối (encrypted source + DB)

### 1.2 Phân Bổ Tài Nguyên

```
┌─────────────────────────────────────────┐
│   30GB SSD NVME Distribution            │
├─────────────────────────────────────────┤
│  5GB  - OS & System files               │
│  8GB  - PostgreSQL Database             │
│  3GB  - Redis Cache                     │
│  2GB  - NodeJS Application & Logs       │
│  4GB  - Backup files (3 latest)         │
│  5GB  - Premium videos (try/demo)       │
│  3GB  - Free space / Buffer             │
└─────────────────────────────────────────┘

RAM Usage (6GB):
- PostgreSQL: 1.5GB (shared_buffers + cache)
- Redis: 512MB
- NodeJS API: 1.5GB (2 instances with PM2)
- NextJS: 1GB (Build cache)
- System: 1GB
- Buffer: 500MB

CPU Usage (4 cores):
- PostgreSQL: 1 core
- NodeJS API: 2 cores (2 instances)
- System + Monitoring: 1 core
```

---

## 2. KIẾN TRÚC TỔNG THỂ

### 2.1 Sơ Đồ Kiến Trúc

```
┌──────────────────────────────────────────────────────────────┐
│                      CLOUDFLARE CDN                          │
│              (Edge Caching + DDoS Protection)                │
└────────────────────┬─────────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌──────────────────────┐
│   NextJS 14     │    │   S3 Storage         │
│   Frontend      │    │   (Video Files)      │
│   (Static)      │    │   - Encrypted HLS    │
│                 │    │   - 500GB-1TB        │
└────────┬────────┘    └──────────┬───────────┘
         │                        │
         │                        │
         └────────────┬───────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │   NodeJS Backend API   │
         │   - Express/Fastify    │
         │   - JWT Auth           │
         │   - Signed URLs        │
         │   - Business Logic     │
         └────────┬───────────────┘
                  │
      ┌───────────┼───────────┐
      │           │           │
      ▼           ▼           ▼
┌──────────┐ ┌─────────┐ ┌─────────┐
│PostgreSQL│ │  Redis  │ │  SMTP   │
│ Database │ │  Cache  │ │  Email  │
└──────────┘ └─────────┘ └─────────┘
```

### 2.2 Luồng Hoạt Động Chính

#### A. User Authentication Flow
```
1. User login → NextJS form submit
   ↓
2. NextJS → POST /api/auth/login → NodeJS Backend
   ↓
3. Backend verify credentials → PostgreSQL
   ↓
4. Generate JWT (Access Token + Refresh Token)
   ↓
5. Store Refresh Token → Redis (với TTL)
   ↓
6. Return tokens → NextJS
   ↓
7. NextJS store tokens → httpOnly cookies
   ↓
8. Redirect to dashboard
```

#### B. Video Streaming Flow
```
1. User click video → NextJS sends request
   ↓
2. NextJS → GET /api/videos/:id/stream → NodeJS
   ↓
3. Backend verify:
   - JWT valid?
   - User có quyền xem video?
   - User đã mua course/gói?
   ↓
4. Generate Signed URL (expire 2h)
   - HMAC-SHA256 signature
   - Include: videoId, userId, timestamp, IP
   ↓
5. Return Signed URL + encryption key endpoint
   ↓
6. NextJS Video.js player:
   - Request HLS playlist từ CDN/S3
   - Request encryption key từ backend
   - Decrypt & stream video
   ↓
7. Track progress mỗi 30s → Backend
```

#### C. Backup Flow
```
1. Cron job trigger (daily 2:00 AM)
   ↓
2. Execute backup script:
   - PostgreSQL dump
   - Compress with gzip
   - Encrypt with AES-256
   ↓
3. Save backup file → VPS (/var/backups)
   ↓
4. Upload to S3 (optional)
   ↓
5. Send email notification → Admin
   ↓
6. Keep 3 latest backups → Delete old ones
   ↓
7. Log backup status → Database
```

---

## 3. FRONTEND - NEXTJS 14

### 3.1 Cấu Trúc Thư Mục

```
nextjs-frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── courses/
│   │   │   ├── [courseId]/
│   │   │   │   ├── page.tsx
│   │   │   │   └── watch/
│   │   │   │       └── [videoId]/
│   │   │   │           └── page.tsx
│   │   │   └── page.tsx
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   └── proxy/          # API proxy để bảo mật
│   │       └── [...path]/
│   │           └── route.ts
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── video/
│   │   ├── VideoPlayer.tsx
│   │   ├── VideoWatermark.tsx
│   │   └── ProgressTracker.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── ...
│   └── layout/
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── Footer.tsx
├── lib/
│   ├── api.ts              # API client
│   ├── auth.ts             # Auth utilities
│   ├── video-protection.ts # Video protection logic
│   └── utils.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useVideoPlayer.ts
│   └── useProgress.ts
├── middleware.ts           # Auth middleware
├── next.config.js
├── package.json
└── tsconfig.json
```

### 3.2 NextJS Configuration

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // Image optimization
  images: {
    domains: ['your-s3-bucket.s3.amazonaws.com'],
    formats: ['image/avif', 'image/webp'],
  },

  // Disable source maps in production
  productionBrowserSourceMaps: false,

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_CDN_URL: process.env.NEXT_PUBLIC_CDN_URL,
  },

  // Compression
  compress: true,

  // Output standalone for Docker
  output: 'standalone',
};

module.exports = nextConfig;
```

### 3.3 Authentication Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const PUBLIC_PATHS = ['/login', '/register', '/'];
const ADMIN_PATHS = ['/admin'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // Get token from cookie
  const token = request.cookies.get('access_token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Verify JWT
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    // Check admin routes
    if (ADMIN_PATHS.some(path => pathname.startsWith(path))) {
      if (payload.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    // Add user info to headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', String(payload.userId));
    requestHeaders.set('x-user-role', String(payload.role));
    requestHeaders.set('x-user-tier', String(payload.tier));

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    // Token invalid
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

### 3.4 Video Player Component

```typescript
// components/video/VideoPlayer.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import type Player from 'video.js/dist/types/player';

interface VideoPlayerProps {
  videoId: string;
  onProgress: (seconds: number) => void;
  userId: string;
  userEmail: string;
}

export default function VideoPlayer({
  videoId,
  onProgress,
  userId,
  userEmail,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    // Fetch signed URL
    const initializePlayer = async () => {
      try {
        const response = await fetch(`/api/videos/${videoId}/stream`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to get video URL');
        }

        const { signedUrl, keyUrl } = await response.json();

        // Initialize Video.js player
        const player = videojs(videoRef.current!, {
          controls: true,
          autoplay: false,
          preload: 'auto',
          fluid: true,
          sources: [
            {
              src: signedUrl,
              type: 'application/x-mpegURL',
            },
          ],
          html5: {
            vhs: {
              withCredentials: true,
            },
          },
        });

        playerRef.current = player;

        // Add watermark overlay
        addWatermark(player, userId, userEmail);

        // Track progress
        player.on('timeupdate', () => {
          const currentTime = player.currentTime();
          if (currentTime && currentTime % 30 < 0.5) {
            onProgress(Math.floor(currentTime));
          }
        });

        // Disable right-click
        player.on('contextmenu', (e: Event) => {
          e.preventDefault();
          return false;
        });

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    };

    initializePlayer();

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
      }
    };
  }, [videoId, userId, userEmail, onProgress]);

  // Disable DevTools detection
  useEffect(() => {
    const detectDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;

      if (widthThreshold || heightThreshold) {
        // DevTools detected - pause video
        if (playerRef.current) {
          playerRef.current.pause();
          alert('Vui lòng đóng Developer Tools để tiếp tục xem video');
        }
      }
    };

    const interval = setInterval(detectDevTools, 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  return (
    <div className="relative w-full">
      <div data-vjs-player>
        <video
          ref={videoRef}
          className="video-js vjs-big-play-centered"
          playsInline
        />
      </div>
    </div>
  );
}

// Add dynamic watermark
function addWatermark(player: Player, userId: string, userEmail: string) {
  const watermarkDiv = document.createElement('div');
  watermarkDiv.className = 'vjs-watermark';
  watermarkDiv.style.cssText = `
    position: absolute;
    color: rgba(255, 255, 255, 0.5);
    font-size: 14px;
    pointer-events: none;
    z-index: 10;
    font-family: monospace;
  `;
  watermarkDiv.textContent = `${userEmail} - ID: ${userId}`;

  const playerEl = player.el();
  playerEl.appendChild(watermarkDiv);

  // Move watermark randomly
  setInterval(() => {
    const x = Math.random() * (playerEl.offsetWidth - 200);
    const y = Math.random() * (playerEl.offsetHeight - 30);
    watermarkDiv.style.left = `${x}px`;
    watermarkDiv.style.top = `${y}px`;
  }, 5000);
}
```

### 3.5 Progress Tracking Hook

```typescript
// hooks/useProgress.ts
import { useEffect, useRef } from 'react';
import { useAuth } from './useAuth';

export function useProgress(videoId: string, courseId: string) {
  const { user } = useAuth();
  const lastSavedTime = useRef(0);

  const saveProgress = async (seconds: number) => {
    // Only save if significant progress (>5 seconds difference)
    if (Math.abs(seconds - lastSavedTime.current) < 5) {
      return;
    }

    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          videoId,
          courseId,
          progressSeconds: seconds,
          timestamp: new Date().toISOString(),
        }),
      });

      lastSavedTime.current = seconds;
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  return { saveProgress };
}
```

---

## 4. BACKEND - NODEJS

### 4.1 Cấu Trúc Project

```
nodejs-backend/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   ├── redis.js
│   │   ├── s3.js
│   │   └── email.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── video.controller.js
│   │   ├── course.controller.js
│   │   ├── user.controller.js
│   │   ├── admin.controller.js
│   │   └── backup.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── role.middleware.js
│   │   ├── rateLimit.middleware.js
│   │   └── validation.middleware.js
│   ├── models/
│   │   ├── User.model.js
│   │   ├── Course.model.js
│   │   ├── Video.model.js
│   │   ├── Progress.model.js
│   │   ├── Subscription.model.js
│   │   └── BackupLog.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── video.routes.js
│   │   ├── course.routes.js
│   │   ├── user.routes.js
│   │   └── admin.routes.js
│   ├── services/
│   │   ├── video.service.js
│   │   ├── email.service.js
│   │   ├── backup.service.js
│   │   ├── analytics.service.js
│   │   └── storage.service.js
│   ├── utils/
│   │   ├── jwt.js
│   │   ├── encryption.js
│   │   ├── signedUrl.js
│   │   └── logger.js
│   ├── jobs/
│   │   ├── backup.job.js
│   │   ├── cleanup.job.js
│   │   └── analytics.job.js
│   ├── validators/
│   │   ├── auth.validator.js
│   │   └── video.validator.js
│   └── app.js
├── scripts/
│   ├── setup-database.js
│   ├── migrate.js
│   └── seed.js
├── .env
├── .env.example
├── ecosystem.config.js    # PM2 config
├── package.json
└── README.md
```

### 4.2 Main Application Setup

```javascript
// src/app.js
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth.routes');
const videoRoutes = require('./routes/video.routes');
const courseRoutes = require('./routes/course.routes');
const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');

const logger = require('./utils/logger');
const { startCronJobs } = require('./jobs');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.CDN_URL],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", process.env.CDN_URL],
      frameSrc: ["'self'", "https://meet.google.com"],
    },
  },
}));

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  optionsSuccessStatus: 200,
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Compression
app.use(compression());

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Stricter rate limit for auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
});
app.use('/api/auth', authLimiter);

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start cron jobs
startCronJobs();

module.exports = app;
```

### 4.3 Video Service với Signed URLs

```javascript
// src/services/video.service.js
const crypto = require('crypto');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const pool = require('../config/database');
const redis = require('../config/redis');
const logger = require('../utils/logger');

class VideoService {
  constructor() {
    this.s3Client = new S3Client({
      region: process.env.S3_REGION,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY,
      },
      endpoint: process.env.S3_ENDPOINT, // For DigitalOcean Spaces/Vultr
    });
  }

  /**
   * Get signed URL for video streaming
   */
  async getSignedVideoUrl(videoId, userId) {
    try {
      // Check permission
      const hasPermission = await this.checkVideoPermission(videoId, userId);
      if (!hasPermission) {
        throw new Error('User does not have permission to access this video');
      }

      // Get video metadata from DB
      const videoQuery = `
        SELECT v.*, c.title as course_title
        FROM videos v
        JOIN courses c ON v.course_id = c.id
        WHERE v.id = $1
      `;
      const { rows } = await pool.query(videoQuery, [videoId]);

      if (rows.length === 0) {
        throw new Error('Video not found');
      }

      const video = rows[0];

      // Check if video is on VPS (premium/try videos)
      if (video.storage_location === 'vps') {
        return this.getVPSVideoUrl(video, userId);
      }

      // Generate signed URL for S3
      const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: video.s3_key,
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: 7200, // 2 hours
      });

      // Generate key URL for HLS decryption
      const keyUrl = this.generateKeyUrl(videoId, userId);

      // Log access
      await this.logVideoAccess(videoId, userId);

      return {
        signedUrl,
        keyUrl,
        duration: video.duration,
        title: video.title,
      };
    } catch (error) {
      logger.error('Error getting signed video URL:', error);
      throw error;
    }
  }

  /**
   * Get VPS video URL with custom signed URL
   */
  getVPSVideoUrl(video, userId) {
    const baseUrl = `${process.env.CDN_URL}/videos/${video.id}/playlist.m3u8`;
    const expires = Math.floor(Date.now() / 1000) + 7200; // 2 hours
    
    // Create signature
    const stringToSign = `${video.id}${userId}${expires}`;
    const signature = crypto
      .createHmac('sha256', process.env.VIDEO_SECRET_KEY)
      .update(stringToSign)
      .digest('hex');

    const signedUrl = `${baseUrl}?expires=${expires}&signature=${signature}&user=${userId}`;
    const keyUrl = this.generateKeyUrl(video.id, userId);

    return {
      signedUrl,
      keyUrl,
      duration: video.duration,
      title: video.title,
    };
  }

  /**
   * Generate key URL for HLS encryption
   */
  generateKeyUrl(videoId, userId) {
    const expires = Math.floor(Date.now() / 1000) + 7200;
    const signature = crypto
      .createHmac('sha256', process.env.VIDEO_SECRET_KEY)
      .update(`${videoId}${userId}${expires}`)
      .digest('hex');

    return `${process.env.API_URL}/api/videos/${videoId}/key?expires=${expires}&signature=${signature}&user=${userId}`;
  }

  /**
   * Get encryption key for video
   */
  async getEncryptionKey(videoId, userId, signature, expires) {
    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.VIDEO_SECRET_KEY)
      .update(`${videoId}${userId}${expires}`)
      .digest('hex');

    if (signature !== expectedSignature) {
      throw new Error('Invalid signature');
    }

    // Check expiration
    if (Date.now() / 1000 > parseInt(expires)) {
      throw new Error('URL expired');
    }

    // Check permission
    const hasPermission = await this.checkVideoPermission(videoId, userId);
    if (!hasPermission) {
      throw new Error('No permission');
    }

    // Get encryption key from Redis cache
    const cacheKey = `video:key:${videoId}`;
    let encryptionKey = await redis.get(cacheKey);

    if (!encryptionKey) {
      // Get from database
      const query = 'SELECT encryption_key FROM videos WHERE id = $1';
      const { rows } = await pool.query(query, [videoId]);

      if (rows.length === 0) {
        throw new Error('Video not found');
      }

      // Decrypt the stored key
      encryptionKey = this.decryptKey(rows[0].encryption_key);

      // Cache for 1 hour
      await redis.setex(cacheKey, 3600, encryptionKey);
    }

    return Buffer.from(encryptionKey, 'hex');
  }

  /**
   * Check if user has permission to access video
   */
  async checkVideoPermission(videoId, userId) {
    const query = `
      SELECT EXISTS(
        SELECT 1
        FROM videos v
        JOIN courses c ON v.course_id = c.id
        LEFT JOIN course_enrollments ce ON c.id = ce.course_id AND ce.user_id = $2
        LEFT JOIN users u ON u.id = $2
        WHERE v.id = $1
          AND (
            v.is_free = true
            OR ce.id IS NOT NULL
            OR (v.tier = 'bronze' AND u.tier IN ('bronze', 'silver', 'gold'))
            OR (v.tier = 'silver' AND u.tier IN ('silver', 'gold'))
            OR (v.tier = 'gold' AND u.tier = 'gold')
          )
      ) as has_permission
    `;

    const { rows } = await pool.query(query, [videoId, userId]);
    return rows[0].has_permission;
  }

  /**
   * Log video access
   */
  async logVideoAccess(videoId, userId) {
    const query = `
      INSERT INTO video_access_logs (video_id, user_id, accessed_at, ip_address)
      VALUES ($1, $2, NOW(), $3)
    `;

    const ip = ''; // Get from request
    await pool.query(query, [videoId, userId, ip]);
  }

  /**
   * Decrypt encryption key
   */
  decryptKey(encryptedKey) {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
    const iv = Buffer.from(encryptedKey.slice(0, 32), 'hex');
    const encrypted = Buffer.from(encryptedKey.slice(32), 'hex');

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString('hex');
  }

  /**
   * Save video progress
   */
  async saveProgress(videoId, userId, progressSeconds) {
    const query = `
      INSERT INTO video_progress (user_id, video_id, progress_seconds, last_watched, completed)
      VALUES ($1, $2, $3, NOW(), $4)
      ON CONFLICT (user_id, video_id)
      DO UPDATE SET
        progress_seconds = $3,
        last_watched = NOW(),
        completed = $4
    `;

    // Get video duration to check if completed
    const durationQuery = 'SELECT duration FROM videos WHERE id = $1';
    const { rows } = await pool.query(durationQuery, [videoId]);
    const duration = rows[0]?.duration || 0;
    const completed = progressSeconds >= duration * 0.9; // 90% watched = completed

    await pool.query(query, [userId, videoId, progressSeconds, completed]);

    // Update course progress
    await this.updateCourseProgress(userId, videoId);
  }

  /**
   * Update course progress based on video completion
   */
  async updateCourseProgress(userId, videoId) {
    const query = `
      WITH course_stats AS (
        SELECT
          c.id as course_id,
          COUNT(v.id) as total_videos,
          COUNT(vp.id) FILTER (WHERE vp.completed = true) as completed_videos
        FROM videos v
        JOIN courses c ON v.course_id = c.id
        LEFT JOIN video_progress vp ON v.id = vp.video_id AND vp.user_id = $1
        WHERE v.id = $2
        GROUP BY c.id
      )
      UPDATE course_enrollments ce
      SET
        progress_percentage = (cs.completed_videos::float / cs.total_videos * 100),
        completed = (cs.completed_videos = cs.total_videos),
        updated_at = NOW()
      FROM course_stats cs
      WHERE ce.user_id = $1 AND ce.course_id = cs.course_id
    `;

    await pool.query(query, [userId, videoId]);
  }
}

module.exports = new VideoService();
```

### 4.4 Video Controller

```javascript
// src/controllers/video.controller.js
const videoService = require('../services/video.service');
const logger = require('../utils/logger');

class VideoController {
  /**
   * GET /api/videos/:id/stream
   * Get signed URL for video streaming
   */
  async getStreamUrl(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id; // From auth middleware

      const result = await videoService.getSignedVideoUrl(id, userId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Error in getStreamUrl:', error);
      next(error);
    }
  }

  /**
   * GET /api/videos/:id/key
   * Get encryption key for HLS
   */
  async getEncryptionKey(req, res, next) {
    try {
      const { id } = req.params;
      const { user, signature, expires } = req.query;

      const key = await videoService.getEncryptionKey(
        id,
        user,
        signature,
        expires
      );

      // Return as binary
      res.set('Content-Type', 'application/octet-stream');
      res.send(key);
    } catch (error) {
      logger.error('Error in getEncryptionKey:', error);
      res.status(403).send('Forbidden');
    }
  }

  /**
   * POST /api/videos/:id/progress
   * Save video progress
   */
  async saveProgress(req, res, next) {
    try {
      const { id } = req.params;
      const { progressSeconds } = req.body;
      const userId = req.user.id;

      await videoService.saveProgress(id, userId, progressSeconds);

      res.json({
        success: true,
        message: 'Progress saved',
      });
    } catch (error) {
      logger.error('Error in saveProgress:', error);
      next(error);
    }
  }

  /**
   * GET /api/videos/:id
   * Get video details
   */
  async getVideo(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Implementation
      // ...

      res.json({
        success: true,
        data: video,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new VideoController();
```

---

## 5. DATABASE - POSTGRESQL

### 5.1 Database Schema

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  tier VARCHAR(20) NOT NULL DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold')),
  role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'instructor')),
  email_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier VARCHAR(20) NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold')),
  start_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  end_date TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  payment_method VARCHAR(50),
  amount DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'VND',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courses table
CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE NOT NULL,
  description TEXT,
  thumbnail_url VARCHAR(500),
  instructor_id INTEGER REFERENCES users(id),
  tier_required VARCHAR(20) DEFAULT 'bronze' CHECK (tier_required IN ('bronze', 'silver', 'gold')),
  price DECIMAL(10, 2) DEFAULT 0,
  duration_hours INTEGER DEFAULT 0,
  level VARCHAR(50),
  category VARCHAR(100),
  is_published BOOLEAN DEFAULT FALSE,
  has_google_meet BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Videos table
CREATE TABLE videos (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL, -- in seconds
  order_index INTEGER NOT NULL,
  storage_location VARCHAR(20) NOT NULL CHECK (storage_location IN ('s3', 'vps')),
  s3_key VARCHAR(500),
  vps_path VARCHAR(500),
  encryption_key TEXT NOT NULL, -- Encrypted AES key
  tier_required VARCHAR(20) DEFAULT 'bronze' CHECK (tier_required IN ('bronze', 'silver', 'gold')),
  is_free BOOLEAN DEFAULT FALSE,
  is_trial BOOLEAN DEFAULT FALSE, -- Free trial video
  thumbnail_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(course_id, order_index)
);

-- Video progress tracking
CREATE TABLE video_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_id INTEGER NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  progress_seconds INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  last_watched TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, video_id)
);

-- Course enrollments
CREATE TABLE course_enrollments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  progress_percentage DECIMAL(5, 2) DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, course_id)
);

-- Google Meet sessions
CREATE TABLE meet_sessions (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  meet_url VARCHAR(500) NOT NULL,
  scheduled_start TIMESTAMP NOT NULL,
  scheduled_end TIMESTAMP NOT NULL,
  instructor_id INTEGER REFERENCES users(id),
  max_participants INTEGER DEFAULT 100,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Meet session attendees
CREATE TABLE meet_attendees (
  id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES meet_sessions(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  left_at TIMESTAMP,
  duration_minutes INTEGER,
  UNIQUE(session_id, user_id)
);

-- Video access logs
CREATE TABLE video_access_logs (
  id SERIAL PRIMARY KEY,
  video_id INTEGER NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT
);

-- Ebooks table (for Silver+ tiers)
CREATE TABLE ebooks (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  file_url VARCHAR(500) NOT NULL,
  file_size BIGINT,
  tier_required VARCHAR(20) NOT NULL CHECK (tier_required IN ('silver', 'gold')),
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ebook downloads tracking
CREATE TABLE ebook_downloads (
  id SERIAL PRIMARY KEY,
  ebook_id INTEGER NOT NULL REFERENCES ebooks(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45)
);

-- System backups log
CREATE TABLE backup_logs (
  id SERIAL PRIMARY KEY,
  backup_type VARCHAR(50) NOT NULL, -- 'database', 'full_system', 'files'
  file_path VARCHAR(500),
  file_size BIGINT,
  s3_key VARCHAR(500),
  status VARCHAR(20) NOT NULL, -- 'pending', 'success', 'failed'
  error_message TEXT,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  email_sent BOOLEAN DEFAULT FALSE,
  downloaded BOOLEAN DEFAULT FALSE
);

-- System metrics log (for CMS monitoring)
CREATE TABLE system_metrics (
  id SERIAL PRIMARY KEY,
  cpu_usage DECIMAL(5, 2),
  ram_usage DECIMAL(5, 2),
  disk_usage DECIMAL(5, 2),
  disk_available BIGINT,
  active_connections INTEGER,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analytics events
CREATE TABLE analytics_events (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL, -- 'page_view', 'video_play', 'course_purchase', etc.
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL,
  video_id INTEGER REFERENCES videos(id) ON DELETE SET NULL,
  metadata JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin action logs
CREATE TABLE admin_logs (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER NOT NULL REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id INTEGER,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_tier ON users(tier);
CREATE INDEX idx_subscriptions_user_active ON subscriptions(user_id, is_active);
CREATE INDEX idx_courses_published ON courses(is_published);
CREATE INDEX idx_videos_course ON videos(course_id);
CREATE INDEX idx_video_progress_user ON video_progress(user_id);
CREATE INDEX idx_video_progress_video ON video_progress(video_id);
CREATE INDEX idx_enrollments_user ON course_enrollments(user_id);
CREATE INDEX idx_enrollments_course ON course_enrollments(course_id);
CREATE INDEX idx_meet_sessions_course ON meet_sessions(course_id);
CREATE INDEX idx_video_access_logs_video ON video_access_logs(video_id);
CREATE INDEX idx_video_access_logs_user ON video_access_logs(user_id);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created ON analytics_events(created_at);
CREATE INDEX idx_admin_logs_admin ON admin_logs(admin_id);
CREATE INDEX idx_admin_logs_created ON admin_logs(created_at);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enrollments_updated_at BEFORE UPDATE ON course_enrollments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 5.2 Seed Data Script

```javascript
// scripts/seed.js
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function seed() {
  try {
    console.log('Starting database seeding...');

    // Create admin user
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    await pool.query(`
      INSERT INTO users (email, password_hash, full_name, tier, role, email_verified)
      VALUES ('admin@example.com', $1, 'System Administrator', 'gold', 'admin', true)
      ON CONFLICT (email) DO NOTHING
    `, [adminPassword]);

    // Create sample users
    const users = [
      { email: 'user1@example.com', name: 'User Bronze', tier: 'bronze' },
      { email: 'user2@example.com', name: 'User Silver', tier: 'silver' },
      { email: 'user3@example.com', name: 'User Gold', tier: 'gold' },
    ];

    for (const user of users) {
      const password = await bcrypt.hash('User@123', 10);
      await pool.query(`
        INSERT INTO users (email, password_hash, full_name, tier, email_verified)
        VALUES ($1, $2, $3, $4, true)
        ON CONFLICT (email) DO NOTHING
      `, [user.email, password, user.name, user.tier]);
    }

    // Create sample courses
    const courses = [
      {
        title: 'Khóa học JavaScript cơ bản',
        slug: 'javascript-co-ban',
        description: 'Học JavaScript từ đầu đến nâng cao',
        tier: 'bronze',
      },
      {
        title: 'React.js Masterclass',
        slug: 'reactjs-masterclass',
        description: 'Làm chủ React.js trong 30 ngày',
        tier: 'silver',
      },
      {
        title: 'Full-stack Development',
        slug: 'fullstack-development',
        description: 'Trở thành Full-stack Developer chuyên nghiệp',
        tier: 'gold',
      },
    ];

    for (const course of courses) {
      await pool.query(`
        INSERT INTO courses (title, slug, description, tier_required, is_published)
        VALUES ($1, $2, $3, $4, true)
        ON CONFLICT (slug) DO NOTHING
      `, [course.title, course.slug, course.description, course.tier]);
    }

    console.log('✅ Database seeding completed');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await pool.end();
  }
}

seed();
```

---

## 6. VIDEO STORAGE & STREAMING

### 6.1 Video Processing Pipeline

```javascript
// src/services/video-processor.service.js
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

class VideoProcessorService {
  constructor() {
    this.s3Client = new S3Client({
      region: process.env.S3_REGION,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY,
      },
      endpoint: process.env.S3_ENDPOINT,
    });
  }

  /**
   * Process uploaded video - convert to HLS with encryption
   */
  async processVideo(videoFile, videoId, options = {}) {
    const {
      storageLocation = 's3', // 's3' or 'vps'
      quality = '1080p',
    } = options;

    const tempDir = path.join('/tmp', `video_${videoId}`);
    await fs.mkdir(tempDir, { recursive: true });

    try {
      // Generate encryption key
      const encryptionKey = crypto.randomBytes(16);
      const keyFile = path.join(tempDir, 'enc.key');
      await fs.writeFile(keyFile, encryptionKey);

      // Create keyinfo file for FFmpeg
      const keyinfoFile = path.join(tempDir, 'keyinfo.txt');
      const keyUrl = `${process.env.API_URL}/api/videos/${videoId}/key`;
      
      const keyinfoContent = `${keyUrl}\n${keyFile}\n`;
      await fs.writeFile(keyinfoFile, keyinfoContent);

      // Convert to HLS with encryption
      const outputPath = path.join(tempDir, 'playlist.m3u8');
      
      await this.convertToHLS(videoFile, outputPath, keyinfoFile, quality);

      // Upload to storage
      if (storageLocation === 's3') {
        await this.uploadToS3(tempDir, videoId);
      } else {
        await this.uploadToVPS(tempDir, videoId);
      }

      // Encrypt and save encryption key to database
      const encryptedKey = this.encryptKey(encryptionKey);
      await this.saveEncryptionKey(videoId, encryptedKey);

      // Get video metadata
      const metadata = await this.getVideoMetadata(videoFile);

      return {
        success: true,
        videoId,
        duration: metadata.duration,
        storageLocation,
      };
    } finally {
      // Cleanup temp files
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  }

  /**
   * Convert video to HLS format with FFmpeg
   */
  convertToHLS(inputFile, outputFile, keyinfoFile, quality) {
    return new Promise((resolve, reject) => {
      let videoCodec = 'libx264';
      let videoBitrate = '5000k';
      let audioBitrate = '192k';
      let resolution = '1920x1080';

      // Adjust settings based on quality
      switch (quality) {
        case '720p':
          videoBitrate = '2500k';
          resolution = '1280x720';
          break;
        case '480p':
          videoBitrate = '1000k';
          audioBitrate = '128k';
          resolution = '854x480';
          break;
      }

      ffmpeg(inputFile)
        .outputOptions([
          '-c:v', videoCodec,
          '-preset', 'medium',
          '-crf', '23',
          '-c:a', 'aac',
          '-b:a', audioBitrate,
          '-b:v', videoBitrate,
          '-s', resolution,
          '-hls_time', '10',
          '-hls_key_info_file', keyinfoFile,
          '-hls_playlist_type', 'vod',
          '-hls_segment_filename', path.join(path.dirname(outputFile), 'segment_%03d.ts'),
        ])
        .output(outputFile)
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .run();
    });
  }

  /**
   * Upload HLS files to S3
   */
  async uploadToS3(tempDir, videoId) {
    const files = await fs.readdir(tempDir);
    
    for (const file of files) {
      const filePath = path.join(tempDir, file);
      const fileContent = await fs.readFile(filePath);
      
      const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: `videos/${videoId}/${file}`,
        Body: fileContent,
        ContentType: this.getContentType(file),
      });

      await this.s3Client.send(command);
    }
  }

  /**
   * Upload HLS files to VPS
   */
  async uploadToVPS(tempDir, videoId) {
    const vpsVideoDir = path.join('/var/www/videos', videoId);
    await fs.mkdir(vpsVideoDir, { recursive: true });

    const files = await fs.readdir(tempDir);
    
    for (const file of files) {
      const srcPath = path.join(tempDir, file);
      const destPath = path.join(vpsVideoDir, file);
      await fs.copyFile(srcPath, destPath);
    }
  }

  /**
   * Get content type for file
   */
  getContentType(filename) {
    const ext = path.extname(filename).toLowerCase();
    const types = {
      '.m3u8': 'application/vnd.apple.mpegurl',
      '.ts': 'video/MP2T',
      '.key': 'application/octet-stream',
    };
    return types[ext] || 'application/octet-stream';
  }

  /**
   * Encrypt encryption key before storing
   */
  encryptKey(key) {
    const algorithm = 'aes-256-cbc';
    const masterKey = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, masterKey, iv);
    let encrypted = cipher.update(key);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    // Return iv + encrypted data
    return iv.toString('hex') + encrypted.toString('hex');
  }

  /**
   * Save encryption key to database
   */
  async saveEncryptionKey(videoId, encryptedKey) {
    const pool = require('../config/database');
    await pool.query(
      'UPDATE videos SET encryption_key = $1 WHERE id = $2',
      [encryptedKey, videoId]
    );
  }

  /**
   * Get video metadata
   */
  getVideoMetadata(videoPath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) return reject(err);

        const videoStream = metadata.streams.find(s => s.codec_type === 'video');
        
        resolve({
          duration: Math.floor(metadata.format.duration),
          width: videoStream?.width,
          height: videoStream?.height,
          bitrate: metadata.format.bit_rate,
          size: metadata.format.size,
        });
      });
    });
  }
}

module.exports = new VideoProcessorService();
```

### 6.2 Nginx Configuration cho VPS Videos

```nginx
# /etc/nginx/sites-available/elearning

server {
    listen 80;
    server_name yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Video files location
    location /videos/ {
        alias /var/www/videos/;
        
        # Verify signed URL
        secure_link $arg_signature,$arg_expires;
        secure_link_md5 "$secure_link_expires$uri $arg_user $video_secret_key";

        if ($secure_link = "") {
            return 403;
        }

        if ($secure_link = "0") {
            return 410;
        }

        # CORS for HLS
        add_header Access-Control-Allow-Origin "https://yourdomain.com" always;
        add_header Access-Control-Allow-Methods "GET, HEAD, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Range, Content-Type" always;

        # Cache control
        expires 1h;
        add_header Cache-Control "private, no-transform";

        # Support byte-range requests
        add_header Accept-Ranges bytes;

        # HLS types
        types {
            application/vnd.apple.mpegurl m3u8;
            video/mp2t ts;
        }

        # Disable logging for video segments
        access_log off;
    }

    # Backend API proxy
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend (NextJS static files)
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req zone=api_limit burst=20 nodelay;
}
```

---

## 7. BẢO MẬT VIDEO

### 7.1 Multi-Layer Protection Implementation

```typescript
// Frontend - Video Protection Utilities
// lib/video-protection.ts

export class VideoProtection {
  private player: any;
  private watermarkInterval: NodeJS.Timeout | null = null;
  private screenshotInterval: NodeJS.Timeout | null = null;

  constructor(player: any) {
    this.player = player;
    this.init();
  }

  /**
   * Initialize all protection mechanisms
   */
  private init() {
    this.disableRightClick();
    this.disableKeyboardShortcuts();
    this.detectDevTools();
    this.detectScreenRecording();
    this.addDynamicWatermark();
  }

  /**
   * Disable right-click menu
   */
  private disableRightClick() {
    const videoElement = this.player.el();
    
    videoElement.addEventListener('contextmenu', (e: Event) => {
      e.preventDefault();
      return false;
    });
  }

  /**
   * Disable keyboard shortcuts for download
   */
  private disableKeyboardShortcuts() {
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      // Prevent Ctrl+S, Ctrl+Shift+I, F12
      if (
        (e.ctrlKey && e.key === 's') ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        e.key === 'F12'
      ) {
        e.preventDefault();
        return false;
      }
    });
  }

  /**
   * Detect DevTools opening
   */
  private detectDevTools() {
    const threshold = 160;
    let devtoolsOpen = false;

    setInterval(() => {
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;

      if ((widthThreshold || heightThreshold) && !devtoolsOpen) {
        devtoolsOpen = true;
        this.player.pause();
        alert('⚠️ Vui lòng đóng Developer Tools để tiếp tục xem video');
      } else if (!widthThreshold && !heightThreshold && devtoolsOpen) {
        devtoolsOpen = false;
      }
    }, 500);
  }

  /**
   * Detect screen recording (experimental)
   */
  private detectScreenRecording() {
    // Check if MediaRecorder API is being used
    const originalMediaRecorder = window.MediaRecorder;
    
    (window as any).MediaRecorder = function(...args: any[]) {
      console.warn('Screen recording detected');
      // Log to backend
      fetch('/api/security/screen-recording', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timestamp: new Date().toISOString() }),
      });
      
      return new originalMediaRecorder(...args);
    };
  }

  /**
   * Add dynamic watermark overlay
   */
  private addDynamicWatermark() {
    const watermarkDiv = document.createElement('div');
    watermarkDiv.className = 'video-watermark';
    watermarkDiv.style.cssText = `
      position: absolute;
      color: rgba(255, 255, 255, 0.4);
      font-size: 12px;
      font-family: monospace;
      pointer-events: none;
      z-index: 100;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
      user-select: none;
      -webkit-user-select: none;
    `;

    const playerEl = this.player.el();
    playerEl.appendChild(watermarkDiv);

    // Move watermark randomly
    this.watermarkInterval = setInterval(() => {
      const x = Math.random() * (playerEl.offsetWidth - 300);
      const y = Math.random() * (playerEl.offsetHeight - 50);
      
      watermarkDiv.style.left = `${x}px`;
      watermarkDiv.style.top = `${y}px`;
      
      // Update timestamp
      const now = new Date().toISOString();
      watermarkDiv.textContent = `${this.getUserEmail()} - ${now}`;
    }, 3000);
  }

  /**
   * Take random screenshots and send to backend
   */
  private async captureAndSendScreenshot() {
    try {
      const canvas = document.createElement('canvas');
      const video = this.player.el().querySelector('video');
      
      if (!video) return;

      canvas.width = video.videoWidth / 4; // Reduce size
      canvas.height = video.videoHeight / 4;
      
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/jpeg', 0.5);
      });

      if (blob) {
        const formData = new FormData();
        formData.append('screenshot', blob);
        formData.append('timestamp', new Date().toISOString());

        await fetch('/api/security/screenshots', {
          method: 'POST',
          body: formData,
        });
      }
    } catch (error) {
      console.error('Screenshot capture failed:', error);
    }
  }

  /**
   * Get user email from context
   */
  private getUserEmail(): string {
    // Implementation to get user email
    return 'user@example.com';
  }

  /**
   * Cleanup on destroy
   */
  destroy() {
    if (this.watermarkInterval) {
      clearInterval(this.watermarkInterval);
    }
    if (this.screenshotInterval) {
      clearInterval(this.screenshotInterval);
    }
  }
}
```

### 7.2 Backend - Security Logging

```javascript
// src/controllers/security.controller.js
const pool = require('../config/database');
const logger = require('../utils/logger');

class SecurityController {
  /**
   * Log screen recording detection
   */
  async logScreenRecording(req, res) {
    try {
      const userId = req.user.id;
      const { timestamp } = req.body;

      await pool.query(`
        INSERT INTO security_events (
          user_id,
          event_type,
          metadata,
          ip_address,
          created_at
        ) VALUES ($1, 'screen_recording_detected', $2, $3, NOW())
      `, [
        userId,
        JSON.stringify({ timestamp }),
        req.ip,
      ]);

      // Send alert to admin
      logger.warn(`Screen recording detected - User: ${userId}, IP: ${req.ip}`);

      res.json({ success: true });
    } catch (error) {
      logger.error('Error logging screen recording:', error);
      res.status(500).json({ error: 'Failed to log event' });
    }
  }

  /**
   * Store video screenshots for verification
   */
  async storeScreenshot(req, res) {
    try {
      const userId = req.user.id;
      const { timestamp } = req.body;
      const screenshot = req.file;

      if (!screenshot) {
        return res.status(400).json({ error: 'No screenshot provided' });
      }

      // Store screenshot temporarily (auto-delete after 24h)
      // Can be used for verification if piracy is detected

      await pool.query(`
        INSERT INTO video_screenshots (
          user_id,
          file_path,
          timestamp,
          created_at
        ) VALUES ($1, $2, $3, NOW())
      `, [userId, screenshot.path, timestamp]);

      res.json({ success: true });
    } catch (error) {
      logger.error('Error storing screenshot:', error);
      res.status(500).json({ error: 'Failed to store screenshot' });
    }
  }
}

module.exports = new SecurityController();
```

---

*Tài liệu này tiếp tục với các phần còn lại...*

## 8. GOOGLE MEET INTEGRATION

### 8.1 Google Calendar API Setup

```javascript
// src/services/google-meet.service.js
const { google } = require('googleapis');
const pool = require('../config/database');
const emailService = require('./email.service');

class GoogleMeetService {
  constructor() {
    this.auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Set credentials from stored refresh token
    this.auth.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    this.calendar = google.calendar({ version: 'v3', auth: this.auth });
  }

  /**
   * Create Google Meet session
   */
  async createMeetSession(sessionData) {
    const {
      courseId,
      title,
      description,
      scheduledStart,
      scheduledEnd,
      instructorId,
      maxParticipants = 100,
    } = sessionData;

    try {
      // Create Google Calendar event with Meet link
      const event = {
        summary: title,
        description: description,
        start: {
          dateTime: scheduledStart,
          timeZone: 'Asia/Ho_Chi_Minh',
        },
        end: {
          dateTime: scheduledEnd,
          timeZone: 'Asia/Ho_Chi_Minh',
        },
        conferenceData: {
          createRequest: {
            requestId: `meet_${Date.now()}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet',
            },
          },
        },
        attendees: [], // Will add enrolled students
      };

      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        conferenceDataVersion: 1,
        resource: event,
      });

      const meetUrl = response.data.hangoutLink;
      const eventId = response.data.id;

      // Save to database
      const query = `
        INSERT INTO meet_sessions (
          course_id,
          title,
          description,
          meet_url,
          google_event_id,
          scheduled_start,
          scheduled_end,
          instructor_id,
          max_participants
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id
      `;

      const { rows } = await pool.query(query, [
        courseId,
        title,
        description,
        meetUrl,
        eventId,
        scheduledStart,
        scheduledEnd,
        instructorId,
        maxParticipants,
      ]);

      // Send notifications to enrolled students
      await this.notifyEnrolledStudents(courseId, rows[0].id);

      return {
        sessionId: rows[0].id,
        meetUrl,
        eventId,
      };
    } catch (error) {
      console.error('Error creating Meet session:', error);
      throw error;
    }
  }

  /**
   * Notify enrolled students about new session
   */
  async notifyEnrolledStudents(courseId, sessionId) {
    const query = `
      SELECT u.email, u.full_name, c.title as course_title, ms.title as session_title, ms.scheduled_start, ms.meet_url
      FROM course_enrollments ce
      JOIN users u ON ce.user_id = u.id
      JOIN courses c ON ce.course_id = c.id
      JOIN meet_sessions ms ON ms.id = $2
      WHERE ce.course_id = $1 AND u.is_active = true
    `;

    const { rows } = await pool.query(query, [courseId, sessionId]);

    for (const student of rows) {
      await emailService.sendMeetNotification({
        to: student.email,
        studentName: student.full_name,
        courseTitle: student.course_title,
        sessionTitle: student.session_title,
        scheduledStart: student.scheduled_start,
        meetUrl: student.meet_url,
      });
    }
  }

  /**
   * Get upcoming sessions for user
   */
  async getUpcomingSessions(userId) {
    const query = `
      SELECT ms.*, c.title as course_title
      FROM meet_sessions ms
      JOIN courses c ON ms.course_id = c.id
      JOIN course_enrollments ce ON c.id = ce.course_id AND ce.user_id = $1
      WHERE ms.scheduled_start > NOW()
      ORDER BY ms.scheduled_start ASC
      LIMIT 10
    `;

    const { rows } = await pool.query(query, [userId]);
    return rows;
  }

  /**
   * Track session attendance
   */
  async trackAttendance(sessionId, userId) {
    const query = `
      INSERT INTO meet_attendees (session_id, user_id, joined_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (session_id, user_id) DO UPDATE
      SET joined_at = NOW()
      RETURNING id
    `;

    await pool.query(query, [sessionId, userId]);
  }

  /**
   * Record session leave
   */
  async recordLeave(sessionId, userId) {
    const query = `
      UPDATE meet_attendees
      SET left_at = NOW(),
          duration_minutes = EXTRACT(EPOCH FROM (NOW() - joined_at)) / 60
      WHERE session_id = $1 AND user_id = $2 AND left_at IS NULL
    `;

    await pool.query(query, [sessionId, userId]);
  }
}

module.exports = new GoogleMeetService();
```

### 8.2 Frontend - Meet Session Component

```typescript
// components/meet/MeetSessionCard.tsx
'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface MeetSession {
  id: number;
  title: string;
  description: string;
  meetUrl: string;
  scheduledStart: string;
  scheduledEnd: string;
  courseTitle: string;
  instructorName: string;
}

export default function MeetSessionCard({ session }: { session: MeetSession }) {
  const [joining, setJoining] = useState(false);

  const handleJoin = async () => {
    setJoining(true);

    try {
      // Track attendance
      await fetch(`/api/meet-sessions/${session.id}/join`, {
        method: 'POST',
        credentials: 'include',
      });

      // Open Meet in new tab
      window.open(session.meetUrl, '_blank');
    } catch (error) {
      console.error('Failed to join session:', error);
      alert('Không thể tham gia phiên học');
    } finally {
      setJoining(false);
    }
  };

  const startTime = format(new Date(session.scheduledStart), 'HH:mm', { locale: vi });
  const endTime = format(new Date(session.scheduledEnd), 'HH:mm', { locale: vi });
  const date = format(new Date(session.scheduledStart), 'dd/MM/yyyy', { locale: vi });

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {session.title}
          </h3>
          <p className="text-sm text-gray-600 mb-4">{session.courseTitle}</p>
          
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{date}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{startTime} - {endTime}</span>
            </div>
          </div>

          {session.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-4">
              {session.description}
            </p>
          )}
        </div>

        <button
          onClick={handleJoin}
          disabled={joining}
          className="ml-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {joining ? 'Đang tham gia...' : 'Tham gia'}
        </button>
      </div>
    </div>
  );
}
```

---

## 9. HỆ THỐNG GÓI USER

### 9.1 Subscription Service

```javascript
// src/services/subscription.service.js
const pool = require('../config/database');
const emailService = require('./email.service');

class SubscriptionService {
  /**
   * Tier benefits configuration
   */
  getTierBenefits() {
    return {
      bronze: {
        name: 'Đồng',
        price: 0,
        features: [
          'Truy cập khóa học miễn phí',
          'Video chất lượng 720p',
          'Hỗ trợ qua email',
        ],
        videoQuality: '720p',
        downloadEbooks: false,
        maxConcurrentDevices: 1,
      },
      silver: {
        name: 'Bạc',
        price: 299000, // VND/month
        features: [
          'Tất cả tính năng gói Đồng',
          'Truy cập khóa học Premium',
          'Video chất lượng 1080p',
          'Tải ebook tài liệu chuyên sâu',
          'Hỗ trợ ưu tiên',
        ],
        videoQuality: '1080p',
        downloadEbooks: true,
        maxConcurrentDevices: 2,
      },
      gold: {
        name: 'Vàng',
        price: 499000, // VND/month
        features: [
          'Tất cả tính năng gói Bạc',
          'Truy cập tất cả khóa học',
          'Video chất lượng 1080p',
          'Tải tất cả ebook',
          'Tham gia live session không giới hạn',
          'Hỗ trợ 24/7',
          'Chứng chỉ hoàn thành',
        ],
        videoQuality: '1080p',
        downloadEbooks: true,
        maxConcurrentDevices: 3,
      },
    };
  }

  /**
   * Create or upgrade subscription
   */
  async createSubscription(userId, tier, paymentData) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const benefits = this.getTierBenefits()[tier];
      if (!benefits) {
        throw new Error('Invalid tier');
      }

      // Create subscription record
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription

      const subscriptionQuery = `
        INSERT INTO subscriptions (
          user_id,
          tier,
          start_date,
          end_date,
          is_active,
          payment_method,
          amount,
          currency
        ) VALUES ($1, $2, NOW(), $3, true, $4, $5, 'VND')
        RETURNING id
      `;

      const { rows: [subscription] } = await client.query(subscriptionQuery, [
        userId,
        tier,
        endDate,
        paymentData.method,
        benefits.price,
      ]);

      // Update user tier
      await client.query(
        'UPDATE users SET tier = $1, updated_at = NOW() WHERE id = $2',
        [tier, userId]
      );

      // Deactivate old subscriptions
      await client.query(
        'UPDATE subscriptions SET is_active = false WHERE user_id = $1 AND id != $2',
        [userId, subscription.id]
      );

      await client.query('COMMIT');

      // Send confirmation email
      await this.sendSubscriptionConfirmation(userId, tier, subscription.id);

      return subscription;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Check if subscription is active
   */
  async isSubscriptionActive(userId) {
    const query = `
      SELECT *
      FROM subscriptions
      WHERE user_id = $1
        AND is_active = true
        AND end_date > NOW()
      ORDER BY end_date DESC
      LIMIT 1
    `;

    const { rows } = await pool.query(query, [userId]);
    return rows.length > 0 ? rows[0] : null;
  }

  /**
   * Get user subscription status
   */
  async getSubscriptionStatus(userId) {
    const userQuery = 'SELECT tier FROM users WHERE id = $1';
    const { rows: [user] } = await pool.query(userQuery, [userId]);

    const subscription = await this.isSubscriptionActive(userId);
    const benefits = this.getTierBenefits()[user.tier];

    return {
      tier: user.tier,
      tierName: benefits.name,
      isActive: !!subscription,
      expiresAt: subscription?.end_date,
      benefits: benefits.features,
      canDownloadEbooks: benefits.downloadEbooks,
    };
  }

  /**
   * Check if user can access content
   */
  async canAccessContent(userId, requiredTier) {
    const tierHierarchy = { bronze: 1, silver: 2, gold: 3 };
    
    const { rows: [user] } = await pool.query(
      'SELECT tier FROM users WHERE id = $1',
      [userId]
    );

    return tierHierarchy[user.tier] >= tierHierarchy[requiredTier];
  }

  /**
   * Send subscription confirmation email
   */
  async sendSubscriptionConfirmation(userId, tier, subscriptionId) {
    const { rows: [user] } = await pool.query(
      'SELECT email, full_name FROM users WHERE id = $1',
      [userId]
    );

    const benefits = this.getTierBenefits()[tier];

    await emailService.sendEmail({
      to: user.email,
      subject: `Xác nhận đăng ký gói ${benefits.name}`,
      template: 'subscription-confirmation',
      data: {
        userName: user.full_name,
        tier: benefits.name,
        price: benefits.price,
        features: benefits.features,
        subscriptionId,
      },
    });
  }

  /**
   * Handle subscription expiration
   */
  async handleExpiredSubscriptions() {
    const query = `
      UPDATE subscriptions
      SET is_active = false
      WHERE is_active = true
        AND end_date < NOW()
      RETURNING user_id, tier
    `;

    const { rows } = await pool.query(query);

    // Downgrade users to bronze
    for (const sub of rows) {
      await pool.query(
        'UPDATE users SET tier = $1 WHERE id = $2',
        ['bronze', sub.user_id]
      );

      // Send expiration notification
      await this.sendExpirationNotification(sub.user_id, sub.tier);
    }
  }

  /**
   * Send expiration notification
   */
  async sendExpirationNotification(userId, expiredTier) {
    const { rows: [user] } = await pool.query(
      'SELECT email, full_name FROM users WHERE id = $1',
      [userId]
    );

    const benefits = this.getTierBenefits()[expiredTier];

    await emailService.sendEmail({
      to: user.email,
      subject: `Gói ${benefits.name} đã hết hạn`,
      template: 'subscription-expired',
      data: {
        userName: user.full_name,
        tier: benefits.name,
      },
    });
  }
}

module.exports = new SubscriptionService();
```

### 9.2 Ebook Download Service

```javascript
// src/services/ebook.service.js
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const pool = require('../config/database');
const subscriptionService = require('./subscription.service');

class EbookService {
  constructor() {
    this.s3Client = new S3Client({
      region: process.env.S3_REGION,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY,
      },
      endpoint: process.env.S3_ENDPOINT,
    });
  }

  /**
   * Get ebook download URL
   */
  async getDownloadUrl(ebookId, userId) {
    // Get ebook details
    const ebookQuery = 'SELECT * FROM ebooks WHERE id = $1';
    const { rows: [ebook] } = await pool.query(ebookQuery, [ebookId]);

    if (!ebook) {
      throw new Error('Ebook not found');
    }

    // Check user tier permission
    const canDownload = await subscriptionService.canAccessContent(
      userId,
      ebook.tier_required
    );

    if (!canDownload) {
      throw new Error(`Bạn cần nâng cấp lên gói ${ebook.tier_required} để tải ebook này`);
    }

    // Generate signed URL
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: ebook.file_url,
    });

    const downloadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 3600, // 1 hour
    });

    // Log download
    await this.logDownload(ebookId, userId);

    // Increment download count
    await pool.query(
      'UPDATE ebooks SET download_count = download_count + 1 WHERE id = $1',
      [ebookId]
    );

    return {
      downloadUrl,
      title: ebook.title,
      fileSize: ebook.file_size,
    };
  }

  /**
   * Log ebook download
   */
  async logDownload(ebookId, userId) {
    const query = `
      INSERT INTO ebook_downloads (ebook_id, user_id, downloaded_at, ip_address)
      VALUES ($1, $2, NOW(), $3)
    `;

    await pool.query(query, [ebookId, userId, '']); // IP from request
  }

  /**
   * Get available ebooks for user
   */
  async getAvailableEbooks(userId) {
    const query = `
      SELECT e.*, c.title as course_title
      FROM ebooks e
      LEFT JOIN courses c ON e.course_id = c.id
      WHERE EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = $1
          AND (
            (e.tier_required = 'silver' AND u.tier IN ('silver', 'gold'))
            OR (e.tier_required = 'gold' AND u.tier = 'gold')
          )
      )
      ORDER BY e.created_at DESC
    `;

    const { rows } = await pool.query(query, [userId]);
    return rows;
  }
}

module.exports = new EbookService();
```

---

*Tiếp tục phần 10: CMS & Admin Dashboard...*

## 10. CMS & ADMIN DASHBOARD

### 10.1 Analytics Service

```javascript
// src/services/analytics.service.js
const pool = require('../config/database');
const redis = require('../config/redis');

class AnalyticsService {
  /**
   * Get dashboard overview statistics
   */
  async getDashboardStats(startDate, endDate) {
    const cacheKey = `stats:dashboard:${startDate}:${endDate}`;
    
    // Try cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const stats = await Promise.all([
      this.getTotalUsers(),
      this.getNewUsers(startDate, endDate),
      this.getUsersByTier(),
      this.getRevenue(startDate, endDate),
      this.getCourseStats(),
      this.getVideoStats(),
      this.getConversionStats(startDate, endDate),
      this.getTopCourses(startDate, endDate),
      this.getActiveUsersToday(),
    ]);

    const result = {
      totalUsers: stats[0],
      newUsers: stats[1],
      usersByTier: stats[2],
      revenue: stats[3],
      courses: stats[4],
      videos: stats[5],
      conversions: stats[6],
      topCourses: stats[7],
      activeUsers: stats[8],
      generatedAt: new Date().toISOString(),
    };

    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(result));

    return result;
  }

  /**
   * Get total users count
   */
  async getTotalUsers() {
    const { rows } = await pool.query(
      'SELECT COUNT(*) as count FROM users WHERE is_active = true'
    );
    return parseInt(rows[0].count);
  }

  /**
   * Get new users in date range
   */
  async getNewUsers(startDate, endDate) {
    const query = `
      SELECT
        DATE(created_at) as date,
        COUNT(*) as count,
        tier
      FROM users
      WHERE created_at BETWEEN $1 AND $2
      GROUP BY DATE(created_at), tier
      ORDER BY date DESC
    `;

    const { rows } = await pool.query(query, [startDate, endDate]);

    return {
      total: rows.reduce((sum, row) => sum + parseInt(row.count), 0),
      byTier: this.groupByTier(rows),
      daily: this.groupByDate(rows),
    };
  }

  /**
   * Get users by tier distribution
   */
  async getUsersByTier() {
    const query = `
      SELECT tier, COUNT(*) as count
      FROM users
      WHERE is_active = true
      GROUP BY tier
    `;

    const { rows } = await pool.query(query);
    
    return rows.reduce((acc, row) => {
      acc[row.tier] = parseInt(row.count);
      return acc;
    }, {});
  }

  /**
   * Get revenue statistics
   */
  async getRevenue(startDate, endDate) {
    const query = `
      SELECT
        DATE(created_at) as date,
        tier,
        SUM(amount) as revenue,
        COUNT(*) as subscriptions
      FROM subscriptions
      WHERE created_at BETWEEN $1 AND $2
        AND amount > 0
      GROUP BY DATE(created_at), tier
      ORDER BY date DESC
    `;

    const { rows } = await pool.query(query, [startDate, endDate]);

    const totalRevenue = rows.reduce((sum, row) => sum + parseFloat(row.revenue), 0);

    return {
      total: totalRevenue,
      byTier: this.groupRevenueByTier(rows),
      daily: this.groupRevenueByDate(rows),
      subscriptionCount: rows.reduce((sum, row) => sum + parseInt(row.subscriptions), 0),
    };
  }

  /**
   * Get course statistics
   */
  async getCourseStats() {
    const query = `
      SELECT
        COUNT(*) as total_courses,
        COUNT(*) FILTER (WHERE is_published = true) as published_courses,
        COUNT(DISTINCT instructor_id) as total_instructors
      FROM courses
    `;

    const { rows } = await pool.query(query);
    return rows[0];
  }

  /**
   * Get video statistics
   */
  async getVideoStats() {
    const query = `
      SELECT
        COUNT(*) as total_videos,
        SUM(duration) as total_duration,
        COUNT(*) FILTER (WHERE storage_location = 's3') as s3_videos,
        COUNT(*) FILTER (WHERE storage_location = 'vps') as vps_videos,
        COUNT(*) FILTER (WHERE is_free = true) as free_videos
      FROM videos
    `;

    const { rows } = await pool.query(query);
    return {
      ...rows[0],
      total_duration_hours: Math.floor(rows[0].total_duration / 3600),
    };
  }

  /**
   * Get conversion statistics
   */
  async getConversionStats(startDate, endDate) {
    const visitorsQuery = `
      SELECT COUNT(DISTINCT ip_address) as visitors
      FROM analytics_events
      WHERE event_type = 'page_view'
        AND created_at BETWEEN $1 AND $2
    `;

    const conversionsQuery = `
      SELECT
        COUNT(*) FILTER (WHERE event_type = 'registration') as registrations,
        COUNT(*) FILTER (WHERE event_type = 'video_trial') as trial_views,
        COUNT(*) FILTER (WHERE event_type = 'subscription_purchased') as purchases
      FROM analytics_events
      WHERE created_at BETWEEN $1 AND $2
    `;

    const [visitorsResult, conversionsResult] = await Promise.all([
      pool.query(visitorsQuery, [startDate, endDate]),
      pool.query(conversionsQuery, [startDate, endDate]),
    ]);

    const visitors = parseInt(visitorsResult.rows[0].visitors);
    const { registrations, trial_views, purchases } = conversionsResult.rows[0];

    return {
      visitors,
      registrations: parseInt(registrations),
      trialViews: parseInt(trial_views),
      purchases: parseInt(purchases),
      conversionRate: visitors > 0 ? ((parseInt(registrations) / visitors) * 100).toFixed(2) : 0,
      purchaseRate: parseInt(registrations) > 0 ? ((parseInt(purchases) / parseInt(registrations)) * 100).toFixed(2) : 0,
    };
  }

  /**
   * Get top performing courses
   */
  async getTopCourses(startDate, endDate, limit = 10) {
    const query = `
      SELECT
        c.id,
        c.title,
        c.thumbnail_url,
        COUNT(DISTINCT ce.user_id) as enrollments,
        COUNT(DISTINCT vp.user_id) as active_learners,
        AVG(vp.progress_seconds) as avg_progress,
        COUNT(DISTINCT vp.id) FILTER (WHERE vp.completed = true) as completed_videos
      FROM courses c
      LEFT JOIN course_enrollments ce ON c.id = ce.course_id
        AND ce.enrolled_at BETWEEN $1 AND $2
      LEFT JOIN videos v ON c.id = v.course_id
      LEFT JOIN video_progress vp ON v.id = vp.video_id
        AND vp.last_watched BETWEEN $1 AND $2
      WHERE c.is_published = true
      GROUP BY c.id, c.title, c.thumbnail_url
      ORDER BY enrollments DESC, active_learners DESC
      LIMIT $3
    `;

    const { rows } = await pool.query(query, [startDate, endDate, limit]);
    return rows;
  }

  /**
   * Get active users today
   */
  async getActiveUsersToday() {
    const query = `
      SELECT COUNT(DISTINCT user_id) as count
      FROM analytics_events
      WHERE created_at >= CURRENT_DATE
        AND user_id IS NOT NULL
    `;

    const { rows } = await pool.query(query);
    return parseInt(rows[0].count);
  }

  /**
   * Get system resource usage
   */
  async getSystemMetrics() {
    const query = `
      SELECT *
      FROM system_metrics
      ORDER BY recorded_at DESC
      LIMIT 1
    `;

    const { rows } = await pool.query(query);
    return rows[0] || null;
  }

  /**
   * Get detailed course analytics
   */
  async getCourseAnalytics(courseId, startDate, endDate) {
    const queries = {
      overview: `
        SELECT
          c.*,
          COUNT(DISTINCT ce.user_id) as total_enrollments,
          COUNT(DISTINCT vp.user_id) as active_learners,
          AVG(ce.progress_percentage) as avg_progress,
          COUNT(*) FILTER (WHERE ce.completed = true) as completions
        FROM courses c
        LEFT JOIN course_enrollments ce ON c.id = ce.course_id
        LEFT JOIN video_progress vp ON vp.user_id = ce.user_id
        WHERE c.id = $1
        GROUP BY c.id
      `,
      
      videoPerformance: `
        SELECT
          v.id,
          v.title,
          v.duration,
          COUNT(DISTINCT vp.user_id) as unique_viewers,
          COUNT(*) FILTER (WHERE vp.completed = true) as completions,
          AVG(vp.progress_seconds) as avg_watch_time,
          COUNT(val.id) as total_views
        FROM videos v
        LEFT JOIN video_progress vp ON v.id = vp.video_id
        LEFT JOIN video_access_logs val ON v.id = val.video_id
          AND val.accessed_at BETWEEN $2 AND $3
        WHERE v.course_id = $1
        GROUP BY v.id, v.title, v.duration
        ORDER BY v.order_index
      `,
      
      enrollmentTrend: `
        SELECT
          DATE(enrolled_at) as date,
          COUNT(*) as enrollments
        FROM course_enrollments
        WHERE course_id = $1
          AND enrolled_at BETWEEN $2 AND $3
        GROUP BY DATE(enrolled_at)
        ORDER BY date
      `,
    };

    const [overview, videoPerformance, enrollmentTrend] = await Promise.all([
      pool.query(queries.overview, [courseId]),
      pool.query(queries.videoPerformance, [courseId, startDate, endDate]),
      pool.query(queries.enrollmentTrend, [courseId, startDate, endDate]),
    ]);

    return {
      overview: overview.rows[0],
      videos: videoPerformance.rows,
      enrollmentTrend: enrollmentTrend.rows,
    };
  }

  // Helper methods
  groupByTier(rows) {
    return rows.reduce((acc, row) => {
      if (!acc[row.tier]) acc[row.tier] = 0;
      acc[row.tier] += parseInt(row.count);
      return acc;
    }, {});
  }

  groupByDate(rows) {
    return rows.reduce((acc, row) => {
      const date = row.date.toISOString().split('T')[0];
      if (!acc[date]) acc[date] = {};
      acc[date][row.tier] = parseInt(row.count);
      return acc;
    }, {});
  }

  groupRevenueByTier(rows) {
    return rows.reduce((acc, row) => {
      if (!acc[row.tier]) acc[row.tier] = 0;
      acc[row.tier] += parseFloat(row.revenue);
      return acc;
    }, {});
  }

  groupRevenueByDate(rows) {
    return rows.reduce((acc, row) => {
      const date = row.date.toISOString().split('T')[0];
      if (!acc[date]) acc[date] = 0;
      acc[date] += parseFloat(row.revenue);
      return acc;
    }, {});
  }
}

module.exports = new AnalyticsService();
```

### 10.2 System Monitoring Service

```javascript
// src/services/system-monitoring.service.js
const os = require('os');
const { execSync } = require('child_process');
const pool = require('../config/database');
const emailService = require('./email.service');

class SystemMonitoringService {
  /**
   * Collect system metrics
   */
  async collectMetrics() {
    const metrics = {
      cpu: this.getCPUUsage(),
      ram: this.getRAMUsage(),
      disk: await this.getDiskUsage(),
      connections: await this.getDatabaseConnections(),
      timestamp: new Date(),
    };

    // Save to database
    await this.saveMetrics(metrics);

    // Check thresholds and alert if necessary
    await this.checkThresholds(metrics);

    return metrics;
  }

  /**
   * Get CPU usage percentage
   */
  getCPUUsage() {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    });

    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;
    const usage = 100 - (100 * idle / total);

    return parseFloat(usage.toFixed(2));
  }

  /**
   * Get RAM usage
   */
  getRAMUsage() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const usagePercent = (usedMem / totalMem) * 100;

    return {
      total: totalMem,
      used: usedMem,
      free: freeMem,
      usagePercent: parseFloat(usagePercent.toFixed(2)),
    };
  }

  /**
   * Get disk usage
   */
  async getDiskUsage() {
    try {
      const output = execSync('df -BG / | tail -1').toString();
      const parts = output.split(/\s+/);

      const total = parseInt(parts[1]);
      const used = parseInt(parts[2]);
      const available = parseInt(parts[3]);
      const usagePercent = parseInt(parts[4]);

      return {
        total: total * 1024 * 1024 * 1024, // Convert to bytes
        used: used * 1024 * 1024 * 1024,
        available: available * 1024 * 1024 * 1024,
        usagePercent,
      };
    } catch (error) {
      console.error('Error getting disk usage:', error);
      return { total: 0, used: 0, available: 0, usagePercent: 0 };
    }
  }

  /**
   * Get active database connections
   */
  async getDatabaseConnections() {
    const query = `
      SELECT COUNT(*) as count
      FROM pg_stat_activity
      WHERE datname = current_database()
    `;

    const { rows } = await pool.query(query);
    return parseInt(rows[0].count);
  }

  /**
   * Save metrics to database
   */
  async saveMetrics(metrics) {
    const query = `
      INSERT INTO system_metrics (
        cpu_usage,
        ram_usage,
        disk_usage,
        disk_available,
        active_connections,
        recorded_at
      ) VALUES ($1, $2, $3, $4, $5, NOW())
    `;

    await pool.query(query, [
      metrics.cpu,
      metrics.ram.usagePercent,
      metrics.disk.usagePercent,
      metrics.disk.available,
      metrics.connections,
    ]);
  }

  /**
   * Check thresholds and send alerts
   */
  async checkThresholds(metrics) {
    const alerts = [];

    // CPU threshold: 80%
    if (metrics.cpu > 80) {
      alerts.push({
        type: 'CPU',
        value: metrics.cpu,
        threshold: 80,
        message: `CPU usage is high: ${metrics.cpu}%`,
      });
    }

    // RAM threshold: 85%
    if (metrics.ram.usagePercent > 85) {
      alerts.push({
        type: 'RAM',
        value: metrics.ram.usagePercent,
        threshold: 85,
        message: `RAM usage is high: ${metrics.ram.usagePercent}%`,
      });
    }

    // Disk threshold: 90%
    if (metrics.disk.usagePercent > 90) {
      alerts.push({
        type: 'Disk',
        value: metrics.disk.usagePercent,
        threshold: 90,
        message: `Disk usage is critical: ${metrics.disk.usagePercent}%`,
      });
    }

    // Send alerts if any
    if (alerts.length > 0) {
      await this.sendAlerts(alerts);
    }
  }

  /**
   * Send alert emails to admins
   */
  async sendAlerts(alerts) {
    const adminsQuery = `
      SELECT email, full_name
      FROM users
      WHERE role = 'admin' AND is_active = true
    `;

    const { rows: admins } = await pool.query(adminsQuery);

    for (const admin of admins) {
      await emailService.sendEmail({
        to: admin.email,
        subject: '⚠️ System Alert - High Resource Usage',
        template: 'system-alert',
        data: {
          adminName: admin.full_name,
          alerts,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  /**
   * Get metrics history
   */
  async getMetricsHistory(hours = 24) {
    const query = `
      SELECT *
      FROM system_metrics
      WHERE recorded_at >= NOW() - INTERVAL '${hours} hours'
      ORDER BY recorded_at DESC
    `;

    const { rows } = await pool.query(query);
    return rows;
  }

  /**
   * Get storage usage breakdown
   */
  async getStorageBreakdown() {
    const queries = {
      database: `
        SELECT pg_database_size(current_database()) as size
      `,
      
      backups: `
        SELECT SUM(file_size) as size
        FROM backup_logs
        WHERE status = 'success'
      `,
      
      videos: `
        SELECT COUNT(*) as count, storage_location
        FROM videos
        GROUP BY storage_location
      `,
    };

    const [dbSize, backupSize, videoCount] = await Promise.all([
      pool.query(queries.database),
      pool.query(queries.backups),
      pool.query(queries.videos),
    ]);

    return {
      database: parseInt(dbSize.rows[0].size),
      backups: parseInt(backupSize.rows[0]?.size || 0),
      videos: videoCount.rows,
    };
  }
}

module.exports = new SystemMonitoringService();
```

---

## 11. HỆ THỐNG BACKUP TỰ ĐỘNG

### 11.1 Backup Service

```javascript
// src/services/backup.service.js
const { execSync } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const archiver = require('archiver');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const pool = require('../config/database');
const emailService = require('./email.service');
const logger = require('../utils/logger');

class BackupService {
  constructor() {
    this.backupDir = '/var/backups/elearning';
    this.maxBackups = 3;
    
    this.s3Client = new S3Client({
      region: process.env.S3_REGION,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY,
      },
      endpoint: process.env.S3_ENDPOINT,
    });
  }

  /**
   * Perform full system backup
   */
  async performFullBackup() {
    const backupId = `backup_${Date.now()}`;
    const startTime = new Date();
    
    logger.info(`Starting full backup: ${backupId}`);

    try {
      // Create backup log entry
      const logQuery = `
        INSERT INTO backup_logs (backup_type, status, started_at)
        VALUES ('full_system', 'pending', NOW())
        RETURNING id
      `;
      const { rows: [backupLog] } = await pool.query(logQuery);

      // Ensure backup directory exists
      await fs.mkdir(this.backupDir, { recursive: true });

      // 1. Backup database
      logger.info('Backing up database...');
      const dbBackupPath = await this.backupDatabase(backupId);

      // 2. Backup application files
      logger.info('Backing up application files...');
      const appBackupPath = await this.backupApplicationFiles(backupId);

      // 3. Backup configuration files
      logger.info('Backing up configuration files...');
      const configBackupPath = await this.backupConfigFiles(backupId);

      // 4. Create master archive
      logger.info('Creating master archive...');
      const masterArchivePath = await this.createMasterArchive(backupId, [
        dbBackupPath,
        appBackupPath,
        configBackupPath,
      ]);

      // 5. Encrypt backup
      logger.info('Encrypting backup...');
      const encryptedPath = await this.encryptBackup(masterArchivePath);

      // 6. Get file stats
      const stats = await fs.stat(encryptedPath);

      // 7. Upload to S3 (optional)
      let s3Key = null;
      if (process.env.BACKUP_TO_S3 === 'true') {
        logger.info('Uploading to S3...');
        s3Key = await this.uploadToS3(encryptedPath, backupId);
      }

      // 8. Update backup log
      const completedAt = new Date();
      await pool.query(`
        UPDATE backup_logs
        SET status = 'success',
            file_path = $1,
            file_size = $2,
            s3_key = $3,
            completed_at = $4
        WHERE id = $5
      `, [encryptedPath, stats.size, s3Key, completedAt, backupLog.id]);

      // 9. Cleanup old backups
      await this.cleanupOldBackups();

      // 10. Send email notification
      await this.sendBackupNotification(backupLog.id, {
        success: true,
        filePath: encryptedPath,
        fileSize: stats.size,
        duration: (completedAt - startTime) / 1000,
      });

      logger.info(`Backup completed successfully: ${backupId}`);

      return {
        success: true,
        backupId: backupLog.id,
        filePath: encryptedPath,
        fileSize: stats.size,
      };
    } catch (error) {
      logger.error('Backup failed:', error);

      // Update backup log with error
      await pool.query(`
        UPDATE backup_logs
        SET status = 'failed',
            error_message = $1,
            completed_at = NOW()
        WHERE backup_type = 'full_system'
          AND status = 'pending'
      `, [error.message]);

      // Send failure notification
      await this.sendBackupNotification(null, {
        success: false,
        error: error.message,
      });

      throw error;
    }
  }

  /**
   * Backup PostgreSQL database
   */
  async backupDatabase(backupId) {
    const filename = `db_${backupId}.sql`;
    const outputPath = path.join(this.backupDir, filename);

    const command = `PGPASSWORD="${process.env.DB_PASSWORD}" pg_dump -h ${process.env.DB_HOST} -U ${process.env.DB_USER} -d ${process.env.DB_NAME} -F p -f ${outputPath}`;

    try {
      execSync(command, { stdio: 'pipe' });
      
      // Compress
      execSync(`gzip ${outputPath}`);
      
      return `${outputPath}.gz`;
    } catch (error) {
      logger.error('Database backup failed:', error);
      throw error;
    }
  }

  /**
   * Backup application files
   */
  async backupApplicationFiles(backupId) {
    const filename = `app_${backupId}.tar.gz`;
    const outputPath = path.join(this.backupDir, filename);

    // Directories to backup
    const appDirs = [
      '/var/www/elearning/backend',
      '/var/www/elearning/frontend',
    ];

    const excludePatterns = [
      'node_modules',
      '.git',
      '.env',
      'logs',
      'tmp',
    ];

    const excludeFlags = excludePatterns.map(p => `--exclude='${p}'`).join(' ');
    const command = `tar -czf ${outputPath} ${excludeFlags} ${appDirs.join(' ')}`;

    try {
      execSync(command, { stdio: 'pipe' });
      return outputPath;
    } catch (error) {
      logger.error('Application files backup failed:', error);
      throw error;
    }
  }

  /**
   * Backup configuration files
   */
  async backupConfigFiles(backupId) {
    const filename = `config_${backupId}.tar.gz`;
    const outputPath = path.join(this.backupDir, filename);

    const configFiles = [
      '/etc/nginx/sites-available/elearning',
      '/etc/systemd/system/elearning-api.service',
      '/etc/systemd/system/elearning-frontend.service',
    ];

    const command = `tar -czf ${outputPath} ${configFiles.join(' ')}`;

    try {
      execSync(command, { stdio: 'pipe' });
      return outputPath;
    } catch (error) {
      logger.error('Configuration backup failed:', error);
      throw error;
    }
  }

  /**
   * Create master archive from all backup files
   */
  async createMasterArchive(backupId, backupFiles) {
    const filename = `full_backup_${backupId}.zip`;
    const outputPath = path.join(this.backupDir, filename);

    return new Promise((resolve, reject) => {
      const output = require('fs').createWriteStream(outputPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => resolve(outputPath));
      archive.on('error', reject);

      archive.pipe(output);

      // Add all backup files
      for (const file of backupFiles) {
        archive.file(file, { name: path.basename(file) });
      }

      // Add metadata
      archive.append(JSON.stringify({
        backupId,
        timestamp: new Date().toISOString(),
        version: process.env.APP_VERSION || '1.0.0',
      }), { name: 'metadata.json' });

      archive.finalize();
    });
  }

  /**
   * Encrypt backup file
   */
  async encryptBackup(filePath) {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(process.env.BACKUP_ENCRYPTION_KEY, 'hex');
    const iv = crypto.randomBytes(16);

    const input = await fs.readFile(filePath);
    
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(input);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    // Save encrypted file with IV prepended
    const encryptedPath = `${filePath}.enc`;
    const output = Buffer.concat([iv, encrypted]);
    await fs.writeFile(encryptedPath, output);

    // Delete unencrypted file
    await fs.unlink(filePath);

    return encryptedPath;
  }

  /**
   * Decrypt backup file
   */
  async decryptBackup(encryptedPath, outputPath) {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(process.env.BACKUP_ENCRYPTION_KEY, 'hex');

    const input = await fs.readFile(encryptedPath);
    
    // Extract IV (first 16 bytes)
    const iv = input.slice(0, 16);
    const encrypted = input.slice(16);

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    await fs.writeFile(outputPath, decrypted);
    
    return outputPath;
  }

  /**
   * Upload backup to S3
   */
  async uploadToS3(filePath, backupId) {
    const fileContent = await fs.readFile(filePath);
    const s3Key = `backups/${backupId}/${path.basename(filePath)}`;

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: s3Key,
      Body: fileContent,
      StorageClass: 'GLACIER', // Use Glacier for cost-effective long-term storage
    });

    await this.s3Client.send(command);

    return s3Key;
  }

  /**
   * Cleanup old backups (keep only 3 latest)
   */
  async cleanupOldBackups() {
    // Get all successful backups
    const query = `
      SELECT id, file_path
      FROM backup_logs
      WHERE status = 'success'
        AND backup_type = 'full_system'
      ORDER BY completed_at DESC
    `;

    const { rows } = await pool.query(query);

    // Keep only the latest 3 backups
    const toDelete = rows.slice(this.maxBackups);

    for (const backup of toDelete) {
      try {
        // Delete file
        if (backup.file_path) {
          await fs.unlink(backup.file_path);
        }

        // Delete from database
        await pool.query('DELETE FROM backup_logs WHERE id = $1', [backup.id]);

        logger.info(`Deleted old backup: ${backup.id}`);
      } catch (error) {
        logger.error(`Failed to delete backup ${backup.id}:`, error);
      }
    }
  }

  /**
   * Send backup notification email
   */
  async sendBackupNotification(backupId, result) {
    const adminsQuery = `
      SELECT email, full_name
      FROM users
      WHERE role = 'admin' AND is_active = true
    `;

    const { rows: admins } = await pool.query(adminsQuery);

    for (const admin of admins) {
      await emailService.sendEmail({
        to: admin.email,
        subject: result.success 
          ? '✅ Backup Completed Successfully'
          : '❌ Backup Failed',
        template: 'backup-notification',
        data: {
          adminName: admin.full_name,
          success: result.success,
          backupId,
          filePath: result.filePath,
          fileSize: result.fileSize ? this.formatBytes(result.fileSize) : null,
          duration: result.duration ? `${result.duration.toFixed(2)}s` : null,
          error: result.error,
          downloadUrl: result.success 
            ? `${process.env.API_URL}/api/admin/backups/${backupId}/download`
            : null,
        },
      });
    }

    // Mark email as sent
    if (backupId) {
      await pool.query(
        'UPDATE backup_logs SET email_sent = true WHERE id = $1',
        [backupId]
      );
    }
  }

  /**
   * Get backup download URL
   */
  async getBackupDownloadUrl(backupId) {
    const query = 'SELECT file_path FROM backup_logs WHERE id = $1 AND status = $2';
    const { rows } = await pool.query(query, [backupId, 'success']);

    if (rows.length === 0) {
      throw new Error('Backup not found');
    }

    return rows[0].file_path;
  }

  /**
   * List available backups
   */
  async listBackups() {
    const query = `
      SELECT
        id,
        backup_type,
        file_size,
        status,
        started_at,
        completed_at,
        email_sent,
        downloaded
      FROM backup_logs
      WHERE status = 'success'
      ORDER BY completed_at DESC
    `;

    const { rows } = await pool.query(query);
    return rows;
  }

  /**
   * Format bytes to human-readable size
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

module.exports = new BackupService();
```

### 11.2 Backup Cron Job

```javascript
// src/jobs/backup.job.js
const cron = require('node-cron');
const backupService = require('../services/backup.service');
const logger = require('../utils/logger');

class BackupJob {
  /**
   * Start backup cron jobs
   */
  start() {
    // Daily backup at 2:00 AM
    cron.schedule('0 2 * * *', async () => {
      logger.info('Starting scheduled backup...');
      
      try {
        await backupService.performFullBackup();
        logger.info('Scheduled backup completed successfully');
      } catch (error) {
        logger.error('Scheduled backup failed:', error);
      }
    }, {
      scheduled: true,
      timezone: 'Asia/Ho_Chi_Minh',
    });

    logger.info('Backup cron job started - Daily at 2:00 AM');
  }
}

module.exports = new BackupJob();
```

### 11.3 Backup Controller

```javascript
// src/controllers/admin/backup.controller.js
const backupService = require('../../services/backup.service');
const logger = require('../../utils/logger');

class BackupController {
  /**
   * Trigger manual backup
   */
  async createBackup(req, res, next) {
    try {
      const result = await backupService.performFullBackup();

      res.json({
        success: true,
        message: 'Backup created successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Manual backup failed:', error);
      next(error);
    }
  }

  /**
   * List all backups
   */
  async listBackups(req, res, next) {
    try {
      const backups = await backupService.listBackups();

      res.json({
        success: true,
        data: backups,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Download backup file
   */
  async downloadBackup(req, res, next) {
    try {
      const { id } = req.params;

      const filePath = await backupService.getBackupDownloadUrl(id);

      // Mark as downloaded
      const pool = require('../../config/database');
      await pool.query(
        'UPDATE backup_logs SET downloaded = true WHERE id = $1',
        [id]
      );

      res.download(filePath);
    } catch (error) {
      logger.error('Backup download failed:', error);
      next(error);
    }
  }

  /**
   * Delete backup
   */
  async deleteBackup(req, res, next) {
    try {
      const { id } = req.params;

      // Implementation
      // ...

      res.json({
        success: true,
        message: 'Backup deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BackupController();
```

---

## 12. MONITORING & ANALYTICS

### 12.1 Admin Dashboard Component

```typescript
// app/admin/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface DashboardStats {
  totalUsers: number;
  newUsers: any;
  usersByTier: { bronze: number; silver: number; gold: number };
  revenue: any;
  courses: any;
  videos: any;
  conversions: any;
  topCourses: any[];
  activeUsers: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');
  const [systemMetrics, setSystemMetrics] = useState<any>(null);

  useEffect(() => {
    loadDashboardData();
    loadSystemMetrics();

    // Refresh every 5 minutes
    const interval = setInterval(() => {
      loadDashboardData();
      loadSystemMetrics();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [dateRange]);

  const loadDashboardData = async () => {
    try {
      const endDate = new Date().toISOString();
      const startDate = new Date();
      
      switch (dateRange) {
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
      }

      const response = await fetch(
        `/api/admin/analytics/dashboard?startDate=${startDate.toISOString()}&endDate=${endDate}`,
        { credentials: 'include' }
      );

      const data = await response.json();
      setStats(data.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSystemMetrics = async () => {
    try {
      const response = await fetch('/api/admin/system/metrics', {
        credentials: 'include',
      });

      const data = await response.json();
      setSystemMetrics(data.data);
    } catch (error) {
      console.error('Failed to load system metrics:', error);
    }
  };

  if (loading || !stats) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Tổng quan hệ thống</p>
        </div>
        
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="7d">7 ngày qua</option>
            <option value="30d">30 ngày qua</option>
            <option value="90d">90 ngày qua</option>
          </select>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Tổng Users"
          value={stats.totalUsers}
          change={`+${stats.newUsers.total}`}
          changeLabel="users mới"
          icon="👥"
        />
        
        <MetricCard
          title="Doanh thu"
          value={`${(stats.revenue.total / 1000000).toFixed(1)}M`}
          change={`${stats.revenue.subscriptionCount} gói`}
          changeLabel="đã bán"
          icon="💰"
        />
        
        <MetricCard
          title="Khóa học"
          value={stats.courses.published_courses}
          change={`${stats.courses.total_courses} tổng`}
          changeLabel="courses"
          icon="📚"
        />
        
        <MetricCard
          title="Active Users"
          value={stats.activeUsers}
          change="Hôm nay"
          changeLabel="đang online"
          icon="🟢"
        />
      </div>

      {/* System Resources */}
      {systemMetrics && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Tài nguyên hệ thống</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ResourceBar
              label="CPU"
              value={systemMetrics.cpu_usage}
              max={100}
              color={systemMetrics.cpu_usage > 80 ? 'red' : 'blue'}
            />
            
            <ResourceBar
              label="RAM"
              value={systemMetrics.ram_usage}
              max={100}
              color={systemMetrics.ram_usage > 85 ? 'red' : 'blue'}
            />
            
            <ResourceBar
              label="Disk"
              value={systemMetrics.disk_usage}
              max={100}
              color={systemMetrics.disk_usage > 90 ? 'red' : 'blue'}
            />
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            Available: {(systemMetrics.disk_available / (1024**3)).toFixed(2)} GB
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Tier Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Phân bố User theo gói</h2>
          <Doughnut
            data={{
              labels: ['Đồng', 'Bạc', 'Vàng'],
              datasets: [{
                data: [
                  stats.usersByTier.bronze,
                  stats.usersByTier.silver,
                  stats.usersByTier.gold,
                ],
                backgroundColor: ['#CD7F32', '#C0C0C0', '#FFD700'],
              }],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom',
                },
              },
            }}
          />
        </div>

        {/* Revenue Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Doanh thu theo ngày</h2>
          <Line
            data={{
              labels: Object.keys(stats.revenue.daily || {}).slice(-7),
              datasets: [{
                label: 'Doanh thu (VND)',
                data: Object.values(stats.revenue.daily || {}).slice(-7),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
              }],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  display: false,
                },
              },
            }}
          />
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Conversion Funnel</h2>
        <div className="space-y-4">
          <FunnelStep
            label="Visitors"
            value={stats.conversions.visitors}
            percentage={100}
          />
          <FunnelStep
            label="Registrations"
            value={stats.conversions.registrations}
            percentage={(stats.conversions.registrations / stats.conversions.visitors) * 100}
          />
          <FunnelStep
            label="Trial Views"
            value={stats.conversions.trialViews}
            percentage={(stats.conversions.trialViews / stats.conversions.visitors) * 100}
          />
          <FunnelStep
            label="Purchases"
            value={stats.conversions.purchases}
            percentage={(stats.conversions.purchases / stats.conversions.visitors) * 100}
          />
        </div>
        <div className="mt-4 text-sm text-gray-600">
          Conversion Rate: {stats.conversions.conversionRate}% | 
          Purchase Rate: {stats.conversions.purchaseRate}%
        </div>
      </div>

      {/* Top Courses */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Top Courses</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Khóa học
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Enrollments
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Active Learners
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Completed Videos
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.topCourses.map((course: any) => (
                <tr key={course.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={course.thumbnail_url}
                        alt={course.title}
                        className="h-10 w-10 rounded object-cover mr-3"
                      />
                      <div className="text-sm font-medium text-gray-900">
                        {course.title}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {course.enrollments}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {course.active_learners}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {course.completed_videos}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function MetricCard({ title, value, change, changeLabel, icon }: any) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
          <p className="text-sm text-green-600 mt-1">
            {change} <span className="text-gray-500">{changeLabel}</span>
          </p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );
}

function ResourceBar({ label, value, max, color }: any) {
  const percentage = (value / max) * 100;
  
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm text-gray-600">{value.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${color === 'red' ? 'bg-red-500' : 'bg-blue-500'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function FunnelStep({ label, value, percentage }: any) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm text-gray-600">
          {value} ({percentage.toFixed(1)}%)
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
```

### 12.2 Cron Jobs Setup

```javascript
// src/jobs/index.js
const backupJob = require('./backup.job');
const cleanupJob = require('./cleanup.job');
const analyticsJob = require('./analytics.job');
const systemMonitoringJob = require('./system-monitoring.job');
const subscriptionJob = require('./subscription.job');

function startCronJobs() {
  // Backup job - Daily at 2:00 AM
  backupJob.start();

  // Cleanup job - Daily at 3:00 AM
  cleanupJob.start();

  // Analytics aggregation - Every hour
  analyticsJob.start();

  // System monitoring - Every 5 minutes
  systemMonitoringJob.start();

  // Check subscription expiry - Daily at 1:00 AM
  subscriptionJob.start();

  console.log('✅ All cron jobs started successfully');
}

module.exports = { startCronJobs };
```

```javascript
// src/jobs/system-monitoring.job.js
const cron = require('node-cron');
const systemMonitoringService = require('../services/system-monitoring.service');
const logger = require('../utils/logger');

class SystemMonitoringJob {
  start() {
    // Every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
      try {
        await systemMonitoringService.collectMetrics();
      } catch (error) {
        logger.error('System monitoring job failed:', error);
      }
    }, {
      scheduled: true,
      timezone: 'Asia/Ho_Chi_Minh',
    });

    logger.info('System monitoring job started - Every 5 minutes');
  }
}

module.exports = new SystemMonitoringJob();
```

```javascript
// src/jobs/cleanup.job.js
const cron = require('node-cron');
const pool = require('../config/database');
const logger = require('../utils/logger');

class CleanupJob {
  start() {
    // Daily at 3:00 AM
    cron.schedule('0 3 * * *', async () => {
      logger.info('Starting cleanup job...');

      try {
        await this.cleanOldLogs();
        await this.cleanExpiredSessions();
        await this.cleanOldAnalytics();
        
        logger.info('Cleanup job completed successfully');
      } catch (error) {
        logger.error('Cleanup job failed:', error);
      }
    }, {
      scheduled: true,
      timezone: 'Asia/Ho_Chi_Minh',
    });

    logger.info('Cleanup job started - Daily at 3:00 AM');
  }

  async cleanOldLogs() {
    // Delete logs older than 90 days
    await pool.query(`
      DELETE FROM admin_logs
      WHERE created_at < NOW() - INTERVAL '90 days'
    `);

    await pool.query(`
      DELETE FROM video_access_logs
      WHERE accessed_at < NOW() - INTERVAL '90 days'
    `);

    logger.info('Old logs cleaned');
  }

  async cleanExpiredSessions() {
    // Clean expired Redis sessions
    const redis = require('../config/redis');
    // Implementation depends on your session storage strategy
    logger.info('Expired sessions cleaned');
  }

  async cleanOldAnalytics() {
    // Delete detailed analytics older than 180 days
    await pool.query(`
      DELETE FROM analytics_events
      WHERE created_at < NOW() - INTERVAL '180 days'
    `);

    logger.info('Old analytics cleaned');
  }
}

module.exports = new CleanupJob();
```

```javascript
// src/jobs/subscription.job.js
const cron = require('node-cron');
const subscriptionService = require('../services/subscription.service');
const logger = require('../utils/logger');

class SubscriptionJob {
  start() {
    // Daily at 1:00 AM
    cron.schedule('0 1 * * *', async () => {
      logger.info('Checking subscription expiry...');

      try {
        await subscriptionService.handleExpiredSubscriptions();
        logger.info('Subscription check completed');
      } catch (error) {
        logger.error('Subscription check failed:', error);
      }
    }, {
      scheduled: true,
      timezone: 'Asia/Ho_Chi_Minh',
    });

    logger.info('Subscription job started - Daily at 1:00 AM');
  }
}

module.exports = new SubscriptionJob();
```

---

## 13. BẢO MẬT TOÀN DIỆN

### 13.1 Security Best Practices

```javascript
// src/middleware/security.middleware.js
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');

/**
 * Advanced rate limiting
 */
const createRateLimiter = (options = {}) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes
    max: options.max || 100,
    message: options.message || 'Too many requests',
    standardHeaders: true,
    legacyHeaders: false,
    // Store in Redis for distributed systems
    store: require('./redis-rate-limit-store'),
  });
};

/**
 * Speed limiter - slow down repeated requests
 */
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // allow 50 requests per windowMs without delay
  delayMs: 500, // add 500ms delay per request after delayAfter
});

/**
 * Advanced security headers
 */
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", process.env.API_URL, process.env.CDN_URL],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", process.env.CDN_URL, "blob:"],
      frameSrc: ["'self'", "https://meet.google.com"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },
});

/**
 * Prevent NoSQL injection
 */
const preventInjection = mongoSanitize({
  replaceWith: '_',
});

/**
 * Log suspicious activities
 */
const logSuspiciousActivity = async (req, type, details) => {
  const pool = require('../config/database');
  
  await pool.query(`
    INSERT INTO security_events (
      user_id,
      event_type,
      ip_address,
      user_agent,
      metadata,
      created_at
    ) VALUES ($1, $2, $3, $4, $5, NOW())
  `, [
    req.user?.id || null,
    type,
    req.ip,
    req.get('user-agent'),
    JSON.stringify(details),
  ]);
};

module.exports = {
  createRateLimiter,
  speedLimiter,
  securityHeaders,
  preventInjection,
  logSuspiciousActivity,
};
```

### 13.2 Encryption Utilities

```javascript
// src/utils/encryption.js
const crypto = require('crypto');

class Encryption {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.masterKey = Buffer.from(process.env.MASTER_ENCRYPTION_KEY, 'hex');
  }

  /**
   * Encrypt sensitive data
   */
  encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.masterKey, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Return: iv + authTag + encrypted
    return iv.toString('hex') + authTag.toString('hex') + encrypted;
  }

  /**
   * Decrypt sensitive data
   */
  decrypt(encryptedData) {
    const iv = Buffer.from(encryptedData.slice(0, 32), 'hex');
    const authTag = Buffer.from(encryptedData.slice(32, 64), 'hex');
    const encrypted = encryptedData.slice(64);
    
    const decipher = crypto.createDecipheriv(this.algorithm, this.masterKey, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Hash sensitive data (one-way)
   */
  hash(text) {
    return crypto
      .createHash('sha256')
      .update(text + process.env.SALT)
      .digest('hex');
  }

  /**
   * Generate secure random token
   */
  generateToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Encrypt file
   */
  encryptFile(inputPath, outputPath) {
    const fs = require('fs');
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipheriv(this.algorithm, this.masterKey, iv);
    const input = fs.createReadStream(inputPath);
    const output = fs.createWriteStream(outputPath);
    
    // Write IV first
    output.write(iv);
    
    input.pipe(cipher).pipe(output);
    
    return new Promise((resolve, reject) => {
      output.on('finish', resolve);
      output.on('error', reject);
    });
  }

  /**
   * Decrypt file
   */
  decryptFile(inputPath, outputPath) {
    const fs = require('fs');
    const input = fs.createReadStream(inputPath);
    const output = fs.createWriteStream(outputPath);
    
    let iv = null;
    let decipher = null;
    
    input.on('data', (chunk) => {
      if (!iv) {
        iv = chunk.slice(0, 16);
        decipher = crypto.createDecipheriv(this.algorithm, this.masterKey, iv);
        decipher.pipe(output);
        
        if (chunk.length > 16) {
          decipher.write(chunk.slice(16));
        }
      } else {
        decipher.write(chunk);
      }
    });
    
    return new Promise((resolve, reject) => {
      output.on('finish', resolve);
      output.on('error', reject);
    });
  }
}

module.exports = new Encryption();
```

### 13.3 Source Code Protection

```bash
#!/bin/bash
# scripts/protect-source.sh

# Encrypt source code in production
encrypt_source_code() {
  echo "🔒 Encrypting source code..."
  
  # Create encrypted directory
  mkdir -p /var/www/elearning/encrypted
  
  # Directories to encrypt
  DIRS=(
    "/var/www/elearning/backend/src"
    "/var/www/elearning/frontend/.next"
  )
  
  for DIR in "${DIRS[@]}"; do
    if [ -d "$DIR" ]; then
      tar -czf "${DIR}.tar.gz" -C "$(dirname $DIR)" "$(basename $DIR)"
      
      # Encrypt with GPG
      gpg --symmetric --cipher-algo AES256 \
        --passphrase "$ENCRYPTION_PASSPHRASE" \
        --batch --yes \
        "${DIR}.tar.gz"
      
      # Move to encrypted directory
      mv "${DIR}.tar.gz.gpg" /var/www/elearning/encrypted/
      
      # Remove original tar
      rm "${DIR}.tar.gz"
      
      echo "✅ Encrypted: $DIR"
    fi
  done
  
  echo "✅ Source code encryption completed"
}

# Set strict permissions
set_permissions() {
  echo "🔐 Setting strict permissions..."
  
  # Application directories - only owner can read/write/execute
  chmod -R 700 /var/www/elearning/backend
  chmod -R 700 /var/www/elearning/frontend
  
  # Configuration files - only owner can read
  chmod 600 /var/www/elearning/backend/.env
  chmod 600 /var/www/elearning/frontend/.env.local
  
  # Encrypted backups
  chmod 600 /var/www/elearning/encrypted/*
  
  # Set ownership
  chown -R www-data:www-data /var/www/elearning
  
  echo "✅ Permissions set successfully"
}

# Disable unnecessary services
harden_system() {
  echo "🛡️  Hardening system..."
  
  # Disable unnecessary services
  systemctl disable bluetooth.service
  systemctl disable cups.service
  systemctl stop bluetooth.service
  systemctl stop cups.service
  
  # Configure fail2ban for SSH protection
  cat > /etc/fail2ban/jail.local <<EOF
[sshd]
enabled = true
port = 22
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
EOF
  
  systemctl restart fail2ban
  
  # Enable automatic security updates
  apt-get install -y unattended-upgrades
  dpkg-reconfigure -plow unattended-upgrades
  
  echo "✅ System hardened successfully"
}

# Database encryption at rest
encrypt_database() {
  echo "🔒 Enabling database encryption..."
  
  # PostgreSQL encryption using pgcrypto
  sudo -u postgres psql -d elearning <<EOF
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypt sensitive columns
ALTER TABLE users 
  ALTER COLUMN email TYPE text 
  USING pgp_sym_encrypt(email, '$DB_ENCRYPTION_KEY');

ALTER TABLE users 
  ALTER COLUMN password_hash TYPE text 
  USING pgp_sym_encrypt(password_hash, '$DB_ENCRYPTION_KEY');
EOF
  
  echo "✅ Database encryption enabled"
}

# Main execution
main() {
  echo "🚀 Starting security hardening..."
  
  encrypt_source_code
  set_permissions
  harden_system
  # encrypt_database  # Optional - impacts performance
  
  echo "✅ Security hardening completed successfully!"
}

main
```

### 13.4 Database Security

```sql
-- Database security configuration

-- Create read-only user for analytics
CREATE USER analytics_readonly WITH PASSWORD 'strong_password_here';
GRANT CONNECT ON DATABASE elearning TO analytics_readonly;
GRANT USAGE ON SCHEMA public TO analytics_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO analytics_readonly;

-- Revoke dangerous permissions
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON DATABASE elearning FROM PUBLIC;

-- Enable SSL connections only
ALTER SYSTEM SET ssl = on;
ALTER SYSTEM SET ssl_cert_file = '/etc/ssl/certs/postgresql.crt';
ALTER SYSTEM SET ssl_key_file = '/etc/ssl/private/postgresql.key';

-- Enable audit logging
CREATE EXTENSION IF NOT EXISTS pgaudit;
ALTER SYSTEM SET pgaudit.log = 'all';
ALTER SYSTEM SET pgaudit.log_catalog = off;
ALTER SYSTEM SET pgaudit.log_parameter = on;

-- Row-level security example
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_isolation_policy ON users
  FOR ALL
  USING (id = current_setting('app.current_user_id')::integer);

-- Encrypt sensitive columns
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Function to encrypt data
CREATE OR REPLACE FUNCTION encrypt_text(data text) 
RETURNS text AS $$
BEGIN
  RETURN encode(
    pgp_sym_encrypt(
      data,
      current_setting('app.encryption_key')
    ),
    'base64'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrypt data
CREATE OR REPLACE FUNCTION decrypt_text(encrypted_data text) 
RETURNS text AS $$
BEGIN
  RETURN pgp_sym_decrypt(
    decode(encrypted_data, 'base64'),
    current_setting('app.encryption_key')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 14. OPTIMIZATION & PERFORMANCE

### 14.1 Database Optimization

```sql
-- Performance optimization queries

-- Analyze table statistics
ANALYZE VERBOSE;

-- Reindex all tables
REINDEX DATABASE elearning;

-- Vacuum to reclaim space
VACUUM FULL ANALYZE;

-- Create materialized view for analytics
CREATE MATERIALIZED VIEW mv_course_stats AS
SELECT
  c.id as course_id,
  c.title,
  COUNT(DISTINCT ce.user_id) as total_enrollments,
  COUNT(DISTINCT vp.user_id) as active_learners,
  AVG(ce.progress_percentage) as avg_progress,
  COUNT(*) FILTER (WHERE vp.completed = true) as completed_videos,
  SUM(v.duration) as total_duration
FROM courses c
LEFT JOIN course_enrollments ce ON c.id = ce.course_id
LEFT JOIN videos v ON c.id = v.course_id
LEFT JOIN video_progress vp ON v.id = vp.video_id
WHERE c.is_published = true
GROUP BY c.id, c.title;

-- Refresh materialized view (run hourly)
CREATE OR REPLACE FUNCTION refresh_course_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_course_stats;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for common queries
CREATE INDEX CONCURRENTLY idx_videos_course_order 
  ON videos(course_id, order_index);

CREATE INDEX CONCURRENTLY idx_progress_user_completed 
  ON video_progress(user_id, completed);

CREATE INDEX CONCURRENTLY idx_enrollments_user_progress 
  ON course_enrollments(user_id, progress_percentage);

CREATE INDEX CONCURRENTLY idx_analytics_created_type 
  ON analytics_events(created_at, event_type);

-- Partial indexes for specific queries
CREATE INDEX CONCURRENTLY idx_active_subscriptions 
  ON subscriptions(user_id, end_date) 
  WHERE is_active = true;

CREATE INDEX CONCURRENTLY idx_published_courses 
  ON courses(tier_required, created_at) 
  WHERE is_published = true;
```

### 14.2 Redis Caching Strategy

```javascript
// src/middleware/cache.middleware.js
const redis = require('../config/redis');
const logger = require('../utils/logger');

/**
 * Cache middleware factory
 */
function cacheMiddleware(options = {}) {
  const {
    ttl = 300, // 5 minutes default
    keyPrefix = 'api',
    conditional = null, // Function to determine if should cache
  } = options;

  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Check conditional caching
    if (conditional && !conditional(req)) {
      return next();
    }

    // Generate cache key
    const cacheKey = generateCacheKey(req, keyPrefix);

    try {
      // Try to get from cache
      const cached = await redis.get(cacheKey);

      if (cached) {
        logger.debug(`Cache hit: ${cacheKey}`);
        
        return res.json(JSON.parse(cached));
      }

      // Cache miss - intercept response
      const originalJson = res.json.bind(res);
      
      res.json = function(data) {
        // Cache the response
        redis.setex(cacheKey, ttl, JSON.stringify(data))
          .catch(err => logger.error('Cache set error:', err));

        return originalJson(data);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
}

/**
 * Generate cache key from request
 */
function generateCacheKey(req, prefix) {
  const userId = req.user?.id || 'guest';
  const path = req.path;
  const query = JSON.stringify(req.query);
  
  return `${prefix}:${userId}:${path}:${query}`;
}

/**
 * Invalidate cache patterns
 */
async function invalidateCache(pattern) {
  try {
    const keys = await redis.keys(pattern);
    
    if (keys.length > 0) {
      await redis.del(...keys);
      logger.info(`Invalidated ${keys.length} cache keys matching: ${pattern}`);
    }
  } catch (error) {
    logger.error('Cache invalidation error:', error);
  }
}

/**
 * Cache decorator for service methods
 */
function cached(ttl = 300) {
  return function(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function(...args) {
      const cacheKey = `method:${propertyKey}:${JSON.stringify(args)}`;
      
      try {
        const cached = await redis.get(cacheKey);
        
        if (cached) {
          return JSON.parse(cached);
        }

        const result = await originalMethod.apply(this, args);
        
        await redis.setex(cacheKey, ttl, JSON.stringify(result));
        
        return result;
      } catch (error) {
        logger.error('Method cache error:', error);
        return await originalMethod.apply(this, args);
      }
    };

    return descriptor;
  };
}

module.exports = {
  cacheMiddleware,
  invalidateCache,
  cached,
};
```

### 14.3 PM2 Configuration

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'elearning-api',
      script: './src/server.js',
      instances: 2, // 2 instances for 4 CPU cores
      exec_mode: 'cluster',
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '10s',
      listen_timeout: 10000,
      kill_timeout: 5000,
    },
    {
      name: 'elearning-frontend',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/elearning/frontend',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      autorestart: true,
    },
  ],
};
```

### 14.4 CDN Configuration

```javascript
// Cloudflare Workers script for advanced caching
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // Bypass cache for API requests
  if (url.pathname.startsWith('/api/')) {
    return fetch(request)
  }
  
  // Cache static assets aggressively
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|webp|svg|woff2)$/)) {
    const cache = caches.default
    let response = await cache.match(request)
    
    if (!response) {
      response = await fetch(request)
      
      if (response.ok) {
        const headers = new Headers(response.headers)
        headers.set('Cache-Control', 'public, max-age=31536000, immutable')
        
        const cachedResponse = new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: headers
        })
        
        event.waitUntil(cache.put(request, cachedResponse.clone()))
        
        return cachedResponse
      }
    }
    
    return response
  }
  
  // Cache HTML with shorter TTL
  const cache = caches.default
  let response = await cache.match(request)
  
  if (!response) {
    response = await fetch(request)
    
    if (response.ok && response.headers.get('content-type')?.includes('text/html')) {
      const headers = new Headers(response.headers)
      headers.set('Cache-Control', 'public, max-age=3600, must-revalidate')
      
      const cachedResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: headers
      })
      
      event.waitUntil(cache.put(request, cachedResponse.clone()))
      
      return cachedResponse
    }
  }
  
  return response
}
```

---

## 15. DEPLOYMENT GUIDE

### 15.1 Server Setup Script

```bash
#!/bin/bash
# scripts/setup-server.sh

set -e

echo "🚀 Starting E-Learning Platform Server Setup"

# Update system
echo "📦 Updating system packages..."
apt-get update
apt-get upgrade -y

# Install essential packages
echo "📦 Installing essential packages..."
apt-get install -y \
  curl \
  git \
  build-essential \
  software-properties-common \
  ufw \
  fail2ban \
  nginx \
  certbot \
  python3-certbot-nginx

# Install Node.js 20
echo "📦 Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install PM2
echo "📦 Installing PM2..."
npm install -g pm2

# Install PostgreSQL 16
echo "📦 Installing PostgreSQL 16..."
sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
apt-get update
apt-get install -y postgresql-16 postgresql-contrib-16

# Install Redis
echo "📦 Installing Redis..."
apt-get install -y redis-server

# Install FFmpeg
echo "📦 Installing FFmpeg..."
apt-get install -y ffmpeg

# Configure PostgreSQL
echo "🔧 Configuring PostgreSQL..."
sudo -u postgres psql <<EOF
CREATE DATABASE elearning;
CREATE USER elearning_user WITH ENCRYPTED PASSWORD '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON DATABASE elearning TO elearning_user;
ALTER DATABASE elearning OWNER TO elearning_user;
EOF

# Configure PostgreSQL for performance
cat > /etc/postgresql/16/main/conf.d/performance.conf <<EOF
# Performance tuning for 6GB RAM
shared_buffers = 1536MB
effective_cache_size = 4GB
maintenance_work_mem = 384MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 16MB
min_wal_size = 1GB
max_wal_size = 4GB
max_connections = 200
EOF

systemctl restart postgresql

# Configure Redis
echo "🔧 Configuring Redis..."
cat > /etc/redis/redis.conf <<EOF
bind 127.0.0.1 ::1
port 6379
maxmemory 512mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
EOF

systemctl restart redis-server

# Configure UFW Firewall
echo "🔒 Configuring firewall..."
ufw --force enable
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw limit 22/tcp

# Configure fail2ban
echo "🔒 Configuring fail2ban..."
cat > /etc/fail2ban/jail.local <<EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = 22
logpath = /var/log/auth.log

[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log
EOF

systemctl restart fail2ban

# Create application directories
echo "📁 Creating application directories..."
mkdir -p /var/www/elearning/{backend,frontend}
mkdir -p /var/backups/elearning
mkdir -p /var/www/videos
mkdir -p /var/log/elearning

# Set ownership
chown -R www-data:www-data /var/www/elearning
chown -R www-data:www-data /var/www/videos
chown -R www-data:www-data /var/backups/elearning

echo "✅ Server setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Clone your application code to /var/www/elearning"
echo "2. Configure environment variables"
echo "3. Run database migrations"
echo "4. Build frontend and backend"
echo "5. Configure Nginx"
echo "6. Setup SSL with certbot"
echo "7. Start services with PM2"
```

### 15.2 Application Deployment

```bash
#!/bin/bash
# scripts/deploy.sh

set -e

APP_DIR="/var/www/elearning"
BACKUP_DIR="/var/backups/elearning"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "🚀 Starting deployment..."

# Create backup of current version
echo "💾 Creating backup..."
if [ -d "$APP_DIR/backend" ]; then
  tar -czf "$BACKUP_DIR/backup_$TIMESTAMP.tar.gz" -C "$APP_DIR" backend frontend
  echo "✅ Backup created: backup_$TIMESTAMP.tar.gz"
fi

# Pull latest code
echo "📥 Pulling latest code..."
cd "$APP_DIR"

# Backend
cd "$APP_DIR/backend"
git pull origin main

echo "📦 Installing backend dependencies..."
npm ci --production

echo "🔨 Running database migrations..."
npm run migrate

# Frontend
cd "$APP_DIR/frontend"
git pull origin main

echo "📦 Installing frontend dependencies..."
npm ci

echo "🔨 Building frontend..."
npm run build

# Restart services
echo "🔄 Restarting services..."
pm2 restart elearning-api
pm2 restart elearning-frontend

# Wait for services to start
sleep 5

# Health check
echo "🏥 Running health checks..."
BACKEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health)
FRONTEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001)

if [ "$BACKEND_HEALTH" == "200" ] && [ "$FRONTEND_HEALTH" == "200" ]; then
  echo "✅ Deployment successful!"
  
  # Clean old backups (keep last 5)
  cd "$BACKUP_DIR"
  ls -t backup_*.tar.gz | tail -n +6 | xargs -r rm
  
  echo "✅ Cleaned old backups"
else
  echo "❌ Health check failed!"
  echo "Backend: $BACKEND_HEALTH, Frontend: $FRONTEND_HEALTH"
  
  # Rollback
  echo "🔙 Rolling back..."
  cd "$BACKUP_DIR"
  LATEST_BACKUP=$(ls -t backup_*.tar.gz | head -1)
  
  if [ -n "$LATEST_BACKUP" ]; then
    tar -xzf "$LATEST_BACKUP" -C "$APP_DIR"
    pm2 restart all
    echo "✅ Rolled back to previous version"
  fi
  
  exit 1
fi

# Send deployment notification
echo "📧 Sending deployment notification..."
curl -X POST "${SLACK_WEBHOOK_URL}" \
  -H 'Content-Type: application/json' \
  -d "{\"text\":\"✅ E-Learning Platform deployed successfully at $(date)\"}"

echo "🎉 Deployment completed!"
```

### 15.3 Nginx Configuration

```nginx
# /etc/nginx/sites-available/elearning

# Rate limiting zones
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=video_limit:10m rate=2r/s;

# Upstream servers
upstream backend_api {
  least_conn;
  server 127.0.0.1:3000 weight=1 max_fails=3 fail_timeout=30s;
}

upstream frontend_app {
  server 127.0.0.1:3001;
}

# Redirect HTTP to HTTPS
server {
  listen 80;
  listen [::]:80;
  server_name yourdomain.com www.yourdomain.com;
  
  # Allow certbot
  location /.well-known/acme-challenge/ {
    root /var/www/certbot;
  }
  
  location / {
    return 301 https://$server_name$request_uri;
  }
}

# Main HTTPS server
server {
  listen 443 ssl http2;
  listen [::]:443 ssl http2;
  server_name yourdomain.com www.yourdomain.com;

  # SSL Configuration
  ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
  ssl_session_timeout 1d;
  ssl_session_cache shared:SSL:50m;
  ssl_session_tickets off;

  # Modern SSL configuration
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
  ssl_prefer_server_ciphers off;

  # HSTS
  add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

  # Security headers
  add_header X-Frame-Options "DENY" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-XSS-Protection "1; mode=block" always;
  add_header Referrer-Policy "strict-origin-when-cross-origin" always;
  add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

  # Logging
  access_log /var/log/nginx/elearning-access.log;
  error_log /var/log/nginx/elearning-error.log;

  # Max body size for video uploads
  client_max_body_size 500M;

  # Backend API
  location /api/ {
    limit_req zone=api_limit burst=20 nodelay;
    
    proxy_pass http://backend_api;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    
    # Timeouts
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
  }

  # Video files (VPS storage)
  location /videos/ {
    limit_req zone=video_limit burst=5 nodelay;
    
    alias /var/www/videos/;
    
    # Secure link verification
    secure_link $arg_signature,$arg_expires;
    secure_link_md5 "$secure_link_expires$uri$arg_user $video_secret_key";

    if ($secure_link = "") {
      return 403;
    }

    if ($secure_link = "0") {
      return 410;
    }

    # CORS for HLS
    add_header Access-Control-Allow-Origin "https://yourdomain.com" always;
    add_header Access-Control-Allow-Methods "GET, HEAD, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Range, Content-Type" always;

    # Cache control
    expires 1h;
    add_header Cache-Control "private, no-transform";

    # Support byte-range requests
    add_header Accept-Ranges bytes;

    # Disable access logging for video segments
    access_log off;

    # HLS content types
    types {
      application/vnd.apple.mpegurl m3u8;
      video/mp2t ts;
    }
  }

  # Frontend application
  location / {
    proxy_pass http://frontend_app;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
  }

  # Static files caching
  location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }

  # Gzip compression
  gzip on;
  gzip_vary on;
  gzip_proxied any;
  gzip_comp_level 6;
  gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;
  gzip_disable "msie6";
}
```

### 15.4 Systemd Services

```ini
# /etc/systemd/system/elearning-api.service
[Unit]
Description=E-Learning API Server
After=network.target postgresql.service redis.service

[Service]
Type=forking
User=www-data
Group=www-data
WorkingDirectory=/var/www/elearning/backend
Environment="NODE_ENV=production"
ExecStart=/usr/bin/pm2 start ecosystem.config.js --only elearning-api
ExecReload=/usr/bin/pm2 reload ecosystem.config.js --only elearning-api
ExecStop=/usr/bin/pm2 stop ecosystem.config.js --only elearning-api
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```ini
# /etc/systemd/system/elearning-frontend.service
[Unit]
Description=E-Learning Frontend Server
After=network.target

[Service]
Type=forking
User=www-data
Group=www-data
WorkingDirectory=/var/www/elearning/frontend
Environment="NODE_ENV=production"
ExecStart=/usr/bin/pm2 start ecosystem.config.js --only elearning-frontend
ExecReload=/usr/bin/pm2 reload ecosystem.config.js --only elearning-frontend
ExecStop=/usr/bin/pm2 stop ecosystem.config.js --only elearning-frontend
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### 15.5 SSL Certificate Setup

```bash
#!/bin/bash
# scripts/setup-ssl.sh

DOMAIN="yourdomain.com"
EMAIL="admin@yourdomain.com"

echo "🔒 Setting up SSL certificate..."

# Install certbot
apt-get install -y certbot python3-certbot-nginx

# Obtain certificate
certbot --nginx \
  -d $DOMAIN \
  -d www.$DOMAIN \
  --non-interactive \
  --agree-tos \
  --email $EMAIL \
  --redirect

# Setup auto-renewal
cat > /etc/systemd/system/certbot-renewal.service <<EOF
[Unit]
Description=Certbot Renewal

[Service]
Type=oneshot
ExecStart=/usr/bin/certbot renew --quiet --post-hook "systemctl reload nginx"
EOF

cat > /etc/systemd/system/certbot-renewal.timer <<EOF
[Unit]
Description=Certbot Renewal Timer

[Timer]
OnCalendar=daily
RandomizedDelaySec=1h
Persistent=true

[Install]
WantedBy=timers.target
EOF

systemctl enable certbot-renewal.timer
systemctl start certbot-renewal.timer

echo "✅ SSL certificate setup completed"
```

---

## 16. MAINTENANCE & TROUBLESHOOTING

### 16.1 Common Issues and Solutions

```bash
#!/bin/bash
# scripts/troubleshoot.sh

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 E-Learning Platform Troubleshooting Tool"
echo ""

# Check services status
check_services() {
  echo "📋 Checking services..."
  
  services=("nginx" "postgresql" "redis-server" "fail2ban")
  
  for service in "${services[@]}"; do
    if systemctl is-active --quiet $service; then
      echo -e "${GREEN}✓${NC} $service is running"
    else
      echo -e "${RED}✗${NC} $service is not running"
      echo "  → Try: systemctl restart $service"
    fi
  done
  
  # Check PM2 processes
  if pm2 list | grep -q "online"; then
    echo -e "${GREEN}✓${NC} PM2 processes are running"
  else
    echo -e "${RED}✗${NC} PM2 processes are not running"
    echo "  → Try: pm2 restart all"
  fi
}

# Check disk space
check_disk() {
  echo ""
  echo "💾 Checking disk space..."
  
  DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
  
  if [ $DISK_USAGE -gt 90 ]; then
    echo -e "${RED}✗${NC} Disk usage is critical: ${DISK_USAGE}%"
    echo "  → Clean old backups: rm /var/backups/elearning/backup_*.tar.gz"
    echo "  → Clean old logs: journalctl --vacuum-time=7d"
  elif [ $DISK_USAGE -gt 80 ]; then
    echo -e "${YELLOW}⚠${NC} Disk usage is high: ${DISK_USAGE}%"
  else
    echo -e "${GREEN}✓${NC} Disk usage is normal: ${DISK_USAGE}%"
  fi
}

# Check memory
check_memory() {
  echo ""
  echo "🧠 Checking memory..."
  
  MEM_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
  
  if [ $MEM_USAGE -gt 90 ]; then
    echo -e "${RED}✗${NC} Memory usage is critical: ${MEM_USAGE}%"
    echo "  → Restart services: pm2 restart all"
  elif [ $MEM_USAGE -gt 80 ]; then
    echo -e "${YELLOW}⚠${NC} Memory usage is high: ${MEM_USAGE}%"
  else
    echo -e "${GREEN}✓${NC} Memory usage is normal: ${MEM_USAGE}%"
  fi
}

# Check database connections
check_database() {
  echo ""
  echo "🗄️  Checking database..."
  
  DB_CONNECTIONS=$(sudo -u postgres psql -t -c "SELECT count(*) FROM pg_stat_activity WHERE datname='elearning';")
  
  echo "Active connections: $DB_CONNECTIONS"
  
  if [ $DB_CONNECTIONS -gt 150 ]; then
    echo -e "${YELLOW}⚠${NC} High number of database connections"
    echo "  → Check for connection leaks in application"
  fi
}

# Check logs for errors
check_logs() {
  echo ""
  echo "📋 Checking recent errors..."
  
  echo "Backend errors (last 10):"
  tail -10 /var/www/elearning/backend/logs/api-error.log 2>/dev/null || echo "No errors found"
  
  echo ""
  echo "Nginx errors (last 10):"
  tail -10 /var/log/nginx/elearning-error.log 2>/dev/null || echo "No errors found"
}

# Check SSL certificate
check_ssl() {
  echo ""
  echo "🔒 Checking SSL certificate..."
  
  EXPIRY=$(echo | openssl s_client -servername yourdomain.com -connect yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates | grep "notAfter" | cut -d= -f2)
  
  if [ -n "$EXPIRY" ]; then
    echo -e "${GREEN}✓${NC} SSL certificate is valid"
    echo "Expires: $EXPIRY"
  else
    echo -e "${RED}✗${NC} SSL certificate issue"
  fi
}

# Network connectivity
check_network() {
  echo ""
  echo "🌐 Checking network connectivity..."
  
  if ping -c 1 8.8.8.8 >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Internet connectivity OK"
  else
    echo -e "${RED}✗${NC} No internet connectivity"
  fi
  
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health | grep -q "200"; then
    echo -e "${GREEN}✓${NC} Backend API is responding"
  else
    echo -e "${RED}✗${NC} Backend API is not responding"
  fi
}

# Run all checks
main() {
  check_services
  check_disk
  check_memory
  check_database
  check_logs
  check_ssl
  check_network
  
  echo ""
  echo "✅ Troubleshooting completed"
}

main
```

### 16.2 Performance Monitoring Script

```bash
#!/bin/bash
# scripts/monitor-performance.sh

LOG_FILE="/var/log/elearning/performance.log"

# Collect metrics
timestamp=$(date +"%Y-%m-%d %H:%M:%S")
cpu_usage=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
mem_usage=$(free | grep Mem | awk '{printf "%.2f", $3/$2 * 100.0}')
disk_usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
active_connections=$(netstat -an | grep :3000 | grep ESTABLISHED | wc -l)

# Database metrics
db_connections=$(sudo -u postgres psql -t -c "SELECT count(*) FROM pg_stat_activity WHERE datname='elearning';")
db_size=$(sudo -u postgres psql -t -c "SELECT pg_size_pretty(pg_database_size('elearning'));")

# Log metrics
echo "$timestamp,CPU:${cpu_usage}%,MEM:${mem_usage}%,DISK:${disk_usage}%,CONN:${active_connections},DB_CONN:${db_connections},DB_SIZE:${db_size}" >> $LOG_FILE

# Alert if thresholds exceeded
if (( $(echo "$cpu_usage > 80" | bc -l) )); then
  echo "⚠️ HIGH CPU USAGE: ${cpu_usage}%" | mail -s "CPU Alert" admin@yourdomain.com
fi

if (( $(echo "$mem_usage > 85" | bc -l) )); then
  echo "⚠️ HIGH MEMORY USAGE: ${mem_usage}%" | mail -s "Memory Alert" admin@yourdomain.com
fi

if [ $disk_usage -gt 90 ]; then
  echo "⚠️ CRITICAL DISK USAGE: ${disk_usage}%" | mail -s "Disk Alert" admin@yourdomain.com
fi
```

### 16.3 Database Maintenance Script

```bash
#!/bin/bash
# scripts/db-maintenance.sh

echo "🔧 Starting database maintenance..."

# Analyze all tables
echo "📊 Analyzing tables..."
sudo -u postgres psql -d elearning -c "ANALYZE VERBOSE;"

# Reindex database
echo "🔄 Reindexing database..."
sudo -u postgres psql -d elearning -c "REINDEX DATABASE elearning;"

# Vacuum to reclaim space
echo "🧹 Vacuuming database..."
sudo -u postgres psql -d elearning -c "VACUUM ANALYZE;"

# Update statistics
echo "📈 Updating statistics..."
sudo -u postgres psql -d elearning -c "SELECT pg_stat_reset();"

# Check for bloat
echo "🔍 Checking for bloat..."
sudo -u postgres psql -d elearning <<EOF
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;
EOF

echo "✅ Database maintenance completed"
```

### 16.4 Log Rotation Configuration

```
# /etc/logrotate.d/elearning

/var/log/elearning/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}

/var/www/elearning/backend/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
}

/var/log/nginx/elearning-*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 `cat /var/run/nginx.pid`
        fi
    endscript
}
```

### 16.5 Emergency Recovery Procedures

```bash
#!/bin/bash
# scripts/emergency-recovery.sh

echo "🚨 EMERGENCY RECOVERY PROCEDURE"
echo ""

# Stop all services
echo "1️⃣ Stopping all services..."
systemctl stop nginx
pm2 stop all
systemctl stop postgresql
systemctl stop redis-server

# Restore from latest backup
echo "2️⃣ Restoring from latest backup..."
LATEST_BACKUP=$(ls -t /var/backups/elearning/backup_*.tar.gz | head -1)

if [ -n "$LATEST_BACKUP" ]; then
  echo "Found backup: $LATEST_BACKUP"
  
  # Backup current state
  mv /var/www/elearning /var/www/elearning.failed
  
  # Extract backup
  mkdir -p /var/www/elearning
  tar -xzf "$LATEST_BACKUP" -C /var/www/elearning
  
  echo "✅ Code restored"
else
  echo "❌ No backup found!"
  exit 1
fi

# Restore database
echo "3️⃣ Restoring database..."
systemctl start postgresql
sleep 5

LATEST_DB_BACKUP=$(ls -t /var/backups/elearning/db_*.sql.gz | head -1)

if [ -n "$LATEST_DB_BACKUP" ]; then
  sudo -u postgres psql -c "DROP DATABASE IF EXISTS elearning;"
  sudo -u postgres psql -c "CREATE DATABASE elearning;"
  gunzip -c "$LATEST_DB_BACKUP" | sudo -u postgres psql -d elearning
  
  echo "✅ Database restored"
fi

# Start services
echo "4️⃣ Starting services..."
systemctl start redis-server
sleep 2

systemctl start postgresql
sleep 2

cd /var/www/elearning/backend
pm2 start ecosystem.config.js

systemctl start nginx

# Health check
echo "5️⃣ Running health check..."
sleep 10

if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health | grep -q "200"; then
  echo "✅ RECOVERY SUCCESSFUL!"
  echo "System is back online"
else
  echo "❌ RECOVERY FAILED!"
  echo "Manual intervention required"
  exit 1
fi
```

---

## TỔNG KẾT

### Checklist Triển Khai

- [x] VPS setup và hardening
- [x] PostgreSQL database configuration
- [x] Redis cache setup
- [x] NextJS 14 frontend
- [x] NodeJS backend API
- [x] Video processing pipeline
- [x] HLS encryption
- [x] Multi-layer video protection
- [x] Google Meet integration
- [x] User tier system (Vàng, Bạc, Đồng)
- [x] Ebook download system
- [x] CMS dashboard với analytics
- [x] System monitoring
- [x] Automated backup system
- [x] Email notifications
- [x] Security hardening
- [x] Performance optimization
- [x] Deployment automation
- [x] Troubleshooting tools

### Ước Tính Chi Phí Hàng Tháng

| Dịch vụ | Chi phí |
|---------|---------|
| VPS (4 CPU, 6GB RAM, 30GB SSD) | $15-20 |
| S3 Storage (500GB) | $12-15 |
| CDN (Cloudflare Pro - optional) | $20 (hoặc Free plan) |
| Domain + SSL | $2 |
| Email Service (SendGrid/Mailgun) | $5-10 |
| **TỔNG** | **$34-67/tháng** |

### Thời Gian Triển Khai Dự Kiến

- **Week 1-2**: Setup infrastructure, database, cơ bản backend/frontend
- **Week 3-4**: Video processing, HLS encryption, streaming
- **Week 5-6**: User system, subscriptions, Google Meet integration
- **Week 7-8**: CMS dashboard, analytics, monitoring, backup
- **Week 9-10**: Security hardening, testing, optimization
- **Week 11-12**: UAT, bug fixes, deployment, documentation

**Tổng**: 12 tuần (3 tháng)

### Khả Năng Scale

**Hiện tại (VPS 4CPU/6GB):**
- ~2,000 concurrent users với CDN
- ~500GB video storage (S3)
- ~100 courses
- ~1,000 videos

**Mở rộng (khi cần):**
- Upgrade VPS: 8CPU/16GB → ~5,000 users
- Thêm load balancer → ~10,000 users
- Multiple regions → ~50,000+ users

### Liên Hệ & Hỗ Trợ

**Tài liệu tham khảo:**
- NextJS: https://nextjs.org/docs
- PostgreSQL: https://www.postgresql.org/docs/
- FFmpeg: https://ffmpeg.org/documentation.html
- Video.js: https://docs.videojs.com/

**Community:**
- GitHub Issues
- Stack Overflow
- Discord/Slack channels

---

**🎉 HOÀN THÀNH! Chúc bạn triển khai thành công hệ thống E-Learning!**
