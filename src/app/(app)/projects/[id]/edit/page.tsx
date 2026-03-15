import { getProject, getUsers } from '@/features/projects/actions'
import { getClients } from '@/features/clients/actions'
import { PageHeader } from '@/components/layout/page-header'
import { ProjectForm } from '../../project-form'
import { notFound } from 'next/navigation'

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let project, clients, users
  try {
    ;[project, clients, users] = await Promise.all([
      getProject(id),
      getClients(),
      getUsers(),
    ])
  } catch {
    notFound()
  }

  return (
    <div className="space-y-6">
      <PageHeader title={`עריכת ${project.name}`} />
      <ProjectForm project={project} clients={clients} users={users} />
    </div>
  )
}
