'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/tables/data-table'
import { StatusBadge } from '@/components/layout/status-badge'
import Link from 'next/link'
import dayjs from '@/lib/dayjs'

interface LogRow {
  id: string
  log_date: string
  status: string
  work_summary: string
  project: { id: string; name: string; project_code: string } | null
  site_manager: { id: string; full_name: string } | null
  workers: { id: string }[]
}

const columns: ColumnDef<LogRow>[] = [
  {
    accessorKey: 'log_date',
    header: 'תאריך',
    cell: ({ row }) => (
      <Link
        href={`/logs/${row.original.id}`}
        className="font-medium text-foreground hover:text-primary transition-colors"
      >
        {dayjs(row.original.log_date).format('D בMMM YYYY')}
      </Link>
    ),
  },
  {
    accessorKey: 'project.name',
    header: 'פרויקט',
    cell: ({ row }) => (
      <div>
        <p className="text-sm">{row.original.project?.name}</p>
        <p className="text-xs text-muted-foreground">{row.original.project?.project_code}</p>
      </div>
    ),
  },
  {
    accessorKey: 'site_manager.full_name',
    header: 'מנהל עבודה',
    cell: ({ row }) => row.original.site_manager?.full_name || '—',
  },
  {
    accessorKey: 'status',
    header: 'סטטוס',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: 'workers_count',
    header: 'עובדים',
    cell: ({ row }) => row.original.workers?.length || 0,
  },
  {
    accessorKey: 'work_summary',
    header: 'סיכום',
    cell: ({ row }) => (
      <p className="text-sm text-muted-foreground truncate max-w-xs">
        {row.original.work_summary}
      </p>
    ),
  },
]

export function LogsTable({ data }: { data: LogRow[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="project.name"
      searchPlaceholder="חיפוש יומנים..."
    />
  )
}
