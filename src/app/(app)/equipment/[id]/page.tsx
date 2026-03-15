import { getEquipmentItem } from '@/features/equipment/actions'
import { PageHeader } from '@/components/layout/page-header'
import { StatusBadge } from '@/components/layout/status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { notFound } from 'next/navigation'
import dayjs from '@/lib/dayjs'
import { Shield, FileText, Calendar, Wrench, ExternalLink } from 'lucide-react'

function InfoField({ label, value, mono }: { label: string; value: string | number | null | undefined; mono?: boolean }) {
  if (value == null || value === '') return null
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-sm ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  )
}

function FileLink({ label, url }: { label: string; url: string | null | undefined }) {
  if (!url) return null
  // May have multiple URLs comma-separated
  const urls = url.split(',').map(u => u.trim()).filter(Boolean)
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <div className="space-y-1">
        {urls.map((u, i) => {
          const decoded = decodeURIComponent(u.split('/').pop() || `קובץ ${i + 1}`)
          return (
            <a
              key={i}
              href={u}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <FileText className="h-3.5 w-3.5" />
              {decoded.length > 40 ? decoded.substring(0, 40) + '...' : decoded}
              <ExternalLink className="h-3 w-3" />
            </a>
          )
        })}
      </div>
    </div>
  )
}

export default async function EquipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let equipment: any

  try {
    equipment = await getEquipmentItem(id)
  } catch {
    notFound()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={equipment.name}
        badge={
          <div className="flex gap-2">
            <StatusBadge status={equipment.category} />
            <StatusBadge status={equipment.status} />
          </div>
        }
      />

      {equipment.equipment_code && (
        <p className="text-sm text-muted-foreground -mt-4">מספר רישוי: {equipment.equipment_code}</p>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* General Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              פרטי ציוד
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoField label="סוג" value={equipment.type_name} />
            <InfoField label="שם תצוגה" value={equipment.type_display_name} />
            <InfoField label="מספר שלדה" value={equipment.chassis_number} mono />
            <InfoField label="מספר רישוי" value={equipment.license_plate} />
            <InfoField label="תאריך עליה לכביש" value={equipment.road_date ? dayjs(equipment.road_date).format('D בMMM YYYY') : null} />
            <InfoField label="ותק (שנים)" value={equipment.seniority} />
            {equipment.assigned_employee && (
              <div>
                <p className="text-xs text-muted-foreground">עובד משויך</p>
                <p className="text-sm font-medium">{equipment.assigned_employee.full_name}</p>
              </div>
            )}
            <InfoField label="הערות" value={equipment.notes} />
          </CardContent>
        </Card>

        {/* Insurance & Tests */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" />
              ביטוח וטסטים
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-3 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">ביטוח חובה</p>
              <InfoField label="חברה" value={equipment.insurance_company_mandatory} />
              <InfoField label="תוקף" value={equipment.insurance_mandatory_expiry ? dayjs(equipment.insurance_mandatory_expiry).format('D בMMM YYYY') : null} />
            </div>
            <div className="rounded-lg border p-3 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">ביטוח מקיף</p>
              <InfoField label="חברה" value={equipment.insurance_company_comprehensive} />
              <InfoField label="תוקף" value={equipment.insurance_comprehensive_expiry ? dayjs(equipment.insurance_comprehensive_expiry).format('D בMMM YYYY') : null} />
            </div>
            <InfoField label="גרירה ושמשות" value={equipment.towing_and_windshields} />
            <InfoField label="גיל ביטוח" value={equipment.insurance_age} />
            <InfoField label="תוקף טסט" value={equipment.test_expiry ? dayjs(equipment.test_expiry).format('D בMMM YYYY') : null} />
          </CardContent>
        </Card>

        {/* Costs & Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              עלויות ומסמכים
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {equipment.purchase_cost != null && (
                <div>
                  <p className="text-xs text-muted-foreground">עלות רכישה</p>
                  <p className="text-lg font-semibold">₪{Number(equipment.purchase_cost).toLocaleString()}</p>
                </div>
              )}
              <InfoField label="עלות שוטפת" value={equipment.operating_cost != null ? `₪${Number(equipment.operating_cost).toLocaleString()}` : null} />
              <InfoField label="תשלום לשעה" value={equipment.hourly_cost != null ? `₪${equipment.hourly_cost}` : null} />
            </div>

            <div className="border-t pt-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground">מסמכים</p>
              <FileLink label="רשיון" url={equipment.license_file_url} />
              <FileLink label="ביטוחים" url={equipment.insurance_file_urls} />
              <FileLink label="טסט" url={equipment.test_file_url} />
              <FileLink label="תסקירים" url={equipment.reports_file_url} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
