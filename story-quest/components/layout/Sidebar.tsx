'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Heart, Home, Users, Book, Settings, LogOut, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  userRole: string
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      roles: ['PARENT', 'PROFESSIONAL', 'ADMIN'],
    },
    {
      name: 'Children',
      href: '/children',
      icon: Users,
      roles: ['PARENT', 'PROFESSIONAL'],
    },
    {
      name: 'Stories',
      href: '/stories',
      icon: Book,
      roles: ['PARENT', 'PROFESSIONAL', 'ADMIN'],
    },
    {
      name: 'Professional Tools',
      href: '/professional',
      icon: Shield,
      roles: ['PROFESSIONAL', 'ADMIN'],
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      roles: ['PARENT', 'PROFESSIONAL', 'ADMIN'],
    },
  ]

  const visibleNavigation = navigation.filter((item) =>
    item.roles.includes(userRole)
  )

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-6 border-b border-gray-200">
        <Heart className="h-8 w-8 text-purple-600" />
        <span className="text-xl font-bold text-gray-900">StoryQuest</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {visibleNavigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-purple-50 text-purple-700'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Sign Out */}
      <div className="border-t border-gray-200 p-4">
        <button
          onClick={() => {
            // Will be connected to signOut
            window.location.href = '/api/auth/signout'
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </div>
  )
}
