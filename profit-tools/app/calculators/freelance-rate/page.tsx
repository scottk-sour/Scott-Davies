import FreelanceRateCalculator from '@/components/calculators/FreelanceRateCalculator'

export const metadata = {
  title: 'Freelance Rate Calculator | Profit Tools',
  description: 'Calculate your optimal hourly and project rates based on your income goals and expenses.',
}

export default function FreelanceRatePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          ⏱️ Freelance Rate Calculator
        </h1>
        <p className="text-xl text-gray-600">
          Calculate your ideal freelance rates based on your desired income, working hours, and business expenses.
          Stop undercharging!
        </p>
      </div>

      <FreelanceRateCalculator />
    </div>
  )
}
