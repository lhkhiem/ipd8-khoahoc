# PHASE 2B: PUBLIC BACKEND API DEVELOPMENT

**Mục tiêu:** Xây dựng API backend cho public website (tách biệt hoàn toàn với CMS Backend)

**Thời gian ước tính:** 2-3 tuần

**Lưu ý:** 
- Public Backend và CMS Backend **tách biệt hoàn toàn**
- **Database:** PostgreSQL dùng chung với CMS Backend (cùng database `ipd8_db`)
- **Models:** Riêng biệt hoàn toàn - Public Backend có models riêng, không share code với CMS Backend

---

## 📋 CHECKLIST

### Setup & Infrastructure
- [ ] Setup project structure (riêng biệt với CMS Backend)
- [ ] Configure database connection (có thể share DB với CMS)
- [ ] Setup authentication middleware (cho end users)
- [ ] Setup error handling
- [ ] Setup logging
- [ ] Setup API documentation

### Core Modules
- [ ] Public Courses API
- [ ] Public Instructors API
- [ ] Enrollment API (cho users)
- [ ] Payment API (cho users)
- [ ] User Profile API
- [ ] Public Content API (Posts, Events)
- [ ] Notifications API (cho users)
- [ ] Analytics API (public stats)

### Testing & Documentation
- [ ] Unit tests
- [ ] Integration tests
- [ ] API documentation
- [ ] Postman collection

---

## 1. KIẾN TRÚC TÁCH BIỆT

### 1.1. Sự Khác Biệt Giữa CMS Backend và Public Backend

| Aspect | CMS Backend | Public Backend |
|--------|-------------|----------------|
| **Mục đích** | Admin dashboard API | Public website API |
| **Users** | Admin, Instructors | Students, Guests |
| **Authentication** | Admin JWT | User JWT (khác token) |
| **Endpoints** | `/api/admin/*` | `/api/public/*` hoặc `/api/v1/*` |
| **Permissions** | Full CRUD | Read + Limited Write |
| **Rate Limiting** | Standard | Stricter (public) |
| **CORS** | CMS Frontend only | Public Frontend only |

### 1.2. Project Structure

```
IPD8/
├── Projects/
│   └── public-backend/
│       ├── src/
│       │   ├── config/
│       │   │   ├── database.ts          # Database config (có thể share với CMS)
│       │   │   ├── auth.ts              # Auth config (cho users)
│       │   │   └── app.ts               # App config
│       │   ├── models/                  # ⚠️ Models riêng biệt, KHÔNG share với CMS Backend
│       │   ├── controllers/
│       │   │   └── public/
│       │   ├── services/
│       │   ├── routes/
│       │   ├── middleware/
│       │   ├── utils/
│       │   └── types/
│       ├── migrations/
│       └── tests/
└── shared-storage/              # ⚠️ Shared storage ở root, không trong public-backend
    ├── uploads/                 # Files đã upload (dùng chung cho CMS và Public)
    └── temp/                    # Files tạm thời
```

**Lưu ý quan trọng:**
- **Shared Storage** nằm ở root project (`shared-storage/`), không nằm trong `public-backend/`
- Cả CMS Backend và Public Backend đều sử dụng chung `shared-storage/`
- Path: `../../shared-storage/` (từ public-backend) hoặc dùng environment variable
- **Models riêng biệt:** Public Backend có models riêng (`src/models/`), không share với CMS Backend
- **Database dùng chung:** PostgreSQL database (`ipd8_db`) dùng chung với CMS Backend, nhưng models code riêng biệt

---

## 2. SETUP & INFRASTRUCTURE

### 2.1. Database Connection

**File:** `src/config/database.ts`

```typescript
// Database PostgreSQL dùng chung với CMS Backend
// Nhưng connection pool riêng biệt
// Models code riêng biệt (không share với CMS Backend)
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,           // Từ .env.local, KHÔNG hardcode
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,        // ipd8_db (dùng chung với CMS Backend)
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export default pool;
```

