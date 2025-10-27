'use client'

import { useState } from 'react'

export default function BreakEvenCalculator() {
  const [fixedCosts, setFixedCosts] = useState(0)
  const [pricePerUnit, setPricePerUnit] = useState(0)
  const [variableCostPerUnit, setVariableCostPerUnit] = useState(0)

  // Calculations
  const contributionMargin = pricePerUnit - variableCostPerUnit
  const contributionMarginRatio = pricePerUnit > 0 ? (contributionMargin / pricePerUnit) * 100 : 0

  const breakEvenUnits = contributionMargin > 0 ? Math.ceil(fixedCosts / contributionMargin) : 0
  const breakEvenRevenue = breakEvenUnits * pricePerUnit

  // Additional helpful metrics
  const dailyUnitsNeeded = Math.ceil(breakEvenUnits / 30) // Assuming 30-day month
  const weeklyUnitsNeeded = Math.ceil(breakEvenUnits / 4) // Assuming 4-week month

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Input Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">Your Business Costs</h2>
          <p className="text-gray-600 mb-6">
            Enter your costs and pricing to calculate how many sales you need to break even.
          </p>
        </div>

        {/* Fixed Costs */}
        <div className="calculator-card">
          <label className="calculator-label">
            Monthly Fixed Costs
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-500">$</span>
            <input
              type="number"
              value={fixedCosts || ''}
              onChange={(e) => setFixedCosts(parseFloat(e.target.value) || 0)}
              className="calculator-input pl-8"
              placeholder="0.00"
              step="100"
              min="0"
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Costs that don't change with sales volume
          </p>
          <div className="mt-3 text-xs space-y-1 text-gray-600">
            <p>• Rent/mortgage</p>
            <p>• Salaries</p>
            <p>• Insurance</p>
            <p>• Software subscriptions</p>
            <p>• Utilities</p>
          </div>
        </div>

        {/* Price Per Unit */}
        <div className="calculator-card">
          <label className="calculator-label">
            Price Per Unit (Selling Price)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-500">$</span>
            <input
              type="number"
              value={pricePerUnit || ''}
              onChange={(e) => setPricePerUnit(parseFloat(e.target.value) || 0)}
              className="calculator-input pl-8"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            How much you charge per product/service
          </p>
        </div>

        {/* Variable Cost Per Unit */}
        <div className="calculator-card">
          <label className="calculator-label">
            Variable Cost Per Unit
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-500">$</span>
            <input
              type="number"
              value={variableCostPerUnit || ''}
              onChange={(e) => setVariableCostPerUnit(parseFloat(e.target.value) || 0)}
              className="calculator-input pl-8"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Costs that increase with each sale
          </p>
          <div className="mt-3 text-xs space-y-1 text-gray-600">
            <p>• Materials/ingredients</p>
            <p>• Packaging</p>
            <p>• Shipping</p>
            <p>• Transaction fees</p>
            <p>• Direct labor</p>
          </div>
        </div>

        {/* Example */}
        <div className="calculator-card bg-blue-50">
          <h3 className="font-semibold mb-3">📘 Example</h3>
          <div className="text-sm space-y-2 text-gray-700">
            <p><strong>Coffee Shop:</strong></p>
            <p>• Fixed costs: $5,000/mo (rent, staff, utilities)</p>
            <p>• Sell coffee for: $5</p>
            <p>• Coffee costs: $1.50 (beans, milk, cup)</p>
            <p className="pt-2 border-t border-blue-200">
              <strong>Break-even:</strong> Need to sell 1,429 cups/month
            </p>
            <p className="text-xs text-gray-600">That's ~48 cups per day</p>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">Your Break-Even Point</h2>
        </div>

        {/* Main Result - Units Needed */}
        <div className="calculator-card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <div className="text-sm font-medium opacity-90 mb-2">Units to Break Even</div>
          <div className="text-5xl font-bold mb-4">
            {breakEvenUnits.toLocaleString()}
          </div>
          <div className="text-lg opacity-90">
            Sales needed per month
          </div>
        </div>

        {/* Revenue Needed */}
        <div className="calculator-card bg-green-50">
          <div className="text-sm text-gray-600 mb-2">Revenue to Break Even</div>
          <div className="text-4xl font-bold text-green-600">
            ${breakEvenRevenue.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 mt-2">
            Monthly revenue target
          </div>
        </div>

        {/* Time-Based Breakdown */}
        <div className="grid grid-cols-2 gap-4">
          <div className="calculator-card bg-blue-50">
            <div className="text-sm text-gray-600 mb-1">Per Day</div>
            <div className="text-2xl font-bold text-blue-600">
              {dailyUnitsNeeded}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Units per day (30 days)
            </div>
          </div>
          <div className="calculator-card bg-purple-50">
            <div className="text-sm text-gray-600 mb-1">Per Week</div>
            <div className="text-2xl font-bold text-purple-600">
              {weeklyUnitsNeeded}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Units per week
            </div>
          </div>
        </div>

        {/* Contribution Margin */}
        <div className="calculator-card">
          <h3 className="font-semibold text-lg mb-4">Contribution Margin</h3>
          <div className="space-y-3">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Price per unit:</span>
              <span className="font-semibold">${pricePerUnit.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Variable cost per unit:</span>
              <span className="font-semibold text-red-600">-${variableCostPerUnit.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-b-2 border-green-600 pb-2 pt-2">
              <span className="font-semibold">Contribution margin:</span>
              <span className="font-bold text-green-600">${contributionMargin.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-gray-600">Margin ratio:</span>
              <span className="font-semibold text-primary-600">{contributionMarginRatio.toFixed(1)}%</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Contribution margin = Amount each sale contributes to covering fixed costs
          </p>
        </div>

        {/* Profit Scenarios */}
        <div className="calculator-card bg-yellow-50">
          <h3 className="font-semibold mb-3">💰 Profit Scenarios</h3>
          <div className="space-y-3 text-sm">
            {contributionMargin > 0 && (
              <>
                <div className="flex justify-between p-2 bg-white rounded">
                  <span>At break-even ({breakEvenUnits} units):</span>
                  <span className="font-bold">$0 profit</span>
                </div>
                <div className="flex justify-between p-2 bg-white rounded">
                  <span>+50 more units ({breakEvenUnits + 50}):</span>
                  <span className="font-bold text-green-600">
                    +${(contributionMargin * 50).toFixed(0)} profit
                  </span>
                </div>
                <div className="flex justify-between p-2 bg-white rounded">
                  <span>+100 more units ({breakEvenUnits + 100}):</span>
                  <span className="font-bold text-green-600">
                    +${(contributionMargin * 100).toFixed(0)} profit
                  </span>
                </div>
                <div className="flex justify-between p-2 bg-white rounded">
                  <span>Double sales ({breakEvenUnits * 2}):</span>
                  <span className="font-bold text-green-600">
                    +${(contributionMargin * breakEvenUnits).toFixed(0)} profit
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Reality Check */}
        <div className="calculator-card">
          <h3 className="font-semibold mb-3">✅ Feasibility Check</h3>
          <div className="space-y-3 text-sm">
            {dailyUnitsNeeded <= 10 && breakEvenUnits > 0 && (
              <div className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <div>
                  <strong>Very achievable!</strong> Less than 10 units/day is manageable for most businesses.
                </div>
              </div>
            )}
            {dailyUnitsNeeded > 10 && dailyUnitsNeeded <= 50 && (
              <div className="flex items-start">
                <span className="text-blue-500 mr-2">→</span>
                <div>
                  <strong>Moderate goal.</strong> {dailyUnitsNeeded} units/day requires consistent marketing effort.
                </div>
              </div>
            )}
            {dailyUnitsNeeded > 50 && dailyUnitsNeeded <= 100 && (
              <div className="flex items-start">
                <span className="text-yellow-500 mr-2">⚠</span>
                <div>
                  <strong>Challenging.</strong> {dailyUnitsNeeded} units/day requires strong demand and operations.
                </div>
              </div>
            )}
            {dailyUnitsNeeded > 100 && (
              <div className="flex items-start">
                <span className="text-orange-500 mr-2">⚠</span>
                <div>
                  <strong>Very difficult.</strong> Consider lowering fixed costs or increasing prices/margins.
                </div>
              </div>
            )}
            {contributionMargin <= 0 && pricePerUnit > 0 && (
              <div className="flex items-start">
                <span className="text-red-500 mr-2">✗</span>
                <div>
                  <strong>Impossible to break even!</strong> Variable costs exceed price. You lose money on every sale.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Ways to Improve */}
        <div className="calculator-card">
          <h3 className="font-semibold mb-3">📈 Ways to Reach Break-Even Faster</h3>
          <ul className="text-sm space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">1.</span>
              <span><strong>Increase prices:</strong> Even a small price increase significantly reduces break-even units</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">2.</span>
              <span><strong>Reduce variable costs:</strong> Negotiate with suppliers, find efficiencies</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">3.</span>
              <span><strong>Lower fixed costs:</strong> Cut unnecessary subscriptions, renegotiate rent</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary-600 mr-2">4.</span>
              <span><strong>Improve conversion rate:</strong> More website visitors → customers</span>
            </li>
          </ul>
        </div>

        {/* Tips */}
        <div className="calculator-card">
          <h3 className="font-semibold mb-3">💡 Pro Tips</h3>
          <ul className="text-sm space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Calculate break-even BEFORE starting any business</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Track actual vs. projected - adjust your model monthly</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Add a safety buffer - things always cost more than expected</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Know your break-even by heart - it's your survival number</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
