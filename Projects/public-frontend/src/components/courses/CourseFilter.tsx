'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export type FilterCategory = 
  | 'all'
  | 'me-bau'
  | '0-12-thang'
  | 'mien-phi'
  | 'co-phí'

interface CourseFilterProps {
  activeFilter: FilterCategory
  onFilterChange: (filter: FilterCategory) => void
}

const filters: { id: FilterCategory; label: string }[] = [
  { id: 'all', label: 'Tất cả khóa học' },
  { id: 'me-bau', label: 'Dành cho mẹ bầu' },
  { id: '0-12-thang', label: 'Dành cho bé 0–12 tháng' },
  { id: 'mien-phi', label: 'Khóa học miễn phí' },
  { id: 'co-phí', label: 'Khóa học có phí' },
]

export function CourseFilter({ activeFilter, onFilterChange }: CourseFilterProps) {
  return (
      <div className="bg-white border-b sticky top-[104px] md:top-[140px] z-40 shadow-sm w-full max-w-full overflow-x-hidden">
      <div className="container-custom py-4 md:py-6 w-full max-w-full">
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          <div className="flex gap-2 md:gap-3 min-w-max md:min-w-0 md:flex-wrap">
            {filters.map((filter, index) => (
              <motion.button
                key={filter.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onFilterChange(filter.id)}
                className={cn(
                  'px-4 md:px-6 py-2 md:py-3 rounded-full font-semibold text-xs md:text-sm lg:text-base whitespace-nowrap transition-all duration-200 shrink-0',
                  'hover:scale-105',
                  activeFilter === filter.id
                    ? 'bg-gradient-to-r from-[#F441A5] to-[#FF5F6D] text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {filter.label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

