'use server'

import { createClient } from '@/lib/db/supabase-server'
import { requireUser, requireRole } from '@/lib/auth/get-user'
import { dailyLogSchema, type DailyLogFormData } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

export async function getLogs(filters?: { projectId?: string; status?: string; date?: string }) {
  const supabase = await createClient()
  let query = supabase
    .from('daily_logs')
    .select(`
      *,
      project:projects(id, name, project_code),
      site_manager:users!daily_logs_site_manager_user_id_fkey(id, full_name),
      workers:daily_log_workers(id)
    `)
    .order('log_date', { ascending: false })

  if (filters?.projectId) query = query.eq('project_id', filters.projectId)
  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.date) query = query.eq('log_date', filters.date)

  const { data, error } = await query.limit(100)
  if (error) throw error
  return data
}

export async function getLog(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('daily_logs')
    .select(`
      *,
      project:projects(id, name, project_code, client:clients(id, name)),
      site_manager:users!daily_logs_site_manager_user_id_fkey(id, full_name),
      workers:daily_log_workers(*, employee:employees(id, full_name, role_title, hourly_rate)),
      files:daily_log_files(*)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createLogAction(formData: DailyLogFormData, files?: FormData) {
  const user = await requireUser()
  const { workers, ...logData } = dailyLogSchema.parse(formData)

  const supabase = await createClient()

  // Create the log
  const { data: log, error: logError } = await supabase
    .from('daily_logs')
    .insert({
      ...logData,
      site_manager_user_id: user.id,
    })
    .select()
    .single()

  if (logError) throw logError

  // Add workers
  if (workers && workers.length > 0) {
    const { error: workersError } = await supabase
      .from('daily_log_workers')
      .insert(
        workers.map((w) => ({
          daily_log_id: log.id,
          ...w,
        }))
      )
    if (workersError) throw workersError
  }

  // Upload files
  if (files) {
    const fileEntries = files.getAll('files') as File[]
    for (const file of fileEntries) {
      if (file.size === 0) continue
      const filePath = `logs/${log.id}/${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('daily-log-files')
        .upload(filePath, file)

      if (!uploadError) {
        await supabase.from('daily_log_files').insert({
          daily_log_id: log.id,
          file_path: filePath,
          file_name: file.name,
          file_type: file.type,
        })
      }
    }
  }

  revalidatePath('/logs')
  revalidatePath(`/projects/${logData.project_id}`)
  return log
}

export async function updateLogAction(id: string, formData: DailyLogFormData) {
  const user = await requireUser()
  const { workers, ...logData } = dailyLogSchema.parse(formData)

  const supabase = await createClient()

  // Check permissions - approved logs are read-only unless admin
  const { data: existingLog } = await supabase
    .from('daily_logs')
    .select('status')
    .eq('id', id)
    .single()

  if (existingLog?.status === 'approved' && user.role !== 'admin') {
    throw new Error('Approved logs can only be edited by admin')
  }

  const { data: log, error: logError } = await supabase
    .from('daily_logs')
    .update({ ...logData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (logError) throw logError

  // Replace workers
  if (workers) {
    await supabase.from('daily_log_workers').delete().eq('daily_log_id', id)
    if (workers.length > 0) {
      await supabase.from('daily_log_workers').insert(
        workers.map((w) => ({
          daily_log_id: id,
          ...w,
        }))
      )
    }
  }

  revalidatePath('/logs')
  revalidatePath(`/logs/${id}`)
  return log
}

export async function deleteLogAction(id: string) {
  await requireRole(['admin'])

  const supabase = await createClient()

  // Delete files from storage
  const { data: files } = await supabase
    .from('daily_log_files')
    .select('file_path')
    .eq('daily_log_id', id)

  if (files && files.length > 0) {
    await supabase.storage
      .from('daily-log-files')
      .remove(files.map((f) => f.file_path))
  }

  // Delete cascading
  await supabase.from('daily_log_files').delete().eq('daily_log_id', id)
  await supabase.from('daily_log_workers').delete().eq('daily_log_id', id)
  const { error } = await supabase.from('daily_logs').delete().eq('id', id)

  if (error) throw error
  revalidatePath('/logs')
}

export async function uploadLogFiles(logId: string, files: FormData) {
  await requireUser()
  const supabase = await createClient()

  const fileEntries = files.getAll('files') as File[]
  const uploaded = []

  for (const file of fileEntries) {
    if (file.size === 0) continue
    const filePath = `logs/${logId}/${Date.now()}-${file.name}`
    const { error: uploadError } = await supabase.storage
      .from('daily-log-files')
      .upload(filePath, file)

    if (!uploadError) {
      const { data } = await supabase
        .from('daily_log_files')
        .insert({
          daily_log_id: logId,
          file_path: filePath,
          file_name: file.name,
          file_type: file.type,
        })
        .select()
        .single()
      if (data) uploaded.push(data)
    }
  }

  revalidatePath(`/logs/${logId}`)
  return uploaded
}

export async function deleteLogFile(fileId: string, filePath: string, logId: string) {
  await requireUser()
  const supabase = await createClient()

  await supabase.storage.from('daily-log-files').remove([filePath])
  await supabase.from('daily_log_files').delete().eq('id', fileId)

  revalidatePath(`/logs/${logId}`)
}
