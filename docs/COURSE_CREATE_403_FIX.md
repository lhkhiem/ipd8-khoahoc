# 🔧 FIX: Lỗi 403 khi tạo Course

**Ngày fix:** 2025-01-XX  
**Lỗi:** 403 Forbidden khi tạo course

---

## 🐛 VẤN ĐỀ

Khi tạo course, gặp lỗi 403 Forbidden:
```
Request failed with status code 403
Insufficient permission. Only admin or instructor can create courses.
```

---

## ✅ GIẢI PHÁP ĐÃ ÁP DỤNG

### 1. Fix Permission Check
- **File:** `Projects/cms-backend/src/controllers/courseController.ts`
- **Thay đổi:** 
  - Tạo helper function `canManageCourses()` để check permission
  - Chỉ cho phép `admin` và `instructor` (không có `owner` trong User model)
  - Thêm debug logging để track user role

### 2. Fix Frontend Check
- **File:** `Projects/cms-frontend/app/dashboard/courses/new/page.tsx`
- **Thay đổi:**
  - Thêm check permission ở frontend trước khi gửi request
  - Hiển thị error message rõ ràng hơn
  - Thêm debug logging

---

## 🔍 KIỂM TRA

### Bước 1: Kiểm tra User Role

1. **Kiểm tra trong Database:**
```sql
SELECT id, email, name, role FROM users WHERE email = 'your-email@example.com';
```

2. **Kiểm tra trong Browser Console:**
   - Mở DevTools → Console
   - Xem log: `[NewCoursePage] Creating course with user:`
   - Kiểm tra `userRole` phải là `'admin'` hoặc `'instructor'`

### Bước 2: Kiểm tra Backend Logs

1. **Xem backend terminal:**
   - Tìm log: `[authMiddleware] User authenticated:`
   - Kiểm tra `role` trong log
   - Tìm log: `[createCourse] Actor:`
   - Kiểm tra `role` và `hasActor`

### Bước 3: Kiểm tra Token

1. **Kiểm tra Cookie:**
   - DevTools → Application → Cookies
   - Tìm cookie `token`
   - Đảm bảo cookie tồn tại và có giá trị

2. **Kiểm tra Request Headers:**
   - DevTools → Network → Request Headers
   - Tìm `Cookie: token=...`
   - Hoặc `Authorization: Bearer ...`

---

## 🛠️ CÁCH FIX

### Nếu User Role không đúng:

1. **Update User Role trong Database:**
```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

2. **Hoặc tạo user mới với role admin:**
   - Vào `/dashboard/users`
   - Tạo user mới với role `admin`
   - Login với user đó

### Nếu Token không được gửi:

1. **Kiểm tra CORS settings:**
   - Backend phải allow credentials
   - Frontend phải gửi `withCredentials: true`

2. **Kiểm tra Cookie settings:**
   - Cookie phải có `SameSite` và `Secure` đúng
   - Domain phải match

---

## 📝 NOTES

- **User Model Roles:** Chỉ hỗ trợ `'guest'`, `'student'`, `'instructor'`, `'admin'`
- **Không có `'owner'` role** trong database
- **`'admin'` role** có thể được coi là owner/super admin

---

## 🧪 TEST

1. ✅ Login với user có role `admin` hoặc `instructor`
2. ✅ Vào `/dashboard/courses/new`
3. ✅ Điền form và submit
4. ✅ Kiểm tra console logs
5. ✅ Kiểm tra backend logs
6. ✅ Course được tạo thành công

---

**Status:** ✅ Fixed - Cần test với user có role đúng

