'use client'

import { useState } from 'react'

export default function ProfitMarginCalculator() {
  const [revenue, setRevenue] = useState(0)
  const [costOfGoodsSold, setCostOfGoodsSold] = useState(0)
  const [operatingExpenses, setOperatingExpenses] = useState(0)

  // Calculations
  const grossProfit = revenue - costOfGoodsSold
  const grossProfitMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0

  const netProfit = grossProfit - operatingExpenses
  const netProfitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0

  const markup = costOfGoodsSold > 0 ? ((revenue - costOfGoodsSold) / costOfGoodsSold) * 100 : 0

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Input Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">Enter Your Numbers</h2>
          <p className="text-gray-600 mb-6">
            Input your revenue and costs to calculate profit margins and markup percentages.
          </p>
        </div>

        {/* Revenue */}
        <div className="calculator-card">
          <label className="calculator-label">
            Revenue (Sales Price)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-500">$</span>
            <input
              type="number"
              value={revenue || ''}
              onChange={(e) => setRevenue(parseFloat(e.target.value) || 0)}
              className="calculator-input pl-8"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Total sales revenue or selling price
          </p>
        </div>

        {/* Cost of Goods Sold */}
        <div className="calculator-card">
          <label className="calculator-label">
            Cost of Goods Sold (COGS)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-500">$</span>
            <input
              type="number"
              value={costOfGoodsSold || ''}
              onChange={(e) => setCostOfGoodsSold(parseFloat(e.target.value) || 0)}
              className="calculator-input pl-8"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Direct costs to produce your product/service
          </p>
        </div>

        {/* Operating Expenses */}
        <div className="calculator-card">
          <label className="calculator-label">
            Operating Expenses
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-500">$</span>
            <input
              type="number"
              value={operatingExpenses || ''}
              onChange={(e) => setOperatingExpenses(parseFloat(e.target.value) || 0)}
              className="calculator-input pl-8"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Rent, utilities, marketing, salaries, etc.
          </p>
        </div>

        {/* Example */}
        <div className="calculator-card bg-blue-50">
          <h3 className="font-semibold mb-3">📘 Example</h3>
          <div className="text-sm space-y-2 text-gray-700">
            <p><strong>You sell a product for $100</strong></p>
            <p>• Materials & labor cost you $40 (COGS)</p>
            <p>• Monthly expenses are $20 per unit (Operating)</p>
            <p className="pt-2 border-t border-blue-200">
              <strong>Result:</strong> $40 net profit (40% margin)
            </p>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">Your Profit Analysis</h2>
        </div>

        {/* Gross Profit */}
        <div className="calculator-card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="text-sm font-medium opacity-90 mb-2">Gross Profit</div>
          <div className="text-4xl font-bold mb-2">
            ${grossProfit.toFixed(2)}
          </div>
          <div className="text-2xl font-semibold opacity-90">
            {grossProfitMargin.toFixed(1)}% Margin
          </div>
          <div className="text-sm opacity-80 mt-3">
            Revenue minus cost of goods sold
          </div>
        </div>

        {/* Net Profit */}
        <div className="calculator-card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <div className="text-sm font-medium opacity-90 mb-2">Net Profit</div>
          <div className="text-4xl font-bold mb-2">
            ${netProfit.toFixed(2)}
          </div>
          <div className="text-2xl font-semibold opacity-90">
            {netProfitMargin.toFixed(1)}% Margin
          </div>
          <div className="text-sm opacity-80 mt-3">
            Gross profit minus operating expenses
          </div>
        </div>

        {/* Breakdown */}
        <div className="calculator-card">
          <h3 className="font-semibold text-lg mb-4">Financial Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Revenue:</span>
              <span className="font-semibold text-gray-900">${revenue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Cost of Goods Sold:</span>
              <span className="font-semibold text-red-600">-${costOfGoodsSold.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-b-2 border-green-600 pb-2">
              <span className="font-semibold">Gross Profit:</span>
              <span className="font-bold text-green-600">${grossProfit.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-b pb-2 pt-2">
              <span className="text-gray-600">Operating Expenses:</span>
              <span className="font-semibold text-red-600">-${operatingExpenses.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-b-2 border-primary-600 pb-2">
              <span className="font-semibold text-lg">Net Profit:</span>
              <span className="font-bold text-lg text-primary-600">${netProfit.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="calculator-card bg-purple-50">
            <div className="text-sm text-gray-600 mb-1">Markup %</div>
            <div className="text-2xl font-bold text-purple-600">
              {markup.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              How much you mark up COGS
            </div>
          </div>
          <div className="calculator-card bg-orange-50">
            <div className="text-sm text-gray-600 mb-1">Profit per $1</div>
            <div className="text-2xl font-bold text-orange-600">
              ${revenue > 0 ? (netProfit / revenue).toFixed(2) : '0.00'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Net profit per dollar sold
            </div>
          </div>
        </div>

        {/* Margin Interpretation */}
        <div className="calculator-card bg-yellow-50">
          <h3 className="font-semibold mb-3">📊 Margin Health Check</h3>
          <div className="space-y-3 text-sm">
            {netProfitMargin >= 20 && (
              <div className="flex items-start">
                <span className="text-green-500 text-lg mr-2">✓</span>
                <div>
                  <strong className="text-green-700">Excellent!</strong>
                  <p className="text-gray-700">20%+ net margin is very healthy for most businesses.</p>
                </div>
              </div>
            )}
            {netProfitMargin >= 10 && netProfitMargin < 20 && (
              <div className="flex items-start">
                <span className="text-blue-500 text-lg mr-2">→</span>
                <div>
                  <strong className="text-blue-700">Good</strong>
                  <p className="text-gray-700">10-20% net margin is solid. Look for ways to optimize.</p>
                </div>
              </div>
            )}
            {netProfitMargin >= 5 && netProfitMargin < 10 && (
              <div className="flex items-start">
                <span className="text-yellow-500 text-lg mr-2">⚠</span>
                <div>
                  <strong className="text-yellow-700">Fair</strong>
                  <p className="text-gray-700">5-10% margin is tight. Consider raising prices or cutting costs.</p>
                </div>
              </div>
            )}
            {netProfitMargin < 5 && netProfitMargin > 0 && (
              <div className="flex items-start">
                <span className="text-orange-500 text-lg mr-2">⚠</span>
                <div>
                  <strong className="text-orange-700">Low</strong>
                  <p className="text-gray-700">Under 5% is risky. Prioritize improving margins.</p>
                </div>
              </div>
            )}
            {netProfitMargin <= 0 && (
              <div className="flex items-start">
                <span className="text-red-500 text-lg mr-2">✗</span>
                <div>
                  <strong className="text-red-700">Losing Money</strong>
                  <p className="text-gray-700">You're operating at a loss. Immediate action needed!</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tips */}
        <div className="calculator-card">
          <h3 className="font-semibold mb-3">💡 Pro Tips</h3>
          <ul className="text-sm space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span><strong>Gross margin</strong> shows product profitability</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span><strong>Net margin</strong> shows overall business health</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Track margins monthly to spot trends early</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Different industries have different "healthy" margins</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
