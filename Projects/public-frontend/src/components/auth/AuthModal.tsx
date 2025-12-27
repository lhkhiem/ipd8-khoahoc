'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Mail, Lock, User, Phone, ArrowRight, X, MapPin, Calendar } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { vietnamProvinces } from '@/data/vietnam-provinces'

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialMode?: 'login' | 'register'
}

export function AuthModal({ open, onOpenChange, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode)
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    location: '',
    age: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login, register } = useAuth()
  const router = useRouter()

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (!open) {
      setPhone('')
      setPassword('')
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        location: '',
        age: '',
      })
      setError('')
      setIsLoading(false)
    }
  }, [open])

  useEffect(() => {
    setMode(initialMode)
    setError('')
  }, [initialMode])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!phone || !password) {
      setError('Vui lòng nhập đầy đủ số điện thoại và mật khẩu')
      return
    }

    // Validate phone format (Vietnamese phone: 10 digits, starting with 0)
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/
    if (!phoneRegex.test(phone)) {
      setError('Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại 10 chữ số bắt đầu bằng 0')
      return
    }

    setIsLoading(true)
    const result = await login(phone, password)
    setIsLoading(false)

    if (result.success) {
      onOpenChange(false)
      router.push('/dashboard')
    } else {
      setError(result.error || 'Đăng nhập thất bại. Vui lòng thử lại.')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    setError('')
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
    setError('')
  }

  const validateForm = () => {
    // Validate required fields
    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      return 'Vui lòng điền đầy đủ thông tin bắt buộc'
    }

    // Validate phone format (Vietnamese phone: 10 digits, starting with 0)
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/
    if (!phoneRegex.test(formData.phone)) {
      return 'Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại 10 chữ số bắt đầu bằng 0'
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      return 'Email không hợp lệ'
    }

    // Validate password: tối thiểu 8 ký tự, bao gồm chữ, số và ký tự đặc biệt
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    if (formData.password.length < 8) {
      return 'Mật khẩu phải có ít nhất 8 ký tự'
    }
    if (!passwordRegex.test(formData.password)) {
      return 'Mật khẩu phải bao gồm chữ cái, số và ký tự đặc biệt (@$!%*?&)'
    }

    if (formData.password !== formData.confirmPassword) {
      return 'Mật khẩu xác nhận không khớp'
    }

    // Validate age if provided (must be a positive number)
    if (formData.age && (isNaN(Number(formData.age)) || Number(formData.age) < 0)) {
      return 'Tuổi thai/Tuổi con phải là số dương'
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
      phone: formData.phone,
      location: formData.location || undefined,
      age: formData.age ? Number(formData.age) : undefined,
    })
    setIsLoading(false)

    if (result.success) {
      onOpenChange(false)
      router.push('/dashboard')
    } else {
      setError(result.error || 'Đăng ký thất bại. Vui lòng thử lại.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 text-center">
            {mode === 'login' ? 'Đăng nhập' : 'Đăng ký tài khoản'}
          </DialogTitle>
        </DialogHeader>

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-5 mt-4">
            <div>
              <Label htmlFor="phone" className="text-sm font-semibold mb-2 block">
                Số điện thoại <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="0901234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10 border-2 focus:border-[#F441A5]"
                  required
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
              <button type="button" className="text-[#F441A5] hover:underline">
                Quên mật khẩu?
              </button>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="btn-gradient-pink w-full py-6 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <span className="group-hover:text-[#F441A5] transition-colors">
                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </span>
              {!isLoading && <ArrowRight className="ml-2 h-5 w-5 group-hover:text-[#F441A5] transition-colors" />}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Chưa có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register')
                    setError('')
                  }}
                  className="text-[#F441A5] hover:underline font-semibold"
                >
                  Đăng ký ngay
                </button>
              </p>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4 mt-4">
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
              <Label htmlFor="reg-email" className="text-sm font-semibold mb-2 block">
                Email <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="reg-email"
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
                Số điện thoại <span className="text-red-500">*</span>
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
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location" className="text-sm font-semibold mb-2 block">
                Nơi ở
              </Label>
              <Select
                value={formData.location}
                onValueChange={(value) => handleSelectChange('location', value)}
              >
                <SelectTrigger className="border-2 focus:border-[#F441A5]">
                  <SelectValue placeholder="Chọn tỉnh/thành phố" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {vietnamProvinces.map((province) => (
                    <SelectItem key={province} value={province}>
                      {province}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="age" className="text-sm font-semibold mb-2 block">
                Tuổi thai/Tuổi con (tháng)
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="age"
                  name="age"
                  type="number"
                  placeholder="Ví dụ: 6 (tháng)"
                  value={formData.age}
                  onChange={handleChange}
                  className="pl-10 border-2 focus:border-[#F441A5]"
                  min="0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="reg-password" className="text-sm font-semibold mb-2 block">
                Mật khẩu <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="reg-password"
                  name="password"
                  type="password"
                  placeholder="Tối thiểu 8 ký tự (chữ, số, ký tự đặc biệt)"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 border-2 focus:border-[#F441A5]"
                  required
                  minLength={8}
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
                  minLength={8}
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
              className="btn-gradient-pink w-full py-6 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
              {!isLoading && <ArrowRight className="ml-2 h-5 w-5" />}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Đã có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login')
                    setError('')
                  }}
                  className="text-[#F441A5] hover:underline font-semibold"
                >
                  Đăng nhập ngay
                </button>
              </p>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

