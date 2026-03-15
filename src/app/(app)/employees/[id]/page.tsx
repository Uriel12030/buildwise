import { getEmployee, getEmployeeProjects, getEmployeeRecentLogs } from '@/features/employees/actions'
import { PageHeader } from '@/components/layout/page-header'
import { StatusBadge } from '@/components/layout/status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/layout/empty-state'
import { Pencil, FolderKanban, ClipboardList, Phone, Mail } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import dayjs from 'dayjs'

export default async function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let employee, projects, recentLogs

  try {
    ;[employee, projects, recentLogs] = await Promise.all([
      getEmployee(id),
      getEmployeeProjects(id),
      getEmployeeRecentLogs(id),
    ])
  } catch {
    notFound()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={employee.full_name}
        action={
          <Button asChild variant="outline">
            <Link href={`/employees/${id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              עריכה
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">פרטי עובד</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <StatusBadge status={employee.status} />
              <StatusBadge status={employee.employee_type} />
            </div>
            <div>
              <p className="text-xs text-gray-500">תפקיד</p>
              <p className="text-sm">{employee.role_title}</p>
            </div>
            {employee.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <p className="text-sm">{employee.phone}</p>
              </div>
            )}
            {employee.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <p className="text-sm">{employee.email}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-500">תעריף לשעה</p>
              <p className="text-sm font-medium">₪{employee.hourly_rate}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">תחילת העסקה</p>
              <p className="text-sm">{dayjs(employee.hire_date).format('MMM D, YYYY')}</p>
            </div>
            {employee.notes && (
              <div>
                <p className="text-xs text-gray-500">הערות</p>
                <p className="text-sm whitespace-pre-wrap">{employee.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">פרויקטים משויכים</CardTitle>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <EmptyState
                icon={FolderKanban}
                title="אין פרויקטים"
                description="לא משויך לפרויקטים."
              />
            ) : (
              <div className="space-y-2">
                {projects.map((pe: any) => (
                  <Link
                    key={pe.id}
                    href={`/projects/${pe.project?.id}`}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">{pe.project?.name}</p>
                      <p className="text-xs text-gray-500">{pe.project?.client?.name}</p>
                    </div>
                    {pe.assigned_to && (
                      <span className="text-xs text-gray-400">הסתיים</span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">השתתפות ביומנים</CardTitle>
          </CardHeader>
          <CardContent>
            {recentLogs.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title="אין רשומות"
                description="אין השתתפות ביומנים."
              />
            ) : (
              <div className="space-y-2">
                {recentLogs.map((entry: any) => (
                  <Link
                    key={entry.id}
                    href={`/logs/${entry.daily_log?.id}`}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {entry.daily_log?.project?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {dayjs(entry.daily_log?.log_date).format('MMM D, YYYY')}
                      </p>
                    </div>
                    <span className="text-sm text-gray-600">
                      {entry.hours_worked}h
                    </span>
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
