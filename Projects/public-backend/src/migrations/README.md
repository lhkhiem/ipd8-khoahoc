# IPD8 Database Migrations

Migration scripts để chuyển đổi database từ CMS cũ sang IPD8 Learning Platform schema.

## 📋 Tổng Quan

Migration này bao gồm 5 bước chính:
1. **000_create_base_tables.sql** - Tạo các bảng cơ bản (users, posts, contact_forms) - CẦN THIẾT cho staging database mới
2. **001_create_ipd8_new_tables.sql** - Tạo 17 bảng mới cho IPD8
3. **002_refactor_existing_tables.sql** - Tái cấu trúc bảng cũ (users, posts, contact_forms)
4. **003_drop_ecommerce_tables.sql** - Xóa 20 bảng e-commerce không dùng
5. **004_create_cms_tables.sql** - Tạo 15 bảng CMS (12 bảng giữ nguyên + 3 bảng tái cấu trúc)

**Kết quả:** 35 bảng tổng cộng (3 base + 17 IPD8 + 12 CMS keep + 3 CMS refactor)

**Lưu ý:** 
- Migration `000` chỉ cần thiết cho staging database mới (trống). Nếu database production đã có bảng `users`, migration `000` sẽ skip (CREATE TABLE IF NOT EXISTS).
- Migration `004` tạo các bảng CMS cần thiết cho cả CMS Backend và Public Backend.

## ⚠️  QUAN TRỌNG: Backup Trước Khi Migration

**BẮT BUỘC** phải backup database trước khi chạy migration!

### Backup trên Windows (PowerShell):
```powershell
.\src\migrations\backup-database.ps1
```

### Backup trên Linux/Mac (Bash):
```bash
chmod +x src/migrations/backup-database.sh
./src/migrations/backup-database.sh
```

Backup sẽ được lưu trong thư mục `backups/` với format:
- `backup_full_YYYYMMDD_HHMMSS.sql` - Full backup
- `backup_schema_YYYYMMDD_HHMMSS.sql` - Schema only
- `backup_data_YYYYMMDD_HHMMSS.sql` - Data only

## 🚀 Chạy Migration

### 1. Setup Environment Variables

Đảm bảo file `.env.local` có đầy đủ thông tin database:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ipd8_db
DB_USER=postgres
DB_PASSWORD=your_password
```

### 2. Test Migration (Recommended - Dry Run)

**BẮT BUỘC** test migration trước khi chạy thực tế:

```bash
npm run migrate:test
```

Test script sẽ:
- ✓ Kiểm tra database connection
- ✓ Kiểm tra current database state
- ✓ Validate SQL syntax
- ✓ Kiểm tra dependencies
- ✓ Không thực hiện thay đổi (dry run)

### 3. Backup Database (BẮT BUỘC)

Trước khi chạy migration, **BẮT BUỘC** backup:

```bash
# Windows
.\src\migrations\backup-database.ps1

# Linux/Mac
./src/migrations/backup-database.sh
```

### 4. Chạy Migration

Sau khi test và backup thành công:

```bash
npm run migrate
```

Hoặc chạy trực tiếp:
```bash
ts-node src/migrations/run-migrations.ts
```

Migration runner sẽ:
- Tự động chạy các file SQL theo thứ tự (001, 002, 003)
- Sử dụng transaction để đảm bảo an toàn
- Rollback tự động nếu có lỗi
- Hiển thị progress và verification

## ✅ Verification

Sau khi migration xong, kiểm tra kết quả:

```bash
npm run migrate:verify
```

Hoặc chạy trực tiếp SQL:
```bash
psql -h localhost -U postgres -d ipd8_db -f src/migrations/verify-migration.sql
```

## 📁 Cấu Trúc Files

```
src/migrations/
├── README.md                          # Tài liệu này
├── migration-checklist.md             # Checklist cho staging test
├── run-migrations.ts                   # Migration runner
├── test-migration.ts                   # Test script (dry run)
├── 000_create_base_tables.sql         # Tạo base tables (users, posts, contact_forms)
├── 001_create_ipd8_new_tables.sql     # Tạo 17 bảng mới cho IPD8
├── 002_refactor_existing_tables.sql   # Tái cấu trúc bảng cũ
├── 003_drop_ecommerce_tables.sql      # Xóa bảng e-commerce
├── 004_create_cms_tables.sql          # Tạo 15 bảng CMS (keep + refactor)
├── verify-migration.sql                # Verification queries
├── backup-database.sh                  # Backup script (Linux/Mac)
└── backup-database.ps1                 # Backup script (Windows)
```

## 🔄 Rollback

Nếu cần rollback, restore từ backup:

```bash
# Restore full backup
psql -h localhost -U postgres -d ipd8_db < backups/backup_full_YYYYMMDD_HHMMSS.sql
```

## 📊 Kết Quả Mong Đợi

Sau migration thành công:
- ✅ **35 bảng** tổng cộng (12 keep + 6 refactor + 17 new)
- ✅ **17 bảng mới** cho IPD8 (instructors, courses, enrollments, orders, payments, ...)
- ✅ **Bảng cũ đã tái cấu trúc** (users, posts, contact_forms)
- ✅ **20 bảng e-commerce đã xóa** (products, product_categories, brands, ...)
- ✅ **Tất cả indexes và foreign keys** đã được tạo

## 🐛 Troubleshooting

### Lỗi: "relation already exists"
- Bảng đã tồn tại, migration đã chạy trước đó
- Kiểm tra xem migration đã chạy chưa: `SELECT * FROM information_schema.tables WHERE table_name = 'courses';`

### Lỗi: "foreign key constraint"
- Kiểm tra bảng cha đã tồn tại chưa
- Đảm bảo chạy migration theo đúng thứ tự (001, 002, 003)

### Lỗi: "permission denied"
- Kiểm tra user database có quyền CREATE TABLE, ALTER TABLE, DROP TABLE
- Chạy với user có quyền admin (postgres)

### Lỗi: "column already exists"
- Cột đã tồn tại, migration đã chạy một phần
- Kiểm tra và rollback nếu cần

## 📝 Notes

- Migration sử dụng `IF NOT EXISTS` và `IF EXISTS` để tránh lỗi khi chạy lại
- Tất cả migration chạy trong transaction, tự động rollback nếu lỗi
- Verification script sẽ kiểm tra tất cả bảng, indexes, foreign keys
- Backup scripts tự động tạo 3 loại backup (full, schema, data)

## 🔗 Tài Liệu Liên Quan

- [DATABASE_DESIGN_IPD8_MIGRATION.md](../../../docs/DATABASE_DESIGN_IPD8_MIGRATION.md)
- [IMPLEMENTATION_PLAN_PHASE1_DATABASE.md](../../../docs/IMPLEMENTATION_PLAN_PHASE1_DATABASE.md)
- [DATABASE_ARCHITECTURE_GUIDE.md](../../../docs/DATABASE_ARCHITECTURE_GUIDE.md)

