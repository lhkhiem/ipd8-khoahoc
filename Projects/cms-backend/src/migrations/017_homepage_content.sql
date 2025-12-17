-- Homepage Content Migration
-- CLIENT MODEL: Homepage hero sliders, testimonials, and education resources
-- Supports dynamic homepage content management

-- Ensure uuid extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Homepage Hero Sliders
CREATE TABLE IF NOT EXISTS homepage_hero_sliders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Slider content
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(1024) NOT NULL,
  cta_text VARCHAR(100),
  cta_link VARCHAR(255),
  
  -- Ordering and display
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Homepage Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Testimonial content
  customer_name VARCHAR(255) NOT NULL,
  customer_title VARCHAR(255), -- e.g., "Esthetician", "Owner/Operator"
  customer_initials VARCHAR(10), -- For avatar display
  testimonial_text TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  
  -- Display options
  is_featured BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Homepage Education Resources
CREATE TABLE IF NOT EXISTS education_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Resource content
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(1024) NOT NULL,
  link_url VARCHAR(255) NOT NULL,
  link_text VARCHAR(100) DEFAULT 'Learn More',
  
  -- Resource details
  duration VARCHAR(50), -- e.g., "2 hours"
  ceus VARCHAR(50), -- e.g., "2 CEUs"
  level VARCHAR(50), -- e.g., "Beginner", "Advanced"
  resource_type VARCHAR(50) DEFAULT 'course', -- 'course' | 'article' | 'video'
  
  -- Display options
  is_featured BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_hero_sliders_active ON homepage_hero_sliders(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON testimonials(is_featured, is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_education_featured ON education_resources(is_featured, is_active, sort_order);

COMMENT ON TABLE homepage_hero_sliders IS 'Hero slider banners for homepage';
COMMENT ON TABLE testimonials IS 'Customer testimonials for homepage display';
COMMENT ON TABLE education_resources IS 'Educational courses and resources for homepage';



