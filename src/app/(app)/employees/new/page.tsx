import { PageHeader } from '@/components/layout/page-header'
import { EmployeeForm } from '../employee-form'

export default function NewEmployeePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="עובד חדש" />
      <EmployeeForm />
    </div>
  )
}
