# DATABASE DESIGN FINAL - IPD8 LEARNING PLATFORM

**Ngày tạo:** 2025-01-XX  
**Database:** PostgreSQL  
**Tổng số bảng:** 37 bảng

---

## 📋 MỤC LỤC

1. [User & Authentication](#1-user--authentication)
2. [Course & Learning](#2-course--learning)
3. [Payment & Orders](#3-payment--orders)
4. [Content & Posts](#4-content--posts)
5. [System & Settings](#5-system--settings)
6. [Media & Assets](#6-media--assets)
7. [Menu & Navigation](#7-menu--navigation)
8. [Analytics & Tracking](#8-analytics--tracking)
9. [FAQ](#9-faq)
10. [CMS API & Webhooks](#10-cms-api--webhooks)

---

## 1. USER & AUTHENTICATION

### 1.1. users
- `id` UUID PRIMARY KEY
- `email` VARCHAR(255) UNIQUE NOT NULL
- `password_hash` VARCHAR(255) NOT NULL
- `name` VARCHAR(255) NOT NULL
- `role` VARCHAR(50) NOT NULL DEFAULT 'guest' CHECK (role IN ('guest', 'student', 'instructor', 'admin'))
- `phone` VARCHAR(20)
- `address` TEXT
- `gender` VARCHAR(20) CHECK (gender IN ('male', 'female', 'other'))
- `dob` DATE
- `avatar_url` VARCHAR(500)
- `email_verified` BOOLEAN DEFAULT false
- `phone_verified` BOOLEAN DEFAULT false
- `is_active` BOOLEAN DEFAULT true
- `last_login_at` TIMESTAMP
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

### 1.2. instructors
- `id` UUID PRIMARY KEY
- `user_id` UUID UNIQUE NOT NULL → **FK: users(id)**
- `title` VARCHAR(100) NOT NULL
- `credentials` TEXT NOT NULL
- `bio` TEXT
- `specialties` TEXT
- `achievements` TEXT
- `rating` DECIMAL(3,2) DEFAULT 0.00
- `total_courses` INTEGER DEFAULT 0
- `is_featured` BOOLEAN DEFAULT false
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

### 1.3. api_keys
- `id` UUID PRIMARY KEY
- `key_name` VARCHAR(100) NOT NULL
- `api_key` VARCHAR(64) UNIQUE NOT NULL
- `api_secret` VARCHAR(64) NOT NULL
- `permissions` TEXT
- `rate_limit` INTEGER DEFAULT 1000
- `ip_whitelist` TEXT
- `expires_at` TIMESTAMP
- `last_used_at` TIMESTAMP
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `is_active` BOOLEAN DEFAULT true

---

## 2. COURSE & LEARNING

### 2.1. courses
- `id` UUID PRIMARY KEY
- `slug` VARCHAR(255) UNIQUE NOT NULL
- `title` VARCHAR(255) NOT NULL
- `target_audience` VARCHAR(100) NOT NULL
- `description` TEXT NOT NULL
- `benefits_mom` TEXT
- `benefits_baby` TEXT
- `price` DECIMAL(12,2) NOT NULL DEFAULT 0
- `price_type` VARCHAR(20) NOT NULL DEFAULT 'one-off' CHECK (price_type IN ('one-off', 'subscription'))
- `duration_minutes` INTEGER NOT NULL
- `mode` VARCHAR(20) NOT NULL DEFAULT 'group' CHECK (mode IN ('group', 'one-on-one'))
- `status` VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published'))
- `featured` BOOLEAN DEFAULT false
- `thumbnail_url` VARCHAR(500)
- `video_url` VARCHAR(500)
- `instructor_id` UUID → **FK: instructors(id)**
- `seo_title` VARCHAR(255)
- `seo_description` TEXT
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

### 2.2. course_modules
- `id` UUID PRIMARY KEY
- `course_id` UUID NOT NULL → **FK: courses(id)**
- `order` INTEGER NOT NULL
- `title` VARCHAR(255) NOT NULL
- `description` TEXT
- `duration_minutes` INTEGER
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

### 2.3. course_sessions
- `id` UUID PRIMARY KEY
- `course_id` UUID NOT NULL → **FK: courses(id)**
- `instructor_id` UUID → **FK: instructors(id)**
- `order` INTEGER
- `title` VARCHAR(255) NOT NULL
- `description` TEXT
- `start_time` TIMESTAMP NOT NULL
- `end_time` TIMESTAMP NOT NULL
- `location` VARCHAR(255)
- `capacity` INTEGER NOT NULL DEFAULT 10
- `enrolled_count` INTEGER DEFAULT 0
- `status` VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'full', 'cancelled', 'done'))
- `meeting_link` VARCHAR(500)
- `meeting_type` VARCHAR(20) CHECK (meeting_type IN ('google-meet', 'zoom', 'offline'))
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

### 2.4. enrollments
- `id` UUID PRIMARY KEY
- `user_id` UUID NOT NULL → **FK: users(id)**
- `course_id` UUID NOT NULL → **FK: courses(id)**
- `type` VARCHAR(20) NOT NULL CHECK (type IN ('trial', 'standard', 'combo', '3m', '6m', '12m', '24m'))
- `status` VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'cancelled', 'completed'))
- `start_date` DATE
- `end_date` DATE
- `progress_percent` DECIMAL(5,2) DEFAULT 0.00
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- **UNIQUE(user_id, course_id)**

### 2.5. progress
- `id` UUID PRIMARY KEY
- `enrollment_id` UUID NOT NULL → **FK: enrollments(id)**
- `module_id` UUID → **FK: course_modules(id)**
- `session_id` UUID → **FK: course_sessions(id)**
- `progress_percent` DECIMAL(5,2) NOT NULL DEFAULT 0.00
- `feedback` TEXT
- `completed_at` TIMESTAMP
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

### 2.6. materials
- `id` UUID PRIMARY KEY
- `course_id` UUID NOT NULL → **FK: courses(id)**
- `title` VARCHAR(255) NOT NULL
- `file_key` VARCHAR(500) NOT NULL
- `file_url` VARCHAR(500) NOT NULL
- `mime_type` VARCHAR(100) NOT NULL
- `size` BIGINT NOT NULL
- `visibility` VARCHAR(20) NOT NULL DEFAULT 'enrolled' CHECK (visibility IN ('public', 'private', 'enrolled'))
- `provider` VARCHAR(50) NOT NULL
- `download_count` INTEGER DEFAULT 0
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

### 2.7. session_registrations
- `id` UUID PRIMARY KEY
- `user_id` UUID NOT NULL → **FK: users(id)**
- `session_id` UUID NOT NULL → **FK: course_sessions(id)**
- `enrollment_id` UUID → **FK: enrollments(id)**
- `status` VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'attended'))
- `notes` TEXT
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- **UNIQUE(user_id, session_id)**

---

## 3. PAYMENT & ORDERS

### 3.1. orders
- `id` UUID PRIMARY KEY
- `user_id` UUID NOT NULL → **FK: users(id)**
- `order_number` VARCHAR(50) UNIQUE NOT NULL
- `total_amount` DECIMAL(12,2) NOT NULL DEFAULT 0
- `status` VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled', 'refunded'))
- `payment_method` VARCHAR(50)
- `notes` TEXT
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

### 3.2. order_items
- `id` UUID PRIMARY KEY
- `order_id` UUID NOT NULL → **FK: orders(id)**
- `course_id` UUID NOT NULL → **FK: courses(id)**
- `enrollment_type` VARCHAR(20) NOT NULL CHECK (enrollment_type IN ('trial', 'standard', 'combo', '3m', '6m', '12m', '24m'))
- `price` DECIMAL(12,2) NOT NULL
- `quantity` INTEGER NOT NULL DEFAULT 1
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

### 3.3. payments
- `id` UUID PRIMARY KEY
- `order_id` UUID NOT NULL → **FK: orders(id)**
- `amount` DECIMAL(12,2) NOT NULL
- `payment_method` VARCHAR(50) NOT NULL CHECK (payment_method IN ('zalopay', 'vnpay', 'momo', 'bank_transfer'))
- `status` VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled'))
- `transaction_id` VARCHAR(255)
- `gateway_response` TEXT
- `paid_at` TIMESTAMP
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

---

## 4. CONTENT & POSTS

### 4.1. posts
- `id` UUID PRIMARY KEY
- `type` VARCHAR(50) DEFAULT 'article' CHECK (type IN ('article', 'event'))
- `category` VARCHAR(100)
- `author_id` UUID → **FK: users(id)**
- `expert_id` UUID → **FK: instructors(id)**
- `title` VARCHAR(255) NOT NULL
- `slug` VARCHAR(255) UNIQUE NOT NULL
- `content` TEXT NOT NULL
- `excerpt` TEXT
- `thumbnail_url` VARCHAR(500)
- `cover_asset_id` UUID → **FK: assets(id)**
- `event_date` DATE
- `event_location` VARCHAR(255)
- `view_count` INTEGER DEFAULT 0
- `is_featured` BOOLEAN DEFAULT false
- `seo_title` VARCHAR(255)
- `seo_description` TEXT
- `seo` JSONB
- `header_code` TEXT
- `published_at` TIMESTAMP
- `read_time` VARCHAR(50)
- `status` VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived'))
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

### 4.2. topics
- `id` UUID PRIMARY KEY
- `name` VARCHAR(255) NOT NULL
- `slug` VARCHAR(255) UNIQUE NOT NULL
- `description` TEXT
- `color` VARCHAR(7)
- `icon` VARCHAR(50)
- `is_active` BOOLEAN DEFAULT true
- `sort_order` INTEGER DEFAULT 0
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

### 4.3. tags
- `id` UUID PRIMARY KEY
- `name` VARCHAR(255) NOT NULL
- `slug` VARCHAR(255) UNIQUE NOT NULL
- `description` TEXT
- `color` VARCHAR(7)
- `is_active` BOOLEAN DEFAULT true
- `post_count` INTEGER DEFAULT 0
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

### 4.4. post_topics
- `post_id` UUID NOT NULL → **FK: posts(id)**
- `topic_id` UUID NOT NULL → **FK: topics(id)**
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- **PRIMARY KEY (post_id, topic_id)**

### 4.5. post_tags (IPD8 - tag_name)
- `id` UUID PRIMARY KEY
- `post_id` UUID NOT NULL → **FK: posts(id)**
- `tag_name` VARCHAR(100) NOT NULL
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- **UNIQUE(post_id, tag_name)**

---

## 5. SYSTEM & SETTINGS

### 5.1. settings
- `id` UUID PRIMARY KEY
- `namespace` VARCHAR(100) UNIQUE NOT NULL
- `value` JSONB NOT NULL DEFAULT '{}'
- `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

### 5.2. notifications
- `id` UUID PRIMARY KEY
- `user_id` UUID NOT NULL → **FK: users(id)**
- `type` VARCHAR(50) NOT NULL
- `title` VARCHAR(255) NOT NULL
- `message` TEXT NOT NULL
- `link` VARCHAR(500)
- `read` BOOLEAN DEFAULT false
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

### 5.3. contact_forms
- `id` UUID PRIMARY KEY
- `name` VARCHAR(255) NOT NULL
- `email` VARCHAR(255) NOT NULL
- `phone` VARCHAR(20)
- `subject` VARCHAR(255) NOT NULL
- `message` TEXT NOT NULL
- `course_interest` VARCHAR(255)
- `study_mode` VARCHAR(50)
- `status` VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived', 'pending', 'contacted', 'resolved', 'closed'))
- `resolved_by` UUID → **FK: users(id)**
- `resolved_at` TIMESTAMP
- `replied_at` TIMESTAMP
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

### 5.4. newsletter_subscriptions
- `id` UUID PRIMARY KEY
- `email` VARCHAR(255) UNIQUE NOT NULL
- `name` VARCHAR(255)
- `is_active` BOOLEAN DEFAULT true
- `subscribed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `unsubscribed_at` TIMESTAMP

### 5.5. activity_logs
- `id` UUID PRIMARY KEY
- `user_id` UUID → **FK: users(id)**
- `action` VARCHAR(100) NOT NULL
- `entity_type` VARCHAR(50) NOT NULL
- `entity_id` UUID
- `entity_name` VARCHAR(255)
- `description` TEXT
- `metadata` JSONB
- `ip_address` VARCHAR(45)
- `user_agent` TEXT
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

---

## 6. MEDIA & ASSETS

### 6.1. assets
- `id` UUID PRIMARY KEY
- `type` VARCHAR(50) NOT NULL
- `provider` VARCHAR(50) DEFAULT 's3'
- `url` VARCHAR(1024) NOT NULL
- `cdn_url` VARCHAR(1024)
- `width` INTEGER
- `height` INTEGER
- `format` VARCHAR(50)
- `sizes` JSONB
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

### 6.2. asset_folders
- `id` UUID PRIMARY KEY
- `name` VARCHAR(255) NOT NULL
- `parent_id` UUID → **FK: asset_folders(id)**
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

### 6.3. media_folders
- `id` SERIAL PRIMARY KEY
- `name` VARCHAR(255) NOT NULL
- `parent_id` INTEGER → **FK: media_folders(id)**
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

---

## 7. MENU & NAVIGATION

### 7.1. menu_locations
- `id` UUID PRIMARY KEY
- `name` VARCHAR(100) NOT NULL
- `slug` VARCHAR(100) UNIQUE NOT NULL
- `description` TEXT
- `is_active` BOOLEAN DEFAULT true
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

### 7.2. menu_items
- `id` UUID PRIMARY KEY
- `menu_location_id` UUID NOT NULL → **FK: menu_locations(id)**
- `parent_id` UUID → **FK: menu_items(id)**
- `title` VARCHAR(255) NOT NULL
- `url` VARCHAR(500)
- `icon` VARCHAR(100)
- `type` VARCHAR(50) DEFAULT 'custom'
- `entity_id` UUID
- `target` VARCHAR(20) DEFAULT '_self'
- `rel` VARCHAR(100)
- `css_classes` TEXT
- `sort_order` INTEGER DEFAULT 0
- `is_active` BOOLEAN DEFAULT true
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

### 7.3. page_metadata
- `id` UUID PRIMARY KEY
- `page_path` VARCHAR(500) UNIQUE NOT NULL
- `title` VARCHAR(255)
- `description` TEXT
- `keywords` TEXT
- `og_image` VARCHAR(500)
- `og_title` VARCHAR(255)
- `og_description` TEXT
- `canonical_url` VARCHAR(500)
- `robots` VARCHAR(100)
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

---

## 8. ANALYTICS & TRACKING

### 8.1. analytics_events
- `id` UUID PRIMARY KEY
- `event_type` VARCHAR(50) NOT NULL DEFAULT 'pageview'
- `page_url` TEXT NOT NULL
- `page_title` VARCHAR(500)
- `page_path` VARCHAR(500)
- `referrer` TEXT
- `visitor_id` VARCHAR(100) NOT NULL
- `session_id` VARCHAR(100) NOT NULL
- `user_agent` TEXT
- `browser` VARCHAR(100)
- `browser_version` VARCHAR(50)
- `os` VARCHAR(100)
- `os_version` VARCHAR(50)
- `device_type` VARCHAR(20)
- `ip_address` VARCHAR(45)
- `country_code` VARCHAR(2)
- `country_name` VARCHAR(100)
- `city` VARCHAR(100)
- `screen_width` INTEGER
- `screen_height` INTEGER
- `viewport_width` INTEGER
- `viewport_height` INTEGER
- `utm_source` VARCHAR(100)
- `utm_medium` VARCHAR(100)
- `utm_campaign` VARCHAR(200)
- `utm_term` VARCHAR(200)
- `utm_content` VARCHAR(200)
- `traffic_source` VARCHAR(50)
- `time_on_page` INTEGER
- `is_bounce` BOOLEAN DEFAULT false
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

### 8.2. analytics_daily_summary
- `id` UUID PRIMARY KEY
- `date` DATE UNIQUE NOT NULL
- `total_pageviews` INTEGER DEFAULT 0
- `unique_visitors` INTEGER DEFAULT 0
- `total_sessions` INTEGER DEFAULT 0
- `avg_session_duration` INTEGER DEFAULT 0
- `avg_pages_per_session` DECIMAL(10,2) DEFAULT 0
- `bounce_rate` DECIMAL(5,2) DEFAULT 0
- `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

### 8.3. tracking_scripts
- `id` UUID PRIMARY KEY
- `name` VARCHAR(255) NOT NULL
- `location` VARCHAR(50) NOT NULL
- `script_code` TEXT NOT NULL
- `is_active` BOOLEAN DEFAULT true
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

---

## 9. FAQ

### 9.1. faq_categories
- `id` UUID PRIMARY KEY
- `name` VARCHAR(255) NOT NULL
- `slug` VARCHAR(255) UNIQUE NOT NULL
- `sort_order` INTEGER DEFAULT 0
- `is_active` BOOLEAN DEFAULT true
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

### 9.2. faq_questions
- `id` UUID PRIMARY KEY
- `category_id` UUID NOT NULL → **FK: faq_categories(id)**
- `question` TEXT NOT NULL
- `answer` TEXT NOT NULL
- `sort_order` INTEGER DEFAULT 0
- `is_active` BOOLEAN DEFAULT true
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

---

## 10. CMS API & WEBHOOKS

### 10.1. webhooks
- `id` UUID PRIMARY KEY
- `url` VARCHAR(500) NOT NULL
- `secret` VARCHAR(64) NOT NULL
- `events` TEXT
- `is_active` BOOLEAN DEFAULT true
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

### 10.2. webhook_logs
- `id` BIGSERIAL PRIMARY KEY
- `webhook_id` UUID → **FK: webhooks(id)**
- `event` VARCHAR(100) NOT NULL
- `status` VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'success', 'failed'))
- `status_code` INTEGER
- `error_message` TEXT
- `sent_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `response_time_ms` INTEGER

### 10.3. api_request_logs
- `id` BIGSERIAL PRIMARY KEY
- `api_key_id` UUID → **FK: api_keys(id)**
- `endpoint` VARCHAR(255) NOT NULL
- `method` VARCHAR(10) NOT NULL
- `status_code` INTEGER
- `ip_address` VARCHAR(45)
- `user_agent` TEXT
- `request_body` TEXT
- `response_time_ms` INTEGER
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

---

## TÓM TẮT RELATIONSHIPS

### Foreign Keys

**users →**
- `instructors.user_id`
- `enrollments.user_id`
- `orders.user_id`
- `notifications.user_id`
- `posts.author_id`
- `contact_forms.resolved_by`
- `activity_logs.user_id`
- `session_registrations.user_id`

**instructors →**
- `courses.instructor_id`
- `course_sessions.instructor_id`
- `posts.expert_id`

**courses →**
- `course_modules.course_id`
- `course_sessions.course_id`
- `enrollments.course_id`
- `materials.course_id`
- `order_items.course_id`

**enrollments →**
- `progress.enrollment_id`
- `session_registrations.enrollment_id`

**orders →**
- `order_items.order_id`
- `payments.order_id`

**posts →**
- `post_topics.post_id`
- `post_tags.post_id`

**topics →**
- `post_topics.topic_id`

**assets →**
- `posts.cover_asset_id`

**faq_categories →**
- `faq_questions.category_id`

**menu_locations →**
- `menu_items.menu_location_id`

**menu_items →**
- `menu_items.parent_id`

**asset_folders →**
- `asset_folders.parent_id`

**media_folders →**
- `media_folders.parent_id`

**api_keys →**
- `api_request_logs.api_key_id`

**webhooks →**
- `webhook_logs.webhook_id`

**course_modules →**
- `progress.module_id`

**course_sessions →**
- `progress.session_id`
- `session_registrations.session_id`

---

**Tổng số bảng:** 37 bảng  
**Tổng số relationships:** 25 foreign key relationships

