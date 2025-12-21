# HƯỚNG DẪN SETUP ENVIRONMENT VARIABLES

**Mục đích:** Hướng dẫn setup environment variables cho tất cả projects

---

## 📋 CÁC BƯỚC SETUP

### 1. Copy file template từ `docs/env-templates/` vào các projects

**CMS Backend:**
```bash
cp docs/env-templates/cms-backend.env.example Projects/cms-backend/.env.example
```

**Public Backend:**
```bash
cp docs/env-templates/public-backend.env.example Projects/public-backend/.env.example
```

**CMS Frontend:**
```bash
cp docs/env-templates/cms-frontend.env.example Projects/cms-frontend/.env.example
```

**Public Frontend:**
```bash
cp docs/env-templates/public-frontend.env.example Projects/public-frontend/.env.example
```

### 2. Copy `.env.example` thành `.env.local`

**CMS Backend:**
```bash
cd Projects/cms-backend
cp .env.example .env.local
```

**Public Backend:**
```bash
cd Projects/public-backend
cp .env.example .env.local
```

**CMS Frontend:**
```bash
cd Projects/cms-frontend
cp .env.example .env.local
```

**Public Frontend:**
```bash
cd Projects/public-frontend
cp .env.example .env.local
```

### 3. Điền giá trị thực tế vào `.env.local`

Mở file `.env.local` và thay thế các giá trị placeholder:

#### CMS Backend `.env.local`
- `DB_PASSWORD` - Mật khẩu PostgreSQL
- `JWT_SECRET` - Secret key cho JWT (generate random string)
- `ZALOPAY_APP_ID`, `ZALOPAY_APP_SECRET` - ZaloPay credentials (nếu có)
- `VNPAY_TMN_CODE`, `VNPAY_SECRET_KEY` - VNPay credentials (nếu có)
- `MOMO_PARTNER_CODE`, `MOMO_SECRET_KEY` - MoMo credentials (nếu có)
- `SMTP_USER`, `SMTP_PASSWORD` - Email credentials (nếu có)
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` - AWS credentials (nếu dùng S3)

#### Public Backend `.env.local`
- `DB_PASSWORD` - Mật khẩu PostgreSQL (cùng với CMS Backend)
- `JWT_SECRET_PUBLIC` - Secret key cho JWT (khác với CMS Backend)
- Payment gateway credentials (nếu có)
- AWS credentials (nếu dùng S3)

#### CMS Frontend `.env.local`
- `NEXTAUTH_SECRET` - Secret key cho NextAuth (generate random string)

#### Public Frontend `.env.local`
- `NEXTAUTH_SECRET` - Secret key cho NextAuth (generate random string)

---

## 🔐 GENERATE SECRETS

### Generate JWT Secret (Node.js)
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Generate NextAuth Secret (Node.js)
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Hoặc dùng online tool:
- https://generate-secret.vercel.app/32

---

## ✅ VERIFY SETUP

### 1. Kiểm tra file `.env.local` đã được tạo
```bash
# CMS Backend
ls Projects/cms-backend/.env.local

# Public Backend
ls Projects/public-backend/.env.local

# CMS Frontend
ls Projects/cms-frontend/.env.local

# Public Frontend
ls Projects/public-frontend/.env.local
```

### 2. Kiểm tra `.env.local` không bị commit vào Git
```bash
# Kiểm tra .gitignore
cat Projects/cms-backend/.gitignore | grep .env.local
cat Projects/public-backend/.gitignore | grep .env.local
cat Projects/cms-frontend/.gitignore | grep .env.local
cat Projects/public-frontend/.gitignore | grep .env.local
```

### 3. Test load environment variables

**CMS Backend:**
```bash
cd Projects/cms-backend
npm run dev
# Kiểm tra console log: [loadEnv] Loaded .env.local from ...
```

**Public Backend:**
```bash
cd Projects/public-backend
npm run dev
# Kiểm tra console log: [loadEnv] Loaded .env.local from ...
```

---

## 📝 LƯU Ý QUAN TRỌNG

### ✅ DO (Nên làm)
- ✅ Commit `.env.example` vào Git (template, không chứa secrets)
- ✅ Tạo `.env.local` từ `.env.example` cho development
- ✅ Điền đầy đủ giá trị thực tế vào `.env.local`
- ✅ Generate secrets mạnh (32+ characters, random)
- ✅ Sử dụng secrets khác nhau cho mỗi project
- ✅ Sử dụng secrets khác nhau cho development và production

### ❌ DON'T (Không nên làm)
- ❌ **KHÔNG commit** `.env.local` vào Git
- ❌ **KHÔNG commit** `.env.production` vào Git
- ❌ **KHÔNG hardcode** secrets trong code
- ❌ **KHÔNG share** secrets giữa development và production
- ❌ **KHÔNG dùng** secrets yếu hoặc dễ đoán

---

## 🔄 UPDATE ENVIRONMENT VARIABLES

Khi cần thêm biến mới:

1. **Update `.env.example`** (template)
2. **Update `.env.local`** (development)
3. **Update production environment** (server hoặc `.env.production`)
4. **Update documentation** nếu cần

---

## 🚨 TROUBLESHOOTING

### Lỗi: `undefined` khi đọc env variable

**Nguyên nhân:**
- Variable chưa được set trong `.env.local`
- File `.env.local` chưa được tạo
- Variable name sai

**Giải pháp:**
1. Kiểm tra file `.env.local` có tồn tại không
2. Kiểm tra variable name đúng không (case-sensitive)
3. Restart dev server sau khi thay đổi `.env.local`

### Lỗi: Database connection failed

**Nguyên nhân:**
- `DB_PASSWORD` chưa được set hoặc sai
- Database chưa được tạo
- Database server chưa chạy

**Giải pháp:**
1. Kiểm tra `DB_PASSWORD` trong `.env.local`
2. Kiểm tra database `ipd8_db` đã được tạo chưa
3. Kiểm tra PostgreSQL server đang chạy

### Lỗi: CORS error

**Nguyên nhân:**
- `ALLOWED_ORIGINS` chưa được set hoặc sai
- Frontend URL không nằm trong allowed origins

**Giải pháp:**
1. Kiểm tra `ALLOWED_ORIGINS` trong `.env.local`
2. Thêm frontend URL vào `ALLOWED_ORIGINS` (comma-separated)

---

## 📚 TÀI LIỆU THAM KHẢO

- [ENVIRONMENT_VARIABLES_GUIDE.md](./ENVIRONMENT_VARIABLES_GUIDE.md) - Chi tiết về environment variables
- [IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md) - Full checklist

---

**Last Updated:** 2025-01-XX

