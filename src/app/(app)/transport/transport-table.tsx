'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/tables/data-table'
import { StatusBadge } from '@/components/layout/status-badge'
import { quickAddTransportLog } from '@/features/transport/actions'
import type { TransportLog } from '@/types'
import dayjs from '@/lib/dayjs'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const columns: ColumnDef<TransportLog>[] = [
  {
    accessorKey: 'log_date',
    header: 'תאריך',
    cell: ({ row }) => dayjs(row.original.log_date).format('DD/MM/YY'),
  },
  {
    accessorKey: 'transport_type',
    header: 'סוג',
    cell: ({ row }) => <StatusBadge status={row.original.transport_type} />,
  },
  {
    accessorKey: 'from_project_name',
    header: 'מפרויקט',
    cell: ({ row }) => {
      const proj = row.original.from_project
      return proj ? proj.name : row.original.from_project_name || '—'
    },
  },
  {
    accessorKey: 'to_project_name',
    header: 'לפרויקט',
    cell: ({ row }) => {
      const proj = row.original.to_project
      return proj ? proj.name : row.original.to_project_name || '—'
    },
  },
  {
    accessorKey: 'material_type',
    header: 'סוג חומר',
    cell: ({ row }) => row.original.material_type || '—',
  },
  {
    accessorKey: 'quantity',
    header: 'כמות',
    cell: ({ row }) => row.original.quantity != null ? row.original.quantity : '—',
  },
  {
    accessorKey: 'certificate_number',
    header: 'מספר תעודה',
    cell: ({ row }) => row.original.certificate_number || '—',
  },
]

export function TransportTable({ data }: { data: TransportLog[] }) {
  const router = useRouter()
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="from_project_name"
      searchPlaceholder="חיפוש יומני משאית..."
      quickAdd={{
        placeholder: 'הקלד תיאור הובלה חדשה ולחץ Enter...',
        onAdd: async (desc) => {
          try {
            await quickAddTransportLog(desc)
            toast.success('היומן נוצר')
            router.refresh()
          } catch (e: any) {
            toast.error(e.message || 'שגיאה ביצירת יומן')
          }
        },
      }}
    />
  )
}
