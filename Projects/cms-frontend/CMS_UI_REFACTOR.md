# CMS UI REFACTOR - IPD8

**Ngày cập nhật:** 2025-01-XX  
**Mục đích:** Chuẩn lại UI CMS theo SYSTEM_DESIGN.md và DATABASE_DESIGN

---

## ✅ ĐÃ HOÀN THÀNH

### 1. Cập nhật Sidebar Navigation
- ✅ Cập nhật menu theo SYSTEM_DESIGN.md với các nhóm chức năng IPD8:
  - Quản lý Khóa học (Courses, Instructors, Schedule)
  - Quản lý Người dùng (Users, Enrollments)
  - Quản lý Nội dung (Posts, Topics, Tags, FAQs)
  - Quản lý Thanh toán (Orders, Payments)
  - Quản lý Liên hệ (Contacts, Consultations, Newsletter)
  - Quản lý Thông báo (Notifications)
  - Media, Giao diện, SEO, Hệ thống

### 2. Tạo các Page mới cho IPD8
- ✅ `/dashboard/courses` - Quản lý khóa học
- ✅ `/dashboard/instructors` - Quản lý giảng viên
- ✅ `/dashboard/enrollments` - Quản lý đăng ký
- ✅ `/dashboard/orders` - Quản lý đơn hàng
- ✅ `/dashboard/payments` - Quản lý thanh toán
- ✅ `/dashboard/schedule` - Quản lý lịch học
- ✅ `/dashboard/notifications` - Quản lý thông báo

### 3. Cập nhật Dashboard
- ✅ Stats cards mới: Courses, Students, Instructors, Enrollments, Orders, Revenue, Posts
- ✅ Quick actions: Courses, Instructors, Enrollments, Schedule
- ✅ Recent activities với icons phù hợp IPD8

---

## 🚧 CHỨC NĂNG PHÁT TRIỂN SAU

### 1. Quản lý Khóa học (Courses)
- [ ] Tạo/Sửa khóa học chi tiết:
  - [ ] Form tạo khóa học với đầy đủ fields (title, slug, description, targetAudience, price, priceType, mode, status, featured, thumbnail, video, instructor)
  - [ ] Quản lý Modules (thêm/sửa/xóa, sắp xếp thứ tự)
  - [ ] Quản lý Sessions (tạo lịch học, gán giảng viên, quản lý trạng thái)
  - [ ] Quản lý Materials (upload tài liệu, thiết lập quyền truy cập)
  - [ ] Quản lý Course Packages (gói học thử, gói tháng, combo)
- [ ] Tìm kiếm & Lọc nâng cao:
  - [ ] Lọc theo targetAudience, status, featured
  - [ ] Cấu hình Search (chọn trường tìm, gợi ý keywords, ưu tiên kết quả)
  - [ ] Sắp xếp (theo ngày, giá, tên)
  - [ ] Phân trang

### 2. Quản lý Giảng viên (Instructors)
- [ ] Form tạo/sửa giảng viên:
  - [ ] Thông tin cơ bản (title, credentials, bio)
  - [ ] Upload ảnh đại diện
  - [ ] Quản lý specialties, achievements
  - [ ] Gán khóa học
  - [ ] Xem lịch dạy

### 3. Quản lý Lịch học (Schedule)
- [ ] Calendar view (tháng/tuần/ngày)
- [ ] Tạo lịch học:
  - [ ] Chọn khóa học, giảng viên
  - [ ] Thiết lập thời gian (startTime, endTime)
  - [ ] Thiết lập địa điểm (location)
  - [ ] Thiết lập sức chứa (capacity)
- [ ] Quản lý đăng ký:
  - [ ] Xem danh sách đăng ký
  - [ ] Chấp nhận/Từ chối đăng ký
  - [ ] Gửi thông báo
- [ ] Thống kê (tỷ lệ lấp đầy lớp, lịch sử buổi học)

