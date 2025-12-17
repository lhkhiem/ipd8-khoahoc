// IMPORTANT: Disable dev logs in production - must be first import
import './utils/disableDevLogs';

// Load environment variables từ .env.local (phải import trước khi dùng process.env)
import './utils/loadEnv';

import express from 'express';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import fs from 'fs/promises';
import sequelize from './config/database';
// Import models to initialize associations
import './models';
import authRoutes from './routes/auth';
import postRoutes from './routes/posts';
import topicRoutes from './routes/topics';
import tagRoutes from './routes/tags';
import productRoutes from './routes/products';
import productCategoryRoutes from './routes/productCategories';
import brandRoutes from './routes/brands';
import assetRoutes from './routes/assets';
import usersRoutes from './routes/users'; // Admin users for post authors
import settingsRoutes from './routes/settings';
import mediaRoutes from './routes/media';
import healthRoutes from './routes/health';
import menuLocationRoutes from './routes/menuLocations';
import menuItemRoutes from './routes/menuItems';
// import cartRoutes from './routes/cart'; // Disabled: Customer cart management not needed
import orderRoutes from './routes/orders'; // Admin order management (not customer management)
// Ecommerce routes - COMMENTED (moved to Ecommerce Backend)
// import paymentRoutes from './routes/payments'; // Moved to Ecommerce Backend
// import wishlistRoutes from './routes/wishlist'; // Disabled: Customer wishlist management not needed
// import reviewRoutes from './routes/reviews'; // Disabled: Customer review management not needed
import trackingScriptRoutes from './routes/trackingScripts';
import analyticsRoutes from './routes/analytics';
import homepageRoutes from './routes/homepage';
import sliderRoutes from './routes/sliders';
import aboutSectionRoutes from './routes/aboutSections';
import publicPostsRoutes from './routes/publicPosts';
import publicHomepageRoutes from './routes/publicHomepage';
import publicPageMetadataRoutes from './routes/publicPageMetadata';
import contactRoutes from './routes/contacts';
import consultationRoutes from './routes/consultations';
import emailRoutes from './routes/email';
// Ecommerce routes - COMMENTED (moved to Ecommerce Backend)
// import publicProductsRoutes from './routes/publicProducts'; // Moved to Ecommerce Backend
// import publicAuthRoutes from './routes/publicAuth'; // Moved to Ecommerce Backend
import inventoryRoutes from './routes/inventory'; // Inventory management
import activityLogRoutes from './routes/activityLogs'; // Activity tracking
import syncMetadataRoutes from './routes/syncMetadata'; // Metadata sync
import debugSeoRoutes from './routes/debugSeo'; // Debug SEO
import pageMetadataRoutes from './routes/pageMetadata'; // Page metadata CRUD
import faqRoutes from './routes/faqs'; // FAQ management
// Newsletter routes - Admin routes stay in CMS Backend (public routes moved to Ecommerce Backend)
import newsletterRoutes from './routes/newsletter'; // Admin newsletter management
// import publicUserRoutes from './routes/publicUser'; // Disabled: Customer user management not needed
// import publicOrdersRoutes from './routes/publicOrders'; // Disabled: Customer orders not needed
// import publicCartRoutes from './routes/publicCart'; // Disabled: Customer cart not needed

// Environment variables đã được load bởi './utils/loadEnv' ở đầu file

export const app = express();

// Middleware
// CORS with credentials to support cookie-based auth from Admin app and Website
// CORS cấu hình cho cả Admin UI và Website khách
import { getFrontendDomain, getApiDomain, getAdminDomain } from './utils/domainUtils';

