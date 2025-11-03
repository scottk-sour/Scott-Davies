'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Plus, History, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/today', label: 'Today', icon: Home },
  { href: '/new-viewing', label: 'New', icon: Plus },
  { href: '/history', label: 'History', icon: History },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white safe-area-inset-bottom">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors',
                isActive
                  ? 'text-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              <Icon
                className={cn(
                  'h-6 w-6',
                  item.href === '/new-viewing' && 'h-8 w-8'
                )}
              />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
