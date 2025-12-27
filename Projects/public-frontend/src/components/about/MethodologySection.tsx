'use client'

import { motion } from 'framer-motion'
import { Users, BookOpen, Brain, CheckCircle2 } from 'lucide-react'

export function MethodologySection() {
  const methods = [
    {
      icon: Users,
      title: 'Nhóm nhỏ 8-10 gia đình',
      description: 'Các điều phối viên y tế của chúng tôi hướng dẫn nhóm nhỏ gồm 8–10 gia đình qua những buổi học ngắn 30 phút.'
    },
    {
      icon: BookOpen,
      title: 'Bắt đầu từ trải nghiệm',
      description: 'Mỗi buổi học bắt đầu từ trải nghiệm ngày hôm trước – ví dụ: nếu hôm qua trẻ được khám phá kết cấu vật thể, hôm nay cha mẹ sẽ được quan sát bản đồ não bộ để hiểu vùng nào đang xử lý cảm giác đó.'
    },
    {
      icon: Brain,
      title: 'Chuyên gia tí hon',
      description: 'Mỗi thành viên trong gia đình sẽ trở thành một "chuyên gia tí hon", đảm nhiệm một vùng não cụ thể và giải thích vai trò của nó – từ đó kết nối khoa học với mục tiêu riêng của họ.'
    },
    {
      icon: CheckCircle2,
      title: 'Kết quả đo lường được',
      description: 'Mỗi hoạt động đều có mục tiêu rõ ràng, hướng dẫn từng bước và liên hệ trực tiếp đến các hệ thống trong não bộ. Gia đình được khuyến khích quan sát, ghi nhận và ăn mừng các cột mốc phát triển.'
    }
  ]

  return (
    <section className="section-wrapper bg-gradient-to-br from-gray-50 to-white">
      <div className="container-about">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            Phương Pháp Triển Khai
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Các hoạt động gắn kết hàng ngày, hướng dẫn cụ thể qua minh họa thực hành, cùng sự đồng hành của chuyên gia
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {methods.map((method, index) => {
            const Icon = method.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="bg-white p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#F441A5] to-[#FF5F6D] rounded-full mb-4 md:mb-6">
                  <Icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3">
                  {method.title}
                </h3>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                  {method.description}
                </p>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-12 md:mt-16 bg-white border-2 border-[#F441A5]/20 p-8 md:p-10 rounded-2xl"
        >
          <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-4">
            <strong className="text-gray-900">Tài liệu đa ngôn ngữ:</strong> Tất cả tài liệu đều đa ngôn ngữ, được thiết kế theo hướng an toàn về văn hóa và nhạy cảm với sang chấn.
          </p>
          <p className="text-base md:text-lg text-gray-700 leading-relaxed">
            <strong className="text-gray-900">Kết quả có thể đo lường được:</strong> Đảm bảo rằng mỗi gia đình ra về với sự tự tin, kỹ năng và kết nối với một cộng đồng học tập hỗ trợ.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

