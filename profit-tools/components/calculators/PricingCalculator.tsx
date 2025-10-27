'use client'

import { useState } from 'react'

export default function PricingCalculator() {
  const [costs, setCosts] = useState({
    directCosts: 0,
    laborCosts: 0,
    overheadCosts: 0,
  })
  const [desiredProfitMargin, setDesiredProfitMargin] = useState(30)

  // Calculate total costs
  const totalCosts = costs.directCosts + costs.laborCosts + costs.overheadCosts

  // Calculate recommended price
  const recommendedPrice = totalCosts > 0 ? totalCosts / (1 - desiredProfitMargin / 100) : 0

  // Calculate profit amount
  const profitAmount = recommendedPrice - totalCosts

  // Calculate markup percentage
  const markupPercentage = totalCosts > 0 ? ((recommendedPrice - totalCosts) / totalCosts) * 100 : 0

  const handleInputChange = (field: keyof typeof costs, value: string) => {
    const numValue = parseFloat(value) || 0
    setCosts({ ...costs, [field]: numValue })
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Input Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">Enter Your Costs</h2>
          <p className="text-gray-600 mb-6">
            Input all costs associated with your product or service to calculate the optimal price.
          </p>
        </div>

        {/* Direct Costs */}
        <div className="calculator-card">
          <label className="calculator-label">
            Direct Costs (Materials, Supplies)
            <span className="text-gray-500 text-xs ml-2">per unit</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-500">$</span>
            <input
              type="number"
              value={costs.directCosts || ''}
              onChange={(e) => handleInputChange('directCosts', e.target.value)}
              className="calculator-input pl-8"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Raw materials, supplies, inventory costs, etc.
          </p>
        </div>

        {/* Labor Costs */}
        <div className="calculator-card">
          <label className="calculator-label">
            Labor Costs (Time, Wages)
            <span className="text-gray-500 text-xs ml-2">per unit</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-500">$</span>
            <input
              type="number"
              value={costs.laborCosts || ''}
              onChange={(e) => handleInputChange('laborCosts', e.target.value)}
              className="calculator-input pl-8"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Your time or employee wages for this product/service
          </p>
        </div>

        {/* Overhead Costs */}
        <div className="calculator-card">
          <label className="calculator-label">
            Overhead Costs (Rent, Utilities, Software)
            <span className="text-gray-500 text-xs ml-2">per unit</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-500">$</span>
            <input
              type="number"
              value={costs.overheadCosts || ''}
              onChange={(e) => handleInputChange('overheadCosts', e.target.value)}
              className="calculator-input pl-8"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Fixed costs divided by expected units sold
          </p>
        </div>

        {/* Profit Margin Slider */}
        <div className="calculator-card bg-primary-50">
          <label className="calculator-label">
            Desired Profit Margin: {desiredProfitMargin}%
          </label>
          <input
            type="range"
            min="5"
            max="80"
            value={desiredProfitMargin}
            onChange={(e) => setDesiredProfitMargin(parseInt(e.target.value))}
            className="w-full h-3 bg-primary-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-600 mt-2">
            <span>5% (Low)</span>
            <span>30% (Average)</span>
            <span>80% (Premium)</span>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">Your Recommended Price</h2>
        </div>

        {/* Main Result */}
        <div className="calculator-card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <div className="text-sm font-medium opacity-90 mb-2">Recommended Price</div>
          <div className="text-5xl font-bold mb-4">
            ${recommendedPrice.toFixed(2)}
          </div>
          <div className="text-sm opacity-90">
            This price gives you a {desiredProfitMargin}% profit margin
          </div>
        </div>

        {/* Breakdown */}
        <div className="calculator-card">
          <h3 className="font-semibold text-lg mb-4">Cost Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Direct Costs:</span>
              <span className="font-semibold">${costs.directCosts.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Labor Costs:</span>
              <span className="font-semibold">${costs.laborCosts.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Overhead Costs:</span>
              <span className="font-semibold">${costs.overheadCosts.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-b-2 border-gray-800 pb-2 pt-2">
              <span className="font-semibold text-gray-900">Total Costs:</span>
              <span className="font-bold text-lg">${totalCosts.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-green-600 pt-2">
              <span className="font-semibold">Your Profit:</span>
              <span className="font-bold text-lg">${profitAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="calculator-card bg-blue-50">
            <div className="text-sm text-gray-600 mb-1">Profit Margin</div>
            <div className="text-2xl font-bold text-blue-600">{desiredProfitMargin}%</div>
          </div>
          <div className="calculator-card bg-green-50">
            <div className="text-sm text-gray-600 mb-1">Markup</div>
            <div className="text-2xl font-bold text-green-600">{markupPercentage.toFixed(1)}%</div>
          </div>
        </div>

        {/* Pricing Strategies */}
        <div className="calculator-card bg-yellow-50">
          <h3 className="font-semibold mb-3 flex items-center">
            💡 Pricing Strategies
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <strong>Budget Option:</strong>{' '}
              <span className="text-lg font-semibold text-gray-800">
                ${(totalCosts * 1.15).toFixed(2)}
              </span>
              <span className="text-gray-600"> (15% margin)</span>
            </div>
            <div>
              <strong>Standard Option:</strong>{' '}
              <span className="text-lg font-semibold text-gray-800">
                ${recommendedPrice.toFixed(2)}
              </span>
              <span className="text-gray-600"> ({desiredProfitMargin}% margin)</span>
            </div>
            <div>
              <strong>Premium Option:</strong>{' '}
              <span className="text-lg font-semibold text-gray-800">
                ${(recommendedPrice * 1.3).toFixed(2)}
              </span>
              <span className="text-gray-600"> (30% higher for premium positioning)</span>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="calculator-card">
          <h3 className="font-semibold mb-3">💡 Pro Tips</h3>
          <ul className="text-sm space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Always factor in ALL costs, including your time</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Research competitor pricing in your market</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Premium products can often support 50%+ margins</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Test different price points with your audience</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