// Build allowed origins from environment variables
// Ưu tiên: CORS_ALLOWED_ORIGINS (comma-separated) > tự động build từ các env vars khác
const buildAllowedOrigins = (): string[] => {
  const origins: string[] = [];
  
  // 1. Ưu tiên: Lấy từ CORS_ALLOWED_ORIGINS (comma-separated list)
  // Ví dụ: CORS_ALLOWED_ORIGINS=http://localhost:3013,https://admin.banyco.vn,https://banyco.vn
  if (process.env.CORS_ALLOWED_ORIGINS) {
    const envOrigins = process.env.CORS_ALLOWED_ORIGINS.split(',')
      .map(origin => origin.trim())
      .filter(origin => origin.length > 0);
    origins.push(...envOrigins);
    
    // Nếu đã có CORS_ALLOWED_ORIGINS, chỉ thêm localhost trong development
    if (process.env.NODE_ENV === 'development') {
      // Thêm localhost variants cho development
      const localhostOrigins = [
        'http://localhost:3000',
        'http://localhost:3010',
        'http://localhost:3013',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3010',
        'http://127.0.0.1:3013',
      ];
      origins.push(...localhostOrigins);
    }
    
    // Remove duplicates và return
    return [...new Set(origins)];
  }
  
  // 2. Tự động build từ các biến env khác (fallback)
  
  // Development origins (chỉ trong development mode)
  if (process.env.NODE_ENV === 'development') {
    // Lấy port từ ADMIN_DOMAIN hoặc ADMIN_ORIGIN, fallback về 3013
    let adminPort = '3013';
    if (process.env.ADMIN_DOMAIN && process.env.ADMIN_DOMAIN.includes(':')) {
      adminPort = process.env.ADMIN_DOMAIN.split(':')[1];
    } else if (process.env.ADMIN_ORIGIN) {
      try {
        const url = new URL(process.env.ADMIN_ORIGIN);
        adminPort = url.port || (url.protocol === 'https:' ? '443' : '80');
      } catch {}
    }
    
    const devOrigins = [
      process.env.ADMIN_ORIGIN || `http://localhost:${adminPort}`,
      process.env.WEBSITE_ORIGIN || process.env.SITE_URL || 'http://localhost:3010',
      process.env.DEV_ORIGIN_3000 || 'http://localhost:3000',
      process.env.DEV_ORIGIN_127_3000 || 'http://127.0.0.1:3000',
      process.env.DEV_ORIGIN_127_3010 || 'http://127.0.0.1:3010',
      process.env.DEV_ORIGIN_127_3013 || `http://127.0.0.1:${adminPort}`,
      `http://localhost:${adminPort}`,
      `http://127.0.0.1:${adminPort}`,
    ];
    origins.push(...devOrigins);
  }
  
  // Production domains từ environment variables
  const frontendDomain = process.env.FRONTEND_DOMAIN;
  const apiDomain = process.env.API_DOMAIN;
  const adminDomain = process.env.ADMIN_DOMAIN;
  
  // Thêm domains với http và https variants
  if (frontendDomain) {
    origins.push(
      `http://${frontendDomain}`,
      `https://${frontendDomain}`,
      `http://www.${frontendDomain}`,
      `https://www.${frontendDomain}`
    );
  }
  
  if (apiDomain && apiDomain !== frontendDomain) {
    origins.push(
      `http://${apiDomain}`,
      `https://${apiDomain}`
    );
  }
  
  if (adminDomain) {
    origins.push(
      `http://${adminDomain}`,
      `https://${adminDomain}`
    );
  }
  
  // Legacy support: ADMIN_ORIGIN và WEBSITE_ORIGIN với full URLs
  if (process.env.ADMIN_ORIGIN && process.env.ADMIN_ORIGIN.startsWith('http')) {
    origins.push(process.env.ADMIN_ORIGIN);
    if (process.env.ADMIN_ORIGIN.startsWith('http://')) {
      origins.push(process.env.ADMIN_ORIGIN.replace('http://', 'https://'));
    }
  }
  
  if (process.env.WEBSITE_ORIGIN && process.env.WEBSITE_ORIGIN.startsWith('http')) {
    origins.push(process.env.WEBSITE_ORIGIN);
    if (process.env.WEBSITE_ORIGIN.startsWith('http://')) {
      origins.push(process.env.WEBSITE_ORIGIN.replace('http://', 'https://'));
    }
  }
  
  // PRODUCTION_DOMAINS (comma-separated list)
  if (process.env.PRODUCTION_DOMAINS) {
    const productionDomains = process.env.PRODUCTION_DOMAINS.split(',')
      .map(d => d.trim())
      .filter(d => d.length > 0);
    
    productionDomains.forEach(domain => {
      origins.push(`http://${domain}`, `https://${domain}`);
      if (domain.startsWith('www.')) {
        const withoutWww = domain.replace(/^www\./, '');
        origins.push(`http://${withoutWww}`, `https://${withoutWww}`);
      } else {
        origins.push(`http://www.${domain}`, `https://www.${domain}`);
      }
    });
  }
  
  // Remove duplicates
  return [...new Set(origins)];
};

