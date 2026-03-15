import { Card, CardContent } from '@/components/ui/card'
import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: 'up' | 'down' | 'neutral'
  className?: string
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  className,
}: StatCardProps) {
  return (
    <Card className={cn('group hover:shadow-card-hover transition-shadow duration-200', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-medium text-muted-foreground">{title}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
            {description && (
              <p className="mt-1 text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="rounded-xl bg-brand-light p-3">
            <Icon className="h-6 w-6 text-brand" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
