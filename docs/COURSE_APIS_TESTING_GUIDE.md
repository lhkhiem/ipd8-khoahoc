# 🧪 COURSE APIs TESTING GUIDE

**Ngày tạo:** 2025-01-XX  
**Mục đích:** Hướng dẫn test các API endpoints mới cho Course Management

---

## 📋 TỔNG QUAN

Guide này hướng dẫn test các API endpoints mới:
- ✅ Modules Management (Update, Delete, Reorder)
- ✅ Sessions Management (Update, Delete, Update Status)
- ✅ Materials Management (Add, Update, Delete với file upload)

---

## 🚀 CÁCH 1: AUTOMATED TEST (Khuyến nghị)

### Bước 1: Cài đặt dependencies

```bash
cd Projects/cms-backend
npm install form-data
```

### Bước 2: Start CMS Backend Server

```bash
npm run dev
```

Server sẽ chạy trên `http://localhost:3103`

**Lưu ý:** Đảm bảo:
- ✅ File `.env.local` đã được cấu hình
- ✅ Database đã được migrate
- ✅ Có admin user để login (email: `admin@ipd8.com`, password: `admin123`)

### Bước 3: Chạy Test Script

```bash
npm run test:course
```

Test script sẽ tự động:
1. ✅ Login với admin account
2. ✅ Tạo test course
3. ✅ Test tất cả Modules APIs
4. ✅ Test tất cả Sessions APIs
5. ✅ Test tất cả Materials APIs
6. ✅ Cleanup (xóa test course)

---

## 🔧 CÁCH 2: MANUAL TEST VỚI POSTMAN/THUNDER CLIENT

### Setup

1. **Import Postman Collection:**
   - File: `docs/postman/CMS_Course_APIs.postman_collection.json`
   - Import vào Postman hoặc Thunder Client

2. **Set Environment Variables:**
   - `base_url`: `http://localhost:3103`
   - `api_url`: `http://localhost:3103/api`
   - `auth_token`: (sẽ được set sau khi login)

### Test Flow

#### Step 1: Authentication

**POST** `/api/auth/login`
```json
{
  "email": "admin@ipd8.com",
  "password": "admin123"
}
```

**Response:**
- Copy `token` từ response
- Set vào environment variable `auth_token`
- Hoặc set vào header: `Authorization: Bearer {token}`

#### Step 2: Create Test Course

**POST** `/api/courses`
```json
{
  "slug": "test-course-api",
  "title": "Test Course for API",
  "target_audience": "pregnant-women",
  "description": "Test course description",
  "price": 100000,
  "price_type": "one-off",
  "duration_minutes": 60,
  "mode": "group",
  "status": "draft"
}
```

**Response:** Copy `id` của course → Set vào `course_id` variable

---

## 📦 MODULES APIs TEST

### 1. Get Modules

**GET** `/api/courses/:course_id/modules`

**Expected:** `200 OK` với array rỗng hoặc danh sách modules

### 2. Add Module

**POST** `/api/courses/:course_id/modules`
```json
{
  "title": "Module 1: Introduction",
  "description": "Introduction to the course",
  "duration_minutes": 30,
  "order": 1
}
```

**Expected:** `201 Created` với module data

**Save:** Copy `id` → Set vào `module_id` variable

### 3. Update Module

**PUT** `/api/courses/:course_id/modules/:module_id`
```json
{
  "title": "Module 1: Introduction (Updated)",
  "description": "Updated description"
}
```

**Expected:** `200 OK` với updated module

### 4. Reorder Modules

**PUT** `/api/courses/:course_id/modules/reorder`
```json
{
  "moduleIds": ["module_id_2", "module_id_1"]
}
```

**Expected:** `200 OK` với modules đã được reorder

### 5. Delete Module

**DELETE** `/api/courses/:course_id/modules/:module_id`

**Expected:** `200 OK` với message "Module deleted successfully"

---

## 📅 SESSIONS APIs TEST

### 1. Get Sessions

**GET** `/api/courses/:course_id/sessions`

**Expected:** `200 OK` với array rỗng hoặc danh sách sessions

### 2. Add Session

**POST** `/api/courses/:course_id/sessions`
```json
{
  "title": "Session 1: First Class",
  "description": "First class of the course",
  "start_time": "2025-02-01T10:00:00Z",
  "end_time": "2025-02-01T12:00:00Z",
  "location": "Online",
  "capacity": 20,
  "meeting_type": "google-meet"
}
```

**Expected:** `201 Created` với session data

**Save:** Copy `id` → Set vào `session_id` variable

### 3. Update Session

**PUT** `/api/courses/:course_id/sessions/:session_id`
```json
{
  "title": "Session 1: First Class (Updated)",
  "capacity": 25
}
```

**Expected:** `200 OK` với updated session

### 4. Update Session Status

**PUT** `/api/courses/:course_id/sessions/:session_id/status`
```json
{
  "status": "full"
}
```

**Valid statuses:** `scheduled`, `full`, `cancelled`, `done`

