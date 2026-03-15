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
  ChevronRight,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

const navigation = [
  { name: 'לוח בקרה', href: '/dashboard', icon: LayoutDashboard },
  { name: 'לקוחות', href: '/clients', icon: Building2 },
  { name: 'פרויקטים', href: '/projects', icon: FolderKanban },
  { name: 'עובדים', href: '/employees', icon: Users },
  { name: 'יומני עבודה', href: '/logs', icon: ClipboardList },
  { name: 'היומנים שלי', href: '/my-logs', icon: FileText },
]

const roleLabels: Record<string, string> = {
  admin: 'מנהל מערכת',
  office_manager: 'מנהלת משרד',
  project_manager: 'מנהל פרויקט',
  site_manager: 'מנהל עבודה',
}

export function Sidebar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'fixed inset-y-0 end-0 z-50 flex flex-col border-s border-border bg-gradient-to-b from-card to-muted/20 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-[72px] items-center gap-2 border-b border-border/60 px-4">
        <HardHat className="h-8 w-8 shrink-0 text-brand" />
        {!collapsed && (
          <>
            <div className="w-1 h-5 rounded-full bg-brand/60" />
            <span className="text-lg font-semibold text-foreground">BuildWise</span>
          </>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn('me-auto h-8 w-8', collapsed && 'mx-auto')}
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronRight
            className={cn(
              'h-4 w-4 transition-transform',
              collapsed && 'rotate-180'
            )}
          />
        </Button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-2 py-4">
        {!collapsed && <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">ניווט</p>}
        {navigation.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-light text-brand font-semibold'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && item.name}
              {isActive && (
                <div className="absolute inset-y-1 end-0 w-[3px] rounded-full bg-brand" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="border-t p-3">
        {user && !collapsed && (
          <div className="mb-2 bg-muted/40 rounded-xl mx-0 p-2">
            <p className="text-sm font-medium text-foreground truncate">
              {user.full_name}
            </p>
            <p className="text-xs text-muted-foreground">
              {roleLabels[user.role] || user.role}
            </p>
          </div>
        )}
        <Button
          variant="ghost"
          size={collapsed ? 'icon' : 'default'}
          className={cn('w-full text-muted-foreground', !collapsed && 'justify-start')}
          onClick={signOut}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="me-2">התנתקות</span>}
        </Button>
      </div>
    </aside>
  )
}
