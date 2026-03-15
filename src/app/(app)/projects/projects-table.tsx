'use client'

import { useState } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/tables/data-table'
import { StatusBadge } from '@/components/layout/status-badge'
import Link from 'next/link'
import dayjs from '@/lib/dayjs'
import { ChevronDown, ClipboardList } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RecentLog {
  id: string
  log_date: string
  status: string
  work_summary: string | null
  workerCount: number
  cost: number
}

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
  stats: {
    logsCount: number
    totalCost: number
    recentLogs: RecentLog[]
  }
}

function ExpandableCell({ row }: { row: ProjectRow }) {
  const [open, setOpen] = useState(false)
  const logs = row.stats.recentLogs

  return (
    <div>
      <div className="flex items-center gap-2">
        <Link
          href={`/projects/${row.id}`}
          className="font-medium text-foreground hover:text-primary transition-colors"
        >
          {row.name}
        </Link>
        {logs.length > 0 && (
          <button
            onClick={(e) => {
              e.preventDefault()
              setOpen(!open)
            }}
            className="flex items-center justify-center h-5 w-5 rounded hover:bg-muted transition-colors"
          >
            <ChevronDown className={cn('h-3.5 w-3.5 text-muted-foreground transition-transform', open && 'rotate-180')} />
          </button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">{row.project_code}</p>

      {open && logs.length > 0 && (
        <div className="mt-2 rounded-lg border bg-muted/20 overflow-hidden">
          <div className="px-3 py-1.5 bg-muted/40 border-b">
            <p className="text-[11px] font-semibold text-muted-foreground">10 יומנים אחרונים</p>
          </div>
          {logs.map((log) => (
            <Link
              key={log.id}
              href={`/logs/${log.id}`}
              className="flex items-center justify-between px-3 py-2 border-b last:border-0 hover:bg-muted/30 transition-colors text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{dayjs(log.log_date).format('DD/MM')}</span>
                <StatusBadge status={log.status} className="text-[10px] py-0 px-1.5" />
                <span className="text-muted-foreground">{log.workerCount} עובדים</span>
              </div>
              <span className="font-medium">₪{log.cost.toLocaleString('he-IL', { maximumFractionDigits: 0 })}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

const columns: ColumnDef<ProjectRow>[] = [
  {
    accessorKey: 'name',
    header: 'פרויקט',
    cell: ({ row }) => <ExpandableCell row={row.original} />,
  },
  {
    accessorKey: 'client.name',
    header: 'לקוח',
    cell: ({ row }) => row.original.client?.name || '—',
  },
  {
    accessorKey: 'status',
    header: 'סטטוס',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: 'stats.logsCount',
    header: 'יומנים',
    cell: ({ row }) => {
      const count = row.original.stats.logsCount
      if (count === 0) return <span className="text-muted-foreground">—</span>
      return (
        <div className="flex items-center gap-1.5">
          <ClipboardList className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-medium">{count}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'stats.totalCost',
    header: 'עלות מצטברת',
    cell: ({ row }) => {
      const cost = row.original.stats.totalCost
      if (cost === 0) return <span className="text-muted-foreground">—</span>
      return (
        <span className="font-semibold">
          ₪{cost.toLocaleString('he-IL', { maximumFractionDigits: 0 })}
        </span>
      )
    },
  },
  {
    accessorKey: 'project_manager.full_name',
    header: 'מנהל פרויקט',
    cell: ({ row }) => row.original.project_manager?.full_name || '—',
  },
]

export function ProjectsTable({ data }: { data: ProjectRow[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="name"
      searchPlaceholder="חיפוש פרויקטים..."
    />
  )
}
