-- Rename homepage_testimonials to testimonials

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'homepage_testimonials' AND table_schema = 'public'
  ) THEN
    EXECUTE 'ALTER TABLE homepage_testimonials RENAME TO testimonials';
  END IF;
END
$$;

-- Ensure index exists on renamed table
CREATE INDEX IF NOT EXISTS idx_testimonials_featured
  ON testimonials(is_featured, is_active, sort_order);



