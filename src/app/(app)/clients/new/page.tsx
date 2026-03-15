import { PageHeader } from '@/components/layout/page-header'
import { ClientForm } from '../client-form'

export default function NewClientPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="לקוח חדש" />
      <ClientForm />
    </div>
  )
}
