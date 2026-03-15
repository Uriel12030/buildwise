'use server'

import { createClient } from '@/lib/db/supabase-server'
import { revalidatePath } from 'next/cache'

export async function getInventoryItems() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .order('name')

  if (error) throw error
  return data
}

export async function getInventoryItem(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function quickAddInventoryItem(name: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('inventory_items').insert({ name, quantity: 0, status: 'available' })
  if (error) throw error
  revalidatePath('/inventory')
}
