'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Breadcrumb } from '@/components/shared/breadcrumb'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ROUTES } from '@/lib/constants'
import { Calendar, Clock, User, ArrowRight, Share2, Facebook, Twitter, Linkedin, Copy, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'

// Mock posts data with detailed content
const allPosts = [
  {
    id: 1,
    title: 'Tầm quan trọng của 1.000 ngày đầu đời trong sự phát triển của trẻ',
    excerpt: '1.000 ngày đầu đời là giai đoạn vàng quyết định sự phát triển toàn diện của trẻ. Nghiên cứu khoa học đã chứng minh rằng những gì xảy ra trong giai đoạn này sẽ ảnh hưởng đến sức khỏe, trí tuệ và tương lai của trẻ...',
    author: 'TS. Nguyễn Thị Lan',
    authorRole: 'Chuyên gia Nhi khoa',
    authorImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&h=600&fit=crop',
    category: 'Nhi khoa',
    date: '2025-12-15',
    readTime: '5 phút',
    tags: ['Phát triển trẻ em', '1.000 ngày đầu đời', 'Sức khỏe'],
    slug: 'tam-quan-trong-1000-ngay-dau-doi',
    content: `
      <p>Là một bác sĩ nhi khoa với hơn 20 năm kinh nghiệm, tôi muốn chia sẻ với các phụ huynh về tầm quan trọng đặc biệt của 1.000 ngày đầu đời - từ khi người mẹ mang thai đến khi trẻ tròn 2 tuổi. Đây là giai đoạn vàng quyết định phần lớn sự phát triển sau này của trẻ.</p>
      
      <h2>1.000 ngày đầu đời là gì?</h2>
      <p>1.000 ngày đầu đời được tính từ ngày đầu tiên của thai kỳ (270 ngày) cho đến khi trẻ tròn 2 tuổi (730 ngày). Nghiên cứu khoa học đã chứng minh rằng đây là giai đoạn quan trọng nhất trong cuộc đời mỗi con người, ảnh hưởng đến:</p>
      <ul>
        <li>Phát triển thể chất và chiều cao</li>
        <li>Phát triển trí não và khả năng nhận thức</li>
        <li>Hệ miễn dịch và sức đề kháng</li>
        <li>Sự phát triển cảm xúc và xã hội</li>
      </ul>
      
      <h2>Tại sao giai đoạn này lại quan trọng?</h2>
      <p>Trong 1.000 ngày đầu đời, não bộ của trẻ phát triển với tốc độ nhanh nhất - đạt 80% kích thước não người trưởng thành. Đây cũng là thời điểm hệ miễn dịch được hình thành và củng cố. Những gì chúng ta làm trong giai đoạn này sẽ ảnh hưởng lâu dài đến sức khỏe và sự phát triển của trẻ.</p>
      
      <h2>Ba yếu tố quan trọng</h2>
      
      <h3>1. Dinh dưỡng</h3>
      <p>Dinh dưỡng đầy đủ và cân bằng trong giai đoạn này là nền tảng cho sự phát triển. Từ khi mang thai, mẹ cần bổ sung đầy đủ dưỡng chất, đặc biệt là axit folic, sắt, canxi và các vitamin cần thiết. Sau khi sinh, sữa mẹ là nguồn dinh dưỡng tốt nhất cho trẻ sơ sinh và trẻ nhỏ.</p>
      
      <h3>2. Chăm sóc sức khỏe</h3>
      <p>Việc chăm sóc sức khỏe định kỳ, tiêm chủng đầy đủ, và phát hiện sớm các vấn đề sức khỏe là vô cùng quan trọng. Cha mẹ cần theo dõi sự phát triển của trẻ và tham khảo ý kiến chuyên gia khi cần thiết.</p>
      
      <h3>3. Môi trường và tương tác</h3>
      <p>Môi trường yêu thương, an toàn và sự tương tác tích cực từ cha mẹ sẽ giúp trẻ phát triển cảm xúc lành mạnh. Trò chuyện, đọc sách, và chơi cùng trẻ sẽ kích thích sự phát triển trí não và ngôn ngữ.</p>
      
      <h2>Lời khuyên từ chuyên gia</h2>
      <p>Đầu tư vào 1.000 ngày đầu đời là đầu tư tốt nhất cho tương lai của con. Hãy:</p>
      <ul>
        <li>Chăm sóc sức khỏe mẹ và thai nhi ngay từ khi mang thai</li>
        <li>Cho trẻ bú sữa mẹ hoàn toàn trong 6 tháng đầu</li>
        <li>Bắt đầu ăn dặm đúng cách từ 6 tháng tuổi</li>
        <li>Tạo môi trường an toàn, yêu thương cho trẻ</li>
        <li>Dành thời gian chất lượng để tương tác với trẻ</li>
        <li>Theo dõi và hỗ trợ sự phát triển của trẻ</li>
      </ul>
      
      <blockquote>
        <p>"Đầu tư vào 1.000 ngày đầu đời không chỉ là đầu tư cho hiện tại mà còn là đầu tư cho cả tương lai của trẻ. Hãy bắt đầu ngay hôm nay!"</p>
      </blockquote>
      
      <p>Nếu bạn có bất kỳ thắc mắc nào về chăm sóc trẻ trong 1.000 ngày đầu đời, đừng ngần ngại liên hệ với các chuyên gia của IPD8. Chúng tôi luôn sẵn sàng đồng hành cùng bạn trong hành trình nuôi dạy con.</p>
    `
  },
  {
    id: 2,
    title: 'Dinh dưỡng đúng cách cho mẹ bầu trong 3 tháng đầu thai kỳ',
    excerpt: '3 tháng đầu thai kỳ là giai đoạn quan trọng nhất cho sự hình thành và phát triển của thai nhi. Dinh dưỡng đúng cách trong giai đoạn này không chỉ giúp thai nhi phát triển khỏe mạnh mà còn đảm bảo sức khỏe cho mẹ...',
    author: 'BS. Trần Minh Anh',
    authorRole: 'Chuyên gia Dinh dưỡng',
    authorImage: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&h=200&fit=crop',
    image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&h=600&fit=crop',
    category: 'Dinh dưỡng',
    date: '2025-12-12',
    readTime: '7 phút',
    tags: ['Dinh dưỡng mẹ bầu', 'Thai kỳ', 'Sức khỏe'],
    slug: 'dinh-duong-dung-cach-me-bau-3-thang-dau',
    content: `
      <p>3 tháng đầu thai kỳ (tam cá nguyệt đầu tiên) là giai đoạn cực kỳ quan trọng, khi thai nhi đang hình thành các cơ quan quan trọng nhất. Dinh dưỡng trong giai đoạn này đóng vai trò then chốt trong sự phát triển khỏe mạnh của em bé và sức khỏe của mẹ.</p>
      
      <h2>Những dưỡng chất cần thiết</h2>
      
      <h3>Axit Folic</h3>
      <p>Axit folic (vitamin B9) là dưỡng chất quan trọng nhất trong 3 tháng đầu, giúp ngăn ngừa dị tật ống thần kinh. Mẹ bầu cần bổ sung 400-600 mcg/ngày ngay từ trước khi mang thai và tiếp tục trong suốt thai kỳ. Thực phẩm giàu axit folic: rau lá xanh đậm, đậu, cam, ngũ cốc nguyên hạt.</p>
      
      <h3>Sắt</h3>
      <p>Sắt cần thiết để tạo máu và vận chuyển oxy đến thai nhi. Thiếu sắt có thể gây thiếu máu, mệt mỏi. Nhu cầu sắt tăng lên đáng kể trong thai kỳ, khoảng 27mg/ngày. Thực phẩm giàu sắt: thịt đỏ, gan, cá, đậu, rau chân vịt.</p>
      
      <h3>Canxi</h3>
      <p>Canxi cần thiết cho sự phát triển xương và răng của thai nhi. Mẹ bầu cần 1000mg canxi/ngày. Thực phẩm giàu canxi: sữa, sữa chua, phô mai, cá mòi, đậu phụ, rau lá xanh.</p>
      
      <h3>Protein</h3>
      <p>Protein là nguyên liệu để xây dựng các tế bào và cơ quan của thai nhi. Mẹ bầu cần thêm khoảng 20g protein/ngày so với bình thường. Nguồn protein tốt: thịt nạc, cá, trứng, đậu, sữa.</p>
      
      <h2>Thực đơn mẫu cho mẹ bầu 3 tháng đầu</h2>
      
      <h3>Bữa sáng</h3>
      <ul>
        <li>Ngũ cốc nguyên hạt với sữa</li>
        <li>Trứng luộc hoặc trứng chiên</li>
        <li>Một ly nước cam</li>
      </ul>
      
      <h3>Bữa trưa</h3>
      <ul>
        <li>Cơm gạo lứt</li>
        <li>Cá hồi hoặc thịt nạc</li>
        <li>Rau xanh (cải bó xôi, bông cải xanh)</li>
        <li>Canh đậu phụ</li>
      </ul>
      
      <h3>Bữa tối</h3>
      <ul>
        <li>Cơm hoặc bánh mì</li>
        <li>Thịt gà nướng</li>
        <li>Salad rau xanh</li>
        <li>Sữa chua</li>
      </ul>
      
      <h2>Thực phẩm cần tránh</h2>
      <ul>
        <li><strong>Đồ sống:</strong> Sushi, thịt tái, trứng sống</li>
        <li><strong>Cá có hàm lượng thủy ngân cao:</strong> Cá mập, cá kiếm, cá thu lớn</li>
        <li><strong>Rượu và caffeine:</strong> Hạn chế tối đa</li>
        <li><strong>Phô mai mềm chưa tiệt trùng</li>
        <li><strong>Thực phẩm chế biến sẵn:</strong> Chứa nhiều chất bảo quản</li>
      </ul>
      
      <h2>Xử lý ốm nghén</h2>
      <p>Nhiều mẹ bầu gặp phải tình trạng ốm nghén trong 3 tháng đầu. Một số mẹo:</p>
      <ul>
        <li>Ăn nhiều bữa nhỏ trong ngày thay vì 3 bữa lớn</li>
        <li>Ăn bánh quy giòn trước khi ra khỏi giường</li>
        <li>Uống đủ nước, có thể uống trà gừng nhẹ</li>
        <li>Tránh thức ăn có mùi mạnh</li>
        <li>Nghỉ ngơi đầy đủ</li>
      </ul>
      
      <h2>Lời khuyên từ chuyên gia</h2>
      <p>Dinh dưỡng trong 3 tháng đầu thai kỳ là nền tảng cho sự phát triển của thai nhi. Hãy:</p>
      <ul>
        <li>Bổ sung đầy đủ các vitamin và khoáng chất cần thiết</li>
        <li>Ăn đa dạng, cân bằng các nhóm thực phẩm</li>
        <li>Uống đủ nước (2-3 lít/ngày)</li>
        <li>Tham khảo ý kiến chuyên gia dinh dưỡng khi cần</li>
        <li>Lắng nghe cơ thể và ăn khi đói</li>
      </ul>
      
      <p>Nhớ rằng, bạn không cần "ăn cho hai người" về lượng nhưng cần "ăn cho hai người" về chất. Chất lượng dinh dưỡng quan trọng hơn số lượng!</p>
    `
  },
  {
    id: 3,
    title: 'Phương pháp giáo dục sớm Montessori cho trẻ từ 0-3 tuổi',
    excerpt: 'Giáo dục sớm theo phương pháp Montessori giúp trẻ phát triển toàn diện về trí tuệ, cảm xúc và thể chất. Phương pháp này tôn trọng sự phát triển tự nhiên của trẻ và khuyến khích trẻ học tập thông qua trải nghiệm...',
    author: 'TS. Phạm Văn Hùng',
    authorRole: 'Chuyên gia Tâm lý',
    authorImage: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop',
    image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&h=600&fit=crop',
    category: 'Giáo dục sớm',
    date: '2025-12-10',
    readTime: '8 phút',
    tags: ['Montessori', 'Giáo dục sớm', 'Phát triển trẻ em'],
    slug: 'phuong-phap-montessori-0-3-tuoi',
    content: `
      <p>Montessori không chỉ là một phương pháp giáo dục mà còn là một triết lý sống, một cách nhìn nhận về trẻ em và sự phát triển của trẻ. Trong bài viết này, tôi muốn chia sẻ cách áp dụng phương pháp Montessori cho trẻ từ 0-3 tuổi tại nhà.</p>
      
      <h2>Nguyên tắc cốt lõi của Montessori</h2>
      
      <h3>1. Tôn trọng sự độc lập</h3>
      <p>Trẻ có khả năng học tập và phát triển độc lập. Nhiệm vụ của chúng ta là tạo môi trường và cơ hội để trẻ tự khám phá, không phải áp đặt hay can thiệp quá nhiều.</p>
      
      <h3>2. Giai đoạn nhạy cảm</h3>
      <p>Mỗi trẻ có những giai đoạn nhạy cảm đặc biệt - thời điểm trẻ học tập dễ dàng nhất về một kỹ năng cụ thể. Cha mẹ cần quan sát và hỗ trợ trẻ trong các giai đoạn này.</p>
      
      <h3>3. Học qua trải nghiệm</h3>
      <p>Trẻ học tốt nhất thông qua việc tự làm, tự trải nghiệm với các giáo cụ và hoạt động thực tế, không phải qua lý thuyết hay hướng dẫn bằng lời.</p>
      
      <h2>Áp dụng Montessori cho trẻ 0-12 tháng</h2>
      
      <h3>Môi trường</h3>
      <ul>
        <li>Tạo không gian an toàn, thoáng mát, có ánh sáng tự nhiên</li>
        <li>Đặt một tấm thảm lớn để trẻ có thể tự do vận động</li>
        <li>Gương thấp để trẻ có thể nhìn thấy chính mình</li>
        <li>Kệ thấp với một vài đồ chơi được sắp xếp gọn gàng</li>
      </ul>
      
      <h3>Hoạt động</h3>
      <ul>
        <li><strong>Thời gian nằm sấp:</strong> Khuyến khích trẻ nằm sấp để phát triển cơ cổ và lưng</li>
        <li><strong>Đồ chơi đơn giản:</strong> Khối gỗ, xúc xắc, bóng mềm</li>
        <li><strong>Đọc sách:</strong> Đọc to cho trẻ nghe từ sớm</li>
        <li><strong>Âm nhạc:</strong> Chơi nhạc nhẹ nhàng, hát cho trẻ nghe</li>
      </ul>
      
      <h2>Áp dụng Montessori cho trẻ 12-24 tháng</h2>
      
      <h3>Hoạt động thực hành cuộc sống</h3>
      <ul>
        <li><strong>Tự ăn:</strong> Để trẻ tự xúc ăn bằng thìa, uống nước bằng cốc</li>
        <li><strong>Mặc quần áo:</strong> Cho trẻ tự kéo khóa, cài nút</li>
        <li><strong>Dọn dẹp:</strong> Khuyến khích trẻ dọn đồ chơi sau khi chơi</li>
        <li><strong>Chuẩn bị thức ăn:</strong> Cho trẻ tham gia rửa rau, bóc vỏ trái cây</li>
      </ul>
      
      <h3>Giáo cụ Montessori</h3>
      <ul>
        <li><strong>Khối hình học:</strong> Hình trụ, khối lập phương</li>
        <li><strong>Puzzle đơn giản:</strong> 2-3 mảnh ghép</li>
        <li><strong>Xếp chồng:</strong> Các cốc hoặc khối xếp chồng</li>
        <li><strong>Phân loại:</strong> Phân loại đồ vật theo màu sắc, hình dạng</li>
      </ul>
      
      <h2>Áp dụng Montessori cho trẻ 24-36 tháng</h2>
      
      <h3>Phát triển ngôn ngữ</h3>
      <ul>
        <li>Đọc sách hàng ngày</li>
        <li>Trò chuyện với trẻ bằng ngôn ngữ phong phú</li>
        <li>Hát và đọc thơ</li>
        <li>Chơi các trò chơi về từ vựng</li>
      </ul>
      
      <h3>Phát triển vận động</h3>
      <ul>
        <li>Đi bộ ngoài trời</li>
        <li>Leo cầu thang</li>
        <li>Nhảy, chạy, ném bóng</li>
        <li>Các hoạt động vận động tinh: cắt, dán, vẽ</li>
      </ul>
      
      <h2>Vai trò của cha mẹ</h2>
      <p>Trong phương pháp Montessori, cha mẹ đóng vai trò là người hướng dẫn và chuẩn bị môi trường, không phải là người dạy dỗ trực tiếp. Hãy:</p>
      <ul>
        <li>Quan sát trẻ để hiểu nhu cầu và sở thích</li>
        <li>Chuẩn bị môi trường an toàn và kích thích</li>
        <li>Hướng dẫn khi cần nhưng để trẻ tự làm</li>
        <li>Tôn trọng nhịp độ phát triển của trẻ</li>
        <li>Kiên nhẫn và tin tưởng vào khả năng của trẻ</li>
      </ul>
      
      <h2>Lưu ý quan trọng</h2>
      <ul>
        <li>Montessori không phải là để trẻ "tự do làm gì cũng được" mà là tự do trong giới hạn an toàn</li>
        <li>Môi trường cần được chuẩn bị kỹ lưỡng và thay đổi phù hợp với sự phát triển của trẻ</li>
        <li>Cha mẹ cần được đào tạo hoặc tìm hiểu kỹ về phương pháp</li>
        <li>Không so sánh trẻ với trẻ khác, mỗi trẻ có nhịp độ riêng</li>
      </ul>
      
      <blockquote>
        <p>"Giúp trẻ tự làm là mục tiêu của giáo dục Montessori. Chúng ta không dạy trẻ, mà chuẩn bị môi trường để trẻ tự học." - Maria Montessori</p>
      </blockquote>
      
      <p>Áp dụng phương pháp Montessori tại nhà không khó, nhưng cần sự kiên nhẫn và cam kết từ cha mẹ. Hãy bắt đầu từ những điều nhỏ nhất và quan sát sự thay đổi tích cực của trẻ!</p>
    `
  },
  {
    id: 4,
    title: 'Chăm sóc sức khỏe mẹ sau sinh: Những điều cần biết',
    excerpt: 'Sau sinh là giai đoạn quan trọng không kém thai kỳ. Mẹ cần được chăm sóc đặc biệt để phục hồi sức khỏe và có đủ năng lượng để chăm sóc em bé. Bài viết này sẽ chia sẻ những kiến thức cần thiết về chăm sóc sức khỏe mẹ sau sinh...',
    author: 'BS. Lê Thị Mai',
    authorRole: 'Chuyên gia Sản khoa',
    authorImage: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=200&h=200&fit=crop',
    image: 'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=800&h=600&fit=crop',
    category: 'Sản khoa',
    date: '2025-12-08',
    readTime: '6 phút',
    tags: ['Sau sinh', 'Sức khỏe mẹ', 'Chăm sóc'],
    slug: 'cham-soc-suc-khoe-me-sau-sinh',
    content: `
      <p>Giai đoạn sau sinh (postpartum period) là khoảng thời gian 6 tuần đầu tiên sau khi sinh, đây là thời gian mẹ cần phục hồi cả về thể chất lẫn tinh thần. Việc chăm sóc đúng cách sẽ giúp mẹ nhanh chóng hồi phục và có đủ năng lượng để chăm sóc em bé.</p>
      
      <h2>Chăm sóc vết thương sau sinh</h2>
      
      <h3>Sinh thường</h3>
      <ul>
        <li>Vệ sinh vùng kín bằng nước ấm 2-3 lần/ngày</li>
        <li>Thay băng vệ sinh thường xuyên (4-6 giờ/lần)</li>
        <li>Ngồi trên gối mềm hoặc gối đặc biệt để giảm đau</li>
        <li>Nếu có khâu, giữ vết khâu khô ráo và sạch sẽ</li>
        <li>Tắm rửa bình thường nhưng tránh ngâm trong bồn tắm</li>
      </ul>
      
      <h3>Sinh mổ</h3>
      <ul>
        <li>Giữ vết mổ khô ráo và sạch sẽ</li>
        <li>Kiểm tra vết mổ hàng ngày xem có dấu hiệu nhiễm trùng không</li>
        <li>Tránh nâng vật nặng (nặng hơn em bé)</li>
        <li>Di chuyển nhẹ nhàng, tránh cử động mạnh</li>
        <li>Mặc quần áo rộng rãi, thoáng mát</li>
      </ul>
      
      <h2>Dinh dưỡng sau sinh</h2>
      
      <h3>Nhu cầu dinh dưỡng</h3>
      <p>Mẹ sau sinh cần nhiều năng lượng và dinh dưỡng để:</p>
      <ul>
        <li>Phục hồi cơ thể sau quá trình sinh nở</li>
        <li>Sản xuất sữa cho em bé</li>
        <li>Có đủ sức để chăm sóc em bé</li>
      </ul>
      
      <h3>Thực phẩm nên ăn</h3>
      <ul>
        <li><strong>Thực phẩm giàu protein:</strong> Thịt, cá, trứng, đậu để phục hồi mô</li>
        <li><strong>Rau xanh và trái cây:</strong> Cung cấp vitamin và chất xơ</li>
        <li><strong>Carbohydrate phức hợp:</strong> Gạo lứt, ngũ cốc nguyên hạt</li>
        <li><strong>Thực phẩm giàu canxi:</strong> Sữa, sữa chua, phô mai</li>
        <li><strong>Uống nhiều nước:</strong> Ít nhất 2-3 lít/ngày, đặc biệt nếu đang cho con bú</li>
      </ul>
      
      <h3>Thực phẩm nên tránh</h3>
      <ul>
        <li>Thức ăn cay, nóng (có thể gây kích ứng cho em bé qua sữa mẹ)</li>
        <li>Đồ uống có cồn</li>
        <li>Caffeine quá nhiều</li>
        <li>Thức ăn có thể gây dị ứng cho em bé</li>
      </ul>
      
      <h2>Nghỉ ngơi và giấc ngủ</h2>
      <p>Nghỉ ngơi đầy đủ là vô cùng quan trọng:</p>
      <ul>
        <li>Ngủ khi em bé ngủ - đây là lời khuyên quan trọng nhất</li>
        <li>Nhờ người thân giúp đỡ để có thời gian nghỉ ngơi</li>
        <li>Tránh làm việc quá sức trong tuần đầu</li>
        <li>Tạo không gian yên tĩnh để ngủ</li>
      </ul>
      
      <h2>Vận động nhẹ nhàng</h2>
      <p>Sau khi được bác sĩ cho phép (thường là 6 tuần sau sinh hoặc khi vết thương lành), mẹ có thể bắt đầu vận động nhẹ nhàng:</p>
      <ul>
        <li>Đi bộ nhẹ nhàng</li>
        <li>Bài tập Kegel để phục hồi cơ sàn chậu</li>
        <li>Yoga nhẹ nhàng dành cho mẹ sau sinh</li>
        <li>Tránh các bài tập nặng quá sớm</li>
      </ul>
      
      <h2>Chăm sóc sức khỏe tinh thần</h2>
      
      <h3>Baby Blues vs. Trầm cảm sau sinh</h3>
      <p><strong>Baby Blues:</strong> Cảm giác buồn, lo lắng nhẹ trong vài ngày đầu sau sinh là bình thường. Thường tự hết sau 1-2 tuần.</p>
      
      <p><strong>Trầm cảm sau sinh:</strong> Nếu cảm giác buồn, lo lắng kéo dài hơn 2 tuần, ảnh hưởng đến khả năng chăm sóc em bé, cần tìm sự giúp đỡ từ chuyên gia.</p>
      
      <h3>Cách hỗ trợ sức khỏe tinh thần</h3>
      <ul>
        <li>Chia sẻ cảm xúc với người thân</li>
        <li>Tham gia nhóm hỗ trợ các mẹ sau sinh</li>
        <li>Dành thời gian cho bản thân</li>
        <li>Tìm kiếm sự giúp đỡ khi cần</li>
      </ul>
      
      <h2>Theo dõi sức khỏe định kỳ</h2>
      <ul>
        <li>Khám lại sau 6 tuần để đảm bảo phục hồi tốt</li>
        <li>Theo dõi cân nặng, huyết áp</li>
        <li>Kiểm tra sức khỏe vú nếu cho con bú</li>
        <li>Thảo luận về kế hoạch tránh thai</li>
      </ul>
      
      <h2>Lời khuyên từ chuyên gia</h2>
      <p>Giai đoạn sau sinh có thể khó khăn, nhưng hãy nhớ:</p>
      <ul>
        <li>Hãy kiên nhẫn với bản thân - bạn đang làm rất tốt</li>
        <li>Đừng ngại nhờ giúp đỡ từ người thân</li>
        <li>Ưu tiên chăm sóc bản thân để có thể chăm sóc em bé tốt nhất</li>
        <li>Liên hệ với chuyên gia khi có bất kỳ lo lắng nào</li>
      </ul>
      
      <blockquote>
        <p>"Chăm sóc mẹ tốt là cách tốt nhất để chăm sóc em bé. Mẹ khỏe mạnh, hạnh phúc sẽ tạo môi trường tốt nhất cho em bé phát triển."</p>
      </blockquote>
      
      <p>Nếu bạn có bất kỳ thắc mắc hoặc lo lắng nào về sức khỏe sau sinh, đừng ngần ngại liên hệ với các chuyên gia của IPD8. Chúng tôi luôn sẵn sàng hỗ trợ bạn!</p>
    `
  },
  {
    id: 5,
    title: 'Phát triển vận động cho trẻ sơ sinh: Từ lẫy đến đi',
    excerpt: 'Phát triển vận động là một trong những cột mốc quan trọng trong quá trình phát triển của trẻ. Từ những cử động đầu tiên đến những bước đi đầu tiên, mỗi giai đoạn đều có ý nghĩa riêng...',
    author: 'BS. Nguyễn Thị Hoa',
    authorRole: 'Chuyên gia Phát triển vận động',
    authorImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    image: 'https://images.unsplash.com/photo-1566004100631-35d015d6a491?w=800&h=600&fit=crop',
    category: 'Vận động',
    date: '2025-12-05',
    readTime: '5 phút',
    tags: ['Vận động', 'Phát triển', 'Trẻ sơ sinh'],
    slug: 'phat-trien-van-dong-tre-so-sinh',
    content: `
      <p>Phát triển vận động là một hành trình kỳ diệu, từ những cử động đầu tiên của trẻ sơ sinh đến những bước đi đầu tiên. Mỗi cột mốc phát triển đều là một thành tựu đáng tự hào và là dấu hiệu của sự phát triển khỏe mạnh.</p>
      
      <h2>Các cột mốc phát triển vận động</h2>
      
      <h3>0-3 tháng: Nâng đầu và cổ</h3>
      <ul>
        <li>Trẻ bắt đầu có thể nâng đầu lên khi nằm sấp</li>
        <li>Quay đầu sang hai bên</li>
        <li>Cử động tay và chân đối xứng</li>
        <li><strong>Cách hỗ trợ:</strong> Cho trẻ nằm sấp nhiều lần trong ngày, để đồ chơi trước mặt để khuyến khích trẻ nâng đầu</li>
      </ul>
      
      <h3>4-6 tháng: Lẫy và ngồi có hỗ trợ</h3>
      <ul>
        <li>Trẻ có thể lẫy từ nằm ngửa sang nằm sấp và ngược lại</li>
        <li>Ngồi có hỗ trợ</li>
        <li>Có thể với và nắm đồ vật</li>
        <li>Đưa đồ vật vào miệng</li>
        <li><strong>Cách hỗ trợ:</strong> Để đồ chơi bên cạnh để khuyến khích trẻ lẫy, hỗ trợ trẻ ngồi với gối hoặc đệm</li>
      </ul>
      
      <h3>7-9 tháng: Ngồi độc lập và bò</h3>
      <ul>
        <li>Ngồi độc lập không cần hỗ trợ</li>
        <li>Bắt đầu bò</li>
        <li>Đứng lên khi vịn vào đồ vật</li>
        <li>Cầm nắm bằng ngón tay cái và ngón trỏ</li>
        <li><strong>Cách hỗ trợ:</strong> Tạo không gian an toàn để trẻ bò, đặt đồ chơi xa một chút để khuyến khích di chuyển</li>
      </ul>
      
      <h3>10-12 tháng: Đứng và đi có hỗ trợ</h3>
      <ul>
        <li>Đứng vịn vào đồ vật</li>
        <li>Đi men theo đồ vật</li>
        <li>Một số trẻ có thể đi những bước đầu tiên</li>
        <li><strong>Cách hỗ trợ:</strong> Để đồ chơi trên ghế thấp, khuyến khích trẻ đứng lên lấy, hỗ trợ trẻ đi bằng cách cầm tay</li>
      </ul>
      
      <h3>12-18 tháng: Đi độc lập</h3>
      <ul>
        <li>Đi độc lập</li>
        <li>Leo cầu thang với sự giúp đỡ</li>
        <li>Ném bóng</li>
        <li>Vẽ nguệch ngoạc</li>
        <li><strong>Cách hỗ trợ:</strong> Tạo không gian an toàn, rộng rãi để trẻ tập đi, khuyến khích các hoạt động vận động</li>
      </ul>
      
      <h2>Hoạt động hỗ trợ phát triển vận động</h2>
      
      <h3>Thời gian nằm sấp (Tummy Time)</h3>
      <p>Bắt đầu từ khi trẻ được 2-3 tuần tuổi:</p>
      <ul>
        <li>Cho trẻ nằm sấp 2-3 lần/ngày, mỗi lần 1-2 phút</li>
        <li>Tăng dần thời gian khi trẻ lớn hơn</li>
        <li>Đặt đồ chơi trước mặt để khuyến khích</li>
        <li>Luôn giám sát khi trẻ nằm sấp</li>
      </ul>
      
      <h3>Vận động ngoài trời</h3>
      <ul>
        <li>Đưa trẻ ra ngoài trời hàng ngày (khi thời tiết tốt)</li>
        <li>Cho trẻ tiếp xúc với các loại địa hình khác nhau: cỏ, cát, đá</li>
        <li>Khuyến khích trẻ khám phá tự nhiên</li>
      </ul>
      
      <h3>Trò chơi vận động</h3>
      <ul>
        <li>Chơi với bóng</li>
        <li>Đu đưa, nhảy</li>
        <li>Nhảy múa theo nhạc</li>
        <li>Các trò chơi vận động tinh: xếp khối, vẽ, cắt dán</li>
      </ul>
      
      <h2>Dấu hiệu cần lưu ý</h2>
      <p>Nếu trẻ có các dấu hiệu sau, nên tham khảo ý kiến chuyên gia:</p>
      <ul>
        <li>Không thể nâng đầu lên khi nằm sấp sau 4 tháng</li>
        <li>Không lẫy sau 6 tháng</li>
        <li>Không ngồi độc lập sau 9 tháng</li>
        <li>Không bò hoặc di chuyển sau 12 tháng</li>
        <li>Không đi sau 18 tháng</li>
        <li>Vận động không đối xứng hoặc có dấu hiệu yếu một bên</li>
      </ul>
      
      <h2>Tạo môi trường an toàn</h2>
      <ul>
        <li>Che các góc nhọn của đồ đạc</li>
        <li>Gắn cổng an toàn ở cầu thang</li>
        <li>Khóa các ngăn kéo và tủ</li>
        <li>Để các vật nguy hiểm xa tầm với</li>
        <li>Tạo không gian rộng rãi, an toàn để trẻ vận động</li>
      </ul>
      
      <h2>Lời khuyên từ chuyên gia</h2>
      <p>Mỗi trẻ có nhịp độ phát triển riêng. Đừng so sánh trẻ với trẻ khác. Hãy:</p>
      <ul>
        <li>Quan sát và ghi nhận các cột mốc của trẻ</li>
        <li>Khuyến khích nhưng không ép buộc</li>
        <li>Tạo môi trường an toàn và kích thích</li>
        <li>Dành thời gian vui chơi cùng trẻ</li>
        <li>Tham khảo ý kiến chuyên gia khi có lo lắng</li>
      </ul>
      
      <blockquote>
        <p>"Mỗi bước đi đầu tiên, mỗi lần nâng đầu lên, mỗi cú lẫy đầu tiên đều là những khoảnh khắc đáng tự hào. Hãy tận hưởng hành trình này cùng con!"</p>
      </blockquote>
      
      <p>Phát triển vận động là một quá trình tự nhiên, nhưng với sự hỗ trợ đúng cách, chúng ta có thể giúp trẻ phát triển tốt nhất. Hãy kiên nhẫn và tận hưởng từng khoảnh khắc!</p>
    `
  }
]

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

export default function ExpertPerspectiveDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)
  const router = useRouter()
  const [headerHeight, setHeaderHeight] = useState<string>('104px')
  const [copied, setCopied] = useState(false)
  
  const post = allPosts.find(p => p.slug === slug)
  
  // Related posts (exclude current post)
  const relatedPosts = allPosts.filter(p => p.slug !== slug).slice(0, 4)

  useEffect(() => {
    const updateHeaderHeight = () => {
      if (typeof window === 'undefined') return
      const header = document.querySelector('header')
      if (header) {
        setHeaderHeight(`${header.offsetHeight}px`)
      } else {
        setHeaderHeight(window.innerWidth >= 768 ? '140px' : '104px')
      }
    }

    updateHeaderHeight()
    const handleResize = () => requestAnimationFrame(updateHeaderHeight)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleShare = (platform: string) => {
    const url = window.location.href
    const title = post?.title || ''
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
        break
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank')
        break
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank')
        break
      case 'copy':
        navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        break
    }
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Bài viết không tồn tại</h1>
          <p className="text-gray-600 mb-8">Bài viết bạn tìm kiếm không có trong hệ thống.</p>
          <Link href={ROUTES.EXPERT_PERSPECTIVE}>
            <Button>Quay lại góc chuyên gia</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b" style={{ marginTop: headerHeight }}>
        <div className="container-custom py-4">
          <Breadcrumb
            items={[
              { label: 'Góc chuyên gia', href: ROUTES.EXPERT_PERSPECTIVE },
              { label: post.title, href: `/expert-perspective/${post.slug}` }
            ]}
          />
        </div>
      </div>

      {/* Section 1: Hero / Cover Section */}
      <section className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        <div className="relative z-10 h-full flex items-end">
          <div className="container-custom w-full pb-8 md:pb-12">
            <motion.div
              initial="initial"
              animate="animate"
              variants={fadeInUp}
              className="text-white max-w-4xl"
            >
              <Badge className="bg-gradient-to-r from-[#F441A5] to-[#FF5F6D] text-white mb-4">
                {post.category}
              </Badge>
              <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 leading-tight">
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-white/90 mb-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="font-semibold">{post.author}</span>
                  <span className="text-white/70">- {post.authorRole}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(post.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{post.readTime}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 2: Main Content Section */}
      <section className="section-wrapper bg-white py-12 md:py-16 lg:py-20">
        <div className="container-custom">
          <div 
            className="mx-auto prose prose-lg prose-gray max-w-none"
            style={{ maxWidth: '75vw' }}
          >
            <div 
              className="article-content"
              dangerouslySetInnerHTML={{ __html: post.content }}
              style={{
                lineHeight: '1.8',
                fontSize: '1.125rem',
                color: '#374151'
              }}
            />
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mx-auto mt-12 flex flex-wrap gap-2" style={{ maxWidth: '75vw' }}>
              {post.tags.map((tag, index) => (
                <Badge 
                  key={index}
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:border-[#F441A5] hover:text-[#F441A5] transition-colors"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Section 3: Social Sharing Section */}
      <section className="section-wrapper bg-gray-50 py-8 border-y">
        <div className="container-custom">
          <div className="flex flex-col items-center gap-4" style={{ maxWidth: '75vw', margin: '0 auto' }}>
            <p className="text-sm font-semibold text-gray-700 mb-2">Chia sẻ bài viết</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleShare('facebook')}
                className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:bg-[#166FE5] transition-colors"
                aria-label="Share on Facebook"
              >
                <Facebook className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleShare('twitter')}
                className="w-10 h-10 rounded-full bg-[#1DA1F2] text-white flex items-center justify-center hover:bg-[#1A91DA] transition-colors"
                aria-label="Share on Twitter"
              >
                <Twitter className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleShare('linkedin')}
                className="w-10 h-10 rounded-full bg-[#0077B5] text-white flex items-center justify-center hover:bg-[#006399] transition-colors"
                aria-label="Share on LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleShare('copy')}
                className="w-10 h-10 rounded-full bg-gray-700 text-white flex items-center justify-center hover:bg-gray-600 transition-colors"
                aria-label="Copy link"
              >
                {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Related Posts Slider */}
      {relatedPosts.length > 0 && (
        <section className="section-wrapper bg-white py-12 md:py-16">
          <div className="container-custom">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Bài viết liên quan
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-2 py-2 overflow-visible">
              {relatedPosts.map((relatedPost) => (
                <motion.div
                  key={relatedPost.id}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                >
                  <Link href={`/expert-perspective/${relatedPost.slug}`}>
                    <Card className="bg-white border-2 border-gray-200 shadow-lg overflow-hidden group hover:shadow-2xl hover:border-[#F441A5] transition-all duration-300 h-full flex flex-col cursor-pointer">
                      <div className="relative h-40 overflow-hidden w-full">
                        <Image
                          src={relatedPost.image}
                          alt={relatedPost.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-gradient-to-r from-[#F441A5] to-[#FF5F6D] text-white text-xs">
                            {relatedPost.category}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-4 flex flex-col flex-grow">
                        <h5 className="text-base font-bold text-gray-900 mb-2 line-clamp-2" style={{ lineHeight: '1.2' }}>
                          {relatedPost.title}
                        </h5>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(relatedPost.date)}</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-2 border-[#F441A5] text-[#F441A5] hover:bg-[#F441A5] hover:text-white transition-all duration-200 text-xs mt-auto"
                        >
                          Đọc tiếp
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

