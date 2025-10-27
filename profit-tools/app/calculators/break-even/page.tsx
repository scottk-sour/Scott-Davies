import BreakEvenCalculator from '@/components/calculators/BreakEvenCalculator'

export const metadata = {
  title: 'Break-Even Calculator | Profit Tools',
  description: 'Calculate how many sales you need to cover costs and start making profit.',
}

export default function BreakEvenPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          ⚖️ Break-Even Calculator
        </h1>
        <p className="text-xl text-gray-600">
          Calculate exactly how many units you need to sell to cover all costs and start making profit.
          Essential for business planning and goal setting.
        </p>
      </div>

      <BreakEvenCalculator />
    </div>
  )
}
