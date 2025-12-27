# API Testing Setup - Public Backend

## ✅ Đã Hoàn Thành

1. **Test Scripts Created:**
   - `src/tests/test-api-endpoints.ts` - Full API test suite
   - `src/tests/test-health-only.ts` - Simple health check test
   - `src/tests/README.md` - Testing documentation

2. **NPM Scripts Added:**
   - `npm run test:api` - Run full API test suite
   - `npm run test:health` - Run health check only

3. **Documentation:**
   - `TEST_API.md` - Quick start guide
   - `src/tests/README.md` - Detailed testing guide

## 🚀 Cách Test

### Bước 1: Start Server

Mở terminal và chạy:
```bash
cd Projects/public-backend
npm run dev
```

Server sẽ chạy trên `http://localhost:3001`

**Lưu ý:** Đảm bảo:
- ✅ File `.env.local` đã được tạo với đầy đủ thông tin database
- ✅ Database đã được migrate (35 bảng)
- ✅ Dependencies đã được cài: `npm install`

### Bước 2: Chạy Tests

Mở terminal mới và chạy:

#### Option A: Test Health Check Only
```bash
cd Projects/public-backend
npm run test:health
```

#### Option B: Test Tất Cả Endpoints
```bash
cd Projects/public-backend
npm run test:api
```

## 📋 Test Coverage

Test script sẽ test các endpoints sau:

### 1. Health Check ✅
- `GET /health`
- Expected: `{ status: 'ok', service: 'public-backend', timestamp: ... }`

### 2. Database Models Connection ✅
- Verify models có thể kết nối database
- Test query cơ bản

### 3. Authentication Endpoints ✅
- `POST /api/public/auth/register` - Đăng ký user mới
- `POST /api/public/auth/login` - Đăng nhập
- `GET /api/public/auth/verify` - Verify session

### 4. Courses Endpoints ✅
- `GET /api/public/courses` - List courses (public)
- `GET /api/public/courses/:id` - Get course detail (public)

### 5. Instructors Endpoints ✅
- `GET /api/public/instructors` - List instructors (public)

### 6. Profile Endpoints ✅ (requires auth)
- `GET /api/public/profile` - Get user profile
- `PUT /api/public/profile` - Update profile

### 7. Enrollments Endpoints ✅ (requires auth)
- `GET /api/public/enrollments` - Get my enrollments

## 🔍 Manual Testing

### Với curl (PowerShell)

```powershell
# Health Check
Invoke-WebRequest -Uri http://localhost:3001/health -UseBasicParsing

# Register
$body = @{email="test@example.com";password="Test123!@#";name="Test User"} | ConvertTo-Json
Invoke-WebRequest -Uri http://localhost:3001/api/public/auth/register -Method POST -Body $body -ContentType "application/json" -UseBasicParsing

# Login
$body = @{email="test@example.com";password="Test123!@#"} | ConvertTo-Json
$response = Invoke-WebRequest -Uri http://localhost:3001/api/public/auth/login -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
$token = ($response.Content | ConvertFrom-Json).token

# Get Profile (with token)
$headers = @{Authorization="Bearer $token"}
Invoke-WebRequest -Uri http://localhost:3001/api/public/profile -Headers $headers -UseBasicParsing
```

### Với Postman

1. Import collection (nếu có)
2. Set base URL: `http://localhost:3001`
3. Chạy requests theo thứ tự

## ⚠️ Troubleshooting

### Server không start

**Lỗi:** `Unable to connect to the database`
- ✅ Kiểm tra `.env.local` có đầy đủ DB credentials
- ✅ Kiểm tra database đang chạy
- ✅ Test connection: `npm run migrate:test-connection`

**Lỗi:** `Port 3001 already in use`
- ✅ Đổi port trong `.env.local`: `PORT=3002`
- ✅ Hoặc kill process đang dùng port 3001

**Lỗi:** `Cannot find module 'sequelize'`
- ✅ Chạy: `npm install`

### Test fails

**Lỗi:** `ECONNREFUSED`
- ✅ Server chưa start - chạy `npm run dev` trước

**Lỗi:** `401 Unauthorized`
- ✅ Token không hợp lệ hoặc đã hết hạn
- ✅ Kiểm tra JWT_SECRET_PUBLIC trong `.env.local`

**Lỗi:** `500 Internal Server Error`
- ✅ Kiểm tra database connection
- ✅ Kiểm tra models associations
- ✅ Xem server logs để biết chi tiết

### Database errors

**Lỗi:** `relation "users" does not exist`
- ✅ Database chưa được migrate
- ✅ Chạy: `npm run migrate`

**Lỗi:** `permission denied for schema public`
- ✅ User không có quyền
- ✅ Chạy: `npm run migrate:grant-permissions`

## 📊 Expected Test Results

### ✅ All Tests Pass
```
🚀 Starting API Endpoints Tests...

📋 1. Health Check
✓ Health Check

📋 2. Models Connection
✓ Database Models Connection

📋 3. Authentication Endpoints
✓ Register User
✓ Login User
✓ Verify Session

📋 4. Courses Endpoints
✓ List Courses (Public)
✓ Get Course Detail (Public)

📋 5. Instructors Endpoints
✓ List Instructors (Public)

📋 6. Profile Endpoints
✓ Get Profile (Authenticated)
✓ Update Profile (Authenticated)

📋 7. Enrollments Endpoints
✓ Get My Enrollments (Authenticated)

============================================================
📊 TEST SUMMARY
============================================================

Total Tests: 10
Passed: 10
Failed: 0

✅ All tests passed!
```

## 🎯 Next Steps

Sau khi test thành công:

1. ✅ Verify tất cả endpoints hoạt động đúng
2. ✅ Test với real data (tạo courses, instructors trong database)
3. ✅ Test edge cases (invalid input, missing fields, etc.)
4. ✅ Test error handling
5. ✅ Test rate limiting
6. ✅ Test CORS configuration

## 📝 Notes

- Test script tự động tạo test user với email unique (timestamp-based)
- Test user sẽ được tạo mỗi lần chạy test
- Token được lưu và dùng cho các authenticated endpoints
- Một số tests có thể skip nếu không có data (courses, instructors)

















