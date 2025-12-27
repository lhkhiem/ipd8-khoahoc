# Login Error Fix - Backend Not Running

## Vấn đề
- Login request bị fail với error: "Đăng nhập thất bại. Vui lòng thử lại sau"
- Network tab cho thấy "Provisional headers are shown"
- Console errors: `[AuthStore] Login error: {}`, `[LoginPage] Login failed: {}`

## Nguyên nhân
**Backend không chạy!** Port 3103 không có service nào đang listen.

## Giải pháp

### 1. Start CMS Backend
```bash
cd Projects/cms-backend
npm run dev
```

### 2. Verify Backend đang chạy
```bash
# Test connection
Test-NetConnection -ComputerName localhost -Port 3103

# Hoặc test health endpoint
curl http://localhost:3103/api/health
```

### 3. Verify Environment Variables
Đảm bảo `.env.local` có các biến cần thiết:
```bash
# CMS Backend .env.local
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ipd8_db
DB_USER=ipd8_user
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
PORT=3103
CMS_API_BASE_URL=http://localhost:3103/api
CMS_FRONTEND_URL=http://localhost:3102
CORS_ALLOWED_ORIGINS=http://localhost:3102
NODE_ENV=development
```

### 4. Test Login lại
1. Clear browser cookies
2. Refresh page
3. Login với test user: `test1766026824022@example.com` / `Test123!`
4. Kiểm tra backend logs để verify request được nhận

## Debug Steps

### Check Backend Logs
Backend logs sẽ hiển thị:
```
[CORS] Origin allowed: http://localhost:3102
[Auth Route] POST /login { body: { email: '...', hasPassword: true }, origin: 'http://localhost:3102' }
[Login] Login attempt: { email: '...', hasPassword: true }
```

### Check Network Tab
- Request URL: `http://localhost:3103/api/auth/login`
- Status: 200 (success) hoặc 401/500 (error)
- Response Headers: `Set-Cookie: token=...`

### Common Issues

#### Issue 1: Backend không start
- Check `.env.local` có đúng không
- Check database connection
- Check port 3103 có bị chiếm không

#### Issue 2: CORS Error
- Verify `CORS_ALLOWED_ORIGINS` có `http://localhost:3102`
- Check backend logs có `[CORS] Origin allowed`

#### Issue 3: Database Connection Error
- Verify database credentials trong `.env.local`
- Check database service đang chạy
- Test connection: `npm run test:db` (nếu có)

## Expected Flow

1. **Frontend:** User submit login form
2. **Frontend:** Axios POST to `http://localhost:3103/api/auth/login`
3. **Backend:** Receive request, verify CORS
4. **Backend:** Authenticate user, set cookie
5. **Backend:** Return response with user data
6. **Frontend:** Receive response, redirect to dashboard

## Next Steps After Fix

Sau khi backend chạy và login OK:
1. Test cookie được set đúng (check Network tab)
2. Test redirect to dashboard
3. Test verify endpoint
4. Tiếp tục với implementation tasks

















