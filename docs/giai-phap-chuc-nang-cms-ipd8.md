# GIẢI PHÁP CHỨC NĂNG CMS QUẢN LÝ - HỆ THỐNG IPD8 LEARNING PLATFORM

## 📋 MỤC LỤC

1. [Tổng Quan Dự Án](#1-tổng-quan-dự-án)
2. [Phân Tích Hiện Trạng](#2-phân-tích-hiện-trạng)
3. [Kiến Trúc Tích Hợp CMS](#3-kiến-trúc-tích-hợp-cms)
4. [Chức Năng CMS Quản Lý](#4-chức-năng-cms-quản-lý)
5. [Database Schema Tích Hợp](#5-database-schema-tích-hợp)
6. [API Design](#6-api-design)
7. [Frontend CMS Dashboard](#7-frontend-cms-dashboard)
8. [Backend CMS Services](#8-backend-cms-services)
9. [Quy Trình Triển Khai](#9-quy-trình-triển-khai)
10. [Bảo Mật & Phân Quyền](#10-bảo-mật--phân-quyền)
11. [Monitoring & Analytics](#11-monitoring--analytics)
12. [Migration Plan](#12-migration-plan)

---

## 1. TỔNG QUAN DỰ ÁN

### 1.1. Mô Tả Dự Án IPD8

**IPD8 Learning Platform** là hệ thống học trực tuyến toàn diện với các tính năng:

- ✅ **Frontend:** Next.js 16.0.7 (App Router) với TypeScript
- ✅ **UI Framework:** TailwindCSS + shadcn/ui
- ✅ **Tính năng hiện tại:**
  - Trang chủ với hero section, courses, experts
  - Danh sách khóa học với filter
  - Chi tiết khóa học với timeline
  - Hệ thống trial booking
  - Dashboard người dùng
  - Authentication context

### 1.2. Yêu Cầu Tích Hợp CMS

Dựa trên 2 tài liệu tham khảo:
- **CMS Architecture:** CMS với API-based architecture
- **Online Learning Solution:** Hệ thống khóa học online với video streaming, user tiers, backup

**Mục tiêu:** Tích hợp CMS quản lý vào IPD8 để:
1. Quản lý nội dung khóa học tập trung
2. Tích hợp với hệ thống video streaming
3. Quản lý user tiers (Gold, Silver, Bronze)
4. Analytics & reporting
5. Backup tự động

---

## 2. PHÂN TÍCH HIỆN TRẠNG

### 2.1. Cấu Trúc Dự Án Hiện Tại

```
IPD8/
├── Projects/
│   ├── src/
│   │   ├── app/                    # Next.js App Router
│   │   │   ├── courses/           # Trang khóa học
│   │   │   ├── dashboard/         # Dashboard user
│   │   │   ├── trial/             # Trial booking
│   │   │   └── login/             # Authentication
│   │   ├── components/            # React components
│   │   │   ├── courses/          # Course components
│   │   │   ├── trial/            # Trial components
│   │   │   └── ui/               # shadcn/ui components
│   │   ├── data/                 # Mock data (cần thay bằng CMS)
│   │   ├── lib/                  # Utilities
│   │   └── types/                 # TypeScript types
│   └── package.json
└── docs/
    ├── cms_architecture_markdown.md
    └── giai-phap-khoa-hoc-online-toan-dien.md
```

### 2.2. Điểm Mạnh

- ✅ Next.js 16.0.7 với App Router (hiện đại)
- ✅ TypeScript (type safety)
- ✅ UI components đã có sẵn (shadcn/ui)
- ✅ Cấu trúc code rõ ràng, dễ mở rộng
- ✅ Authentication context đã setup

### 2.3. Điểm Cần Cải Thiện

- ❌ Dữ liệu đang dùng mock data (cần tích hợp CMS)
- ❌ Chưa có backend API
- ❌ Chưa có database
- ❌ Chưa có CMS admin dashboard
- ❌ Chưa có video streaming
- ❌ Chưa có user tier system

---

## 3. KIẾN TRÚC TÍCH HỢP CMS

### 3.1. Kiến Trúc Tổng Thể

```
┌─────────────────────────────────────────────────────────────────┐
│                    CMS SERVER (VPS Cố Định)                     │
│                    Domain: cms.ipd8.com                         │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  CMS Application (NextJS 16.0.7)                          │  │
│  │  Port: 3001                                                │  │
│  │  ├─ Admin Dashboard (/admin)                              │  │
│  │  │  ├─ Content Management                                 │  │
│  │  │  ├─ Course Management                                  │  │
│  │  │  ├─ Video Management                                   │  │
│  │  │  ├─ User Management                                    │  │
│  │  │  ├─ Media Library                                      │  │
│  │  │  └─ Analytics Dashboard                                │  │
│  │  ├─ API Gateway (/api/v1)                                 │  │
│  │  │  ├─ /content                                           │  │
│  │  │  ├─ /courses                                           │  │
│  │  │  ├─ /videos                                            │  │
│  │  │  ├─ /users                                             │  │
│  │  │  └─ /analytics                                         │  │
│  │  └─ Webhook System                                        │  │
│  └──────────────────┬─────────────────────────────────────────┘  │
│                     │                                              │
│  ┌──────────────────▼─────────────────────────────────────────┐  │
│  │  CMS Database (PostgreSQL)                                 │  │
│  │  ├─ api_keys (authentication)                              │  │
│  │  ├─ content (CMS content)                                  │  │
│  │  ├─ courses (khóa học)                                     │  │
│  │  ├─ videos (video metadata)                                │  │
│  │  ├─ users (user management)                                │  │
│  │  ├─ subscriptions (user tiers)                             │  │
│  │  ├─ media (media library)                                  │  │
│  │  ├─ webhooks (callback URLs)                               │  │
│  │  └─ analytics (metrics & logs)                            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Nginx Reverse Proxy                                      │  │
│  │  - SSL/TLS Termination                                    │  │
│  │  - Rate Limiting                                          │  │
│  │  - WAF Rules                                              │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            │ HTTPS API Calls
                            │ Authentication: Bearer Token / API Key
                            │
┌───────────────────────────▼──────────────────────────────────────┐
│         CLIENT WEB (IPD8 Frontend - Có thể di chuyển)            │
│         Domain: ipd8.com / *.ipd8.com                            │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Frontend (Next.js 16.0.7)                                │  │
│  │  Port: 3100                                                │  │
│  │  ├─ Public Pages                                           │  │
│  │  │  ├─ Homepage                                            │  │
│  │  │  ├─ Courses List                                        │  │
│  │  │  ├─ Course Detail                                       │  │
│  │  │  └─ Trial Booking                                       │  │
│  │  ├─ User Dashboard                                         │  │
│  │  │  ├─ My Courses                                          │  │
│  │  │  ├─ Video Player                                        │  │
│  │  │  └─ Progress Tracking                                   │  │
│  │  └─ API Routes (Next.js API)                               │  │
│  │     ├─ /api/proxy/* (CMS API proxy)                        │  │
│  │     └─ /api/webhooks/cms (webhook receiver)                │  │
│  └──────────────────┬─────────────────────────────────────────┘  │
│                     │                                              │
│  ┌──────────────────▼─────────────────────────────────────────┐  │
│  │  CMS Client SDK                                             │  │
│  │  ├─ API Client (authenticated requests)                    │  │
│  │  ├─ Content Cache (Redis)                                  │  │
│  │  ├─ Webhook Handler                                        │  │
│  │  └─ Real-time Sync                                         │  │
│  └──────────────────┬─────────────────────────────────────────┘  │
│                     │                                              │
│  ┌──────────────────▼─────────────────────────────────────────┐  │
│  │  Local Cache (Redis)                                       │  │
│  │  ├─ cached_content (CMS content cache)                     │  │
│  │  ├─ cached_courses (course cache)                          │  │
│  │  └─ user_sessions (session cache)                           │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Note: Video progress được lưu trực tiếp vào CMS Database     │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Video Streaming Service                                   │  │
│  │  ├─ HLS Player (Video.js)                                  │  │
│  │  ├─ Signed URL Generator                                   │  │
│  │  ├─ Encryption Key Management                              │  │
│  │  └─ Progress Tracker                                       │  │
│  └────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────┘
```

### 3.2. Luồng Dữ Liệu

#### A. Content Management Flow
```
1. Admin login CMS → /admin
   ↓
2. Create/Edit Course trong CMS Dashboard
   ↓
3. CMS lưu vào PostgreSQL
   ↓
4. Trigger Webhook → Client Web
   ↓
5. Client Web nhận webhook → Update cache
   ↓
6. Frontend hiển thị content mới
```

#### B. Video Streaming Flow
```
1. User click video → Frontend request
   ↓
2. Frontend → GET /api/proxy/videos/:id/stream
   ↓
3. Next.js API Route → CMS API (authenticated)
   ↓
4. CMS verify permission & generate signed URL
   ↓
5. Return signed URL + encryption key endpoint
   ↓
6. Video.js player load HLS stream
   ↓
7. Track progress → CMS API
```

#### C. Real-time Sync Flow
```
1. Admin update content trong CMS
   ↓
2. CMS trigger webhook event
   ↓
3. Client Web receive webhook
   ↓
4. Invalidate cache (Redis)
   ↓
5. Fetch fresh content từ CMS
   ↓
6. Update local database
   ↓
7. Frontend auto-refresh (SWR/React Query)
```

---

## 4. CHỨC NĂNG CMS QUẢN LÝ

### 4.1. Content Management

#### 4.1.1. Course Management
- ✅ **CRUD Operations:**
  - Create course với metadata (title, description, thumbnail, tier_required)
  - Edit course information
  - Delete course (soft delete)
  - Publish/Unpublish course
- ✅ **Course Organization:**
  - Categories & tags
  - Instructor assignment
  - Course ordering
  - Featured courses
- ✅ **Course Content:**
  - Rich text editor cho description
  - Media upload (images, videos)
  - Course curriculum builder
  - Prerequisites management

#### 4.1.2. Video Management
- ✅ **Video Upload:**
  - Upload video files (MP4, MOV)
  - Automatic HLS conversion
  - Thumbnail generation
  - Video metadata (duration, size, resolution)
- ✅ **Video Organization:**
  - Assign to courses
  - Video ordering trong course
  - Video tiers (Bronze, Silver, Gold)
  - Free/Trial video flags
- ✅ **Video Security:**
  - AES-128 encryption
  - Signed URL generation
  - Access control per user tier
  - Watermark injection
- ✅ **Video Storage:**
  - S3-compatible storage (primary)
  - VPS storage (for premium/trial videos)
  - CDN integration

#### 4.1.3. Media Library
- ✅ **File Management:**
  - Upload images, documents, PDFs
  - File organization (folders, tags)
  - Search & filter
  - Bulk operations
- ✅ **Media Usage:**
  - Track usage (where media is used)
  - Replace media (update all references)
  - Delete unused media

### 4.2. User Management

#### 4.2.1. User CRUD
- ✅ Create user accounts
- ✅ Edit user information
- ✅ Deactivate/Activate users
- ✅ Delete users (soft delete)

#### 4.2.2. User Tiers Management
- ✅ **Tier Assignment:**
  - Bronze (free tier)
  - Silver (premium tier)
  - Gold (premium+ tier)
- ✅ **Subscription Management:**
  - Create subscriptions
  - Extend subscriptions
  - Cancel subscriptions
  - Subscription history

#### 4.2.3. User Roles
- ✅ **Role Types:**
  - Admin (full access)
  - Instructor (course management)
  - User (standard user)
- ✅ **Permission System:**
  - Role-based access control (RBAC)
  - Granular permissions
  - Permission inheritance

### 4.3. Analytics & Reporting

#### 4.3.1. Dashboard Metrics
- ✅ **Overview:**
  - Total users (active, inactive)
  - Total courses (published, draft)
  - Total videos
  - Total revenue (if applicable)
- ✅ **User Analytics:**
  - User growth chart
  - User tier distribution
  - Active users (daily, weekly, monthly)
  - User engagement metrics
- ✅ **Course Analytics:**
  - Most popular courses
  - Course completion rates
  - Course revenue
  - Course ratings/reviews
- ✅ **Video Analytics:**
  - Video views
  - Average watch time
  - Video completion rates
  - Most watched videos

#### 4.3.2. Reports
- ✅ **User Reports:**
  - User list export (CSV/Excel)
  - User activity report
  - Subscription report
- ✅ **Course Reports:**
  - Course performance report
  - Enrollment report
  - Completion report
- ✅ **System Reports:**
  - API usage report
  - Storage usage report
  - Backup status report

### 4.4. System Management

#### 4.4.1. API Key Management
- ✅ **API Key Management:**
  - Generate API keys
  - Revoke API keys
  - API key permissions
  - Rate limiting per key
  - IP whitelist (optional)

#### 4.4.2. Webhook Management
- ✅ **Webhook Configuration:**
  - Create webhook endpoints
  - Configure webhook events
  - Test webhooks
  - Webhook logs & retry

#### 4.4.3. Backup & Maintenance
- ✅ **Automated Backups:**
  - Daily database backups
  - Backup encryption
  - Backup retention (keep 3 latest)
  - Email notifications
- ✅ **System Maintenance:**
  - Database optimization
  - Cache clearing
  - Log rotation
  - Storage cleanup

---

## 5. DATABASE SCHEMA TÍCH HỢP

### 5.1. CMS Database Schema (PostgreSQL)

```sql
-- ============================================
-- CMS DATABASE SCHEMA (Single Database)
-- ============================================

-- API Keys for authentication
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_name VARCHAR(100) NOT NULL,
    api_key VARCHAR(64) UNIQUE NOT NULL,
    api_secret VARCHAR(64) NOT NULL, -- Hashed
    permissions JSONB NOT NULL DEFAULT '[]',
    rate_limit INTEGER DEFAULT 1000,
    ip_whitelist TEXT[],
    expires_at TIMESTAMP,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Content table (CMS content)
CREATE TABLE content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'page', 'post', 'announcement'
    content_data JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    published_at TIMESTAMP
);

-- Courses table
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL,
    description TEXT,
    short_description TEXT,
    thumbnail_url VARCHAR(500),
    instructor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    tier_required VARCHAR(20) DEFAULT 'bronze' CHECK (tier_required IN ('bronze', 'silver', 'gold')),
    price DECIMAL(10, 2) DEFAULT 0,
    duration_hours INTEGER DEFAULT 0,
    level VARCHAR(50), -- 'beginner', 'intermediate', 'advanced'
    category VARCHAR(100),
    tags TEXT[],
    is_published BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    has_google_meet BOOLEAN DEFAULT FALSE,
    enrollment_count INTEGER DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    published_at TIMESTAMP
);

-- Videos table
CREATE TABLE videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL, -- in seconds
    order_index INTEGER NOT NULL,
    storage_location VARCHAR(20) NOT NULL CHECK (storage_location IN ('s3', 'vps')),
    s3_key VARCHAR(500),
    vps_path VARCHAR(500),
    hls_playlist_url VARCHAR(500),
    encryption_key TEXT NOT NULL, -- Encrypted AES key
    tier_required VARCHAR(20) DEFAULT 'bronze' CHECK (tier_required IN ('bronze', 'silver', 'gold')),
    is_free BOOLEAN DEFAULT FALSE,
    is_trial BOOLEAN DEFAULT FALSE,
    thumbnail_url VARCHAR(500),
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(course_id, order_index)
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    tier VARCHAR(20) NOT NULL DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold')),
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'instructor')),
    email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tier VARCHAR(20) NOT NULL CHECK (tier IN ('bronze', 'silver', 'gold')),
    start_date TIMESTAMP NOT NULL DEFAULT NOW(),
    end_date TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    payment_method VARCHAR(50),
    amount DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'VND',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Course enrollments
CREATE TABLE course_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT NOW(),
    progress_percentage DECIMAL(5, 2) DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- Video progress tracking
CREATE TABLE video_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    progress_seconds INTEGER NOT NULL DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    last_watched TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, video_id)
);

-- Media library
CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename VARCHAR(500) NOT NULL,
    original_filename VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL, -- 'image', 'video', 'document', 'pdf'
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    storage_location VARCHAR(20) NOT NULL CHECK (storage_location IN ('s3', 'vps')),
    s3_key VARCHAR(500),
    vps_path VARCHAR(500),
    url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    alt_text TEXT,
    tags TEXT[],
    usage_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Webhooks table
CREATE TABLE webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url VARCHAR(500) NOT NULL,
    secret VARCHAR(64) NOT NULL,
    events TEXT[] NOT NULL, -- ['content.created', 'content.updated', ...]
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Webhook logs
CREATE TABLE webhook_logs (
    id BIGSERIAL PRIMARY KEY,
    webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
    event VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'success', 'failed')),
    status_code INTEGER,
    error_message TEXT,
    sent_at TIMESTAMP DEFAULT NOW(),
    response_time_ms INTEGER
);

-- Analytics events
CREATE TABLE analytics_events (
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL, -- 'page_view', 'video_play', 'course_purchase', etc.
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    video_id UUID REFERENCES videos(id) ON DELETE SET NULL,
    metadata JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Admin action logs
CREATE TABLE admin_logs (
    id BIGSERIAL PRIMARY KEY,
    admin_id UUID NOT NULL REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT NOW()
);

-- API request logs
CREATE TABLE api_requests (
    id BIGSERIAL PRIMARY KEY,
    api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INTEGER,
    ip_address INET,
    user_agent TEXT,
    request_body JSONB,
    response_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Backup logs
CREATE TABLE backup_logs (
    id BIGSERIAL PRIMARY KEY,
    backup_type VARCHAR(50) NOT NULL, -- 'database', 'full_system', 'files'
    file_path VARCHAR(500),
    file_size BIGINT,
    s3_key VARCHAR(500),
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'success', 'failed')),
    error_message TEXT,
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    email_sent BOOLEAN DEFAULT FALSE
);

-- Indexes for performance
CREATE INDEX idx_api_keys_key ON api_keys(api_key) WHERE is_active = true;
CREATE INDEX idx_content_slug ON content(slug);
CREATE INDEX idx_content_status ON content(status);
CREATE INDEX idx_content_type ON content(type);
CREATE INDEX idx_courses_slug ON courses(slug);
CREATE INDEX idx_courses_published ON courses(is_published);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_tier ON courses(tier_required);
CREATE INDEX idx_videos_course ON videos(course_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_tier ON users(tier);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_subscriptions_user_active ON subscriptions(user_id, is_active);
CREATE INDEX idx_enrollments_user ON course_enrollments(user_id);
CREATE INDEX idx_enrollments_course ON course_enrollments(course_id);
CREATE INDEX idx_video_progress_user ON video_progress(user_id);
CREATE INDEX idx_video_progress_video ON video_progress(video_id);
CREATE INDEX idx_media_file_type ON media(file_type);
CREATE INDEX idx_webhooks_active ON webhooks(is_active);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created ON analytics_events(created_at);
CREATE INDEX idx_api_requests_created ON api_requests(created_at);
CREATE INDEX idx_admin_logs_admin ON admin_logs(admin_id);
CREATE INDEX idx_admin_logs_created ON admin_logs(created_at);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_updated_at BEFORE UPDATE ON media
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 5.2. Local Cache (Redis)

**Lưu ý:** Thay vì sử dụng database riêng cho cache, hệ thống sử dụng Redis để cache nội dung từ CMS. Video progress được lưu trực tiếp vào CMS database.

**Redis Cache Keys:**
- `content:{id}` - Cache content theo ID
- `content:slug:{slug}` - Cache content theo slug
- `course:{id}` - Cache course theo ID
- `course:slug:{slug}` - Cache course theo slug
- `courses:list:{filters}` - Cache danh sách courses với filters
- `session:{token}` - Cache user session
- `user:{id}` - Cache user info

**Cache TTL:**
- Content: 1 hour
- Courses: 30 minutes
- Course list: 15 minutes
- User sessions: 24 hours
- User info: 1 hour

---

## 6. API DESIGN

### 6.1. CMS API Endpoints

#### 6.1.1. Authentication Endpoints

```typescript
// POST /api/v1/auth/token
// Generate JWT token from API key/secret
Request:
{
  apiKey: string;
  apiSecret: string;
}

Response:
{
  success: true;
  data: {
    token: string;
    expiresIn: number;
  }
}

// POST /api/v1/auth/refresh
// Refresh access token
Request:
{
  refreshToken: string;
}

Response:
{
  success: true;
  data: {
    token: string;
    expiresIn: number;
  }
}
```

#### 6.1.2. Content Endpoints

```typescript
// GET /api/v1/content
// List content with pagination
Query Params:
- page: number (default: 1)
- limit: number (default: 20)
- type: string ('page' | 'post' | 'announcement')
- status: string ('draft' | 'published' | 'archived')
- search: string

Response:
{
  success: true;
  data: Content[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  }
}

// GET /api/v1/content/:id
// Get single content
Response:
{
  success: true;
  data: Content;
}

// POST /api/v1/content
// Create content
Request:
{
  title: string;
  slug: string;
  type: string;
  content_data: object;
  status: string;
}

Response:
{
  success: true;
  data: Content;
}

// PUT /api/v1/content/:id
// Update content
Request:
{
  title?: string;
  content_data?: object;
  status?: string;
}

Response:
{
  success: true;
  data: Content;
}

// DELETE /api/v1/content/:id
// Delete content (soft delete)
Response:
{
  success: true;
  message: "Content deleted";
}
```

#### 6.1.3. Course Endpoints

```typescript
// GET /api/v1/courses
// List courses
Query Params:
- page: number
- limit: number
- category: string
- tier: string
- level: string
- search: string
- featured: boolean

Response:
{
  success: true;
  data: Course[];
  pagination: Pagination;
}

// GET /api/v1/courses/:id
// Get course detail
Response:
{
  success: true;
  data: Course & {
    videos: Video[];
    instructor: User;
  };
}

// POST /api/v1/courses
// Create course
Request:
{
  title: string;
  slug: string;
  description: string;
  tier_required: string;
  category: string;
  // ... other fields
}

// PUT /api/v1/courses/:id
// Update course

// DELETE /api/v1/courses/:id
// Delete course
```

#### 6.1.4. Video Endpoints

```typescript
// GET /api/v1/videos/:id/stream
// Get signed URL for video streaming
Response:
{
  success: true;
  data: {
    signedUrl: string;
    keyUrl: string;
    duration: number;
    title: string;
  }
}

// GET /api/v1/videos/:id/key
// Get encryption key for HLS
Query Params:
- expires: number
- signature: string
- user: string

Response: Binary (encryption key)

// POST /api/v1/videos/:id/progress
// Save video progress
Request:
{
  progressSeconds: number;
  completed: boolean;
}

// GET /api/v1/videos/:id
// Get video metadata
Response:
{
  success: true;
  data: Video;
}
```

#### 6.1.5. User Endpoints

```typescript
// GET /api/v1/users
// List users
Query Params:
- page: number
- limit: number
- tier: string
- role: string
- search: string

// GET /api/v1/users/:id
// Get user detail

// POST /api/v1/users
// Create user

// PUT /api/v1/users/:id
// Update user

// PUT /api/v1/users/:id/tier
// Update user tier
Request:
{
  tier: string;
  endDate?: string;
}
```

#### 6.1.6. Analytics Endpoints

```typescript
// GET /api/v1/analytics/dashboard
// Get dashboard metrics
Response:
{
  success: true;
  data: {
    totalUsers: number;
    activeUsers: number;
    totalCourses: number;
    totalVideos: number;
    userGrowth: ChartData[];
    coursePerformance: CoursePerformance[];
  }
}

// GET /api/v1/analytics/courses/:id
// Get course analytics
Response:
{
  success: true;
  data: {
    views: number;
    enrollments: number;
    completionRate: number;
    averageWatchTime: number;
    // ... more metrics
  }
}
```

### 6.2. Client API Proxy (Next.js API Routes)

```typescript
// app/api/proxy/[...path]/route.ts
// Proxy all CMS API requests
export async function GET(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const searchParams = new URL(request.url).searchParams;
  
  // Get API credentials from environment
  const apiKey = process.env.CMS_API_KEY;
  const apiSecret = process.env.CMS_API_SECRET;
  const cmsUrl = process.env.CMS_API_URL;
  
  // Authenticate with CMS
  const token = await getCMSToken(apiKey, apiSecret);
  
  // Forward request to CMS
  const response = await fetch(`${cmsUrl}/${path}?${searchParams}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  return response;
}

// app/api/webhooks/cms/route.ts
// Webhook receiver
export async function POST(request: Request) {
  const signature = request.headers.get('X-Webhook-Signature');
  const event = request.headers.get('X-Webhook-Event');
  const body = await request.json();
  
  // Verify signature
  const isValid = verifyWebhookSignature(body, signature);
  if (!isValid) {
    return new Response('Invalid signature', { status: 401 });
  }
  
  // Handle webhook event
  await handleWebhookEvent(event, body);
  
  return new Response('OK', { status: 200 });
}
```

---

## 7. FRONTEND CMS DASHBOARD

### 7.1. Dashboard Structure

```
/admin
├── /dashboard          # Overview dashboard
├── /content            # Content management
│   ├── /pages         # Page content
│   ├── /posts         # Blog posts
│   └── /announcements # Announcements
├── /courses           # Course management
│   ├── /list         # Course list
│   ├── /create       # Create course
│   └── /[id]         # Course detail/edit
├── /videos            # Video management
│   ├── /list         # Video list
│   ├── /upload       # Upload video
│   └── /[id]         # Video detail/edit
├── /users             # User management
│   ├── /list         # User list
│   ├── /create       # Create user
│   └── /[id]         # User detail/edit
├── /media             # Media library
├── /analytics         # Analytics dashboard
├── /settings          # System settings
│   ├── /api-keys     # API key management
│   ├── /webhooks     # Webhook configuration
│   └── /backups      # Backup management
└── /profile           # Admin profile
```

### 7.2. Key Components

#### 7.2.1. Dashboard Overview

```typescript
// app/admin/dashboard/page.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalyticsChart } from '@/components/admin/AnalyticsChart';

export default function AdminDashboard() {
  const { data: metrics } = useQuery({
    queryKey: ['admin', 'metrics'],
    queryFn: async () => {
      const res = await fetch('/api/admin/metrics');
      return res.json();
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalUsers || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Total Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalCourses || 0}</div>
          </CardContent>
        </Card>
        
        {/* More cards... */}
      </div>
      
      {/* Charts */}
      <AnalyticsChart data={metrics?.userGrowth} />
    </div>
  );
}
```

#### 7.2.2. Course Management

```typescript
// app/admin/courses/list/page.tsx
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { CourseTable } from '@/components/admin/CourseTable';

export default function CourseListPage() {
  const queryClient = useQueryClient();
  
  const { data: courses, isLoading } = useQuery({
    queryKey: ['admin', 'courses'],
    queryFn: async () => {
      const res = await fetch('/api/admin/courses');
      return res.json();
    },
  });
  
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/courses/${id}`, {
        method: 'DELETE',
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
    },
  });
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Courses</h1>
        <Button href="/admin/courses/create">Create Course</Button>
      </div>
      
      <CourseTable 
        courses={courses?.data || []}
        onDelete={(id) => deleteMutation.mutate(id)}
      />
    </div>
  );
}
```

#### 7.2.3. Video Upload Component

```typescript
// components/admin/VideoUpload.tsx
'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export function VideoUpload({ courseId }: { courseId: string }) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  
  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setUploading(true);
    
    // Upload to CMS
    const formData = new FormData();
    formData.append('video', file);
    formData.append('courseId', courseId);
    
    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percentComplete = (e.loaded / e.total) * 100;
        setUploadProgress(percentComplete);
      }
    });
    
    xhr.addEventListener('load', () => {
      setUploading(false);
      // Handle success
    });
    
    xhr.open('POST', '/api/admin/videos/upload');
    xhr.send(formData);
  };
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': ['.mp4', '.mov'] },
    maxFiles: 1,
  });
  
  return (
    <div {...getRootProps()} className="border-2 border-dashed p-8 rounded-lg">
      <input {...getInputProps()} />
      {uploading ? (
        <div className="space-y-2">
          <Progress value={uploadProgress} />
          <p>Uploading... {Math.round(uploadProgress)}%</p>
        </div>
      ) : (
        <div className="text-center">
          <p>{isDragActive ? 'Drop video here' : 'Drag & drop video or click to select'}</p>
        </div>
      )}
    </div>
  );
}
```

---

## 8. BACKEND CMS SERVICES

### 8.1. CMS Service Structure

```
cms-backend/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   ├── redis.js
│   │   └── s3.js
│   ├── controllers/
│   │   ├── content.controller.js
│   │   ├── course.controller.js
│   │   ├── video.controller.js
│   │   ├── user.controller.js
│   │   └── analytics.controller.js
│   ├── services/
│   │   ├── content.service.js
│   │   ├── course.service.js
│   │   ├── video.service.js
│   │   ├── video-processing.service.js
│   │   ├── webhook.service.js
│   │   └── analytics.service.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── rate-limit.middleware.js
│   │   └── validation.middleware.js
│   └── routes/
│       ├── content.routes.js
│       ├── course.routes.js
│       ├── video.routes.js
│       └── user.routes.js
└── package.json
```

### 8.2. Video Processing Service

```javascript
// services/video-processing.service.js
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const ffmpeg = require('fluent-ffmpeg');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs').promises;

class VideoProcessingService {
  constructor() {
    this.s3Client = new S3Client({
      region: process.env.S3_REGION,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY,
      },
    });
  }

  /**
   * Process uploaded video: Convert to HLS, encrypt, upload to S3
   */
  async processVideo(videoFile, courseId, videoId) {
    const tempDir = `/tmp/videos/${videoId}`;
    await fs.mkdir(tempDir, { recursive: true });

    try {
      // 1. Save uploaded file temporarily
      const inputPath = path.join(tempDir, 'input.mp4');
      await fs.writeFile(inputPath, videoFile.buffer);

      // 2. Generate encryption key
      const encryptionKey = crypto.randomBytes(16);
      const keyInfo = this.generateKeyInfo(encryptionKey);

      // 3. Convert to HLS with encryption
      const hlsPath = path.join(tempDir, 'output');
      await this.convertToHLS(inputPath, hlsPath, encryptionKey);

      // 4. Upload HLS segments to S3
      const s3Key = `courses/${courseId}/videos/${videoId}/playlist.m3u8`;
      await this.uploadHLSToS3(hlsPath, s3Key);

      // 5. Generate thumbnail
      const thumbnailPath = await this.generateThumbnail(inputPath, videoId);

      // 6. Upload thumbnail
      const thumbnailS3Key = `courses/${courseId}/videos/${videoId}/thumbnail.jpg`;
      await this.uploadThumbnail(thumbnailPath, thumbnailS3Key);

      // 7. Cleanup temp files
      await fs.rm(tempDir, { recursive: true, force: true });

      return {
        hlsPlaylistUrl: `${process.env.S3_CDN_URL}/${s3Key}`,
        thumbnailUrl: `${process.env.S3_CDN_URL}/${thumbnailS3Key}`,
        encryptionKey: this.encryptKey(encryptionKey),
        keyInfo,
      };
    } catch (error) {
      // Cleanup on error
      await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
      throw error;
    }
  }

  /**
   * Convert video to HLS format with AES-128 encryption
   */
  async convertToHLS(inputPath, outputPath, encryptionKey) {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          '-c:v libx264',
          '-c:a aac',
          '-hls_time 10',
          '-hls_playlist_type vod',
          '-hls_segment_filename', `${outputPath}/segment_%03d.ts`,
          '-hls_key_info_file', this.createKeyInfoFile(encryptionKey),
          '-hls_flags independent_segments',
        ])
        .output(`${outputPath}/playlist.m3u8`)
        .on('end', resolve)
        .on('error', reject)
        .run();
    });
  }

  /**
   * Generate key info file for HLS encryption
   */
  createKeyInfoFile(encryptionKey) {
    const keyUrl = `${process.env.API_URL}/api/videos/key`;
    const keyPath = `/tmp/key_${Date.now()}.keyinfo`;
    
    const keyInfo = [
      keyUrl,
      '/tmp/key.key',
      encryptionKey.toString('hex'),
    ].join('\n');

    fs.writeFileSync(keyPath, keyInfo);
    fs.writeFileSync('/tmp/key.key', encryptionKey);

    return keyPath;
  }

  /**
   * Upload HLS segments to S3
   */
  async uploadHLSToS3(hlsPath, s3Key) {
    const files = await fs.readdir(hlsPath);
    
    for (const file of files) {
      const filePath = path.join(hlsPath, file);
      const fileContent = await fs.readFile(filePath);
      const fileS3Key = `${s3Key.replace('playlist.m3u8', '')}${file}`;

      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.S3_BUCKET,
          Key: fileS3Key,
          Body: fileContent,
          ContentType: file.endsWith('.m3u8') ? 'application/vnd.apple.mpegurl' : 'video/MP2T',
        })
      );
    }
  }

  /**
   * Generate thumbnail from video
   */
  async generateThumbnail(videoPath, videoId) {
    const thumbnailPath = `/tmp/thumbnails/${videoId}.jpg`;
    await fs.mkdir(path.dirname(thumbnailPath), { recursive: true });

    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .screenshots({
          timestamps: ['00:00:01'],
          filename: path.basename(thumbnailPath),
          folder: path.dirname(thumbnailPath),
        })
        .on('end', () => resolve(thumbnailPath))
        .on('error', reject);
    });
  }

  /**
   * Encrypt encryption key for storage
   */
  encryptKey(key) {
    const algorithm = 'aes-256-cbc';
    const encryptionKey = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, encryptionKey, iv);
    
    let encrypted = cipher.update(key);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    return iv.toString('hex') + encrypted.toString('hex');
  }
}

