'use client'

import { AboutHero } from '@/components/about/AboutHero'
import { AboutSection } from '@/components/about/AboutSection'
import { FinalCTA } from '@/components/about/FinalCTA'

// Content data for about sections
const aboutSections = [
  {
    image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=1200&h=800&fit=crop',
    imageAlt: 'Mẹ và bé học tập cùng nhau',
    title: 'Sứ Mệnh Của Chúng Tôi',
    description: 'IPD8 cam kết mang đến nền tảng học tập trực tuyến hàng đầu cho mẹ và bé, tập trung vào giai đoạn quan trọng từ thai kỳ đến 12 tuổi. Chúng tôi tuân thủ các khuyến nghị của WHO và UNICEF về "1.000 ngày đầu đời" - giai đoạn vàng quyết định sự phát triển toàn diện của trẻ.',
    bullets: [
      'Đồng hành cùng gia đình trong hành trình nuôi dạy con',
      'Cung cấp kiến thức khoa học và thực tiễn',
      'Hỗ trợ phát triển toàn diện cho cả mẹ và bé',
      'Xây dựng cộng đồng phụ huynh tích cực',
    ],
    reverse: false,
  },
  {
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=1200&h=800&fit=crop',
    imageAlt: 'Chuyên gia tư vấn cho mẹ và bé',
    title: 'Phương Pháp Giảng Dạy Hiện Đại',
    description: 'Với đội ngũ chuyên gia giàu kinh nghiệm và phương pháp giáo dục hiện đại, IPD8 kết hợp lý thuyết khoa học với thực hành thực tế. Mỗi khóa học được thiết kế dựa trên nghiên cứu mới nhất về phát triển trẻ em và tâm lý học gia đình.',
    bullets: [
      'Chương trình học được cá nhân hóa theo từng giai đoạn',
      'Phương pháp tương tác và thực hành',
      'Hỗ trợ liên tục từ đội ngũ chuyên gia',
      'Cập nhật kiến thức mới nhất từ các tổ chức quốc tế',
    ],
    reverse: true,
  },
  {
    image: 'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=1200&h=800&fit=crop',
    imageAlt: 'Đội ngũ chuyên gia IPD8',
    title: 'Đội Ngũ Chuyên Gia Hàng Đầu',
    description: 'IPD8 tự hào có đội ngũ chuyên gia giàu kinh nghiệm trong các lĩnh vực nhi khoa, dinh dưỡng, tâm lý trẻ em, và giáo dục sớm. Các chuyên gia của chúng tôi đều có bằng cấp cao và nhiều năm kinh nghiệm thực tế.',
    bullets: [
      'Bác sĩ nhi khoa và sản khoa hàng đầu',
      'Chuyên gia dinh dưỡng được chứng nhận',
      'Nhà tâm lý học trẻ em',
      'Giảng viên giáo dục sớm có chứng chỉ quốc tế',
    ],
    reverse: false,
  },
  {
    image: 'https://images.unsplash.com/photo-1566004100631-35d015d6a491?w=1200&h=800&fit=crop',
    imageAlt: 'Gia đình hạnh phúc với IPD8',
    title: 'Giá Trị Cốt Lõi',
    description: 'IPD8 được xây dựng trên nền tảng của sự tin cậy, chuyên nghiệp và tận tâm. Chúng tôi tin rằng mỗi đứa trẻ đều có tiềm năng vô hạn và mỗi gia đình đều xứng đáng có được sự hỗ trợ tốt nhất trong hành trình nuôi dạy con.',
    bullets: [
      'Chất lượng giáo dục được đảm bảo',
      'Tôn trọng sự đa dạng của mỗi gia đình',
      'Cam kết đồng hành lâu dài',
      'Minh bạch và trách nhiệm',
    ],
    reverse: true,
  },
  {
    image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1200&h=800&fit=crop',
    imageAlt: 'Thành tựu và thành công',
    title: 'Thành Tựu Và Tác Động',
    description: 'Kể từ khi thành lập, IPD8 đã đồng hành cùng hàng nghìn gia đình trong hành trình nuôi dạy con. Chúng tôi tự hào về những thành tựu đã đạt được và cam kết tiếp tục nỗ lực để mang đến giá trị tốt nhất cho cộng đồng.',
    bullets: [
      'Hơn 10,000+ gia đình đã tin tưởng',
      '50+ khóa học chất lượng cao',
      '98% phụ huynh hài lòng',
      '20+ chuyên gia giàu kinh nghiệm',
    ],
    reverse: false,
  },
  {
    image: 'https://images.unsplash.com/photo-1445633629932-0029acc44e88?w=1200&h=800&fit=crop',
    imageAlt: 'Tương lai của IPD8',
    title: 'Tầm Nhìn Tương Lai',
    description: 'IPD8 hướng tới trở thành nền tảng giáo dục hàng đầu khu vực, mở rộng các chương trình học tập và hỗ trợ nhiều gia đình hơn nữa. Chúng tôi không ngừng đổi mới và cải thiện để mang đến trải nghiệm tốt nhất.',
    bullets: [
      'Mở rộng chương trình học cho nhiều độ tuổi hơn',
      'Phát triển công nghệ học tập thông minh',
      'Xây dựng cộng đồng phụ huynh toàn quốc',
      'Hợp tác với các tổ chức quốc tế',
    ],
    reverse: true,
  },
]

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <AboutHero />

      {/* Alternating Content Sections */}
      {aboutSections.map((section, index) => (
        <AboutSection
          key={index}
          image={section.image}
          imageAlt={section.imageAlt}
          title={section.title}
          description={section.description}
          bullets={section.bullets}
          reverse={section.reverse}
          index={index}
        />
      ))}

      {/* Final CTA Section */}
      <FinalCTA />
    </div>
  )
}

