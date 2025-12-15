'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ContactForm as ContactFormType } from '@/types'

const contactFormSchema = z.object({
  name: z.string()
    .min(2, 'Họ tên phải có ít nhất 2 ký tự')
    .max(100, 'Họ tên không được vượt quá 100 ký tự')
    .regex(/^[a-zA-ZÀ-ỹ\s]+$/, 'Họ tên chỉ được chứa chữ cái và khoảng trắng'),
  email: z.string()
    .email('Email không hợp lệ')
    .max(255, 'Email không được vượt quá 255 ký tự')
    .toLowerCase(),
  phone: z.string()
    .min(10, 'Số điện thoại không hợp lệ')
    .max(15, 'Số điện thoại không được vượt quá 15 ký tự')
    .regex(/^[0-9+\-\s()]+$/, 'Số điện thoại chỉ được chứa số và ký tự +, -, (, )'),
  address: z.string()
    .max(500, 'Địa chỉ không được vượt quá 500 ký tự')
    .optional(),
  courseInterest: z.string()
    .max(200, 'Tên khóa học không được vượt quá 200 ký tự')
    .optional(),
  studyMode: z.string()
    .max(50, 'Hình thức học không được vượt quá 50 ký tự')
    .optional(),
  message: z.string()
    .min(10, 'Lời nhắn phải có ít nhất 10 ký tự')
    .max(2000, 'Lời nhắn không được vượt quá 2000 ký tự'),
})

type ContactFormValues = z.infer<typeof contactFormSchema>

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
  })

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true)
    // TODO: Call API to submit contact form
    console.log('Contact form data:', data)
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    alert('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.')
    reset()
    setIsSubmitting(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gửi tin nhắn cho chúng tôi</CardTitle>
        <CardDescription>
          Điền thông tin bên dưới và chúng tôi sẽ liên hệ lại với bạn
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Họ và tên *</Label>
            <Input
              id="name"
              placeholder="Nguyễn Văn A"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại *</Label>
              <Input
                id="phone"
                placeholder="0912345678"
                {...register('phone')}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Địa chỉ</Label>
            <Input
              id="address"
              placeholder="Quận, Thành phố"
              {...register('address')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="courseInterest">Khóa học quan tâm</Label>
              <Input
                id="courseInterest"
                placeholder="Tên khóa học"
                {...register('courseInterest')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="studyMode">Hình thức học</Label>
              <Input
                id="studyMode"
                placeholder="Nhóm / 1-1"
                {...register('studyMode')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Lời nhắn *</Label>
            <Textarea
              id="message"
              placeholder="Nhập nội dung cần tư vấn..."
              rows={5}
              {...register('message')}
            />
            {errors.message && (
              <p className="text-sm text-destructive">
                {errors.message.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white hover:scale-105 transition-all duration-200 ease-in-out" disabled={isSubmitting}>
            {isSubmitting ? 'Đang gửi...' : 'Gửi tin nhắn'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
