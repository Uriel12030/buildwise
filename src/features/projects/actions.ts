'use server'

import { createClient } from '@/lib/db/supabase-server'
import { requireRole } from '@/lib/auth/get-user'
import { projectSchema, type ProjectFormData } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

export async function getProjects() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      client:clients(id, name),
      project_manager:users!projects_project_manager_user_id_fkey(id, full_name),
      site_manager:users!projects_site_manager_user_id_fkey(id, full_name)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getProject(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      client:clients(id, name),
      project_manager:users!projects_project_manager_user_id_fkey(id, full_name),
      site_manager:users!projects_site_manager_user_id_fkey(id, full_name)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function getProjectEmployees(projectId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('project_employees')
    .select('*, employee:employees(*)')
    .eq('project_id', projectId)
    .order('assigned_from', { ascending: false })

  if (error) throw error
  return data
}

export async function getProjectLogs(projectId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('daily_logs')
    .select(`
      *,
      site_manager:users!daily_logs_site_manager_user_id_fkey(id, full_name),
      workers:daily_log_workers(id)
    `)
    .eq('project_id', projectId)
    .order('log_date', { ascending: false })
    .limit(20)

  if (error) throw error
  return data
}

export async function createProjectAction(formData: ProjectFormData) {
  await requireRole(['admin', 'office_manager'])
  const validated = projectSchema.parse(formData)

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .insert(validated)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/projects')
  return data
}

export async function updateProjectAction(id: string, formData: ProjectFormData) {
  await requireRole(['admin', 'office_manager', 'project_manager'])
  const validated = projectSchema.parse(formData)

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .update({ ...validated, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/projects')
  revalidatePath(`/projects/${id}`)
  return data
}

export async function deleteProjectAction(id: string) {
  await requireRole(['admin'])

  const supabase = await createClient()
  const { error } = await supabase.from('projects').delete().eq('id', id)

  if (error) throw error
  revalidatePath('/projects')
}

export async function assignEmployeeToProject(projectId: string, employeeId: string) {
  await requireRole(['admin', 'office_manager', 'project_manager'])

  const supabase = await createClient()

  // Check for existing active assignment
  const { data: existing } = await supabase
    .from('project_employees')
    .select('id')
    .eq('project_id', projectId)
    .eq('employee_id', employeeId)
    .is('assigned_to', null)
    .single()

  if (existing) throw new Error('Employee already assigned to this project')

  const { error } = await supabase
    .from('project_employees')
    .insert({
      project_id: projectId,
      employee_id: employeeId,
      assigned_from: new Date().toISOString().split('T')[0],
    })

  if (error) throw error
  revalidatePath(`/projects/${projectId}`)
}

export async function removeEmployeeFromProject(assignmentId: string, projectId: string) {
  await requireRole(['admin', 'office_manager', 'project_manager'])

  const supabase = await createClient()
  const { error } = await supabase
    .from('project_employees')
    .update({ assigned_to: new Date().toISOString().split('T')[0] })
    .eq('id', assignmentId)

  if (error) throw error
  revalidatePath(`/projects/${projectId}`)
}

export async function getUsers() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, role')
    .eq('is_active', true)
    .order('full_name')

  if (error) throw error
  return data
}

export async function getProjectsWithStats() {
  const supabase = await createClient()

  // Get projects with basic info
  const { data: projects, error } = await supabase
    .from('projects')
    .select(`
      *,
      client:clients(id, name),
      project_manager:users!projects_project_manager_user_id_fkey(id, full_name),
      site_manager:users!projects_site_manager_user_id_fkey(id, full_name)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error

  // Get all logs with workers for cost calculation
  const { data: allLogs } = await supabase
    .from('daily_logs')
    .select(`
      id, project_id, log_date, status, work_summary,
      workers:daily_log_workers(hours_worked, overtime_hours, employee:employees(hourly_rate))
    `)
    .order('log_date', { ascending: false })

  // Build stats per project
  const projectStats: Record<string, { logsCount: number; totalCost: number; recentLogs: any[] }> = {}

  for (const log of (allLogs || [])) {
    const pid = log.project_id
    if (!projectStats[pid]) {
      projectStats[pid] = { logsCount: 0, totalCost: 0, recentLogs: [] }
    }
    projectStats[pid].logsCount++

    // Calculate log cost
    let logCost = 0
    for (const w of (log.workers || [])) {
      const hours = (w.hours_worked || 0) + ((w.overtime_hours || 0) * 1.25)
      const rate = (w.employee as any)?.hourly_rate || 0
      logCost += hours * rate
    }
    projectStats[pid].totalCost += logCost

    // Keep recent 10 logs
    if (projectStats[pid].recentLogs.length < 10) {
      projectStats[pid].recentLogs.push({
        id: log.id,
        log_date: log.log_date,
        status: log.status,
        work_summary: log.work_summary,
        workerCount: (log.workers || []).length,
        cost: logCost,
      })
    }
  }

  return (projects || []).map((p: any) => ({
    ...p,
    stats: projectStats[p.id] || { logsCount: 0, totalCost: 0, recentLogs: [] },
  }))
}

export async function getProjectRecentLogs(projectId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('daily_logs')
    .select(`
      id, log_date, status, work_summary,
      workers:daily_log_workers(hours_worked, overtime_hours, employee:employees(hourly_rate))
    `)
    .eq('project_id', projectId)
    .order('log_date', { ascending: false })
    .limit(10)

  if (error) throw error

  return (data || []).map((log: any) => {
    let cost = 0
    for (const w of (log.workers || [])) {
      const hours = (w.hours_worked || 0) + ((w.overtime_hours || 0) * 1.25)
      const rate = (w.employee as any)?.hourly_rate || 0
      cost += hours * rate
    }
    return {
      id: log.id,
      log_date: log.log_date,
      status: log.status,
      work_summary: log.work_summary,
      workerCount: (log.workers || []).length,
      cost,
    }
  })
}
