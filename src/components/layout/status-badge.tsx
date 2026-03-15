import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const statusColors: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  planning: 'bg-amber-50 text-amber-700 border-amber-200',
  draft: 'bg-gray-50 text-gray-600 border-gray-200',
  on_hold: 'bg-orange-50 text-orange-700 border-orange-200',
  completed: 'bg-blue-50 text-blue-700 border-blue-200',
  inactive: 'bg-gray-50 text-gray-500 border-gray-200',
  submitted: 'bg-blue-50 text-blue-700 border-blue-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  field: 'bg-amber-50 text-amber-700 border-amber-200',
  office: 'bg-blue-50 text-blue-700 border-blue-200',
  freelancer: 'bg-purple-50 text-purple-700 border-purple-200',
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colors = statusColors[status] || 'bg-gray-50 text-gray-600 border-gray-200'
  const label = status.replace(/_/g, ' ')

  return (
    <Badge
      variant="outline"
      className={cn('capitalize font-medium', colors, className)}
    >
      {label}
    </Badge>
  )
}
