'use client'

import { useState } from 'react'

export default function FreelanceRateCalculator() {
  const [desiredAnnualIncome, setDesiredAnnualIncome] = useState(60000)
  const [billableHoursPerWeek, setBillableHoursPerWeek] = useState(30)
  const [weeksWorkedPerYear, setWeeksWorkedPerYear] = useState(48)
  const [annualExpenses, setAnnualExpenses] = useState(10000)
  const [profitMargin, setProfitMargin] = useState(20)

  // Calculations
  const totalBillableHours = billableHoursPerWeek * weeksWorkedPerYear
  const totalRevenueeeded = desiredAnnualIncome + annualExpenses
  const revenueWithProfit = totalRevenueeeded / (1 - profitMargin / 100)

  const hourlyRate = totalBillableHours > 0 ? revenueWithProfit / totalBillableHours : 0
  const dailyRate = hourlyRate * 8 // Assuming 8-hour day
  const weeklyRate = hourlyRate * billableHoursPerWeek
  const monthlyRevenue = revenueWithProfit / 12

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Input Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">Your Goals & Schedule</h2>
          <p className="text-gray-600 mb-6">
            Enter your financial goals and working schedule to calculate your optimal freelance rates.
          </p>
        </div>

        {/* Desired Income */}
        <div className="calculator-card">
          <label className="calculator-label">
            Desired Annual Income (Take-Home)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-500">$</span>
            <input
              type="number"
              value={desiredAnnualIncome || ''}
              onChange={(e) => setDesiredAnnualIncome(parseFloat(e.target.value) || 0)}
              className="calculator-input pl-8"
              placeholder="60000"
              step="1000"
              min="0"
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            How much you want to earn per year (after expenses)
          </p>
        </div>

        {/* Billable Hours */}
        <div className="calculator-card">
          <label className="calculator-label">
            Billable Hours Per Week: {billableHoursPerWeek}
          </label>
          <input
            type="range"
            min="10"
            max="50"
            value={billableHoursPerWeek}
            onChange={(e) => setBillableHoursPerWeek(parseInt(e.target.value))}
            className="w-full h-3 bg-primary-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-600 mt-2">
            <span>10 hrs (Part-time)</span>
            <span>30 hrs (Sustainable)</span>
            <span>50 hrs (Intense)</span>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Time spent on client work (not admin, marketing, etc.)
          </p>
        </div>

        {/* Weeks Worked */}
        <div className="calculator-card">
          <label className="calculator-label">
            Weeks Worked Per Year: {weeksWorkedPerYear}
          </label>
          <input
            type="range"
            min="40"
            max="52"
            value={weeksWorkedPerYear}
            onChange={(e) => setWeeksWorkedPerYear(parseInt(e.target.value))}
            className="w-full h-3 bg-primary-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-600 mt-2">
            <span>40 (12 weeks off)</span>
            <span>48 (4 weeks off)</span>
            <span>52 (No breaks)</span>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Account for vacations, holidays, and sick days
          </p>
        </div>

        {/* Annual Expenses */}
        <div className="calculator-card">
          <label className="calculator-label">
            Annual Business Expenses
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-500">$</span>
            <input
              type="number"
              value={annualExpenses || ''}
              onChange={(e) => setAnnualExpenses(parseFloat(e.target.value) || 0)}
              className="calculator-input pl-8"
              placeholder="10000"
              step="1000"
              min="0"
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Software, hardware, insurance, taxes, marketing, etc.
          </p>
          <div className="mt-3 text-xs space-y-1 text-gray-600">
            <p>• Software subscriptions: ~$2,000/yr</p>
            <p>• Health insurance: ~$6,000/yr</p>
            <p>• Self-employment tax: 15.3% of income</p>
            <p>• Marketing & tools: ~$2,000/yr</p>
          </div>
        </div>

        {/* Profit Margin */}
        <div className="calculator-card bg-primary-50">
          <label className="calculator-label">
            Safety Margin / Profit Buffer: {profitMargin}%
          </label>
          <input
            type="range"
            min="0"
            max="40"
            value={profitMargin}
            onChange={(e) => setProfitMargin(parseInt(e.target.value))}
            className="w-full h-3 bg-primary-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-600 mt-2">
            <span>0% (Break-even)</span>
            <span>20% (Recommended)</span>
            <span>40% (High growth)</span>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Extra cushion for slow periods and business growth
          </p>
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">Your Recommended Rates</h2>
        </div>

        {/* Main Result - Hourly Rate */}
        <div className="calculator-card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <div className="text-sm font-medium opacity-90 mb-2">Your Hourly Rate</div>
          <div className="text-5xl font-bold mb-4">
            ${hourlyRate.toFixed(0)}/hr
          </div>
          <div className="text-sm opacity-90">
            Charge at least this to meet your goals
          </div>
        </div>

        {/* Other Rate Options */}
        <div className="grid grid-cols-2 gap-4">
          <div className="calculator-card bg-green-50">
            <div className="text-sm text-gray-600 mb-1">Daily Rate</div>
            <div className="text-2xl font-bold text-green-600">
              ${dailyRate.toFixed(0)}
            </div>
            <div className="text-xs text-gray-500 mt-1">8-hour day</div>
          </div>
          <div className="calculator-card bg-blue-50">
            <div className="text-sm text-gray-600 mb-1">Weekly Rate</div>
            <div className="text-2xl font-bold text-blue-600">
              ${weeklyRate.toFixed(0)}
            </div>
            <div className="text-xs text-gray-500 mt-1">{billableHoursPerWeek} hours</div>
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="calculator-card">
          <h3 className="font-semibold text-lg mb-4">Annual Breakdown</h3>
          <div className="space-y-3">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Billable Hours:</span>
              <span className="font-semibold">{totalBillableHours.toLocaleString()} hrs/yr</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Desired Income:</span>
              <span className="font-semibold">${desiredAnnualIncome.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Business Expenses:</span>
              <span className="font-semibold text-red-600">+${annualExpenses.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-600">Profit Buffer ({profitMargin}%):</span>
              <span className="font-semibold text-red-600">
                +${((revenueWithProfit - totalRevenueeeded)).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between border-b-2 border-primary-600 pb-2 pt-2">
              <span className="font-semibold text-lg">Total Revenue Needed:</span>
              <span className="font-bold text-lg text-primary-600">
                ${revenueWithProfit.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="calculator-card bg-purple-50">
          <div className="text-sm text-gray-600 mb-2">Expected Monthly Revenue</div>
          <div className="text-3xl font-bold text-purple-600 mb-3">
            ${monthlyRevenue.toFixed(0)}
          </div>
          <div className="text-sm text-gray-700">
            At {Math.round(billableHoursPerWeek * 4.33)} hours/month average
          </div>
        </div>

        {/* Project-Based Pricing */}
        <div className="calculator-card bg-yellow-50">
          <h3 className="font-semibold mb-3">💼 Project-Based Pricing</h3>
          <p className="text-sm text-gray-700 mb-3">
            If you prefer project rates, estimate hours and multiply:
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between p-2 bg-white rounded">
              <span>Small project (10 hrs):</span>
              <span className="font-bold">${(hourlyRate * 10).toFixed(0)}</span>
            </div>
            <div className="flex justify-between p-2 bg-white rounded">
              <span>Medium project (40 hrs):</span>
              <span className="font-bold">${(hourlyRate * 40).toFixed(0)}</span>
            </div>
            <div className="flex justify-between p-2 bg-white rounded">
              <span>Large project (100 hrs):</span>
              <span className="font-bold">${(hourlyRate * 100).toFixed(0)}</span>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-3">
            💡 Tip: Add 20-30% buffer for scope creep!
          </p>
        </div>

        {/* Reality Check */}
        <div className="calculator-card">
          <h3 className="font-semibold mb-3">✅ Reality Check</h3>
          <div className="space-y-3 text-sm">
            {hourlyRate < 50 && (
              <div className="flex items-start">
                <span className="text-yellow-500 mr-2">⚠</span>
                <div>
                  <strong>Under $50/hr:</strong> Common for beginners. Focus on gaining experience.
                </div>
              </div>
            )}
            {hourlyRate >= 50 && hourlyRate < 100 && (
              <div className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <div>
                  <strong>$50-100/hr:</strong> Solid mid-level freelance rate. Good positioning!
                </div>
              </div>
            )}
            {hourlyRate >= 100 && hourlyRate < 200 && (
              <div className="flex items-start">
                <span className="text-blue-500 mr-2">★</span>
                <div>
                  <strong>$100-200/hr:</strong> Senior/specialist rate. Requires strong portfolio.
                </div>
              </div>
            )}
            {hourlyRate >= 200 && (
              <div className="flex items-start">
                <span className="text-purple-500 mr-2">★★</span>
                <div>
                  <strong>$200+/hr:</strong> Expert/consultant rate. Position yourself as premium.
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
              <span>Don't forget taxes! Set aside 25-30% of income</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Only 60-70% of your time is typically billable</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Raise rates yearly (at least 10%)</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Premium clients prefer higher rates (more serious)</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
