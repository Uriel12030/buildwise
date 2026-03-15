import { getInventoryItems } from '@/features/inventory/actions'
import { PageHeader } from '@/components/layout/page-header'
import { InventoryTable } from './inventory-table'

export default async function InventoryPage() {
  const items = await getInventoryItems()

  return (
    <div className="space-y-6">
      <PageHeader
        title="מלאי וכלי עבודה"
        description={`${items.length} פריטים`}
      />
      <InventoryTable data={items} />
    </div>
  )
}
