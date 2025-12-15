'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, HelpCircle, BookOpen, CreditCard, Users, GraduationCap, Shield, Phone } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Breadcrumb } from '@/components/shared/breadcrumb'
import { ROUTES } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface FAQ {
  question: string
  answer: string
}

interface FAQCategory {
  id: string
  name: string
  icon: typeof HelpCircle
  faqs: FAQ[]
}

const faqCategories: FAQCategory[] = [
  {
    id: 'general',
    name: 'Câu hỏi chung',
    icon: HelpCircle,
    faqs: [
      {
        question: 'IPD8 là gì?',
        answer: 'IPD8 là trung tâm chuyên về 1.000 ngày đầu đời, đồng hành cùng mẹ và bé từ thai kỳ đến 12 tuổi. Chúng tôi cung cấp các khóa học, chương trình tư vấn và hỗ trợ toàn diện cho sự phát triển của trẻ.',
      },
      {
        question: 'IPD8 có những dịch vụ gì?',
        answer: 'IPD8 cung cấp các dịch vụ bao gồm: khóa học cho mẹ bầu, khóa học cho trẻ 0-12 tháng, 13-24 tháng, 3-6 tuổi, gói học thử, combo khóa học, tư vấn chuyên sâu, và các hoạt động cộng đồng.',
      },
      {
        question: 'Tôi có thể đến tham quan trung tâm không?',
        answer: 'Có, bạn hoàn toàn có thể đến tham quan trung tâm. Vui lòng liên hệ hotline 0947 70 10 10 hoặc email contact@ipd8.org để đặt lịch tham quan. Chúng tôi sẽ có nhân viên hướng dẫn và giải đáp mọi thắc mắc của bạn.',
      },
      {
        question: 'IPD8 có hoạt động ở những tỉnh thành nào?',
        answer: 'Hiện tại IPD8 có trung tâm tại Hà Nội và TP. Hồ Chí Minh. Chúng tôi cũng cung cấp các khóa học online để phục vụ các gia đình ở các tỉnh thành khác.',
      },
    ],
  },
  {
    id: 'courses',
    name: 'Về các khóa học',
    icon: BookOpen,
    faqs: [
      {
        question: 'Các khóa học tại IPD8 kéo dài bao lâu?',
        answer: 'Thời gian khóa học tùy thuộc vào từng chương trình. Gói học thử là 1 buổi (60 phút), các khóa học chính thường kéo dài từ 8-12 buổi, mỗi buổi 60-90 phút. Bạn có thể xem chi tiết thời gian của từng khóa học trên trang thông tin khóa học.',
      },
      {
        question: 'Tôi có thể đăng ký nhiều khóa học cùng lúc không?',
        answer: 'Có, bạn hoàn toàn có thể đăng ký nhiều khóa học cùng lúc. IPD8 còn có các gói combo với ưu đãi đặc biệt khi đăng ký nhiều khóa học. Vui lòng liên hệ tư vấn viên để được tư vấn gói phù hợp nhất.',
      },
      {
        question: 'Tôi có thể đổi lịch học không?',
        answer: 'Có, bạn có thể đổi lịch học miễn phí trước 48 giờ. Vui lòng liên hệ hotline 0947 70 10 10 hoặc email contact@ipd8.org để được hỗ trợ đổi lịch. Lưu ý: đổi lịch trong vòng 48 giờ có thể phát sinh phí.',
      },
      {
        question: 'Nếu tôi bỏ lỡ một buổi học thì sao?',
        answer: 'Nếu bạn bỏ lỡ một buổi học, bạn có thể học bù trong các buổi học bù được sắp xếp hàng tuần. Vui lòng thông báo trước để chúng tôi sắp xếp lịch học bù phù hợp.',
      },
      {
        question: 'Các khóa học có tài liệu học tập không?',
        answer: 'Có, tất cả các khóa học đều có tài liệu học tập kèm theo, bao gồm sách hướng dẫn, video bài giảng, và các tài liệu thực hành. Bạn sẽ nhận được tài liệu khi bắt đầu khóa học.',
      },
    ],
  },
  {
    id: 'pricing',
    name: 'Giá cả & Thanh toán',
    icon: CreditCard,
    faqs: [
      {
        question: 'Giá các khóa học tại IPD8 là bao nhiêu?',
        answer: 'Giá các khóa học tại IPD8 dao động từ 99.000đ (gói học thử) đến vài triệu đồng tùy theo khóa học và số buổi. Bạn có thể xem chi tiết giá trên trang thông tin từng khóa học hoặc liên hệ tư vấn viên để được báo giá cụ thể.',
      },
      {
        question: 'IPD8 có chính sách ưu đãi gì không?',
        answer: 'IPD8 có nhiều chương trình ưu đãi như: giảm giá cho đăng ký sớm, ưu đãi combo khi đăng ký nhiều khóa học, giảm giá cho gia đình có hoàn cảnh khó khăn, và các chương trình khuyến mãi theo mùa. Vui lòng theo dõi website hoặc fanpage để cập nhật các ưu đãi mới nhất.',
      },
      {
        question: 'Tôi có thể thanh toán bằng cách nào?',
        answer: 'Bạn có thể thanh toán bằng tiền mặt, chuyển khoản ngân hàng, hoặc thanh toán online qua thẻ tín dụng/thẻ ghi nợ. Chúng tôi hỗ trợ thanh toán trả góp cho các khóa học có giá trị cao.',
      },
      {
        question: 'Tôi có được hoàn tiền nếu không hài lòng không?',
        answer: 'Có, IPD8 cam kết hoàn tiền 100% nếu bạn không hài lòng với khóa học trong vòng 7 ngày kể từ buổi học đầu tiên. Vui lòng liên hệ bộ phận chăm sóc khách hàng để được hỗ trợ.',
      },
    ],
  },
  {
    id: 'instructors',
    name: 'Về giảng viên',
    icon: Users,
    faqs: [
      {
        question: 'Giảng viên tại IPD8 có trình độ như thế nào?',
        answer: 'Tất cả giảng viên tại IPD8 đều là các chuyên gia đầu ngành, có bằng cấp chuyên môn cao và nhiều năm kinh nghiệm trong lĩnh vực chăm sóc và phát triển trẻ em. Nhiều giảng viên có học vị Thạc sĩ, Tiến sĩ và các chứng chỉ quốc tế.',
      },
      {
        question: 'Tôi có thể chọn giảng viên không?',
        answer: 'Bạn có thể yêu cầu học với giảng viên cụ thể khi đăng ký khóa học. Tuy nhiên, việc sắp xếp sẽ phụ thuộc vào lịch của giảng viên và số lượng học viên. Chúng tôi sẽ cố gắng đáp ứng yêu cầu của bạn.',
      },
      {
        question: 'Tôi có thể liên hệ trực tiếp với giảng viên không?',
        answer: 'Sau mỗi buổi học, bạn có thể trao đổi trực tiếp với giảng viên. Nếu cần tư vấn thêm, bạn có thể đặt lịch tư vấn riêng với giảng viên thông qua bộ phận chăm sóc khách hàng.',
      },
    ],
  },
  {
    id: 'trial',
    name: 'Gói học thử',
    icon: GraduationCap,
    faqs: [
      {
        question: 'Gói học thử 99K có gì?',
        answer: 'Gói học thử 99K bao gồm 1 buổi học (60 phút) với đầy đủ nội dung và tài liệu như các khóa học chính thức. Bạn sẽ được trải nghiệm phương pháp giảng dạy, tương tác với giảng viên, và nhận tư vấn miễn phí sau buổi học.',
      },
      {
        question: 'Tôi có thể đổi lịch buổi học thử không?',
        answer: 'Có, bạn có thể đổi lịch buổi học thử miễn phí trước 48 giờ. Vui lòng liên hệ hotline 0947 70 10 10 hoặc email contact@ipd8.org để được hỗ trợ đổi lịch.',
      },
      {
        question: 'Sau buổi học thử, tôi có được tư vấn miễn phí không?',
        answer: 'Có, sau mỗi buổi học thử, bạn sẽ được tư vấn miễn phí 10 phút với giảng viên về phương pháp phù hợp cho bé và các gói học tiếp theo. Nếu cần tư vấn chi tiết hơn, bạn có thể đặt lịch tư vấn riêng.',
      },
      {
        question: 'Tôi có thể hoàn tiền nếu không hài lòng với buổi học thử không?',
        answer: 'Có, chúng tôi cam kết hoàn tiền 100% nếu bạn không hài lòng với buổi học thử trong vòng 24 giờ sau khi kết thúc buổi học. Vui lòng liên hệ bộ phận chăm sóc khách hàng để được hỗ trợ.',
      },
    ],
  },
  {
    id: 'policies',
    name: 'Chính sách & Quy định',
    icon: Shield,
    faqs: [
      {
        question: 'Chính sách hủy và hoàn tiền của IPD8 như thế nào?',
        answer: 'Bạn có thể hủy khóa học và được hoàn tiền 100% nếu hủy trước 7 ngày khai giảng. Hủy trong vòng 3-7 ngày trước khai giảng được hoàn 70% học phí. Hủy trong vòng 3 ngày trước khai giảng được hoàn 50% học phí. Sau khi khóa học bắt đầu, không thể hoàn tiền nhưng có thể chuyển sang khóa học khác.',
      },
      {
        question: 'IPD8 có chính sách bảo vệ thông tin cá nhân không?',
        answer: 'Có, IPD8 cam kết bảo mật tuyệt đối thông tin cá nhân của học viên. Chúng tôi tuân thủ nghiêm ngặt Luật Bảo vệ Thông tin Cá nhân và không chia sẻ thông tin với bên thứ ba mà không có sự đồng ý của bạn.',
      },
      {
        question: 'Tôi có thể chuyển nhượng khóa học cho người khác không?',
        answer: 'Có, bạn có thể chuyển nhượng khóa học cho người khác với phí chuyển nhượng 10% giá trị khóa học. Vui lòng liên hệ bộ phận chăm sóc khách hàng để được hỗ trợ thủ tục chuyển nhượng.',
      },
    ],
  },
  {
    id: 'contact',
    name: 'Liên hệ & Hỗ trợ',
    icon: Phone,
    faqs: [
      {
        question: 'Làm thế nào để liên hệ với IPD8?',
        answer: 'Bạn có thể liên hệ với IPD8 qua: Hotline: 0947 70 10 10 (8:00 - 20:00 hàng ngày), Email: contact@ipd8.org, Hoặc đến trực tiếp tại trung tâm. Chúng tôi luôn sẵn sàng hỗ trợ bạn.',
      },
      {
        question: 'IPD8 có hỗ trợ tư vấn online không?',
        answer: 'Có, IPD8 cung cấp dịch vụ tư vấn online qua video call với các chuyên gia. Bạn có thể đặt lịch tư vấn online thông qua website hoặc liên hệ hotline. Phí tư vấn online tùy thuộc vào thời gian và chuyên gia.',
      },
      {
        question: 'Tôi có thể đặt lịch tư vấn riêng không?',
        answer: 'Có, bạn hoàn toàn có thể đặt lịch tư vấn riêng với các chuyên gia tại IPD8. Vui lòng liên hệ hotline hoặc email để đặt lịch. Chúng tôi sẽ sắp xếp thời gian phù hợp nhất cho bạn.',
      },
    ],
  },
]

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
}

