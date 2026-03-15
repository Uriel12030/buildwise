import { getMyLogs, getMyProjects, getMyStats } from '@/features/logs/my-logs-actions'
import { PageHeader } from '@/components/layout/page-header'
import { StatCard } from '@/components/layout/stat-card'
import { StatusBadge } from '@/components/layout/status-badge'
import { EmptyState } from '@/components/layout/empty-state'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ClipboardList, Plus, FileText, Calendar, FolderKanban } from 'lucide-react'
import Link from 'next/link'
import dayjs from '@/lib/dayjs'

export default async function MyLogsPage() {
  const [logs, projects, stats] = await Promise.all([
    getMyLogs(),
    getMyProjects(),
    getMyStats(),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="היומנים שלי"
        description="ניהול יומני עבודה יומיים"
        action={
          <Button asChild>
            <Link href="/logs/new">
              <Plus className="ms-2 h-4 w-4" />
              יומן חדש
            </Link>
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="סה״כ יומנים" value={stats.totalLogs} icon={FileText} />
        <StatCard title="השבוע" value={stats.logsThisWeek} icon={Calendar} />
        <StatCard title="היום" value={stats.logsToday} icon={ClipboardList} />
        <StatCard title="טיוטות פתוחות" value={stats.draftLogs} icon={FileText} description="ממתינות לשליחה" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions - Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">הפרויקטים שלי</CardTitle>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <p className="text-sm text-muted-foreground">אין פרויקטים משויכים</p>
            ) : (
              <div className="space-y-2">
                {projects.map((project: any) => (
                  <div key={project.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">{project.name}</p>
                      <p className="text-xs text-muted-foreground">{project.client?.name}</p>
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/logs/new?projectId=${project.id}`}>
                        <Plus className="ms-1 h-3 w-3" />
                        יומן
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Logs */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">יומנים אחרונים</CardTitle>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title="אין יומנים"
                description="צור את היומן הראשון שלך"
                actionLabel="יומן חדש"
                actionHref="/logs/new"
              />
            ) : (
              <div className="space-y-2">
                {logs.map((log: any) => (
                  <Link
                    key={log.id}
                    href={`/logs/${log.id}`}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{log.project?.name}</p>
                        <StatusBadge status={log.status} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {dayjs(log.log_date).format('dddd, D בMMMM YYYY')} · {log.workers?.length || 0} עובדים
                      </p>
                    </div>
                    {log.status === 'draft' && (
                      <Button size="sm" variant="outline" className="me-2">
                        המשך עריכה
                      </Button>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
