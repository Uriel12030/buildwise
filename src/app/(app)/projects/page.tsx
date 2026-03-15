import { getProjects } from '@/features/projects/actions'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { ProjectsTable } from './projects-table'

export default async function ProjectsPage() {
  const projects = await getProjects()

  return (
    <div className="space-y-6">
      <PageHeader
        title="פרויקטים"
        description={`${projects.length} פרויקטים`}
        action={
          <Button asChild>
            <Link href="/projects/new">
              <Plus className="me-2 h-4 w-4" />
              פרויקט חדש
            </Link>
          </Button>
        }
      />
      <ProjectsTable data={projects} />
    </div>
  )
}