**Lưu ý:**
- Database dùng chung với CMS Backend (cùng `DB_NAME`)
- Connection pool riêng biệt (không share pool)
- **Models code riêng biệt** (không share models với CMS Backend)

### 2.2. Authentication Middleware (User Auth)

**File:** `src/middleware/auth.ts`

- JWT token validation cho **users** (không phải admin)
- Role checking: `guest`, `student` (không có `admin`, `instructor`)
- Permission checking cho user actions

**Khác với CMS Backend:**
- Token secret khác
- Token payload khác (user_id, role: student/guest)
- Không có admin permissions

### 2.3. Rate Limiting

**File:** `src/middleware/rateLimit.ts`

- Stricter rate limiting cho public API
- Different limits cho authenticated vs unauthenticated
- IP-based rate limiting

**Rate Limiters:**
```typescript
import rateLimit from 'express-rate-limit';

// Auth endpoints: 5 requests per 15 minutes (stricter than CMS)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

// File upload: 10 requests per hour
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Too many uploads, please try again later.',
});

// API endpoints: 100 requests per minute
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.',
});
```

---

### 2.4. Security Setup (🔴 CRITICAL)

**Priority:** 🔴 CRITICAL - Phải implement ngay trong Phase 2B

**Reference:** [SECURITY_AUDIT_REPORT.md](./SECURITY_AUDIT_REPORT.md) | [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md)

**Checklist:**
- [ ] Install và configure Helmet.js
- [ ] Setup CSRF protection
- [ ] Input validation & sanitization middleware
- [ ] File upload security enhancement
- [ ] Environment variables validation
- [ ] Security logging setup
- [ ] Password policy implementation
- [ ] **Stricter rate limiting** (khác với CMS Backend)

**Dependencies:**
```bash
npm install helmet csurf express-validator validator isomorphic-dompurify file-type sharp winston
npm install --save-dev @types/csurf
```

#### 2.4.1. Helmet.js Configuration

**File:** `src/config/security.ts`

```typescript
import helmet from 'helmet';

export const securityMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: ["'self'", process.env.API_DOMAIN, process.env.CDN_URL],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", process.env.CDN_URL],
      frameSrc: ["'self'", "https://meet.google.com"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
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
  frameguard: {
    action: 'deny',
  },
  noSniff: true,
  xssFilter: true,
});
```

#### 2.4.2. CSRF Protection

**File:** `src/middleware/csrf.ts`

```typescript
import csrf from 'csurf';

export const csrfProtection = csrf({ 
  cookie: {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production'
  }
});

// Expose CSRF token endpoint
export const csrfTokenRoute = (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
};
```

**Apply:** Tất cả POST/PUT/DELETE/PATCH routes

#### 2.4.3. Input Sanitization

**File:** `src/middleware/sanitize.ts`

```typescript
import DOMPurify from 'isomorphic-dompurify';
import { body, validationResult } from 'express-validator';

export const sanitizeInput = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = DOMPurify.sanitize(req.body[key], {
          ALLOWED_TAGS: [],
          ALLOWED_ATTR: []
        });
      }
    });
  }
  next();
};

export const validateEmail = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
```

#### 2.4.4. Environment Variables Validation

**File:** `src/config/validateEnv.ts`

```typescript
const requiredEnvVars = [
  'DB_HOST',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'JWT_SECRET',
  'NODE_ENV',
  'API_DOMAIN',
];

export function validateEnv() {
  const missing: string[] = [];
  
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }

  if (!['development', 'production', 'test'].includes(process.env.NODE_ENV || '')) {
    throw new Error('NODE_ENV must be development, production, or test');
  }
}

// Call at app startup
validateEnv();
```

#### 2.4.5. Security Logging

**File:** `src/services/securityLogger.ts`

