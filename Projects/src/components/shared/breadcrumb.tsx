import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('py-4', className)}>
      <ol className="flex items-center gap-2 text-sm flex-wrap">
        {/* Home */}
        <li className="flex items-center gap-2">
          <Link 
            href="/" 
            className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
          >
            <Home className="h-4 w-4" />
            <span>Trang chủ</span>
          </Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </li>

        {/* Dynamic items */}
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li key={index} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <>
                  <Link
                    href={item.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item.label}
                  </Link>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </>
              ) : (
                <span className={cn(
                  isLast 
                    ? 'text-foreground font-medium' 
                    : 'text-muted-foreground'
                )}>
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
