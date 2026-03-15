'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/layout/confirm-dialog'
import { deleteClientAction } from '@/features/clients/actions'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'

export function ClientDeleteButton({ clientId, clientName }: { clientId: string; clientName: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setLoading(true)
    try {
      await deleteClientAction(clientId)
      toast.success('הלקוח נמחק')
      router.push('/clients')
    } catch (error: any) {
      toast.error(error.message || 'המחיקה נכשלה')
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  return (
    <>
      <Button variant="outline" className="text-red-600 hover:text-red-700" onClick={() => setOpen(true)}>
        <Trash2 className="me-2 h-4 w-4" />
        מחיקה
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="מחיקת לקוח"
        description={`האם אתה בטוח שברצונך למחוק את "${clientName}"? פעולה זו אינה הפיכה.`}
        confirmLabel="מחיקה"
        onConfirm={handleDelete}
        loading={loading}
      />
    </>
  )
}