```typescript
import winston from 'winston';

const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'security.log' }),
    new winston.transports.Console(),
  ],
});

export function logSecurityEvent(
  eventType: string,
  details: any,
  req?: Request
) {
  securityLogger.warn('Security Event', {
    eventType,
    timestamp: new Date().toISOString(),
    ip: req?.ip,
    userAgent: req?.get('user-agent'),
    userId: (req as any)?.user?.id,
    details,
  });

  // Alert admin if critical
  if (['SQL_INJECTION_ATTEMPT', 'XSS_ATTEMPT', 'CSRF_ATTEMPT'].includes(eventType)) {
    // Send email/notification to admin
    sendSecurityAlert(eventType, details);
  }
}
```

#### 2.4.6. File Upload Security Enhancement

**File:** `src/middleware/uploadSecurity.ts`

```typescript
import fileType from 'file-type';
import sharp from 'sharp';
import path from 'path';

// Enhanced file upload validation
export async function verifyUploadedFile(filePath: string): Promise<boolean> {
  try {
    // 1. Check actual file type (not just extension)
    const fileTypeResult = await fileType.fromFile(filePath);
    if (!fileTypeResult || !['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(fileTypeResult.mime)) {
      throw new Error('File type mismatch');
    }

    // 2. Verify it's a valid image by trying to process it
    await sharp(filePath).metadata();

    return true;
  } catch (error) {
    // Delete file if invalid
    await fs.unlink(filePath).catch(() => {});
    throw error;
  }
}

// Sanitize filename
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/\.\./g, '_')
    .substring(0, 255);
}
```

**Priority:** 🔴 CRITICAL - Phải implement ngay trong Phase 2B

---

## 3. CORE MODULES DEVELOPMENT

### 3.1. Public Courses API

**Endpoints:**
- `GET /api/public/courses` - Danh sách khóa học (public)
  - Filter: target_audience, mode, price_range, featured
  - Search: title, description
  - Pagination
  - Sort: price, created_at, featured
- `GET /api/public/courses/:id` - Chi tiết khóa học (public)
- `GET /api/public/courses/:id/modules` - Modules (public hoặc enrolled only)
- `GET /api/public/courses/:id/sessions` - Sessions (public hoặc enrolled only)
- `GET /api/public/courses/:id/materials` - Materials (enrolled only)

**Controllers:**
- `public/courses.controller.ts`

**Services:**
- `course.service.ts` - Có thể share logic với CMS Backend

**Permissions:**
- Public: Read only
- Enrolled users: Read modules, sessions, materials

**Checklist:**
- [ ] Courses listing endpoint
- [ ] Course detail endpoint
- [ ] Filter & search
- [ ] Pagination
- [ ] Modules endpoint (with access control)
- [ ] Sessions endpoint (with access control)
- [ ] Materials endpoint (enrolled only)

---

### 3.2. Public Instructors API

**Endpoints:**
- `GET /api/public/instructors` - Danh sách giảng viên (public)
  - Filter: featured
  - Search: name, bio
  - Sort: rating, total_courses
- `GET /api/public/instructors/:id` - Chi tiết giảng viên (public)
- `GET /api/public/instructors/:id/courses` - Khóa học của giảng viên (public)

**Controllers:**
- `public/instructors.controller.ts`

**Permissions:**
- Public: Read only

**Checklist:**
- [ ] Instructors listing endpoint
- [ ] Instructor detail endpoint
- [ ] Instructor courses endpoint

---

### 3.3. Enrollment API (User Actions)

**Endpoints:**
- `GET /api/public/enrollments/me` - Đăng ký của tôi (authenticated)
- `GET /api/public/enrollments/:id` - Chi tiết đăng ký (own only)
- `POST /api/public/enrollments` - Đăng ký khóa học (authenticated)
- `PUT /api/public/enrollments/:id/cancel` - Hủy đăng ký (own only)
- `GET /api/public/enrollments/:id/progress` - Tiến độ học tập (own only)

**Controllers:**
- `public/enrollments.controller.ts`

**Services:**
- `enrollment.service.ts` - Có thể share logic với CMS Backend

