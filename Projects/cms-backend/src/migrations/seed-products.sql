-- Seed 10 test products with various categories and brands
-- Run this to test pagination and filtering

-- Product 1: Dell Laptop
INSERT INTO products (id, name, slug, description, brand_id, price, stock, status, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Dell Latitude 5420',
  'dell-latitude-5420',
  'Business laptop with Intel Core i5, 16GB RAM',
  'ec963032-feae-4032-83fc-d75ad579c783', -- Computer brand
  1299.99,
  15,
  'published',
  CURRENT_TIMESTAMP - INTERVAL '9 days',
  CURRENT_TIMESTAMP - INTERVAL '9 days'
) RETURNING id AS product1_id \gset

INSERT INTO product_product_categories (product_id, category_id)
VALUES 
  (:'product1_id', '818fe063-8980-4d50-9eb4-c31edf0df681'), -- Laptop
  (:'product1_id', 'ff7d6110-e7ab-44f5-b864-96382c4d9401'); -- PC

-- Product 2: HP Printer
INSERT INTO products (id, name, slug, description, brand_id, price, stock, status, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'HP LaserJet Pro M404n',
  'hp-laserjet-pro-m404n',
  'Fast monochrome laser printer for office',
  'd931ff84-9f62-4130-835a-e5e4ee28f4cb', -- Tools brand
  349.99,
  25,
  'published',
  CURRENT_TIMESTAMP - INTERVAL '8 days',
  CURRENT_TIMESTAMP - INTERVAL '8 days'
) RETURNING id AS product2_id \gset

INSERT INTO product_product_categories (product_id, category_id)
VALUES (:'product2_id', '2920952b-1625-46ed-93c7-2cd8510bb397'); -- Printer

-- Product 3: Lenovo ThinkPad
INSERT INTO products (id, name, slug, description, brand_id, price, stock, status, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Lenovo ThinkPad X1 Carbon',
  'lenovo-thinkpad-x1-carbon',
  'Ultra-light business laptop, 14 inch display',
  'ec963032-feae-4032-83fc-d75ad579c783',
  1899.99,
  8,
  'published',
  CURRENT_TIMESTAMP - INTERVAL '7 days',
  CURRENT_TIMESTAMP - INTERVAL '7 days'
) RETURNING id AS product3_id \gset

INSERT INTO product_product_categories (product_id, category_id)
VALUES 
  (:'product3_id', '818fe063-8980-4d50-9eb4-c31edf0df681'), -- Laptop
  (:'product3_id', 'ff7d6110-e7ab-44f5-b864-96382c4d9401'); -- PC

-- Product 4: Gaming Desktop
INSERT INTO products (id, name, slug, description, brand_id, price, stock, status, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Custom Gaming PC RTX 4070',
  'custom-gaming-pc-rtx-4070',
  'High-performance gaming desktop with RTX 4070',
  'ec963032-feae-4032-83fc-d75ad579c783',
  2499.99,
  5,
  'published',
  CURRENT_TIMESTAMP - INTERVAL '6 days',
  CURRENT_TIMESTAMP - INTERVAL '6 days'
) RETURNING id AS product4_id \gset

INSERT INTO product_product_categories (product_id, category_id)
VALUES (:'product4_id', 'ff7d6110-e7ab-44f5-b864-96382c4d9401'); -- PC

-- Product 5: Canon Printer
INSERT INTO products (id, name, slug, description, brand_id, price, stock, status, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Canon PIXMA TS8320',
  'canon-pixma-ts8320',
  'All-in-one wireless printer with photo printing',
  'd931ff84-9f62-4130-835a-e5e4ee28f4cb',
  199.99,
  30,
  'published',
  CURRENT_TIMESTAMP - INTERVAL '5 days',
  CURRENT_TIMESTAMP - INTERVAL '5 days'
) RETURNING id AS product5_id \gset

