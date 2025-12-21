# Quick Start: Test Migration trên Staging

Hướng dẫn nhanh để test migration trên staging environment.

## 🎯 Mục Tiêu

Test migration scripts trên staging environment trước khi chạy production để đảm bảo:
- ✅ Migration scripts hoạt động đúng
- ✅ Không mất data
- ✅ Database structure đúng như mong đợi
- ✅ Application có thể connect sau migration

## ⚡ Quick Start (5 bước)

### Bước 1: Setup Staging Database

Tạo staging database (hoặc dùng database test):

```bash
# Tạo database staging
createdb -U postgres ipd8_db_staging

# Hoặc dùng psql
psql -U postgres
CREATE DATABASE ipd8_db_staging;
\q
```

### Bước 2: Setup Environment Variables

Tạo file `.env.local` trong `Projects/public-backend/`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ipd8_db_staging
DB_USER=postgres
DB_PASSWORD=your_password
```

### Bước 3: Test Migration Scripts (Dry Run)

Chạy test script để kiểm tra migration scripts:

```bash
cd Projects/public-backend
npm run migrate:test
```

**Expected output:**
```
✓ Database connected successfully
✓ Current tables in database: X
✓ No IPD8 tables found (ready for migration)
✓ All migration files valid
✓ Migration scripts are ready to run!
```

### Bước 4: Backup Database

**BẮT BUỘC** backup trước khi chạy migration:

```bash
# Windows
.\src\migrations\backup-database.ps1

# Linux/Mac
chmod +x src/migrations/backup-database.sh
./src/migrations/backup-database.sh
```

### Bước 5: Run Migration

Chạy migration:

```bash
npm run migrate
```

**Expected output:**
```
✓ Extensions ready
✓ Running migration: 001_create_ipd8_new_tables.sql
✓ Completed: 001_create_ipd8_new_tables.sql
✓ Running migration: 002_refactor_existing_tables.sql
✓ Completed: 002_refactor_existing_tables.sql
✓ Running migration: 003_drop_ecommerce_tables.sql
✓ Completed: 003_drop_ecommerce_tables.sql
✓ All migrations completed successfully!
```

## ✅ Verification

Sau khi migration xong, verify kết quả:

```bash
psql -h localhost -U postgres -d ipd8_db_staging -f src/migrations/verify-migration.sql
```

**Expected results:**
- Total Tables: 35 (hoặc số bảng mong đợi)
- New Tables: 17
- E-commerce Tables Remaining: 0
- Orphaned Records: 0

## 🔍 Manual Verification

Kiểm tra thủ công một số bảng quan trọng:

```sql
-- Kiểm tra bảng mới đã tạo
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('instructors', 'courses', 'enrollments', 'orders')
ORDER BY table_name;

-- Kiểm tra bảng e-commerce đã xóa
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('products', 'product_categories', 'brands');

-- Kiểm tra users table có cột mới
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('phone', 'address', 'email_verified', 'last_login_at')
ORDER BY column_name;

-- Kiểm tra posts table có cột mới
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'posts' 
AND column_name IN ('type', 'expert_id', 'view_count', 'is_featured')
ORDER BY column_name;
```

## 🐛 Troubleshooting

### Lỗi: "database does not exist"
**Solution:** Tạo database trước:
```bash
createdb -U postgres ipd8_db_staging
```

### Lỗi: "password authentication failed"
**Solution:** Kiểm tra password trong `.env.local` hoặc dùng `PGPASSWORD`:
```bash
export PGPASSWORD=your_password
```

### Lỗi: "permission denied"
**Solution:** Chạy với user có quyền admin:
```bash
# Hoặc grant quyền cho user
psql -U postgres -d ipd8_db_staging
GRANT ALL PRIVILEGES ON DATABASE ipd8_db_staging TO your_user;
```

### Lỗi: "relation already exists"
**Solution:** Bảng đã tồn tại từ lần migration trước. Có thể:
- Drop và tạo lại database
- Hoặc skip migration file đó (nếu đã chạy)

## 📋 Checklist

Sau khi test xong, đánh dấu:

- [ ] Test script chạy thành công (`npm run migrate:test`)
- [ ] Backup database thành công
- [ ] Migration chạy thành công (`npm run migrate`)
- [ ] Verification queries pass
- [ ] 17 bảng mới đã được tạo
- [ ] Bảng cũ đã được tái cấu trúc
- [ ] Bảng e-commerce đã được xóa
- [ ] Không có orphaned records
- [ ] Application có thể connect database
- [ ] Models có thể query được

## 🎯 Next Steps

Sau khi test thành công trên staging:

1. ✅ Document kết quả test
2. ✅ Fix bất kỳ issues nào phát hiện
3. ✅ Update migration scripts nếu cần
4. ✅ Schedule production migration
5. ✅ Prepare production backup plan

## 📝 Notes

- Test script (`migrate:test`) là **dry run** - không thực hiện thay đổi
- Migration script (`migrate`) sử dụng transaction - tự động rollback nếu lỗi
- Backup scripts tự động tạo timestamp
- Verification script kiểm tra toàn bộ database structure

## 🔗 Tài Liệu Liên Quan

- [README.md](./README.md) - Tài liệu đầy đủ
- [migration-checklist.md](./migration-checklist.md) - Checklist chi tiết
- [DATABASE_MIGRATION_COMPLETE.md](../../../docs/DATABASE_MIGRATION_COMPLETE.md) - Tổng kết migration











