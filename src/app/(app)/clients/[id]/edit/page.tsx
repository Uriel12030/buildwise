import { getClient } from '@/features/clients/actions'
import { PageHeader } from '@/components/layout/page-header'
import { ClientForm } from '../../client-form'
import { notFound } from 'next/navigation'

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let client
  try {
    client = await getClient(id)
  } catch {
    notFound()
  }

  return (
    <div className="space-y-6">
      <PageHeader title={`Edit ${client.name}`} />
      <ClientForm client={client} />
    </div>
  )
}
