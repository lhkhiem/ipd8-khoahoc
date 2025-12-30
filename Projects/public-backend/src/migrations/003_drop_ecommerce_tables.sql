-- ============================================
-- MIGRATION: IPD8 Database Schema - Drop E-commerce Tables
-- Xóa các bảng e-commerce không dùng cho IPD8
-- Thứ tự xóa: Bảng con trước, bảng cha sau
-- ============================================
-- ⚠️  WARNING: This script will DELETE e-commerce tables permanently!
-- ⚠️  Make sure you have a backup before running this!
-- ============================================

BEGIN;

-- ============================================
-- 1. Xóa bảng con (có foreign key) - Thứ tự quan trọng
-- ============================================

-- Review reactions (phụ thuộc product_reviews)
DROP TABLE IF EXISTS review_reactions CASCADE;

-- Product reviews (phụ thuộc products)
DROP TABLE IF EXISTS product_reviews CASCADE;

-- Product variant option values (phụ thuộc product_variants, product_options)
DROP TABLE IF EXISTS product_variant_option_values CASCADE;

-- Product variant attributes (phụ thuộc product_variants)
DROP TABLE IF EXISTS product_variant_attributes CASCADE;

-- Product option values (phụ thuộc product_options)
DROP TABLE IF EXISTS product_option_values CASCADE;

-- Product options (phụ thuộc products)
DROP TABLE IF EXISTS product_options CASCADE;

-- Product variants (phụ thuộc products)
DROP TABLE IF EXISTS product_variants CASCADE;

-- Stock movements (phụ thuộc products, product_variants)
DROP TABLE IF EXISTS stock_movements CASCADE;

-- Stock settings (phụ thuộc products, product_variants)
DROP TABLE IF EXISTS stock_settings CASCADE;

-- Product images (phụ thuộc products, assets)
DROP TABLE IF EXISTS product_images CASCADE;

-- Product attributes (phụ thuộc products)
DROP TABLE IF EXISTS product_attributes CASCADE;

-- Cart items (phụ thuộc products)
DROP TABLE IF EXISTS cart_items CASCADE;

-- Wishlist items (phụ thuộc products)
DROP TABLE IF EXISTS wishlist_items CASCADE;

-- ============================================
-- 2. Xóa order_items (e-commerce)
-- Lưu ý: IPD8 có bảng order_items riêng, cần kiểm tra
-- ============================================
-- Kiểm tra xem có bảng order_items e-commerce không
-- (IPD8 order_items có enrollment_type, e-commerce không có)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'order_items'
        AND NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'order_items' 
            AND column_name = 'enrollment_type'
        )
    ) THEN
        -- This is e-commerce order_items, drop it
        DROP TABLE IF EXISTS order_items CASCADE;
        RAISE NOTICE '✓ Dropped e-commerce order_items table';
    ELSE
        RAISE NOTICE '✓ order_items table is IPD8 version (has enrollment_type) or does not exist';
    END IF;
END $$;

-- ============================================
-- 3. Xóa bảng orders (e-commerce)
-- Lưu ý: IPD8 có bảng orders riêng, cần kiểm tra
-- ============================================
DO $$
BEGIN
    -- Kiểm tra xem có bảng orders e-commerce không (có shipping_address)
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'orders' 
        AND EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'orders' 
            AND column_name = 'shipping_address'
        )
    ) THEN
        -- Đổi tên bảng orders e-commerce trước khi xóa (để tránh conflict)
        ALTER TABLE orders RENAME TO orders_ecommerce_old;
        DROP TABLE IF EXISTS orders_ecommerce_old CASCADE;
        RAISE NOTICE '✓ Dropped e-commerce orders table';
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'orders'
        AND EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'orders' 
            AND column_name = 'order_number'
        )
    ) THEN
        -- This is IPD8 orders table (has order_number)
        RAISE NOTICE '✓ orders table is IPD8 version (has order_number)';
    END IF;
END $$;

-- ============================================
-- 4. Xóa bảng addresses (customer addresses)
-- ============================================
DROP TABLE IF EXISTS addresses CASCADE;

-- ============================================
-- 5. Xóa bảng products và các bảng liên quan
-- ============================================

-- Products (phụ thuộc product_categories, brands, assets)
DROP TABLE IF EXISTS products CASCADE;

-- Product categories (có self-reference)
DROP TABLE IF EXISTS product_categories CASCADE;

-- Brands (phụ thuộc assets)
DROP TABLE IF EXISTS brands CASCADE;

-- ============================================
-- 6. Xóa các bảng product groups nếu có
-- ============================================
DROP TABLE IF EXISTS product_groups CASCADE;
DROP TABLE IF EXISTS product_group_images CASCADE;
DROP TABLE IF EXISTS product_group_attributes CASCADE;

COMMIT;

-- ============================================
-- Verification: Kiểm tra các bảng đã xóa
-- ============================================
DO $$
DECLARE
    remaining_tables TEXT[];
    expected_tables TEXT[] := ARRAY[
        'products', 'product_categories', 'brands', 'product_images',
        'product_attributes', 'product_variants', 'product_options',
        'cart_items', 'wishlist_items', 'product_reviews', 'stock_movements',
        'stock_settings', 'addresses', 'review_reactions',
        'product_variant_option_values', 'product_variant_attributes',
        'product_option_values', 'product_groups'
    ];
BEGIN
    SELECT array_agg(table_name) INTO remaining_tables
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = ANY(expected_tables);
    
    IF remaining_tables IS NULL OR array_length(remaining_tables, 1) = 0 THEN
        RAISE NOTICE '✓ Thành công: Tất cả bảng e-commerce đã được xóa';
    ELSE
        RAISE WARNING '⚠️  Cảnh báo: Các bảng sau vẫn còn tồn tại: %', array_to_string(remaining_tables, ', ');
    END IF;
END $$;