module.exports = new VideoProcessingService();
```

### 8.3. Webhook Service

```javascript
// services/webhook.service.js
const axios = require('axios');
const crypto = require('crypto');
const { db } = require('../config/database');
const logger = require('../utils/logger');

class WebhookService {
  /**
   * Trigger webhook event
   */
  async triggerWebhook(event, data) {
    try {
      // Get active webhooks
      const webhooks = await db('webhooks')
        .where({ is_active: true })
        .whereRaw("? = ANY(events)", [event]);

      if (webhooks.length === 0) {
        return;
      }

      // Send webhooks
      const promises = webhooks.map(webhook => 
        this.sendWebhook(webhook, event, data)
      );

      await Promise.allSettled(promises);
    } catch (error) {
      logger.error('Webhook trigger error:', error);
    }
  }

  /**
   * Send webhook request
   */
  async sendWebhook(webhook, event, data) {
    const startTime = Date.now();
    
    try {
      const payload = {
        event,
        timestamp: new Date().toISOString(),
        data,
      };

      // Generate signature
      const signature = this.generateSignature(payload, webhook.secret);

      // Send request
      const response = await axios.post(webhook.url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': event,
        },
        timeout: 10000,
      });

      const responseTime = Date.now() - startTime;

      // Log success
      await db('webhook_logs').insert({
        webhook_id: webhook.id,
        event,
        status: 'success',
        status_code: response.status,
        response_time_ms: responseTime,
        sent_at: new Date(),
      });

