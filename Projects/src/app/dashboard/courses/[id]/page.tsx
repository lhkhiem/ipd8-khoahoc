'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Play, CheckCircle2, Star, Calendar, Clock, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { formatCurrency } from '@/lib/utils'
import { validateId, sanitizeIframeUrl } from '@/lib/security'

// Mock data for course lessons
const mockLessons = [
  {
    id: 1,
    title: 'Bài 1: Giới thiệu về chăm sóc thai kỳ',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '15:30',
    completed: true,
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    benefitsForMother: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
    benefitsForBaby: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aute irure dolor in reprehenderit in voluptate velit esse.',
    instructor: {
      name: 'Nguyễn Văn A',
      role: 'Phó Giám đốc Chủ nhiệm Khoa Y Dược',
      title: 'Thái lương hạo AD/phân'
    }
  },
  {
    id: 2,
    title: 'Bài 2: Dinh dưỡng trong thai kỳ',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '20:15',
    completed: false,
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    benefitsForMother: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
    benefitsForBaby: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aute irure dolor in reprehenderit in voluptate velit esse.',
    instructor: {
      name: 'Nguyễn Văn A',
      role: 'Phó Giám đốc Chủ nhiệm Khoa Y Dược',
      title: 'Thái lương hạo AD/phân'
    }
  },
  {
    id: 3,
    title: 'Bài 3: Vận động và thể dục cho bà bầu',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    duration: '18:45',
    completed: false,
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    benefitsForMother: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
    benefitsForBaby: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aute irure dolor in reprehenderit in voluptate velit esse.',
    instructor: {
      name: 'Nguyễn Văn A',
      role: 'Phó Giám đốc Chủ nhiệm Khoa Y Dược',
      title: 'Thái lương hạo AD/phân'
    }
  },
]

