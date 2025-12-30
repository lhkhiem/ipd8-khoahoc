# CMS Backend - Fix Environment Variables

## ⚠️ Vấn Đề Hiện Tại

Test connection cho thấy:
```
User: postgres
Password: ***
❌ Database connection failed!
Error: password authentication failed for user "postgres"
```

## ✅ Giải Pháp

### Option 1: Dùng `ipd8_user` (Khuyến nghị - Consistency với Public Backend)

Cập nhật `Projects/cms-backend/.env.local`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ipd8_db_staging
DB_USER=ipd8_user          # ⚠️ Đổi từ 'postgres' → 'ipd8_user'
DB_PASSWORD=password_cua_ipd8_user  # Password của ipd8_user (giống Public Backend)
PORT=3103
```

**Lợi ích:**
- ✅ Consistency với Public Backend (cùng user)
- ✅ User `ipd8_user` đã có quyền trên database
- ✅ Đã được test và hoạt động với Public Backend

### Option 2: Dùng `postgres` user

Nếu muốn dùng `postgres` user, cần:
1. Password của `postgres` user phải đúng
2. `postgres` user phải có quyền truy cập `ipd8_db_staging`

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ipd8_db_staging
DB_USER=postgres
DB_PASSWORD=password_cua_postgres_user  # ⚠️ Phải đúng password
PORT=3103
```

## 🧪 Test Connection

Sau khi cập nhật `.env.local`:

```bash
cd Projects/cms-backend
npm run test:db
```

**Expected output:**
```
✅ Database connection successful!
✅ Database has 35 tables
```

## 🚀 Test Server

Sau khi connection test pass:

```bash
cd Projects/cms-backend
npm run dev
npm run test:health
```






















