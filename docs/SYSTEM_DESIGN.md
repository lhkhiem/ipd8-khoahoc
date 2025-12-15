# ĐỀ XUẤT CẤU TRÚC CMS VÀ THIẾT KẾ DATABASE - IPD8

## 1. SƠ ĐỒ NHÁNH CÁC CHỨC NĂNG QUẢN LÝ CMS

```
CMS QUẢN TRỊ IPD8
│
├── 📚 QUẢN LÝ KHÓA HỌC (Courses Management)
│   ├── Danh sách khóa học
│   │   ├── Tìm kiếm & Lọc (theo targetAudience, status, featured)
│   │   ├── Cấu hình Search
│   │   │   ├── Chọn trường được tìm (title, slug, description, category)
│   │   │   ├── Gợi ý tìm kiếm (suggested keywords)
│   │   │   ├── Ưu tiên kết quả (featured trước, khóa mới trước)
│   │   │   └── Giới hạn số kết quả / phân trang
│   │   ├── Sắp xếp (theo ngày, giá, tên)
│   │   └── Phân trang
│   ├── Tạo/Sửa khóa học
│   │   ├── Thông tin cơ bản (title, slug, description, targetAudience)
│   │   ├── Giá & Hình thức (price, priceType, mode)
│   │   ├── Media (thumbnailUrl, videoUrl)
│   │   ├── Trạng thái (status: draft/published, featured)
│   │   └── Gán giảng viên (instructorId)
│   ├── Quản lý Modules
│   │   ├── Thêm/Sửa/Xóa module
│   │   └── Sắp xếp thứ tự (order)
│   ├── Quản lý Sessions
│   │   ├── Tạo lịch học (startTime, endTime, capacity)
│   │   ├── Gán giảng viên cho session
│   │   ├── Quản lý trạng thái (scheduled/full/cancelled/done)
│   │   └── Theo dõi số lượng đăng ký
│   └── Quản lý Tài liệu (Materials)
│       ├── Upload tài liệu (PDF, video, image)
│       ├── Thiết lập quyền truy cập (public/private/enrolled)
│       └── Quản lý file storage
│   ├── Quản lý Gói sản phẩm & Combo (Course Packages)
│   │   ├── Quản lý loại gói
│   │   │   ├── Gói học thử (trial, 99K, miễn phí)
│   │   │   ├── Gói tháng (3/6/12/24 tháng)
│   │   │   ├── Gói đặc biệt / Combo (mẹ bầu, combo nhiều khóa)
│   │   │   └── Gói tùy chỉnh theo chiến dịch marketing
│   │   ├── Cấu hình gói
│   │   │   ├── Số buổi / thời lượng tổng
│   │   │   ├── Hình thức (group / one-on-one / hybrid)
│   │   │   ├── Liên kết khóa học / module / session
│   │   │   ├── Giá niêm yết, giá khuyến mãi, loại tiền tệ
│   │   │   └── Giới hạn số học viên / gói
│   │   ├── Hiển thị gói
│   │   │   ├── Gắn gói nổi bật (featuredPackages) trên trang chủ
│   │   │   ├── Sắp xếp thứ tự gói trên trang khóa học
│   │   │   ├── Gắn badge (Học thử, Ưu đãi, Phổ biến)
│   │   │   └── Cấu hình nội dung marketing cho từng gói (title, subtitle, bullets)
│   │   └── Theo dõi hiệu quả
│   │       ├── Tỷ lệ click từng gói
│   │       ├── Tỷ lệ đăng ký theo gói
│   │       └── Tỷ lệ chuyển đổi từ gói học thử sang gói chính
│
├── 👥 QUẢN LÝ NGƯỜI DÙNG (Users Management)
│   ├── Danh sách người dùng
│   │   ├── Lọc theo role (guest/student/instructor/admin)
│   │   ├── Tìm kiếm (email, name, phone)
│   │   └── Xem chi tiết
│   ├── Quản lý học viên (Students)
│   │   ├── Xem lịch sử đăng ký
│   │   ├── Xem tiến độ học tập
│   │   └── Quản lý gói học
│   ├── Xác thực & Tài khoản (Authentication & Accounts)
│   │   ├── Đăng ký tài khoản (register)
│   │   │   ├── Thu thập thông tin cơ bản (email, họ tên, phone)
│   │   │   ├── Xác minh email (verification link/code)
│   │   │   └── Áp dụng chính sách mật khẩu (độ dài, độ mạnh)
│   │   ├── Đăng nhập (login)
│   │   │   ├── Đăng nhập với email + mật khẩu
│   │   │   ├── Ghi nhớ đăng nhập (remember me)
│   │   │   └── Giới hạn số lần thử / rate limiting
│   │   ├── Quên mật khẩu / Reset mật khẩu
│   │   │   ├── Gửi email reset mật khẩu
│   │   │   ├── Token reset có hạn sử dụng
│   │   │   └── Nhật ký thay đổi mật khẩu
│   │   ├── Trạng thái tài khoản
│   │   │   ├── Kích hoạt / vô hiệu hóa tài khoản
│   │   │   ├── Khóa tạm thời sau nhiều lần đăng nhập thất bại
│   │   │   └── Đánh dấu tài khoản nghi ngờ (fraud / abuse)
│   │   └── Quản lý session
│   │       ├── Cấu hình thời gian hết hạn session
│   │       ├── Đăng xuất trên tất cả thiết bị
│   │       └── Nhật ký đăng nhập (thiết bị, IP, thời gian)
│   ├── Quản lý giảng viên (Instructors)
│   │   ├── Thêm/Sửa thông tin (title, credentials, bio)
│   │   ├── Gán khóa học
│   │   └── Xem lịch dạy
│   └── Quản lý Admin & Quyền truy cập
│       ├── Tạo/Sửa/Xóa tài khoản admin
│       ├── Phân quyền theo role (viewer/editor/admin/superadmin)
│       ├── Phân quyền theo module (courses, content, payments, reports, system settings)
│       └── Nhật ký hoạt động (audit log: đăng nhập, chỉnh sửa dữ liệu, thao tác quan trọng)
│
├── 📝 QUẢN LÝ NỘI DUNG (Content Management)
│   ├── Bài viết (Posts)
│   │   ├── Tin tức (NEWS)
│   │   │   ├── Tạo/Sửa/Xóa bài viết
│   │   │   ├── Upload ảnh đại diện
│   │   │   ├── Editor nội dung (rich text)
│   │   │   ├── SEO (slug, meta description)
│   │   │   └── Lên lịch xuất bản (publishedAt)
│   │   ├── Sự kiện (EVENT)
│   │   │   ├── Thông tin sự kiện (eventDate, location)
│   │   │   ├── Quản lý đăng ký tham gia
│   │   │   └── Gửi thông báo
│   │   ├── Blog (BLOG)
│   │   │   ├── Phân loại theo chủ đề
│   │   │   └── Gán tác giả (expert/instructor)
│   │   ├── FAQ
│   │   │   ├── Phân loại theo category
│   │   │   └── Sắp xếp thứ tự
│   │   └── Chính sách (POLICY)
│   │       └── Quản lý version
│   ├── Chuyên gia (Experts)
│   │   ├── Thêm/Sửa/Xóa chuyên gia
│   │   ├── Upload ảnh đại diện
│   │   ├── Quản lý credentials & achievements
│   │   └── Gán bài viết
│   ├── Góc chuyên gia (Expert Perspective)
│   │   └── Quản lý bài viết từ chuyên gia
│   ├── Danh mục & Tags (Categories & Tags)
│   │   ├── Quản lý Categories
│   │   │   ├── Tạo/Sửa/Xóa category
│   │   │   ├── Gán icon cho category
│   │   │   └── Sắp xếp thứ tự
│   │   └── Quản lý Tags
│   │       ├── Tạo/Sửa/Xóa tag
│   │       └── Gán tag cho bài viết
│   ├── Trang chủ (Homepage Content)
│   │   ├── Hero Section
│   │   │   ├── Tiêu đề chính (title, subtitle)
│   │   │   ├── Background image/video
│   │   │   └── CTA buttons
│   │   ├── Why Choose IPD8
│   │   │   ├── Tiêu đề & mô tả
│   │   │   ├── Upload ảnh
│   │   │   └── Nội dung văn bản
│   │   ├── Statistics/Numbers
│   │   │   ├── Quản lý các số liệu (10,000+ families, 50+ courses)
│   │   │   ├── Icon & mô tả
│   │   │   └── Sắp xếp thứ tự
│   │   ├── Featured Courses
│   │   │   └── Chọn khóa học nổi bật
│   │   ├── Featured Events
│   │   │   └── Chọn sự kiện nổi bật
│   │   ├── Testimonials
│   │   │   ├── Thêm/Sửa/Xóa testimonial
│   │   │   ├── Upload ảnh đại diện
│   │   │   ├── Tên, role, nội dung
│   │   │   └── Sắp xếp thứ tự
│   │   └── Final CTA Section
│   │       ├── Tiêu đề & mô tả
│   │       └── CTA buttons
│   ├── Trang Giới thiệu (About Page Content)
│   │   ├── Hero Section
│   │   │   ├── Tiêu đề & mô tả
│   │   │   └── Background image
│   │   └── About Sections
│   │       ├── Thêm/Sửa/Xóa section
│   │       ├── Upload ảnh (image, imageAlt)
│   │       ├── Tiêu đề & mô tả
│   │       ├── Quản lý bullet points
│   │       ├── Thiết lập layout (reverse/not reverse)
│   │       └── Sắp xếp thứ tự
│   ├── Trang Liên hệ (Contact Page Content)
│   │   ├── Hero Section
│   │   │   ├── Tiêu đề & mô tả
│   │   │   └── Background image
│   │   ├── Thông tin liên hệ
│   │   │   ├── Địa chỉ (address)
│   │   │   ├── Điện thoại (phone, hotline)
│   │   │   ├── Email (contact, support)
│   │   │   └── Giờ làm việc (working hours)
│   │   ├── Google Maps
│   │   │   └── Embed URL (sanitized)
│   │   └── CTA Section
│   │       ├── Tiêu đề & mô tả
│   │       └── CTA buttons
│   ├── Menu & Navigation
│   │   ├── Main Navigation
│   │   │   ├── Thêm/Sửa/Xóa menu item
│   │   │   ├── Thiết lập href/link
│   │   │   ├── Thiết lập dropdown (hasDropdown)
│   │   │   └── Sắp xếp thứ tự
│   │   └── Sub Menu
│   │       ├── Thêm/Sửa/Xóa sub menu item
│   │       ├── Gán vào menu cha
│   │       └── Sắp xếp thứ tự
│   ├── Footer Content
│   │   ├── Company Info
│   │   │   ├── Logo
│   │   │   ├── Mô tả công ty
│   │   │   └── Social media links
│   │   ├── Footer Links
│   │   │   ├── About Us links
│   │   │   ├── Courses links
│   │   │   └── Support links
│   │   ├── Contact Info
│   │   │   ├── Địa chỉ
│   │   │   ├── Điện thoại
│   │   │   └── Email
│   │   └── Bottom Bar
│   │       ├── Copyright text
│   │       └── Policy links
│   └── Media Library
│       ├── Upload media (images, videos)
│       ├── Quản lý file storage
│       ├── Tìm kiếm & lọc
│       ├── Xem trước & metadata
│       └── Xóa & tổ chức thư mục
│
├── 📅 QUẢN LÝ LỊCH HỌC (Schedule Management)
│   ├── Lịch tổng quan
│   │   ├── Xem theo tháng/tuần/ngày
│   │   ├── Lọc theo khóa học
│   │   └── Lọc theo giảng viên
│   ├── Tạo lịch học
│   │   ├── Chọn khóa học
│   │   ├── Chọn giảng viên
│   │   ├── Thiết lập thời gian (startTime, endTime)
│   │   ├── Thiết lập địa điểm (location)
│   │   └── Thiết lập sức chứa (capacity)
│   ├── Quản lý đăng ký
│   │   ├── Xem danh sách đăng ký
│   │   ├── Chấp nhận/Từ chối đăng ký
│   │   └── Gửi thông báo
│   └── Thống kê
│       ├── Tỷ lệ lấp đầy lớp
│       └── Lịch sử buổi học
│
├── 💰 QUẢN LÝ THANH TOÁN (Payment Management)
│   ├── Đơn hàng (Orders)
│   │   ├── Danh sách đơn hàng
│   │   │   ├── Lọc theo trạng thái (created/paid/failed/refunded)
│   │   │   ├── Tìm kiếm theo mã đơn
│   │   │   └── Xem chi tiết
│   │   ├── Xử lý hoàn tiền
│   │   └── Export báo cáo
│   ├── Thanh toán (Payments)
│   │   ├── Theo dõi giao dịch
│   │   ├── Đồng bộ với ZaloPay
│   │   └── Xử lý lỗi thanh toán
│   └── Báo cáo tài chính
│       ├── Doanh thu theo tháng
│       ├── Top khóa học bán chạy
│       └── Thống kê theo gói học
│
├── 📊 QUẢN LÝ ĐĂNG KÝ (Enrollment Management)
│   ├── Danh sách đăng ký
│   │   ├── Lọc theo trạng thái (pending/active/cancelled/completed)
│   │   ├── Lọc theo khóa học
│   │   └── Tìm kiếm học viên
│   ├── Xử lý đăng ký
│   │   ├── Kích hoạt gói học
│   │   ├── Gia hạn gói học
│   │   └── Hủy đăng ký
│   ├── Quản lý Funnel gói học thử (Trial Funnel)
│   │   ├── Cấu hình gói học thử
│   │   │   ├── Loại gói (miễn phí / 99K / ưu đãi khác)
│   │   │   ├── Số buổi, thời lượng mỗi buổi
│   │   │   ├── Lịch học thử khả dụng (mapping sang sessions)
│   │   │   └── Giới hạn số slot / buổi
│   │   ├── Booking & Lịch học thử
│   │   │   ├── Xem danh sách đăng ký gói thử
│   │   │   ├── Xác nhận / từ chối / đổi lịch học thử
│   │   │   └── Gửi email / thông báo nhắc lịch
│   │   └── Chuyển đổi sau học thử
│   │       ├── Đánh dấu trạng thái: đã tư vấn / đang cân nhắc / đã mua gói chính
│   │       ├── Gợi ý gói chính phù hợp (recommendation)
│   │       └── Thống kê tỷ lệ chuyển đổi theo kênh & gói
│   ├── Theo dõi tiến độ
│   │   ├── Xem progress của học viên
│   │   └── Ghi nhận feedback
│   └── Thống kê
│       ├── Số lượng đăng ký theo khóa học
│       └── Tỷ lệ hoàn thành
│
├── 👤 CỔNG HỌC VIÊN (Student Portal)
│   ├── Hồ sơ cá nhân (Profile)
│   │   ├── Thông tin cơ bản (họ tên, ngày sinh, giới tính)
│   │   ├── Thông tin liên hệ (email, phone, địa chỉ)
│   │   ├── Thông tin con (hoặc nhiều bé: tên, tuổi, giai đoạn phát triển)
│   │   ├── Ảnh đại diện
│   │   └── Thiết lập bảo mật tài khoản (mật khẩu, 2FA nếu có)
│   ├── Gói học của tôi (My Packages)
│   │   ├── Danh sách gói học đã mua
│   │   ├── Trạng thái gói (chưa bắt đầu / đang học / tạm dừng / hoàn thành)
│   │   ├── Thời hạn gói (ngày bắt đầu, ngày hết hạn)
│   │   └── Xem chi tiết từng gói (các khóa / buổi đi kèm)
│   ├── Lịch học cá nhân (My Schedule)
│   │   ├── Lịch tháng/tuần/ngày của riêng học viên
│   │   ├── Lọc theo khóa / gói học
│   │   ├── Xem chi tiết buổi học (giờ, giảng viên, phòng / meeting link)
│   │   └── Đăng ký / đổi lịch / xin nghỉ (theo chính sách)
│   ├── Tiến độ học tập (My Progress)
│   │   ├── Tiến độ theo khóa (số buổi đã tham gia / tổng số buổi)
│   │   ├── Mốc hoàn thành nội dung (modules / milestones)
│   │   ├── Ghi chú của giảng viên
│   │   └── Đánh giá sau mỗi buổi / khóa học
│   ├── Thanh toán & Lịch sử giao dịch
│   │   ├── Danh sách hóa đơn / đơn hàng đã thanh toán
│   │   ├── Trạng thái thanh toán (đang xử lý / thành công / thất bại / hoàn tiền)
│   │   ├── Tải hóa đơn / chứng từ
│   │   └── Liên kết tới trang nâng cấp / mua thêm gói
│   ├── Trung tâm thông báo (Notifications Center)
│   │   ├── Thông báo lịch học (buổi mới / đổi lịch / hủy buổi)
│   │   ├── Thông báo thanh toán (thành công / thất bại / nhắc thanh toán)
│   │   ├── Thông báo từ giảng viên (ghi chú, dặn dò)
│   │   └── Cài đặt nhận thông báo (email, SMS, in-app)
│   └── Hỗ trợ & Liên hệ (Support)
│       ├── Gửi yêu cầu hỗ trợ (ticket)
│       ├── Chọn loại yêu cầu (kỹ thuật, nội dung học, thanh toán, lịch học)
│       ├── Theo dõi trạng thái xử lý
│       └── Lịch sử trao đổi với bộ phận hỗ trợ
│
├── 📧 QUẢN LÝ LIÊN HỆ (Contact Management)
│   ├── Form liên hệ (Website Contact Form)
│   │   ├── Xem danh sách yêu cầu
│   │   ├── Phân loại (tư vấn, đăng ký, phản hồi)
│   │   ├── Trả lời email trực tiếp từ hệ thống
│   │   ├── Gắn nhãn (tag) theo chủ đề / nguồn (website, fanpage, landing page)
│   │   └── Đánh dấu đã xử lý / đang xử lý / cần follow-up
│   ├── Ticket hỗ trợ (Support Tickets)
│   │   ├── Tạo ticket từ form liên hệ hoặc từ Cổng học viên
│   │   ├── Gán ticket cho nhân viên phụ trách
│   │   ├── Thiết lập mức ưu tiên (thấp / trung bình / cao / khẩn)
│   │   ├── Thiết lập SLA xử lý theo loại yêu cầu
│   │   ├── Lưu lịch sử trao đổi (comment, internal note)
│   │   └── Gắn kết ticket với user, đơn hàng, hoặc khóa học liên quan
│   └── Thống kê
│       ├── Số lượng yêu cầu theo tháng
│       ├── Thời gian xử lý trung bình theo loại yêu cầu
│       └── Tỷ lệ hài lòng (dựa trên survey sau hỗ trợ)
│
├── 🔔 QUẢN LÝ THÔNG BÁO (Notification Management)
│   ├── Kênh thông báo (Channels)
│   │   ├── In-app (bell icon / dropdown trên navbar)
│   │   ├── Email
│   │   └── SMS (tùy chọn, theo cấu hình nhà cung cấp)
│   ├── Tạo thông báo
│   │   ├── Gửi cho tất cả người dùng
│   │   ├── Gửi cho nhóm người dùng
│   │   └── Gửi cho người dùng cụ thể
│   ├── Template thông báo
│   │   ├── Thông báo đăng ký thành công
│   │   ├── Thông báo lịch học
│   │   └── Thông báo thanh toán
│   ├── Quản lý phân phối & trạng thái
│   │   ├── Theo dõi trạng thái gửi (thành công / lỗi)
│   │   ├── Đánh dấu đã đọc / chưa đọc (in-app)
│   │   ├── Thống kê open/click (đối với email)
│   │   └── Retry tự động khi gửi lỗi (có giới hạn số lần)
│   └── Lịch sử gửi
│
├── ⚙️ CÀI ĐẶT HỆ THỐNG (System Settings)
│   ├── Cấu hình thương hiệu (Branding)
│   │   ├── Logo, favicon
│   │   ├── Màu chủ đạo, font chữ
│   │   └── Slogan, SITE_NAME, meta description mặc định
│   ├── Cấu hình chung
│   │   ├── Thông tin liên hệ (phone, email, address)
│   │   ├── Social media links
│   │   └── Google Maps embed
│   ├── Quản lý media
│   │   ├── Upload ảnh/video
│   │   ├── Quản lý storage
│   │   └── CDN configuration
│   ├── SEO Settings
│   │   ├── Meta tags
│   │   └── Sitemap
│   ├── Cấu hình bảo mật (Security & Compliance)
│   │   ├── Cấu hình security headers & CSP
│   │   ├── Danh sách domain được phép cho iframe, window.open, API
│   │   ├── Cấu hình xác thực (JWT/session, cookie httpOnly, timeout)
│   │   ├── Chính sách lưu log (ẩn/mask dữ liệu nhạy cảm)
│   │   └── Cấu hình rate limiting (login, form liên hệ, booking)
│   └── Backup & Restore
│
└── 📈 BÁO CÁO & THỐNG KÊ (Reports & Analytics)
    ├── Dashboard tổng quan
    │   ├── Số lượng học viên
    │   ├── Doanh thu
    │   ├── Số khóa học
    │   ├── Tỷ lệ hoàn thành
    │   ├── Tỷ lệ lấp đầy lớp theo tháng
    │   └── Tỷ lệ chuyển đổi gói học thử → gói chính
    ├── Báo cáo chi tiết
    │   ├── Báo cáo khóa học
    │   │   ├── Đăng ký theo khóa / gói
    │   │   ├── Tỷ lệ hoàn thành theo khóa
    │   │   └── Feedback / rating theo khóa
    │   ├── Báo cáo tài chính
    │   │   ├── Doanh thu theo nguồn (website, phễu trial, đối tác)
    │   │   ├── Doanh thu theo gói & theo kỳ (tháng/quý/năm)
    │   │   └── Tỷ lệ hoàn tiền / hủy đăng ký
    │   ├── Báo cáo người dùng
    │   │   ├── Phân bố user theo role, giai đoạn bé, khu vực
    │   │   ├── Mức độ hoạt động (chăm chỉ / không hoạt động)
    │   │   └── Hành vi sử dụng Cổng học viên (đăng nhập, xem bài, hoàn thành bài)
    │   └── Báo cáo Funnel & Marketing
    │       ├── Funnel gói học thử (view → đăng ký trial → mua gói chính)
    │       ├── Hiệu quả từng gói sản phẩm / combo
    │       └── Hiệu quả theo kênh marketing (SEO, social, referral)
    └── Export dữ liệu
```
