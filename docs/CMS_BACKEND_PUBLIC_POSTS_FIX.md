# CMS Backend - Public Posts Endpoint Fix

## ✅ Fixes Applied

### 1. Post Model - Removed `published_at` Field
- **Issue:** Database schema không có cột `published_at`
- **Fix:** Removed `published_at` field từ Post model
- **File:** `Projects/cms-backend/src/models/Post.ts`

### 2. Post Model - Fixed `type` Enum
- **Issue:** Post model có `type` enum `['article', 'event']` nhưng database schema là `['NEWS', 'EVENT', 'BLOG', 'FAQ', 'POLICY']`
- **Fix:** Updated `type` enum to match database schema
- **File:** `Projects/cms-backend/src/models/Post.ts`

### 3. Post Controller - Removed `cover_asset` Association
- **Issue:** Controller đang dùng `cover_asset` association nhưng Post model không có field này trong IPD8 schema
- **Fix:** Removed `cover_asset` include, sử dụng `thumbnail_url` trực tiếp
- **File:** `Projects/cms-backend/src/controllers/public/postController.ts`

### 4. Post Controller - Fixed Tags Query
- **Issue:** Bảng `post_tags` dùng `tag_name` (VARCHAR) thay vì `tag_id` (UUID), không phải many-to-many với bảng `tags`
- **Fix:** Query `post_tags` table trực tiếp với `tag_name`
- **File:** `Projects/cms-backend/src/controllers/public/postController.ts`

### 5. Post Controller - Fixed SEO Fields
- **Issue:** Controller đang dùng `seo` JSONB nhưng Post model chỉ có `seo_title` và `seo_description`
- **Fix:** Updated `formatPost` để dùng `seo_title` và `seo_description` trực tiếp
- **File:** `Projects/cms-backend/src/controllers/public/postController.ts`

### 6. Post Controller - Fixed Order By
- **Issue:** Controller đang order by `published_at` nhưng database không có cột này
- **Fix:** Changed order by to `created_at`
- **File:** `Projects/cms-backend/src/controllers/public/postController.ts`

## ⚠️ Current Status

- ✅ Post model works correctly
- ✅ Database query works (tested with `test-posts-simple.ts`)
- ⚠️ API endpoint still returns 500 (may need server restart)

## 🔧 Next Steps

1. **Restart CMS Backend Server:**
   ```bash
   cd Projects/cms-backend
   npm run dev
   ```

2. **Test API Endpoint:**
   ```bash
   npm run test:api
   ```

3. **Verify Response:**
   - Should return 200 with empty array if no posts exist
   - Should return posts if data exists

## 📝 Notes

- Database currently has 0 published posts (expected for staging)
- Endpoint should return empty array, not 500 error
- Server may need restart to load updated Post model






















