import { getProject, getProjectEmployees, getProjectLogs } from '@/features/projects/actions'
import { PageHeader } from '@/components/layout/page-header'
import { StatusBadge } from '@/components/layout/status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/layout/empty-state'
import { Pencil, Users, ClipboardList, MapPin, Calendar, Plus } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import dayjs from '@/lib/dayjs'
import { AssignEmployeeButton } from './assign-employee'

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let project: any, employees: any[], logs: any[]

  try {
    ;[project, employees, logs] = await Promise.all([
      getProject(id),
      getProjectEmployees(id),
      getProjectLogs(id),
    ])
  } catch {
    notFound()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={project.name}
        action={
          <div className="flex gap-2">
            <Button asChild size="sm">
              <Link href={`/logs/new?projectId=${id}`}>
                <Plus className="mr-2 h-4 w-4" />
                יומן חדש
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={`/projects/${id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                עריכה
              </Link>
            </Button>
          </div>
        }
      />

      {/* Project Info */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">סטטוס</p>
            <StatusBadge status={project.status} className="mt-1" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">לקוח</p>
            <Link href={`/clients/${project.client?.id}`} className="text-sm font-medium text-blue-600 hover:underline mt-1 block">
              {project.client?.name}
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500">מספר פרויקט</p>
            <p className="text-sm font-medium mt-1">{project.project_code}</p>
          </CardContent>
        </Card>
        {project.location && (
          <Card>
            <CardContent className="p-4 flex items-start gap-2">
              <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">מיקום</p>
                <p className="text-sm mt-1">{project.location}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Description */}
      {project.description && (
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-gray-500 mb-1">תיאור</p>
            <p className="text-sm whitespace-pre-wrap">{project.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Dates & People */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {project.start_date && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-gray-500">התחלה:</span>
            <span>{dayjs(project.start_date).format('D בMMM YYYY')}</span>
          </div>
        )}
        {project.end_date && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-gray-500">סיום:</span>
            <span>{dayjs(project.end_date).format('D בMMM YYYY')}</span>
          </div>
        )}
        {project.project_manager && (
          <div className="text-sm">
            <span className="text-gray-500">מנהל פרויקט:</span>{' '}
            <span className="font-medium">{project.project_manager.full_name}</span>
          </div>
        )}
        {project.site_manager && (
          <div className="text-sm">
            <span className="text-gray-500">מנהל עבודה:</span>{' '}
            <span className="font-medium">{project.site_manager.full_name}</span>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Employees */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">עובדים משויכים</CardTitle>
            <AssignEmployeeButton projectId={id} />
          </CardHeader>
          <CardContent>
            {employees.length === 0 ? (
              <EmptyState icon={Users} title="אין עובדים" description="שייך עובדים לפרויקט זה." />
            ) : (
              <div className="space-y-2">
                {employees.map((pe: any) => (
                  <div key={pe.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <Link href={`/employees/${pe.employee?.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                        {pe.employee?.full_name}
                      </Link>
                      <p className="text-xs text-gray-500">{pe.employee?.role_title}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        מאז {dayjs(pe.assigned_from).format('D בMMM')}
                      </p>
                      {pe.assigned_to && (
                        <span className="text-xs text-gray-400">הסתיים</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Logs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">יומני עבודה אחרונים</CardTitle>
            <Button asChild size="sm" variant="outline">
              <Link href={`/logs?projectId=${id}`}>הצג הכל</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title="אין יומנים"
                description="צור את היומן הראשון."
                actionLabel="צור יומן"
                actionHref={`/logs/new?projectId=${id}`}
              />
            ) : (
              <div className="space-y-2">
                {logs.map((log: any) => (
                  <Link
                    key={log.id}
                    href={`/logs/${log.id}`}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {dayjs(log.log_date).format('D בMMM YYYY')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {log.site_manager?.full_name} · {log.workers?.length || 0} עובדים
                      </p>
                    </div>
                    <StatusBadge status={log.status} />
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
