# HƯỚNG DẪN USER ROLES - IPD8 LEARNING PLATFORM

**Ngày cập nhật:** 2025-01-XX  
**Nguồn:** [DATABASE_DESIGN_IPD8_TABLES_REFACTOR.md](./DATABASE_DESIGN_IPD8_TABLES_REFACTOR.md)

---

## 📋 TỔNG QUAN

Hệ thống IPD8 sử dụng **4 roles** cho users trong database:
- `'guest'` - Khách (mặc định khi đăng ký)
- `'student'` - Học viên (đã đăng ký khóa học)
- `'instructor'` - Giảng viên
- `'admin'` - Quản trị viên CMS

---

## 🔐 ROLES TRONG DATABASE

### Database Constraint

```sql
role VARCHAR(50) NOT NULL DEFAULT 'guest' 
CHECK (role IN ('guest', 'student', 'instructor', 'admin'))
```

### Default Value
- **Mặc định:** `'guest'`
- Khi user đăng ký qua Public Platform → role = `'guest'`
- Khi admin tạo user trong CMS → có thể chọn role

---

## 👥 PHÂN LOẠI ROLES

### 1. `'guest'` (Khách)

**Mục đích:** User mới đăng ký, chưa đăng ký khóa học nào

**Đặc điểm:**
- ✅ Đăng ký tài khoản qua `/register`
- ✅ Đăng nhập vào Public Platform
- ✅ Xem thông tin khóa học công khai
- ❌ Không thể đăng ký khóa học (cần upgrade lên `'student'`)
- ❌ Không thể truy cập CMS

**Khi nào được gán:**
- Tự động khi đăng ký qua Public Platform
- Admin có thể set khi tạo user mới

**Khi nào chuyển sang `'student'`:**
- Khi user đăng ký khóa học đầu tiên (có thể tự động update)

---

### 2. `'student'` (Học viên)

**Mục đích:** User đã đăng ký ít nhất 1 khóa học

**Đặc điểm:**
- ✅ Tất cả quyền của `'guest'`
- ✅ Đăng ký và tham gia khóa học
- ✅ Xem tài liệu khóa học đã đăng ký
- ✅ Theo dõi tiến độ học tập
- ❌ Không thể truy cập CMS

**Khi nào được gán:**
- Tự động khi user đăng ký khóa học đầu tiên
- Admin có thể set thủ công

---

### 3. `'instructor'` (Giảng viên)

**Mục đích:** Giảng viên dạy khóa học

**Đặc điểm:**
- ✅ Tất cả quyền của `'student'`
- ✅ Quản lý khóa học của mình
- ✅ Xem danh sách học viên đăng ký
- ✅ Đánh giá tiến độ học viên
- ❌ Không thể truy cập CMS admin (chỉ quản lý courses của mình)

**Khi nào được gán:**
- Admin tạo trong CMS
- Có thể link với bảng `instructors`

---

### 4. `'admin'` (Quản trị viên)

**Mục đích:** Quản trị hệ thống CMS

**Đặc điểm:**
- ✅ Tất cả quyền của `'student'` và `'instructor'`
- ✅ Truy cập CMS Backend (`/dashboard`)
- ✅ Quản lý users, courses, posts, settings
- ✅ Tạo và chỉnh sửa nội dung
- ✅ Quản lý media, menu, SEO

**Khi nào được gán:**
- Admin khác tạo trong CMS
- Bootstrap: User đầu tiên được promote thành `'admin'`

---

## 🔄 QUY TRÌNH ĐĂNG KÝ VÀ THAY ĐỔI ROLE

### Đăng ký qua Public Platform

```
1. User điền form đăng ký (/register)
   ↓
2. Backend tạo user với role = 'guest' (mặc định)
   ↓
3. User đăng nhập và xem khóa học
   ↓
4. User đăng ký khóa học đầu tiên
   ↓
5. Hệ thống tự động update role = 'student'
   (hoặc admin có thể set thủ công)
```

### Tạo user trong CMS

```
1. Admin vào CMS → Users → Create User
   ↓
2. Admin chọn role: 'guest', 'student', 'instructor', hoặc 'admin'
   ↓
3. User được tạo với role đã chọn
```

