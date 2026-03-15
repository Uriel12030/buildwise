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
      toast.success('Client deleted')
      router.push('/clients')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete')
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  return (
    <>
      <Button variant="outline" className="text-red-600 hover:text-red-700" onClick={() => setOpen(true)}>
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete Client"
        description={`Are you sure you want to delete "${clientName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        loading={loading}
      />
    </>
  )
}
