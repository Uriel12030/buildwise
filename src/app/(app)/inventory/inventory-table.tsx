'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/tables/data-table'
import { StatusBadge } from '@/components/layout/status-badge'
import { quickAddInventoryItem } from '@/features/inventory/actions'
import type { InventoryItem } from '@/types'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const columns: ColumnDef<InventoryItem>[] = [
  {
    accessorKey: 'name',
    header: 'שם',
    cell: ({ row }) => (
      <span className="font-medium text-foreground">{row.original.name}</span>
    ),
  },
  {
    accessorKey: 'item_name',
    header: 'שם פריט',
    cell: ({ row }) => row.original.item_name || '—',
  },
  {
    accessorKey: 'supplier_name',
    header: 'ספק',
    cell: ({ row }) => row.original.supplier_name || '—',
  },
  {
    accessorKey: 'quantity',
    header: 'כמות',
    cell: ({ row }) => row.original.quantity,
  },
  {
    accessorKey: 'status',
    header: 'סטטוס',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: 'priority',
    header: 'עדיפות',
    cell: ({ row }) => row.original.priority || '—',
  },
]

export function InventoryTable({ data }: { data: InventoryItem[] }) {
  const router = useRouter()
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="name"
      searchPlaceholder="חיפוש מלאי..."
      quickAdd={{
        placeholder: 'הקלד שם פריט חדש ולחץ Enter...',
        onAdd: async (name) => {
          try {
            await quickAddInventoryItem(name)
            toast.success('הפריט נוצר')
            router.refresh()
          } catch (e: any) {
            toast.error(e.message || 'שגיאה ביצירת פריט')
          }
        },
      }}
    />
  )
}
