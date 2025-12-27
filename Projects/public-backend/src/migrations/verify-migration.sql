-- ============================================
-- VERIFICATION: IPD8 Database Migration
-- Kiểm tra tất cả bảng, indexes, foreign keys sau migration
-- ============================================

-- ============================================
-- 1. Kiểm tra số lượng bảng
-- ============================================
SELECT 
    'Total Tables' as check_type,
    COUNT(*) as count
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE';

-- Expected: 35 tables (12 keep + 6 refactor + 17 new)

-- ============================================
-- 2. Kiểm tra bảng mới đã tạo (17 bảng)
-- ============================================
SELECT 
    'New Tables' as check_type,
    COUNT(*) as count,
    array_agg(table_name ORDER BY table_name) as tables
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'instructors', 'courses', 'course_modules', 'course_sessions',
    'enrollments', 'progress', 'materials', 'orders', 'order_items',
    'payments', 'post_tags', 'notifications', 'session_registrations',
    'api_keys', 'webhooks', 'webhook_logs', 'api_request_logs'
);

-- Expected: 17 tables

-- ============================================
-- 3. Kiểm tra bảng đã tái cấu trúc
-- ============================================
-- Check users table new columns
SELECT 
    'Users New Columns' as check_type,
    COUNT(*) as count,
    array_agg(column_name ORDER BY column_name) as columns
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('phone', 'address', 'gender', 'dob', 'avatar_url', 'email_verified', 'phone_verified', 'last_login_at');

-- Check posts table new columns
SELECT 
    'Posts New Columns' as check_type,
    COUNT(*) as count,
    array_agg(column_name ORDER BY column_name) as columns
FROM information_schema.columns
WHERE table_name = 'posts'
AND column_name IN ('type', 'expert_id', 'event_date', 'event_location', 'view_count', 'is_featured', 'seo_title', 'seo_description');

-- Check contact_forms table exists
SELECT 
    'Contact Forms' as check_type,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'contact_forms'
    ) THEN 'EXISTS' ELSE 'MISSING' END as status;

-- ============================================
-- 4. Kiểm tra bảng e-commerce đã xóa
-- ============================================
SELECT 
    'E-commerce Tables Remaining' as check_type,
    COUNT(*) as count,
    array_agg(table_name ORDER BY table_name) as tables
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'products', 'product_categories', 'brands', 'product_images',
    'product_attributes', 'product_variants', 'product_options',
    'cart_items', 'wishlist_items', 'product_reviews', 'stock_movements',
    'stock_settings', 'addresses'
);

-- Expected: 0 tables (all deleted)

-- ============================================
-- 5. Kiểm tra indexes quan trọng
-- ============================================
SELECT 
    tablename,
    COUNT(*) as index_count,
    array_agg(indexname ORDER BY indexname) as indexes
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('courses', 'enrollments', 'orders', 'users', 'instructors')
GROUP BY tablename
ORDER BY tablename;

-- ============================================
-- 6. Kiểm tra foreign keys
-- ============================================
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
AND tc.table_name IN ('courses', 'enrollments', 'orders', 'instructors', 'progress')
ORDER BY tc.table_name, kcu.column_name;

-- ============================================
-- 7. Kiểm tra data integrity
-- ============================================
-- Check for orphaned enrollments
SELECT 
    'Orphaned Enrollments' as check_type,
    COUNT(*) as count
FROM enrollments e
LEFT JOIN users u ON e.user_id = u.id
LEFT JOIN courses c ON e.course_id = c.id
WHERE u.id IS NULL OR c.id IS NULL;

-- Expected: 0 (no orphaned records)

-- Check for orphaned course_modules
SELECT 
    'Orphaned Course Modules' as check_type,
    COUNT(*) as count
FROM course_modules cm
LEFT JOIN courses c ON cm.course_id = c.id
WHERE c.id IS NULL;

-- Expected: 0 (no orphaned records)

-- ============================================
-- 8. Summary
-- ============================================
SELECT 
    'Migration Verification Summary' as summary,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE') as total_tables,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('instructors', 'courses', 'enrollments', 'orders', 'payments')) as ipd8_core_tables,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('products', 'product_categories', 'brands')) as ecommerce_tables_remaining;



















