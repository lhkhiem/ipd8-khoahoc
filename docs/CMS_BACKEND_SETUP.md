# CMS Backend Setup - IPD8

## ✅ Đã Hoàn Thành

### 1. Models Sync với Database Schema
- ✅ **User Model**: Đã sync với database schema (is_active, phone, address, gender, dob, avatar_url, email_verified, phone_verified, last_login_at)
- ✅ **Post Model**: Đã sync với database schema (content TEXT, type, category, expert_id, event_date, event_location, view_count, is_featured, seo_title, seo_description, thumbnail_url, status)

### 2. Database Configuration
- ✅ Updated `DB_NAME` default từ `'banyco'` → `'ipd8_db'`
- ✅ Port đã được set: **3103**

### 3. Port Configuration
- ✅ Server port: **3103** (đúng với project ports)
- ✅ Default trong `src/index.ts`: `3103`

## 🔧 Cần Kiểm Tra

### 1. Environment Variables (.env.local)

Đảm bảo file `.env.local` trong `Projects/cms-backend/` có:

```env
# Database (dùng chung với Public Backend - cùng ipd8_db)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ipd8_db_staging  # hoặc ipd8_db cho production
DB_USER=ipd8_user        # hoặc spa_cms_user
DB_PASSWORD=your_password_here

# Server
PORT=3103
BASE_URL=http://localhost:3103
API_BASE_URL=http://localhost:3103

# JWT Authentication
JWT_SECRET=your_cms_jwt_secret_here
JWT_EXPIRES_IN=7d

# CORS
ADMIN_DOMAIN=http://localhost:3102
WEBSITE_DOMAIN=http://localhost:3100
```

### 2. Database Connection

Test database connection:
```bash
cd Projects/cms-backend
npm run dev
```

Expected output:
```
Database connection established successfully.
Server running on port 3103
```

## 📋 Next Steps

1. **Verify Environment Variables**
   - Kiểm tra `.env.local` có đầy đủ không
   - Đảm bảo database credentials đúng

2. **Test Server Start**
   - Start server: `npm run dev`
   - Test health endpoint: `http://localhost:3103/health`

3. **Test API Endpoints**
   - Test authentication
   - Test CRUD operations
   - Verify models work correctly

4. **Sync với Public Backend**
   - Đảm bảo cả 2 backends dùng cùng database
   - Verify models không conflict

## 🔍 Models Status

### ✅ Đã Sync
- User (is_active, all new fields)
- Post (TEXT content, all new fields)

### ⚠️ Cần Kiểm Tra
- Các models khác (Instructor, Course, Enrollment, etc.) - có thể cần sync nếu có thay đổi trong database schema

## 📝 Notes

- CMS Backend và Public Backend **dùng chung database** nhưng **models code riêng biệt**
- Port: **3103** (CMS Backend)
- Database: `ipd8_db` hoặc `ipd8_db_staging` (tùy environment)










