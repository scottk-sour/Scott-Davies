// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Calculator, TrendingUp, TrendingDown, Sparkles, RefreshCw, DollarSign } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { CommissionRule } from '@/types/commission'

// =====================================================
// PREMIUM WHAT-IF CALCULATOR COMPONENT
// Interactive commission calculator with smooth animations
// =====================================================

interface WhatIfCalculatorProps {
  rules: CommissionRule[]
  onCalculate?: (result: CalculationResult) => void
}

interface CalculationResult {
  totalCommission: number
  breakdown: Array<{
    ruleName: string
    amount: number
    applied: boolean
  }>
  inputData: {
    sales: number
    profit: number
    deals: number
  }
}

export function WhatIfCalculator({ rules, onCalculate }: WhatIfCalculatorProps) {
  const [sales, setSales] = useState(10000)
  const [profit, setProfit] = useState(6000)
  const [deals, setDeals] = useState(5)
  const [result, setResult] = useState<CalculationResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [hasCalculated, setHasCalculated] = useState(false)

  // Auto-calculate on input change (with debounce)
  useEffect(() => {
    if (hasCalculated) {
      const timeout = setTimeout(() => {
        handleCalculate()
      }, 500)
      return () => clearTimeout(timeout)
    }
  }, [sales, profit, deals, hasCalculated])

  const handleCalculate = () => {
    setIsCalculating(true)

    // Simulate calculation (replace with actual calculation logic)
    setTimeout(() => {
      const calculationResult = performCalculation(rules, {
        sales: sales * 100, // Convert to pence
        profit: profit * 100,
        deals,
      })

      setResult(calculationResult)
      setIsCalculating(false)
      setHasCalculated(true)

      if (onCalculate) {
        onCalculate(calculationResult)
      }
    }, 300)
  }

  const handleReset = () => {
    setSales(10000)
    setProfit(6000)
    setDeals(5)
    setResult(null)
    setHasCalculated(false)
  }

  const profitMargin = sales > 0 ? ((profit / sales) * 100).toFixed(1) : '0'

  return (
    <div className="space-y-6">
      {/* Input Card */}
      <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50/50 to-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <Calculator className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">What-If Calculator</CardTitle>
                <CardDescription>
                  Adjust values to see commission changes in real-time
                </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Input Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sales */}
            <div className="space-y-3">
              <Label htmlFor="sales" className="text-base font-semibold flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                Total Sales
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  id="sales"
                  value={sales}
                  onChange={(e) => setSales(parseFloat(e.target.value) || 0)}
                  className="text-lg font-semibold h-12 pr-12"
                  step="100"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  £
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="50000"
                step="100"
                value={sales}
                onChange={(e) => setSales(parseFloat(e.target.value))}
                className="w-full h-2 bg-gradient-to-r from-green-200 to-green-500 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>£0</span>
                <span>£50k</span>
              </div>
            </div>

            {/* Profit */}
            <div className="space-y-3">
              <Label htmlFor="profit" className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                Total Profit
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  id="profit"
                  value={profit}
                  onChange={(e) => setProfit(parseFloat(e.target.value) || 0)}
                  className="text-lg font-semibold h-12 pr-12"
                  step="100"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  £
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="30000"
                step="100"
                value={profit}
                onChange={(e) => setProfit(parseFloat(e.target.value))}
                className="w-full h-2 bg-gradient-to-r from-blue-200 to-blue-500 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>£0</span>
                <span>£30k</span>
              </div>
              <div className="text-center">
                <Badge variant="secondary" className="font-mono">
                  {profitMargin}% margin
                </Badge>
              </div>
            </div>

            {/* Deals */}
            <div className="space-y-3">
              <Label htmlFor="deals" className="text-base font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                Deals Closed
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  id="deals"
                  value={deals}
                  onChange={(e) => setDeals(parseInt(e.target.value) || 0)}
                  className="text-lg font-semibold h-12"
                  step="1"
                  min="0"
                />
              </div>
              <input
                type="range"
                min="0"
                max="20"
                step="1"
                value={deals}
                onChange={(e) => setDeals(parseInt(e.target.value))}
                className="w-full h-2 bg-gradient-to-r from-purple-200 to-purple-500 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0</span>
                <span>20</span>
              </div>
              <div className="text-center">
                <Badge variant="secondary" className="font-mono">
                  £{sales > 0 && deals > 0 ? (sales / deals).toFixed(0) : '0'} avg/deal
                </Badge>
              </div>
            </div>
          </div>

          {/* Calculate Button */}
          {!hasCalculated && (
            <Button
              onClick={handleCalculate}
              disabled={isCalculating}
              size="lg"
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isCalculating ? (
                <>
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="h-5 w-5 mr-2" />
                  Calculate Commission
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Results Card */}
      {result && (
        <Card className="border-2 border-green-100 bg-gradient-to-br from-green-50/50 to-white animate-in slide-in-from-bottom duration-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center animate-bounce">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              Estimated Commission
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Total Commission - Big Number */}
            <div className="text-center py-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl animate-in zoom-in duration-300">
              <div className="text-white/80 text-sm font-medium mb-2">
                YOUR COMMISSION
              </div>
              <div className="text-6xl font-bold text-white mb-2 animate-in zoom-in duration-500 delay-100">
                {formatCurrency(result.totalCommission)}
              </div>
              <div className="text-white/80 text-sm">
                Based on {rules.length} active rule{rules.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Breakdown */}
            <div className="space-y-3">
              <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Calculation Breakdown
              </div>

              {result.breakdown.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all duration-300 animate-in slide-in-from-left ${
                    item.applied
                      ? 'bg-green-50 border-green-200 hover:bg-green-100'
                      : 'bg-gray-50 border-gray-200 opacity-50'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center gap-3">
                    {item.applied ? (
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-white" />
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                        <TrendingDown className="h-4 w-4 text-gray-500" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-gray-900">{item.ruleName}</div>
                      <div className="text-xs text-gray-600">
                        {item.applied ? 'Applied' : 'Not applied'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`text-xl font-bold ${item.applied ? 'text-green-600' : 'text-gray-400'}`}>
                      {item.applied ? '+' : ''}
                      {formatCurrency(item.amount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {result.breakdown.filter(b => b.applied).length}
                </div>
                <div className="text-xs text-gray-600">Rules Applied</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {((result.totalCommission / (result.inputData.profit || 1)) * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-600">Of Profit</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {result.inputData.deals > 0
                    ? formatCurrency(result.totalCommission / result.inputData.deals)
                    : formatCurrency(0)}
                </div>
                <div className="text-xs text-gray-600">Per Deal</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          border: 3px solid currentColor;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          transition: all 0.2s;
        }

        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          border: 3px solid currentColor;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          transition: all 0.2s;
        }

        .slider::-moz-range-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  )
}

// Simple calculation logic (replace with actual engine)
function performCalculation(
  rules: CommissionRule[],
  inputData: { sales: number; profit: number; deals: number }
): CalculationResult {
  const breakdown: Array<{
    ruleName: string
    amount: number
    applied: boolean
  }> = []

  let totalCommission = 0

  // Sort by priority
  const sortedRules = [...rules].sort((a, b) => b.priority - a.priority)

  for (const rule of sortedRules) {
    let amount = 0
    let applied = false

    switch (rule.rule_type) {
      case 'percentage':
        amount = Math.round(inputData.profit * rule.config.rate)
        applied = true
        break

      case 'flat':
        if (rule.config.per_unit === 'deal') {
          amount = rule.config.amount * inputData.deals
          applied = inputData.deals > 0
        }
        break

      case 'threshold':
        if (inputData.profit >= rule.config.threshold) {
          amount = Math.round((inputData.profit - rule.config.threshold) * rule.config.rate)
          applied = true
        }
        break

      case 'bonus':
        if (inputData.sales >= rule.config.target_amount) {
          amount = rule.config.bonus_amount
          applied = true
        }
        break

      default:
        amount = 0
    }

    breakdown.push({
      ruleName: rule.name,
      amount: amount,
      applied: applied,
    })

    if (applied) {
      if (rule.stacking_behavior === 'replace') {
        totalCommission = amount
      } else if (rule.stacking_behavior === 'add') {
        totalCommission += amount
      }
    }
  }

  return {
    totalCommission,
    breakdown,
    inputData: {
      sales: inputData.sales / 100,
      profit: inputData.profit / 100,
      deals: inputData.deals,
    },
  }
}
