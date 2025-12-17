-- Inventory Management Migration
-- Stock tracking and management system

-- 1. Stock Movements Table (Lịch sử thay đổi stock)
CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID, -- Will add FK constraint later if product_variants exists
    movement_type VARCHAR(50) NOT NULL, -- 'sale', 'purchase', 'adjustment', 'return', 'transfer', 'damage'
    quantity INTEGER NOT NULL, -- positive for increase, negative for decrease
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    reference_type VARCHAR(50), -- 'order', 'purchase_order', 'adjustment', 'transfer'
    reference_id UUID, -- ID của order, purchase_order, etc.
    notes TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_variant ON stock_movements(variant_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_type ON stock_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created ON stock_movements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stock_movements_reference ON stock_movements(reference_type, reference_id);

-- 2. Stock Settings Table (Cấu hình cảnh báo)
CREATE TABLE IF NOT EXISTS stock_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID, -- Will add FK constraint later if product_variants exists
    low_stock_threshold INTEGER DEFAULT 10, -- Ngưỡng cảnh báo stock thấp
    reorder_point INTEGER DEFAULT 5, -- Điểm đặt hàng lại
    reorder_quantity INTEGER DEFAULT 20, -- Số lượng đặt hàng lại
    track_inventory BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, variant_id)
);

CREATE INDEX IF NOT EXISTS idx_stock_settings_product ON stock_settings(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_settings_variant ON stock_settings(variant_id);

-- Add foreign key constraint for variant_id if product_variants table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_variants') THEN
        -- Add FK constraint if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'stock_movements_variant_id_fkey'
        ) THEN
            ALTER TABLE stock_movements 
            ADD CONSTRAINT stock_movements_variant_id_fkey 
            FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL;
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'stock_settings_variant_id_fkey'
        ) THEN
            ALTER TABLE stock_settings 
            ADD CONSTRAINT stock_settings_variant_id_fkey 
            FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL;
        END IF;
    END IF;
END $$;

-- Add default stock settings for existing products (only if products table exists and has data)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
        INSERT INTO stock_settings (product_id, variant_id, low_stock_threshold, reorder_point, reorder_quantity, track_inventory)
        SELECT id, NULL, 10, 5, 20, true
        FROM products
        WHERE id NOT IN (SELECT COALESCE(product_id, '00000000-0000-0000-0000-000000000000'::uuid) FROM stock_settings WHERE variant_id IS NULL)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Add default stock settings for existing variants (only if product_variants table exists and has data)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_variants') THEN
        INSERT INTO stock_settings (product_id, variant_id, low_stock_threshold, reorder_point, reorder_quantity, track_inventory)
        SELECT product_id, id, 10, 5, 20, true
        FROM product_variants
        WHERE (product_id, id) NOT IN (
            SELECT COALESCE(product_id, '00000000-0000-0000-0000-000000000000'::uuid), 
                   COALESCE(variant_id, '00000000-0000-0000-0000-000000000000'::uuid)
            FROM stock_settings 
            WHERE variant_id IS NOT NULL
        )
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

