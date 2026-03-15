'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth/auth-context'
import {
  LayoutDashboard,
  Users,
  Building2,
  FolderKanban,
  ClipboardList,
  LogOut,
  HardHat,
  ChevronLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Clients', href: '/clients', icon: Building2 },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Employees', href: '/employees', icon: Users },
  { name: 'Daily Logs', href: '/logs', icon: ClipboardList },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-white transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-4">
        <HardHat className="h-8 w-8 shrink-0 text-blue-600" />
        {!collapsed && (
          <span className="text-xl font-bold text-gray-900">BuildWise</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn('ml-auto h-8 w-8', collapsed && 'mx-auto')}
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft
            className={cn(
              'h-4 w-4 transition-transform',
              collapsed && 'rotate-180'
            )}
          />
        </Button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && item.name}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="border-t p-3">
        {user && !collapsed && (
          <div className="mb-2 px-2">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.full_name}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {user.role.replace('_', ' ')}
            </p>
          </div>
        )}
        <Button
          variant="ghost"
          size={collapsed ? 'icon' : 'default'}
          className={cn('w-full text-gray-600', !collapsed && 'justify-start')}
          onClick={signOut}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="ml-2">Sign out</span>}
        </Button>
      </div>
    </aside>
  )
}
