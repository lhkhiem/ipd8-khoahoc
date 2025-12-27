'use client'

import { motion } from 'framer-motion'
import { Calendar, Brain, Heart, Target } from 'lucide-react'

export function ThousandDaysSection() {
  const features = [
    {
      icon: Calendar,
      title: 'Từ khi thụ thai đến hai tuổi',
      description: '1000 ngày đầu đời — không chỉ là một khoảnh khắc trong cuộc đời của trẻ, mà là một hành trình hàng ngày.'
    },
    {
      icon: Brain,
      title: '85% kết nối não bộ',
      description: 'Trong giai đoạn này, khoa học đã chứng minh rằng có tới 85% các kết nối não bộ được hình thành.'
    },
    {
      icon: Heart,
      title: 'Mỗi ngày đều quan trọng',
      description: 'Những trải nghiệm hàng ngày thực sự xây dựng nên bộ não của trẻ — và việc học hỏi mỗi ngày đặt nền móng cho những điều tiếp theo.'
    },
    {
      icon: Target,
      title: 'Chương trình được thiết kế đặc biệt',
      description: 'Đảm bảo rằng không có cơ hội nào cho sự phát triển, kết nối hoặc phát huy hết tiềm năng của trẻ bị bỏ lỡ.'
    }
  ]

  return (
    <section className="section-wrapper bg-gradient-to-br from-[#F441A5]/5 via-white to-[#FF5F6D]/5">
      <div className="container-about">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            1000 Ngày Đầu Tiên
          </h2>
          <p className="text-xl md:text-2xl text-gray-700 font-medium">
            Tại Sao Mỗi Ngày Đều Quan Trọng?
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="bg-white p-6 md:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#F441A5] to-[#FF5F6D] rounded-full mb-4 md:mb-6 mx-auto">
                  <Icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 text-center">
                  {feature.title}
                </h3>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed text-center">
                  {feature.description}
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
          className="mt-12 md:mt-16 text-center"
        >
          <p className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-4xl mx-auto italic">
            "Khi mỗi ngày gia đình kết nối bằng tình yêu, mỗi ngày đều góp phần định hình tương lai suốt đời"
          </p>
          <p className="text-base md:text-lg text-gray-600 mt-4 font-medium">
            — Jolie Quynh, Founder
          </p>
        </motion.div>
      </div>
    </section>
  )
}

