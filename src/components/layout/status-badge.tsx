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

const dotColors: Record<string, string> = {
  active: 'bg-emerald-500',
  planning: 'bg-amber-500',
  draft: 'bg-gray-400',
  on_hold: 'bg-orange-500',
  completed: 'bg-blue-500',
  inactive: 'bg-gray-400',
  submitted: 'bg-blue-500',
  approved: 'bg-emerald-500',
  field: 'bg-amber-500',
  office: 'bg-blue-500',
  freelancer: 'bg-purple-500',
}

interface StatusBadgeProps {
  status: string
  className?: string
}

const statusLabels: Record<string, string> = {
  active: 'פעיל',
  planning: 'תכנון',
  draft: 'טיוטה',
  on_hold: 'מושהה',
  completed: 'הושלם',
  inactive: 'לא פעיל',
  submitted: 'הוגש',
  approved: 'אושר',
  field: 'שטח',
  office: 'משרד',
  freelancer: 'פרילנסר',
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colors = statusColors[status] || 'bg-gray-50 text-gray-600 border-gray-200'
  const label = statusLabels[status] || status.replace(/_/g, ' ')

  return (
    <Badge
      variant="outline"
      className={cn('capitalize font-medium gap-1.5', colors, className)}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', dotColors[status] || 'bg-gray-400')} />
      {label}
    </Badge>
  )
}
