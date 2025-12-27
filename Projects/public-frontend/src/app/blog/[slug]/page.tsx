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

// Mock articles data (same as in blog page.tsx)
const allArticles = [
  {
    id: 1,
    title: 'IPD8 tổ chức hội thảo "Nuôi con khoa học - Con khỏe, mẹ vui"',
    excerpt: 'Hội thảo lớn với sự tham gia của các chuyên gia hàng đầu về nuôi dạy con, chia sẻ những phương pháp khoa học và thực tiễn nhất.',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=1200&h=800&fit=crop',
    category: 'Tin tức chung',
    date: '2025-12-15',
    author: 'IPD8 Editorial',
    authorImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop',
    readTime: '5 phút',
    tags: ['Hội thảo', 'Chuyên gia'],
    slug: 'ipd8-to-chuc-hoi-thao-nuoi-con-khoa-hoc',
    content: `
      <p>IPD8 vừa tổ chức thành công hội thảo "Nuôi con khoa học - Con khỏe, mẹ vui" với sự tham gia đông đảo của các phụ huynh và chuyên gia hàng đầu trong lĩnh vực chăm sóc trẻ em.</p>
      
      <h2>Nội dung chính của hội thảo</h2>
      <p>Hội thảo đã mang đến nhiều kiến thức quý giá về:</p>
      <ul>
        <li>Phương pháp nuôi dạy con khoa học dựa trên nghiên cứu</li>
        <li>Các giai đoạn phát triển quan trọng của trẻ</li>
        <li>Dinh dưỡng hợp lý cho từng độ tuổi</li>
        <li>Cách xử lý các tình huống thường gặp trong quá trình nuôi con</li>
      </ul>
      
      <h2>Phản hồi tích cực từ phụ huynh</h2>
      <p>Nhiều phụ huynh đã chia sẻ những cảm nhận tích cực về hội thảo:</p>
      <blockquote>
        <p>"Đây là hội thảo rất bổ ích, tôi đã học được nhiều kiến thức mới để áp dụng trong việc chăm sóc con." - Chị Nguyễn Thị Hoa, phụ huynh tham gia</p>
      </blockquote>
      
      <h2>Kế hoạch tiếp theo</h2>
      <p>IPD8 sẽ tiếp tục tổ chức các hội thảo tương tự trong thời gian tới, nhằm đồng hành cùng phụ huynh trong hành trình nuôi dạy con khoa học.</p>
    `
  },
  {
    id: 2,
    title: 'Nghiên cứu mới về tầm quan trọng của 1.000 ngày đầu đời',
    excerpt: 'Các nhà khoa học đã công bố nghiên cứu mới nhất về tác động của 1.000 ngày đầu đời đến sự phát triển toàn diện của trẻ.',
    image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&h=600&fit=crop',
    category: 'Tin tức chung',
    date: '2025-12-12',
    author: 'IPD8 Research Team',
    authorImage: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&h=200&fit=crop',
    readTime: '7 phút',
    tags: ['Nghiên cứu', 'Khoa học'],
    slug: 'nghien-cuu-moi-ve-tam-quan-trong-1000-ngay-dau-doi',
    content: `
      <p>Nghiên cứu mới nhất của các nhà khoa học đã khẳng định tầm quan trọng đặc biệt của 1.000 ngày đầu đời trong sự phát triển toàn diện của trẻ.</p>
      
      <h2>Kết quả nghiên cứu</h2>
      <p>Nghiên cứu cho thấy:</p>
      <ul>
        <li>1.000 ngày đầu đời là giai đoạn vàng cho sự phát triển trí não</li>
        <li>Dinh dưỡng trong giai đoạn này ảnh hưởng trực tiếp đến sức khỏe lâu dài</li>
        <li>Môi trường chăm sóc tích cực giúp trẻ phát triển tối ưu</li>
      </ul>
      
      <h2>Ứng dụng thực tế</h2>
      <p>Dựa trên kết quả nghiên cứu, IPD8 đã phát triển các chương trình chăm sóc chuyên biệt cho từng giai đoạn phát triển của trẻ.</p>
    `
  },
  {
    id: 3,
    title: 'IPD8 mở rộng chương trình hỗ trợ cho các gia đình có hoàn cảnh khó khăn',
    excerpt: 'Chương trình mới nhằm hỗ trợ các gia đình có hoàn cảnh khó khăn tiếp cận với các dịch vụ chăm sóc và giáo dục trẻ em chất lượng cao.',
    image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&h=600&fit=crop',
    category: 'Tin tức chung',
    date: '2025-12-10',
    author: 'IPD8 Community',
    authorImage: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop',
    readTime: '6 phút',
    tags: ['Cộng đồng', 'Hỗ trợ'],
    slug: 'ipd8-mo-rong-chuong-trinh-ho-tro-gia-dinh-kho-khan',
    content: `
      <p>Nhằm mục tiêu hỗ trợ và đồng hành cùng các gia đình có hoàn cảnh khó khăn, IPD8 vừa công bố chương trình mở rộng hỗ trợ với nhiều ưu đãi và dịch vụ chăm sóc chất lượng cao.</p>
      
      <h2>Mục tiêu của chương trình</h2>
      <p>Chương trình được thiết kế với mục tiêu:</p>
      <ul>
        <li>Giúp mọi trẻ em đều có cơ hội tiếp cận với dịch vụ chăm sóc và giáo dục chất lượng</li>
        <li>Hỗ trợ các gia đình có hoàn cảnh khó khăn về tài chính</li>
        <li>Tạo điều kiện cho trẻ em phát triển toàn diện trong giai đoạn quan trọng nhất</li>
        <li>Xây dựng cộng đồng hỗ trợ lẫn nhau</li>
      </ul>
      
      <h2>Nội dung hỗ trợ</h2>
      <p>Chương trình bao gồm:</p>
      <ul>
        <li>Học bổng lên đến 50% cho các khóa học</li>
        <li>Tư vấn miễn phí từ các chuyên gia hàng đầu</li>
        <li>Hỗ trợ dinh dưỡng và chăm sóc sức khỏe</li>
        <li>Chương trình học tập linh hoạt phù hợp với hoàn cảnh gia đình</li>
      </ul>
      
      <h2>Cách thức đăng ký</h2>
      <p>Gia đình có nhu cầu có thể liên hệ trực tiếp với IPD8 qua hotline hoặc đăng ký online. Đội ngũ tư vấn sẽ hỗ trợ đánh giá và xét duyệt trong thời gian sớm nhất.</p>
      
      <h2>Cam kết của IPD8</h2>
      <p>IPD8 cam kết đồng hành cùng các gia đình, đảm bảo mọi trẻ em đều có cơ hội phát triển tối ưu trong 1.000 ngày đầu đời quan trọng nhất.</p>
    `
  },
  {
    id: 4,
    title: 'Phương pháp giáo dục sớm Montessori được áp dụng tại IPD8',
    excerpt: 'IPD8 chính thức triển khai phương pháp giáo dục sớm Montessori trong các khóa học dành cho trẻ từ 0-3 tuổi.',
    image: 'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=800&h=600&fit=crop',
    category: 'Tin tức chung',
    date: '2025-12-08',
    author: 'IPD8 Education',
    authorImage: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=200&h=200&fit=crop',
    readTime: '5 phút',
    tags: ['Giáo dục', 'Montessori'],
    slug: 'phuong-phap-giao-duc-som-montessori-tai-ipd8',
    content: `
      <p>IPD8 tự hào công bố việc chính thức áp dụng phương pháp giáo dục sớm Montessori trong toàn bộ chương trình đào tạo dành cho trẻ từ 0-3 tuổi, mở ra một trang mới trong hành trình giáo dục và phát triển trẻ em tại Việt Nam.</p>
      
      <h2>Phương pháp Montessori là gì?</h2>
      <p>Phương pháp Montessori là một phương pháp giáo dục được phát triển bởi bác sĩ Maria Montessori, dựa trên nguyên tắc tôn trọng sự phát triển tự nhiên của trẻ và khuyến khích trẻ học tập thông qua khám phá và trải nghiệm thực tế.</p>
      
      <h2>Lợi ích của phương pháp Montessori</h2>
      <ul>
        <li><strong>Phát triển tính độc lập:</strong> Trẻ được khuyến khích tự làm và tự khám phá</li>
        <li><strong>Nuôi dưỡng sự tập trung:</strong> Môi trường học tập được thiết kế để trẻ tập trung vào hoạt động yêu thích</li>
        <li><strong>Phát triển kỹ năng vận động:</strong> Thông qua các hoạt động thực hành cụ thể</li>
        <li><strong>Xây dựng sự tự tin:</strong> Trẻ học cách tự giải quyết vấn đề và đưa ra quyết định</li>
        <li><strong>Phát triển cảm xúc xã hội:</strong> Trẻ học cách tôn trọng và hợp tác với người khác</li>
      </ul>
      
      <h2>Áp dụng tại IPD8</h2>
      <p>Tại IPD8, phương pháp Montessori được tích hợp một cách linh hoạt và phù hợp với văn hóa Việt Nam. Các chuyên gia giáo dục của IPD8 đã được đào tạo chuyên sâu về phương pháp này và sẽ áp dụng vào từng khóa học cụ thể.</p>
      
      <p>Môi trường học tập được thiết kế với các giáo cụ Montessori chuẩn, tạo điều kiện tối ưu cho trẻ khám phá và phát triển theo nhịp độ riêng của mình.</p>
      
      <h2>Phụ huynh nói gì?</h2>
      <blockquote>
        <p>"Tôi rất hài lòng với cách IPD8 áp dụng phương pháp Montessori. Con tôi trở nên tự lập và tự tin hơn rất nhiều sau khi tham gia chương trình." - Phụ huynh Nguyễn Văn A</p>
      </blockquote>
    `
  },
  {
    id: 5,
    title: 'Hợp tác với các chuyên gia quốc tế trong lĩnh vực phát triển trẻ em',
    excerpt: 'IPD8 ký kết hợp tác với các tổ chức quốc tế hàng đầu để nâng cao chất lượng chương trình đào tạo và nghiên cứu.',
    image: 'https://images.unsplash.com/photo-1566004100631-35d015d6a491?w=800&h=600&fit=crop',
    category: 'Tin tức chung',
    date: '2025-12-05',
    author: 'IPD8 Partnership',
    authorImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    readTime: '6 phút',
    tags: ['Hợp tác', 'Quốc tế'],
    slug: 'hop-tac-voi-chuyen-gia-quoc-te-phat-trien-tre-em',
    content: `
      <p>IPD8 vừa ký kết các thỏa thuận hợp tác chiến lược với nhiều tổ chức quốc tế hàng đầu trong lĩnh vực phát triển trẻ em, đánh dấu một bước tiến quan trọng trong việc nâng cao chất lượng đào tạo và nghiên cứu.</p>
      
      <h2>Đối tác hợp tác</h2>
      <p>IPD8 tự hào được hợp tác với:</p>
      <ul>
        <li><strong>UNICEF Vietnam:</strong> Hợp tác trong các chương trình phát triển trẻ em</li>
        <li><strong>International Montessori Association:</strong> Đào tạo và chứng nhận phương pháp Montessori</li>
        <li><strong>Harvard Child Development Center:</strong> Nghiên cứu và phát triển chương trình giáo dục</li>
        <li><strong>New Zealand Early Childhood Education:</strong> Trao đổi kinh nghiệm và phương pháp giáo dục</li>
      </ul>
      
      <h2>Lợi ích của hợp tác</h2>
      <p>Thông qua các hợp tác này, IPD8 sẽ:</p>
      <ul>
        <li>Tiếp cận với các phương pháp giáo dục tiên tiến nhất trên thế giới</li>
        <li>Nâng cao trình độ chuyên môn của đội ngũ giáo viên và chuyên gia</li>
        <li>Cập nhật các nghiên cứu mới nhất về phát triển trẻ em</li>
        <li>Tạo cơ hội giao lưu và học hỏi cho học viên</li>
      </ul>
      
      <h2>Chương trình hợp tác cụ thể</h2>
      <p>Một trong những chương trình hợp tác đầu tiên là dự án "Phát triển toàn diện trẻ em Việt Nam" với sự hỗ trợ từ UNICEF, tập trung vào việc cải thiện chất lượng chăm sóc và giáo dục trẻ em trong 1.000 ngày đầu đời.</p>
      
      <h2>Tương lai phía trước</h2>
      <p>IPD8 cam kết tiếp tục mở rộng hợp tác quốc tế, mang đến những giá trị tốt nhất cho trẻ em và gia đình Việt Nam, đồng thời đóng góp vào sự phát triển bền vững của cộng đồng.</p>
    `
  },
  {
    id: 6,
    title: 'Sự kiện: Workshop "Dinh dưỡng cho mẹ bầu và trẻ nhỏ"',
    excerpt: 'Workshop thực hành về dinh dưỡng với sự tham gia của chuyên gia dinh dưỡng hàng đầu, hướng dẫn thực đơn khoa học cho mẹ bầu và trẻ nhỏ.',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=1200&h=800&fit=crop',
    category: 'Sự kiện',
    date: '2025-12-20',
    author: 'IPD8 Events',
    authorImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop',
    readTime: '3 phút',
    eventDate: '2026-01-15',
    location: 'Trung tâm IPD8, Hà Nội',
    tags: ['Workshop', 'Dinh dưỡng'],
    slug: 'workshop-dinh-duong-me-bau-tre-nho',
    content: `
      <p>IPD8 trân trọng thông báo tổ chức Workshop "Dinh dưỡng cho mẹ bầu và trẻ nhỏ" vào ngày 15/01/2026 tại Trung tâm IPD8, Hà Nội. Đây là cơ hội tuyệt vời để phụ huynh học hỏi từ các chuyên gia dinh dưỡng hàng đầu.</p>
      
      <h2>Nội dung workshop</h2>
      <p>Workshop sẽ bao gồm các chủ đề:</p>
      <ul>
        <li><strong>Dinh dưỡng trong thai kỳ:</strong> Những dưỡng chất cần thiết cho mẹ bầu</li>
        <li><strong>Thực đơn mẫu:</strong> Các món ăn bổ dưỡng và dễ chế biến</li>
        <li><strong>Dinh dưỡng cho trẻ sơ sinh:</strong> Từ sữa mẹ đến ăn dặm</li>
        <li><strong>Xử lý các vấn đề thường gặp:</strong> Biếng ăn, dị ứng, suy dinh dưỡng</li>
        <li><strong>Thực hành nấu ăn:</strong> Hướng dẫn chế biến các món ăn lành mạnh</li>
      </ul>
      
      <h2>Diễn giả</h2>
      <p>Workshop được dẫn dắt bởi BS. Trần Minh Anh - Chuyên gia Dinh dưỡng với hơn 15 năm kinh nghiệm trong lĩnh vực dinh dưỡng mẹ bầu và trẻ em.</p>
      
      <h2>Thông tin sự kiện</h2>
      <ul>
        <li><strong>Thời gian:</strong> 15/01/2026, 8:00 - 12:00</li>
        <li><strong>Địa điểm:</strong> Trung tâm IPD8, Hà Nội</li>
        <li><strong>Phí tham gia:</strong> Miễn phí (có đăng ký trước)</li>
        <li><strong>Số lượng:</strong> Giới hạn 30 người</li>
      </ul>
      
      <h2>Đăng ký tham gia</h2>
      <p>Quý phụ huynh có thể đăng ký tham gia qua hotline của IPD8 hoặc đăng ký online trên website. Chúng tôi sẽ liên hệ xác nhận trong vòng 24 giờ.</p>
      
      <p><strong>Lưu ý:</strong> Workshop có phần thực hành nấu ăn, vui lòng thông báo nếu có dị ứng thức ăn đặc biệt.</p>
    `
  },
  {
    id: 7,
    title: 'Hội thảo "Phát triển vận động cho trẻ sơ sinh"',
    excerpt: 'Hội thảo chuyên sâu về phát triển vận động cho trẻ từ 0-12 tháng, với các bài tập thực hành và tư vấn từ chuyên gia.',
    image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&h=600&fit=crop',
    category: 'Sự kiện',
    date: '2025-12-18',
    author: 'IPD8 Events',
    authorImage: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&h=200&fit=crop',
    readTime: '4 phút',
    eventDate: '2026-01-20',
    location: 'Trung tâm IPD8, TP. Hồ Chí Minh',
    tags: ['Hội thảo', 'Vận động'],
    slug: 'hoi-thao-phat-trien-van-dong-tre-so-sinh',
    content: `
      <p>IPD8 tổ chức hội thảo chuyên sâu "Phát triển vận động cho trẻ sơ sinh" dành cho phụ huynh có con từ 0-12 tháng tuổi, với sự tham gia của BS. Nguyễn Thị Hoa - Chuyên gia Phát triển vận động hàng đầu.</p>
      
      <h2>Tại sao phát triển vận động quan trọng?</h2>
      <p>Phát triển vận động là nền tảng quan trọng cho sự phát triển toàn diện của trẻ. Từ những cử động đầu tiên đến những bước đi đầu tiên, mỗi cột mốc đều đóng vai trò quan trọng trong sự phát triển thể chất và trí tuệ của trẻ.</p>
      
      <h2>Nội dung hội thảo</h2>
      <ul>
        <li><strong>Các cột mốc phát triển vận động:</strong> Từ lẫy, ngồi, bò đến đi</li>
        <li><strong>Bài tập hỗ trợ phát triển:</strong> Hướng dẫn các bài tập phù hợp từng độ tuổi</li>
        <li><strong>Dấu hiệu chậm phát triển:</strong> Khi nào cần lo lắng và khi nào là bình thường</li>
        <li><strong>Môi trường hỗ trợ:</strong> Tạo không gian an toàn cho trẻ vận động</li>
        <li><strong>Thực hành trực tiếp:</strong> Hướng dẫn các kỹ thuật massage và bài tập cụ thể</li>
      </ul>
      
      <h2>Lợi ích khi tham gia</h2>
      <ul>
        <li>Hiểu rõ quá trình phát triển vận động của trẻ</li>
        <li>Học các bài tập hỗ trợ phát triển phù hợp</li>
        <li>Nhận biết sớm các dấu hiệu bất thường</li>
        <li>Được tư vấn trực tiếp từ chuyên gia</li>
        <li>Nhận tài liệu hướng dẫn chi tiết</li>
      </ul>
      
      <h2>Thông tin chi tiết</h2>
      <ul>
        <li><strong>Ngày:</strong> 20/01/2026</li>
        <li><strong>Thời gian:</strong> 9:00 - 11:30</li>
        <li><strong>Địa điểm:</strong> Trung tâm IPD8, TP. Hồ Chí Minh</li>
        <li><strong>Đối tượng:</strong> Phụ huynh có con từ 0-12 tháng</li>
      </ul>
      
      <p>Đăng ký ngay để đảm bảo chỗ ngồi và nhận ưu đãi đặc biệt!</p>
    `
  },
  {
    id: 8,
    title: 'Sự kiện: Ngày hội gia đình IPD8 2026',
    excerpt: 'Ngày hội lớn nhất trong năm với nhiều hoạt động vui chơi, học tập và giao lưu cho cả gia đình, cùng các chuyên gia hàng đầu.',
    image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&h=600&fit=crop',
    category: 'Sự kiện',
    date: '2025-12-15',
    author: 'IPD8 Events',
    authorImage: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop',
    readTime: '5 phút',
    eventDate: '2026-02-10',
    location: 'Trung tâm Hội nghị Quốc gia, Hà Nội',
    tags: ['Ngày hội', 'Gia đình'],
    slug: 'ngay-hoi-gia-dinh-ipd8-2026',
    content: `
      <p>Ngày hội gia đình IPD8 2026 - sự kiện lớn nhất trong năm dành cho toàn thể gia đình, sẽ diễn ra vào ngày 10/02/2026 tại Trung tâm Hội nghị Quốc gia, Hà Nội. Đây là cơ hội tuyệt vời để cả gia đình cùng vui chơi, học tập và kết nối.</p>
      
      <h2>Hoạt động trong ngày hội</h2>
      
      <h3>Khu vực vui chơi cho trẻ em</h3>
      <ul>
        <li>Khu vui chơi Montessori với các giáo cụ thực hành</li>
        <li>Gian hàng nghệ thuật và sáng tạo</li>
        <li>Khu vực vận động và thể thao</li>
        <li>Show âm nhạc và kể chuyện</li>
      </ul>
      
      <h3>Hội thảo và workshop cho phụ huynh</h3>
      <ul>
        <li>Hội thảo "Nuôi dạy con tích cực" với TS. Nguyễn Thị Lan</li>
        <li>Workshop "Dinh dưỡng lành mạnh cho gia đình"</li>
        <li>Chia sẻ về "Giáo dục sớm tại nhà"</li>
        <li>Tư vấn miễn phí từ các chuyên gia</li>
      </ul>
      
      <h3>Khu triển lãm và trưng bày</h3>
      <ul>
        <li>Triển lãm "Hành trình 1.000 ngày đầu đời"</li>
        <li>Trưng bày các sản phẩm giáo dục và chăm sóc trẻ em</li>
        <li>Gian hàng sách và tài liệu tham khảo</li>
      </ul>
      
      <h2>Diễn giả đặc biệt</h2>
      <p>Ngày hội vinh dự có sự tham gia của toàn bộ đội ngũ chuyên gia hàng đầu của IPD8, cùng với các khách mời đặc biệt từ các tổ chức quốc tế.</p>
      
      <h2>Đăng ký tham gia</h2>
      <ul>
        <li><strong>Vé gia đình (2 người lớn + 2 trẻ em):</strong> 500.000 VNĐ</li>
        <li><strong>Vé cá nhân:</strong> 150.000 VNĐ</li>
        <li><strong>Trẻ em dưới 2 tuổi:</strong> Miễn phí</li>
      </ul>
      
      <p><strong>Ưu đãi sớm:</strong> Đăng ký trước ngày 31/01/2026 được giảm 20%</p>
      
      <h2>Liên hệ</h2>
      <p>Để biết thêm thông tin và đăng ký tham gia, vui lòng liên hệ:</p>
      <ul>
        <li>Hotline: 0947 70 10 10</li>
        <li>Email: events@ipd8.vn</li>
        <li>Website: www.ipd8.vn</li>
      </ul>
      
      <p>Hẹn gặp các gia đình tại Ngày hội gia đình IPD8 2026!</p>
    `
  },
  {
    id: 9,
    title: 'Workshop "Tâm lý trẻ em và cách đồng hành cùng con"',
    excerpt: 'Workshop tương tác về tâm lý trẻ em, giúp cha mẹ hiểu và đồng hành cùng con trong từng giai đoạn phát triển.',
    image: 'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=800&h=600&fit=crop',
    category: 'Sự kiện',
    date: '2025-12-12',
    author: 'IPD8 Events',
    authorImage: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=200&h=200&fit=crop',
    readTime: '4 phút',
    eventDate: '2026-01-25',
    location: 'Trung tâm IPD8, Hà Nội',
    tags: ['Workshop', 'Tâm lý'],
    slug: 'workshop-tam-ly-tre-em-dong-hanh-cung-con',
    content: `
      <p>Workshop "Tâm lý trẻ em và cách đồng hành cùng con" là chương trình đặc biệt được thiết kế để giúp phụ huynh hiểu sâu hơn về tâm lý trẻ em và học cách đồng hành hiệu quả cùng con trong từng giai đoạn phát triển.</p>
      
      <h2>Tại sao cần hiểu tâm lý trẻ em?</h2>
      <p>Hiểu được tâm lý trẻ em giúp phụ huynh:</p>
      <ul>
        <li>Giao tiếp hiệu quả hơn với con</li>
        <li>Nhận biết và xử lý các vấn đề tâm lý sớm</li>
        <li>Xây dựng mối quan hệ tích cực với con</li>
        <li>Hỗ trợ con phát triển cảm xúc lành mạnh</li>
      </ul>
      
      <h2>Nội dung workshop</h2>
      
      <h3>Phần 1: Tâm lý trẻ em theo từng độ tuổi</h3>
      <ul>
        <li>Đặc điểm tâm lý trẻ 0-12 tháng</li>
        <li>Giai đoạn khủng hoảng tuổi lên 2</li>
        <li>Tâm lý trẻ 3-6 tuổi</li>
        <li>Dấu hiệu phát triển bình thường và bất thường</li>
      </ul>
      
      <h3>Phần 2: Cách đồng hành hiệu quả</h3>
      <ul>
        <li>Kỹ thuật lắng nghe tích cực</li>
        <li>Giao tiếp không lời với trẻ</li>
        <li>Xử lý các tình huống cảm xúc</li>
        <li>Xây dựng kỷ luật tích cực</li>
      </ul>
      
      <h3>Phần 3: Thực hành và tư vấn</h3>
      <ul>
        <li>Thực hành các kỹ thuật đã học</li>
        <li>Q&A với chuyên gia</li>
        <li>Tư vấn cá nhân (nếu cần)</li>
      </ul>
      
      <h2>Diễn giả</h2>
      <p>TS. Phạm Văn Hùng - Chuyên gia Tâm lý trẻ em với hơn 15 năm kinh nghiệm, sẽ trực tiếp dẫn dắt workshop này.</p>
      
      <h2>Thông tin đăng ký</h2>
      <ul>
        <li><strong>Thời gian:</strong> 25/01/2026, 14:00 - 17:00</li>
        <li><strong>Địa điểm:</strong> Trung tâm IPD8, Hà Nội</li>
        <li><strong>Số lượng:</strong> Giới hạn 25 người</li>
        <li><strong>Phí tham gia:</strong> 300.000 VNĐ (đã bao gồm tài liệu và tea break)</li>
      </ul>
      
      <p>Đăng ký sớm để nhận ưu đãi đặc biệt và đảm bảo chỗ ngồi!</p>
    `
  },
  {
    id: 10,
    title: 'Sự kiện: Triển lãm "Hành trình 1.000 ngày đầu đời"',
    excerpt: 'Triển lãm trưng bày các tác phẩm, nghiên cứu và thành tựu trong lĩnh vực chăm sóc và phát triển trẻ em.',
    image: 'https://images.unsplash.com/photo-1566004100631-35d015d6a491?w=800&h=600&fit=crop',
    category: 'Sự kiện',
    date: '2025-12-10',
    author: 'IPD8 Events',
    authorImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    readTime: '3 phút',
    eventDate: '2026-02-15',
    location: 'Bảo tàng Phụ nữ Việt Nam, Hà Nội',
    tags: ['Triển lãm', 'Nghệ thuật'],
    slug: 'trien-lam-hanh-trinh-1000-ngay-dau-doi',
    content: `
      <p>Triển lãm "Hành trình 1.000 ngày đầu đời" là một sự kiện nghệ thuật và giáo dục đặc biệt, kết hợp giữa nghệ thuật thị giác và khoa học để kể câu chuyện về giai đoạn quan trọng nhất trong cuộc đời mỗi con người.</p>
      
      <h2>Ý nghĩa của triển lãm</h2>
      <p>Triển lãm được tổ chức với mục đích nâng cao nhận thức về tầm quan trọng của 1.000 ngày đầu đời - từ khi mang thai đến khi trẻ tròn 2 tuổi. Đây là giai đoạn vàng quyết định sự phát triển toàn diện của trẻ về thể chất, trí tuệ và cảm xúc.</p>
      
      <h2>Nội dung trưng bày</h2>
      
      <h3>Khu vực Nghệ thuật</h3>
      <ul>
        <li>Tác phẩm nghệ thuật mô tả hành trình phát triển của trẻ</li>
        <li>Tranh vẽ và nhiếp ảnh về khoảnh khắc đẹp trong quá trình nuôi dạy con</li>
        <li>Tác phẩm điêu khắc và sắp đặt nghệ thuật</li>
        <li>Triển lãm "Những khoảnh khắc đầu tiên" từ các gia đình</li>
      </ul>
      
      <h3>Khu vực Khoa học</h3>
      <ul>
        <li>Mô hình minh họa sự phát triển của não bộ</li>
        <li>Trưng bày các nghiên cứu khoa học về 1.000 ngày đầu đời</li>
        <li>Infographic về dinh dưỡng và phát triển</li>
        <li>Video tài liệu về các nghiên cứu quốc tế</li>
      </ul>
      
      <h3>Khu vực Tương tác</h3>
      <ul>
        <li>Hoạt động giáo dục tương tác cho trẻ em</li>
        <li>Gian hàng tư vấn từ chuyên gia</li>
        <li>Không gian đọc sách và thư viện mini</li>
        <li>Khu vực chụp ảnh kỷ niệm</li>
      </ul>
      
      <h2>Chương trình đặc biệt</h2>
      <ul>
        <li><strong>Ngày khai mạc:</strong> Talkshow với các chuyên gia hàng đầu</li>
        <li><strong>Cuối tuần:</strong> Workshop giáo dục sớm cho phụ huynh</li>
        <li><strong>Mỗi thứ 7:</strong> Storytelling cho trẻ em</li>
      </ul>
      
      <h2>Thông tin tham quan</h2>
      <ul>
        <li><strong>Thời gian:</strong> 15/02 - 15/03/2026</li>
        <li><strong>Giờ mở cửa:</strong> 9:00 - 18:00 hàng ngày</li>
        <li><strong>Địa điểm:</strong> Bảo tàng Phụ nữ Việt Nam, Hà Nội</li>
        <li><strong>Vé vào cửa:</strong> 50.000 VNĐ/người (trẻ em dưới 6 tuổi miễn phí)</li>
      </ul>
      
      <h2>Nhà tài trợ và đối tác</h2>
      <p>Triển lãm được tổ chức với sự hỗ trợ từ UNICEF Vietnam, Bảo tàng Phụ nữ Việt Nam và các đối tác chiến lược của IPD8.</p>
      
      <p>Đừng bỏ lỡ cơ hội tham quan triển lãm độc đáo này - nơi nghệ thuật gặp gỡ khoa học để tôn vinh hành trình đẹp nhất trong cuộc đời!</p>
    `
  }
]

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