**Permissions:**
- Users chỉ có thể:
  - Xem enrollments của chính mình
  - Tạo enrollment mới
  - Hủy enrollment của chính mình
  - Xem progress của chính mình

**Checklist:**
- [ ] My enrollments endpoint
- [ ] Enrollment detail endpoint
- [ ] Create enrollment endpoint
- [ ] Cancel enrollment endpoint
- [ ] Progress endpoint

---

### 3.4. Payment API (User Actions)

**Endpoints:**
- `POST /api/public/orders` - Tạo đơn hàng (authenticated)
- `GET /api/public/orders/me` - Đơn hàng của tôi (authenticated)
- `GET /api/public/orders/:id` - Chi tiết đơn hàng (own only)
- `POST /api/public/orders/:id/pay` - Thanh toán đơn hàng (own only)
- `POST /api/public/payments/callback` - Payment callback (public, từ gateway)
- `GET /api/public/payments/me` - Thanh toán của tôi (authenticated)

**Controllers:**
- `public/orders.controller.ts`
- `public/payments.controller.ts`

**Services:**
- `order.service.ts` - Có thể share logic với CMS Backend
- `payment.service.ts` - Có thể share logic với CMS Backend

**Payment Gateways:**
- ZaloPay
- VNPay
- MoMo

**Permissions:**
- Users chỉ có thể:
  - Tạo order
  - Xem orders của chính mình
  - Thanh toán orders của chính mình

**Checklist:**
- [ ] Create order endpoint
- [ ] My orders endpoint
- [ ] Order detail endpoint
- [ ] Payment endpoint
- [ ] Payment callback endpoint
- [ ] ZaloPay integration
- [ ] VNPay integration
- [ ] MoMo integration

---

### 3.5. User Profile API

**Endpoints:**
- `GET /api/public/users/me` - Profile của tôi (authenticated)
- `PUT /api/public/users/me` - Cập nhật profile (authenticated)
- `PUT /api/public/users/me/password` - Đổi mật khẩu (authenticated)
- `POST /api/public/users/me/avatar` - Upload avatar (authenticated)

**Controllers:**
- `public/users.controller.ts`

**Services:**
- `user.service.ts` - Có thể share logic với CMS Backend

**Permissions:**
- Users chỉ có thể:
  - Xem profile của chính mình
  - Cập nhật profile của chính mình
  - Đổi mật khẩu của chính mình

**Checklist:**
- [ ] Get profile endpoint
- [ ] Update profile endpoint
- [ ] Change password endpoint
- [ ] Upload avatar endpoint

---

### 3.6. Public Content API (Posts, Events)

**Endpoints:**
- `GET /api/public/posts` - Danh sách bài viết (public)
  - Filter: type (NEWS, EVENT, BLOG, FAQ, POLICY)
  - Search: title, content
  - Pagination
- `GET /api/public/posts/:id` - Chi tiết bài viết (public)
- `GET /api/public/posts/featured` - Bài viết nổi bật (public)
- `GET /api/public/events` - Danh sách sự kiện (public)
- `GET /api/public/events/:id` - Chi tiết sự kiện (public)

**Controllers:**
- `public/content.controller.ts`

**Permissions:**
- Public: Read only

**Checklist:**
- [ ] Posts listing endpoint
- [ ] Post detail endpoint
- [ ] Featured posts endpoint
- [ ] Events listing endpoint
- [ ] Event detail endpoint

---

### 3.7. Notifications API (User)

**Endpoints:**
- `GET /api/public/notifications/me` - Thông báo của tôi (authenticated)
- `GET /api/public/notifications/:id` - Chi tiết thông báo (own only)
- `PUT /api/public/notifications/:id/read` - Đánh dấu đã đọc (own only)
- `PUT /api/public/notifications/read-all` - Đánh dấu tất cả đã đọc (authenticated)

**Controllers:**
- `public/notifications.controller.ts`

