-- Seed sample sliders for testing
-- This file creates sample slider data with title, description, button text, and links
-- Uses existing assets from the database

-- Delete existing seed data if any (optional, comment out if you want to keep existing)
-- DELETE FROM sliders WHERE title IN ('Chào mừng đến với Digital PressUp', 'Máy photocopy công nghiệp', 'Dịch vụ in ấn chuyên nghiệp');

-- Slider 1: Welcome Banner
-- Use first available asset
INSERT INTO sliders (id, title, description, button_text, button_link, image_id, image_url, order_index, is_active, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Chào mừng đến với Digital PressUp',
  'Giải pháp in ấn và photocopy chuyên nghiệp hàng đầu',
  'Khám phá ngay',
  '/products',
  id,
  url,
  0,
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM assets
WHERE type = 'image'
ORDER BY created_at DESC
LIMIT 1
ON CONFLICT DO NOTHING;

-- Slider 2: Product Promotion  
-- Use second available asset
INSERT INTO sliders (id, title, description, button_text, button_link, image_id, image_url, order_index, is_active, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Máy photocopy công nghiệp',
  'Công nghệ hiện đại, chất lượng cao, giá cả hợp lý',
  'Xem sản phẩm',
  '/products?category=photocopy',
  id,
  url,
  1,
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM assets
WHERE type = 'image'
ORDER BY created_at DESC
OFFSET 1
LIMIT 1
ON CONFLICT DO NOTHING;

-- Slider 3: Service Banner
-- Use third available asset
INSERT INTO sliders (id, title, description, button_text, button_link, image_id, image_url, order_index, is_active, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Dịch vụ in ấn chuyên nghiệp',
  'In offset, in kỹ thuật số, in ấn quảng cáo với chất lượng cao',
  'Liên hệ',
  '/contact',
  id,
  url,
  2,
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM assets
WHERE type = 'image'
ORDER BY created_at DESC
OFFSET 2
LIMIT 1
ON CONFLICT DO NOTHING;

-- If no assets exist or sliders were not created, create sliders without images
-- Slider 1 (fallback - no image)
DO $$
DECLARE
  slider_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO slider_count FROM sliders WHERE order_index = 0;
  IF slider_count = 0 THEN
    INSERT INTO sliders (id, title, description, button_text, button_link, order_index, is_active, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      'Chào mừng đến với Digital PressUp',
      'Giải pháp in ấn và photocopy chuyên nghiệp hàng đầu',
      'Khám phá ngay',
      '/products',
      0,
      true,
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    );
  END IF;
END $$;

-- Slider 2 (fallback - no image)
DO $$
DECLARE
  slider_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO slider_count FROM sliders WHERE order_index = 1;
  IF slider_count = 0 THEN
    INSERT INTO sliders (id, title, description, button_text, button_link, order_index, is_active, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      'Máy photocopy công nghiệp',
      'Công nghệ hiện đại, chất lượng cao, giá cả hợp lý',
      'Xem sản phẩm',
      '/products?category=photocopy',
      1,
      true,
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    );
  END IF;
END $$;

-- Slider 3 (fallback - no image)
DO $$
DECLARE
  slider_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO slider_count FROM sliders WHERE order_index = 2;
  IF slider_count = 0 THEN
    INSERT INTO sliders (id, title, description, button_text, button_link, order_index, is_active, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      'Dịch vụ in ấn chuyên nghiệp',
      'In offset, in kỹ thuật số, in ấn quảng cáo với chất lượng cao',
      'Liên hệ',
      '/contact',
      2,
      true,
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    );
  END IF;
END $$;

