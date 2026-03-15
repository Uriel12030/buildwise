import { PageHeader } from '@/components/layout/page-header'
import { LogForm } from '../log-form'
import { getProjects } from '@/features/projects/actions'
import { getEmployeesByType } from '@/features/logs/actions'
import { requireUser } from '@/lib/auth/get-user'

export default async function NewLogPage({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string }>
}) {
  const { projectId } = await searchParams
  const [projects, employeesByType, user] = await Promise.all([
    getProjects(),
    getEmployeesByType(),
    requireUser(),
  ])

  return (
    <div className="space-y-6">
      <PageHeader title="יומן עבודה חדש" />
      <LogForm
        projects={projects
          .filter((p) => p.status === 'active')
          .map((p) => ({
            id: p.id,
            name: p.name,
            project_code: p.project_code,
            location: p.location,
            client: p.client,
            project_manager: p.project_manager,
          }))}
        companyEmployees={employeesByType.company.map((e) => ({
          id: e.id,
          full_name: e.full_name,
          role_title: e.role_title,
        }))}
        foreignWorkers={employeesByType.foreign.map((e) => ({
          id: e.id,
          full_name: e.full_name,
          role_title: e.role_title,
        }))}
        currentUserName={user.full_name}
        defaultProjectId={projectId}
      />
    </div>
  )
}