**Permissions:**
- Users chỉ có thể:
  - Xem notifications của chính mình
  - Đánh dấu đã đọc notifications của chính mình

**Checklist:**
- [ ] My notifications endpoint
- [ ] Notification detail endpoint
- [ ] Mark as read endpoint
- [ ] Mark all as read endpoint

---

### 3.8. Public Analytics API

**Endpoints:**
- `GET /api/public/analytics/stats` - Public statistics (public)
  - Total courses
  - Total instructors
  - Total students (nếu public)
  - Featured courses count

**Controllers:**
- `public/analytics.controller.ts`

**Permissions:**
- Public: Read only (limited stats)

**Checklist:**
- [ ] Public stats endpoint
- [ ] Limited data exposure

---

## 4. AUTHENTICATION & AUTHORIZATION

### 4.1. User Authentication

**Endpoints:**
- `POST /api/public/auth/register` - Đăng ký
- `POST /api/public/auth/login` - Đăng nhập
- `POST /api/public/auth/logout` - Đăng xuất
- `POST /api/public/auth/refresh` - Refresh token
- `POST /api/public/auth/forgot-password` - Quên mật khẩu
- `POST /api/public/auth/reset-password` - Reset mật khẩu
- `POST /api/public/auth/verify-email` - Xác thực email

**Controllers:**
- `public/auth.controller.ts`

**Services:**
- `auth.service.ts` - Có thể share logic với CMS Backend

**Checklist:**
- [ ] Register endpoint
- [ ] Login endpoint
- [ ] Logout endpoint
- [ ] Refresh token endpoint
- [ ] Forgot password endpoint
- [ ] Reset password endpoint
- [ ] Email verification endpoint

---

### 4.2. Authorization Rules

**Role-based Access:**
- `guest`: Chỉ đọc (courses, posts, instructors)
- `student`: Đọc + Tạo enrollment, order, payment
- Không có `admin`, `instructor` trong public backend

**Resource-based Access:**
- Users chỉ có thể truy cập resources của chính mình
- Enrollments: Own only
- Orders: Own only
- Payments: Own only
- Notifications: Own only

---

## 5. MIDDLEWARE & UTILITIES

### 5.1. Authentication Middleware

**File:** `src/middleware/auth.ts`

```typescript
// JWT token validation cho users
// Role checking: guest, student
// Không có admin permissions
```

### 5.2. Rate Limiting Middleware

**File:** `src/middleware/rateLimit.ts`

- Stricter limits cho public API
- IP-based rate limiting
- Different limits cho authenticated vs unauthenticated

### 5.3. CORS Configuration

**File:** `src/config/cors.ts`

- Chỉ allow Public Frontend domain
- Không allow CMS Frontend domain

---

## 6. TESTING

### 6.1. Unit Tests

**Structure:**
```
tests/
├── unit/
│   ├── services/
│   │   ├── enrollment.service.test.ts
│   │   ├── payment.service.test.ts
│   │   └── ...
│   └── utils/
│       └── ...
```

**Checklist:**
- [ ] Service tests
- [ ] Utility function tests

---

### 6.2. Integration Tests

**Structure:**
```
tests/
└── integration/
    ├── public/
    │   ├── courses.test.ts
    │   ├── enrollments.test.ts
    │   ├── payments.test.ts
    │   └── ...
```

**Checklist:**
- [ ] API endpoint tests
- [ ] Authentication tests
- [ ] Authorization tests
- [ ] Payment gateway tests

---

## 7. API DOCUMENTATION

### 7.1. Swagger/OpenAPI

**File:** `src/docs/swagger.ts`

- Setup Swagger UI
- API endpoint documentation
- Request/Response schemas
- Authentication documentation

**Checklist:**
- [ ] Swagger setup
- [ ] API documentation
- [ ] Request/Response examples

---

## 8. DEPLOYMENT PREPARATION

### 8.1. Environment Variables

