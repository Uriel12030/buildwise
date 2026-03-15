'use server'

import { createClient } from '@/lib/db/supabase-server'
import { requireUser, requireRole } from '@/lib/auth/get-user'
import { clientSchema, type ClientFormData } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

export async function getClients() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('name')

  if (error) throw error
  return data
}

export async function getClient(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function getClientProjects(clientId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*, project_manager:users!projects_project_manager_user_id_fkey(id, full_name), site_manager:users!projects_site_manager_user_id_fkey(id, full_name)')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createClientAction(formData: ClientFormData) {
  await requireRole(['admin', 'office_manager'])
  const validated = clientSchema.parse(formData)

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('clients')
    .insert(validated)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/clients')
  return data
}

export async function updateClientAction(id: string, formData: ClientFormData) {
  await requireRole(['admin', 'office_manager'])
  const validated = clientSchema.parse(formData)

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('clients')
    .update({ ...validated, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/clients')
  revalidatePath(`/clients/${id}`)
  return data
}

export async function deleteClientAction(id: string) {
  await requireRole(['admin'])

  const supabase = await createClient()
  const { error } = await supabase.from('clients').delete().eq('id', id)

  if (error) throw error
  revalidatePath('/clients')
}
