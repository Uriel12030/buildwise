'use client'

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
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
  FileText,
  Wrench,
  Package,
  Truck,
} from 'lucide-react'
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

const operationsNav = [
  { name: 'ציוד וכלים', href: '/equipment', icon: Wrench },
  { name: 'מלאי', href: '/inventory', icon: Package },
  { name: 'יומני משאית', href: '/transport', icon: Truck },
]

const roleLabels: Record<string, string> = {
  admin: 'מנהל מערכת',
  office_manager: 'מנהלת משרד',
  project_manager: 'מנהל פרויקט',
  site_manager: 'מנהל עבודה',
}

function MobileNavSection({ label, items, pathname, onNavigate }: {
  label: string
  items: typeof mainNav
  pathname: string
  onNavigate: () => void
}) {
  return (
    <div className="space-y-1">
      <p className="px-3 pt-4 pb-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/50">
        {label}
      </p>
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150',
              isActive
                ? 'bg-primary/10 text-primary font-semibold'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
          >
            <item.icon className={cn('h-[18px] w-[18px] shrink-0', isActive && 'text-primary')} />
            <span>{item.name}</span>
            {isActive && (
              <div className="absolute inset-y-1 end-0 w-[3px] rounded-full bg-primary" />
            )}
          </Link>
        )
      })}
    </div>
  )
}

export function MobileSidebar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[280px] p-0">
        {/* Brand */}
        <div className="flex h-14 items-center gap-2.5 border-b px-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <HardHat className="h-4.5 w-4.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight">BuildWise</span>
            <span className="text-[10px] text-muted-foreground leading-none">ניהול תפעול</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-2">
          <MobileNavSection label="ראשי" items={mainNav} pathname={pathname} onNavigate={() => setOpen(false)} />
          <MobileNavSection label="ניהול" items={managementNav} pathname={pathname} onNavigate={() => setOpen(false)} />
          <MobileNavSection label="תפעול" items={operationsNav} pathname={pathname} onNavigate={() => setOpen(false)} />
        </nav>

        {/* User */}
        <div className="border-t p-2">
          {user && (
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
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
