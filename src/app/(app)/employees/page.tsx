import { getEmployees } from '@/features/employees/actions'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { EmployeesTable } from './employees-table'

export default async function EmployeesPage() {
  const employees = await getEmployees()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        description={`${employees.length} total employees`}
        action={
          <Button asChild>
            <Link href="/employees/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Link>
          </Button>
        }
      />
      <EmployeesTable data={employees} />
    </div>
  )
}
