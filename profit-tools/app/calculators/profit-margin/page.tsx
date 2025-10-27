import ProfitMarginCalculator from '@/components/calculators/ProfitMarginCalculator'

export const metadata = {
  title: 'Profit Margin Calculator | Profit Tools',
  description: 'Calculate gross profit, net profit, and markup percentages instantly.',
}

export default function ProfitMarginPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          📊 Profit Margin Calculator
        </h1>
        <p className="text-xl text-gray-600">
          Calculate your gross profit, net profit, and profit margins to understand your business profitability.
        </p>
      </div>

      <ProfitMarginCalculator />
    </div>
  )
}
