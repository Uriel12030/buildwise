'use server'

import { createClient } from '@/lib/db/supabase-server'

export async function getTransportLogs(filters?: {
  fromDate?: string
  toDate?: string
  transportType?: string
}) {
  const supabase = await createClient()
  let query = supabase
    .from('transport_logs')
    .select('*, from_project:projects!transport_logs_from_project_id_fkey(id, name), to_project:projects!transport_logs_to_project_id_fkey(id, name)')
    .order('log_date', { ascending: false })

  if (filters?.fromDate) {
    query = query.gte('log_date', filters.fromDate)
  }
  if (filters?.toDate) {
    query = query.lte('log_date', filters.toDate)
  }
  if (filters?.transportType) {
    query = query.eq('transport_type', filters.transportType)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getTransportLog(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('transport_logs')
    .select('*, from_project:projects!transport_logs_from_project_id_fkey(id, name), to_project:projects!transport_logs_to_project_id_fkey(id, name)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}
