'use client'

import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

type MobileLayoutProps = {
  user: {
    name?: string | null
    email?: string | null
  }
  children: React.ReactNode
}

export function MobileLayout({ user, children }: MobileLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar user={user} />
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="fixed inset-y-0 left-0 w-64 bg-background"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar user={user} onNavigate={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header */}
        <div className="sticky top-0 z-30 flex items-center justify-between border-b bg-background px-4 py-3 md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-bold">Etsy Organiser</span>
          <div className="w-9" /> {/* Spacer for centering */}
        </div>

        {/* Page Content */}
        <div className="container py-4 md:py-8">{children}</div>
      </main>
    </div>
  )
}
