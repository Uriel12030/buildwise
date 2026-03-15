'use client'

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  type SortingState,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { Search, ChevronLeft, ChevronRight, Plus } from 'lucide-react'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  searchPlaceholder?: string
  pageSize?: number
  /** Quick-add row config: placeholder text and callback with the entered name */
  quickAdd?: {
    placeholder: string
    onAdd: (name: string) => Promise<void> | void
  }
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = 'חיפוש...',
  pageSize = 15,
  quickAdd,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [quickAddValue, setQuickAddValue] = useState('')
  const [quickAddLoading, setQuickAddLoading] = useState(false)

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'includesString',
    state: { sorting, globalFilter },
    initialState: { pagination: { pageSize } },
  })

  const handleQuickAdd = async () => {
    if (!quickAdd || !quickAddValue.trim() || quickAddLoading) return
    setQuickAddLoading(true)
    try {
      await quickAdd.onAdd(quickAddValue.trim())
      setQuickAddValue('')
    } finally {
      setQuickAddLoading(false)
    }
  }

  return (
    <div className="space-y-0">
      {/* Toolbar */}
      {searchKey !== undefined && (
        <div className="flex items-center justify-between pb-4">
          <div className="relative w-full max-w-xs">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              placeholder={searchPlaceholder}
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="ps-9 h-9 bg-background border-border/60 placeholder:text-muted-foreground/50"
            />
          </div>
          <p className="text-xs text-muted-foreground hidden sm:block">
            {table.getFilteredRowModel().rows.length} תוצאות
          </p>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/30 hover:bg-muted/30 border-b border-border/60">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide h-10"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-b border-border/40 last:border-0 hover:bg-muted/30 transition-colors h-12"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-[13px] py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                  לא נמצאו תוצאות.
                </TableCell>
              </TableRow>
            )}

            {/* Quick Add Row */}
            {quickAdd && (
              <TableRow className="border-t border-border/40 bg-muted/10 hover:bg-muted/20 transition-colors">
                <TableCell colSpan={columns.length} className="py-0 px-0">
                  <div className="flex items-center h-11">
                    <div className="flex items-center gap-2 px-3 text-muted-foreground/60">
                      <Plus className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      value={quickAddValue}
                      onChange={(e) => setQuickAddValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleQuickAdd()
                      }}
                      placeholder={quickAdd.placeholder}
                      disabled={quickAddLoading}
                      className="flex-1 h-full bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground/40 outline-none border-none"
                    />
                    {quickAddValue.trim() && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="me-2 h-7 text-xs text-primary hover:text-primary"
                        onClick={handleQuickAdd}
                        disabled={quickAddLoading}
                      >
                        {quickAddLoading ? 'מוסיף...' : 'הוסף ↵'}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-xs text-muted-foreground">
            עמוד {table.getState().pagination.pageIndex + 1} מתוך {table.getPageCount()}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