      return { success: true };
    } catch (error) {
      const responseTime = Date.now() - startTime;

      // Log failure
      await db('webhook_logs').insert({
        webhook_id: webhook.id,
        event,
        status: 'failed',
        status_code: error.response?.status || null,
        error_message: error.message,
        response_time_ms: responseTime,
        sent_at: new Date(),
      });

      // Retry logic
      await this.scheduleRetry(webhook.id, event, data);

      return { success: false, error: error.message };
    }
  }

  /**
   * Generate webhook signature
   */
  generateSignature(payload, secret) {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(JSON.stringify(payload));
    return hmac.digest('hex');
  }

  /**
   * Schedule webhook retry
   */
  async scheduleRetry(webhookId, event, data) {
    // Implement retry queue (e.g., Bull queue)
    // For now, just log
    logger.warn(`Webhook retry scheduled: ${webhookId} - ${event}`);
  }
}

module.exports = new WebhookService();
```

---

## 9. QUY TRÌNH TRIỂN KHAI

### 9.1. Phase 1: Setup Infrastructure (Week 1-2)

#### 9.1.1. CMS Server Setup
- [ ] Setup VPS với PostgreSQL, Redis, Nginx
- [ ] Deploy CMS backend application
- [ ] Setup SSL certificates
- [ ] Configure Nginx reverse proxy
- [ ] Setup database schema
- [ ] Create admin user

#### 9.1.2. Client Web Setup
- [ ] Setup local PostgreSQL cho cache
- [ ] Setup Redis cho content cache
- [ ] Configure environment variables
- [ ] Test CMS API connection

### 9.2. Phase 2: Core CMS Features (Week 3-4)

#### 9.2.1. Authentication & Authorization
- [ ] Implement API key generation
- [ ] Implement JWT authentication
- [ ] Setup rate limiting
- [ ] Implement permission system

#### 9.2.2. Content Management
- [ ] Build content CRUD APIs
- [ ] Build admin dashboard for content
- [ ] Implement rich text editor
- [ ] Implement media upload

### 9.3. Phase 3: Course & Video Management (Week 5-6)

#### 9.3.1. Course Management
- [ ] Build course CRUD APIs
- [ ] Build course management UI
- [ ] Implement course categories & tags
- [ ] Implement course search & filter

#### 9.3.2. Video Management
- [ ] Implement video upload
- [ ] Implement HLS conversion
- [ ] Implement video encryption
- [ ] Build video management UI
- [ ] Implement signed URL generation

### 9.4. Phase 4: Frontend Integration (Week 7-8)

#### 9.4.1. CMS Client SDK
- [ ] Build CMS client SDK
- [ ] Implement content caching
- [ ] Implement webhook receiver
- [ ] Implement real-time sync

#### 9.4.2. Frontend Updates
- [ ] Replace mock data với CMS API
- [ ] Implement course listing từ CMS
- [ ] Implement course detail từ CMS
- [ ] Implement video player với signed URLs

### 9.5. Phase 5: User Management & Analytics (Week 9-10)

#### 9.5.1. User Management
- [ ] Build user CRUD APIs
- [ ] Implement user tier system
- [ ] Build user management UI
- [ ] Implement subscription management

#### 9.5.2. Analytics
- [ ] Build analytics APIs
- [ ] Implement analytics dashboard
- [ ] Implement reporting features
- [ ] Setup data aggregation jobs

### 9.6. Phase 6: Testing & Optimization (Week 11-12)

#### 9.6.1. Testing
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Performance testing
- [ ] Security testing

#### 9.6.2. Optimization
- [ ] Database query optimization
- [ ] Cache strategy optimization
- [ ] CDN configuration
- [ ] Load testing & scaling

---

## 10. BẢO MẬT & PHÂN QUYỀN

### 10.1. Authentication

#### 10.1.1. API Key Authentication
- ✅ API Key + Secret (HMAC)
- ✅ JWT tokens (short-lived)
- ✅ Refresh tokens (long-lived)
- ✅ Token rotation

#### 10.1.2. Rate Limiting
- ✅ Per API key rate limits
- ✅ Per IP rate limits
- ✅ Per endpoint rate limits
- ✅ Rate limit headers in responses

### 10.2. Authorization

#### 10.2.1. Role-Based Access Control (RBAC)
```typescript
// Permission structure
const permissions = {
  admin: [
    'content.*',
    'course.*',
    'video.*',
    'user.*',
    'analytics.*',
    'system.*',
  ],
  instructor: [
    'course.read',
    'course.update',
    'video.read',
    'video.create',
    'video.update',
    'user.read',
  ],
  user: [
    'course.read',
    'video.read',
  ],
};
```

#### 10.2.2. Resource-Level Permissions
- ✅ User can only access their own data
- ✅ Course access based on enrollment
- ✅ Video access based on tier & enrollment
- ✅ Admin/Instructor role-based access

### 10.3. Data Security

#### 10.3.1. Encryption
- ✅ Database encryption at rest
- ✅ Video encryption (AES-128)
- ✅ API communication (HTTPS/TLS)
- ✅ Sensitive data encryption

#### 10.3.2. Video Security
- ✅ HLS with AES-128 encryption
- ✅ Signed URLs với expiration
- ✅ Watermark injection
- ✅ No direct download
- ✅ IP-based restrictions (optional)

---

## 11. MONITORING & ANALYTICS

### 11.1. System Monitoring

#### 11.1.1. Health Checks
- ✅ Database connectivity
- ✅ Redis connectivity
- ✅ S3 connectivity
- ✅ API response times
- ✅ Disk space usage
- ✅ Memory usage

#### 11.1.2. Logging
- ✅ API request logs
- ✅ Error logs
- ✅ Admin action logs
- ✅ Webhook logs
- ✅ Video access logs

### 11.2. Analytics Dashboard

#### 11.2.1. Key Metrics
- ✅ User growth
- ✅ Course performance
- ✅ Video engagement
- ✅ Revenue metrics (if applicable)
- ✅ System performance

#### 11.2.2. Reports
- ✅ Daily/weekly/monthly reports
- ✅ Export to CSV/Excel
- ✅ Scheduled email reports
- ✅ Custom date ranges

---

## 12. MIGRATION PLAN

### 12.1. Data Migration

#### 12.1.1. From Mock Data to CMS
1. Export mock data từ `src/data/`
2. Transform data format
3. Import vào CMS database
4. Verify data integrity
5. Update frontend to use CMS API

#### 12.1.2. Content Migration Checklist
- [ ] Export courses data
- [ ] Export videos metadata
- [ ] Export users data (if any)
- [ ] Upload media files
- [ ] Map old IDs to new IDs
- [ ] Update references

### 12.2. Deployment Strategy

#### 12.2.1. Staging Environment
- [ ] Setup staging CMS server
- [ ] Setup staging client web
- [ ] Test all features
- [ ] Performance testing
- [ ] Security audit

#### 12.2.2. Production Deployment
- [ ] Backup current system
- [ ] Deploy CMS server
- [ ] Deploy client web updates
- [ ] Migrate data
- [ ] Switch DNS
- [ ] Monitor for 24-48 hours
- [ ] Rollback plan ready

### 12.3. Rollback Plan

#### 12.3.1. Rollback Triggers
- Critical errors in production
- Performance degradation > 50%
- Security vulnerabilities
- Data loss or corruption

#### 12.3.2. Rollback Steps
1. Switch DNS back to old system
2. Restore database backup
3. Revert code deployment
4. Verify system functionality
5. Investigate issues
6. Plan fix and retry

---

## 📝 TÓM TẮT

### Tính Năng Chính
1. ✅ **Content Management** - Quản lý nội dung tập trung
2. ✅ **Course Management** - Quản lý khóa học đầy đủ
3. ✅ **Video Management** - Upload, convert, encrypt video
4. ✅ **User Management** - Quản lý users & tiers
5. ✅ **Analytics Dashboard** - Thống kê & báo cáo
6. ✅ **Webhook System** - Real-time sync
7. ✅ **API Gateway** - RESTful API với authentication
8. ✅ **Video Security** - HLS encryption, signed URLs
9. ✅ **Backup System** - Automated backups
10. ✅ **Single Database** - 1 database duy nhất, đơn giản hóa quản lý

### Tech Stack
- **CMS Backend:** Node.js + Express + PostgreSQL
- **CMS Frontend:** Next.js 16.0.7 (Admin Dashboard)
- **Client Frontend:** Next.js 16.0.7 (IPD8 Platform)
- **Database:** PostgreSQL (Single database)
- **Cache:** Redis
- **Storage:** S3-compatible (videos, media)
- **Video Processing:** FFmpeg (HLS conversion)
- **CDN:** Cloudflare

### Timeline
- **Phase 1-2:** Infrastructure & Core CMS (4 weeks)
- **Phase 3-4:** Course/Video & Frontend Integration (4 weeks)
- **Phase 5-6:** User Management, Analytics & Testing (4 weeks)
- **Total:** ~12 weeks

---

**Document Version:** 1.0  
**Created:** 2025-01-XX  
**Status:** 📋 Planning Phase  
**Next Steps:** Review & approval, then start Phase 1

---

*Tài liệu này được tạo dựa trên phân tích 2 file markdown tham khảo và cấu trúc dự án IPD8 hiện tại.*
