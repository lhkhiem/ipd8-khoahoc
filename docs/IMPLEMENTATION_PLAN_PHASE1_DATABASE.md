# PHASE 1: DATABASE MIGRATION

**Mục tiêu:** Migrate database từ CMS cũ sang IPD8 schema (35 bảng)

**Thời gian ước tính:** 1-2 tuần

**Lưu ý:** Database PostgreSQL dùng chung cho CMS và Public website. Mỗi backend sẽ có models riêng biệt (không share code models).

---

## 📋 CHECKLIST

### Pre-Migration
- [ ] Backup database toàn bộ
- [ ] Backup schema only
- [ ] Backup data only
- [ ] Setup staging environment
- [ ] Review migration scripts
- [ ] Thông báo team về maintenance window

### Migration Steps
- [ ] Bước 1: Backup database
- [ ] Bước 2: Tạo bảng mới (17 bảng)
- [ ] Bước 3: Tái cấu trúc bảng cũ (6 bảng)
- [ ] Bước 4: Xóa bảng e-commerce (20 bảng)
- [ ] Bước 5: Tạo indexes & constraints
- [ ] Bước 6: Verify data integrity

### Post-Migration
- [ ] Verify tất cả bảng đã tạo (35 bảng)
- [ ] Verify indexes đã tạo
- [ ] Verify foreign keys
- [ ] Test queries cơ bản
- [ ] Verify database có thể connect từ cả CMS Backend và Public Backend
- [ ] Update application code nếu cần
- [ ] **Lưu ý:** Models sẽ được tạo riêng trong Phase 2A và 2B

---

## 0. KIẾN TRÚC DATABASE

### 0.1. Database Dùng Chung

**Yêu cầu:**
- **1 PostgreSQL database:** `ipd8_db` dùng chung cho CMS và Public website
- **35 bảng:** Tất cả bảng được tạo trong database này
- **Connection pools riêng:** Mỗi backend có connection pool riêng biệt

### 0.2. Models Riêng Biệt

**Lưu ý quan trọng:**
- **CMS Backend** sẽ có models riêng: `cms-backend/src/models/`
- **Public Backend** sẽ có models riêng: `public-backend/src/models/`
- **Không share code models** giữa 2 backends
- Cùng database, cùng bảng, nhưng models code riêng biệt

**Xem chi tiết:** [DATABASE_ARCHITECTURE_GUIDE.md](./DATABASE_ARCHITECTURE_GUIDE.md)

---

## 1. BƯỚC 1: BACKUP DATABASE

### 1.1. Backup Commands

```bash
# Backup toàn bộ database
pg_dump -U postgres -d ipd8_db > backup_before_migration_$(date +%Y%m%d_%H%M%S).sql

# Backup chỉ schema (không có data)
pg_dump -U postgres -d ipd8_db --schema-only > backup_schema_$(date +%Y%m%d_%H%M%S).sql

# Backup chỉ data (không có schema)
pg_dump -U postgres -d ipd8_db --data-only > backup_data_$(date +%Y%m%d_%H%M%S).sql
```

### 1.2. Verify Backup

```bash
# Kiểm tra file backup đã tạo
ls -lh backup_*.sql

# Test restore trên database test
psql -U postgres -d ipd8_db_test < backup_before_migration_YYYYMMDD_HHMMSS.sql
```

---

## 2. BƯỚC 2: TẠO BẢNG MỚI (17 BẢNG)

### 2.1. Thứ Tự Tạo Bảng (Theo Dependency)

1. `instructors` (phụ thuộc: `users`)
2. `courses` (phụ thuộc: `instructors`)
3. `course_modules` (phụ thuộc: `courses`)
4. `course_sessions` (phụ thuộc: `courses`, `instructors`)
5. `enrollments` (phụ thuộc: `users`, `courses`)
6. `progress` (phụ thuộc: `enrollments`, `course_modules`, `course_sessions`)
7. `materials` (phụ thuộc: `courses`)
8. `orders` (phụ thuộc: `users`)
9. `order_items` (phụ thuộc: `orders`, `courses`)
10. `payments` (phụ thuộc: `orders`)
11. `post_tags` (phụ thuộc: `posts`)
12. `notifications` (phụ thuộc: `users`)
13. `session_registrations` (phụ thuộc: `users`, `course_sessions`, `enrollments`)
14. `api_keys` - Không phụ thuộc
15. `webhooks` - Không phụ thuộc
16. `webhook_logs` (phụ thuộc: `webhooks`)
17. `api_request_logs` (phụ thuộc: `api_keys`)

### 2.2. Script Migration

