'use server'

import { createClient } from '@/lib/db/supabase-server'
import { requireUser } from '@/lib/auth/get-user'
import dayjs from 'dayjs'

export interface GoodMorningData {
  date: string
  userName: string
  logsCount: number
  projects: {
    projectId: string
    projectName: string
    logId: string
    logStatus: string
    workSummary: string | null
    workers: {
      name: string
      role: string
      hours: number
      overtime: number
      hourlyRate: number
      cost: number
    }[]
    equipment: {
      id: string
      name: string
      category: string
      dailyCost: number
    }[]
    totalWorkersCost: number
    totalEquipmentCost: number
    totalHours: number
    workerCount: number
    equipmentCount: number
  }[]
  equipmentGlobal: {
    id: string
    name: string
    category: string
    dailyCost: number
  }[]
  totalWorkersCost: number
  totalEquipmentCost: number
  totalDailyCost: number
  totalWorkers: number
  totalEquipment: number
}

export async function getGoodMorningData(dateStr?: string): Promise<GoodMorningData> {
  const user = await requireUser()
  const supabase = await createClient()
  const date = dateStr || dayjs().format('YYYY-MM-DD')

  // Get all daily logs for this date with workers
  const { data: logs, error: logsError } = await supabase
    .from('daily_logs')
    .select(`
      id, project_id, log_date, status, work_summary,
      project:projects(id, name, project_code),
      workers:daily_log_workers(
        id, hours_worked, overtime_hours, worker_type, worker_name, role_title,
        employee:employees(id, full_name, role_title, hourly_rate)
      )
    `)
    .eq('log_date', date)
    .order('created_at', { ascending: false })

  if (logsError) throw logsError

  // Get all active equipment with daily costs
  const { data: allEquipment, error: eqError } = await supabase
    .from('equipment')
    .select('id, name, category, daily_cost, status')
    .eq('status', 'active')
    .not('daily_cost', 'is', null)
    .gt('daily_cost', 0)
    .order('name')

  if (eqError) throw eqError

  // Get equipment-project assignments for today's projects
  const projectIds = [...new Set((logs || []).map((l: any) => l.project_id).filter(Boolean))]

  let projectEquipmentMap: Record<string, any[]> = {}
  if (projectIds.length > 0) {
    const { data: assignments } = await supabase
      .from('equipment_project_assignments')
      .select('project_id, equipment:equipment(id, name, category, daily_cost)')
      .in('project_id', projectIds)
      .is('assigned_to', null) // currently assigned

    for (const a of (assignments || [])) {
      const pid = a.project_id
      if (!projectEquipmentMap[pid]) projectEquipmentMap[pid] = []
      const eq = a.equipment as any
      if (eq && eq.daily_cost > 0) {
        projectEquipmentMap[pid].push({
          id: eq.id,
          name: eq.name,
          category: eq.category,
          dailyCost: eq.daily_cost,
        })
      }
    }
  }

  // Process logs into project summaries
  const projects = (logs || []).map((log: any) => {
    const workers = (log.workers || []).map((w: any) => {
      const name = w.employee?.full_name || w.worker_name || 'לא ידוע'
      const role = w.employee?.role_title || w.role_title || ''
      const hours = w.hours_worked || 0
      const overtime = w.overtime_hours || 0
      const hourlyRate = w.employee?.hourly_rate || 0
      const totalHours = hours + (overtime * 1.25)
      const cost = totalHours * hourlyRate

      return { name, role, hours, overtime, hourlyRate, cost }
    })

    const projectEquipment = projectEquipmentMap[log.project_id] || []
    const totalWorkersCost = workers.reduce((sum: number, w: any) => sum + w.cost, 0)
    const totalEquipmentCost = projectEquipment.reduce((sum: number, e: any) => sum + e.dailyCost, 0)
    const totalHours = workers.reduce((sum: number, w: any) => sum + w.hours + w.overtime, 0)

    return {
      projectId: log.project?.id || '',
      projectName: log.project?.name || 'פרויקט לא ידוע',
      logId: log.id,
      logStatus: log.status,
      workSummary: log.work_summary,
      workers,
      equipment: projectEquipment,
      totalWorkersCost,
      totalEquipmentCost,
      totalHours,
      workerCount: workers.length,
      equipmentCount: projectEquipment.length,
    }
  })

  // Global equipment list
  const equipmentGlobal = (allEquipment || []).map((e: any) => ({
    id: e.id,
    name: e.name,
    category: e.category,
    dailyCost: e.daily_cost,
  }))

  const totalWorkersCost = projects.reduce((sum, p) => sum + p.totalWorkersCost, 0)
  const totalEquipmentCost = projects.reduce((sum, p) => sum + p.totalEquipmentCost, 0)
  const totalWorkers = projects.reduce((sum, p) => sum + p.workerCount, 0)
  const totalEquipment = projects.reduce((sum, p) => sum + p.equipmentCount, 0)

  return {
    date,
    userName: user.full_name,
    logsCount: logs?.length || 0,
    projects,
    equipmentGlobal,
    totalWorkersCost,
    totalEquipmentCost,
    totalDailyCost: totalWorkersCost + totalEquipmentCost,
    totalWorkers,
    totalEquipment,
  }
}
