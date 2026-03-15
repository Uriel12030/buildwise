'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/tables/data-table'
import { StatusBadge } from '@/components/layout/status-badge'
import Link from 'next/link'
import dayjs from 'dayjs'

interface ProjectRow {
  id: string
  name: string
  project_code: string
  status: string
  location: string | null
  start_date: string | null
  client: { id: string; name: string } | null
  project_manager: { id: string; full_name: string } | null
  site_manager: { id: string; full_name: string } | null
}

const columns: ColumnDef<ProjectRow>[] = [
  {
    accessorKey: 'name',
    header: 'Project',
    cell: ({ row }) => (
      <div>
        <Link
          href={`/projects/${row.original.id}`}
          className="font-medium text-blue-600 hover:underline"
        >
          {row.original.name}
        </Link>
        <p className="text-xs text-gray-500">{row.original.project_code}</p>
      </div>
    ),
  },
  {
    accessorKey: 'client.name',
    header: 'Client',
    cell: ({ row }) => row.original.client?.name || '—',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: 'location',
    header: 'Location',
    cell: ({ row }) => row.original.location || '—',
  },
  {
    accessorKey: 'start_date',
    header: 'Start Date',
    cell: ({ row }) =>
      row.original.start_date
        ? dayjs(row.original.start_date).format('MMM D, YYYY')
        : '—',
  },
  {
    accessorKey: 'project_manager.full_name',
    header: 'PM',
    cell: ({ row }) => row.original.project_manager?.full_name || '—',
  },
]

export function ProjectsTable({ data }: { data: ProjectRow[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="name"
      searchPlaceholder="Search projects..."
    />
  )
}
