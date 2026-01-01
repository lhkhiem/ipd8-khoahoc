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
import { Mail, Lock, User, Phone, ArrowRight, X, MapPin, Calendar, Baby } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { vietnamProvinces } from '@/data/vietnam-provinces'

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialMode?: 'login' | 'register'
}

export function AuthModal({ open, onOpenChange, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode)
  const [emailOrPhone, setEmailOrPhone] = useState('')
  const [password, setPassword] = useState('')
  const [motherType, setMotherType] = useState<'pregnant' | 'mom' | ''>('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    location: '',
    dueDate: '', // Ngày dự sinh (cho mẹ bầu)
    childAge: '', // Tuổi con (cho mẹ bỉm) - tính bằng tháng
    age: '', // Giữ lại để tương thích với API
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login, register } = useAuth()
  const router = useRouter()

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (!open) {
      setEmailOrPhone('')
      setPassword('')
      setMotherType('')
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        location: '',
        dueDate: '',
        childAge: '',
        age: '',
      })
      setError('')
      setIsLoading(false)
    }
  }, [open])

  // Tính tuần thai từ ngày dự sinh
  // Thai kỳ chuẩn: 40 tuần (280 ngày) từ LMP đến EDD
  // Tuần thai hiện tại = (hôm nay - (EDD - 280 ngày)) / 7
  const calculatePregnancyWeeks = (dueDate: string): number | null => {
    if (!dueDate) return null
    const due = new Date(dueDate)
    const today = new Date()
    
    // Reset time to start of day for accurate calculation
    today.setHours(0, 0, 0, 0)
    due.setHours(0, 0, 0, 0)
    
    // Thai kỳ chuẩn là 280 ngày (40 tuần)
    const standardPregnancyDays = 280
    const lmpDate = new Date(due.getTime() - (standardPregnancyDays * 24 * 60 * 60 * 1000))
    
    // Tính số ngày từ LMP đến hôm nay
    const daysSinceLMP = Math.floor((today.getTime() - lmpDate.getTime()) / (1000 * 60 * 60 * 24))
    const currentWeek = Math.floor(daysSinceLMP / 7)
    
    // Tuần thai hợp lệ từ 0-42 tuần
    if (currentWeek < 0) return 0
    if (currentWeek > 42) return 42
    return currentWeek
  }

  useEffect(() => {
    setMode(initialMode)
    setError('')
  }, [initialMode])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!emailOrPhone || !password) {
      setError('Vui lòng nhập đầy đủ email/số điện thoại và mật khẩu')
      return
    }

    // Validate format: email hoặc phone
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrPhone)
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/
    
    if (!isEmail && !phoneRegex.test(emailOrPhone)) {
      setError('Vui lòng nhập email hợp lệ hoặc số điện thoại 10 chữ số bắt đầu bằng 0')
      return
    }

    setIsLoading(true)
    const result = await login(emailOrPhone, password)
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

    // Validate mother type and related fields
    if (!motherType) {
      return 'Vui lòng chọn bạn là Mẹ bầu hay Mẹ bỉm'
    }
    
    if (motherType === 'pregnant') {
      if (!formData.dueDate) {
        return 'Vui lòng nhập ngày dự sinh'
      }
      const dueDate = new Date(formData.dueDate)
      if (isNaN(dueDate.getTime())) {
        return 'Ngày dự sinh không hợp lệ'
      }
      const weeks = calculatePregnancyWeeks(formData.dueDate)
      if (weeks === null || weeks < 0) {
        return 'Ngày dự sinh không hợp lệ. Vui lòng kiểm tra lại.'
      }
      if (weeks > 42) {
        return 'Ngày dự sinh không hợp lệ (quá sớm)'
      }
    } else if (motherType === 'mom') {
      if (!formData.childAge) {
        return 'Vui lòng nhập tuổi của con'
      }
      const age = Number(formData.childAge)
      if (isNaN(age) || age < 0 || age > 120) {
        return 'Tuổi con phải là số từ 0 đến 120 tháng'
      }
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
    
    // Tính toán age dựa trên motherType
    let ageValue: number | undefined = undefined
    if (motherType === 'pregnant' && formData.dueDate) {
      const weeks = calculatePregnancyWeeks(formData.dueDate)
      if (weeks !== null) {
        // Chuyển tuần thành tháng để tương thích với API (1 tháng ≈ 4.33 tuần)
        ageValue = Math.round(weeks / 4.33)
      }
    } else if (motherType === 'mom' && formData.childAge) {
      ageValue = Number(formData.childAge)
    }
    
    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      location: formData.location || undefined,
      age: ageValue,
    })
    setIsLoading(false)

    if (result.success) {
      // Save registration info to localStorage
      if (motherType === 'pregnant' && formData.dueDate) {
        localStorage.setItem('userDueDate', formData.dueDate)
        localStorage.setItem('userMotherType', 'pregnant')
      } else if (motherType === 'mom' && formData.childAge) {
        localStorage.setItem('userChildAge', formData.childAge)
        localStorage.setItem('userMotherType', 'mom')
      }
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
              <Label htmlFor="emailOrPhone" className="text-sm font-semibold mb-2 block">
                Email hoặc Số điện thoại <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="emailOrPhone"
                  type="text"
                  placeholder="email@example.com hoặc 0901234567"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  className="pl-10 border-2 focus:border-[#F441A5] focus-visible:ring-0 focus-visible:ring-offset-0"
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
                  className="pl-10 border-2 focus:border-[#F441A5] focus-visible:ring-0 focus-visible:ring-offset-0"
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
                  className="pl-10 border-2 focus:border-[#F441A5] focus-visible:ring-0 focus-visible:ring-offset-0"
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
                  className="pl-10 border-2 focus:border-[#F441A5] focus-visible:ring-0 focus-visible:ring-offset-0"
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
                  className="pl-10 border-2 focus:border-[#F441A5] focus-visible:ring-0 focus-visible:ring-offset-0"
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
                <SelectTrigger className="border-2 focus:border-[#F441A5] focus:ring-0 focus:ring-offset-0">
                  <SelectValue placeholder="Chọn tỉnh/thành phố" />
                </SelectTrigger>
                <SelectContent className="z-[120] max-h-[300px]">
                  {vietnamProvinces.map((province) => (
                    <SelectItem key={province} value={province}>
                      {province}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="motherType" className="text-sm font-semibold mb-2 block">
                Bạn là <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-3 items-start">
                <div className="flex-1">
                  <Select
                    value={motherType}
                    onValueChange={(value) => {
                      setMotherType(value as 'pregnant' | 'mom' | '')
                      // Reset related fields when changing type
                      setFormData({
                        ...formData,
                        dueDate: '',
                        childAge: '',
                      })
                    }}
                  >
                    <SelectTrigger className="border-2 focus:border-[#F441A5] focus:ring-0 focus:ring-offset-0">
                      <SelectValue placeholder="Chọn loại" />
                    </SelectTrigger>
                    <SelectContent className="z-[120]">
                      <SelectItem value="pregnant">Mẹ bầu</SelectItem>
                      <SelectItem value="mom">Mẹ bỉm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                 {motherType === 'pregnant' && (
                   <div className="flex-1">
                     <div className="relative">
                       <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10 pointer-events-none" />
                       <Input
                         id="dueDate"
                         name="dueDate"
                         type="date"
                         value={formData.dueDate}
                         onChange={handleChange}
                         className="pr-10 border-2 focus:border-[#F441A5] focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-moz-calendar-picker-indicator]:hidden"
                         style={{
                           colorScheme: 'light',
                         }}
                         required
                       />
                     </div>
                     {formData.dueDate && (
                       <p className="text-xs text-gray-500 mt-1 text-right">
                         Tuần thai: {calculatePregnancyWeeks(formData.dueDate) !== null 
                           ? `${calculatePregnancyWeeks(formData.dueDate)} tuần` 
                           : 'Đang tính...'}
                       </p>
                     )}
                   </div>
                 )}

                {motherType === 'mom' && (
                  <div className="flex-1">
                    <div className="relative">
                      <Baby className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                      <Input
                        id="childAge"
                        name="childAge"
                        type="number"
                        placeholder="Tuổi con (tháng)"
                        value={formData.childAge}
                        onChange={handleChange}
                        className="pl-10 border-2 focus:border-[#F441A5] focus-visible:ring-0 focus-visible:ring-offset-0"
                        min="0"
                        max="120"
                        required
                      />
                    </div>
                  </div>
                )}
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
                  className="pl-10 border-2 focus:border-[#F441A5] focus-visible:ring-0 focus-visible:ring-offset-0"
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
                  className="pl-10 border-2 focus:border-[#F441A5] focus-visible:ring-0 focus-visible:ring-offset-0"
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

