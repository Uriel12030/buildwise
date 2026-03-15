import { createClient } from '@/lib/db/supabase-server'
import type { User, UserRole } from '@/types'

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) return null

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  return user
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

export async function requireRole(roles: UserRole[]): Promise<User> {
  const user = await requireUser()
  if (!roles.includes(user.role)) {
    throw new Error('Forbidden')
  }
  return user
}
