'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const surveyQuestions = [
  'Anh/Chị vui lòng cho biết mức độ hài lòng của anh/chị với nội dung video.',
  'Tôi cảm thấy nội dung video rất dễ hiểu.',
  'Tôi và nhỏ ứng dụng được kiến thức, kỹ năng mà tôi học được trong video.',
  'Video đã tạo động lực cho tôi trong công việc và cuộc sống.',
  'Tôi rất hài lòng nội dung video rất gần gũi với cuộc sống của tôi.',
]

export function EvaluationSection() {
  const [activeTab, setActiveTab] = useState<'review' | 'survey'>('survey')
  const [rating, setRating] = useState(0)
  const [surveyAnswers, setSurveyAnswers] = useState<Record<number, number>>({})

  const handleSurveyAnswer = (questionIndex: number, value: number) => {
    setSurveyAnswers((prev) => ({ ...prev, [questionIndex]: value }))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="mt-8"
    >
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6" style={{ lineHeight: '1.2' }}>
        ĐÁNH GIÁ SAU BUỔI HỌC
      </h2>

      {/* Rating Stars */}
      <div className="mb-6">
        <p className="text-gray-700 mb-3">Mời bạn xếp hạng video này</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className="focus:outline-none transition-transform hover:scale-110"
              aria-label={`Đánh giá ${star} sao`}
            >
              <Star
                className={cn(
                  'h-8 w-8 transition-colors',
                  star <= rating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-none text-gray-300'
                )}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('review')}
          className={cn(
            'px-6 py-3 font-semibold text-sm transition-colors border-b-2 -mb-px',
            activeTab === 'review'
              ? 'text-[#F441A5] border-[#F441A5]'
              : 'text-gray-500 border-transparent hover:text-gray-700'
          )}
        >
          Đánh giá
        </button>
        <button
          onClick={() => setActiveTab('survey')}
          className={cn(
            'px-6 py-3 font-semibold text-sm transition-colors border-b-2 -mb-px',
            activeTab === 'survey'
              ? 'text-[#F441A5] border-[#F441A5]'
              : 'text-gray-500 border-transparent hover:text-gray-700'
          )}
        >
          Khảo sát
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'review' ? (
        <Card className="bg-white border-2 border-gray-200">
          <CardContent className="p-6">
            <p className="text-gray-600">Phần đánh giá sẽ được hiển thị ở đây.</p>
            {/* Review form can be added here */}
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white border-2 border-gray-200">
          <CardContent className="p-6 space-y-6">
            {surveyQuestions.map((question, questionIndex) => (
              <div key={questionIndex} className="space-y-3">
                <p className="text-gray-900 font-medium">{question}</p>
                <div className="flex gap-4">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <label
                      key={`question-${questionIndex}-option-${value}`}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name={`question-${questionIndex}`}
                        value={value}
                        checked={surveyAnswers[questionIndex] === value}
                        onChange={() => handleSurveyAnswer(questionIndex, value)}
                        className="w-4 h-4 text-[#F441A5] focus:ring-[#F441A5]"
                      />
                      <span className="text-sm text-gray-700">{value}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <div className="pt-4 border-t">
              <p className="text-xs text-gray-500">
                Khảo sát và đánh giá sau khi user xem một video hoặc tham gia một workshop
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  )
}