**File:** `migrations/001_create_ipd8_tables.sql`

Xem chi tiết script trong: [DATABASE_DESIGN_IPD8_MIGRATION.md](./DATABASE_DESIGN_IPD8_MIGRATION.md#31-script-tạo-bảng-mới)

### 2.3. Verification Queries

```sql
-- Kiểm tra bảng mới đã tạo
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'instructors', 'courses', 'course_modules', 'course_sessions',
    'enrollments', 'progress', 'materials', 'orders', 'order_items',
    'payments', 'post_tags', 'notifications', 'session_registrations',
    'api_keys', 'webhooks', 'webhook_logs', 'api_request_logs'
)
ORDER BY table_name;

-- Kiểm tra indexes
SELECT indexname, tablename FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('instructors', 'courses', 'enrollments', 'orders')
ORDER BY tablename, indexname;
```

---

## 3. BƯỚC 3: TÁI CẤU TRÚC BẢNG CŨ (6 BẢNG)

### 3.1. Bảng Cần Migration

1. **`users`** - Thêm 9 cột mới, sửa `role` enum
2. **`posts`** - Thêm 8 cột mới, đổi `content` từ JSONB → TEXT
3. **`contact_messages` → `contact_forms`** - Đổi tên, thêm 4 cột mới

### 3.2. Bảng Giữ Nguyên (Không Cần Migration)

1. **`topics`** - Giữ nguyên
2. **`tags`** - Giữ nguyên
3. **`newsletter_subscriptions`** - Giữ nguyên

### 3.3. Script Migration

**File:** `migrations/002_refactor_existing_tables.sql`

Xem chi tiết script trong: [DATABASE_DESIGN_IPD8_MIGRATION.md](./DATABASE_DESIGN_IPD8_MIGRATION.md#33-script-tái-cấu-trúc-bảng-cũ)

### 3.4. Data Migration

**Lưu ý quan trọng:**

1. **`posts.content` (JSONB → TEXT):**
   ```sql
   -- Convert JSONB content to TEXT
   -- Cần script riêng để convert format
   UPDATE posts 
   SET content = content::text 
   WHERE content IS NOT NULL;
   ```

2. **`posts.seo` (JSONB → seo_title, seo_description):**
   ```sql
   -- Extract từ JSONB seo
   UPDATE posts 
   SET seo_title = (seo->>'title')::VARCHAR(255),
       seo_description = (seo->>'description')::TEXT
   WHERE seo IS NOT NULL;
   ```

3. **`users.role` (Enum update):**
   ```sql
   -- Map role cũ sang role mới
   UPDATE users 
   SET role = CASE 
       WHEN role = 'admin' THEN 'admin'
       WHEN role = 'user' THEN 'student'
       ELSE 'guest'
   END;
   ```

### 3.5. Verification

```sql
-- Kiểm tra cột mới đã thêm
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('phone', 'address', 'gender', 'dob', 'avatar_url', 'email_verified', 'phone_verified', 'is_active', 'last_login_at');

-- Kiểm tra posts.content đã đổi sang TEXT
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'posts' 
AND column_name = 'content';

-- Kiểm tra contact_forms đã đổi tên
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'contact_forms';
```

---

## 4. BƯỚC 4: XÓA BẢNG E-COMMERCE (20 BẢNG)

### 4.1. Thứ Tự Xóa (Bảng Con Trước)

1. `review_reactions`
2. `product_reviews`
3. `product_variant_option_values`
4. `product_variant_attributes`
5. `product_option_values`
6. `product_options`
7. `product_variants`
8. `stock_movements`
9. `stock_settings`
10. `product_images`
11. `product_attributes`
12. `cart_items`
13. `wishlist_items`
14. `order_items` (e-commerce) - **Lưu ý:** IPD8 có bảng `order_items` riêng
15. `orders` (e-commerce) - **Lưu ý:** Kiểm tra trước khi xóa
16. `addresses`
17. `products`
18. `product_categories`
19. `brands`
20. `product_groups` (nếu có)

### 4.2. Script Migration

**File:** `migrations/003_drop_ecommerce_tables.sql`

Xem chi tiết script trong: [DATABASE_DESIGN_IPD8_MIGRATION.md](./DATABASE_DESIGN_IPD8_MIGRATION.md#32-script-xóa-bảng-e-commerce)

### 4.3. Lưu Ý Quan Trọng

⚠️ **Kiểm tra bảng `orders`:** 
- IPD8 có bảng `orders` riêng
- Script sẽ kiểm tra và chỉ xóa bảng `orders` e-commerce (có `shipping_address`)
- Nếu tên bảng khác, cần điều chỉnh

⚠️ **Backup trước khi xóa:**
- Đảm bảo đã backup database trước khi chạy script xóa
- Có thể export data e-commerce nếu cần sau này

### 4.4. Verification

```sql
-- Kiểm tra các bảng e-commerce đã xóa
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'products', 'product_categories', 'brands', 'product_images',
    'product_attributes', 'product_variants', 'product_options',
    'cart_items', 'wishlist_items', 'product_reviews', 'stock_movements',
    'stock_settings', 'addresses'
);

-- Kết quả mong đợi: Không có bảng nào (empty result)
```

---

## 5. BƯỚC 5: TẠO INDEXES & CONSTRAINTS

### 5.1. Indexes Đã Tạo Trong Script

Tất cả indexes đã được tạo trong script migration. Verify lại:

```sql
-- Kiểm tra indexes cho bảng quan trọng
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('courses', 'enrollments', 'orders', 'users', 'instructors')
ORDER BY tablename, indexname;
```

### 5.2. Foreign Keys

```sql
-- Kiểm tra foreign keys
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
ORDER BY tc.table_name;
```

---

## 6. BƯỚC 6: VERIFY DATA INTEGRITY

### 6.1. Data Counts

```sql
-- Kiểm tra số lượng records
SELECT 
    'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'posts', COUNT(*) FROM posts
UNION ALL
SELECT 'courses', COUNT(*) FROM courses
UNION ALL
SELECT 'instructors', COUNT(*) FROM instructors
UNION ALL
SELECT 'enrollments', COUNT(*) FROM enrollments
UNION ALL
SELECT 'orders', COUNT(*) FROM orders;
```

### 6.2. Foreign Key Integrity

```sql
-- Kiểm tra foreign key violations
SELECT 
    'enrollments' as table_name,
    COUNT(*) as orphaned_records
FROM enrollments e
LEFT JOIN users u ON e.user_id = u.id
LEFT JOIN courses c ON e.course_id = c.id
WHERE u.id IS NULL OR c.id IS NULL;
```

### 6.3. Required Fields

```sql
-- Kiểm tra NOT NULL constraints
SELECT 
    'courses' as table_name,
    COUNT(*) as null_slugs
FROM courses
WHERE slug IS NULL;

SELECT 
    'users' as table_name,
    COUNT(*) as null_emails
FROM users
WHERE email IS NULL;
```

---

## 7. ROLLBACK PLAN

### 7.1. Khi Nào Cần Rollback

- ❌ Lỗi nghiêm trọng trong quá trình migration
- ❌ Mất dữ liệu
- ❌ Performance degradation > 50%
- ❌ Foreign key violations

### 7.2. Cách Rollback

```bash
# 1. Restore từ backup
psql -U postgres -d ipd8_db < backup_before_migration_YYYYMMDD_HHMMSS.sql

# 2. Hoặc rollback từng bước
psql -U postgres -d ipd8_db -f migrations/rollback/001_rollback_new_tables.sql
psql -U postgres -d ipd8_db -f migrations/rollback/002_rollback_refactor.sql
```

---

## 8. CHECKLIST TỔNG KẾT

### Pre-Migration ✅
- [ ] Backup database toàn bộ
- [ ] Backup schema only
- [ ] Backup data only
- [ ] Setup staging environment
- [ ] Review migration scripts
- [ ] Thông báo team

### Migration ✅
- [ ] Tạo bảng mới (17 bảng)
- [ ] Tái cấu trúc bảng cũ (3 bảng)
- [ ] Xóa bảng e-commerce (20 bảng)
- [ ] Tạo indexes & constraints
- [ ] Data migration (nếu cần)

### Post-Migration ✅
- [ ] Verify tất cả bảng
- [ ] Verify indexes
- [ ] Verify foreign keys
- [ ] Verify data integrity
- [ ] Test queries cơ bản
- [ ] Update application code

---

## TÓM TẮT

**Phase 1: Database Migration** bao gồm:
1. ✅ Backup database
2. ✅ Tạo 17 bảng mới
3. ✅ Tái cấu trúc 6 bảng cũ
4. ✅ Xóa 20 bảng e-commerce
5. ✅ Verify data integrity

**Kết quả:** 
- Database PostgreSQL `ipd8_db` với 35 bảng hoàn chỉnh
- Database dùng chung cho CMS Backend và Public Backend
- Models sẽ được tạo riêng biệt trong Phase 2A (CMS Backend) và Phase 2B (Public Backend)
- Sẵn sàng cho Phase 2