const allowedOrigins = buildAllowedOrigins();

// Log allowed origins for debugging (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('[CORS] Allowed origins:', allowedOrigins);
}

app.use(cors({
  origin: (origin, callback) => {
    // Request không có Origin (như Postman, server-to-server, hoặc same-origin requests) → cho phép
    if (!origin) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[CORS] Request without origin - allowing');
      }
      return callback(null, true);
    }
    
    // Normalize origin (remove trailing slash)
    const normalizedOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
    
    // Nếu origin nằm trong whitelist → cho phép
    if (allowedOrigins.includes(normalizedOrigin) || allowedOrigins.includes(origin)) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[CORS] Origin allowed: ${origin}`);
      }
      return callback(null, true);
    }
    
    // Log để debug
    console.warn(`[CORS] Origin not allowed: ${origin}`);
    console.warn(`[CORS] Allowed origins:`, allowedOrigins);
    console.warn(`[CORS] Normalized origin: ${normalizedOrigin}`);
    
    // Origin lạ → chặn và báo lỗi rõ ràng
    return callback(new Error(`Origin ${origin} not allowed by CORS. Allowed origins: ${allowedOrigins.join(', ')}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// ✅ SECURITY: Rate limiting để chống DDoS và brute force
const rateLimitStore = new Map<string, { count: number; resetTime: number; blocked?: boolean; blockUntil?: number }>();

// Export to global for health endpoint to clear (development only)
if (process.env.NODE_ENV === 'development') {
  (global as any).rateLimitStore = rateLimitStore;
}

// Optimized cleanup: only run if store has entries, use recursive setTimeout to avoid overlap
function cleanupRateLimitStore() {
  if (rateLimitStore.size === 0) {
    // No entries to clean, schedule next check in 5 minutes
    setTimeout(cleanupRateLimitStore, 5 * 60 * 1000);
    return;
  }
  
  const now = Date.now();
  let cleaned = 0;
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now && (!entry.blockUntil || entry.blockUntil < now)) {
      rateLimitStore.delete(key);
      cleaned++;
    }
  }
  
  // Schedule next cleanup (sooner if we cleaned many entries)
  const nextInterval = cleaned > 100 ? 1 * 60 * 1000 : 5 * 60 * 1000;
  setTimeout(cleanupRateLimitStore, nextInterval);
}

// Start cleanup cycle
cleanupRateLimitStore();

