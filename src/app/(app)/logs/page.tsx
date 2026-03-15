import { getLogs } from '@/features/logs/actions'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { LogsTable } from './logs-table'

export default async function LogsPage({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string; status?: string; date?: string }>
}) {
  const filters = await searchParams
  const logs = await getLogs(filters)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daily Logs"
        description={`${logs.length} logs`}
        action={
          <Button asChild>
            <Link href="/logs/new">
              <Plus className="mr-2 h-4 w-4" />
              New Log
            </Link>
          </Button>
        }
      />
      <LogsTable data={logs} />
    </div>
  )
}
