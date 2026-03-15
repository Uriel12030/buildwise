import { getLog } from '@/features/logs/actions'
import { PageHeader } from '@/components/layout/page-header'
import { StatusBadge } from '@/components/layout/status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Pencil, Calendar, CloudSun, ImageIcon, FileIcon } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import dayjs from '@/lib/dayjs'

export default async function LogDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let log: any

  try {
    log = await getLog(id)
  } catch {
    notFound()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`יומן עבודה — ${dayjs(log.log_date).format('D בMMM YYYY')}`}
        action={
          <Button asChild variant="outline" size="sm">
            <Link href={`/logs/${id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              עריכה
            </Link>
          </Button>
        }
      />

      {/* Status and meta */}
      <div className="flex flex-wrap gap-4 items-center">
        <StatusBadge status={log.status} />
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          {dayjs(log.log_date).format('dddd, D בMMMM YYYY')}
        </div>
        {log.weather && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <CloudSun className="h-4 w-4" />
            {log.weather}
          </div>
        )}
      </div>

      {/* Project info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">פרויקט</p>
              <Link
                href={`/projects/${log.project?.id}`}
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                {log.project?.name} ({log.project?.project_code})
              </Link>
              {log.project?.client && (
                <p className="text-xs text-gray-500">
                  לקוח:{' '}
                  <Link
                    href={`/clients/${log.project.client.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {log.project.client.name}
                  </Link>
                </p>
              )}
            </div>
            {log.site_manager && (
              <div className="text-right">
                <p className="text-xs text-gray-500">מנהל עבודה</p>
                <p className="text-sm font-medium">{log.site_manager.full_name}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Work summary, issues, notes */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">סיכום עבודה</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{log.work_summary}</p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {log.issues && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base text-orange-600">בעיות</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{log.issues}</p>
              </CardContent>
            </Card>
          )}
          {log.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">הערות</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{log.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Workers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            עובדים ({log.workers?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!log.workers || log.workers.length === 0 ? (
            <p className="text-sm text-gray-500">לא נרשמו עובדים</p>
          ) : (
            <div className="rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-4 py-2 text-left font-medium text-gray-500">עובד</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-500">תפקיד</th>
                    <th className="px-4 py-2 text-right font-medium text-gray-500">שעות</th>
                    <th className="px-4 py-2 text-right font-medium text-gray-500">נוספות</th>
                    <th className="px-4 py-2 text-right font-medium text-gray-500">תעריף</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-500">הערות</th>
                  </tr>
                </thead>
                <tbody>
                  {log.workers.map((w: any) => (
                    <tr key={w.id} className="border-b last:border-0">
                      <td className="px-4 py-2">
                        <Link href={`/employees/${w.employee?.id}`} className="text-blue-600 hover:underline">
                          {w.employee?.full_name}
                        </Link>
                      </td>
                      <td className="px-4 py-2 text-gray-500">{w.employee?.role_title}</td>
                      <td className="px-4 py-2 text-right">{w.hours_worked}</td>
                      <td className="px-4 py-2 text-right">{w.overtime_hours}</td>
                      <td className="px-4 py-2 text-right">₪{w.employee?.hourly_rate}</td>
                      <td className="px-4 py-2 text-gray-500">{w.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 font-medium">
                    <td className="px-4 py-2" colSpan={2}>סה"כ</td>
                    <td className="px-4 py-2 text-right">
                      {log.workers.reduce((sum: number, w: any) => sum + (w.hours_worked || 0), 0)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {log.workers.reduce((sum: number, w: any) => sum + (w.overtime_hours || 0), 0)}
                    </td>
                    <td className="px-4 py-2" colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Files */}
      {log.files && log.files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">קבצים ({log.files.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {log.files.map((file: any) => (
                <div key={file.id} className="flex items-center gap-3 rounded-lg border p-3">
                  {file.file_type?.startsWith('image/') ? (
                    <ImageIcon className="h-5 w-5 text-blue-400" />
                  ) : (
                    <FileIcon className="h-5 w-5 text-gray-400" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{file.file_name}</p>
                    <p className="text-xs text-gray-500">
                      {dayjs(file.uploaded_at).format('MMM D, HH:mm')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timestamps */}
      <div className="text-xs text-gray-400 space-x-4">
        <span>נוצר: {dayjs(log.created_at).format('MMM D, YYYY HH:mm')}</span>
        <span>עודכן: {dayjs(log.updated_at).format('MMM D, YYYY HH:mm')}</span>
      </div>
    </div>
  )
}
