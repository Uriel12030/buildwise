'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/tables/data-table'
import { StatusBadge } from '@/components/layout/status-badge'
import type { Equipment } from '@/types'
import Link from 'next/link'

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
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="name"
      searchPlaceholder="חיפוש ציוד..."
    />
  )
}