app.use((req, res, next) => {
  // Exclude auth verify endpoint from rate limiting (it's called frequently for session checks)
  // Auth endpoints like login/register still have rate limiting for security
  if (req.path === '/api/auth/verify') {
    return next();
  }
  
  const ip = req.ip || 
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 
    req.connection.remoteAddress || 
    'unknown';
  
  // Exclude localhost IPs from rate limiting in development
  const isLocalhost = ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1' || ip.startsWith('127.') || ip === 'localhost';
  if (process.env.NODE_ENV === 'development' && isLocalhost) {
    return next();
  }
  
  const now = Date.now();
  const entry = rateLimitStore.get(ip);
  
  // Check if IP is blocked
  if (entry?.blocked && entry.blockUntil && entry.blockUntil > now) {
    const remainingTime = Math.ceil((entry.blockUntil - now) / 1000 / 60);
    console.warn(`[RateLimit] Blocked IP ${ip} - ${remainingTime} minutes remaining`);
    return res.status(429).json({
      success: false,
      error: 'Too many requests. Your IP has been temporarily blocked.',
      retryAfter: remainingTime,
    });
  }
  
  // Reset if block expired
  if (entry?.blocked && entry.blockUntil && entry.blockUntil <= now) {
    rateLimitStore.delete(ip);
  }
  
  // Rate limiting: 5000 requests per hour for general API (tăng từ 1000 để tránh block quá dễ)
  // Với 5000/giờ = ~83 requests/phút, đủ cho normal usage nhưng vẫn bảo vệ khỏi abuse
  const maxRequests = 5000; // 5000 requests per hour
  const windowMs = 60 * 60 * 1000; // 60 minutes (1 hour)
  const blockDuration = 5 * 60 * 1000; // Block 5 phút nếu vượt quá (tăng từ 1 phút)
  
  if (entry && entry.resetTime > now) {
    if (entry.count >= maxRequests) {
      // Exceeded limit - block IP
      entry.blocked = true;
      entry.blockUntil = now + blockDuration;
      console.warn(`[RateLimit] IP ${ip} exceeded limit - blocked for ${blockDuration / 1000 / 60} minutes`);
      return res.status(429).json({
        success: false,
        error: 'Too many requests. Your IP has been temporarily blocked.',
        retryAfter: Math.ceil(blockDuration / 1000 / 60),
      });
    }
    entry.count++;
  } else {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
  }
  
  // Add rate limit headers
  const currentEntry = rateLimitStore.get(ip);
  if (currentEntry) {
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - currentEntry.count));
    res.setHeader('X-RateLimit-Reset', new Date(currentEntry.resetTime).toISOString());
  }
  
  next();
});

