// @ts-nocheck
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { NavLink } from '@/components/dashboard/nav-link'

async function getUser() {
  const supabase = createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const { data: user } = await supabase
    .from('users')
    .select('*, organization:organizations(*)')
    .eq('id', session.user.id)
    .single()

  return { session, user }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { session, user } = await getUser()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link href="/dashboard" className="flex items-center hover:opacity-80 transition-opacity">
                <span className="text-2xl font-bold">💷</span>
                <span className="ml-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  CommissionFlow
                </span>
              </Link>

              <div className="hidden sm:ml-8 sm:flex sm:space-x-6">
                <NavLink href="/dashboard">Dashboard</NavLink>
                <NavLink href="/deals">Deals</NavLink>
                <NavLink href="/reports">Reports</NavLink>
                <NavLink href="/team">Team</NavLink>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:block">
                <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {user?.organization?.name}
                </span>
              </div>
              <form action="/api/auth/signout" method="POST">
                <Button variant="outline" size="sm" type="submit">
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
