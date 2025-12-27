'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, User, Phone, Mail, MessageSquare, Loader2, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Session } from './SessionCard'
import { toast } from 'sonner'

const bookingSchema = z.object({
  name: z.string()
    .min(2, 'Tên phải có ít nhất 2 ký tự')
    .max(100, 'Tên không được vượt quá 100 ký tự')
    .regex(/^[a-zA-ZÀ-ỹ\s]+$/, 'Tên chỉ được chứa chữ cái và khoảng trắng'),
  phone: z.string()
    .regex(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ')
    .max(15, 'Số điện thoại không được vượt quá 15 ký tự'),
  email: z.string()
    .email('Email không hợp lệ')
    .max(255, 'Email không được vượt quá 255 ký tự')
    .toLowerCase(),
  message: z.string()
    .max(1000, 'Lời nhắn không được vượt quá 1000 ký tự')
    .optional(),
  contactMethod: z.enum(['phone', 'email', 'both']).default('phone'),
  acceptTerms: z.boolean().refine(val => val === true, 'Bạn phải đồng ý với điều khoản'),
})

type BookingFormData = z.infer<typeof bookingSchema>

interface BookingDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  session: Session | null
  onSuccess?: (bookingId: string) => void
}

export function BookingDrawer({ open, onOpenChange, session, onSuccess }: BookingDrawerProps) {
  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<'zalopay' | 'manual' | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      contactMethod: 'phone',
      acceptTerms: false,
    },
  })

  const acceptTerms = watch('acceptTerms')

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const onSubmit = async (data: BookingFormData) => {
    if (!session) return

    setIsSubmitting(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const bookingId = `BK-${Date.now()}`
      
      // Save to localStorage
      const booking = {
        id: bookingId,
        session,
        ...data,
        createdAt: new Date().toISOString(),
      }
      const bookings = JSON.parse(localStorage.getItem('trialBookings') || '[]')
      bookings.push(booking)
      localStorage.setItem('trialBookings', JSON.stringify(bookings))

      toast.success('Đăng ký thành công!')
      setStep('success')
      onSuccess?.(bookingId)
    } catch (error) {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePayment = async (method: 'zalopay' | 'manual', formData?: BookingFormData) => {
    setSelectedPayment(method)
    
    if (method === 'zalopay') {
      if (!formData) {
        await handleSubmit(onSubmit)()
        formData = watch()
      }
      
      setIsSubmitting(true)
      setStep('payment')
      
      try {
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        const bookingId = `BK-${Date.now()}`
        
        const booking = {
          id: bookingId,
          session,
          ...formData,
          paymentMethod: 'zalopay',
          createdAt: new Date().toISOString(),
        }
        const bookings = JSON.parse(localStorage.getItem('trialBookings') || '[]')
        bookings.push(booking)
        localStorage.setItem('trialBookings', JSON.stringify(bookings))
        
        toast.success('Thanh toán thành công!')
        setStep('success')
        onSuccess?.(bookingId)
      } catch (error) {
        toast.error('Thanh toán thất bại. Vui lòng thử lại.')
        setStep('form')
      } finally {
        setIsSubmitting(false)
      }
    } else {
      handleSubmit(onSubmit)()
    }
  }

  const handleClose = () => {
    setStep('form')
    setSelectedPayment(null)
    reset()
    onOpenChange(false)
  }

  if (!session) return null

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 z-[90]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full md:w-[500px] lg:w-[600px] bg-white z-[90] shadow-2xl overflow-y-auto"
            style={{ maxWidth: '100vw' }}
          >
            <div className="sticky top-0 bg-white border-b z-10 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Đăng ký học thử</h2>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Đóng"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <AnimatePresence mode="wait">
                {step === 'form' && (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    {/* Session Info */}
                    <div className="bg-gradient-to-r from-[#F441A5]/10 to-[#FF5F6D]/10 rounded-xl p-4 mb-6">
                      <div className="flex items-center gap-2 text-[#F441A5] font-semibold mb-2">
                        <Calendar className="h-5 w-5" />
                        <span>{formatDate(session.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <Clock className="h-4 w-4" />
                        <span>{session.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="h-4 w-4" />
                        <span>{session.instructor.name}</span>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                      {/* Name */}
                      <div>
                        <Label htmlFor="name" className="text-sm font-semibold">
                          Họ và tên <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          {...register('name')}
                          placeholder="Nhập họ và tên"
                          className="mt-2 border-2 focus:border-[#F441A5]"
                        />
                        {errors.name && (
                          <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                        )}
                      </div>

                      {/* Phone */}
                      <div>
                        <Label htmlFor="phone" className="text-sm font-semibold">
                          Số điện thoại <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative mt-2">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            id="phone"
                            {...register('phone')}
                            placeholder="0901234567"
                            className="pl-10 border-2 focus:border-[#F441A5]"
                          />
                        </div>
                        {errors.phone && (
                          <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <Label htmlFor="email" className="text-sm font-semibold">
                          Email <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative mt-2">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input
                            id="email"
                            type="email"
                            {...register('email')}
                            placeholder="email@example.com"
                            className="pl-10 border-2 focus:border-[#F441A5]"
                          />
                        </div>
                        {errors.email && (
                          <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                        )}
                      </div>

                      {/* Message */}
                      <div>
                        <Label htmlFor="message" className="text-sm font-semibold">
                          Lời nhắn (tùy chọn)
                        </Label>
                        <div className="relative mt-2">
                          <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                          <Textarea
                            id="message"
                            {...register('message')}
                            placeholder="Chia sẻ thêm về nhu cầu của bạn..."
                            className="pl-10 border-2 focus:border-[#F441A5] min-h-[100px]"
                          />
                        </div>
                      </div>

                      {/* Contact Method */}
                      <div>
                        <Label className="text-sm font-semibold mb-3 block">
                          Phương thức liên hệ ưa thích
                        </Label>
                        <div className="space-y-2">
                          {(['phone', 'email', 'both'] as const).map((method) => (
                            <label
                              key={method}
                              className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                            >
                              <input
                                type="radio"
                                value={method}
                                {...register('contactMethod')}
                                className="w-4 h-4 text-[#F441A5]"
                              />
                              <span className="text-sm">
                                {method === 'phone' && 'Điện thoại'}
                                {method === 'email' && 'Email'}
                                {method === 'both' && 'Cả hai'}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Terms */}
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="terms"
                          checked={acceptTerms}
                          onCheckedChange={(checked) => setValue('acceptTerms', checked as boolean)}
                          className="mt-1"
                        />
                        <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
                          Tôi đồng ý với{' '}
                          <a href="/terms" className="text-[#F441A5] hover:underline">
                            Điều khoản và Chính sách
                          </a>{' '}
                          của IPD8 <span className="text-red-500">*</span>
                        </label>
                      </div>
                      {errors.acceptTerms && (
                        <p className="text-sm text-red-500">{errors.acceptTerms.message}</p>
                      )}

                      {/* Payment Options */}
                      <div className="border-t pt-6 space-y-3">
                        <Label className="text-sm font-semibold mb-3 block">
                          Phương thức thanh toán
                        </Label>
                        
                        <Button
                          type="button"
                          onClick={handleSubmit((data) => handlePayment('zalopay', data))}
                          disabled={isSubmitting || !acceptTerms}
                          className="btn-gradient-pink w-full"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Đang xử lý...
                            </>
                          ) : (
                            'Thanh toán bằng ZaloPay (99.000 VND)'
                          )}
                        </Button>

                        <Button
                          type="submit"
                          disabled={isSubmitting || !acceptTerms}
                          className="w-full bg-transparent border-2 border-[#F441A5] text-[#F441A5] hover:bg-[#F441A5] hover:text-white hover:scale-105 transition-all duration-200"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Đang xử lý...
                            </>
                          ) : (
                            'Đăng ký không thanh toán (Xác nhận sau)'
                          )}
                        </Button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {step === 'payment' && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-center py-16"
                  >
                    <Loader2 className="h-16 w-16 animate-spin text-[#F441A5] mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Đang xử lý thanh toán...</h3>
                    <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
                  </motion.div>
                )}

                {step === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-center py-8"
                  >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Đăng ký thành công!</h3>
                    <p className="text-gray-600 mb-6">
                      Chúng tôi đã gửi thông tin xác nhận đến email của bạn
                    </p>
                    
                    <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                      <p className="text-sm text-gray-600 mb-1">Mã đăng ký:</p>
                      <p className="font-mono font-semibold text-[#F441A5]">BK-{Date.now()}</p>
                    </div>

                    <div className="space-y-3">
                      <Button
                        onClick={handleClose}
                        className="btn-gradient-pink w-full"
                      >
                        Về Dashboard
                      </Button>
                      <Button
                        onClick={handleClose}
                        variant="outline"
                        className="w-full border-2 border-[#F441A5] text-[#F441A5] hover:bg-[#F441A5] hover:text-white"
                      >
                        Đăng ký gói khác
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

