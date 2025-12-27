'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export interface PricingOption {
  id: string
  title: string
  price: string
  features: string[]
  popular?: boolean
}

interface PricingCardProps {
  option: PricingOption
  index: number
}

export function PricingCard({ option, index }: PricingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="overflow-visible"
    >
      <Card className={`bg-white border-2 rounded-2xl shadow-md overflow-hidden h-full flex flex-col hover:shadow-2xl hover:scale-105 transition-all duration-300 m-3 ${
        option.popular ? 'border-[#F441A5] ring-2 ring-[#F441A5]/20' : 'border-gray-100'
      }`}>
        {option.popular && (
          <div className="bg-gradient-to-r from-[#F441A5] to-[#FF5F6D] text-white text-center py-2 text-sm font-semibold">
            PHỔ BIẾN NHẤT
          </div>
        )}
        <CardContent className="p-8 flex flex-col h-full">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {option.title}
          </h3>
          <div className="mb-6">
            <span className="text-4xl font-bold text-[#F441A5]">
              {option.price}
            </span>
          </div>
          <ul className="space-y-3 mb-8 flex-grow">
            {option.features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-[#F441A5] shrink-0 mt-0.5" />
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
          <Button
            className={`w-full mt-auto ${
              option.popular
                ? 'btn-gradient-pink'
                : 'bg-transparent border-2 border-[#F441A5] text-[#F441A5] hover:bg-[#F441A5] hover:text-white'
            }`}
            size="lg"
          >
            Đăng ký ngay
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}

