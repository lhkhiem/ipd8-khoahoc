'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import { ROUTES } from '@/lib/constants'
import Link from 'next/link'

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu')
      return
    }

    setIsLoading(true)
    const result = await login(email, password)
    setIsLoading(false)

    if (result.success) {
      router.push('/dashboard')
    } else {
      setError(result.error || 'Đăng nhập thất bại. Vui lòng thử lại.')
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
              Đăng nhập
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              Đăng nhập để truy cập vào dashboard và quản lý khóa học của bạn
            </p>
          </motion.div>
        </div>
      </section>

      {/* Login Form Section */}
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
                  Chào mừng trở lại
                </CardTitle>
                <p className="text-sm text-gray-600 mt-2">
                  Đăng nhập để tiếp tục học tập
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-6">
                  <div>
                    <Label htmlFor="email" className="text-sm font-semibold mb-2 block">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 border-2 focus:border-[#F441A5]"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="password" className="text-sm font-semibold mb-2 block">
                      Mật khẩu
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Nhập mật khẩu"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 border-2 focus:border-[#F441A5]"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                      {error}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 text-[#F441A5]" />
                      <span className="text-gray-600">Ghi nhớ đăng nhập</span>
                    </label>
                    <Link href="#" className="text-[#F441A5] hover:underline">
                      Quên mật khẩu?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-[#F441A5] to-[#FF5F6D] text-white hover:opacity-90 hover:scale-105 transition-all duration-200 py-6 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    {!isLoading && <ArrowRight className="ml-2 h-5 w-5" />}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Chưa có tài khoản?{' '}
                    <Link href={ROUTES.REGISTER} className="text-[#F441A5] hover:underline font-semibold">
                      Đăng ký ngay
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

