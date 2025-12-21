# API Endpoints Testing Guide

## Prerequisites

1. **Database Setup**: Đảm bảo database đã được migrate và có đủ 35 bảng
2. **Environment Variables**: Tạo `.env.local` với đầy đủ thông tin database
3. **Dependencies**: Cài đặt dependencies: `npm install`

## Running Tests

### Option 1: Test với server đang chạy

1. **Start server** (trong terminal riêng):
```bash
cd Projects/public-backend
npm run dev
```

2. **Chạy test script** (trong terminal khác):
```bash
cd Projects/public-backend
npm run test:api
```

### Option 2: Test từng endpoint thủ công

#### Health Check
```bash
curl http://localhost:3101/health
```

#### Register User
```bash
curl -X POST http://localhost:3101/api/public/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "name": "Test User"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3101/api/public/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

#### List Courses (Public)
```bash
curl http://localhost:3101/api/public/courses
```

#### List Instructors (Public)
```bash
curl http://localhost:3101/api/public/instructors
```

#### Get Profile (Requires Auth)
```bash
curl http://localhost:3101/api/public/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Test Coverage

Test script sẽ test các endpoints sau:

1. ✅ Health Check (`/health`)
2. ✅ Database Models Connection
3. ✅ Authentication:
   - Register (`POST /api/public/auth/register`)
   - Login (`POST /api/public/auth/login`)
   - Verify Session (`GET /api/public/auth/verify`)
4. ✅ Courses:
   - List Courses (`GET /api/public/courses`)
   - Get Course Detail (`GET /api/public/courses/:id`)
5. ✅ Instructors:
   - List Instructors (`GET /api/public/instructors`)
6. ✅ Profile (requires auth):
   - Get Profile (`GET /api/public/profile`)
   - Update Profile (`PUT /api/public/profile`)
7. ✅ Enrollments (requires auth):
   - Get My Enrollments (`GET /api/public/enrollments`)

## Expected Results

- ✅ All tests should pass if:
  - Server is running
  - Database is connected
  - Models are properly configured
  - Controllers are implemented

- ⚠️ Some tests may be skipped if:
  - No auth token available (profile/enrollments tests)
  - No courses/instructors in database (detail tests)

## Troubleshooting

### Server không start được
- Kiểm tra `.env.local` có đầy đủ thông tin database
- Kiểm tra database đã được migrate chưa
- Kiểm tra port 3101 có bị chiếm không

### Database connection error
- Kiểm tra database credentials trong `.env.local`
- Kiểm tra database đang chạy
- Kiểm tra user có quyền truy cập database

### Models error
- Kiểm tra models đã được import trong `src/models/index.ts`
- Kiểm tra associations đã được định nghĩa đúng
- Kiểm tra table names khớp với database

### Authentication error
- Kiểm tra JWT_SECRET trong `.env.local`
- Kiểm tra token được generate và validate đúng
- Kiểm tra cookie settings

