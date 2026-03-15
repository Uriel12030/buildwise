import { getEquipmentItem } from '@/features/equipment/actions'
import { PageHeader } from '@/components/layout/page-header'
import { StatusBadge } from '@/components/layout/status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { notFound } from 'next/navigation'
import dayjs from '@/lib/dayjs'

export default async function EquipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let equipment

  try {
    equipment = await getEquipmentItem(id)
  } catch {
    notFound()
  }

  return (
    <div className="space-y-6">
      <PageHeader title={equipment.name} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">פרטי ציוד</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <StatusBadge status={equipment.category} />
              <StatusBadge status={equipment.status} />
            </div>
            {equipment.type_name && (
              <div>
                <p className="text-xs text-muted-foreground">סוג</p>
                <p className="text-sm">{equipment.type_name}</p>
              </div>
            )}
            {equipment.chassis_number && (
              <div>
                <p className="text-xs text-muted-foreground">מספר שלדה</p>
                <p className="text-sm font-mono">{equipment.chassis_number}</p>
              </div>
            )}
            {equipment.license_plate && (
              <div>
                <p className="text-xs text-muted-foreground">מספר רישוי</p>
                <p className="text-sm">{equipment.license_plate}</p>
              </div>
            )}
            {equipment.insurance_company && (
              <div>
                <p className="text-xs text-muted-foreground">חברת ביטוח</p>
                <p className="text-sm">{equipment.insurance_company}</p>
              </div>
            )}
            {equipment.test_expiry && (
              <div>
                <p className="text-xs text-muted-foreground">תוקף טסט</p>
                <p className="text-sm">{dayjs(equipment.test_expiry).format('D בMMM YYYY')}</p>
              </div>
            )}
            {equipment.notes && (
              <div>
                <p className="text-xs text-muted-foreground">הערות</p>
                <p className="text-sm whitespace-pre-wrap">{equipment.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">עלויות</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {equipment.purchase_cost != null && (
              <div>
                <p className="text-xs text-muted-foreground">עלות רכישה</p>
                <p className="text-sm font-medium">₪{equipment.purchase_cost.toLocaleString()}</p>
              </div>
            )}
            {equipment.operating_cost != null && (
              <div>
                <p className="text-xs text-muted-foreground">עלות שוטפת</p>
                <p className="text-sm font-medium">₪{equipment.operating_cost.toLocaleString()}</p>
              </div>
            )}
            {equipment.hourly_cost != null && (
              <div>
                <p className="text-xs text-muted-foreground">תשלום לשעה</p>
                <p className="text-sm font-medium">₪{equipment.hourly_cost.toLocaleString()}</p>
              </div>
            )}
            {equipment.assigned_employee && (
              <div>
                <p className="text-xs text-muted-foreground">עובד משויך</p>
                <p className="text-sm">{equipment.assigned_employee.full_name}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
