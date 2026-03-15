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
  maintenance: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  damaged: 'bg-red-50 text-red-700 border-red-200',
  archived: 'bg-gray-50 text-gray-400 border-gray-200',
  available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  in_use: 'bg-blue-50 text-blue-700 border-blue-200',
  out_of_stock: 'bg-red-50 text-red-600 border-red-200',
  expired: 'bg-gray-50 text-gray-500 border-gray-200',
  heavy_equipment: 'bg-orange-50 text-orange-700 border-orange-200',
  vehicle: 'bg-sky-50 text-sky-700 border-sky-200',
  truck: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  trailer: 'bg-violet-50 text-violet-700 border-violet-200',
  tool: 'bg-teal-50 text-teal-700 border-teal-200',
  other: 'bg-gray-50 text-gray-600 border-gray-200',
  delivery: 'bg-blue-50 text-blue-700 border-blue-200',
  transfer: 'bg-amber-50 text-amber-700 border-amber-200',
  daily: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  removal: 'bg-red-50 text-red-600 border-red-200',
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
  maintenance: 'bg-yellow-500',
  damaged: 'bg-red-500',
  archived: 'bg-gray-400',
  available: 'bg-emerald-500',
  in_use: 'bg-blue-500',
  out_of_stock: 'bg-red-500',
  expired: 'bg-gray-400',
  heavy_equipment: 'bg-orange-500',
  vehicle: 'bg-sky-500',
  truck: 'bg-indigo-500',
  trailer: 'bg-violet-500',
  tool: 'bg-teal-500',
  other: 'bg-gray-400',
  delivery: 'bg-blue-500',
  transfer: 'bg-amber-500',
  daily: 'bg-emerald-500',
  removal: 'bg-red-500',
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
  maintenance: 'תחזוקה',
  damaged: 'פגום',
  archived: 'בארכיון',
  available: 'זמין',
  in_use: 'בשימוש',
  out_of_stock: 'אזל',
  expired: 'פג תוקף',
  heavy_equipment: 'צמ"ה',
  vehicle: 'רכב',
  truck: 'משאית',
  trailer: 'עגלה/טריילר',
  tool: 'כלי',
  other: 'אחר',
  delivery: 'הובלה',
  transfer: 'העברה',
  daily: 'יומית',
  removal: 'פינוי',
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
