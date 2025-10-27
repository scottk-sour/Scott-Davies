import Link from 'next/link'

export default function CalculatorsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              Profit Tools
            </Link>
            <div className="flex items-center space-x-6">
              <Link href="/calculators" className="text-gray-700 hover:text-primary-600">
                All Calculators
              </Link>
              <Link href="/" className="text-gray-600 hover:text-gray-900 text-sm">
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Calculator Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto py-4">
            <Link
              href="/calculators/pricing"
              className="whitespace-nowrap text-sm font-medium text-gray-700 hover:text-primary-600 pb-2 border-b-2 border-transparent hover:border-primary-600"
            >
              💰 Pricing
            </Link>
            <Link
              href="/calculators/profit-margin"
              className="whitespace-nowrap text-sm font-medium text-gray-700 hover:text-primary-600 pb-2 border-b-2 border-transparent hover:border-primary-600"
            >
              📊 Profit Margin
            </Link>
            <Link
              href="/calculators/freelance-rate"
              className="whitespace-nowrap text-sm font-medium text-gray-700 hover:text-primary-600 pb-2 border-b-2 border-transparent hover:border-primary-600"
            >
              ⏱️ Freelance Rate
            </Link>
            <Link
              href="/calculators/roi"
              className="whitespace-nowrap text-sm font-medium text-gray-700 hover:text-primary-600 pb-2 border-b-2 border-transparent hover:border-primary-600"
            >
              📈 ROI
            </Link>
            <Link
              href="/calculators/break-even"
              className="whitespace-nowrap text-sm font-medium text-gray-700 hover:text-primary-600 pb-2 border-b-2 border-transparent hover:border-primary-600"
            >
              ⚖️ Break-Even
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600 text-sm">
          <p>© 2025 Profit Tools. Making business math simple.</p>
        </div>
      </footer>
    </div>
  )
}
