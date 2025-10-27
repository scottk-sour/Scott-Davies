import Link from 'next/link'

export default function CalculatorsPage() {
  const calculators = [
    {
      name: 'Pricing Calculator',
      icon: '💰',
      description: 'Calculate the perfect price for your products or services based on costs and desired profit margins.',
      href: '/calculators/pricing',
      color: 'blue',
    },
    {
      name: 'Profit Margin Calculator',
      icon: '📊',
      description: 'Instantly calculate gross profit, net profit, and markup percentages for any product or service.',
      href: '/calculators/profit-margin',
      color: 'green',
    },
    {
      name: 'Freelance Rate Calculator',
      icon: '⏱️',
      description: 'Determine your ideal hourly or project rates based on your desired income and expenses.',
      href: '/calculators/freelance-rate',
      color: 'purple',
    },
    {
      name: 'ROI Calculator',
      icon: '📈',
      description: 'Calculate return on investment for marketing campaigns, equipment, or any business investment.',
      href: '/calculators/roi',
      color: 'orange',
    },
    {
      name: 'Break-Even Calculator',
      icon: '⚖️',
      description: 'Find out exactly how many sales you need to cover costs and start making profit.',
      href: '/calculators/break-even',
      color: 'red',
    },
  ]

  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Your Business Calculator Suite
        </h1>
        <p className="text-xl text-gray-600">
          Choose a calculator below to get started
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {calculators.map((calc) => (
          <Link
            key={calc.href}
            href={calc.href}
            className="calculator-card hover:shadow-xl transition-all hover:scale-105"
          >
            <div className="text-5xl mb-4">{calc.icon}</div>
            <h2 className="text-2xl font-bold mb-3 text-gray-900">{calc.name}</h2>
            <p className="text-gray-600 mb-4">{calc.description}</p>
            <div className="text-primary-600 font-semibold flex items-center">
              Open Calculator
              <svg
                className="w-5 h-5 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      {/* Help Section */}
      <div className="mt-16 calculator-card bg-blue-50">
        <h3 className="text-2xl font-bold mb-4">Need Help?</h3>
        <p className="text-gray-700 mb-4">
          Each calculator includes built-in help and examples. If you need additional support,
          feel free to reach out to our team.
        </p>
        <a
          href="mailto:support@profittools.com"
          className="text-primary-600 font-semibold hover:text-primary-700"
        >
          Contact Support →
        </a>
      </div>
    </div>
  )
}