// ✅ SECURITY: Security headers để chống các tấn công phổ biến
app.use((req, res, next) => {
  // Xóa headers có thể leak thông tin server
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');
  
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // HSTS (chỉ cho HTTPS)
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  // Content Security Policy (CSP)
  // Mục đích: Bảo vệ website khỏi XSS attacks và các tấn công khác bằng cách giới hạn các nguồn tài nguyên được phép load
  // SECURITY NOTE: 'unsafe-eval' và 'unsafe-inline' là cần thiết cho TinyMCE editor, nhưng làm giảm tính bảo mật
  // TODO: Cân nhắc sử dụng nonce-based CSP trong tương lai để tăng cường bảo mật
  
  // Build CSP string với các directives:
  const connectSrc = [
    "'self'",
    "https://ecommerce-api.banyco.vn",
    "https://api.banyco.vn",
    "https://www.google-analytics.com",
    "https://analytics.google.com",
    "https://www.googletagmanager.com",
    "https://*.google-analytics.com",
    "https://*.googletagmanager.com",
    "https:"
  ];
  
  // Thêm localhost cho development mode
  if (process.env.NODE_ENV === 'development') {
    connectSrc.push(
      "http://localhost:3011", // Backend default port
      "http://127.0.0.1:3011",
      "http://localhost:*", // Any localhost port
      "http://127.0.0.1:*" // Any 127.0.0.1 port
    );
    
    // Thêm frontend origins nếu có trong env
    if (process.env.ADMIN_ORIGIN && process.env.ADMIN_ORIGIN.includes('localhost')) {
      connectSrc.push(process.env.ADMIN_ORIGIN);
    }
    if (process.env.WEBSITE_ORIGIN && process.env.WEBSITE_ORIGIN.includes('localhost')) {
      connectSrc.push(process.env.WEBSITE_ORIGIN);
    }
  }
  
  const cspDirectives = [
    // default-src: Nguồn mặc định cho tất cả các loại tài nguyên (fallback khi không có directive cụ thể)
    "default-src 'self'",
    
    // script-src: Cho phép load JavaScript từ:
    // - 'self': Từ cùng origin (domain hiện tại)
    // - 'unsafe-inline': Cho phép inline scripts (cần cho một số thư viện)
    // - 'unsafe-eval': Cho phép eval() (CẦN THIẾT cho TinyMCE editor)
    // - https://www.google.com, https://www.gstatic.com: Google services (Analytics, Maps, etc.)
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com https://www.googletagmanager.com",
    
    // style-src: Cho phép load CSS từ:
    // - 'self': Từ cùng origin
    // - 'unsafe-inline': Cho phép inline styles (cần cho một số component)
    // - https://fonts.googleapis.com: Google Fonts CSS
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    
    // font-src: Cho phép load fonts từ:
    // - 'self': Từ cùng origin
    // - https://fonts.gstatic.com: Google Fonts files
    "font-src 'self' https://fonts.gstatic.com",
    
    // img-src: Cho phép load images từ:
    // - 'self': Từ cùng origin
    // - data:: Data URIs (base64 images)
    // - https:, http:: Tất cả các domain HTTP/HTTPS (cho phép load ảnh từ bất kỳ đâu)
    "img-src 'self' data: https: http:",
    
    // connect-src: Cho phép các kết nối network (fetch, XMLHttpRequest, WebSocket, etc.) đến:
    // - 'self': API calls đến cùng origin
    // - https://ecommerce-api.banyco.vn: Ecommerce backend API
    // - https://api.banyco.vn: CMS backend API
    // - https://www.google-analytics.com: Google Analytics 4 (GA4) - domain chính
    // - https://analytics.google.com: Google Analytics 4 (GA4) - domain collect endpoint (QUAN TRỌNG: GA4 dùng domain này để gửi data)
    // - https://www.googletagmanager.com: Google Tag Manager
    // - https://*.google-analytics.com: Tất cả subdomain của Google Analytics (wildcard cho tương lai)
    // - https://*.googletagmanager.com: Tất cả subdomain của Google Tag Manager
    // - https:: Tất cả các domain HTTPS khác (fallback cho các service khác)
    // - Localhost trong development mode
    `connect-src ${connectSrc.join(' ')}`,
    
    // frame-ancestors: Ngăn website bị embed trong iframe (chống clickjacking)
    // - 'none': Không cho phép embed ở bất kỳ đâu
    "frame-ancestors 'none'"
  ];
  
  res.setHeader('Content-Security-Policy', cspDirectives.join('; '));
  
  // Permissions Policy
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=()'
  );
  
  // Prevent caching of sensitive data
  if (req.path.startsWith('/api/auth') || req.path.startsWith('/api/admin')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  
  next();
});

