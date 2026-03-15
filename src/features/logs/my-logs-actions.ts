'use server'

import { createClient } from '@/lib/db/supabase-server'
import { requireUser } from '@/lib/auth/get-user'
import dayjs from 'dayjs'

export async function getMyLogs() {
  const user = await requireUser()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('daily_logs')
    .select(`
      *,
      project:projects(id, name, project_code),
      workers:daily_log_workers(id)
    `)
    .eq('site_manager_user_id', user.id)
    .order('log_date', { ascending: false })
    .limit(50)

  if (error) throw error
  return data
}

export async function getMyTodayLog(projectId?: string) {
  const user = await requireUser()
  const supabase = await createClient()
  const today = dayjs().format('YYYY-MM-DD')

  let query = supabase
    .from('daily_logs')
    .select('id, project_id, log_date, status')
    .eq('site_manager_user_id', user.id)
    .eq('log_date', today)

  if (projectId) {
    query = query.eq('project_id', projectId)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getMyProjects() {
  const user = await requireUser()
  const supabase = await createClient()

  // Get projects where user is site manager
  const { data, error } = await supabase
    .from('projects')
    .select('id, name, project_code, status, location, client:clients(name)')
    .eq('site_manager_user_id', user.id)
    .eq('status', 'active')
    .order('name')

  if (error) throw error
  return data
}

export async function getMyStats() {
  const user = await requireUser()
  const supabase = await createClient()
  const today = dayjs().format('YYYY-MM-DD')
  const weekStart = dayjs().startOf('week').format('YYYY-MM-DD')

  const [
    { count: totalLogs },
    { count: logsThisWeek },
    { count: logsToday },
    { count: draftLogs },
  ] = await Promise.all([
    supabase.from('daily_logs').select('*', { count: 'exact', head: true }).eq('site_manager_user_id', user.id),
    supabase.from('daily_logs').select('*', { count: 'exact', head: true }).eq('site_manager_user_id', user.id).gte('log_date', weekStart),
    supabase.from('daily_logs').select('*', { count: 'exact', head: true }).eq('site_manager_user_id', user.id).eq('log_date', today),
    supabase.from('daily_logs').select('*', { count: 'exact', head: true }).eq('site_manager_user_id', user.id).eq('status', 'draft'),
  ])

  return {
    totalLogs: totalLogs || 0,
    logsThisWeek: logsThisWeek || 0,
    logsToday: logsToday || 0,
    draftLogs: draftLogs || 0,
  }
}
