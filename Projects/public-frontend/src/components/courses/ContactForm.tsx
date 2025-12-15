'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'

interface ContactFormProps {
  parallax?: boolean
}

export function ContactForm({ parallax = false }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    course: '',
    studyMode: '',
    message: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log('Form submitted:', formData)
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6 }}
      className={`w-full py-20 md:py-24 lg:py-28 overflow-x-hidden relative ${
        parallax ? '' : 'bg-gray-50'
      }`}
      style={
        parallax
          ? {
              backgroundImage: 'url(https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1920&h=1080&fit=crop&q=80)',
              backgroundAttachment: 'fixed',
              backgroundPosition: 'center',
              backgroundSize: 'cover',
              backgroundRepeat: 'no-repeat',
            }
          : undefined
      }
    >
      {parallax && (
        <>
          {/* Gradient Overlay for better readability */}
          <div className="absolute inset-0 bg-gray-50/85"></div>
        </>
      )}
      <div className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${parallax ? 'relative z-10' : ''}`}>
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            ĐĂNG KÝ TƯ VẤN
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Điền thông tin để được tư vấn chi tiết về các gói học phù hợp
          </p>
        </div>

        <Card className="bg-white border-2 border-gray-100 shadow-lg">
          <CardContent className="p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-900 font-semibold">
                    Họ và tên <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="border-2 border-gray-200 focus:border-[#F441A5] focus:ring-[#F441A5]/20 transition-all"
                    placeholder="Nhập họ và tên"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-900 font-semibold">
                    Số điện thoại <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="border-2 border-gray-200 focus:border-[#F441A5] focus:ring-[#F441A5]/20 transition-all"
                    placeholder="Nhập số điện thoại"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-900 font-semibold">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="border-2 border-gray-200 focus:border-[#F441A5] focus:ring-[#F441A5]/20 transition-all"
                    placeholder="Nhập email"
                  />
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-gray-900 font-semibold">
                    Địa chỉ <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="address"
                    required
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    className="border-2 border-gray-200 focus:border-[#F441A5] focus:ring-[#F441A5]/20 transition-all"
                    placeholder="Nhập địa chỉ"
                  />
                </div>

                {/* Course */}
                <div className="space-y-2">
                  <Label htmlFor="course" className="text-gray-900 font-semibold">
                    Khóa học quan tâm <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.course}
                    onValueChange={(value) => handleChange('course', value)}
                    required
                  >
                    <SelectTrigger className="border-2 border-gray-200 focus:border-[#F441A5] focus:ring-[#F441A5]/20">
                      <SelectValue placeholder="Chọn khóa học" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="me-bau">Dành cho mẹ bầu</SelectItem>
                      <SelectItem value="0-12-thang">0-12 tháng</SelectItem>
                      <SelectItem value="13-24-thang">13-24 tháng</SelectItem>
                      <SelectItem value="hoc-thu">Gói học thử</SelectItem>
                      <SelectItem value="combo">Gói combo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Study Mode */}
                <div className="space-y-2">
                  <Label htmlFor="studyMode" className="text-gray-900 font-semibold">
                    Hình thức học <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.studyMode}
                    onValueChange={(value) => handleChange('studyMode', value)}
                    required
                  >
                    <SelectTrigger className="border-2 border-gray-200 focus:border-[#F441A5] focus:ring-[#F441A5]/20">
                      <SelectValue placeholder="Chọn hình thức" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="group">Học nhóm</SelectItem>
                      <SelectItem value="one-on-one">Học 1-1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message" className="text-gray-900 font-semibold">
                  Tin nhắn <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="message"
                  required
                  value={formData.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  className="border-2 border-gray-200 focus:border-[#F441A5] focus:ring-[#F441A5]/20 transition-all min-h-[120px]"
                  placeholder="Nhập tin nhắn của bạn..."
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-4">
                <Button
                  type="submit"
                  size="lg"
                  className="bg-gradient-to-r from-[#F441A5] to-[#FF5F6D] text-white hover:opacity-90 hover:scale-105 transition-all duration-200 px-12 py-6 text-lg font-semibold"
                >
                  Gửi đăng ký
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </motion.section>
  )
}

