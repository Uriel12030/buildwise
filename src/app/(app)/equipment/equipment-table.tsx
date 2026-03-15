'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/tables/data-table'
import { StatusBadge } from '@/components/layout/status-badge'
import { quickAddEquipment } from '@/features/equipment/actions'
import type { Equipment } from '@/types'
import Link from 'next/link'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const columns: ColumnDef<Equipment>[] = [
  {
    accessorKey: 'name',
    header: 'שם',
    cell: ({ row }) => (
      <Link
        href={`/equipment/${row.original.id}`}
        className="font-medium text-foreground hover:text-primary transition-colors"
      >
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: 'category',
    header: 'קטגוריה',
    cell: ({ row }) => <StatusBadge status={row.original.category} />,
  },
  {
    accessorKey: 'type_name',
    header: 'סוג',
    cell: ({ row }) => row.original.type_name || '—',
  },
  {
    accessorKey: 'status',
    header: 'סטטוס',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: 'chassis_number',
    header: 'מספר שלדה',
    cell: ({ row }) => row.original.chassis_number || '—',
  },
  {
    accessorKey: 'hourly_cost',
    header: 'עלות/שעה',
    cell: ({ row }) =>
      row.original.hourly_cost != null ? `₪${row.original.hourly_cost}` : '—',
  },
]

export function EquipmentTable({ data }: { data: Equipment[] }) {
  const router = useRouter()
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="name"
      searchPlaceholder="חיפוש ציוד..."
      quickAdd={{
        placeholder: 'הקלד שם ציוד/כלי חדש ולחץ Enter...',
        onAdd: async (name) => {
          try {
            await quickAddEquipment(name)
            toast.success('הציוד נוצר')
            router.refresh()
          } catch (e: any) {
            toast.error(e.message || 'שגיאה ביצירת ציוד')
          }
        },
      }}
    />
  )
}
