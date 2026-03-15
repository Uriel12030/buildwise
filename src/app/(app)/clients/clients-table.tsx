'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/tables/data-table'
import { StatusBadge } from '@/components/layout/status-badge'
import type { Client } from '@/types'
import Link from 'next/link'

const columns: ColumnDef<Client>[] = [
  {
    accessorKey: 'name',
    header: 'שם',
    cell: ({ row }) => (
      <Link
        href={`/clients/${row.original.id}`}
        className="font-medium text-foreground hover:text-primary transition-colors"
      >
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: 'contact_name',
    header: 'איש קשר',
    cell: ({ row }) => row.original.contact_name || '—',
  },
  {
    accessorKey: 'phone',
    header: 'טלפון',
    cell: ({ row }) => row.original.phone || '—',
  },
  {
    accessorKey: 'email',
    header: 'אימייל',
    cell: ({ row }) => row.original.email || '—',
  },
  {
    accessorKey: 'is_active',
    header: 'סטטוס',
    cell: ({ row }) => (
      <StatusBadge status={row.original.is_active ? 'active' : 'inactive'} />
    ),
  },
]

export function ClientsTable({ data }: { data: Client[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="name"
      searchPlaceholder="חיפוש לקוחות..."
    />
  )
}
