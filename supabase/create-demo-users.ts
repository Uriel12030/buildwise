/**
 * Script to create demo users in Supabase Auth.
 * Run with: npx tsx supabase/create-demo-users.ts
 *
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const demoUsers = [
  { email: 'admin@buildwise.demo', password: 'admin123456', full_name: 'Admin User', role: 'admin' },
  { email: 'office@buildwise.demo', password: 'office123456', full_name: 'Dana Office', role: 'office_manager' },
  { email: 'pm@buildwise.demo', password: 'pm123456', full_name: 'Roni Project Manager', role: 'project_manager' },
  { email: 'site@buildwise.demo', password: 'site123456', full_name: 'Eyal Site Manager', role: 'site_manager' },
]

async function main() {
  for (const user of demoUsers) {
    console.log(`Creating user: ${user.email}...`)

    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        full_name: user.full_name,
        role: user.role,
      },
    })

    if (error) {
      if (error.message.includes('already been registered')) {
        console.log(`  -> Already exists, updating role...`)
        // Find and update existing user
        const { data: existingUsers } = await supabase.auth.admin.listUsers()
        const existing = existingUsers?.users?.find((u) => u.email === user.email)
        if (existing) {
          await supabase
            .from('users')
            .update({ role: user.role, full_name: user.full_name })
            .eq('id', existing.id)
          console.log(`  -> Updated.`)
        }
      } else {
        console.error(`  -> Error: ${error.message}`)
      }
    } else {
      console.log(`  -> Created with ID: ${data.user.id}`)
      // Update role in public.users table
      await supabase
        .from('users')
        .update({ role: user.role })
        .eq('id', data.user.id)
    }
  }

  console.log('\nDone! Demo credentials:')
  demoUsers.forEach((u) => {
    console.log(`  ${u.role.padEnd(16)} ${u.email} / ${u.password}`)
  })
}

main()
