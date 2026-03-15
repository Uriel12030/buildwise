'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { assignEmployeeToProject } from '@/features/projects/actions'
import { getActiveEmployees } from '@/features/employees/actions'
import { toast } from 'sonner'
import { UserPlus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { Employee } from '@/types'

export function AssignEmployeeButton({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (open) {
      getActiveEmployees().then(setEmployees)
    }
  }, [open])

  const handleAssign = async () => {
    if (!selectedId) return
    setLoading(true)
    try {
      await assignEmployeeToProject(projectId, selectedId)
      toast.success('העובד שויך')
      setOpen(false)
      setSelectedId('')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'השיוך נכשל')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button size="sm" variant="outline">
          <UserPlus className="me-2 h-4 w-4" />
          שיוך
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>שיוך עובד לפרויקט</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Select value={selectedId} onValueChange={(v) => setSelectedId(v || '')}>
            <SelectTrigger>
              <SelectValue placeholder="בחר עובד" />
            </SelectTrigger>
            <SelectContent>
              {employees.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.full_name} — {e.role_title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>ביטול</Button>
            <Button onClick={handleAssign} disabled={!selectedId || loading}>
              {loading ? 'משייך...' : 'שיוך'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
