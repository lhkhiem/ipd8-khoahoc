# Next Steps After Environment Variables Setup

## ✅ Đã hoàn thành
- [x] Fix tất cả hardcoded values
- [x] Copy env templates sang `.env.local`
- [x] Cập nhật env templates với các biến mới

## 🔄 Các bước tiếp theo

### 1. Restart Servers để load env mới
```bash
# Restart CMS Backend
cd Projects/cms-backend
# Stop server (Ctrl+C nếu đang chạy)
npm run dev

# Restart CMS Frontend (nếu đang chạy)
cd Projects/cms-frontend
# Stop server (Ctrl+C nếu đang chạy)
npm run dev
```

### 2. Verify Environment Variables
Kiểm tra các env variables quan trọng đã được load:
- `SITE_NAME` hoặc `NEXT_PUBLIC_SITE_NAME`
- `API_DOMAIN` hoặc `NEXT_PUBLIC_API_DOMAIN`
- `SITE_URL` hoặc `WEBSITE_ORIGIN`
- `ADMIN_EMAIL`

### 3. Test Login Flow (Cookie Fix)
Sau khi fix cookie domain issue, cần test lại:
1. Clear browser cookies
2. Login với test user: `test1766026824022@example.com` / `Test123!`
3. Kiểm tra backend logs:
   - `[Login] Cookie domain detection: { isLocalhost: true, willSetDomain: false }`
   - `[Verify] Request details: { hasToken: true }`
4. Verify có thể vào dashboard

### 4. Nếu Login OK → Tiếp tục Implementation

Theo `IMPLEMENTATION_CHECKLIST.md`, các phase tiếp theo:

#### Option A: Hoàn thiện CMS Backend (Phase 2A)
- [ ] Security enhancements
- [ ] Core modules (Users, Posts, Settings, etc.)
- [ ] File upload & storage
- [ ] Email service
- [ ] API documentation

#### Option B: Setup Public Backend (Phase 2B)
- [ ] Đã có sẵn structure
- [ ] Test API endpoints
- [ ] Hoàn thiện controllers

#### Option C: CMS Frontend Features (Phase 3)
- [ ] Dashboard improvements
- [ ] Content management UI
- [ ] Settings UI
- [ ] User management UI

#### Option D: Public Frontend (Phase 4)
- [ ] Setup project structure
- [ ] Homepage
- [ ] Course listing
- [ ] Course detail
- [ ] User authentication

### 5. Recommended Next Step
**Test Login Flow trước**, sau đó quyết định:
- Nếu login OK → Tiếp tục với **Option A** (CMS Backend features)
- Nếu login vẫn lỗi → Debug cookie issue tiếp

## 🔍 Debug Commands

### Check env variables loaded
```bash
# CMS Backend
cd Projects/cms-backend
node -e "require('dotenv').config({ path: '.env.local' }); console.log('SITE_NAME:', process.env.SITE_NAME); console.log('API_DOMAIN:', process.env.API_DOMAIN);"

# CMS Frontend
cd Projects/cms-frontend
node -e "require('dotenv').config({ path: '.env.local' }); console.log('NEXT_PUBLIC_SITE_NAME:', process.env.NEXT_PUBLIC_SITE_NAME);"
```

### Test API endpoints
```bash
# Health check
curl http://localhost:3103/api/health

# Test login (should return cookie)
curl -X POST http://localhost:3103/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3102" \
  -d '{"email":"test1766026824022@example.com","password":"Test123!"}' \
  -v
```

## 📝 Notes
- Tất cả env variables phải được set trong `.env.local`
- Không commit `.env.local` vào Git
- Production: sử dụng `.env.production` hoặc environment variables của hosting platform










