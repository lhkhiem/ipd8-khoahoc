# DATABASE ARCHITECTURE GUIDE - IPD8

**Mục đích:** Hướng dẫn kiến trúc database cho IPD8 - Database dùng chung, Models riêng biệt

---

## 📋 TỔNG QUAN

### Yêu Cầu Kiến Trúc

1. **Database PostgreSQL dùng chung** cho CMS và Public website
2. **Mỗi project có models riêng biệt**, không ảnh hưởng tới nhau
3. **Connection pools riêng biệt** cho mỗi backend

---

## 1. KIẾN TRÚC DATABASE

### 1.1. Database Structure

```
PostgreSQL Database: ipd8_db
│
├── Tables (35 bảng) - Dùng chung cho cả CMS và Public
│   ├── users
│   ├── courses
│   ├── instructors
│   ├── enrollments
│   ├── orders
│   ├── payments
│   └── ... (tất cả 35 bảng)
│
└── Connection Pools (riêng biệt)
    ├── CMS Backend Pool (max: 20 connections)
    └── Public Backend Pool (max: 20 connections)
```

### 1.2. Models Structure (Code Level)

```
IPD8/
├── Projects/
│   ├── cms-backend/
│   │   └── src/
│   │       └── models/          # ⚠️ Models riêng cho CMS
│   │           ├── User.ts
│   │           ├── Course.ts
│   │           ├── Instructor.ts
│   │           ├── Enrollment.ts
│   │           └── ...
│   │
│   └── public-backend/
│       └── src/
│           └── models/          # ⚠️ Models riêng cho Public
│               ├── User.ts      # Model riêng (có thể khác CMS)
│               ├── Course.ts    # Model riêng
│               ├── Enrollment.ts # Model riêng
│               └── ...
```

**Lưu ý quan trọng:**
- **Database:** Dùng chung (cùng `ipd8_db`, cùng các bảng)
- **Models Code:** Riêng biệt hoàn toàn (không share code)
- **Connection Pools:** Riêng biệt (không share pool)

---

## 2. DATABASE CONNECTION

### 2.1. CMS Backend Connection

**File:** `cms-backend/src/config/database.ts`

```typescript
import { Pool } from 'pg';

// Database dùng chung với Public Backend
// Nhưng connection pool riêng biệt
const pool = new Pool({
  host: process.env.DB_HOST,           // Từ .env.local
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,        // ipd8_db (dùng chung)
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,                              // Pool riêng cho CMS
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export default pool;
```

### 2.2. Public Backend Connection

**File:** `public-backend/src/config/database.ts`

```typescript
import { Pool } from 'pg';

// Database dùng chung với CMS Backend
// Nhưng connection pool riêng biệt
const pool = new Pool({
  host: process.env.DB_HOST,           // Từ .env.local
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,        // ipd8_db (dùng chung)
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,                              // Pool riêng cho Public
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export default pool;
```

**Lưu ý:** Cùng database nhưng connection pools riêng biệt.

---

## 3. MODELS RIÊNG BIỆT

### 3.1. CMS Backend Models

**File:** `cms-backend/src/models/User.ts`

```typescript
// CMS Backend Model - Riêng biệt
import pool from '../config/database';

export class User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'instructor' | 'student' | 'guest';
  // ... các fields khác

  // Methods cho CMS (admin operations)
  static async findAll(options?: any) {
    const result = await pool.query(
      'SELECT * FROM users ORDER BY created_at DESC',
      []
    );
    return result.rows;
  }

  static async findById(id: string) {
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  // Admin-only methods
  static async delete(id: string) {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
  }

  static async updateRole(id: string, role: string) {
    await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2',
      [role, id]
    );
  }
}
```

### 3.2. Public Backend Models

**File:** `public-backend/src/models/User.ts`

```typescript
// Public Backend Model - Riêng biệt
import pool from '../config/database';

export class User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'guest';  // Chỉ có student và guest
  // ... các fields khác

  // Methods cho Public (user operations)
  static async findById(id: string) {
    const result = await pool.query(
      'SELECT id, email, name, role, avatar_url FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  // User-only methods (không có admin methods)
  static async updateProfile(id: string, data: any) {
    await pool.query(
      'UPDATE users SET name = $1, phone = $2 WHERE id = $3',
      [data.name, data.phone, id]
    );
  }

  // Không có delete, updateRole (admin-only)
}
```

**Lưu ý:** 
- Cùng bảng `users` trong database
- Nhưng models code khác nhau, methods khác nhau
- CMS có admin methods, Public không có

---

## 4. ENVIRONMENT VARIABLES

### 4.1. CMS Backend

**File:** `cms-backend/.env.local`

