# ENVIRONMENT VARIABLES GUIDE - IPD8

**Mục đích:** Hướng dẫn sử dụng environment variables theo yêu cầu kiến trúc

**Yêu cầu:** Tất cả URL, database, API keys, secrets đều từ `.env.local` (development) hoặc `.env.production` (production), **KHÔNG hardcode** trong code.

---

## 📋 NGUYÊN TẮC

1. **KHÔNG hardcode** bất kỳ:
   - URL/domain/port
   - Database credentials
   - API keys/secret keys/tokens
   - Các thông tin nhạy cảm khác

2. **Tất cả phải đọc từ environment variables:**
   - Backend: `process.env.VARIABLE_NAME`
   - Frontend (Next.js): `process.env.NEXT_PUBLIC_VARIABLE_NAME`

3. **File environment:**
   - Development: `.env.local` (không commit vào Git)
   - Production: `.env.production` hoặc environment variables trên server
   - Template: `.env.example` (commit vào Git, không chứa secrets)

---

## 1. CMS BACKEND ENVIRONMENT VARIABLES

**File:** `Projects/cms-backend/.env.local` (development) hoặc `.env.production` (production)

```env
# Database (KHÔNG hardcode)
# Database dùng chung với Public Backend (cùng ipd8_db)
# Nhưng models code riêng biệt
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ipd8_db          # Cùng database với Public Backend
DB_USER=postgres
DB_PASSWORD=your_password_here

# JWT (KHÔNG hardcode secret)
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# API URLs (KHÔNG hardcode)
CMS_API_BASE_URL=http://localhost:3000/api
CMS_FRONTEND_URL=http://localhost:3002

# Payment Gateways (KHÔNG hardcode keys)
ZALOPAY_APP_ID=your_zalopay_app_id
ZALOPAY_APP_SECRET=your_zalopay_secret
VNPAY_TMN_CODE=your_vnpay_tmn_code
VNPAY_SECRET_KEY=your_vnpay_secret_key
MOMO_PARTNER_CODE=your_momo_partner_code
MOMO_SECRET_KEY=your_momo_secret_key

# Email (KHÔNG hardcode credentials)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_email_password

# Storage
SHARED_STORAGE_PATH=../../shared-storage
STORAGE_UPLOADS_PATH=${SHARED_STORAGE_PATH}/uploads
STORAGE_TEMP_PATH=${SHARED_STORAGE_PATH}/temp
STORAGE_PROVIDER=local  # 'local' hoặc 's3'

# Cloud storage (optional)
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET=your_bucket_name
```

**Sử dụng trong code:**
```typescript
// ✅ ĐÚNG - Đọc từ env
const dbHost = process.env.DB_HOST;
const jwtSecret = process.env.JWT_SECRET;
const apiUrl = process.env.CMS_API_BASE_URL;

// ❌ SAI - Hardcode
const dbHost = 'localhost';
const jwtSecret = 'my-secret-key';
const apiUrl = 'http://localhost:3000/api';
```

---

## 2. PUBLIC BACKEND ENVIRONMENT VARIABLES

**File:** `Projects/public-backend/.env.local` (development) hoặc `.env.production` (production)

```env
# Database (KHÔNG hardcode)
# Database dùng chung với CMS Backend (cùng ipd8_db)
# Nhưng models code riêng biệt
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ipd8_db          # Cùng database với CMS Backend
DB_USER=postgres
DB_PASSWORD=your_password_here

# JWT (KHÔNG hardcode secret, khác với CMS Backend)
JWT_SECRET_PUBLIC=your_public_jwt_secret_here
JWT_EXPIRES_IN=7d

# API URLs (KHÔNG hardcode)
PUBLIC_API_BASE_URL=http://localhost:3001/api/public
PUBLIC_FRONTEND_URL=http://localhost:3003

# Payment Gateways (KHÔNG hardcode keys)
ZALOPAY_APP_ID=your_zalopay_app_id
ZALOPAY_APP_SECRET=your_zalopay_secret
VNPAY_TMN_CODE=your_vnpay_tmn_code
VNPAY_SECRET_KEY=your_vnpay_secret_key
MOMO_PARTNER_CODE=your_momo_partner_code
MOMO_SECRET_KEY=your_momo_secret_key

# CORS (KHÔNG hardcode origins)
ALLOWED_ORIGINS=http://localhost:3003,https://ipd8.com,https://www.ipd8.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Storage
SHARED_STORAGE_PATH=../../shared-storage
STORAGE_UPLOADS_PATH=${SHARED_STORAGE_PATH}/uploads
STORAGE_TEMP_PATH=${SHARED_STORAGE_PATH}/temp
STORAGE_PROVIDER=local  # 'local' hoặc 's3'

# Cloud storage (optional)
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET=your_bucket_name
```

---

## 3. CMS FRONTEND ENVIRONMENT VARIABLES

**File:** `Projects/cms-frontend/.env.local` (development) hoặc `.env.production` (production)

```env
# Next.js Public Variables (KHÔNG hardcode)
NEXT_PUBLIC_CMS_API_BASE_URL=http://localhost:3000/api
NEXT_PUBLIC_CMS_BACKEND_URL=http://localhost:3000

# NextAuth (KHÔNG hardcode secret)
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3002
```

