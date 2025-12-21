# CMS Login Cookie Fix - Bám sát yêu cầu kiến trúc

## Yêu cầu kiến trúc
- **CMS backend <-> CMS frontend** (port 3103 <-> 3102)
- Tất cả config từ `.env.local`
- Database dùng chung nhưng models riêng biệt

## Vấn đề
- Login thành công nhưng không vào được dashboard
- Request `/api/settings/appearance` trả về 401 Unauthorized
- Cookie không được gửi trong request tiếp theo

## Fixes Applied

### 1. Cookie Options (Backend) ✅
- **File:** `Projects/cms-backend/src/controllers/authController.ts`
- **Change:** 
  - Detect development mode đúng cách
  - Đảm bảo không set domain cho localhost
  - `sameSite: 'lax'` cho localhost (hoạt động với same-site)
  - `secure: false` cho development
- **Result:** Cookie sẽ được set đúng cho localhost:3103

### 2. Redirect Flow (Frontend) ✅
- **File:** `Projects/cms-frontend/app/login/page.tsx`
- **Change:**
  - Đợi 200ms sau login để cookie được set
  - Gọi `hydrate()` để verify session
  - Retry hydrate nếu lần đầu fail
  - Dùng `window.location.href` để full page reload
- **Result:** Đảm bảo cookie được set và verify trước khi redirect

### 3. Logging (Backend) ✅
- **File:** `Projects/cms-backend/src/controllers/authController.ts`
- **Change:** Thêm logging chi tiết trong verify endpoint
- **Purpose:** Debug cookie có được gửi không

### 4. Axios Instance (Frontend) ✅
- **File:** `Projects/cms-frontend/lib/axios.ts` (mới)
- **Change:** Tạo axios instance với `withCredentials: true` mặc định
- **Purpose:** Đảm bảo mọi request đều gửi cookies
- **Note:** Chưa được sử dụng, có thể dùng trong tương lai

## Testing Steps

1. **Clear browser cookies:**
   - DevTools → Application → Cookies → Clear all

2. **Login với test user:**
   - Email: `test1766026824022@example.com`
   - Password: `Test123!`

3. **Kiểm tra backend logs:**
   - Xem `[Login] Cookie set with options:` log
   - Xem `[Verify] Request details:` log khi vào dashboard

4. **Kiểm tra browser:**
   - DevTools → Application → Cookies
   - Verify cookie `token` exists for `localhost:3103`
   - Check cookie attributes (httpOnly, sameSite, path)

5. **Kiểm tra network:**
   - DevTools → Network
   - Xem request `/api/auth/verify` có cookie trong headers không
   - Xem response status (200 = success, 401 = fail)

## Expected Flow

1. User submit login form
2. Backend verify credentials
3. Backend set HTTP-only cookie `token` với options đúng
4. Frontend wait 200ms
5. Frontend call `hydrate()` để verify session
6. Frontend redirect với `window.location.href`
7. Middleware check cookie và allow access
8. Dashboard page loads

## Troubleshooting

### Nếu vẫn 401:

1. **Check cookie trong browser:**
   ```
   DevTools → Application → Cookies → localhost:3103
   ```
   - Cookie `token` phải tồn tại
   - Attributes: httpOnly=true, sameSite=lax, path=/

2. **Check backend logs:**
   - `[Login] Cookie set with options:` - verify cookie options
   - `[Verify] Request details:` - verify cookie có được gửi không

3. **Check CORS:**
   - Backend logs: `[CORS] Origin allowed: http://localhost:3102`
   - Verify `credentials: true` trong CORS config

4. **Check network request:**
   - Request headers phải có `Cookie: token=...`
   - Response headers phải có `Set-Cookie: token=...` (khi login)

### Nếu cookie không được set:

1. **Check cookie options:**
   - `sameSite: 'lax'` - OK cho localhost
   - `secure: false` - OK cho http://localhost
   - `domain: undefined` - OK cho localhost

2. **Check browser settings:**
   - Disable extensions that block cookies
   - Check browser privacy settings

3. **Try different browser:**
   - Test với Chrome/Firefox/Edge

## Files Modified

1. `Projects/cms-backend/src/controllers/authController.ts`
   - Cookie options cho development
   - Logging trong verify endpoint

2. `Projects/cms-frontend/app/login/page.tsx`
   - Redirect flow với hydrate verification

3. `Projects/cms-frontend/lib/axios.ts` (new)
   - Axios instance với default withCredentials










