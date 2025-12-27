'use client'

import Link from 'next/link'
import { Check, Users, Clock, Gift } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { Package } from '@/types'

interface PackageCardProps {
  package: Package
  index?: number
  isLarge?: boolean // Card giữa (highlighted)
}

export function PackageCard({ package: pkg, index = 0, isLarge = false }: PackageCardProps) {
  const hasDiscount = pkg.originalPrice && pkg.originalPrice > pkg.price
  const discountPercent = hasDiscount 
    ? Math.round(((pkg.originalPrice! - pkg.price) / pkg.originalPrice!) * 100)
    : 0

  return (
    <Card 
      className={`
        w-full h-full
        group relative flex flex-col
        rounded-xl overflow-hidden
        transition-all duration-300 ease-in-out
        ${isLarge 
          ? 'bg-gradient-to-br from-[#F441A5] to-[#FF5F6D] text-white shadow-card-xl hover:shadow-card-2xl' 
          : 'bg-white border border-gray-200 shadow-card-lg hover:shadow-card-2xl hover:border-[#F441A5]'
        }
        hover:scale-[1.02] hover:-translate-y-2
      `}
    >
        {/* Content Section */}
        <CardContent className="flex flex-col flex-grow p-5 md:p-6">
          {/* Badges - moved to top - fixed height to ensure equal card heights */}
          <div className="flex items-center justify-center gap-2 mb-2 min-h-[28px]">
            {pkg.popular && (
              <Badge className={`
                font-medium text-xs px-2.5 py-1
                ${isLarge 
                  ? 'bg-white/20 backdrop-blur-sm text-white border border-white/30' 
                  : 'bg-[#F441A5] text-white'
                }
              `}>
                Phổ biến
              </Badge>
            )}
            
            {hasDiscount && (
              <Badge className={`
                font-medium text-xs px-2.5 py-1
                ${isLarge 
                  ? 'bg-white/20 backdrop-blur-sm text-white border border-white/30' 
                  : 'bg-red-500 text-white'
                }
              `}>
                -{discountPercent}%
              </Badge>
            )}
          </div>

          {/* Title - Centered - fixed height for alignment (2 lines max) */}
          <h3 className={`
            font-bold mb-2 line-clamp-2 leading-tight text-center min-h-[3.5rem] md:min-h-[4rem] flex items-center justify-center
            ${isLarge 
              ? 'text-white text-lg md:text-xl' 
              : 'text-gray-900 text-base md:text-lg'
            }
          `}>
            {pkg.title}
          </h3>
          
          {/* Duration & Sessions - fixed height */}
          <div className={`
            flex items-center justify-center gap-2 mb-3 text-xs min-h-[2.25rem]
            ${isLarge ? 'text-white/80' : 'text-gray-600'}
          `}>
            <div className={`
              flex items-center gap-1.5 px-2 py-1 rounded-md
              ${isLarge ? 'bg-white/15' : 'bg-gray-100'}
            `}>
              <Clock className={`h-3.5 w-3.5 ${isLarge ? 'text-white' : 'text-[#F441A5]'}`} />
              <span className="font-medium">{pkg.duration}</span>
            </div>
            <div className={`
              flex items-center gap-1.5 px-2 py-1 rounded-md
              ${isLarge ? 'bg-white/15' : 'bg-gray-100'}
            `}>
              <Users className={`h-3.5 w-3.5 ${isLarge ? 'text-white' : 'text-[#F441A5]'}`} />
              <span className="font-medium">{pkg.sessions} buổi</span>
            </div>
          </div>
          
          {/* Description - fixed height (2 lines max) */}
          <p className={`
            mb-3 line-clamp-2 leading-relaxed text-sm text-center min-h-[4.5rem]
            ${isLarge ? 'text-white/90' : 'text-gray-600'}
          `}>
            {pkg.description}
          </p>
          
          {/* Features - chỉ hiển thị khi card lớn - fixed height for alignment */}
          <div className="mb-3 min-h-0">
            {isLarge && pkg.features && pkg.features.length > 0 && (
              <ul className="space-y-1.5">
                {pkg.features.slice(0, 3).map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-white/90">
                    <Check className="h-3.5 w-3.5 mt-0.5 shrink-0 text-white" />
                    <span className="line-clamp-1">{feature}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Bonuses - fixed height to ensure equal card heights */}
          <div className={`
            mb-3 p-2.5 rounded-lg border text-xs min-h-[80px] flex flex-col justify-center
            ${pkg.bonuses && pkg.bonuses.length > 0
              ? isLarge 
                ? 'bg-white/10 border-white/20' 
                : 'bg-yellow-50 border-yellow-200'
              : 'border-transparent bg-transparent'
            }
          `}>
            {pkg.bonuses && pkg.bonuses.length > 0 && (
              <div className="flex items-start gap-2">
                <Gift className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${
                  isLarge ? 'text-white' : 'text-yellow-600'
                }`} />
                <div className="flex-1">
                  <p className={`font-semibold mb-1 ${
                    isLarge ? 'text-white' : 'text-yellow-900'
                  }`}>
                    Quà tặng
                  </p>
                  <ul className="space-y-0.5">
                    {pkg.bonuses.map((bonus, idx) => (
                      <li key={idx} className={`
                        line-clamp-1
                        ${isLarge ? 'text-white/80' : 'text-yellow-800'}
                      `}>
                        • {bonus}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
          
          {/* Price & CTA */}
          <div className={`
            mt-auto pt-3 border-t
            ${isLarge ? 'border-white/20' : 'border-gray-200'}
          `}>
            {/* Price */}
            <div className="mb-3 text-center">
              <div className="flex items-baseline justify-center gap-2 mb-1.5">
                {hasDiscount && (
                  <span className={`
                    text-xs line-through
                    ${isLarge ? 'text-white/60' : 'text-gray-400'}
                  `}>
                    {formatCurrency(pkg.originalPrice!)}
                  </span>
                )}
                <span className={`
                  font-bold
                  ${isLarge 
                    ? 'text-white text-xl md:text-2xl' 
                    : 'text-[#F441A5] text-lg md:text-xl'
                  }
                `}>
                  {formatCurrency(pkg.price)}
                </span>
              </div>
              
              {/* Member Price - fixed height to ensure equal card heights */}
              <div className={`
                text-xs space-y-0.5 min-h-[2.5rem]
                ${isLarge ? 'text-white/70' : 'text-gray-600'}
              `}>
                {pkg.memberPrice ? (
                  <>
                    <p>Bạc: {formatCurrency(pkg.memberPrice.silver || pkg.price)}</p>
                    {pkg.memberPrice.gold && (
                      <p>Vàng: {formatCurrency(pkg.memberPrice.gold)}</p>
                    )}
                  </>
                ) : null}
              </div>
            </div>
            
            {/* CTA Button */}
            <Link href={`/packages/${pkg.slug}`} className="block w-full">
              <Button 
                className={`
                  w-full transition-all duration-200
                  shadow-md hover:shadow-lg
                  text-sm font-medium py-2.5
                  ${isLarge 
                    ? 'bg-white text-[#F441A5] hover:bg-white/95' 
                    : 'bg-[#F441A5] text-white hover:bg-[#F441A5]/90'
                  }
                `}
              >
                {isLarge ? 'Tìm hiểu thêm' : 'Xem chi tiết'}
              </Button>
            </Link>
          </div>
        </CardContent>
    </Card>
  )
}
