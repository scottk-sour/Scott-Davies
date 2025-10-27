'use client'

import { useState } from 'react'

export default function ROICalculator() {
  const [investmentCost, setInvestmentCost] = useState(0)
  const [returnAmount, setReturnAmount] = useState(0)
  const [timeMonths, setTimeMonths] = useState(12)

  // Calculations
  const netProfit = returnAmount - investmentCost
  const roi = investmentCost > 0 ? (netProfit / investmentCost) * 100 : 0
  const annualizedROI = timeMonths > 0 ? (roi / timeMonths) * 12 : 0
  const paybackPeriod = netProfit > 0 ? (investmentCost / (netProfit / timeMonths)) : 0

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Input Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">Investment Details</h2>
          <p className="text-gray-600 mb-6">
            Enter your investment cost and expected returns to calculate ROI and payback period.
          </p>
        </div>

        {/* Investment Cost */}
        <div className="calculator-card">
          <label className="calculator-label">
            Total Investment Cost
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-500">$</span>
            <input
              type="number"
              value={investmentCost || ''}
              onChange={(e) => setInvestmentCost(parseFloat(e.target.value) || 0)}
              className="calculator-input pl-8"
              placeholder="0.00"
              step="100"
              min="0"
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Total amount invested (equipment, marketing, software, etc.)
          </p>
        </div>

        {/* Return Amount */}
        <div className="calculator-card">
          <label className="calculator-label">
            Expected Total Return
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-500">$</span>
            <input
              type="number"
              value={returnAmount || ''}
              onChange={(e) => setReturnAmount(parseFloat(e.target.value) || 0)}
              className="calculator-input pl-8"
              placeholder="0.00"
              step="100"
              min="0"
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Revenue or value gained from this investment
          </p>
        </div>

        {/* Time Period */}
        <div className="calculator-card">
          <label className="calculator-label">
            Time Period: {timeMonths} {timeMonths === 1 ? 'month' : 'months'}
          </label>
          <input
            type="range"
            min="1"
            max="60"
            value={timeMonths}
            onChange={(e) => setTimeMonths(parseInt(e.target.value))}
            className="w-full h-3 bg-primary-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-600 mt-2">
            <span>1 mo</span>
            <span>12 mo (1 yr)</span>
            <span>60 mo (5 yrs)</span>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            How long until you realize the full return?
          </p>
        </div>

        {/* Examples */}
        <div className="calculator-card bg-blue-50">
          <h3 className="font-semibold mb-3">📘 Example Investments</h3>
          <div className="text-sm space-y-3 text-gray-700">
            <div>
              <strong>Marketing Campaign:</strong>
              <p>Spent $5,000, generated $15,000 in 3 months</p>
              <p className="text-green-600">ROI: 200%</p>
            </div>
            <div className="pt-2 border-t">
              <strong>New Equipment:</strong>
              <p>$10,000 machine, adds $2,000/mo revenue</p>
              <p className="text-green-600">Payback: 5 months</p>
            </div>
            <div className="pt-2 border-t">
              <strong>Software Tool:</strong>
              <p>$1,200/yr, saves 10 hrs/wk at $50/hr</p>
              <p className="text-green-600">ROI: 2,000%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">Your ROI Analysis</h2>
        </div>

        {/* Main ROI Result */}
        <div className="calculator-card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <div className="text-sm font-medium opacity-90 mb-2">Return on Investment (ROI)</div>
          <div className="text-5xl font-bold mb-4">
            {roi > 0 ? '+' : ''}{roi.toFixed(1)}%
          </div>
          <div className="text-lg opacity-90">
            Over {timeMonths} {timeMonths === 1 ? 'month' : 'months'}
          </div>
        </div>

        {/* Net Profit */}
        <div className={`calculator-card ${netProfit >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="text-sm text-gray-600 mb-2">Net Profit/Loss</div>
          <div className={`text-4xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {netProfit >= 0 ? '+' : ''}${netProfit.toFixed(2)}
          </div>
          <div className="text-sm text-gray-600 mt-2">
            {netProfit >= 0 ? 'Profitable investment' : 'Loss on investment'}
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="calculator-card">
          <h3 className="font-semibold text-lg mb-4">Investment Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Initial Investment:</span>
              <span className="font-semibold text-red-600">-${investmentCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Total Return:</span>
              <span className="font-semibold text-green-600">+${returnAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-b-2 border-gray-800 pb-2 pt-2">
              <span className="font-semibold text-lg">Net Profit:</span>
              <span className={`font-bold text-lg ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {netProfit >= 0 ? '+' : ''}${netProfit.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-gray-600">Return Multiple:</span>
              <span className="font-semibold">
                {investmentCost > 0 ? (returnAmount / investmentCost).toFixed(2) : '0.00'}x
              </span>
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="calculator-card bg-purple-50">
            <div className="text-sm text-gray-600 mb-1">Annualized ROI</div>
            <div className="text-2xl font-bold text-purple-600">
              {annualizedROI > 0 ? '+' : ''}{annualizedROI.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Per year equivalent
            </div>
          </div>
          <div className="calculator-card bg-orange-50">
            <div className="text-sm text-gray-600 mb-1">Payback Period</div>
            <div className="text-2xl font-bold text-orange-600">
              {paybackPeriod > 0 && paybackPeriod < 999 ? paybackPeriod.toFixed(1) : '--'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Months to break even
            </div>
          </div>
        </div>

        {/* ROI Interpretation */}
        <div className="calculator-card bg-yellow-50">
          <h3 className="font-semibold mb-3">📊 ROI Interpretation</h3>
          <div className="space-y-3 text-sm">
            {roi >= 100 && (
              <div className="flex items-start">
                <span className="text-green-500 text-lg mr-2">★★</span>
                <div>
                  <strong className="text-green-700">Excellent ROI!</strong>
                  <p className="text-gray-700">100%+ ROI means you've doubled your money or more. Great investment!</p>
                </div>
              </div>
            )}
            {roi >= 50 && roi < 100 && (
              <div className="flex items-start">
                <span className="text-green-500 text-lg mr-2">★</span>
                <div>
                  <strong className="text-green-700">Very Good</strong>
                  <p className="text-gray-700">50-100% ROI is strong. This investment is paying off well.</p>
                </div>
              </div>
            )}
            {roi >= 20 && roi < 50 && (
              <div className="flex items-start">
                <span className="text-blue-500 text-lg mr-2">✓</span>
                <div>
                  <strong className="text-blue-700">Good</strong>
                  <p className="text-gray-700">20-50% ROI is solid. Better than most traditional investments.</p>
                </div>
              </div>
            )}
            {roi >= 0 && roi < 20 && (
              <div className="flex items-start">
                <span className="text-yellow-500 text-lg mr-2">→</span>
                <div>
                  <strong className="text-yellow-700">Modest</strong>
                  <p className="text-gray-700">Under 20% ROI is okay but could be better. Look for optimization opportunities.</p>
                </div>
              </div>
            )}
            {roi < 0 && (
              <div className="flex items-start">
                <span className="text-red-500 text-lg mr-2">✗</span>
                <div>
                  <strong className="text-red-700">Negative ROI</strong>
                  <p className="text-gray-700">You're losing money. Reconsider this investment or improve execution.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Monthly Returns */}
        <div className="calculator-card">
          <h3 className="font-semibold mb-3">📅 Monthly Breakdown</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span>Monthly Return:</span>
              <span className="font-bold">
                ${timeMonths > 0 ? (returnAmount / timeMonths).toFixed(2) : '0.00'}
              </span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span>Monthly Profit:</span>
              <span className={`font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${timeMonths > 0 ? (netProfit / timeMonths).toFixed(2) : '0.00'}
              </span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span>ROI per Month:</span>
              <span className="font-bold text-primary-600">
                {timeMonths > 0 ? (roi / timeMonths).toFixed(2) : '0.00'}%
              </span>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="calculator-card">
          <h3 className="font-semibold mb-3">💡 Pro Tips</h3>
          <ul className="text-sm space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Good ROI varies by industry - marketing campaigns often see 200%+</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Include ALL costs: setup, maintenance, opportunity cost</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Compare to alternatives - could money do better elsewhere?</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Track actual ROI vs. expected to improve future decisions</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
