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
} from 'lucide-react'
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

export function MobileSidebar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72 p-0">
        <div className="flex h-16 items-center gap-2 border-b px-4">
          <HardHat className="h-8 w-8 text-brand" />
          <span className="text-lg font-semibold text-foreground">BuildWise</span>
        </div>
        <nav className="flex-1 space-y-1 px-2 py-4">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-brand-light text-brand font-semibold'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
                {isActive && (
                  <div className="absolute inset-y-1 end-0 w-[3px] rounded-full bg-brand" />
                )}
              </Link>
            )
          })}
        </nav>
        <div className="border-t p-3">
          {user && (
            <div className="mb-2 px-2">
              <p className="text-sm font-medium text-foreground">{user.full_name}</p>
              <p className="text-xs text-muted-foreground">
                {roleLabels[user.role] || user.role}
              </p>
            </div>
          )}
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground"
            onClick={signOut}
          >
            <LogOut className="ms-2 h-4 w-4" />
            התנתקות
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
