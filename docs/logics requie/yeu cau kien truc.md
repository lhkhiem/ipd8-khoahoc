1. Logic xử lý: tách biệt hoàn toàn giữa cms và public website
 - CMS: xử lý tất cả các logic liên quan đến cms (trang admin quản trị)
 - Public website: xử lý tất cả các logic liên quan đến public website, tương tác người dùng.
2. luồng xử lý:
 - CMS backend <-> CMS frontend
 - Public backend <-> Public frontend
3. Cấu hình các biến môi trường : Tất cả các url site, thông tin database, api key, secret key, token, ... đều được gọi từ .env.local file, không được hardcode trong code.
4. Thư mục upload dùng chung cho cms và public website là shared-storage ở root project.
5. Database sử dụng PostgreSQL dùng chung cho cms và public website. Mỗi project có models riêng biệt, không ảnh hưởng tới nhau.
