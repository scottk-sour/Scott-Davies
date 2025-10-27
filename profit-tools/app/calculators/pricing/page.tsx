import PricingCalculator from '@/components/calculators/PricingCalculator'

export const metadata = {
  title: 'Pricing Calculator | Profit Tools',
  description: 'Calculate the perfect price for your products or services based on costs and desired profit margins.',
}

export default function PricingPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          💰 Pricing Calculator
        </h1>
        <p className="text-xl text-gray-600">
          Calculate the optimal price for your product or service based on your costs and desired profit margin.
          Never underprice again!
        </p>
      </div>

      <PricingCalculator />
    </div>
  )
}
