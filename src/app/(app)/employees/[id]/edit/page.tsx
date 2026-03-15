import { getEmployee } from '@/features/employees/actions'
import { PageHeader } from '@/components/layout/page-header'
import { EmployeeForm } from '../../employee-form'
import { notFound } from 'next/navigation'

export default async function EditEmployeePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let employee
  try {
    employee = await getEmployee(id)
  } catch {
    notFound()
  }

  return (
    <div className="space-y-6">
      <PageHeader title={`Edit ${employee.full_name}`} />
      <EmployeeForm employee={employee} />
    </div>
  )
}
