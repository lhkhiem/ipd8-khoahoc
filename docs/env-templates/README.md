# Environment Variables Templates

Các file template cho environment variables của tất cả projects.

## 📋 Các File Template

- `cms-backend.env.example` - Template cho CMS Backend
- `public-backend.env.example` - Template cho Public Backend
- `cms-frontend.env.example` - Template cho CMS Frontend
- `public-frontend.env.example` - Template cho Public Frontend

## 🚀 Cách Sử Dụng

### Bước 1: Copy template vào project

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

### Bước 2: Copy `.env.example` thành `.env.local`

```bash
# CMS Backend
cd Projects/cms-backend
cp .env.example .env.local

# Public Backend
cd Projects/public-backend
cp .env.example .env.local

# CMS Frontend
cd Projects/cms-frontend
cp .env.example .env.local

# Public Frontend
cd Projects/public-frontend
cp .env.example .env.local
```

### Bước 3: Điền giá trị thực tế vào `.env.local`

Mở file `.env.local` và thay thế các giá trị placeholder:
- `your_password_here` → Mật khẩu thực tế
- `your_jwt_secret_here` → Secret key (generate random)
- `your_zalopay_app_id` → ZaloPay credentials (nếu có)
- etc.

## 🔐 Generate Secrets

### JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### NextAuth Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## ⚠️ Lưu Ý

- ✅ **Commit** `.env.example` vào Git (template, không chứa secrets)
- ❌ **KHÔNG commit** `.env.local` vào Git (đã có trong `.gitignore`)
- ❌ **KHÔNG commit** `.env.production` vào Git

## 📚 Tài Liệu

Xem [ENV_SETUP_INSTRUCTIONS.md](../ENV_SETUP_INSTRUCTIONS.md) để biết hướng dẫn chi tiết.


















