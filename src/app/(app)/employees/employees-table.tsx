'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/tables/data-table'
import { StatusBadge } from '@/components/layout/status-badge'
import type { Employee } from '@/types'
import Link from 'next/link'

const columns: ColumnDef<Employee>[] = [
  {
    accessorKey: 'full_name',
    header: 'שם',
    cell: ({ row }) => (
      <Link
        href={`/employees/${row.original.id}`}
        className="font-medium text-brand hover:underline"
      >
        {row.original.full_name}
      </Link>
    ),
  },
  {
    accessorKey: 'role_title',
    header: 'תפקיד',
  },
  {
    accessorKey: 'employee_type',
    header: 'סוג',
    cell: ({ row }) => <StatusBadge status={row.original.employee_type} />,
  },
  {
    accessorKey: 'phone',
    header: 'טלפון',
    cell: ({ row }) => row.original.phone || '—',
  },
  {
    accessorKey: 'hourly_rate',
    header: 'תעריף/שעה',
    cell: ({ row }) => `₪${row.original.hourly_rate}`,
  },
  {
    accessorKey: 'status',
    header: 'סטטוס',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
]

export function EmployeesTable({ data }: { data: Employee[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="full_name"
      searchPlaceholder="חיפוש עובדים..."
    />
  )
}
