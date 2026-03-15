import { getGoodMorningData } from '@/features/dashboard/good-morning-actions'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/layout/status-badge'
import { Separator } from '@/components/ui/separator'
import { Users, Wrench, TrendingUp, ClipboardList, DollarSign, Sun } from 'lucide-react'
import Link from 'next/link'
import dayjs from '@/lib/dayjs'
import { DateSelector } from './date-selector'
import { ProjectRow } from './project-row'

function CostCard({ title, value, icon: Icon, subtitle, color }: {
  title: string
  value: number | string
  icon: any
  subtitle?: string
  color: string
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-[13px] font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight">
              {typeof value === 'number' ? `₪${value.toLocaleString('he-IL', { maximumFractionDigits: 0 })}` : value}
            </p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className={`rounded-xl p-2.5 ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default async function GoodMorningPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const { date } = await searchParams
  const data = await getGoodMorningData(date)
  const displayDate = dayjs(data.date).format('dddd, D בMMMM YYYY')
  const isToday = data.date === dayjs().format('YYYY-MM-DD')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Sun className="h-8 w-8 text-amber-500" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isToday ? `בוקר טוב, ${data.userName}` : `סיכום יום — ${displayDate}`}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isToday ? displayDate : ''}
            </p>
          </div>
        </div>
        <DateSelector currentDate={data.date} />
        <Separator />
      </div>

      {/* Top Cost Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CostCard
          title="עלות עובדים"
          value={data.totalWorkersCost}
          icon={Users}
          subtitle={`${data.totalWorkers} עובדים ביומנים`}
          color="bg-blue-50 text-blue-600"
        />
        <CostCard
          title="עלות ציוד"
          value={data.totalEquipmentCost}
          icon={Wrench}
          subtitle={`${data.totalEquipment} כלים פעילים`}
          color="bg-orange-50 text-orange-600"
        />
        <CostCard
          title='סה"כ עלות יומית'
          value={data.totalDailyCost}
          icon={DollarSign}
          subtitle="עובדים + ציוד"
          color="bg-emerald-50 text-emerald-600"
        />
        <CostCard
          title="יומנים שנפתחו"
          value={String(data.logsCount)}
          icon={ClipboardList}
          subtitle="פרויקטים פעילים היום"
          color="bg-purple-50 text-purple-600"
        />
      </div>

      {/* Projects Breakdown - Compact */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
          פירוט לפי פרויקט
        </h2>

        {data.projects.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <ClipboardList className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
              <p className="font-medium">אין יומני עבודה ליום זה</p>
              <p className="text-sm mt-1">לא נפתחו יומני עבודה ב-{displayDate}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {data.projects.map((project) => (
              <ProjectRow key={project.logId} project={project} />
            ))}
          </div>
        )}
      </div>

      {/* Daily Total */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">סה&quot;כ עלות יומית משוערת</p>
              <p className="text-xs text-muted-foreground mt-0.5">עובדים + ציוד פעיל</p>
            </div>
            <p className="text-3xl font-bold text-primary">
              ₪{data.totalDailyCost.toLocaleString('he-IL', { maximumFractionDigits: 0 })}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
