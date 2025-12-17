-- Add differences and timeline sections to about_sections table
-- These sections use JSONB fields to store structured data

-- Insert differences section (Điều làm chúng tôi khác biệt)
INSERT INTO about_sections (section_key, title, content, order_index, is_active, list_items)
VALUES (
    'differences',
    'Điều làm chúng tôi khác biệt',
    'Mọi quyết định – từ chọn nhà sản xuất, tiêu chuẩn kiểm định, đến nội dung đào tạo – đều xoay quanh nhu cầu thực tế của chủ spa và kỹ thuật viên. Không hứa suông, chỉ tập trung mang lại hiệu quả vận hành đo lường được.',
    3,
    true,
    '[
        {
            "icon_type": "shield",
            "icon_color": "purple",
            "title": "Giải pháp trọn gói – không chỉ bán thiết bị",
            "description": "Từ khảo sát mặt bằng, bố trí quy trình dịch vụ, lập ngân sách thiết bị theo giai đoạn tăng trưởng, cho tới đào tạo sử dụng & bảo trì. Mỗi thiết bị đều gắn vào một mục tiêu tài chính / trải nghiệm khách hàng cụ thể, tránh \"mua thừa\" hoặc chọn sai công suất."
        },
        {
            "icon_type": "document",
            "icon_color": "green",
            "title": "Kiểm định & minh bạch thành phần",
            "description": "Mỗi sản phẩm skincare đều được đối chiếu thành phần: tính an toàn, nồng độ hoạt chất, chứng nhận (Cruelty-Free, Vegan, Organic). Từ \"thiên nhiên\" hay \"hữu cơ\" không phải khẩu hiệu marketing – chúng tôi yêu cầu tài liệu xác thực hoặc kết quả kiểm nghiệm của bên thứ ba."
        },
        {
            "icon_type": "book",
            "icon_color": "blue",
            "title": "Đào tạo chuẩn hoá & nâng cao",
            "description": "Chúng tôi xây dựng thư viện micro-learning (video ngắn quy trình), tài liệu SOP phòng trị liệu, workshop chuyên sâu (khai thác thiết bị đa chức năng, upsell dịch vụ). Mục tiêu: rút ngắn thời gian \"onboarding\" nhân sự mới và gia tăng tỷ lệ sử dụng tối ưu của thiết bị cao cấp."
        },
        {
            "icon_type": "users",
            "icon_color": "pink",
            "title": "Đội ngũ thực hành – không chỉ bán hàng",
            "description": "Chuyên viên của chúng tôi từng trực tiếp vận hành hoặc tư vấn tại các spa, thẩm mỹ viện. Họ hiểu rõ sự khác nhau giữa thông số \"trên giấy\" và hiệu quả thực tế. Bạn nhận được khuyến nghị dựa trên trải nghiệm sử dụng thật – không phải catalogue nhà sản xuất."
        }
    ]'::jsonb
)
ON CONFLICT (section_key) DO NOTHING;

-- Insert timeline section (Hành trình phát triển)
INSERT INTO about_sections (section_key, title, content, order_index, is_active, list_items)
VALUES (
    'timeline',
    'Hành trình phát triển',
    'Hơn 40 năm kinh nghiệm quốc tế trong chuỗi cung ứng & hỗ trợ vận hành spa – nay được bản địa hoá phù hợp thị trường Việt Nam.',
    4,
    true,
    '[
        {
            "year": "1982",
            "description": "Khởi nguồn từ một đơn vị cung ứng vật tư làm đẹp quy mô nhỏ tại Hoa Kỳ, tập trung vào sản phẩm móng & chăm sóc cơ bản – đặt nền tảng cho hệ thống phân phối chuyên biệt sau này."
        },
        {
            "year": "1992",
            "description": "Phát hành catalogue sản phẩm chuyên nghiệp đầu tiên: tiêu chuẩn hoá thông tin kỹ thuật, quy trình đặt hàng và hỗ trợ sau bán – tạo bước nhảy cho mở rộng quy mô."
        },
        {
            "year": "Hiện tại",
            "description": "Mạng lưới phục vụ hơn 84,000 chuyên gia spa tại nhiều quốc gia. Tại Việt Nam, chúng tôi tập trung vào: cung ứng thiết bị chuyên nghiệp, tối ưu hoá chi phí đầu tư, đào tạo thực tế & nâng chuẩn quy trình vận hành bền vững."
        }
    ]'::jsonb
)
ON CONFLICT (section_key) DO NOTHING;


