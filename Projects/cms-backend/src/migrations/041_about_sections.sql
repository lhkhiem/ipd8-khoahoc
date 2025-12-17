-- About Sections table
-- Stores content for Welcome and Giving Back sections on the About page
CREATE TABLE IF NOT EXISTS about_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_key VARCHAR(50) UNIQUE NOT NULL, -- 'welcome' or 'giving_back'
    title TEXT,
    content TEXT, -- HTML content
    image_url VARCHAR(1024),
    button_text VARCHAR(255),
    button_link VARCHAR(1024),
    list_items JSONB, -- For Giving Back section list items
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on section_key for faster lookups
CREATE INDEX IF NOT EXISTS idx_about_sections_section_key ON about_sections(section_key);

-- Insert default data for welcome section
INSERT INTO about_sections (section_key, title, content, image_url, button_text, button_link, order_index, is_active)
VALUES (
    'welcome',
    'Chào mừng các chuyên gia Spa!',
    '<p>Bạn đang tìm hướng đi mới để nâng cấp dịch vụ hoặc mở rộng mô hình? Chúng tôi ở đây để đồng hành. Nếu bạn đã là khách hàng, mục tiêu của chúng tôi là giúp vận hành của bạn mượt mà hơn, chi phí tối ưu hơn và biên lợi nhuận mỗi liệu trình rõ ràng hơn – tất cả tập trung tại một nền tảng duy nhất.</p><p>Website Banyco được thiết kế như một "bảng điều khiển" dành cho chủ spa: mua sắm thiết bị nhanh gọn, truy cập tài nguyên marketing – vận hành, cập nhật tiêu chuẩn an toàn vệ sinh, và tham gia khoá học thực hành. Mỗi chuyên mục đều được biên tập từ kinh nghiệm triển khai thực tế tại các spa quy mô khác nhau.</p><p>Đừng quên lưu lại <a href="/" class="text-brand-purple-600 hover:underline">Banyco.vn</a> và ghé thăm thường xuyên. Để nắm bắt xu hướng liệu trình mới, công nghệ điều trị và chiến lược gia tăng doanh thu, hãy <a href="/learning" class="text-brand-purple-600 hover:underline">đăng ký nhận bản tin chuyên ngành</a> – chúng tôi chỉ gửi nội dung có chiều sâu, không spam.</p><p>Mục tiêu dài hạn: trở thành trung tâm tri thức & chuỗi cung ứng đáng tin cậy cho hệ sinh thái spa chuyên nghiệp tại Việt Nam và khu vực. Bạn vận hành tốt – chúng tôi thành công.</p>',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=400',
    'Tìm hiểu thêm',
    '#',
    1,
    true
)
ON CONFLICT (section_key) DO NOTHING;

-- Insert default data for giving_back section
INSERT INTO about_sections (section_key, title, content, image_url, list_items, order_index, is_active)
VALUES (
    'giving_back',
    'Giá trị cộng đồng',
    '<p>Thành công không chỉ là doanh thu – mà còn là tác động tích cực. Chúng tôi dành một phần nguồn lực hỗ trợ dự án chăm sóc sức khoẻ cộng đồng, đào tạo nghề cho lao động trẻ muốn bước vào ngành spa, và nâng cao tiêu chuẩn an toàn – vệ sinh tại các cơ sở nhỏ.</p><p>Mỗi năm đội ngũ chuyên viên tổ chức chuyến đi thực địa hỗ trợ tư vấn bố trí, bảo trì thiết bị tại các khu vực thiếu điều kiện. Chúng tôi cam kết tiếp tục mở rộng các chương trình chia sẻ kiến thức miễn phí – giúp ngành phát triển bền vững hơn.</p>',
    'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=400',
    '[
        {
            "title": "Chăm sóc cộng đồng",
            "description": "Quyên góp vật tư vệ sinh – chăm sóc cơ bản cho các trung tâm hỗ trợ phụ nữ và dự án chăm lo người vô gia cư địa phương."
        },
        {
            "title": "Giáo dục & Đào tạo",
            "description": "Phối hợp trường nghề và tổ chức phi lợi nhuận để cấp học bổng kỹ năng vận hành thiết bị spa, hỗ trợ khởi nghiệp mô hình nhỏ."
        }
    ]'::jsonb,
    2,
    true
)
ON CONFLICT (section_key) DO NOTHING;




