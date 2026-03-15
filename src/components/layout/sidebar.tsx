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
  Settings,
  Search,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

const mainNav = [
  { name: 'לוח בקרה', href: '/dashboard', icon: LayoutDashboard },
  { name: 'היומנים שלי', href: '/my-logs', icon: FileText },
]

const managementNav = [
  { name: 'לקוחות', href: '/clients', icon: Building2 },
  { name: 'פרויקטים', href: '/projects', icon: FolderKanban },
  { name: 'עובדים', href: '/employees', icon: Users },
  { name: 'יומני עבודה', href: '/logs', icon: ClipboardList },
]

const roleLabels: Record<string, string> = {
  admin: 'מנהל מערכת',
  office_manager: 'מנהלת משרד',
  project_manager: 'מנהל פרויקט',
  site_manager: 'מנהל עבודה',
}

function NavSection({ label, items, pathname, collapsed }: {
  label: string
  items: typeof mainNav
  pathname: string
  collapsed: boolean
}) {
  return (
    <div className="space-y-1">
      {!collapsed && (
        <p className="px-3 pt-4 pb-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50">
          {label}
        </p>
      )}
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150',
              isActive
                ? 'bg-primary/10 text-primary font-semibold'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              collapsed && 'justify-center px-2'
            )}
            title={collapsed ? item.name : undefined}
          >
            <item.icon className={cn('h-[18px] w-[18px] shrink-0', isActive && 'text-primary')} />
            {!collapsed && <span>{item.name}</span>}
            {isActive && !collapsed && (
              <div className="absolute inset-y-1 end-0 w-[3px] rounded-full bg-primary" />
            )}
          </Link>
        )
      })}
    </div>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'fixed inset-y-0 end-0 z-50 flex flex-col border-s bg-card/50 backdrop-blur-xl transition-all duration-300',
        collapsed ? 'w-[60px]' : 'w-[260px]'
      )}
    >
      {/* Brand */}
      <div className="flex h-14 items-center gap-2.5 border-b px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <HardHat className="h-4.5 w-4.5" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight">BuildWise</span>
            <span className="text-[10px] text-muted-foreground leading-none">ניהול תפעול</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn('me-auto h-7 w-7 text-muted-foreground', collapsed && 'mx-auto')}
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronRight className={cn('h-3.5 w-3.5 transition-transform', collapsed && 'rotate-180')} />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        <NavSection label="ראשי" items={mainNav} pathname={pathname} collapsed={collapsed} />
        <NavSection label="ניהול" items={managementNav} pathname={pathname} collapsed={collapsed} />
      </nav>

      {/* User */}
      <div className="border-t p-2">
        {user && !collapsed ? (
          <div className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-accent transition-colors">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
              {user.full_name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user.full_name}</p>
              <p className="text-[11px] text-muted-foreground">{roleLabels[user.role] || user.role}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={signOut}
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="w-full text-muted-foreground"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        )}
      </div>
    </aside>
  )
}
