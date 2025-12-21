# Public Backend - IPD8 Learning Platform

API backend cho public website của IPD8 Learning Platform.

## 🏗️ Kiến Trúc

- **Tách biệt hoàn toàn** với CMS Backend
- **Database:** Dùng chung PostgreSQL với CMS Backend (cùng `ipd8_db`)
- **Models:** Riêng biệt hoàn toàn - không share code với CMS Backend
- **Storage:** Dùng chung `shared-storage/` ở root project

## 📋 Yêu Cầu

- Node.js 18+
- PostgreSQL 12+
- npm hoặc yarn

## 🚀 Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Tạo file `.env.local`:**
   ```bash
   cp .env.example .env.local
   ```
   
   Điền đầy đủ các giá trị trong `.env.local`:
   - Database credentials
   - JWT secret
   - API URLs
   - Payment gateway keys (nếu có)
   - Storage paths

3. **Chạy development server:**
   ```bash
   npm run dev
   ```

   Server sẽ chạy trên port 3101 (mặc định).

## 📁 Cấu Trúc Project

```
public-backend/
├── src/
│   ├── config/          # Configuration files
│   │   └── database.ts  # Database connection
│   ├── controllers/     # Request handlers
│   ├── models/          # Database models (riêng biệt với CMS Backend)
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── middleware/      # Express middleware
│   ├── utils/           # Utility functions
│   ├── app.ts           # Express app setup
│   └── index.ts         # Server entry point
├── package.json
└── tsconfig.json
```

## 🔐 Environment Variables

Xem file `.env.example` hoặc [ENVIRONMENT_VARIABLES_GUIDE.md](../../docs/ENVIRONMENT_VARIABLES_GUIDE.md) để biết chi tiết.

**Lưu ý quan trọng:**
- **KHÔNG hardcode** bất kỳ URL, database, API keys, secrets
- Tất cả phải đọc từ environment variables
- Development: `.env.local` (không commit vào Git)
- Production: `.env.production` hoặc server environment variables

## 📚 API Endpoints

### Public Courses
- `GET /api/public/courses` - Danh sách khóa học
- `GET /api/public/courses/:id` - Chi tiết khóa học
- `GET /api/public/courses/:id/modules` - Modules của khóa học (access control)

### Enrollment
- `POST /api/public/enrollments` - Đăng ký khóa học
- `GET /api/public/enrollments/my` - Khóa học đã đăng ký (authenticated)

### Payment
- `POST /api/public/orders` - Tạo đơn hàng
- `POST /api/public/payments` - Thanh toán

### User Profile
- `GET /api/public/profile` - Thông tin profile (authenticated)
- `PUT /api/public/profile` - Cập nhật profile (authenticated)

## 🔒 Security

- CORS chỉ cho phép Public Frontend
- Rate limiting (stricter than CMS Backend)
- JWT authentication cho users
- Input validation & sanitization
- Security headers

## 📖 Tài Liệu

- [Implementation Plan](../../docs/IMPLEMENTATION_PLAN_PHASE2B_PUBLIC_BACKEND.md)
- [Environment Variables Guide](../../docs/ENVIRONMENT_VARIABLES_GUIDE.md)
- [Shared Storage Guide](../../docs/SHARED_STORAGE_GUIDE.md)
- [Security Checklist](../../docs/SECURITY_CHECKLIST.md)

## 🧪 Testing

```bash
# Unit tests (TODO)
npm test

# Integration tests (TODO)
npm run test:integration
```

## 🚢 Deployment

```bash
# Build
npm run build

# Start production server
npm start
```

## 📝 Notes

- Models code **riêng biệt** với CMS Backend (không share)
- Database dùng chung nhưng connection pool riêng biệt
- Shared storage ở `../../shared-storage/` (root project)


