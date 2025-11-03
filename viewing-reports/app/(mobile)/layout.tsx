import { BottomNav } from '@/components/mobile/BottomNav'

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <main className="mx-auto max-w-2xl">{children}</main>
      <BottomNav />
    </div>
  )
}
