import { getClient, getClientProjects } from '@/features/clients/actions'
import { PageHeader } from '@/components/layout/page-header'
import { StatusBadge } from '@/components/layout/status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/layout/empty-state'
import { Pencil, FolderKanban, Phone, Mail, MapPin, Building2 } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import dayjs from 'dayjs'
import { ClientDeleteButton } from './delete-button'

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let client, projects

  try {
    ;[client, projects] = await Promise.all([getClient(id), getClientProjects(id)])
  } catch {
    notFound()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={client.name}
        action={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={`/clients/${id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
            <ClientDeleteButton clientId={id} clientName={client.name} />
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Info */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Client Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <StatusBadge status={client.is_active ? 'active' : 'inactive'} />
            {client.company_number && (
              <div className="flex items-start gap-3">
                <Building2 className="h-4 w-4 mt-0.5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Company Number</p>
                  <p className="text-sm">{client.company_number}</p>
                </div>
              </div>
            )}
            {client.contact_name && (
              <div>
                <p className="text-xs text-gray-500">Contact</p>
                <p className="text-sm">{client.contact_name}</p>
              </div>
            )}
            {client.phone && (
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 mt-0.5 text-gray-400" />
                <p className="text-sm">{client.phone}</p>
              </div>
            )}
            {client.email && (
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 mt-0.5 text-gray-400" />
                <p className="text-sm">{client.email}</p>
              </div>
            )}
            {client.address && (
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 text-gray-400" />
                <p className="text-sm">{client.address}</p>
              </div>
            )}
            {client.notes && (
              <div>
                <p className="text-xs text-gray-500">Notes</p>
                <p className="text-sm whitespace-pre-wrap">{client.notes}</p>
              </div>
            )}
            <div className="pt-2 border-t text-xs text-gray-400">
              Created {dayjs(client.created_at).format('MMM D, YYYY')}
            </div>
          </CardContent>
        </Card>

        {/* Projects */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Projects</CardTitle>
            <Button asChild size="sm">
              <Link href={`/projects/new?clientId=${id}`}>Add Project</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <EmptyState
                icon={FolderKanban}
                title="No projects"
                description="Create a project for this client."
              />
            ) : (
              <div className="space-y-3">
                {projects.map((project: any) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{project.name}</p>
                      <p className="text-sm text-gray-500">
                        {project.project_code}
                        {project.location && ` · ${project.location}`}
                      </p>
                    </div>
                    <StatusBadge status={project.status} />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
