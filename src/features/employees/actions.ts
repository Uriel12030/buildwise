'use server'

import { createClient } from '@/lib/db/supabase-server'
import { requireRole } from '@/lib/auth/get-user'
import { employeeSchema, type EmployeeFormData } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

export async function getEmployees() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .order('full_name')

  if (error) throw error
  return data
}

export async function getActiveEmployees() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('status', 'active')
    .order('full_name')

  if (error) throw error
  return data
}

export async function getEmployee(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function getEmployeeProjects(employeeId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('project_employees')
    .select('*, project:projects(*, client:clients(name))')
    .eq('employee_id', employeeId)
    .order('assigned_from', { ascending: false })

  if (error) throw error
  return data
}

export async function getEmployeeRecentLogs(employeeId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('daily_log_workers')
    .select('*, daily_log:daily_logs(id, log_date, project:projects(name))')
    .eq('employee_id', employeeId)
    .order('id', { ascending: false })
    .limit(10)

  if (error) throw error
  return data
}

export async function createEmployeeAction(formData: EmployeeFormData) {
  await requireRole(['admin', 'office_manager'])
  const validated = employeeSchema.parse(formData)

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('employees')
    .insert(validated)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/employees')
  return data
}

export async function updateEmployeeAction(id: string, formData: EmployeeFormData) {
  await requireRole(['admin', 'office_manager'])
  const validated = employeeSchema.parse(formData)

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('employees')
    .update({ ...validated, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/employees')
  revalidatePath(`/employees/${id}`)
  return data
}

export async function deleteEmployeeAction(id: string) {
  await requireRole(['admin'])

  const supabase = await createClient()
  const { error } = await supabase.from('employees').delete().eq('id', id)

  if (error) throw error
  revalidatePath('/employees')
}

export async function quickAddEmployee(fullName: string) {
  await requireRole(['admin', 'office_manager'])
  const supabase = await createClient()
  const { error } = await supabase.from('employees').insert({ 
    full_name: fullName, 
    role_title: 'עובד', 
    employee_type: 'field',
    hourly_rate: 0,
    status: 'active',
    hire_date: new Date().toISOString().split('T')[0]
  })
  if (error) throw error
  revalidatePath('/employees')
}