**Lưu ý quan trọng:** 
- **KHÔNG hardcode** bất kỳ URL, domain, port, API key, secret nào trong code
- Tất cả phải đọc từ environment variables
- Development: Dùng `.env.local` (không commit vào Git)
- Production: Dùng `.env.production` hoặc environment variables trên server

**File:** `.env.example` (template, commit vào Git)

```env
# Database (có thể share với CMS Backend, KHÔNG hardcode)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ipd8_db
DB_USER=postgres
DB_PASSWORD=

# JWT (khác với CMS Backend, KHÔNG hardcode secret)
JWT_SECRET_PUBLIC=
JWT_EXPIRES_IN=7d

# API URLs (KHÔNG hardcode)
PUBLIC_API_BASE_URL=http://localhost:3001/api/public
PUBLIC_FRONTEND_URL=http://localhost:3003

# Payment Gateways
ZALOPAY_APP_ID=
ZALOPAY_APP_SECRET=
VNPAY_TMN_CODE=
VNPAY_SECRET_KEY=
MOMO_PARTNER_CODE=
MOMO_SECRET_KEY=

# CORS
ALLOWED_ORIGINS=https://ipd8.com,https://www.ipd8.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Storage
# Shared storage path (ở root project, không trong public-backend)
SHARED_STORAGE_PATH=../../shared-storage
STORAGE_UPLOADS_PATH=${SHARED_STORAGE_PATH}/uploads
STORAGE_TEMP_PATH=${SHARED_STORAGE_PATH}/temp

# Cloud storage (optional - nếu dùng S3)
STORAGE_PROVIDER=local  # 'local' hoặc 's3'
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
```

### 8.2. Docker Setup

**File:** `Dockerfile`

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3001  # Port khác với CMS Backend (3000)
CMD ["npm", "start"]
```

---

## 9. CHECKLIST TỔNG KẾT

### Setup ✅
- [ ] Project structure (riêng biệt)
- [ ] Database connection (dùng chung DB với CMS Backend, nhưng pool riêng)
- [ ] Models riêng biệt (không share với CMS Backend)
- [ ] Authentication middleware (user auth)
- [ ] **Security setup (CRITICAL)** - Helmet.js, CSRF, Input sanitization, File upload security
- [ ] Error handling
- [ ] Logging
- [ ] Security logging
- [ ] Rate limiting (stricter)
- [ ] CORS configuration

### Core Modules ✅
- [ ] Public Courses API
- [ ] Public Instructors API
- [ ] Enrollment API
- [ ] Payment API
- [ ] User Profile API
- [ ] Public Content API
- [ ] Notifications API
- [ ] Public Analytics API

### Testing ✅
- [ ] Unit tests
- [ ] Integration tests
- [ ] API documentation
- [ ] Postman collection

---

## TÓM TẮT

**Phase 2B: Public Backend API Development** bao gồm:
1. ✅ Setup infrastructure (tách biệt với CMS Backend)
2. ✅ Core modules (8 modules cho public users)
3. ✅ Authentication & Authorization (user-level)
4. ✅ Testing
5. ✅ Documentation

**Kết quả:** Public Backend API hoàn chỉnh, tách biệt với CMS Backend, sẵn sàng cho Phase 4 (Public Frontend Integration).

---

## LƯU Ý QUAN TRỌNG

1. **Tách biệt hoàn toàn:** Public Backend và CMS Backend là 2 projects riêng biệt
2. **Database dùng chung:** PostgreSQL database (`ipd8_db`) dùng chung, nhưng connection pools riêng
3. **Models riêng biệt:** Mỗi backend có models code riêng, **KHÔNG share** models với nhau
4. **Services có thể share logic:** Có thể share business logic (services) nhưng models riêng biệt
5. **Controllers/routes riêng:** Controllers và routes hoàn toàn riêng biệt
6. **Different ports:** Public Backend chạy port khác (3001) vs CMS Backend (3000)
7. **Different JWT secrets:** Token secrets khác nhau để tách biệt authentication

