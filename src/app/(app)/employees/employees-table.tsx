'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/tables/data-table'
import { StatusBadge } from '@/components/layout/status-badge'
import { quickAddEmployee } from '@/features/employees/actions'
import type { Employee } from '@/types'
import Link from 'next/link'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const columns: ColumnDef<Employee>[] = [
  {
    accessorKey: 'full_name',
    header: 'שם',
    cell: ({ row }) => (
      <Link
        href={`/employees/${row.original.id}`}
        className="font-medium text-foreground hover:text-primary transition-colors"
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
  const router = useRouter()
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="full_name"
      searchPlaceholder="חיפוש עובדים..."
      quickAdd={{
        placeholder: 'הקלד שם עובד חדש ולחץ Enter...',
        onAdd: async (name) => {
          try {
            await quickAddEmployee(name)
            toast.success('העובד נוצר')
            router.refresh()
          } catch (e: any) {
            toast.error(e.message || 'שגיאה ביצירת עובד')
          }
        },
      }}
    />
  )
}
