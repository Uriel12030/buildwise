import { getLog } from '@/features/logs/actions'
import { PageHeader } from '@/components/layout/page-header'
import { StatusBadge } from '@/components/layout/status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Pencil, Calendar, CloudSun, ImageIcon, FileIcon, Clock } from 'lucide-react'
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

  const companyWorkers = (log.workers || []).filter((w: any) => w.worker_type === 'company' || (!w.worker_type && w.employee_id))
  const foreignWorkers = (log.workers || []).filter((w: any) => w.worker_type === 'foreign')
  const subcontractorWorkers = (log.workers || []).filter((w: any) => w.worker_type === 'subcontractor')
  const companyEquipment = (log.equipment || []).filter((e: any) => e.equipment_type === 'company')
  const subEquipment = (log.equipment || []).filter((e: any) => e.equipment_type === 'subcontractor')

  return (
    <div className="space-y-6">
      <PageHeader
        title={`יומן עבודה — ${dayjs(log.log_date).format('D בMMM YYYY')}`}
        action={
          <Button asChild variant="outline" size="sm">
            <Link href={`/logs/${id}/edit`}>
              <Pencil className="me-2 h-4 w-4" />
              עריכה
            </Link>
          </Button>
        }
      />

      {/* Status and meta */}
      <div className="flex flex-wrap gap-4 items-center">
        <StatusBadge status={log.status} />
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {dayjs(log.log_date).format('dddd, D בMMMM YYYY')}
        </div>
        {log.weather && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CloudSun className="h-4 w-4" />
            {log.weather}
          </div>
        )}
        {(log.start_time || log.end_time) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {log.start_time || '—'} — {log.end_time || '—'}
          </div>
        )}
      </div>

      {/* General Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">פרטים כלליים</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">פרויקט</p>
              <Link
                href={`/projects/${log.project?.id}`}
                className="text-sm font-medium text-brand hover:underline"
              >
                {log.project?.name} ({log.project?.project_code})
              </Link>
            </div>
            {log.project?.client && (
              <div>
                <p className="text-xs text-muted-foreground">מזמין עבודה</p>
                <Link
                  href={`/clients/${log.project.client.id}`}
                  className="text-sm font-medium text-brand hover:underline"
                >
                  {log.project.client.name}
                </Link>
              </div>
            )}
            {log.site_manager && (
              <div>
                <p className="text-xs text-muted-foreground">מנהל עבודה</p>
                <p className="text-sm font-medium">{log.site_manager.full_name}</p>
              </div>
            )}
            {log.site_address && (
              <div>
                <p className="text-xs text-muted-foreground">כתובת האתר</p>
                <p className="text-sm font-medium">{log.site_address}</p>
              </div>
            )}
            {log.main_contractor && (
              <div>
                <p className="text-xs text-muted-foreground">קבלן ראשי</p>
                <p className="text-sm font-medium">{log.main_contractor}</p>
              </div>
            )}
            {log.project?.project_manager && (
              <div>
                <p className="text-xs text-muted-foreground">מנהל פרויקט</p>
                <p className="text-sm font-medium">{log.project.project_manager.full_name}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Company Workers */}
      {companyWorkers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">כח אדם חברה ({companyWorkers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <WorkerTable workers={companyWorkers} />
          </CardContent>
        </Card>
      )}

      {/* Foreign Workers */}
      {foreignWorkers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">פועלים ({foreignWorkers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <WorkerTable workers={foreignWorkers} />
          </CardContent>
        </Card>
      )}

      {/* Subcontractor Workers */}
      {subcontractorWorkers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">כח אדם קבלני משנה ({subcontractorWorkers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted">
                    <th className="px-4 py-2 text-right font-medium text-muted-foreground">שם עובד</th>
                    <th className="px-4 py-2 text-right font-medium text-muted-foreground">תפקיד</th>
                    <th className="px-4 py-2 text-right font-medium text-muted-foreground">שעות</th>
                    <th className="px-4 py-2 text-right font-medium text-muted-foreground">נוספות</th>
                    <th className="px-4 py-2 text-right font-medium text-muted-foreground">הערות</th>
                  </tr>
                </thead>
                <tbody>
                  {subcontractorWorkers.map((w: any) => (
                    <tr key={w.id} className="border-b last:border-0">
                      <td className="px-4 py-2">{w.worker_name || '—'}</td>
                      <td className="px-4 py-2 text-muted-foreground">{w.role_title || '—'}</td>
                      <td className="px-4 py-2 text-right">{w.hours_worked}</td>
                      <td className="px-4 py-2 text-right">{w.overtime_hours}</td>
                      <td className="px-4 py-2 text-muted-foreground">{w.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Company Equipment */}
      {companyEquipment.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">כלים וציוד חברה ({companyEquipment.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <EquipmentTable items={companyEquipment} />
          </CardContent>
        </Card>
      )}

      {/* Subcontractor Equipment */}
      {subEquipment.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">כלים קבלני משנה ({subEquipment.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <EquipmentTable items={subEquipment} />
          </CardContent>
        </Card>
      )}

      {/* Activities */}
      {log.activities && log.activities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">תיאור פעולות שבוצעו באתר ({log.activities.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted">
                    <th className="px-4 py-2 text-right font-medium text-muted-foregroundw-16">מס&apos;</th>
                    <th className="px-4 py-2 text-right font-medium text-muted-foreground">תיאור הפעולה</th>
                    <th className="px-4 py-2 text-center font-medium text-muted-foregroundw-24">עבודה חריגה</th>
                    <th className="px-4 py-2 text-right font-medium text-muted-foreground">הערות</th>
                  </tr>
                </thead>
                <tbody>
                  {log.activities
                    .sort((a: any, b: any) => a.seq_number - b.seq_number)
                    .map((a: any) => (
                      <tr key={a.id} className="border-b last:border-0">
                        <td className="px-4 py-2 text-center text-muted-foreground">{a.seq_number}</td>
                        <td className="px-4 py-2 whitespace-pre-wrap">{a.description}</td>
                        <td className="px-4 py-2 text-center">{a.is_irregular ? 'V' : ''}</td>
                        <td className="px-4 py-2 text-muted-foreground">{a.notes || '—'}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Materials */}
      {log.materials && log.materials.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">חומרים ({log.materials.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted">
                    <th className="px-4 py-2 text-right font-medium text-muted-foreground">חומר</th>
                    <th className="px-4 py-2 text-right font-medium text-muted-foreground">כמות</th>
                    <th className="px-4 py-2 text-right font-medium text-muted-foreground">ספק</th>
                    <th className="px-4 py-2 text-right font-medium text-muted-foreground">הערות</th>
                  </tr>
                </thead>
                <tbody>
                  {log.materials.map((m: any) => (
                    <tr key={m.id} className="border-b last:border-0">
                      <td className="px-4 py-2">{m.material_name}</td>
                      <td className="px-4 py-2">{m.quantity || '—'}</td>
                      <td className="px-4 py-2">{m.supplier || '—'}</td>
                      <td className="px-4 py-2 text-muted-foreground">{m.notes || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Issues and Notes */}
      <div className="grid gap-6 lg:grid-cols-2">
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
              <CardTitle className="text-base">הערות נוספות</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{log.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Work Summary - keep for backward compat */}
      {log.work_summary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">סיכום עבודה</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{log.work_summary}</p>
          </CardContent>
        </Card>
      )}

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
                    <FileIcon className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{file.file_name}</p>
                    <p className="text-xs text-muted-foreground">
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
      <div className="text-xs text-muted-foreground space-x-4">
        <span>נוצר: {dayjs(log.created_at).format('MMM D, YYYY HH:mm')}</span>
        <span>עודכן: {dayjs(log.updated_at).format('MMM D, YYYY HH:mm')}</span>
      </div>
    </div>
  )
}

function WorkerTable({ workers }: { workers: any[] }) {
  return (
    <div className="rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted">
            <th className="px-4 py-2 text-right font-medium text-muted-foreground">עובד</th>
            <th className="px-4 py-2 text-right font-medium text-muted-foreground">תפקיד</th>
            <th className="px-4 py-2 text-right font-medium text-muted-foreground">שעות</th>
            <th className="px-4 py-2 text-right font-medium text-muted-foreground">נוספות</th>
            <th className="px-4 py-2 text-right font-medium text-muted-foreground">תעריף</th>
            <th className="px-4 py-2 text-right font-medium text-muted-foreground">הערות</th>
          </tr>
        </thead>
        <tbody>
          {workers.map((w: any) => (
            <tr key={w.id} className="border-b last:border-0">
              <td className="px-4 py-2">
                {w.employee ? (
                  <Link href={`/employees/${w.employee.id}`} className="text-brand hover:underline">
                    {w.employee.full_name}
                  </Link>
                ) : (
                  w.worker_name || '—'
                )}
              </td>
              <td className="px-4 py-2 text-muted-foreground">{w.employee?.role_title || w.role_title || '—'}</td>
              <td className="px-4 py-2 text-right">{w.hours_worked}</td>
              <td className="px-4 py-2 text-right">{w.overtime_hours}</td>
              <td className="px-4 py-2 text-right">{w.employee?.hourly_rate ? `${w.employee.hourly_rate} \u20AA` : '—'}</td>
              <td className="px-4 py-2 text-muted-foreground">{w.notes || '—'}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-muted font-medium">
            <td className="px-4 py-2" colSpan={2}>סה&quot;כ</td>
            <td className="px-4 py-2 text-right">
              {workers.reduce((sum: number, w: any) => sum + (w.hours_worked || 0), 0)}
            </td>
            <td className="px-4 py-2 text-right">
              {workers.reduce((sum: number, w: any) => sum + (w.overtime_hours || 0), 0)}
            </td>
            <td className="px-4 py-2" colSpan={2}></td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

function EquipmentTable({ items }: { items: any[] }) {
  return (
    <div className="rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted">
            <th className="px-4 py-2 text-right font-medium text-muted-foreground">מס&apos; זיהוי</th>
            <th className="px-4 py-2 text-right font-medium text-muted-foreground">סוג</th>
            <th className="px-4 py-2 text-right font-medium text-muted-foreground">הערות</th>
          </tr>
        </thead>
        <tbody>
          {items.map((e: any) => (
            <tr key={e.id} className="border-b last:border-0">
              <td className="px-4 py-2">{e.identification_number || '—'}</td>
              <td className="px-4 py-2">{e.equipment_name}</td>
              <td className="px-4 py-2 text-muted-foreground">{e.notes || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
