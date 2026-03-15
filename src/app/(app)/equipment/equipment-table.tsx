'use client'

import { useState } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/tables/data-table'
import { StatusBadge } from '@/components/layout/status-badge'
import { quickAddEquipment, updateEquipment } from '@/features/equipment/actions'
import type { Equipment } from '@/types'
import Link from 'next/link'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Check, X } from 'lucide-react'

function EditableCostCell({ equipmentId, currentValue }: { equipmentId: string; currentValue: number | null }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(currentValue?.toString() || '')
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const save = async () => {
    setSaving(true)
    try {
      const num = value.trim() ? parseFloat(value) : null
      await updateEquipment(equipmentId, { daily_cost: num })
      setEditing(false)
      router.refresh()
    } catch (e: any) {
      toast.error(e.message || 'שגיאה בשמירה')
    } finally {
      setSaving(false)
    }
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-muted-foreground text-xs">₪</span>
        <input
          autoFocus
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') save()
            if (e.key === 'Escape') setEditing(false)
          }}
          className="w-20 h-7 px-1.5 text-[13px] rounded border border-primary/40 bg-background outline-none focus:border-primary"
          disabled={saving}
        />
        <button onClick={save} disabled={saving} className="text-emerald-600 hover:text-emerald-700">
          <Check className="h-3.5 w-3.5" />
        </button>
        <button onClick={() => setEditing(false)} className="text-muted-foreground hover:text-foreground">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => {
        setValue(currentValue?.toString() || '')
        setEditing(true)
      }}
      className="text-start hover:bg-muted/50 rounded px-1.5 py-0.5 -mx-1.5 transition-colors min-w-[60px]"
      title="לחץ לעריכה"
    >
      {currentValue != null ? (
        <span className="font-medium">₪{Number(currentValue).toLocaleString()}</span>
      ) : (
        <span className="text-muted-foreground/50 text-xs">+ הוסף עלות</span>
      )}
    </button>
  )
}

const columns: ColumnDef<Equipment>[] = [
  {
    accessorKey: 'name',
    header: 'שם הכלי',
    cell: ({ row }) => (
      <div>
        <Link
          href={`/equipment/${row.original.id}`}
          className="font-medium text-foreground hover:text-primary transition-colors"
        >
          {row.original.name}
        </Link>
        {row.original.equipment_code && (
          <p className="text-xs text-muted-foreground">{row.original.equipment_code}</p>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'category',
    header: 'קטגוריה',
    cell: ({ row }) => <StatusBadge status={row.original.category} />,
  },
  {
    accessorKey: 'status',
    header: 'סטטוס',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: 'chassis_number',
    header: 'מספר שלדה',
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.chassis_number || '—'}</span>
    ),
  },
  {
    accessorKey: 'insurance_company_mandatory',
    header: 'ביטוח חובה',
    cell: ({ row }) => {
      const e = row.original as any
      return (
        <div>
          <span className="text-[13px]">{e.insurance_company_mandatory || '—'}</span>
          {e.insurance_mandatory_expiry && (
            <p className="text-xs text-muted-foreground">{e.insurance_mandatory_expiry}</p>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'daily_cost',
    header: 'עלות יומית',
    cell: ({ row }) => (
      <EditableCostCell
        equipmentId={row.original.id}
        currentValue={(row.original as any).daily_cost}
      />
    ),
  },
  {
    accessorKey: 'purchase_cost',
    header: 'עלות רכישה',
    cell: ({ row }) =>
      row.original.purchase_cost != null
        ? `₪${Number(row.original.purchase_cost).toLocaleString()}`
        : '—',
  },
]

export function EquipmentTable({ data }: { data: Equipment[] }) {
  const router = useRouter()
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="name"
      searchPlaceholder="חיפוש ציוד..."
      quickAdd={{
        placeholder: 'הקלד שם ציוד/כלי חדש ולחץ Enter...',
        onAdd: async (name) => {
          try {
            await quickAddEquipment(name)
            toast.success('הציוד נוצר')
            router.refresh()
          } catch (e: any) {
            toast.error(e.message || 'שגיאה ביצירת ציוד')
          }
        },
      }}
    />
  )
}
