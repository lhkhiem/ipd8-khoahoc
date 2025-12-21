# API Testing Guide - Public Backend

## Quick Start

### Bước 1: Kiểm tra Environment Variables

Đảm bảo file `.env.local` đã được tạo với đầy đủ thông tin:
- Database connection (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD)
- JWT_SECRET_PUBLIC
- PORT=3101

### Bước 2: Start Server

Mở terminal 1 và chạy:
```bash
cd Projects/public-backend
npm run dev
```

Server sẽ chạy trên `http://localhost:3101`

### Bước 3: Chạy Test Script

Mở terminal 2 và chạy:
```bash
cd Projects/public-backend
npm run test:api
```

## Manual Testing với curl

### 1. Health Check
```bash
curl http://localhost:3101/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "public-backend",
  "timestamp": "2025-01-XX..."
}
```

### 2. Register User
```bash
curl -X POST http://localhost:3101/api/public/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"Test123!@#\",\"name\":\"Test User\"}"
```

### 3. Login
```bash
curl -X POST http://localhost:3101/api/public/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"Test123!@#\"}"
```

### 4. List Courses (Public)
```bash
curl http://localhost:3101/api/public/courses
```

### 5. List Instructors (Public)
```bash
curl http://localhost:3101/api/public/instructors
```

### 6. Get Profile (Requires Auth)
```bash
# Lấy token từ login response, sau đó:
curl http://localhost:3101/api/public/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Test với Postman

1. Import collection từ `docs/postman/public-backend-collection.json` (nếu có)
2. Set base URL: `http://localhost:3101`
3. Chạy các requests theo thứ tự:
   - Health Check
   - Register
   - Login (lưu token)
   - Verify (dùng token)
   - List Courses
   - List Instructors
   - Get Profile (dùng token)

## Troubleshooting

### Server không start
- Kiểm tra `.env.local` có đầy đủ không
- Kiểm tra database connection
- Kiểm tra port 3101 có bị chiếm không: `netstat -ano | findstr :3101`

### Database connection error
- Kiểm tra database đang chạy
- Kiểm tra credentials trong `.env.local`
- Test connection: `npm run migrate:test-connection`

### Models error
- Kiểm tra models đã được import: `src/models/index.ts`
- Kiểm tra database đã migrate: `npm run migrate:test-app`

### Authentication error
- Kiểm tra JWT_SECRET_PUBLIC trong `.env.local`
- Kiểm tra token format
- Kiểm tra cookie settings