---

## 📝 CODE REFERENCES

### Backend Models

**Public Backend:**
```typescript
// Projects/public-backend/src/models/User.ts
role: {
  type: DataTypes.STRING(50),
  defaultValue: 'guest',
  validate: {
    isIn: [['guest', 'student', 'instructor', 'admin']],
  },
}
```

**CMS Backend:**
```typescript
// Projects/cms-backend/src/models/User.ts
role: {
  type: DataTypes.STRING(50),
  defaultValue: 'guest',
  validate: {
    isIn: [['guest', 'student', 'instructor', 'admin']],
  },
}
```

### Registration Controller

```typescript
// Projects/public-backend/src/controllers/authController.ts
const user = await User.create({
  email,
  password_hash: hashedPassword,
  name,
  phone: phone || null,
  role: 'guest', // Default role cho user đăng ký mới
  is_active: true,
});
```

### Frontend Types

```typescript
// Projects/public-frontend/src/types/index.ts
export interface User {
  role: 'guest' | 'student' | 'instructor' | 'admin'
}
```

---

## 🔧 MIGRATION

### Migration Script

File: `Projects/public-backend/src/migrations/003_update_user_roles.sql`

**Chức năng:**
1. Drop constraint cũ
2. Update existing users: `'user'` → `'guest'`
3. Add constraint mới: `CHECK (role IN ('guest', 'student', 'instructor', 'admin'))`
4. Set default = `'guest'`

**Chạy migration:**
```bash
cd Projects/public-backend
npm run migrate
# hoặc
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f src/migrations/003_update_user_roles.sql
```

---

## ⚠️ LƯU Ý QUAN TRỌNG

### 1. Phân biệt CMS Admin Roles vs Database Roles

- **Database roles** (lưu trong `users.role`): `'guest'`, `'student'`, `'instructor'`, `'admin'`
- **CMS Frontend types** (`cms-frontend/types/index.ts`): `'owner'`, `'admin'`, `'editor'`, `'author'`
  - Đây là **legacy types** hoặc **frontend-only permissions**
  - Không lưu trong database
  - Chỉ dùng cho UI logic trong CMS frontend

### 2. Khi nào dùng `'guest'` vs `'student'`?

- **`'guest'`**: User mới đăng ký, chưa có enrollment nào
- **`'student'`**: User đã có ít nhất 1 enrollment

**Có thể tự động update:**
```sql
-- Khi user đăng ký khóa học đầu tiên
UPDATE users 
SET role = 'student' 
WHERE id = :userId 
AND role = 'guest'
AND EXISTS (SELECT 1 FROM enrollments WHERE user_id = :userId);
```

### 3. Bootstrap Admin

Khi hệ thống khởi động, nếu chưa có admin:
- User đầu tiên (theo `created_at`) sẽ được promote thành `'admin'`

---

## 📚 TÀI LIỆU LIÊN QUAN

- [DATABASE_DESIGN_IPD8_TABLES_REFACTOR.md](./DATABASE_DESIGN_IPD8_TABLES_REFACTOR.md) - Chi tiết bảng users
- [DATABASE_DESIGN_IPD8_OVERVIEW.md](./DATABASE_DESIGN_IPD8_OVERVIEW.md) - Tổng quan database
- [DATABASE_DESIGN_IPD8_MIGRATION.md](./DATABASE_DESIGN_IPD8_MIGRATION.md) - Migration plan

---

## ✅ CHECKLIST

- [x] Database constraint: `CHECK (role IN ('guest', 'student', 'instructor', 'admin'))`
- [x] Default value: `'guest'`
- [x] Migration script: `003_update_user_roles.sql`
- [x] Models updated: `public-backend`, `cms-backend`
- [x] Auth controller: Đăng ký với role = `'guest'`
- [x] Frontend types: `public-frontend` đã đúng
- [ ] Auto-update: `'guest'` → `'student'` khi đăng ký khóa học (có thể implement sau)

---

**Tài liệu này mô tả roles theo chuẩn DATABASE_DESIGN_IPD8_TABLES_REFACTOR.md**