// Routes
// Logging middleware for auth routes (development only)
if (process.env.NODE_ENV === 'development') {
  app.use('/api/auth', (req, res, next) => {
    console.log(`[Auth Route] ${req.method} ${req.path}`, {
      body: req.method === 'POST' ? { email: req.body?.email, hasPassword: !!req.body?.password } : undefined,
      origin: req.headers.origin,
    });
    next();
  });
}

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/product-categories', productCategoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/products', productRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/users', usersRoutes); // Admin users for post authors
app.use('/api/settings', settingsRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/public/posts', publicPostsRoutes);
app.use('/api/public/homepage', publicHomepageRoutes);
// Rate limiting specifically for page-metadata endpoint (more lenient for public API)
const pageMetadataRateLimit = new Map<string, { count: number; resetTime: number }>();

app.use('/api/public/page-metadata', (req, res, next) => {
  const ip = req.ip || 
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 
    req.connection.remoteAddress || 
    'unknown';
  const now = Date.now();
  const entry = pageMetadataRateLimit.get(ip);
  
  // Allow 200 requests per minute per IP (more lenient for public API)
  const maxRequests = 200;
  const windowMs = 60 * 1000; // 1 minute
  
  if (entry) {
    if (entry.resetTime > now) {
      // Still within window
      if (entry.count >= maxRequests) {
        return res.status(429).json({
          error: 'Too many requests. Please try again later.',
        });
      }
      entry.count += 1;
    } else {
      // Reset window
      pageMetadataRateLimit.set(ip, {
        count: 1,
        resetTime: now + windowMs,
      });
    }
  } else {
    // First request
    pageMetadataRateLimit.set(ip, {
      count: 1,
      resetTime: now + windowMs,
    });
  }
  
  next();
}, publicPageMetadataRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/sync-metadata', syncMetadataRoutes);
app.use('/api/menu-locations', menuLocationRoutes);
app.use('/api/menu-items', menuItemRoutes);
app.use('/api/tracking-scripts', trackingScriptRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/homepage', homepageRoutes);
app.use('/api/sliders', sliderRoutes);
app.use('/api/about-sections', aboutSectionRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/debug', debugSeoRoutes);
app.use('/api/page-metadata', pageMetadataRoutes);
app.use('/api/faqs', faqRoutes);

// Ecommerce routes - COMMENTED (moved to Ecommerce Backend)
// These routes are now handled by Ecommerce Backend (port 3012)
// app.use('/api/public/products', publicProductsRoutes); // Moved to Ecommerce Backend
// app.use('/api/public/auth', publicAuthRoutes); // Moved to Ecommerce Backend
// app.use('/api/payments', paymentRoutes); // Moved to Ecommerce Backend (or keep if CMS needs to manage payments)
app.use('/api/newsletter', newsletterRoutes); // Admin newsletter management (public routes moved to Ecommerce Backend)

// Orders: Admin management only (public routes moved to Ecommerce Backend)
// Note: orderRoutes contains both public (POST, GET lookup) and admin (GET, PUT, DELETE) routes
// Public routes are handled by Ecommerce Backend, admin routes remain here
app.use('/api/orders', orderRoutes); // Admin order management (public routes handled by Ecommerce Backend)

// Ensure upload and temp dirs on boot and serve uploads
(async () => {
  try {
    const uploadDir = process.env.UPLOAD_PATH || path.resolve(__dirname, '../storage/uploads');
    const tempDir = path.resolve(__dirname, '../storage/temp');
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.mkdir(tempDir, { recursive: true });
    
    // Add CORS headers for static files (images) - allow all origins for images
    const staticOptions = {
      setHeaders: (res: express.Response, filePath: string) => {
        // Allow all origins for images (no CORS restrictions for static assets)
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
      }
    };
    
    // Static: serve uploads from storage/uploads to keep public URL stable as /uploads
    app.use('/uploads', express.static(uploadDir, staticOptions));
    // Fallback to legacy uploads dir if file not found in storage
    app.use('/uploads', express.static(path.resolve(__dirname, '../uploads'), staticOptions));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Failed to ensure upload/temp dirs:', e);
  }
})();

// Basic health root handled in healthRoutes

export async function ready() {
  await sequelize.authenticate();
  // Ensure one owner exists
  try {
    const [owner] = await sequelize.query(`SELECT id FROM users WHERE role = 'owner' LIMIT 1`, { type: 'SELECT' as any });
    if (!(owner as any)?.id) {
      const first: any = await sequelize.query(`SELECT id FROM users ORDER BY created_at ASC LIMIT 1`, { type: 'SELECT' as any });
      const id = (first as any[])[0]?.id;
      if (id) {
        await sequelize.query(`UPDATE users SET role = 'owner' WHERE id = :id`, { type: 'UPDATE' as any, replacements: { id } });
        // eslint-disable-next-line no-console
        console.log('Promoted earliest user to owner');
      }
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Owner bootstrap failed or skipped:', e);
  }
}

