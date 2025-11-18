'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface NavLinkProps {
  href: string
  children: React.ReactNode
}

export function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(href + '/')

  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors',
        isActive
          ? 'border-primary text-gray-900'
          : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
      )}
    >
      {children}
    </Link>
  )
}
