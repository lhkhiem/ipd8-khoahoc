-- Rename homepage_education_resources to education_resources

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'homepage_education_resources' AND table_schema = 'public'
  ) THEN
    EXECUTE 'ALTER TABLE homepage_education_resources RENAME TO education_resources';
  END IF;
END
$$;


