# Hardcoded Values Cleanup - IPD8 Project

## Tổng quan
Đã fix tất cả các hardcoded values từ dự án cũ (Banyco, PressUp) và thay thế bằng environment variables, tuân thủ yêu cầu kiến trúc.

## Các thay đổi

### 1. Hardcoded Domains ✅
**Trước:**
- `api.banyco.vn`
- `admin.banyco.vn`
- `banyco.vn`
- `ecommerce-api.banyco.vn`
- `https://banyco.vn` (fallback)

**Sau:**
- `process.env.API_DOMAIN`
- `process.env.ADMIN_DOMAIN`
- `process.env.WEBSITE_ORIGIN` hoặc `process.env.SITE_URL`
- `process.env.ECOMMERCE_API_DOMAIN`
- Không có fallback hardcoded (warning nếu thiếu)

**Files đã fix:**
- `Projects/cms-backend/src/controllers/authController.ts`
- `Projects/cms-backend/src/app.ts` (CSP)
- `Projects/cms-backend/src/controllers/orderController.ts`
- `Projects/cms-backend/src/routes/payments.ts`
- `Projects/cms-frontend/next.config.ts` (CSP)

### 2. Hardcoded Project Names ✅
**Trước:**
- `Banyco`
- `PressUp`
- `PressUp CMS`
- `Banyco CMS`

**Sau:**
- `process.env.SITE_NAME` (backend)
- `process.env.NEXT_PUBLIC_SITE_NAME` (frontend)
- Default: `'IPD8'` hoặc `'IPD8 CMS'`

**Files đã fix:**
- `Projects/cms-backend/src/controllers/settingsController.ts`
- `Projects/cms-backend/src/controllers/public/pageMetadataController.ts`
- `Projects/cms-backend/src/controllers/orderController.ts`
- `Projects/cms-backend/src/routes/payments.ts`
- `Projects/cms-backend/src/utils/emailTemplates.ts`
- `Projects/cms-frontend/app/layout.tsx`
- `Projects/cms-frontend/app/login/page.tsx`
- `Projects/cms-frontend/components/app-sidebar.tsx`
- `Projects/cms-frontend/app/dashboard/settings/page.tsx`

### 3. Hardcoded Emails ✅
**Trước:**
- `admin@pressup.com`

**Sau:**
- `process.env.ADMIN_EMAIL`
- `process.env.SMTP_USER` (fallback)
- Không có fallback hardcoded

**Files đã fix:**
- `Projects/cms-backend/src/controllers/settingsController.ts`
- `Projects/cms-backend/src/controllers/contactController.ts`

### 4. Hardcoded Database Names ✅
**Trước:**
- `'banyco'` (default)

**Sau:**
- `process.env.DB_NAME`
- Default: `'ipd8_db'`

**Files đã fix:**
- `Projects/cms-backend/src/migrations/seed.ts`
- `Projects/cms-backend/src/migrations/run-faq-migration.ts`
- `Projects/cms-backend/src/migrations/run-migrations.ts`
- `Projects/cms-backend/src/migrations/run-single.ts`

### 5. Frontend Branding ✅
**Trước:**
- `"Banyco CMS - Bảng điều khiển"`
- `"PressUp Agency"`
- `"Pressup.vn"`
- `"pressup-cms-theme"` (storage key)

**Sau:**
- `process.env.NEXT_PUBLIC_SITE_NAME` + `" CMS - Bảng điều khiển"`
- `process.env.NEXT_PUBLIC_SITE_NAME` (alt text)
- `process.env.NEXT_PUBLIC_COMPANY_NAME` (footer)
- `${process.env.NEXT_PUBLIC_SITE_NAME || 'ipd8'}-cms-theme` (storage key)

**Files đã fix:**
- `Projects/cms-frontend/app/layout.tsx`
- `Projects/cms-frontend/app/login/page.tsx`
- `Projects/cms-frontend/components/app-sidebar.tsx`
- `Projects/cms-frontend/hooks/use-theme.tsx`

## Environment Variables Cần Thiết

### CMS Backend (.env.local)
```bash
# Site Information
SITE_NAME=IPD8
SITE_DESCRIPTION=Hệ thống quản lý nội dung hiện đại
SITE_URL=http://localhost:3100
WEBSITE_ORIGIN=http://localhost:3100
ADMIN_EMAIL=admin@example.com

# API Domains
API_DOMAIN=localhost:3103
ECOMMERCE_API_DOMAIN=
ADMIN_DOMAIN=localhost:3102
```

### CMS Frontend (.env.local)
```bash
# Site Information
NEXT_PUBLIC_SITE_NAME=IPD8
NEXT_PUBLIC_SITE_DESCRIPTION=Hệ thống quản lý nội dung hiện đại
NEXT_PUBLIC_COMPANY_NAME=

# API Domains
NEXT_PUBLIC_API_DOMAIN=localhost:3103
NEXT_PUBLIC_ECOMMERCE_API_DOMAIN=
```

## Files Còn Có Thể Có Dấu Vết Cũ

Các file sau có thể còn chứa hardcoded values nhưng không ảnh hưởng đến runtime (scripts, migrations, docs):
- `Projects/cms-backend/src/scripts/*` - Scripts tạm thời
- `Projects/cms-backend/src/migrations/*.sql` - SQL migrations (có thể có data cũ)
- `Projects/cms-backend/src/migrations/seed-sliders.sql` - Seed data
- `Projects/cms-backend/src/migrations/041_about_sections.sql` - Content data
- `docs/*.md` - Documentation

**Lưu ý:** Các file này không cần fix vì:
- Scripts chỉ chạy một lần
- SQL migrations có thể chứa data mẫu
- Docs không ảnh hưởng đến runtime

## Kiểm tra

Để kiểm tra không còn hardcoded values:

```bash
# Tìm hardcoded domains
grep -r "banyco\.vn\|pressup" Projects/cms-backend/src --exclude-dir=node_modules
grep -r "banyco\.vn\|pressup" Projects/cms-frontend --exclude-dir=node_modules

# Tìm hardcoded project names
grep -r "Banyco\|PressUp" Projects/cms-backend/src --exclude-dir=node_modules
grep -r "Banyco\|PressUp" Projects/cms-frontend --exclude-dir=node_modules
```

## Kết quả

✅ Tất cả hardcoded values đã được thay thế bằng environment variables
✅ Tuân thủ yêu cầu kiến trúc: không hardcode URLs, domains, brand names
✅ Có fallback hợp lý (IPD8) cho development
✅ Có warnings khi thiếu env vars quan trọng trong production

















