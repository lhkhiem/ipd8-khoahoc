-- Migration: Add customer_phone to orders table for phone-based order lookup
-- This allows customers to track orders without account login

BEGIN;

-- Step 1: Add customer_phone column to orders table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'orders' 
        AND column_name = 'customer_phone'
    ) THEN
        ALTER TABLE orders ADD COLUMN customer_phone VARCHAR(20);
    END IF;
END $$;

-- Step 2: Add index for customer_phone for faster lookup
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone 
ON orders(customer_phone);

-- Step 3: Migrate existing phone numbers from shipping_address if available
-- This will extract phone from JSONB shipping_address.phone field
DO $$
DECLARE
    order_record RECORD;
    phone_value TEXT;
BEGIN
    FOR order_record IN SELECT id, shipping_address FROM orders WHERE customer_phone IS NULL
    LOOP
        -- Try to extract phone from shipping_address JSONB
        IF order_record.shipping_address IS NOT NULL THEN
            BEGIN
                phone_value := order_record.shipping_address->>'phone';
                IF phone_value IS NOT NULL AND phone_value != '' THEN
                    UPDATE orders 
                    SET customer_phone = phone_value 
                    WHERE id = order_record.id;
                END IF;
            EXCEPTION
                WHEN OTHERS THEN
                    -- Skip if JSONB doesn't have phone field
                    NULL;
            END;
        END IF;
    END LOOP;
END $$;

COMMIT;

