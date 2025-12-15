'use client'

import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface FAQ {
  question: string
  answer: string
}

const faqs: FAQ[] = [
  {
    question: 'Tôi có thể hoàn tiền nếu không hài lòng với buổi học thử không?',
    answer: 'Có, chúng tôi cam kết hoàn tiền 100% nếu bạn không hài lòng với buổi học thử trong vòng 24 giờ sau khi kết thúc buổi học. Vui lòng liên hệ bộ phận chăm sóc khách hàng để được hỗ trợ.',
  },
  {
    question: 'Tôi có thể đổi lịch buổi học thử không?',
    answer: 'Có, bạn có thể đổi lịch buổi học thử miễn phí trước 48 giờ. Vui lòng liên hệ hotline 0947 70 10 10 hoặc email contact@ipd8.org để được hỗ trợ đổi lịch.',
  },
  {
    question: 'Tôi cần chuẩn bị gì cho buổi học thử?',
    answer: 'Bạn chỉ cần chuẩn bị tinh thần thoải mái và mang theo bé (nếu có). Chúng tôi sẽ cung cấp đầy đủ tài liệu và dụng cụ học tập trong buổi học. Mẹ nên mặc quần áo thoải mái để dễ dàng tham gia các hoạt động.',
  },
  {
    question: 'Buổi học thử kéo dài bao lâu?',
    answer: 'Buổi học thử kéo dài 60 phút, bao gồm phần giới thiệu phương pháp (15 phút), thực hành với bé (35 phút), và tư vấn sau buổi học (10 phút).',
  },
  {
    question: 'Sau buổi học thử, tôi có được tư vấn miễn phí không?',
    answer: 'Có, sau mỗi buổi học thử, bạn sẽ được tư vấn miễn phí 10 phút với giảng viên về phương pháp phù hợp cho bé và các gói học tiếp theo. Nếu cần tư vấn chi tiết hơn, bạn có thể đặt lịch tư vấn riêng.',
  },
]

export function FAQBlock() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full bg-white py-16 md:py-20 lg:py-24 overflow-x-hidden"
    >
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" style={{ lineHeight: '1.2' }}>
            Câu hỏi thường gặp
          </h2>
          <p className="text-lg text-gray-600">
            Những câu hỏi phổ biến về gói học thử
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border-2 border-gray-200 rounded-2xl px-6 data-[state=open]:border-[#F441A5] transition-colors"
            >
              <AccordionTrigger className="text-left hover:no-underline py-6">
                <span className="text-lg font-semibold text-gray-900 pr-4">
                  {faq.question}
                </span>
                <ChevronDown className="h-5 w-5 text-[#F441A5] shrink-0 transition-transform duration-200" />
              </AccordionTrigger>
              <AccordionContent className="pb-6 text-gray-700 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </motion.section>
  )
}