export default function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)
  const router = useRouter()
  const [headerHeight, setHeaderHeight] = useState<string>('104px')
  const [copied, setCopied] = useState(false)
  
  const article = allArticles.find(a => a.slug === slug)
  
  // Related articles (exclude current article)
  const relatedArticles = allArticles.filter(a => a.slug !== slug).slice(0, 4)

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
    const title = article?.title || ''
    
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

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Bài viết không tồn tại</h1>
          <p className="text-gray-600 mb-8">Bài viết bạn tìm kiếm không có trong hệ thống.</p>
          <Link href={ROUTES.BLOG}>
            <Button>Quay lại trang blog</Button>
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
              { label: 'Bài viết', href: ROUTES.BLOG },
              { label: article.title, href: `/blog/${article.slug}` }
            ]}
          />
        </div>
      </div>

      {/* Section 1: Hero / Cover Section */}
      <section className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
        <Image
          src={article.image}
          alt={article.title}
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
                {article.category}
              </Badge>
              <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 leading-tight">
                {article.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-white/90">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(article.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{article.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{article.readTime}</span>
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
              dangerouslySetInnerHTML={{ __html: article.content }}
              style={{
                lineHeight: '1.8',
                fontSize: '1.125rem',
                color: '#374151'
              }}
            />
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mx-auto mt-12 flex flex-wrap gap-2" style={{ maxWidth: '75vw' }}>
              {article.tags.map((tag, index) => (
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

      {/* Section 4: Related Content Slider */}
      {relatedArticles.length > 0 && (
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
              {relatedArticles.map((relatedArticle) => (
                <motion.div
                  key={relatedArticle.id}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                >
                  <Link href={`/blog/${relatedArticle.slug}`}>
                    <Card className="bg-white border-2 border-gray-200 shadow-lg overflow-hidden group hover:shadow-2xl hover:border-[#F441A5] transition-all duration-300 h-full flex flex-col cursor-pointer">
                      <div className="relative h-40 overflow-hidden w-full">
                        <Image
                          src={relatedArticle.image}
                          alt={relatedArticle.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-gradient-to-r from-[#F441A5] to-[#FF5F6D] text-white text-xs">
                            {relatedArticle.category}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-4 flex flex-col flex-grow">
                        <h5 className="text-base font-bold text-gray-900 mb-2 line-clamp-2" style={{ lineHeight: '1.2' }}>
                          {relatedArticle.title}
                        </h5>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(relatedArticle.date)}</span>
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

