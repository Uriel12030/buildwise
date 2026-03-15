import { PageHeader } from '@/components/layout/page-header'
import { LogForm } from '../log-form'
import { getProjects } from '@/features/projects/actions'
import { getActiveEmployees } from '@/features/employees/actions'

export default async function NewLogPage({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string }>
}) {
  const { projectId } = await searchParams
  const [projects, employees] = await Promise.all([
    getProjects(),
    getActiveEmployees(),
  ])

  return (
    <div className="space-y-6">
      <PageHeader title="New Daily Log" />
      <LogForm
        projects={projects.map((p) => ({ id: p.id, name: p.name, project_code: p.project_code }))}
        employees={employees.map((e) => ({ id: e.id, full_name: e.full_name, role_title: e.role_title }))}
        defaultProjectId={projectId}
      />
    </div>
  )
}
