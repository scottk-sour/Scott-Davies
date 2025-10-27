import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-primary-600">Profit Tools</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="#features" className="text-gray-700 hover:text-primary-600">
                Features
              </Link>
              <Link href="#pricing" className="text-gray-700 hover:text-primary-600">
                Pricing
              </Link>
              <Link href="/calculators" className="btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
            Stop Guessing.<br />
            <span className="text-primary-600">Start Profiting.</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Professional business calculators that help you price correctly,
            maximize profits, and make data-driven decisions.
            <strong> One payment. Lifetime access.</strong>
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/calculators" className="btn-primary text-lg px-8 py-4">
              Get Instant Access - $47
            </Link>
            <Link href="#features" className="btn-secondary text-lg px-8 py-4">
              See All Tools
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            ✓ 5 Professional Calculators  ✓ No Monthly Fees  ✓ Instant Access
          </p>
        </div>
      </section>

      {/* Problem Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Are You Leaving Money on the Table?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-red-500 text-4xl mb-4">❌</div>
              <h3 className="text-xl font-semibold mb-2">Pricing Too Low</h3>
              <p className="text-gray-600">
                Undercharging means working harder for less profit. Most freelancers undervalue their work by 30-50%.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-red-500 text-4xl mb-4">❌</div>
              <h3 className="text-xl font-semibold mb-2">Hidden Costs</h3>
              <p className="text-gray-600">
                Forgetting expenses and overhead costs kills your margins. Every hour you're not tracking is money lost.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-red-500 text-4xl mb-4">❌</div>
              <h3 className="text-xl font-semibold mb-2">Unclear ROI</h3>
              <p className="text-gray-600">
                Not knowing if investments pay off leads to wasted money. Without data, you're gambling with your business.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-4">
            5 Essential Calculators in One Suite
          </h2>
          <p className="text-center text-gray-600 mb-12">
            Everything you need to make profitable business decisions
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Calculator 1 */}
            <div className="calculator-card hover:shadow-xl transition-shadow">
              <div className="text-primary-600 text-3xl mb-4">💰</div>
              <h3 className="text-2xl font-bold mb-3">Pricing Calculator</h3>
              <p className="text-gray-600 mb-4">
                Calculate the perfect price for your products or services. Factor in costs,
                desired profit margin, and market positioning.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>✓ Cost-plus pricing</li>
                <li>✓ Competitor analysis</li>
                <li>✓ Profit margin targets</li>
                <li>✓ Volume discounts</li>
              </ul>
            </div>

            {/* Calculator 2 */}
            <div className="calculator-card hover:shadow-xl transition-shadow">
              <div className="text-primary-600 text-3xl mb-4">📊</div>
              <h3 className="text-2xl font-bold mb-3">Profit Margin Calculator</h3>
              <p className="text-gray-600 mb-4">
                Instantly calculate gross profit, net profit, and markup percentages.
                See exactly how much you're making per sale.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>✓ Gross vs net profit</li>
                <li>✓ Markup percentages</li>
                <li>✓ Revenue projections</li>
                <li>✓ Cost analysis</li>
              </ul>
            </div>

            {/* Calculator 3 */}
            <div className="calculator-card hover:shadow-xl transition-shadow">
              <div className="text-primary-600 text-3xl mb-4">⏱️</div>
              <h3 className="text-2xl font-bold mb-3">Freelance Rate Calculator</h3>
              <p className="text-gray-600 mb-4">
                Determine your hourly or project rates based on your desired annual income,
                expenses, and billable hours.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>✓ Hourly rate optimization</li>
                <li>✓ Project-based pricing</li>
                <li>✓ Tax & expense factoring</li>
                <li>✓ Time tracking insights</li>
              </ul>
            </div>

            {/* Calculator 4 */}
            <div className="calculator-card hover:shadow-xl transition-shadow">
              <div className="text-primary-600 text-3xl mb-4">📈</div>
              <h3 className="text-2xl font-bold mb-3">ROI Calculator</h3>
              <p className="text-gray-600 mb-4">
                Calculate return on investment for marketing campaigns, equipment purchases,
                or any business investment.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>✓ Investment analysis</li>
                <li>✓ Payback period</li>
                <li>✓ Percentage returns</li>
                <li>✓ Comparison tools</li>
              </ul>
            </div>

            {/* Calculator 5 */}
            <div className="calculator-card hover:shadow-xl transition-shadow">
              <div className="text-primary-600 text-3xl mb-4">⚖️</div>
              <h3 className="text-2xl font-bold mb-3">Break-Even Calculator</h3>
              <p className="text-gray-600 mb-4">
                Find out exactly how many sales you need to cover costs and start making profit.
                Essential for business planning.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>✓ Fixed vs variable costs</li>
                <li>✓ Units to break-even</li>
                <li>✓ Revenue targets</li>
                <li>✓ Scenario planning</li>
              </ul>
            </div>

            {/* Bonus */}
            <div className="calculator-card bg-primary-50 border-primary-300 hover:shadow-xl transition-shadow">
              <div className="text-primary-600 text-3xl mb-4">🎁</div>
              <h3 className="text-2xl font-bold mb-3">BONUS: Save All Results</h3>
              <p className="text-gray-600 mb-4">
                Save your calculations, compare scenarios, and export to PDF.
                Track your business metrics over time.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>✓ Save unlimited calculations</li>
                <li>✓ Export to PDF</li>
                <li>✓ Historical tracking</li>
                <li>✓ Comparison views</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Placeholder */}
      <section className="bg-primary-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-2xl italic mb-4">
            "These calculators helped me realize I was undercharging by 40%.
            I raised my rates and my clients didn't even blink. Best $47 I ever spent."
          </p>
          <p className="font-semibold">— Sarah M., Freelance Designer</p>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-4">
            Simple, Honest Pricing
          </h2>
          <p className="text-center text-gray-600 mb-12">
            One payment. No subscriptions. Lifetime access.
          </p>

          <div className="calculator-card max-w-md mx-auto text-center">
            <div className="text-primary-600 text-5xl font-bold mb-2">$47</div>
            <p className="text-gray-600 mb-6">One-time payment</p>

            <ul className="text-left mb-8 space-y-3">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>All 5 professional calculators</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Lifetime access (no monthly fees)</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Save unlimited calculations</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Export to PDF</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Mobile-friendly access anywhere</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Future updates included</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>30-day money-back guarantee</span>
              </li>
            </ul>

            <Link href="/calculators" className="btn-primary w-full block text-center text-lg py-4">
              Get Instant Access Now
            </Link>

            <p className="text-sm text-gray-500 mt-4">
              Secure payment via Stripe • Instant access after purchase
            </p>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600">
              <strong>Money-Back Guarantee:</strong> Try it risk-free for 30 days.
              If you're not satisfied, we'll refund every penny.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-2">Is this really a one-time payment?</h3>
              <p className="text-gray-600">
                Yes! Pay once, use forever. No monthly subscriptions, no hidden fees. You get lifetime access to all calculators and future updates.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-2">Can I use this on my phone?</h3>
              <p className="text-gray-600">
                Absolutely! Profit Tools works on any device - desktop, tablet, or mobile. Access your calculators anywhere, anytime.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-2">Do I need to download anything?</h3>
              <p className="text-gray-600">
                No downloads required. Everything works in your web browser. Just log in and start calculating.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-2">What if I need help?</h3>
              <p className="text-gray-600">
                Each calculator includes helpful tooltips and examples. Plus, you can email support@profittools.com anytime.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-2">Is my data secure?</h3>
              <p className="text-gray-600">
                Yes. We use bank-level encryption (SSL) and never share your data. Your calculations are private and secure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Stop Guessing. Start Growing.
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join hundreds of entrepreneurs making smarter business decisions with data-driven calculators.
          </p>
          <Link href="/calculators" className="btn-primary text-lg px-12 py-4 inline-block">
            Get Started for $47
          </Link>
          <p className="text-sm text-gray-500 mt-4">
            30-day money-back guarantee • Instant access • No monthly fees
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400">
              © 2025 Profit Tools. All rights reserved.
            </p>
            <div className="mt-4 space-x-6">
              <Link href="/privacy" className="text-gray-400 hover:text-white">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white">
                Terms of Service
              </Link>
              <Link href="mailto:support@profittools.com" className="text-gray-400 hover:text-white">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
