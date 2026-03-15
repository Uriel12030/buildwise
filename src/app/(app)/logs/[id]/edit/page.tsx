import { getLog } from '@/features/logs/actions'
import { getProjects } from '@/features/projects/actions'
import { getActiveEmployees } from '@/features/employees/actions'
import { PageHeader } from '@/components/layout/page-header'
import { LogForm } from '../../log-form'
import { notFound } from 'next/navigation'

export default async function EditLogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let log, projects, employees

  try {
    ;[log, projects, employees] = await Promise.all([
      getLog(id),
      getProjects(),
      getActiveEmployees(),
    ])
  } catch {
    notFound()
  }

  return (
    <div className="space-y-6">
      <PageHeader title="עריכת יומן עבודה" />
      <LogForm
        log={log}
        projects={projects.map((p) => ({ id: p.id, name: p.name, project_code: p.project_code }))}
        employees={employees.map((e) => ({ id: e.id, full_name: e.full_name, role_title: e.role_title }))}
      />
    </div>
  )
}
