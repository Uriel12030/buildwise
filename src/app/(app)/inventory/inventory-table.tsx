'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/tables/data-table'
import { StatusBadge } from '@/components/layout/status-badge'
import type { InventoryItem } from '@/types'

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
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="name"
      searchPlaceholder="חיפוש מלאי..."
    />
  )
}