**Expected:** `200 OK` với session có status mới

### 5. Delete Session

**DELETE** `/api/courses/:course_id/sessions/:session_id`

**Expected:** `200 OK` với message "Session deleted successfully"

---

## 📄 MATERIALS APIs TEST

### 1. Get Materials

**GET** `/api/courses/:course_id/materials`

**Expected:** `200 OK` với array rỗng hoặc danh sách materials

### 2. Add Material (File Upload)

**POST** `/api/courses/:course_id/materials`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file`: (File) - Chọn file để upload (PDF, DOC, image, video, etc.)
- `title`: "Test Material"
- `visibility`: "enrolled" (hoặc "public", "private")
- `provider`: "local"

**Expected:** `201 Created` với material data

**Save:** Copy `id` → Set vào `material_id` variable

**Supported File Types:**
- Documents: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
- Images: JPEG, PNG, GIF, WebP
- Videos: MP4, MPEG, QuickTime, AVI
- Archives: ZIP, RAR, 7Z
- Text: TXT, CSV

**File Size Limit:** 500MB

### 3. Update Material (Title/Visibility only)

**PUT** `/api/courses/:course_id/materials/:material_id`
```json
{
  "title": "Test Material (Updated)",
  "visibility": "public"
}
```

**Expected:** `200 OK` với updated material

### 4. Update Material (Replace File)

**PUT** `/api/courses/:course_id/materials/:material_id`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file`: (File) - File mới để thay thế
- `title`: (Optional) - Title mới
- `visibility`: (Optional) - Visibility mới

**Expected:** `200 OK` với material có file mới

**Note:** File cũ sẽ được tự động xóa

### 5. Delete Material

**DELETE** `/api/courses/:course_id/materials/:material_id`

**Expected:** `200 OK` với message "Material deleted successfully"

**Note:** File sẽ được tự động xóa khỏi storage

---

## 🔒 PERMISSIONS & VALIDATION TESTS

### Test Unauthorized Access

1. **Without Token:**
   - Gửi request không có `Authorization` header
   - **Expected:** `401 Unauthorized`

2. **With Invalid Token:**
   - Gửi request với token không hợp lệ
   - **Expected:** `401 Unauthorized`

### Test Insufficient Permissions

1. **Login as regular user (not admin/instructor):**
   - Thử create/update/delete course/module/session/material
   - **Expected:** `403 Forbidden`

### Test Validation

1. **Missing Required Fields:**
   - Create module không có `title`
   - **Expected:** `400 Bad Request` với error message

2. **Invalid Data:**
   - Update session status với giá trị không hợp lệ
   - **Expected:** `400 Bad Request`

3. **Invalid File Type:**
   - Upload file không được hỗ trợ
   - **Expected:** `400 Bad Request`

4. **File Too Large:**
   - Upload file > 500MB
   - **Expected:** `413 Payload Too Large`

---

## 🐛 TROUBLESHOOTING

### Issue: Authentication Failed

**Symptoms:** `401 Unauthorized` hoặc `403 Forbidden`

**Solutions:**
1. Kiểm tra email/password đúng không
2. Kiểm tra token có được set trong header không
3. Kiểm tra token có expired không
4. Kiểm tra user có role `admin` hoặc `instructor` không

### Issue: File Upload Failed

**Symptoms:** `400 Bad Request` hoặc `413 Payload Too Large`

**Solutions:**
1. Kiểm tra file type có được hỗ trợ không
2. Kiểm tra file size < 500MB
3. Kiểm tra `shared-storage/uploads/materials/` directory có tồn tại không
4. Kiểm tra permissions của directory

### Issue: Course/Module/Session/Material Not Found

**Symptoms:** `404 Not Found`

**Solutions:**
1. Kiểm tra ID có đúng không
2. Kiểm tra resource có thuộc về course đúng không
3. Kiểm tra resource có bị xóa trước đó không

---

## 📊 TEST CHECKLIST

### Modules
- [ ] Get modules (empty)
- [ ] Add module
- [ ] Update module
- [ ] Reorder modules
- [ ] Delete module
- [ ] Test permissions (unauthorized)
- [ ] Test validation (missing fields)

### Sessions
- [ ] Get sessions (empty)
- [ ] Add session
- [ ] Update session
- [ ] Update session status
- [ ] Delete session
- [ ] Test permissions
- [ ] Test validation (invalid dates, status)

### Materials
- [ ] Get materials (empty)
- [ ] Upload material (various file types)
- [ ] Update material (title/visibility)
- [ ] Replace material file
- [ ] Delete material (verify file deletion)
- [ ] Test file size limit
- [ ] Test invalid file types
- [ ] Test permissions

---

## 📚 TÀI LIỆU THAM KHẢO

- [Course APIs Documentation](./CMS_COURSE_APIS_COMPLETE.md)
- [API Testing Setup](./API_TESTING_SETUP.md)
- [Database Schema](./DATABASE_DESIGN_FINAL.md)

---

**Happy Testing! 🎉**

