# KẾ HOẠCH TRIỂN KHAI IPD8 - TỔNG QUAN

**Ngày tạo:** 2025-01-XX  
**Mục đích:** Tổng quan kế hoạch triển khai hệ thống IPD8 Learning Platform

---

## 📋 MỤC LỤC

1. [Tổng Quan Dự Án](#1-tổng-quan-dự-án)
2. [Các Phase Triển Khai](#2-các-phase-triển-khai)
3. [Timeline Ước Tính](#3-timeline-ước-tính)
4. [Tài Liệu Chi Tiết](#4-tài-liệu-chi-tiết)

---

## 1. TỔNG QUAN DỰ ÁN

### 1.1. Cấu Trúc Dự Án (4 Projects + Shared Storage)

**Projects:**
1. **CMS Backend** (`cms-backend/`) - API cho admin dashboard
2. **CMS Frontend** (`cms-frontend/`) - Admin dashboard UI
3. **Public Backend** (`public-backend/`) - API cho public website
4. **Public Frontend** (`public-frontend/`) - Public website UI

**Shared Resources:**
- **Database PostgreSQL** (`ipd8_db`) - Database dùng chung cho CMS và Public website
  - Cùng một database, cùng các bảng (35 bảng)
  - Connection pools riêng biệt cho mỗi backend
- **Shared Storage** (`shared-storage/`) - Thư mục upload dùng chung cho CMS và Public website
  - `shared-storage/uploads/` - Files đã upload
  - `shared-storage/temp/` - Files tạm thời

**Nguyên tắc:** 
- **Tách biệt hoàn toàn:** CMS và Public là 2 hệ thống độc lập, không giao nhau
- **Luồng xử lý:**
  - CMS Backend ↔ CMS Frontend (chỉ kết nối với nhau)
  - Public Backend ↔ Public Frontend (chỉ kết nối với nhau)
- **Database:** PostgreSQL dùng chung, nhưng **Models riêng biệt** - mỗi backend có models code riêng, không share
- **Environment Variables:** Tất cả URL, database, API keys, secrets đều từ `.env.local` (development) hoặc `.env.production` (production), **KHÔNG hardcode**
- **Shared Storage:** Ở root project (`shared-storage/`), dùng chung cho cả CMS và Public

### 1.2. Hiện Trạng

**Đã có:**
- ✅ Database design hoàn chỉnh (35 bảng)
- ✅ CMS Backend (Node.js/TypeScript) - cơ bản
- ✅ CMS Frontend (Next.js) - cơ bản
- ✅ Public Frontend (Next.js) - cơ bản
- ✅ Migration scripts đã chuẩn bị

**Cần làm:**
- 🔄 Database migration (từ CMS cũ → IPD8 schema)
- 🔄 CMS Backend API development (IPD8 admin modules)
- 🔄 **Public Backend API development** (IPD8 public modules) ⚠️
- 🔄 CMS Frontend development (quản lý IPD8)
- 🔄 Public Frontend integration (kết nối Public Backend API)
- 🔄 Testing & Deployment

### 1.3. Mục Tiêu

1. **Database:** Hoàn thành migration 35 bảng theo IPD8 schema
2. **CMS Backend:** Xây dựng đầy đủ API cho admin dashboard
3. **Public Backend:** Xây dựng đầy đủ API cho public website (tách biệt)
4. **CMS Frontend:** Dashboard quản lý đầy đủ chức năng IPD8
5. **Public Frontend:** Website tích hợp hoàn chỉnh với Public Backend
6. **Testing:** Đảm bảo chất lượng và ổn định

---

## 2. CÁC PHASE TRIỂN KHAI

### Phase 1: Database Migration
**Mục tiêu:** Migrate database từ CMS cũ sang IPD8 schema

**Công việc:**
- Backup database
- Tạo bảng mới (17 bảng)
- Tái cấu trúc bảng cũ (6 bảng)
- Xóa bảng e-commerce (20 bảng)
- Verify data integrity

**Xem chi tiết:** [IMPLEMENTATION_PLAN_PHASE1_DATABASE.md](./IMPLEMENTATION_PLAN_PHASE1_DATABASE.md)

---

### Phase 2A: CMS Backend API Development
**Mục tiêu:** Xây dựng đầy đủ API cho CMS admin dashboard

**Công việc:**
- Models & Migrations
- Controllers & Routes (admin)
- Services & Business Logic
- Authentication & Authorization (admin)
- API Documentation

**Xem chi tiết:** [IMPLEMENTATION_PLAN_PHASE2_BACKEND.md](./IMPLEMENTATION_PLAN_PHASE2_BACKEND.md)

---

### Phase 2B: Public Backend API Development
**Mục tiêu:** Xây dựng đầy đủ API cho public website (tách biệt với CMS Backend)

**Công việc:**
- Project setup (riêng biệt)
- Controllers & Routes (public)
- Services & Business Logic (có thể share với CMS)
- Authentication & Authorization (user-level)
- API Documentation

**Xem chi tiết:** [IMPLEMENTATION_PLAN_PHASE2B_PUBLIC_BACKEND.md](./IMPLEMENTATION_PLAN_PHASE2B_PUBLIC_BACKEND.md)

---

### Phase 3: CMS Frontend Development
**Mục tiêu:** Dashboard quản lý IPD8 đầy đủ chức năng

**Công việc:**
- Quản lý khóa học (Courses)
- Quản lý giảng viên (Instructors)
- Quản lý đăng ký (Enrollments)
- Quản lý thanh toán (Payments)
- Quản lý nội dung (Posts, Content)
- Báo cáo & Thống kê

**Xem chi tiết:** [IMPLEMENTATION_PLAN_PHASE3_CMS.md](./IMPLEMENTATION_PLAN_PHASE3_CMS.md)

---

### Phase 4: Public Frontend Integration
**Mục tiêu:** Tích hợp website với Public Backend API

**Công việc:**
- Kết nối Public Backend API endpoints
- Authentication flow (user-level)
- Course booking & enrollment
- Payment integration
- User dashboard
- Testing & optimization

**Xem chi tiết:** [IMPLEMENTATION_PLAN_PHASE4_PUBLIC.md](./IMPLEMENTATION_PLAN_PHASE4_PUBLIC.md)

---

### Phase 5: Testing & Deployment
**Mục tiêu:** Đảm bảo chất lượng và triển khai production

**Công việc:**
- Unit testing
- Integration testing
- E2E testing
- Performance testing
- Security audit
- Deployment setup
- Monitoring & logging

**Xem chi tiết:** [IMPLEMENTATION_PLAN_PHASE5_TESTING.md](./IMPLEMENTATION_PLAN_PHASE5_TESTING.md)

---

## 3. TIMELINE ƯỚC TÍNH

| Phase | Thời Gian | Phụ Thuộc | Security Tasks |
|-------|-----------|-----------|----------------|
| **Phase 1: Database** | 1-2 tuần | - | - |
| **Phase 2A: CMS Backend** | 3-4 tuần | Phase 1 | Security setup (Tuần 1-2) 🔴 CRITICAL |
| **Phase 2B: Public Backend** | 2-3 tuần | Phase 1 (có thể song song với 2A) | Security setup (Tuần 1-2) 🔴 CRITICAL |
| **Phase 3: CMS Frontend** | 3-4 tuần | Phase 2A | - |
| **Phase 4: Public Frontend** | 2-3 tuần | Phase 2B | - |
| **Phase 5: Testing & Deploy** | 1-2 tuần | Phase 3, 4 | Security audit & testing 🔴 CRITICAL |
| **TỔNG CỘNG** | **11-18 tuần** | - | - |

**Lưu ý:** Phase 2A và 2B có thể làm song song vì tách biệt hoàn toàn.

**Lưu ý:** Timeline có thể thay đổi tùy theo:
- Số lượng developer
- Độ phức tạp thực tế
- Yêu cầu thay đổi trong quá trình phát triển

---

## 4. TÀI LIỆU CHI TIẾT

### 4.1. Database Design
- [DATABASE_DESIGN_IPD8_OVERVIEW.md](./DATABASE_DESIGN_IPD8_OVERVIEW.md)
- [DATABASE_DESIGN_IPD8_MIGRATION.md](./DATABASE_DESIGN_IPD8_MIGRATION.md)
- [DATABASE_DESIGN_IPD8_TABLES_NEW.md](./DATABASE_DESIGN_IPD8_TABLES_NEW.md)
- [DATABASE_DESIGN_IPD8_TABLES_REFACTOR.md](./DATABASE_DESIGN_IPD8_TABLES_REFACTOR.md)
- [DATABASE_DESIGN_IPD8_TABLES_KEEP.md](./DATABASE_DESIGN_IPD8_TABLES_KEEP.md)

### 4.2. System Design
- [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md)
- [giai-phap-chuc-nang-cms-ipd8.md](./giai-phap-chuc-nang-cms-ipd8.md)

### 4.3. Implementation Plans
- [IMPLEMENTATION_PLAN_PHASE1_DATABASE.md](./IMPLEMENTATION_PLAN_PHASE1_DATABASE.md)
- [IMPLEMENTATION_PLAN_PHASE2_BACKEND.md](./IMPLEMENTATION_PLAN_PHASE2_BACKEND.md) - CMS Backend
- [IMPLEMENTATION_PLAN_PHASE2B_PUBLIC_BACKEND.md](./IMPLEMENTATION_PLAN_PHASE2B_PUBLIC_BACKEND.md) - Public Backend
- [IMPLEMENTATION_PLAN_PHASE3_CMS.md](./IMPLEMENTATION_PLAN_PHASE3_CMS.md)
- [IMPLEMENTATION_PLAN_PHASE4_PUBLIC.md](./IMPLEMENTATION_PLAN_PHASE4_PUBLIC.md)
- [IMPLEMENTATION_PLAN_PHASE5_TESTING.md](./IMPLEMENTATION_PLAN_PHASE5_TESTING.md)

### 4.4. Database Architecture
- [DATABASE_ARCHITECTURE_GUIDE.md](./DATABASE_ARCHITECTURE_GUIDE.md) - Kiến trúc database (dùng chung, models riêng)

### 4.5. Shared Storage Guide
- [SHARED_STORAGE_GUIDE.md](./SHARED_STORAGE_GUIDE.md) - Hướng dẫn sử dụng shared-storage

### 4.6. Environment Variables Guide
- [ENVIRONMENT_VARIABLES_GUIDE.md](./ENVIRONMENT_VARIABLES_GUIDE.md) - Hướng dẫn sử dụng environment variables (KHÔNG hardcode)

### 4.7. Security Documentation
- [SECURITY_AUDIT_REPORT.md](./SECURITY_AUDIT_REPORT.md) - Báo cáo đánh giá bảo mật và các vấn đề cần khắc phục
- [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md) - Security checklist trước khi deploy production

---

## 5. QUY TẮC LÀM VIỆC

### 5.1. Git Workflow
- **Main branch:** `main` (production-ready)
- **Development branch:** `develop` (integration)
- **Feature branches:** `feature/phase-X-task-name`
- **Hotfix branches:** `hotfix/issue-name`

### 5.2. Code Review
- Tất cả code phải được review trước khi merge
- Minimum 1 reviewer approval
- CI/CD checks phải pass

### 5.3. Documentation
- Update documentation khi có thay đổi
- Comment code phức tạp
- Update API docs khi thêm/sửa endpoint

### 5.4. Testing
- Unit tests cho business logic
- Integration tests cho API endpoints
- E2E tests cho critical flows
- **Security testing** - Phải pass trước khi deploy (xem SECURITY_CHECKLIST.md)

---

## 6. RISK MANAGEMENT

### 6.1. Rủi Ro Tiềm Ẩn

| Rủi Ro | Tác Động | Giảm Thiểu |
|--------|----------|------------|
| Database migration lỗi | Cao | Backup đầy đủ, test trên staging |
| API performance issues | Trung bình | Load testing, optimization |
| Frontend-Backend không khớp | Trung bình | API contract, testing |
| Timeline delay | Trung bình | Buffer time, priority tasks |

### 6.2. Contingency Plan
- Backup plans cho mỗi phase
- Rollback procedures
- Communication plan với stakeholders

---

## TÓM TẮT

Kế hoạch triển khai được chia thành **5 phases** chính (với 2 backend riêng biệt):
1. **Database Migration** (1-2 tuần)
2. **CMS Backend API** (3-4 tuần) - Admin dashboard API
3. **Public Backend API** (2-3 tuần) - Public website API (tách biệt)
4. **CMS Frontend** (3-4 tuần) - Admin dashboard UI
5. **Public Frontend** (2-3 tuần) - Public website UI
6. **Testing & Deployment** (1-2 tuần)

**Tổng thời gian ước tính:** 11-18 tuần (có thể rút ngắn nếu làm song song Phase 2A và 2B)

**4 Projects:**
- `cms-backend/` - CMS Backend API (models riêng biệt)
- `cms-frontend/` - CMS Frontend UI
- `public-backend/` - Public Backend API (models riêng biệt)
- `public-frontend/` - Public Frontend UI

**Shared Resources:**
- **Database:** PostgreSQL `ipd8_db` dùng chung (35 bảng)
- **Storage:** `shared-storage/` ở root project

**Lưu ý quan trọng:**
- Database dùng chung nhưng **models code riêng biệt** - mỗi backend có models riêng, không share code
- Connection pools riêng biệt cho mỗi backend

Xem các file chi tiết cho từng phase để biết checklist và hướng dẫn cụ thể.

