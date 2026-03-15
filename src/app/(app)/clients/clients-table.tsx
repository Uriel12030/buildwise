'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/tables/data-table'
import { StatusBadge } from '@/components/layout/status-badge'
import type { Client } from '@/types'
import Link from 'next/link'

const columns: ColumnDef<Client>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => (
      <Link
        href={`/clients/${row.original.id}`}
        className="font-medium text-blue-600 hover:underline"
      >
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: 'contact_name',
    header: 'Contact',
    cell: ({ row }) => row.original.contact_name || '—',
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
    cell: ({ row }) => row.original.phone || '—',
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => row.original.email || '—',
  },
  {
    accessorKey: 'is_active',
    header: 'Status',
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
      searchPlaceholder="Search clients..."
    />
  )
}
