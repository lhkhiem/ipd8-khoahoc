# CMS Login Redirect Fix

## Vấn đề
- Login thành công nhưng không vào được dashboard
- Request `/api/settings/appearance` trả về 401 Unauthorized

## Nguyên nhân
1. Cookie có thể không được set đúng do domain/path
2. Redirect sau login không đợi cookie được set
3. Middleware không đọc được cookie ngay sau login

## Fixes Applied

### 1. Cookie Options (Backend)
- **File:** `Projects/cms-backend/src/controllers/authController.ts`
- **Change:** Đảm bảo không set domain cho localhost
- **Result:** Cookie sẽ được set đúng cho localhost:3103

### 2. Redirect Method (Frontend)
- **File:** `Projects/cms-frontend/app/login/page.tsx`
- **Change:** Đổi từ `router.push()` → `window.location.href`
- **Reason:** Full page reload đảm bảo middleware đọc được cookie mới
- **Added:** Delay 100ms để đợi cookie được set

### 3. Logging (Backend)
- **File:** `Projects/cms-backend/src/controllers/authController.ts`
- **Change:** Thêm logging chi tiết cookie options
- **Purpose:** Debug cookie settings

## Testing

1. **Login với test user:**
   - Email: `test1766026824022@example.com`
   - Password: `Test123!`

2. **Kiểm tra:**
   - Cookie `token` được set trong browser
   - Redirect đến `/dashboard` thành công
   - Dashboard load được (không bị redirect về login)

## Expected Flow

1. User submit login form
2. Backend verify credentials
3. Backend set HTTP-only cookie `token`
4. Frontend wait 100ms
5. Frontend redirect với `window.location.href`
6. Middleware check cookie và allow access
7. Dashboard page loads

## Troubleshooting

Nếu vẫn không vào được dashboard:

1. **Check browser cookies:**
   - Open DevTools → Application → Cookies
   - Verify `token` cookie exists for `localhost:3103`
   - Check cookie attributes (httpOnly, sameSite, path)

2. **Check backend logs:**
   - Look for `[Login] Cookie set with options:` log
   - Verify cookie options are correct

3. **Check network requests:**
   - Verify `/api/auth/verify` returns 200 (not 401)
   - Check if cookie is sent in request headers

4. **Clear cookies and retry:**
   - Clear all cookies for localhost
   - Try login again


















