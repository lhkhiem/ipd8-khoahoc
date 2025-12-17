-- Seed Homepage Content
-- CLIENT MODEL: Insert initial homepage content based on mockup

-- Testimonials
INSERT INTO testimonials (id, customer_name, customer_title, customer_initials, testimonial_text, rating, is_featured, sort_order, is_active) VALUES
  (
    gen_random_uuid(),
    'Laura W.',
    'Esthetician',
    'LW',
    'I have been dealing with Universal for over 30 yrs now and have never been disappointed in a product or their great customer service. Thank you for making my job easier as a Clinic Esthetician.',
    5,
    TRUE,
    0,
    TRUE
  ),
  (
    gen_random_uuid(),
    'Kiara H.',
    'Owner/Operator',
    'KH',
    '🌟 🎉 All your needs in one place like being at a party store! Amazing selection and fast shipping. Highly recommend!',
    5,
    TRUE,
    1,
    TRUE
  ),
  (
    gen_random_uuid(),
    'Sarah M.',
    'Massage Therapist',
    'SM',
    'The product quality is outstanding and the customer support is top-notch. Universal Companies is my go-to for all professional supplies.',
    5,
    TRUE,
    2,
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

-- Education Resources
INSERT INTO education_resources (id, title, description, image_url, link_url, link_text, duration, ceus, level, resource_type, is_featured, sort_order, is_active) VALUES
  (
    gen_random_uuid(),
    'Lash & Brow Tinting Training + Certificate',
    'Earn 2 CEUs and learn how to integrate service offerings with business building strategies.',
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&h=400',
    '/learning',
    'Learn More',
    '2 hours',
    '2 CEUs',
    'Beginner',
    'course',
    TRUE,
    0,
    TRUE
  ),
  (
    gen_random_uuid(),
    'Advanced Skincare Techniques',
    'Master advanced facial techniques and product knowledge for professional estheticians.',
    'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&h=400',
    '/learning',
    'Learn More',
    '3 hours',
    '3 CEUs',
    'Advanced',
    'course',
    TRUE,
    1,
    TRUE
  ),
  (
    gen_random_uuid(),
    'Massage Therapy Fundamentals',
    'Learn essential massage techniques and best practices for client care.',
    'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600&h=400',
    '/learning',
    'Learn More',
    '4 hours',
    '4 CEUs',
    'Intermediate',
    'course',
    TRUE,
    2,
    TRUE
  )
ON CONFLICT (id) DO NOTHING;

-- Value Props
INSERT INTO value_props (id, title, subtitle, icon_key, icon_color, icon_background, sort_order, is_active) VALUES
  (
    gen_random_uuid(),
    'Free Shipping',
    'On orders $749+',
    'shipping',
    '#2563eb',
    '#bfdbfe',
    0,
    TRUE
  ),
  (
    gen_random_uuid(),
    'Reduced Shipping',
    '$4.99 on orders $199+',
    'dollar',
    '#10b981',
    '#bbf7d0',
    1,
    TRUE
  ),
  (
    gen_random_uuid(),
    'Quality Guaranteed',
    'Tested & approved',
    'shield-check',
    '#a855f7',
    '#e9d5ff',
    2,
    TRUE
  ),
  (
    gen_random_uuid(),
    '40+ Years',
    'Industry leader',
    'award',
    '#f59e0b',
    '#fde68a',
    3,
    TRUE
  ),
  (
    gen_random_uuid(),
    'Good Karma Rewards',
    'Earn points on every purchase',
    'heart',
    '#f43f5e',
    '#fecdd3',
    4,
    TRUE
  ),
  (
    gen_random_uuid(),
    'Free Education',
    'CEU courses available',
    'book-open',
    '#3b82f6',
    '#bfdbfe',
    5,
    TRUE
  )
ON CONFLICT (id) DO NOTHING;



