'use client'

import { motion } from 'framer-motion'
import { Eye, Target, Heart, Shield } from 'lucide-react'

export function VisionMissionSection() {
  return (
    <section className="section-wrapper bg-white">
      <div className="container-about">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            Tầm Nhìn Và Sứ Mệnh
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Tầm Nhìn */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-[#F441A5]/10 to-[#FF5F6D]/10 p-8 md:p-10 rounded-2xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#F441A5] to-[#FF5F6D] rounded-full">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                Tầm Nhìn
              </h3>
            </div>
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed font-medium">
              VÌ MỘT THẾ HỆ TRẺ EM ĐƯỢC GẮN KẾT VỚI CHA MẸ MỖI NGÀY VÀ MỘT CỘNG ĐỒNG CHA MẸ HIỆN ĐẠI NUÔI CON BẰNG TÌNH YÊU VÀ KHOA HỌC
            </p>
          </motion.div>

          {/* Sứ Mệnh */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-[#FF5F6D]/10 to-[#F441A5]/10 p-8 md:p-10 rounded-2xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#FF5F6D] to-[#F441A5] rounded-full">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                Sứ Mệnh
              </h3>
            </div>
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
              Định hướng cho cha mẹ trong giai đoạn cửa sổ vàng phát triển não bộ. Mỗi khoảnh khắc nhỏ đều góp phần xây dựng năng lực suốt đời thông qua các hoạt động có chủ đích.
            </p>
          </motion.div>
        </div>

        {/* Cam Kết */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mt-12 md:mt-16 bg-white border-2 border-[#F441A5]/20 p-8 md:p-10 rounded-2xl"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#F441A5] to-[#FF5F6D] rounded-full">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
              Cam Kết Của Chúng Tôi
            </h3>
          </div>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <Heart className="w-6 h-6 text-[#F441A5] shrink-0 mt-1" />
              <p className="text-base md:text-lg text-gray-700">
                Trẻ là trung tâm trong mọi hoạt động
              </p>
            </li>
            <li className="flex items-start gap-3">
              <Heart className="w-6 h-6 text-[#F441A5] shrink-0 mt-1" />
              <p className="text-base md:text-lg text-gray-700">
                Lộ trình học tập của cha mẹ được cá nhân hóa, được dệt nên từ giá trị gia đình
              </p>
            </li>
            <li className="flex items-start gap-3">
              <Heart className="w-6 h-6 text-[#F441A5] shrink-0 mt-1" />
              <p className="text-base md:text-lg text-gray-700">
                Mỗi hoạt động đều nuôi dưỡng mối quan hệ gắn bó, yêu thương bền chặt giữa em bé, cha mẹ và gia đình
              </p>
            </li>
            <li className="flex items-start gap-3">
              <Heart className="w-6 h-6 text-[#F441A5] shrink-0 mt-1" />
              <p className="text-base md:text-lg text-gray-700">
                Phù hợp với hướng dẫn của Tổ chức Y tế Thế giới (WHO), Bộ Y tế, UNICEF và chương trình giáo dục Te Whāriki – nền tảng tiếp cận toàn diện, lấy gia đình làm trung tâm
              </p>
            </li>
          </ul>
        </motion.div>
      </div>
    </section>
  )
}

