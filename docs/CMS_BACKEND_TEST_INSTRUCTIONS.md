# CMS Backend Test Instructions

## ⚠️ Database Connection Issue

Lỗi hiện tại: `password authentication failed for user "postgres"`

### Nguyên nhân
- `.env.local` có thể đang dùng `DB_USER=postgres` với password không đúng
- Hoặc database user `postgres` không có quyền truy cập database `ipd8_db_staging`

### Giải pháp

**Option 1: Dùng `ipd8_user` (Khuyến nghị)**

Cập nhật `Projects/cms-backend/.env.local`:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ipd8_db_staging
DB_USER=ipd8_user          # ⚠️ Đổi từ 'postgres' → 'ipd8_user'
DB_PASSWORD=password_cua_ipd8_user
PORT=3103
```

**Option 2: Dùng `postgres` user**

Nếu muốn dùng `postgres` user, đảm bảo:
1. Password của `postgres` user đúng
2. `postgres` user có quyền truy cập database `ipd8_db_staging`

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ipd8_db_staging
DB_USER=postgres
DB_PASSWORD=password_cua_postgres_user  # ⚠️ Phải đúng password
PORT=3103
```

## 🚀 Test Server

Sau khi fix `.env.local`:

```bash
cd Projects/cms-backend
npm run dev
```

**Expected output:**
```
[loadEnv] Loaded .env.local from ...
[EmailService] Loading email configuration from database...
[EmailService] Database not ready yet, will retry later: ... (OK - chỉ warning)
[CORS] Allowed origins: [...]
Database connection established successfully.
Server running on port 3103
```

**Test health:**
```bash
cd Projects/cms-backend
npm run test:health
```

## 📝 Notes

- EmailService sẽ retry khi cần (không fail server)
- Database connection được thiết lập trong `ready()` function
- Port: **3103**










