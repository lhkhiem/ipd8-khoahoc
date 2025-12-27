# Migration Checklist - Staging Environment

Checklist để test migration trên staging environment trước khi chạy production.

## 📋 Pre-Migration Checklist

### Environment Setup
- [ ] Staging database đã được tạo (`ipd8_db_staging` hoặc tương tự)
- [ ] Environment variables đã được setup (`.env.local` hoặc `.env.staging`)
- [ ] Database user có đủ quyền (CREATE, ALTER, DROP)
- [ ] PostgreSQL version >= 12 (để hỗ trợ `gen_random_uuid()`)

### Backup
- [ ] **BẮT BUỘC:** Backup database staging trước khi test
- [ ] Backup full database
- [ ] Backup schema only
- [ ] Backup data only
- [ ] Verify backup files đã được tạo

### Pre-Migration Test
- [ ] Chạy test script: `npm run migrate:test`
- [ ] Verify database connection thành công
- [ ] Verify migration files có thể đọc được
- [ ] Verify SQL syntax không có lỗi
- [ ] Verify required tables (users, posts) đã tồn tại

## 🚀 Migration Execution

### Step 1: Test Migration Script
```bash
cd Projects/public-backend
npm run migrate:test
```

**Expected output:**
- ✓ Database connected successfully
- ✓ Current tables in database: X
- ✓ No IPD8 tables found (ready for migration)
- ✓ All migration files valid
- ✓ SQL structure looks valid
- ✓ Required tables exist

### Step 2: Run Migration
```bash
npm run migrate
```

**Expected output:**
- ✓ Extensions ready
- ✓ Running migration: 001_create_ipd8_new_tables.sql
- ✓ Completed: 001_create_ipd8_new_tables.sql
- ✓ Running migration: 002_refactor_existing_tables.sql
- ✓ Completed: 002_refactor_existing_tables.sql
- ✓ Running migration: 003_drop_ecommerce_tables.sql
- ✓ Completed: 003_drop_ecommerce_tables.sql
- ✓ All migrations completed successfully!

### Step 3: Verify Migration
```bash
psql -h localhost -U postgres -d ipd8_db_staging -f src/migrations/verify-migration.sql
```

**Expected results:**
- Total Tables: 35 (or expected number)
- New Tables: 17
- E-commerce Tables Remaining: 0
- Orphaned Records: 0

## ✅ Post-Migration Verification

### Database Structure
- [ ] Verify 35 bảng tổng cộng
- [ ] Verify 17 bảng mới đã tạo (instructors, courses, enrollments, ...)
- [ ] Verify bảng cũ đã tái cấu trúc (users, posts, contact_forms)
- [ ] Verify bảng e-commerce đã xóa (products, product_categories, ...)

### Indexes & Constraints
- [ ] Verify indexes đã được tạo
- [ ] Verify foreign keys đã được thiết lập
- [ ] Verify unique constraints đã được thêm

### Data Integrity
- [ ] Verify không có orphaned records
- [ ] Verify data cũ vẫn còn (users, posts)
- [ ] Verify foreign key relationships đúng

### Application Connection
- [ ] Test CMS Backend connection
- [ ] Test Public Backend connection
- [ ] Test models có thể query được
- [ ] Test basic CRUD operations

## 🐛 Troubleshooting

### Issue: Migration fails with "relation already exists"
**Solution:** 
- Bảng đã tồn tại từ lần migration trước
- Kiểm tra: `SELECT * FROM information_schema.tables WHERE table_name = 'courses';`
- Nếu cần, rollback và chạy lại

### Issue: Migration fails with "foreign key constraint"
**Solution:**
- Kiểm tra bảng cha đã tồn tại chưa
- Đảm bảo chạy migration theo đúng thứ tự (001, 002, 003)
- Kiểm tra users và posts tables đã tồn tại

### Issue: Migration fails with "permission denied"
**Solution:**
- Kiểm tra database user có quyền CREATE, ALTER, DROP
- Chạy với user có quyền admin (postgres)

### Issue: Data loss after migration
**Solution:**
- Restore từ backup: `psql -h localhost -U postgres -d ipd8_db < backup_full_YYYYMMDD_HHMMSS.sql`
- Kiểm tra lại migration scripts

## 📊 Success Criteria

Migration được coi là thành công khi:
- ✅ Tất cả 17 bảng mới đã được tạo
- ✅ Bảng cũ đã được tái cấu trúc đúng
- ✅ Bảng e-commerce đã được xóa
- ✅ Không có lỗi trong quá trình migration
- ✅ Data integrity được đảm bảo (không mất data quan trọng)
- ✅ Indexes và foreign keys đã được tạo
- ✅ Application có thể connect và query database

## 🔄 Rollback Plan

Nếu migration thất bại hoặc có vấn đề:

1. **Stop migration immediately** (nếu đang chạy)
2. **Restore từ backup:**
   ```bash
   psql -h localhost -U postgres -d ipd8_db_staging < backups/backup_full_YYYYMMDD_HHMMSS.sql
   ```
3. **Investigate issue:**
   - Check error logs
   - Review migration scripts
   - Fix issues
4. **Re-test trên staging** trước khi chạy lại

## 📝 Notes

- Migration sử dụng transaction, tự động rollback nếu lỗi
- Backup scripts tự động tạo timestamp
- Verification script kiểm tra toàn bộ database structure
- Test script giúp phát hiện issues trước khi chạy migration thực

## 🎯 Next Steps After Successful Migration

1. ✅ Document any issues encountered
2. ✅ Update migration scripts nếu cần
3. ✅ Test application functionality
4. ✅ Schedule production migration
5. ✅ Prepare production backup plan


