INSERT INTO product_product_categories (product_id, category_id)
VALUES (:'product5_id', '2920952b-1625-46ed-93c7-2cd8510bb397'); -- Printer

-- Product 6: MacBook Pro (Draft)
INSERT INTO products (id, name, slug, description, brand_id, price, stock, status, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Apple MacBook Pro 14-inch M3',
  'apple-macbook-pro-14-m3',
  'Professional laptop with M3 chip, 16GB RAM',
  'ec963032-feae-4032-83fc-d75ad579c783',
  2199.99,
  0,
  'draft',
  CURRENT_TIMESTAMP - INTERVAL '4 days',
  CURRENT_TIMESTAMP - INTERVAL '4 days'
) RETURNING id AS product6_id \gset

INSERT INTO product_product_categories (product_id, category_id)
VALUES 
  (:'product6_id', '818fe063-8980-4d50-9eb4-c31edf0df681'), -- Laptop
  (:'product6_id', 'ff7d6110-e7ab-44f5-b864-96382c4d9401'); -- PC

-- Product 7: Office Desktop
INSERT INTO products (id, name, slug, description, brand_id, price, stock, status, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'HP ProDesk 400 G7 SFF',
  'hp-prodesk-400-g7-sff',
  'Small form factor desktop for office work',
  'ec963032-feae-4032-83fc-d75ad579c783',
  799.99,
  20,
  'published',
  CURRENT_TIMESTAMP - INTERVAL '3 days',
  CURRENT_TIMESTAMP - INTERVAL '3 days'
) RETURNING id AS product7_id \gset

INSERT INTO product_product_categories (product_id, category_id)
VALUES (:'product7_id', 'ff7d6110-e7ab-44f5-b864-96382c4d9401'); -- PC

-- Product 8: Epson Printer
INSERT INTO products (id, name, slug, description, brand_id, price, stock, status, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Epson EcoTank ET-4760',
  'epson-ecotank-et-4760',
  'Cartridge-free printing with super-sized ink tanks',
  'd931ff84-9f62-4130-835a-e5e4ee28f4cb',
  499.99,
  12,
  'published',
  CURRENT_TIMESTAMP - INTERVAL '2 days',
  CURRENT_TIMESTAMP - INTERVAL '2 days'
) RETURNING id AS product8_id \gset

INSERT INTO product_product_categories (product_id, category_id)
VALUES (:'product8_id', '2920952b-1625-46ed-93c7-2cd8510bb397'); -- Printer

-- Product 9: ASUS ROG Laptop
INSERT INTO products (id, name, slug, description, brand_id, price, stock, status, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'ASUS ROG Zephyrus G14',
  'asus-rog-zephyrus-g14',
  'Compact gaming laptop with AMD Ryzen 9 and RTX 4060',
  'ec963032-feae-4032-83fc-d75ad579c783',
  1699.99,
  10,
  'published',
  CURRENT_TIMESTAMP - INTERVAL '1 day',
  CURRENT_TIMESTAMP - INTERVAL '1 day'
) RETURNING id AS product9_id \gset

INSERT INTO product_product_categories (product_id, category_id)
VALUES 
  (:'product9_id', '818fe063-8980-4d50-9eb4-c31edf0df681'), -- Laptop
  (:'product9_id', 'ff7d6110-e7ab-44f5-b864-96382c4d9401'); -- PC

-- Product 10: Brother Printer
INSERT INTO products (id, name, slug, description, brand_id, price, stock, status, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Brother HL-L2350DW',
  'brother-hl-l2350dw',
  'Compact monochrome laser printer with wireless',
  'd931ff84-9f62-4130-835a-e5e4ee28f4cb',
  129.99,
  40,
  'published',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
) RETURNING id AS product10_id \gset

INSERT INTO product_product_categories (product_id, category_id)
VALUES (:'product10_id', '2920952b-1625-46ed-93c7-2cd8510bb397'); -- Printer

-- Summary
SELECT 'Successfully seeded 10 products!' as message;

