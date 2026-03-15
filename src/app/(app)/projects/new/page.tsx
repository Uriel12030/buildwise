import { PageHeader } from '@/components/layout/page-header'
import { ProjectForm } from '../project-form'
import { getClients } from '@/features/clients/actions'
import { getUsers } from '@/features/projects/actions'

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>
}) {
  const { clientId } = await searchParams
  const [clients, users] = await Promise.all([getClients(), getUsers()])

  return (
    <div className="space-y-6">
      <PageHeader title="פרויקט חדש" />
      <ProjectForm
        clients={clients}
        users={users}
        defaultClientId={clientId}
      />
    </div>
  )
}
