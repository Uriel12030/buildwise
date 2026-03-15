import { getEquipment } from '@/features/equipment/actions'
import { PageHeader } from '@/components/layout/page-header'
import { EquipmentTable } from './equipment-table'

export default async function EquipmentPage() {
  const equipment = await getEquipment()

  return (
    <div className="space-y-6">
      <PageHeader
        title="ציוד וכלים"
        description={`${equipment.length} פריטים`}
      />
      <EquipmentTable data={equipment} />
    </div>
  )
}
