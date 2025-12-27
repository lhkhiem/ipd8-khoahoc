'use client'

import { useState, useEffect } from 'react'
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
        question: 'Chương trình IPD8 là gì?',
        answer: 'IPD8 là chương trình giáo dục sớm đầu tiên tại Việt Nam tích hợp khoa học di truyền, tâm lý học hành vi và khoa học thần kinh, được thiết kế cho 1.000 ngày vàng đầu tiên (từ khi mang thai đến 2 tuổi) - giai đoạn quan trọng nhất cho sự phát triển của trẻ.',
      },
      {
        question: 'Những chuyên gia đứng sau IPD8 là ai?',
        answer: 'Chúng tôi là những chuyên gia trong các lãnh vực sử dụng giải mã gen, phân tích hành vi và các mốc phát triển cụ thể theo từng giai đoạn để tạo ra lộ trình học tập riêng biệt cho từng trẻ. Điều này đảm bảo các hoạt động học tập phù hợp với thế mạnh, nhu cầu và tốc độ tự nhiên của trẻ.',
      },
      {
        question: 'Chương trình được cá nhân hóa như thế nào cho con tôi?',
        answer: 'Chương trình của chúng tôi được đồng phát triển bởi các chuyên gia hàng đầu từ New Zealand và Việt Nam, bao gồm các nhà giáo dục, nhà tâm lý học, bác sĩ nhi khoa và chuyên gia dinh dưỡng, đảm bảo tính chính xác về mặt khoa học và phù hợp với văn hóa.',
      },
    ],
  },
  {
    id: 'services',
    name: 'Gói dịch vụ',
    icon: BookOpen,
    faqs: [
      {
        question: 'Bạn cung cấp những gói dịch vụ nào?',
        answer: 'Chúng tôi cung cấp hai gói dịch vụ chính:\n\n• Gói Tiêu chuẩn – Chương trình 3 giai đoạn hoàn chỉnh với sự hướng dẫn nhóm và hỗ trợ cộng đồng.\n\n• Gói Cao cấp – Bao gồm các quyền lợi Tiêu chuẩn cùng với hỗ trợ chuyên gia 1:1, tư vấn chuyên sâu và quyền ưu tiên tham gia các hoạt động độc quyền.',
      },
      {
        question: 'Bạn có hỗ trợ những trường hợp đặc biệt (ví dụ: thụ tinh trong ống nghiệm, cha mẹ đơn thân) không?',
        answer: 'Có. Chúng tôi cung cấp các chương trình phù hợp cho trẻ em thụ tinh trong ống nghiệm, các nhóm nhạy cảm và các gia đình cha/mẹ đơn thân để đáp ứng nhu cầu riêng của họ.',
      },
    ],
  },
  {
    id: 'pricing',
    name: 'Giá cả & Đăng ký',
    icon: CreditCard,
    faqs: [
      {
        question: 'Chương trình này có giá bao nhiêu?',
        answer: 'Giá cả phụ thuộc vào gói dịch vụ và các dịch vụ bổ sung bạn chọn. Vui lòng liên hệ với chúng tôi để được tư vấn và báo giá cụ thể.',
      },
      {
        question: 'Tôi có thể dùng thử chương trình trước khi đăng ký không?',
        answer: 'Có! Chúng tôi cung cấp chương trình dùng thử miễn phí, nơi bạn có thể trải nghiệm các bài học điển hình theo từng giai đoạn của con mình và nhận được bài đánh giá ban đầu cùng lộ trình học tập cá nhân hóa — hoàn toàn miễn phí.',
      },
      {
        question: 'Tôi có thể đăng ký như thế nào?',
        answer: 'Chỉ cần điền vào mẫu đăng ký trực tuyến của chúng tôi hoặc liên hệ đường dây nóng IPD8. Đội ngũ của chúng tôi sẽ hướng dẫn bạn trong suốt quá trình.',
      },
    ],
  },
  {
    id: 'contact',
    name: 'Liên hệ',
    icon: Phone,
    faqs: [
      {
        question: 'Làm thế nào để liên hệ với IPD8?',
        answer: 'Bạn có thể liên hệ với IPD8 qua hotline hoặc đến trực tiếp tại địa chỉ: Tầng 8, Tòa nhà Vietnam Business Center, số 57-59 đường Hồ Tùng Mậu, Phường Sài Gòn, TP. HCM. Đội ngũ của chúng tôi sẽ hướng dẫn bạn trong suốt quá trình.',
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
  const [headerHeight, setHeaderHeight] = useState<string>('104px')
  const [activeCategory, setActiveCategory] = useState<string>('general')

  // Calculate header height
  useEffect(() => {
    const updateHeaderHeight = () => {
      if (typeof window === 'undefined') return

      const header = document.querySelector('header')
      if (header) {
        const actualHeight = header.offsetHeight
        setHeaderHeight(`${actualHeight}px`)
      } else {
        setHeaderHeight(window.innerWidth >= 768 ? '140px' : '104px')
      }
    }

    updateHeaderHeight()

    const handleResize = () => {
      requestAnimationFrame(() => {
        updateHeaderHeight()
      })
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize)
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', updateHeaderHeight)
    } else {
      updateHeaderHeight()
    }

    const timeoutId = setTimeout(updateHeaderHeight, 100)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize)
      }
      document.removeEventListener('DOMContentLoaded', updateHeaderHeight)
      clearTimeout(timeoutId)
    }
  }, [])

  const activeCategoryData = faqCategories.find(cat => cat.id === activeCategory) || faqCategories[0]

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b" style={{ marginTop: headerHeight }}>
        <div className="container-custom py-4">
          <Breadcrumb
            items={[
              { label: 'FAQs & Chính sách', href: ROUTES.FAQS }
            ]}
          />
        </div>
      </div>

      {/* Hero Section */}
      <section className="border-b py-8 md:py-12 px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20">
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
                          <div className="pr-8 whitespace-pre-line">
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
            <p className="text-lg mb-4 text-white/90">
              Đội ngũ tư vấn của chúng tôi luôn sẵn sàng hỗ trợ bạn. Vui lòng liên hệ với chúng tôi nếu bạn không tìm thấy câu trả lời cho câu hỏi của mình.
            </p>
            <p className="text-base mb-6 text-white/80">
              Địa chỉ: Tầng 8, Tòa nhà Vietnam Business Center, số 57-59 đường Hồ Tùng Mậu, Phường Sài Gòn, TP. HCM
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:0947701010"
                className="px-6 py-3 bg-white text-[#F441A5] rounded-full font-semibold hover:bg-gray-100 transition-all duration-200 hover:scale-105"
              >
                Gọi ngay: 0947 70 10 10
              </a>
              <a
                href={`mailto:website@otbcreatives.com`}
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

