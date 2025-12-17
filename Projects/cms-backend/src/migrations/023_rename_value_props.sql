-- Rename homepage_value_props to value_props

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'homepage_value_props' AND table_schema = 'public'
  ) THEN
    EXECUTE 'ALTER TABLE homepage_value_props RENAME TO value_props';
  END IF;
END
$$;

-- Ensure index exists on renamed table
CREATE INDEX IF NOT EXISTS idx_value_props_active
  ON value_props(is_active, sort_order);



