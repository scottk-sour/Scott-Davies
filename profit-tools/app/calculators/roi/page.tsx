import ROICalculator from '@/components/calculators/ROICalculator'

export const metadata = {
  title: 'ROI Calculator | Profit Tools',
  description: 'Calculate return on investment for marketing campaigns, equipment, or any business investment.',
}

export default function ROIPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          📈 ROI Calculator
        </h1>
        <p className="text-xl text-gray-600">
          Calculate return on investment (ROI) for marketing campaigns, equipment purchases, software tools,
          or any business investment. Make data-driven decisions.
        </p>
      </div>

      <ROICalculator />
    </div>
  )
}