// Mock data for upcoming course packages
const upcomingPackages = [
  {
    id: 1,
    title: 'DÀNH CHO MẸ BẦU',
    sessions: 20,
    format: 'Nhóm hoặc 1-1',
    instructor: 'Nguyễn Văn A - Trường ĐH Y Dược',
    startDate: '00/00/2025',
    schedule: 'Thứ 2 - Thứ 4 - Thứ 6 hàng tuần',
    time: '7:00PM - 8:00PM',
    price: null, // Liên hệ
  },
  {
    id: 2,
    title: 'DÀNH CHO MẸ CÓ CON TỪ 0 - 12 THÁNG',
    sessions: 20,
    format: 'Nhóm hoặc 1-1',
    instructor: 'Nguyễn Văn A - Trường ĐH Y Dược',
    startDate: '00/00/2025',
    schedule: 'Thứ 2 - Thứ 4 - Thứ 6 hàng tuần',
    time: '7:00PM - 8:00PM',
    price: null, // Liên hệ
  },
  {
    id: 3,
    title: 'GÓI HỌC THỬ 99K',
    sessions: 1,
    format: 'Nhóm',
    instructor: 'Nguyễn Văn A - Trường ĐH Y Dược',
    startDate: '00/00/2025',
    schedule: 'Thứ 2 - Thứ 4 - Thứ 6 hàng tuần',
    time: '7:00PM - 8:00PM',
    price: 99000,
  },
]

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
}

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  
  // Validate and sanitize course ID to prevent injection attacks
  const rawCourseId = params.id
  const courseId = validateId(rawCourseId)
  
  // Redirect if invalid ID
  useEffect(() => {
    if (!courseId) {
      router.push('/dashboard?menu=packages')
    }
  }, [courseId, router])
  
  const [selectedLessonId, setSelectedLessonId] = useState(1)
  const [rating, setRating] = useState(0)
  const [surveyAnswers, setSurveyAnswers] = useState<Record<number, string>>({})
  const [reviewText, setReviewText] = useState('')

  const selectedLesson = mockLessons.find(l => l.id === selectedLessonId) || mockLessons[0]
  
  // Sanitize video URL for iframe
  const safeVideoUrl = sanitizeIframeUrl(selectedLesson.videoUrl) || ''

  const handleLessonSelect = (lessonId: number) => {
    setSelectedLessonId(lessonId)
  }

  const handleRatingClick = (value: number) => {
    setRating(value)
  }

  const handleSurveyChange = (questionId: number, value: string) => {
    setSurveyAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  const surveyQuestions = [
    {
      id: 1,
      text: 'Tôi cảm thấy nội dung video rất dễ hiểu.'
    },
    {
      id: 2,
      text: 'Tôi có thể áp dụng những kiến thức, kỹ năng mà tôi học được trong video.'
    },
    {
      id: 3,
      text: 'Video đã tạo động lực cho tôi trong công việc và cuộc sống.'
    },
    {
      id: 4,
      text: 'Tôi cảm thấy nội dung video rất gần gũi với mục tiêu sống của tôi.'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard?menu=courses')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Section */}
            <motion.div
              initial="initial"
              animate="animate"
              variants={fadeInUp}
            >
              <Card>
                <CardContent className="p-0">
                  <div className="bg-gray-900 aspect-video rounded-t-lg overflow-hidden">
                    {safeVideoUrl ? (
                      <iframe
                        src={safeVideoUrl}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={selectedLesson.title}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white">
                        <p>Video không khả dụng</p>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">
                      VIDEO MINH HỌA BUỔI HỌC (PHƯƠNG PHÁP HỌC)
                    </h2>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Course Description */}
            <motion.div
              initial="initial"
              animate="animate"
              variants={fadeInUp}
            >
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                      {selectedLesson.title}
                    </h1>
                    <div className="prose prose-gray max-w-none">
                      <p className="text-gray-700 leading-relaxed mb-4">
                        {selectedLesson.description}
                      </p>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
                      </p>
                    </div>
                  </div>

                  {/* Benefits for Mother */}
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      LỢI ÍCH DÀNH CHO MẸ
                    </h2>
                    <div className="prose prose-gray max-w-none">
                      <p className="text-gray-700 leading-relaxed mb-4">
                        {selectedLesson.benefitsForMother}
                      </p>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                      </p>
                    </div>
                  </div>

                  {/* Benefits for Baby */}
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      LỢI ÍCH DÀNH CHO BÉ
                    </h2>
                    <div className="prose prose-gray max-w-none">
                      <p className="text-gray-700 leading-relaxed mb-4">
                        {selectedLesson.benefitsForBaby}
                      </p>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                      </p>
                    </div>
                  </div>

                  {/* Instructor Info */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">
                      {selectedLesson.instructor.title}
                    </p>
                    <p className="text-base font-semibold text-gray-900">
                      Chuyên gia {selectedLesson.instructor.name} - {selectedLesson.instructor.role}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Feedback Section */}
            <motion.div
              initial="initial"
              animate="animate"
              variants={fadeInUp}
            >
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    ĐÁNH GIÁ SAU BUỔI HỌC
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Mời bạn xếp hạng video này
                  </p>

                  {/* Star Rating */}
                  <div className="flex items-center gap-2 mb-6">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        onClick={() => handleRatingClick(value)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-8 w-8 transition-colors ${
                            value <= rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  {/* Tabs */}
                  <Tabs defaultValue="survey" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="review">Đánh giá</TabsTrigger>
                      <TabsTrigger value="survey">Khảo sát</TabsTrigger>
                    </TabsList>

                    {/* Review Tab */}
                    <TabsContent value="review" className="mt-6">
                      <div className="space-y-4">
                        <Label htmlFor="review">Viết đánh giá của bạn</Label>
                        <Textarea
                          id="review"
                          placeholder="Chia sẻ suy nghĩ của bạn về bài học này..."
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          className="min-h-[120px]"
                        />
                        <Button className="bg-gradient-to-r from-[#F441A5] to-[#FF5F6D] text-white">
                          Gửi đánh giá
                        </Button>
                      </div>
                    </TabsContent>

                    {/* Survey Tab */}
                    <TabsContent value="survey" className="mt-6">
                      <div className="space-y-6">
                        <div>
                          <p className="text-gray-700 mb-4">
                            Anh/Chị vui lòng cho biết mức độ đồng ý của anh/chị với nội dung video:
                          </p>
                          <div className="text-sm text-gray-600 mb-4 space-y-1">
                            <p>1 - hoàn toàn không đồng ý</p>
                            <p>2 - không đồng ý</p>
                            <p>3 - bình thường</p>
                            <p>4 - đồng ý</p>
                            <p>5 - hoàn toàn đồng ý</p>
                          </div>
                        </div>

                        {surveyQuestions.map((question) => (
                          <div key={question.id} className="space-y-3">
                            <Label className="text-base font-medium text-gray-900">
                              {question.text}
                            </Label>
                            <RadioGroup
                              value={surveyAnswers[question.id] || ''}
                              onValueChange={(value) => handleSurveyChange(question.id, value)}
                              className="flex gap-6"
                            >
                              {[1, 2, 3, 4, 5].map((value) => (
                                <div key={`q${question.id}-option-${value}`} className="flex items-center space-x-2">
                                  <RadioGroupItem value={value.toString()} id={`q${question.id}-${value}`} />
                                  <Label htmlFor={`q${question.id}-${value}`} className="cursor-pointer">
                                    {value}
                                  </Label>
                                </div>
                              ))}
                            </RadioGroup>
                          </div>
                        ))}

                        <Button className="bg-gradient-to-r from-[#F441A5] to-[#FF5F6D] text-white">
                          Gửi khảo sát
                        </Button>

                        <p className="text-xs text-gray-500 mt-4">
                          Mời bạn viết và đánh giá sau khi user xem một video hoặc tham gia một workshop
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar - Video List and Upcoming Packages */}
          <div className="lg:col-span-1 space-y-6">
            {/* Video List */}
            <motion.div
              initial="initial"
              animate="animate"
              variants={fadeInUp}
            >
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Danh sách bài học
                  </h3>
                  <div className="space-y-2">
                    {mockLessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => handleLessonSelect(lesson.id)}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                          selectedLessonId === lesson.id
                            ? 'border-[#F441A5] bg-[#F441A5]/10'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {lesson.completed ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <Play className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${
                              selectedLessonId === lesson.id
                                ? 'text-[#F441A5]'
                                : 'text-gray-900'
                            }`}>
                              {lesson.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {lesson.duration}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Upcoming Course Packages */}
            <motion.div
              initial="initial"
              animate="animate"
              variants={fadeInUp}
            >
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 text-center">
                    GÓI HỌC SẮP KHAI GIẢNG
                  </h3>
                  <div className="space-y-6">
                    {upcomingPackages.map((pkg, index) => (
                      <div key={pkg.id}>
                        <div className="space-y-3">
                          <h4 className="text-base font-bold text-gray-900">
                            {pkg.title}
                          </h4>
                          <div className="space-y-2 text-sm text-gray-700">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Số buổi học:</span>
                              <span>{pkg.sessions}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Hình thức học:</span>
                              <span>{pkg.format}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">Giảng viên:</span>
                              <span>{pkg.instructor}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">Ngày khai giảng:</span>
                              <span>{pkg.startDate}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">Lịch học:</span>
                              <span>{pkg.schedule}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span className="font-medium">Giờ học:</span>
                              <span>{pkg.time}</span>
                            </div>
                          </div>
                          <div className="pt-3 border-t border-gray-200">
                            <div className="mb-2">
                              <p className="text-2xl font-bold text-[#F441A5]">
                                {pkg.price ? formatCurrency(pkg.price) : 'Liên hệ'}
                              </p>
                            </div>
                            <p className="text-xs text-gray-500 mb-4">
                              *Giá trên chưa bao gồm VAT
                            </p>
                            <Button className="w-full bg-gradient-to-r from-[#F441A5] to-[#FF5F6D] text-white hover:opacity-90">
                              Đăng ký ngay
                            </Button>
                          </div>
                        </div>
                        {index < upcomingPackages.length - 1 && (
                          <div className="border-t border-gray-200 mt-6 pt-6" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