export default function FAQsPage() {
  const [activeCategory, setActiveCategory] = useState<string>('general')

  const activeCategoryData = faqCategories.find(cat => cat.id === activeCategory) || faqCategories[0]

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b">
        <div className="container-custom py-4">
          <Breadcrumb
            items={[
              { label: 'FAQs & Chính sách', href: ROUTES.FAQS }
            ]}
          />
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-8 md:py-12 px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20">
        <div className="container-custom max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-[#F441A5] to-[#FF5F6D] rounded-2xl p-8 md:p-12">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4" style={{ lineHeight: '1.2' }}>
                CÂU HỎI THƯỜNG GẶP
              </h1>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                Tìm câu trả lời cho những thắc mắc phổ biến về IPD8 và các dịch vụ của chúng tôi
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="py-6 md:py-8 px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20">
        <div className="container-custom max-w-6xl mx-auto">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <div className="flex flex-wrap items-center justify-center gap-3">
              {faqCategories.map((category) => {
                const Icon = category.icon
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={cn(
                      'flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm md:text-base transition-all duration-200',
                      activeCategory === category.id
                        ? 'bg-gradient-to-r from-[#F441A5] to-[#FF5F6D] text-white shadow-lg scale-105'
                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-[#F441A5] hover:text-[#F441A5]'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{category.name}</span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="pt-8 md:pt-12 pb-4 md:pb-6 px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20">
        <div className="container-custom max-w-4xl mx-auto">
          <div 
            className="rounded-2xl p-6 md:p-8 lg:p-10 relative overflow-hidden"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1920&h=1080&fit=crop&q=80)',
              backgroundAttachment: 'fixed',
              backgroundPosition: 'center',
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
            }}
          >
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Category Header */}
              <motion.div
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="flex items-center gap-4 mb-8"
              >
                {(() => {
                  const Icon = activeCategoryData.icon
                  return (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#F441A5] to-[#FF5F6D] flex items-center justify-center">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  )
                })()}
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white" style={{ lineHeight: '1.2' }}>
                    {activeCategoryData.name}
                  </h2>
                  <p className="text-white/80 mt-1">
                    {activeCategoryData.faqs.length} câu hỏi
                  </p>
                </div>
              </motion.div>

              {/* FAQ Accordion */}
              <motion.div
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
              >
                <Accordion type="single" collapsible className="space-y-4">
                  {activeCategoryData.faqs.map((faq, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                    >
                      <AccordionItem
                        value={`item-${index}`}
                        className="border-2 border-white/20 rounded-2xl px-6 data-[state=open]:border-[#F441A5] transition-all duration-300 bg-white/10 backdrop-blur-sm shadow-sm hover:shadow-md"
                      >
                        <AccordionTrigger className="text-left hover:no-underline py-6 w-full [&>svg]:text-[#F441A5] [&>svg]:h-5 [&>svg]:w-5 [&>svg]:shrink-0">
                          <span className="text-lg font-semibold text-white pr-4 flex-1 text-left">
                            {faq.question}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="pb-6 text-base text-white/90 leading-relaxed">
                          <div className="pr-8">
                            {faq.answer}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </motion.div>
                  ))}
                </Accordion>
              </motion.div>
            </motion.div>
          </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="pt-4 md:pt-6 pb-8 md:pb-12 px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20">
        <div className="container-custom max-w-4xl mx-auto">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center bg-gradient-to-r from-[#F441A5] to-[#FF5F6D] rounded-2xl p-8 md:p-12 text-white"
          >
            <h3 className="text-2xl md:text-3xl font-bold mb-4" style={{ lineHeight: '1.2' }}>
              Vẫn chưa tìm thấy câu trả lời?
            </h3>
            <p className="text-lg mb-6 text-white/90">
              Đội ngũ tư vấn của chúng tôi luôn sẵn sàng hỗ trợ bạn
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:0947701010"
                className="px-6 py-3 bg-white text-[#F441A5] rounded-full font-semibold hover:bg-gray-100 transition-all duration-200 hover:scale-105"
              >
                Gọi ngay: 0947 70 10 10
              </a>
              <a
                href={`mailto:contact@ipd8.org`}
                className="px-6 py-3 bg-white/10 backdrop-blur-sm border-2 border-white text-white rounded-full font-semibold hover:bg-white/20 transition-all duration-200 hover:scale-105"
              >
                Gửi email
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

