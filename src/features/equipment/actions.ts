'use server'

import { createClient } from '@/lib/db/supabase-server'
import { revalidatePath } from 'next/cache'

export async function getEquipment() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('equipment')
    .select('*, assigned_employee:employees(id, full_name)')
    .order('name')

  if (error) throw error
  return data
}

export async function getEquipmentItem(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('equipment')
    .select('*, assigned_employee:employees(id, full_name)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createEquipment(input: {
  name: string
  category: string
  status?: string
  type_name?: string
  chassis_number?: string
  license_plate?: string
  purchase_cost?: number
  operating_cost?: number
  hourly_cost?: number
  insurance_company?: string
  insurance_expiry?: string
  test_expiry?: string
  notes?: string
  assigned_employee_id?: string
}) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('equipment')
    .insert(input)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/equipment')
  return data
}

export async function updateEquipment(id: string, input: Record<string, unknown>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('equipment')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/equipment')
  revalidatePath(`/equipment/${id}`)
  return data
}
