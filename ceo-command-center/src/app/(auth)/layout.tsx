import { Package } from "lucide-react"
import Link from "next/link"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-primary flex-col justify-between p-12 text-primary-foreground">
        <Link href="/" className="flex items-center gap-2">
          <Package className="h-8 w-8" />
          <span className="text-2xl font-bold">Etsy Organiser</span>
        </Link>

        <div className="space-y-6">
          <h2 className="text-4xl font-bold">
            Your Etsy Shop, Organised
          </h2>
          <p className="text-lg text-primary-foreground/80">
            Stop juggling spreadsheets and browser tabs. Manage your entire shop from one dashboard.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="mt-1 h-2 w-2 rounded-full bg-primary-foreground" />
            <div>
              <p className="font-semibold">Track Product Launches</p>
              <p className="text-sm text-primary-foreground/80">From design to photography to listing - all in one place</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-1 h-2 w-2 rounded-full bg-primary-foreground" />
            <div>
              <p className="font-semibold">Hit Revenue Goals</p>
              <p className="text-sm text-primary-foreground/80">Set targets and track progress with measurable milestones</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-1 h-2 w-2 rounded-full bg-primary-foreground" />
            <div>
              <p className="font-semibold">Build Daily Shop Habits</p>
              <p className="text-sm text-primary-foreground/80">List products consistently, respond fast, grow steadily</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
}