```env
# Database (dùng chung với Public Backend)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ipd8_db
DB_USER=postgres
DB_PASSWORD=your_password
```

### 4.2. Public Backend

**File:** `public-backend/.env.local`

```env
# Database (dùng chung với CMS Backend)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ipd8_db          # Cùng database
DB_USER=postgres
DB_PASSWORD=your_password
```

**Lưu ý:** Cùng `DB_NAME` nhưng models code riêng biệt.

---

## 5. LỢI ÍCH CỦA KIẾN TRÚC NÀY

### 5.1. Tách Biệt Logic

- **CMS Backend:** Models có admin methods (delete, updateRole, v.v.)
- **Public Backend:** Models chỉ có user methods (updateProfile, v.v.)
- Mỗi backend chỉ có methods cần thiết

### 5.2. Bảo Mật

- Public Backend không có access đến admin methods
- Không thể vô tình gọi admin methods từ Public Backend
- Code rõ ràng, dễ review

### 5.3. Độc Lập Phát Triển

- Thay đổi CMS models không ảnh hưởng Public Backend
- Thay đổi Public models không ảnh hưởng CMS Backend
- Có thể refactor models độc lập

### 5.4. Dễ Bảo Trì

- Code rõ ràng, không lẫn lộn
- Mỗi backend có models phù hợp với use case
- Dễ debug và troubleshoot

---

## 6. MIGRATION & SETUP

### 6.1. Database Setup

```sql
-- Tạo database (chỉ cần 1 lần)
CREATE DATABASE ipd8_db;

-- Tất cả bảng được tạo trong database này
-- CMS Backend và Public Backend đều connect đến database này
```

### 6.2. Models Setup

**CMS Backend:**
```bash
cd Projects/cms-backend
# Tạo models riêng cho CMS
# src/models/User.ts, Course.ts, v.v.
```

**Public Backend:**
```bash
cd Projects/public-backend
# Tạo models riêng cho Public
# src/models/User.ts, Course.ts, v.v.
```

**Lưu ý:** Models có thể có cùng tên nhưng code khác nhau.

---

## 7. VÍ DỤ SỬ DỤNG

### 7.1. CMS Backend - Admin Operations

```typescript
// cms-backend/src/controllers/users.controller.ts
import { User } from '../models/User';

// Admin có thể xem tất cả users
export async function getAllUsers(req, res) {
  const users = await User.findAll(); // CMS method
  res.json(users);
}

// Admin có thể xóa user
export async function deleteUser(req, res) {
  await User.delete(req.params.id); // CMS method (không có trong Public)
  res.json({ success: true });
}
```

### 7.2. Public Backend - User Operations

```typescript
// public-backend/src/controllers/users.controller.ts
import { User } from '../models/User';

// User chỉ có thể xem profile của mình
export async function getMyProfile(req, res) {
  const user = await User.findById(req.user.id); // Public method
  res.json(user);
}

// User có thể update profile
export async function updateMyProfile(req, res) {
  await User.updateProfile(req.user.id, req.body); // Public method
  res.json({ success: true });
}

// Không có deleteUser - Public Backend không có method này
```

---

## 8. CHECKLIST

### Database Setup
- [ ] Tạo database `ipd8_db` (chỉ 1 lần)
- [ ] Run migrations để tạo 35 bảng
- [ ] Verify tất cả bảng đã tạo

### CMS Backend Models
- [ ] Tạo models riêng cho CMS (`cms-backend/src/models/`)
- [ ] Models có admin methods (delete, updateRole, v.v.)
- [ ] Connection pool riêng biệt

### Public Backend Models
- [ ] Tạo models riêng cho Public (`public-backend/src/models/`)
- [ ] Models chỉ có user methods (updateProfile, v.v.)
- [ ] Không có admin methods
- [ ] Connection pool riêng biệt

### Environment Variables
- [ ] CMS Backend `.env.local` với `DB_NAME=ipd8_db`
- [ ] Public Backend `.env.local` với `DB_NAME=ipd8_db` (cùng database)
- [ ] Verify connection pools riêng biệt

---

## TÓM TẮT

**Kiến trúc Database:**
- ✅ **Database:** PostgreSQL dùng chung (`ipd8_db`)
- ✅ **Tables:** Dùng chung (35 bảng)
- ✅ **Connection Pools:** Riêng biệt (mỗi backend có pool riêng)
- ✅ **Models Code:** Riêng biệt hoàn toàn (không share code)

**Lợi ích:**
- Tách biệt logic giữa CMS và Public
- Bảo mật tốt hơn (Public không có admin methods)
- Độc lập phát triển
- Dễ bảo trì

