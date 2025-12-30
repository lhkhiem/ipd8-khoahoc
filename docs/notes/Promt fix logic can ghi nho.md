# Sử dụng env đúng cách
## Câu dùng chung
- “Hãy kiểm tra toàn bộ source, chỗ nào đang hard-code URL/domain/port thì sửa lại để lấy từ biến môi trường (process.env / NEXT_PUBLIC_...) cho đúng chuẩn kiến trúc.”
## Hoặc cụ thể hơn cho từng lần review:
- “Trong đoạn code này đang hard-code URL, hãy refactor lại để lấy URL từ biến môi trường thay vì ghi thẳng vào source.”
- “Review giúp mình tất cả các chỗ gọi API / cấu hình domain, đảm bảo không hard-code mà đều đi qua env.”
- “Áp dụng đúng rule: mọi URL giữa các service phải đọc từ env (frontend dùng NEXT_PUBLIC_*, backend dùng process.env.*). Nếu chỗ nào chưa đúng thì sửa lại.”
- Chỉ cần bạn nói một trong các câu trên, mình sẽ tự quét code, tìm hard-code URL/domain/port và đề xuất sửa lại dùng env theo đúng logic đã thống nhất.
# --------------------------------------------