### 4. Quản lý Đăng ký (Enrollments)
- [ ] Xử lý đăng ký:
  - [ ] Kích hoạt gói học
  - [ ] Gia hạn gói học
  - [ ] Hủy đăng ký
- [ ] Quản lý Funnel gói học thử:
  - [ ] Cấu hình gói học thử
  - [ ] Booking & Lịch học thử
  - [ ] Chuyển đổi sau học thử
- [ ] Theo dõi tiến độ:
  - [ ] Xem progress của học viên
  - [ ] Ghi nhận feedback

### 5. Quản lý Đơn hàng & Thanh toán
- [ ] Xem chi tiết đơn hàng:
  - [ ] Thông tin khách hàng
  - [ ] Chi tiết order items
  - [ ] Lịch sử thanh toán
- [ ] Xử lý hoàn tiền
- [ ] Export báo cáo
- [ ] Đồng bộ với ZaloPay

### 6. Quản lý Thông báo (Notifications)
- [ ] Tạo thông báo:
  - [ ] Gửi cho tất cả người dùng
  - [ ] Gửi cho nhóm người dùng
  - [ ] Gửi cho người dùng cụ thể
- [ ] Template thông báo:
  - [ ] Thông báo đăng ký thành công
  - [ ] Thông báo lịch học
  - [ ] Thông báo thanh toán
- [ ] Quản lý phân phối & trạng thái:
  - [ ] Theo dõi trạng thái gửi
  - [ ] Đánh dấu đã đọc/chưa đọc
  - [ ] Thống kê open/click

### 7. Quản lý Nội dung (Posts)
- [ ] Cập nhật Posts page với type:
  - [ ] NEWS (Tin tức)
  - [ ] EVENT (Sự kiện) - thêm eventDate, eventLocation
  - [ ] BLOG (Blog)
  - [ ] FAQ (Câu hỏi thường gặp)
  - [ ] POLICY (Chính sách)
- [ ] Form tạo/sửa bài viết:
  - [ ] Chọn type
  - [ ] Upload ảnh đại diện
  - [ ] Editor nội dung (rich text)
  - [ ] SEO (slug, meta description)
  - [ ] Lên lịch xuất bản (publishedAt)
  - [ ] Gán expert/instructor cho bài viết

### 8. Báo cáo & Thống kê
- [ ] Dashboard tổng quan:
  - [ ] Số lượng học viên
  - [ ] Doanh thu
  - [ ] Số khóa học
  - [ ] Tỷ lệ hoàn thành
  - [ ] Tỷ lệ lấp đầy lớp theo tháng
  - [ ] Tỷ lệ chuyển đổi gói học thử → gói chính
- [ ] Báo cáo chi tiết:
  - [ ] Báo cáo khóa học
  - [ ] Báo cáo tài chính
  - [ ] Báo cáo người dùng
  - [ ] Báo cáo Funnel & Marketing
- [ ] Export dữ liệu

---

## 📝 GHI CHÚ

### Các Page đã xóa/ẩn
- `products` - Không dùng cho IPD8 (dùng `courses` thay thế)
- `cart` - Không dùng cho IPD8 (không có giỏ hàng)
- `wishlist` - Không dùng cho IPD8
- `reviews` - Không dùng cho IPD8 (có thể thêm đánh giá courses sau)

### Cấu trúc Database
- Tất cả các page mới đã được tạo với cấu trúc cơ bản
- Cần implement API endpoints tương ứng trong `cms-backend`
- Models đã có sẵn trong database theo DATABASE_DESIGN

### Next Steps
1. Implement API endpoints cho các page mới
2. Tạo forms chi tiết cho create/edit
3. Implement các tính năng nâng cao (search, filter, pagination)
4. Thêm validation và error handling
5. Implement permissions và role-based access

---

**Xem thêm:**
- [SYSTEM_DESIGN.md](../../docs/SYSTEM_DESIGN.md)
- [DATABASE_DESIGN_IPD8_OVERVIEW.md](../../docs/DATABASE_DESIGN_IPD8_OVERVIEW.md)

















