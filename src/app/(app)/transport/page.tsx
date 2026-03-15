import { getTransportLogs } from '@/features/transport/actions'
import { PageHeader } from '@/components/layout/page-header'
import { TransportTable } from './transport-table'

export default async function TransportPage() {
  const logs = await getTransportLogs()

  return (
    <div className="space-y-6">
      <PageHeader
        title="יומני משאית"
        description={`${logs.length} רשומות`}
      />
      <TransportTable data={logs} />
    </div>
  )
}
