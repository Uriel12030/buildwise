import { getClients } from '@/features/clients/actions'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { ClientsTable } from './clients-table'

export default async function ClientsPage() {
  const clients = await getClients()

  return (
    <div className="space-y-6">
      <PageHeader
        title="לקוחות"
        description={`${clients.length} לקוחות`}
        action={
          <Button asChild>
            <Link href="/clients/new">
              <Plus className="mr-2 h-4 w-4" />
              הוסף לקוח
            </Link>
          </Button>
        }
      />
      <ClientsTable data={clients} />
    </div>
  )
}
