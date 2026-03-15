import { getDashboardStats, getRecentLogs, getProjectsWithoutLogsToday, getLogsByWeek, getProjectsByStatus } from '@/features/dashboard/actions'
import { StatCard } from '@/components/layout/stat-card'
import { PageHeader } from '@/components/layout/page-header'
import { StatusBadge } from '@/components/layout/status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FolderKanban, Users, ClipboardList, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import dayjs from 'dayjs'
import { DashboardCharts } from './charts'

export default async function DashboardPage() {
  const [stats, recentLogs, missingLogs, logsByWeek, projectsByStatus] = await Promise.all([
    getDashboardStats(),
    getRecentLogs(),
    getProjectsWithoutLogsToday(),
    getLogsByWeek(),
    getProjectsByStatus(),
  ])

  return (
    <div className="space-y-6">
      <PageHeader title="לוח בקרה" description="סקירת הפעילות התפעולית" />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="פרויקטים פעילים" value={stats.activeProjects} icon={FolderKanban} />
        <StatCard title="עובדים פעילים" value={stats.totalEmployees} icon={Users} />
        <StatCard title="יומנים היום" value={stats.logsToday} icon={ClipboardList} />
        <StatCard title="טיוטות ממתינות" value={stats.pendingLogs} icon={AlertCircle} />
      </div>

      {/* Charts */}
      <DashboardCharts logsByWeek={logsByWeek} projectsByStatus={projectsByStatus} />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">יומני עבודה אחרונים</CardTitle>
          </CardHeader>
          <CardContent>
            {recentLogs.length === 0 ? (
              <p className="text-sm text-gray-500">אין יומנים עדיין</p>
            ) : (
              <div className="space-y-3">
                {recentLogs.map((log) => (
                  <Link
                    key={log.id}
                    href={`/logs/${log.id}`}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {(log.project as any)?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {dayjs(log.log_date).format('MMM D, YYYY')} · {(log.site_manager as any)?.full_name} · {(log.workers as any[])?.length || 0} עובדים
                      </p>
                    </div>
                    <StatusBadge status={log.status} />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Missing Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">יומנים חסרים היום</CardTitle>
          </CardHeader>
          <CardContent>
            {missingLogs.length === 0 ? (
              <p className="text-sm text-gray-500">לכל הפרויקטים הפעילים יש יומן להיום</p>
            ) : (
              <div className="space-y-2">
                {missingLogs.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between rounded-lg border border-amber-100 bg-amber-50 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{project.name}</p>
                      <p className="text-xs text-gray-500">{project.project_code}</p>
                    </div>
                    <Link
                      href={`/logs/new?projectId=${project.id}`}
                      className="text-xs font-medium text-blue-600 hover:underline"
                    >
                      צור יומן
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
