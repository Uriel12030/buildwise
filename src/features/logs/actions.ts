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
      project:projects(id, name, project_code, location, client:clients(id, name), project_manager:users!projects_project_manager_user_id_fkey(id, full_name)),
      site_manager:users!daily_logs_site_manager_user_id_fkey(id, full_name),
      workers:daily_log_workers(*, employee:employees(id, full_name, role_title, hourly_rate)),
      files:daily_log_files(*),
      activities:daily_log_activities(*),
      equipment:daily_log_equipment(*),
      materials:daily_log_materials(*)
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function getEmployeesByType() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('employees')
    .select('id, full_name, role_title, employee_type')
    .eq('status', 'active')
    .order('full_name')

  if (error) throw error

  const company = data.filter((e) => e.role_title !== 'עובד זר')
  const foreign = data.filter((e) => e.role_title === 'עובד זר')

  return { company, foreign }
}

export async function createLogAction(formData: DailyLogFormData, files?: FormData) {
  const user = await requireUser()
  const { workers, activities, equipment, materials, ...logData } = dailyLogSchema.parse(formData)

  const supabase = await createClient()

  // Create the log
  const { data: log, error: logError } = await supabase
    .from('daily_logs')
    .insert({
      ...logData,
      work_summary: logData.work_summary || '',
      site_manager_user_id: user.id,
    })
    .select()
    .single()

  if (logError) throw new Error(logError.message)

  // Add workers
  if (workers && workers.length > 0) {
    const { error: workersError } = await supabase
      .from('daily_log_workers')
      .insert(
        workers.map((w) => ({
          daily_log_id: log.id,
          worker_type: w.worker_type,
          employee_id: w.employee_id || null,
          worker_name: w.worker_name || null,
          role_title: w.role_title || null,
          hours_worked: w.hours_worked,
          overtime_hours: w.overtime_hours,
          notes: w.notes || null,
        }))
      )
    if (workersError) throw workersError
  }

  // Add activities
  if (activities && activities.length > 0) {
    const nonEmpty = activities.filter((a) => a.description?.trim())
    if (nonEmpty.length > 0) {
      const { error: activitiesError } = await supabase
        .from('daily_log_activities')
        .insert(
          nonEmpty.map((a) => ({
            daily_log_id: log.id,
            seq_number: a.seq_number,
            description: a.description,
            is_irregular: a.is_irregular,
            notes: a.notes || null,
          }))
        )
      if (activitiesError) throw activitiesError
    }
  }

  // Add equipment
  if (equipment && equipment.length > 0) {
    const { error: equipmentError } = await supabase
      .from('daily_log_equipment')
      .insert(
        equipment.map((e) => ({
          daily_log_id: log.id,
          equipment_type: e.equipment_type,
          identification_number: e.identification_number || null,
          equipment_name: e.equipment_name,
          notes: e.notes || null,
        }))
      )
    if (equipmentError) throw equipmentError
  }

  // Add materials
  if (materials && materials.length > 0) {
    const { error: materialsError } = await supabase
      .from('daily_log_materials')
      .insert(
        materials.map((m) => ({
          daily_log_id: log.id,
          material_name: m.material_name,
          quantity: m.quantity || null,
          supplier: m.supplier || null,
          notes: m.notes || null,
        }))
      )
    if (materialsError) throw materialsError
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
  const { workers, activities, equipment, materials, ...logData } = dailyLogSchema.parse(formData)

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
          worker_type: w.worker_type,
          employee_id: w.employee_id || null,
          worker_name: w.worker_name || null,
          role_title: w.role_title || null,
          hours_worked: w.hours_worked,
          overtime_hours: w.overtime_hours,
          notes: w.notes || null,
        }))
      )
    }
  }

  // Replace activities
  if (activities) {
    await supabase.from('daily_log_activities').delete().eq('daily_log_id', id)
    const nonEmpty = activities.filter((a) => a.description?.trim())
    if (nonEmpty.length > 0) {
      await supabase.from('daily_log_activities').insert(
        nonEmpty.map((a) => ({
          daily_log_id: id,
          seq_number: a.seq_number,
          description: a.description,
          is_irregular: a.is_irregular,
          notes: a.notes || null,
        }))
      )
    }
  }

  // Replace equipment
  if (equipment) {
    await supabase.from('daily_log_equipment').delete().eq('daily_log_id', id)
    if (equipment.length > 0) {
      await supabase.from('daily_log_equipment').insert(
        equipment.map((e) => ({
          daily_log_id: id,
          equipment_type: e.equipment_type,
          identification_number: e.identification_number || null,
          equipment_name: e.equipment_name,
          notes: e.notes || null,
        }))
      )
    }
  }

  // Replace materials
  if (materials) {
    await supabase.from('daily_log_materials').delete().eq('daily_log_id', id)
    if (materials.length > 0) {
      await supabase.from('daily_log_materials').insert(
        materials.map((m) => ({
          daily_log_id: id,
          material_name: m.material_name,
          quantity: m.quantity || null,
          supplier: m.supplier || null,
          notes: m.notes || null,
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
  await supabase.from('daily_log_activities').delete().eq('daily_log_id', id)
  await supabase.from('daily_log_equipment').delete().eq('daily_log_id', id)
  await supabase.from('daily_log_materials').delete().eq('daily_log_id', id)
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
