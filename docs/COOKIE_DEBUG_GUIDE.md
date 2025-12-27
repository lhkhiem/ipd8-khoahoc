# Cookie Debug Guide - CMS Login

## Vấn đề
- Cookie không hiển thị trong DevTools → Application → Cookies → `http://localhost:3102`
- Login thành công nhưng không vào được dashboard

## Giải thích

### Cookie Domain
- **Backend:** `http://localhost:3103` (set cookie)
- **Frontend:** `http://localhost:3102` (nhận cookie)

**Quan trọng:** Browser chỉ hiển thị cookies cho domain hiện tại trong DevTools. Cookie được set từ `localhost:3103` sẽ **KHÔNG** hiển thị khi đang ở `localhost:3102`, nhưng vẫn được gửi trong requests nếu cấu hình đúng.

### Cách kiểm tra cookie

1. **Kiểm tra trong Network tab:**
   - DevTools → Network
   - Login request → Headers → Response Headers
   - Tìm `Set-Cookie: token=...`
   - Verify có `Access-Control-Allow-Credentials: true`

2. **Kiểm tra request tiếp theo:**
   - DevTools → Network
   - Request `/api/auth/verify` → Headers → Request Headers
   - Tìm `Cookie: token=...`
   - Nếu có → cookie được gửi đúng
   - Nếu không có → cookie không được gửi (vấn đề)

3. **Kiểm tra backend logs:**
   - `[Login] Set-Cookie header:` - verify cookie được set
   - `[Verify] Request details:` - verify cookie có được gửi không

## Debug Steps

### 1. Clear everything
```bash
# Clear browser cookies
DevTools → Application → Cookies → Clear all

# Clear browser cache
Ctrl+Shift+Delete → Clear cache
```

### 2. Login và kiểm tra Network tab

1. Open DevTools → Network tab
2. Login với test user
3. Tìm request `/api/auth/login`
4. Kiểm tra Response Headers:
   ```
   Set-Cookie: token=...; Path=/; HttpOnly; SameSite=Lax
   Access-Control-Allow-Credentials: true
   ```
5. Nếu không có `Set-Cookie` → Backend không set cookie
6. Nếu có `Set-Cookie` nhưng không có `Access-Control-Allow-Credentials` → CORS issue

### 3. Kiểm tra request tiếp theo

1. Sau khi login, tìm request `/api/auth/verify` hoặc `/api/settings/appearance`
2. Kiểm tra Request Headers:
   ```
   Cookie: token=...
   ```
3. Nếu không có `Cookie` header → Cookie không được gửi
4. Nếu có `Cookie` header → Cookie được gửi đúng

### 4. Kiểm tra backend logs

```bash
# Backend logs khi login
[Login] Cookie set with options: {...}
[Login] Set-Cookie header: token=...
[Login] Response headers: {...}

# Backend logs khi verify
[Verify] Request details: {
  hasCookieHeader: true,
  cookieKeys: ['token'],
  hasToken: true
}
```

## Common Issues

### Issue 1: Cookie không được set
**Symptoms:**
- Network tab không có `Set-Cookie` header
- Backend logs không có `[Login] Set-Cookie header:`

**Fix:**
- Check cookie options (sameSite, secure, domain)
- Check CORS credentials: true
- Check backend response

### Issue 2: Cookie không được gửi
**Symptoms:**
- Network tab có `Set-Cookie` header
- Request tiếp theo không có `Cookie` header

**Fix:**
- Check frontend `withCredentials: true`
- Check CORS `credentials: true`
- Check cookie domain (không set domain cho localhost)

### Issue 3: Cookie bị block bởi browser
**Symptoms:**
- Network tab có `Set-Cookie` header
- Browser console có warning về cookie

**Fix:**
- Check SameSite policy (lax cho localhost)
- Check secure flag (false cho http://localhost)
- Check browser privacy settings

## Expected Flow

1. **Login Request:**
   ```
   POST /api/auth/login
   Headers: { Origin: http://localhost:3102 }
   Body: { email, password }
   ```

2. **Login Response:**
   ```
   Status: 200
   Headers: {
     Set-Cookie: token=...; Path=/; HttpOnly; SameSite=Lax
     Access-Control-Allow-Credentials: true
   }
   Body: { token, user }
   ```

3. **Verify Request:**
   ```
   GET /api/auth/verify
   Headers: {
     Origin: http://localhost:3102
     Cookie: token=...
   }
   ```

4. **Verify Response:**
   ```
   Status: 200
   Body: { user }
   ```

## Testing Checklist

- [ ] Network tab có `Set-Cookie` header trong login response
- [ ] Network tab có `Access-Control-Allow-Credentials: true` trong login response
- [ ] Network tab có `Cookie` header trong verify request
- [ ] Backend logs có `[Login] Set-Cookie header:`
- [ ] Backend logs có `[Verify] Request details: { hasToken: true }`
- [ ] Dashboard loads successfully


















