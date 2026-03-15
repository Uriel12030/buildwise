'use server'

import { createClient } from '@/lib/db/supabase-server'
import dayjs from 'dayjs'

export async function getDashboardStats() {
  const supabase = await createClient()
  const today = dayjs().format('YYYY-MM-DD')

  const [
    { count: activeProjects },
    { count: totalEmployees },
    { count: logsToday },
    { count: pendingLogs },
  ] = await Promise.all([
    supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('employees').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('daily_logs').select('*', { count: 'exact', head: true }).eq('log_date', today),
    supabase.from('daily_logs').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
  ])

  return {
    activeProjects: activeProjects || 0,
    totalEmployees: totalEmployees || 0,
    logsToday: logsToday || 0,
    pendingLogs: pendingLogs || 0,
  }
}

export async function getRecentLogs() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('daily_logs')
    .select(`
      id, log_date, status, work_summary,
      project:projects(id, name),
      site_manager:users!daily_logs_site_manager_user_id_fkey(full_name),
      workers:daily_log_workers(id)
    `)
    .order('log_date', { ascending: false })
    .limit(5)

  if (error) throw error
  return data
}

export async function getProjectsWithoutLogsToday() {
  const supabase = await createClient()
  const today = dayjs().format('YYYY-MM-DD')

  // Get active projects
  const { data: activeProjects } = await supabase
    .from('projects')
    .select('id, name, project_code')
    .eq('status', 'active')

  if (!activeProjects) return []

  // Get projects that have logs today
  const { data: logsToday } = await supabase
    .from('daily_logs')
    .select('project_id')
    .eq('log_date', today)

  const projectsWithLogs = new Set(logsToday?.map((l) => l.project_id) || [])
  return activeProjects.filter((p) => !projectsWithLogs.has(p.id))
}

export async function getLogsByWeek() {
  const supabase = await createClient()
  const startDate = dayjs().subtract(6, 'day').format('YYYY-MM-DD')

  const { data, error } = await supabase
    .from('daily_logs')
    .select('log_date, status')
    .gte('log_date', startDate)
    .order('log_date')

  if (error) throw error

  // Group by date
  const grouped: Record<string, number> = {}
  for (let i = 6; i >= 0; i--) {
    const date = dayjs().subtract(i, 'day').format('YYYY-MM-DD')
    grouped[date] = 0
  }
  data?.forEach((log) => {
    if (grouped[log.log_date] !== undefined) {
      grouped[log.log_date]++
    }
  })

  return Object.entries(grouped).map(([date, count]) => ({
    date: dayjs(date).format('ddd'),
    logs: count,
  }))
}

export async function getProjectsByStatus() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .select('status')

  if (error) throw error

  const counts: Record<string, number> = { planning: 0, active: 0, on_hold: 0, completed: 0 }
  data?.forEach((p) => {
    counts[p.status] = (counts[p.status] || 0) + 1
  })

  return Object.entries(counts).map(([status, count]) => ({ status, count }))
}
