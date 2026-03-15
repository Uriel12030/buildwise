import { getGoodMorningData } from '@/features/dashboard/good-morning-actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/layout/status-badge'
import { Separator } from '@/components/ui/separator'
import { Users, Wrench, TrendingUp, ClipboardList, DollarSign, Clock, Sun } from 'lucide-react'
import Link from 'next/link'
import dayjs from '@/lib/dayjs'
import { DateSelector } from './date-selector'

function CostCard({ title, value, icon: Icon, subtitle, color }: {
  title: string
  value: number
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
              ₪{value.toLocaleString('he-IL', { maximumFractionDigits: 0 })}
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
    <div className="space-y-8">
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
        <Card className="overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-[13px] font-medium text-muted-foreground">יומנים שנפתחו</p>
                <p className="text-2xl font-bold tracking-tight">{data.logsCount}</p>
                <p className="text-xs text-muted-foreground">פרויקטים פעילים היום</p>
              </div>
              <div className="rounded-xl p-2.5 bg-purple-50 text-purple-600">
                <ClipboardList className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects Breakdown */}
      <div className="space-y-4">
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
          <div className="space-y-4">
            {data.projects.map((project) => (
              <Card key={project.logId}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/projects/${project.projectId}`}
                        className="text-base font-semibold hover:text-primary transition-colors"
                      >
                        {project.projectName}
                      </Link>
                      <StatusBadge status={project.logStatus} />
                    </div>
                    <div className="text-end">
                      <p className="text-lg font-bold text-primary">
                        ₪{project.totalWorkersCost.toLocaleString('he-IL', { maximumFractionDigits: 0 })}
                      </p>
                      <p className="text-xs text-muted-foreground">{project.totalHours} שעות</p>
                    </div>
                  </div>
                </CardHeader>
                {project.workSummary && (
                  <CardContent className="pt-0 pb-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">{project.workSummary}</p>
                  </CardContent>
                )}
                {project.workers.length > 0 && (
                  <CardContent className="pt-0">
                    <div className="rounded-lg border overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-muted/30 border-b">
                            <th className="px-3 py-2 text-start text-[11px] font-semibold text-muted-foreground uppercase">עובד</th>
                            <th className="px-3 py-2 text-start text-[11px] font-semibold text-muted-foreground uppercase">תפקיד</th>
                            <th className="px-3 py-2 text-end text-[11px] font-semibold text-muted-foreground uppercase">שעות</th>
                            <th className="px-3 py-2 text-end text-[11px] font-semibold text-muted-foreground uppercase">נוספות</th>
                            <th className="px-3 py-2 text-end text-[11px] font-semibold text-muted-foreground uppercase">תעריף</th>
                            <th className="px-3 py-2 text-end text-[11px] font-semibold text-muted-foreground uppercase">עלות</th>
                          </tr>
                        </thead>
                        <tbody>
                          {project.workers.map((w, i) => (
                            <tr key={i} className="border-b last:border-0">
                              <td className="px-3 py-2 font-medium">{w.name}</td>
                              <td className="px-3 py-2 text-muted-foreground">{w.role || '—'}</td>
                              <td className="px-3 py-2 text-end">{w.hours}</td>
                              <td className="px-3 py-2 text-end">{w.overtime > 0 ? w.overtime : '—'}</td>
                              <td className="px-3 py-2 text-end">₪{w.hourlyRate}</td>
                              <td className="px-3 py-2 text-end font-medium">₪{w.cost.toLocaleString('he-IL', { maximumFractionDigits: 0 })}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Equipment Breakdown */}
      {data.equipment.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Wrench className="h-5 w-5 text-muted-foreground" />
            עלות ציוד פעיל (8 שעות עבודה)
          </h2>
          <Card>
            <CardContent className="p-0">
              <div className="rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30 border-b">
                      <th className="px-4 py-2.5 text-start text-[11px] font-semibold text-muted-foreground uppercase">כלי</th>
                      <th className="px-4 py-2.5 text-start text-[11px] font-semibold text-muted-foreground uppercase">קטגוריה</th>
                      <th className="px-4 py-2.5 text-end text-[11px] font-semibold text-muted-foreground uppercase">עלות/שעה</th>
                      <th className="px-4 py-2.5 text-end text-[11px] font-semibold text-muted-foreground uppercase">עלות יומית</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.equipment.map((e) => (
                      <tr key={e.id} className="border-b last:border-0">
                        <td className="px-4 py-2.5">
                          <Link href={`/equipment/${e.id}`} className="font-medium hover:text-primary transition-colors">
                            {e.name}
                          </Link>
                        </td>
                        <td className="px-4 py-2.5">
                          <StatusBadge status={e.category} />
                        </td>
                        <td className="px-4 py-2.5 text-end">₪{e.hourlyCost}</td>
                        <td className="px-4 py-2.5 text-end font-medium">₪{e.dailyCost.toLocaleString('he-IL', { maximumFractionDigits: 0 })}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-muted/30 font-semibold">
                      <td className="px-4 py-2.5" colSpan={3}>סה&quot;כ עלות ציוד</td>
                      <td className="px-4 py-2.5 text-end">₪{data.totalEquipmentCost.toLocaleString('he-IL', { maximumFractionDigits: 0 })}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Daily Total */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6">
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
