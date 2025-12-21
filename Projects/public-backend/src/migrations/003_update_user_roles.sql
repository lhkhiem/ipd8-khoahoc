-- ============================================
-- MIGRATION: Update User Roles to IPD8 Standard
-- Cập nhật role constraint theo DATABASE_DESIGN_IPD8_TABLES_REFACTOR.md
-- Role: ('guest', 'student', 'instructor', 'admin')
-- Default: 'guest'
-- ============================================

BEGIN;

-- Step 1: Drop existing CHECK constraint (if exists)
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Find and drop existing role constraint
    FOR r IN 
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'users'::regclass 
        AND contype = 'c'
        AND conname LIKE '%role%'
    LOOP
        EXECUTE 'ALTER TABLE users DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
        RAISE NOTICE '✓ Dropped constraint: %', r.conname;
    END LOOP;
END $$;

-- Step 2: Update existing 'user' role to 'guest' (theo tài liệu, default là 'guest')
-- Lưu ý: Có thể cần phân biệt 'user' → 'guest' (chưa đăng ký khóa học) vs 'student' (đã đăng ký)
-- Tạm thời: 'user' → 'guest' (có thể update sau khi có enrollments)
UPDATE users 
SET role = 'guest' 
WHERE role = 'user';

-- Step 3: Add new CHECK constraint với roles mới
ALTER TABLE users
ADD CONSTRAINT users_role_check 
CHECK (role IN ('guest', 'student', 'instructor', 'admin'));

-- Step 4: Update default value
ALTER TABLE users
ALTER COLUMN role SET DEFAULT 'guest';

-- Step 5: Update any NULL roles to 'guest'
UPDATE users 
SET role = 'guest' 
WHERE role IS NULL;

COMMIT;

-- ============================================
-- Verification
-- ============================================
DO $$
DECLARE
    role_constraint TEXT;
    default_value TEXT;
BEGIN
    -- Check constraint
    SELECT con.conname INTO role_constraint
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    WHERE rel.relname = 'users'
    AND con.conname = 'users_role_check';
    
    IF role_constraint IS NOT NULL THEN
        RAISE NOTICE '✓ Role constraint exists: %', role_constraint;
    ELSE
        RAISE WARNING '⚠️  Role constraint not found';
    END IF;
    
    -- Check default value
    SELECT column_default INTO default_value
    FROM information_schema.columns
    WHERE table_name = 'users'
    AND column_name = 'role';
    
    IF default_value LIKE '%guest%' THEN
        RAISE NOTICE '✓ Role default is: %', default_value;
    ELSE
        RAISE WARNING '⚠️  Role default is: % (expected guest)', default_value;
    END IF;
END $$;

