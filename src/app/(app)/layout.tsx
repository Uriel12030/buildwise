import { getCurrentUser } from '@/lib/auth/get-user'
import { AuthProvider } from '@/lib/auth/auth-context'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileSidebar } from '@/components/layout/mobile-sidebar'
import { redirect } from 'next/navigation'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <AuthProvider initialUser={user}>
      <div className="min-h-screen bg-background">
        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Mobile header */}
        <div className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b backdrop-blur-lg bg-background/80 px-4 lg:hidden">
          <MobileSidebar />
          <span className="text-lg font-bold text-foreground">BuildWise</span>
        </div>

        {/* Main content */}
        <main className="lg:pe-64 min-h-screen">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">{children}</div>
        </main>
      </div>
    </AuthProvider>
  )
}
