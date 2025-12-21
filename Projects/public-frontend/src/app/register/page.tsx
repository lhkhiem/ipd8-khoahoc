'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Lock, User, Phone, ArrowRight } from 'lucide-react'
import { ROUTES } from '@/lib/constants'
import Link from 'next/link'

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuth()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError('')
  }

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password) {
      return 'Vui lòng điền đầy đủ thông tin bắt buộc'
    }

    if (formData.password.length < 6) {
      return 'Mật khẩu phải có ít nhất 6 ký tự'
    }

    if (formData.password !== formData.confirmPassword) {
      return 'Mật khẩu xác nhận không khớp'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      return 'Email không hợp lệ'
    }

    return null
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsLoading(true)
    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone || undefined,
    })
    setIsLoading(false)

    if (result.success) {
      router.push('/dashboard')
    } else {
      setError(result.error || 'Đăng ký thất bại. Vui lòng thử lại.')
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative w-full min-h-[300px] md:min-h-[400px] overflow-hidden flex items-center justify-center bg-gradient-to-r from-[#F441A5] to-[#FF5F6D]">
        <div className="container-custom relative z-10 h-full flex items-center justify-center py-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl mx-auto text-center px-4"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white" style={{ lineHeight: '1.2' }}>
              Đăng ký tài khoản
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Tạo tài khoản để bắt đầu hành trình học tập cùng IPD8
            </p>
          </motion.div>
        </div>
      </section>

      {/* Register Form Section */}
      <section className="section-wrapper bg-white py-12 md:py-16">
        <div className="container-custom max-w-md mx-auto">
          <motion.div
            initial="initial"
            animate="animate"
            variants={fadeInUp}
          >
            <Card className="shadow-2xl border-2 border-gray-200">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Tạo tài khoản mới
                </CardTitle>
                <p className="text-sm text-gray-600 mt-2">
                  Điền thông tin để đăng ký
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-5">
                  <div>
                    <Label htmlFor="name" className="text-sm font-semibold mb-2 block">
                      Họ và tên <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Nguyễn Văn A"
                        value={formData.name}
                        onChange={handleChange}
                        className="pl-10 border-2 focus:border-[#F441A5]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm font-semibold mb-2 block">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="email@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="pl-10 border-2 focus:border-[#F441A5]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-sm font-semibold mb-2 block">
                      Số điện thoại
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="0901234567"
                        value={formData.phone}
                        onChange={handleChange}
                        className="pl-10 border-2 focus:border-[#F441A5]"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="password" className="text-sm font-semibold mb-2 block">
                      Mật khẩu <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Tối thiểu 6 ký tự"
                        value={formData.password}
                        onChange={handleChange}
                        className="pl-10 border-2 focus:border-[#F441A5]"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword" className="text-sm font-semibold mb-2 block">
                      Xác nhận mật khẩu <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Nhập lại mật khẩu"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="pl-10 border-2 focus:border-[#F441A5]"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-[#F441A5] to-[#FF5F6D] text-white hover:opacity-90 hover:scale-105 transition-all duration-200 py-6 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
                    {!isLoading && <ArrowRight className="ml-2 h-5 w-5" />}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Đã có tài khoản?{' '}
                    <Link href={ROUTES.LOGIN} className="text-[#F441A5] hover:underline font-semibold">
                      Đăng nhập ngay
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  )
}








