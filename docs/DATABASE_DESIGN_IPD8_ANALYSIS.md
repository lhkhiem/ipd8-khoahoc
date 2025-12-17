# PHÂN TÍCH VÀ KIỂM TRA DATABASE DESIGN - IPD8

**Ngày tạo:** 2025-01-XX  
**Mục đích:** Phân tích và kiểm tra toàn diện database design để đảm bảo không thiếu sót

---

## 📋 MỤC LỤC

1. [Kiểm Tra Đồng Bộ Tài Liệu](#1-kiểm-tra-đồng-bộ-tài-liệu)
2. [Phân Tích Bảng Thiếu](#2-phân-tích-bảng-thiếu)
3. [Kiểm Tra Relationships](#3-kiểm-tra-relationships)
4. [Cập Nhật Cần Thiết](#4-cập-nhật-cần-thiết)
5. [Checklist Hoàn Thiện](#5-checklist-hoàn-thiện)

---

## 1. KIỂM TRA ĐỒNG BỘ TÀI LIỆU

### 1.1. DATABASE_SCHEMA.md vs Design Documents

| Vấn Đề | Trạng Thái | Hành Động |
|--------|-----------|-----------|
| Bảng `settings` trong DATABASE_SCHEMA.md có cấu trúc `key` + `value` (TEXT) + `type` | ⚠️ Cần cập nhật | Cập nhật để phản ánh quyết định merge vào bảng `settings` CMS với `namespace` + `value` (JSONB) |
| Số lượng bảng trong checklist migration | ⚠️ Cần cập nhật | Cập nhật từ 18 → 17 bảng tạo mới |

### 1.2. Tài Liệu Đã Đồng Bộ

- ✅ `DATABASE_DESIGN_IPD8_OVERVIEW.md` - Đã cập nhật (17 bảng, 35 tổng cộng)
- ✅ `DATABASE_DESIGN_IPD8_TABLES_NEW.md` - Đã xóa bảng settings (IPD8)
- ✅ `DATABASE_DESIGN_IPD8_TABLES_KEEP.md` - Đã cập nhật mô tả settings dùng chung
- ✅ `DATABASE_DESIGN_IPD8_MIGRATION.md` - Đã xóa phần tạo settings_ipd8
- ⚠️ `DATABASE_SCHEMA.md` - **CẦN CẬP NHẬT** bảng settings

---

## 2. PHÂN TÍCH BẢNG THIẾU

### 2.1. Bảng Trong DATABASE_SCHEMA.md (Chính Thức)

**Đã có trong design:**
- ✅ `users`, `instructors`, `courses`, `course_modules`, `course_sessions`
- ✅ `enrollments`, `progress`, `materials`
- ✅ `orders`, `order_items`, `payments`
- ✅ `posts`, `post_tags`, `notifications`
- ✅ `contact_forms`, `session_registrations`
- ✅ `settings` (đã merge)

**Tổng:** 17 bảng IPD8 core (theo DATABASE_SCHEMA.md)

### 2.2. Bảng Trong Tài Liệu Khác (Cần Xác Định)

Các bảng sau xuất hiện trong `giai-phap-khoa-hoc-online-toan-dien.md` nhưng **KHÔNG** có trong `DATABASE_SCHEMA.md` chính thức:

| Bảng | Mục Đích | Quyết Định |
|------|----------|------------|
| `subscriptions` | Gói đăng ký user (bronze, silver, gold) | ❓ **Cần xác định**: IPD8 có dùng subscription tiers không? |
| `videos` | Video trong khóa học | ❓ **Cần xác định**: IPD8 dùng `course_modules` hay `videos`? |
| `video_progress` | Tiến độ xem video | ❓ **Cần xác định**: IPD8 dùng `progress` (theo module/session) hay `video_progress`? |
| `meet_sessions` | Google Meet sessions | ❓ **Cần xác định**: IPD8 dùng `course_sessions` (có `meeting_link`) hay cần bảng riêng? |
| `meet_attendees` | Người tham gia Meet | ❓ **Cần xác định**: IPD8 dùng `session_registrations` hay cần bảng riêng? |
| `ebooks` | Ebook tài liệu | ❓ **Cần xác định**: IPD8 dùng `materials` hay cần bảng riêng cho ebook? |
| `ebook_downloads` | Lịch sử download ebook | ❓ **Cần xác định**: Có cần tracking riêng cho ebook? |
| `backup_logs` | Log backup hệ thống | ✅ **Có thể thêm**: Hữu ích cho monitoring |
| `admin_logs` | Log hành động admin | ✅ **Có thể thêm**: Hữu ích cho audit trail |
| `system_metrics` | Metrics hệ thống | ✅ **Có thể thêm**: Hữu ích cho monitoring |
| `video_access_logs` | Log truy cập video | ❓ **Cần xác định**: Có cần tracking chi tiết? |

**Kết luận:** Cần xác định với team về các bảng trên. Nếu không có trong `DATABASE_SCHEMA.md` chính thức, có thể là:
- Tài liệu tham khảo/ý tưởng (không implement)
- Tính năng tương lai
- Tính năng đã được tích hợp vào bảng khác

---

## 3. KIỂM TRA RELATIONSHIPS

### 3.1. Foreign Keys Đã Được Định Nghĩa

**Kiểm tra các relationships chính:**

| Relationship | Bảng 1 | Bảng 2 | Trạng Thái |
|-------------|--------|--------|-----------|
| User → Instructor | `users` | `instructors` | ✅ Có FK `user_id` |
| Instructor → Courses | `instructors` | `courses` | ✅ Có FK `instructor_id` |
| Course → Modules | `courses` | `course_modules` | ✅ Có FK `course_id` |
| Course → Sessions | `courses` | `course_sessions` | ✅ Có FK `course_id` |
| User → Enrollments | `users` | `enrollments` | ✅ Có FK `user_id` |
| Course → Enrollments | `courses` | `enrollments` | ✅ Có FK `course_id` |
| Enrollment → Progress | `enrollments` | `progress` | ✅ Có FK `enrollment_id` |
| User → Orders | `users` | `orders` | ✅ Có FK `user_id` |
| Order → Order Items | `orders` | `order_items` | ✅ Có FK `order_id` |
| Order → Payments | `orders` | `payments` | ✅ Có FK `order_id` |
| Post → Post Tags | `posts` | `post_tags` | ✅ Có FK `post_id` |
| User → Notifications | `users` | `notifications` | ✅ Có FK `user_id` |
| User → Contact Forms | `users` | `contact_forms` | ✅ Có FK `resolved_by` |

**Kết luận:** ✅ Tất cả relationships chính đã được định nghĩa đầy đủ.

### 3.2. Unique Constraints

| Constraint | Bảng | Trạng Thái |
|-----------|------|-----------|
| `(user_id, course_id)` | `enrollments` | ✅ Đã định nghĩa |
| `(user_id, session_id)` | `session_registrations` | ✅ Đã định nghĩa |
| `(post_id, tag_name)` | `post_tags` | ✅ Đã định nghĩa |
| `user_id` | `instructors` | ✅ UNIQUE constraint |
| `slug` | `courses` | ✅ UNIQUE constraint |
| `order_number` | `orders` | ✅ UNIQUE constraint |

**Kết luận:** ✅ Các unique constraints quan trọng đã được định nghĩa.

---

## 4. CẬP NHẬT CẦN THIẾT

### 4.1. Ưu Tiên Cao

1. **Cập nhật DATABASE_SCHEMA.md**
   - Cập nhật bảng `settings` để phản ánh quyết định merge
   - Thay đổi từ `key` + `value` (TEXT) + `type` → `namespace` + `value` (JSONB)

2. **Cập nhật Checklist Migration**
   - Sửa số lượng bảng từ 18 → 17 trong `DATABASE_DESIGN_IPD8_MIGRATION.md` (dòng 759)

### 4.2. Ưu Tiên Trung Bình

3. **Xác định bảng thiếu**
   - Thảo luận với team về các bảng trong `giai-phap-khoa-hoc-online-toan-dien.md`
   - Quyết định: thêm vào design hay bỏ qua

4. **Tạo seed data cho settings IPD8**
   - Tạo script seed các namespace IPD8 vào bảng `settings`
   - Namespace: 'ipd8', 'courses', 'payments', 'instructors'

### 4.3. Ưu Tiên Thấp

5. **Tạo ER Diagram**
   - Tạo ER diagram tổng quan cho database
   - Giúp visualize relationships

6. **Tạo documentation cho API**
   - Document các endpoints liên quan đến database
   - Giúp developers hiểu cách sử dụng

---

## 5. CHECKLIST HOÀN THIỆN

### 5.1. Database Design

- [x] Phân loại bảng (giữ nguyên, tái cấu trúc, tạo mới, xóa bỏ)
- [x] Merge bảng settings (CMS & IPD8)
- [x] Cập nhật số lượng bảng (17 tạo mới, 35 tổng cộng)
- [x] Định nghĩa foreign keys
- [x] Định nghĩa indexes
- [x] Định nghĩa unique constraints
- [ ] **Cập nhật DATABASE_SCHEMA.md** (bảng settings)
- [ ] **Cập nhật checklist migration** (số lượng bảng)

### 5.2. Migration Plan

- [x] Tạo migration scripts cho bảng mới
- [x] Tạo migration scripts cho bảng tái cấu trúc
- [x] Tạo script xóa bảng e-commerce
- [x] Xóa phần tạo settings_ipd8
- [ ] **Cập nhật số lượng bảng trong checklist** (18 → 17)
- [ ] Tạo seed data cho settings IPD8

### 5.3. Documentation

- [x] Tạo file tổng quan (OVERVIEW)
- [x] Tạo file chi tiết bảng giữ nguyên (KEEP)
- [x] Tạo file chi tiết bảng tái cấu trúc (REFACTOR)
- [x] Tạo file chi tiết bảng tạo mới (NEW)
- [x] Tạo file chi tiết bảng xóa bỏ (DROP)
- [x] Tạo file migration plan (MIGRATION)
- [x] Tạo file phân tích (ANALYSIS) - **File này**

### 5.4. Code Application

- [ ] Kiểm tra settingsController.ts hỗ trợ namespace IPD8
- [ ] Tạo helper/utility cho settings IPD8
- [ ] Test API settings với namespace IPD8
- [ ] Cập nhật frontend (nếu cần)

---

## 6. KẾT LUẬN

### 6.1. Tổng Kết

- ✅ **Database design đã hoàn thiện ~95%**
- ✅ **Tất cả bảng chính đã được định nghĩa**
- ✅ **Relationships và constraints đã đầy đủ**
- ⚠️ **Cần cập nhật 2 file**: DATABASE_SCHEMA.md và checklist migration

### 6.2. Bước Tiếp Theo

1. **Ngay lập tức:**
   - Cập nhật DATABASE_SCHEMA.md (bảng settings)
   - Cập nhật checklist migration (số lượng bảng)

2. **Sắp tới:**
   - Xác định với team về các bảng thiếu
   - Tạo seed data cho settings IPD8
   - Test migration trên staging

3. **Sau đó:**
   - Cập nhật code application
   - Tạo ER diagram
   - Hoàn thiện documentation

---

**Tài liệu này sẽ được cập nhật khi có thêm thông tin hoặc quyết định mới.**