**Sử dụng trong code:**
```typescript
// ✅ ĐÚNG - Đọc từ env (Next.js public variables)
const apiUrl = process.env.NEXT_PUBLIC_CMS_API_BASE_URL;

// ❌ SAI - Hardcode
const apiUrl = 'http://localhost:3000/api';
```

**Lưu ý:** 
- Next.js chỉ expose variables có prefix `NEXT_PUBLIC_` ra client-side
- Variables không có prefix chỉ dùng được ở server-side

---

## 4. PUBLIC FRONTEND ENVIRONMENT VARIABLES

**File:** `Projects/public-frontend/.env.local` (development) hoặc `.env.production` (production)

```env
# Next.js Public Variables (KHÔNG hardcode)
NEXT_PUBLIC_API_URL=http://localhost:3001/api/public
NEXT_PUBLIC_PUBLIC_BACKEND_URL=http://localhost:3001

# NextAuth (KHÔNG hardcode secret)
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3003
```

**Lưu ý:** Public Frontend chỉ kết nối với **Public Backend**, không kết nối với CMS Backend.

---

## 5. LUỒNG XỬ LÝ VÀ ENVIRONMENT VARIABLES

### 5.1. CMS Flow

```
CMS Frontend (.env.local)
  ↓ NEXT_PUBLIC_CMS_API_BASE_URL
CMS Backend (.env.local)
  ↓ DB_HOST, DB_USER, DB_PASSWORD
Database
```

**Environment Variables:**
- CMS Frontend: `NEXT_PUBLIC_CMS_API_BASE_URL` → CMS Backend
- CMS Backend: `DB_HOST`, `DB_USER`, `DB_PASSWORD` → Database

### 5.2. Public Flow

```
Public Frontend (.env.local)
  ↓ NEXT_PUBLIC_API_URL
Public Backend (.env.local)
  ↓ DB_HOST, DB_USER, DB_PASSWORD
Database
```

**Environment Variables:**
- Public Frontend: `NEXT_PUBLIC_API_URL` → Public Backend
- Public Backend: `DB_HOST`, `DB_USER`, `DB_PASSWORD` → Database

**Lưu ý:** CMS và Public **KHÔNG kết nối với nhau**, mỗi hệ thống độc lập.

---

## 6. CHECKLIST

### Development Setup
- [ ] Tạo `.env.local` từ `.env.example` cho mỗi project
- [ ] Điền đầy đủ values vào `.env.local`
- [ ] **KHÔNG commit** `.env.local` vào Git (đã có trong `.gitignore`)
- [ ] Commit `.env.example` (template, không chứa secrets)

### Code Review
- [ ] Kiểm tra không có hardcode URL/domain/port
- [ ] Kiểm tra không có hardcode API keys/secrets
- [ ] Kiểm tra tất cả đều đọc từ `process.env.*`
- [ ] Kiểm tra Frontend dùng `NEXT_PUBLIC_*` cho client-side variables

### Production Deployment
- [ ] Setup environment variables trên server
- [ ] Hoặc tạo `.env.production` trên server
- [ ] **KHÔNG commit** `.env.production` vào Git
- [ ] Verify tất cả variables đã được set đúng

---

## 7. VÍ DỤ SỬ DỤNG

### Backend (Node.js/Express)

```typescript
// ✅ ĐÚNG
import express from 'express';
const app = express();

const PORT = process.env.PORT || 3000;
const DB_HOST = process.env.DB_HOST;
const JWT_SECRET = process.env.JWT_SECRET;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// ❌ SAI - Hardcode
const PORT = 3000;
const DB_HOST = 'localhost';
const JWT_SECRET = 'my-secret-key';
```

### Frontend (Next.js)

```typescript
// ✅ ĐÚNG - Public variable (client-side)
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// ✅ ĐÚNG - Server-side only
const apiKey = process.env.API_KEY; // Chỉ dùng trong API routes

// ❌ SAI - Hardcode
const apiUrl = 'http://localhost:3001/api/public';
```

---

## 8. TROUBLESHOOTING

### Lỗi: `undefined` khi đọc env variable

**Nguyên nhân:**
- Variable chưa được set trong `.env.local`
- Variable không có prefix `NEXT_PUBLIC_` nhưng dùng ở client-side

**Giải pháp:**
- Kiểm tra file `.env.local` có tồn tại không
- Kiểm tra variable name đúng không
- Restart dev server sau khi thay đổi `.env.local`

### Lỗi: Hardcode URL trong code

**Giải pháp:**
- Tìm và thay thế tất cả hardcode URLs bằng env variables
- Review code trước khi commit

---

## TÓM TẮT

**Nguyên tắc:**
1. ✅ **KHÔNG hardcode** URL, database, API keys, secrets
2. ✅ Tất cả đọc từ environment variables
3. ✅ Development: `.env.local` (không commit)
4. ✅ Production: `.env.production` hoặc server env vars
5. ✅ Template: `.env.example` (commit, không chứa secrets)

**Luồng xử lý:**
- CMS Frontend → CMS Backend (qua `NEXT_PUBLIC_CMS_API_BASE_URL`)
- Public Frontend → Public Backend (qua `NEXT_PUBLIC_API_URL`)
- **KHÔNG có kết nối giữa CMS và Public**

