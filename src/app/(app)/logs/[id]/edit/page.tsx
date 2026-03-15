import { getLog, getEmployeesByType } from '@/features/logs/actions'
import { getProjects } from '@/features/projects/actions'
import { PageHeader } from '@/components/layout/page-header'
import { LogForm } from '../../log-form'
import { notFound } from 'next/navigation'
import { requireUser } from '@/lib/auth/get-user'

export default async function EditLogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let log: any, projects: any, employeesByType: any, user: any

  try {
    ;[log, projects, employeesByType, user] = await Promise.all([
      getLog(id),
      getProjects(),
      getEmployeesByType(),
      requireUser(),
    ])
  } catch {
    notFound()
  }

  return (
    <div className="space-y-6">
      <PageHeader title="עריכת יומן עבודה" />
      <LogForm
        log={log}
        projects={projects.map((p: any) => ({
          id: p.id,
          name: p.name,
          project_code: p.project_code,
          location: p.location,
          client: p.client,
          project_manager: p.project_manager,
        }))}
        companyEmployees={employeesByType.company.map((e: any) => ({
          id: e.id,
          full_name: e.full_name,
          role_title: e.role_title,
        }))}
        foreignWorkers={employeesByType.foreign.map((e: any) => ({
          id: e.id,
          full_name: e.full_name,
          role_title: e.role_title,
        }))}
        currentUserName={user.full_name}
      />
    </div>
  )
}
