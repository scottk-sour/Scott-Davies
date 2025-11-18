// @ts-nocheck
'use client'

import { useState } from 'react'
import { useCommissionHistory } from '@/hooks/useCommissionCalculation'
import { CommissionCard } from './CommissionCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Users,
  BarChart3,
} from 'lucide-react'
import { formatCurrency, formatMonthYear } from '@/lib/utils'

// =====================================================
// PREMIUM COMMISSION HISTORY COMPONENT
// Beautiful timeline view with stats and filters
// =====================================================

interface CommissionHistoryProps {
  userId?: string
  limit?: number
  showFilters?: boolean
}

export function CommissionHistory({
  userId,
  limit = 20,
  showFilters = true,
}: CommissionHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [periodFilter, setPeriodFilter] = useState<string>('all')

  const { calculations, summary, pagination, isLoading, isError } = useCommissionHistory({
    userId,
    limit,
    status: statusFilter === 'all' ? undefined : statusFilter,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading commission history...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load commission history. Please try again.
        </AlertDescription>
      </Alert>
    )
  }

  // Group by month
  const groupedCalculations = calculations?.reduce((acc: any, calc: any) => {
    const monthKey = formatMonthYear(calc.calculation_period_end)
    if (!acc[monthKey]) {
      acc[monthKey] = []
    }
    acc[monthKey].push(calc)
    return acc
  }, {}) || {}

  const months = Object.keys(groupedCalculations).sort().reverse()

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            icon={DollarSign}
            label="Total Earned"
            value={formatCurrency(summary.total_amount)}
            gradient="from-green-500 to-emerald-500"
          />
          <StatCard
            icon={BarChart3}
            label="Calculations"
            value={summary.total_calculations.toString()}
            gradient="from-blue-500 to-cyan-500"
          />
          <StatCard
            icon={Users}
            label="Avg Per Month"
            value={formatCurrency(
              summary.total_calculations > 0
                ? Math.round(summary.total_amount / summary.total_calculations)
                : 0
            )}
            gradient="from-purple-500 to-pink-500"
          />
          <StatCard
            icon={TrendingUp}
            label="This Month"
            value={
              calculations && calculations.length > 0
                ? formatCurrency(calculations[0].total_amount)
                : '£0'
            }
            gradient="from-orange-500 to-red-500"
          />
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3">
              {/* Search */}
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 transition-colors"
              >
                <option value="all">All Status</option>
                <option value="calculated">Calculated</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="paid">Paid</option>
              </select>

              {/* Period Filter */}
              <select
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 transition-colors"
              >
                <option value="all">All Time</option>
                <option value="this-month">This Month</option>
                <option value="last-month">Last Month</option>
                <option value="last-3-months">Last 3 Months</option>
                <option value="last-6-months">Last 6 Months</option>
                <option value="this-year">This Year</option>
              </select>

              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline */}
      {months.length > 0 ? (
        <div className="space-y-8">
          {months.map((month, monthIndex) => {
            const monthCalculations = groupedCalculations[month]
            const monthTotal = monthCalculations.reduce(
              (sum: number, calc: any) => sum + calc.total_amount,
              0
            )

            return (
              <div
                key={month}
                className="animate-in slide-in-from-bottom duration-500"
                style={{ animationDelay: `${monthIndex * 100}ms` }}
              >
                {/* Month Header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                        <Calendar className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{month}</h3>
                        <p className="text-sm text-gray-600">
                          {monthCalculations.length} calculation
                          {monthCalculations.length !== 1 ? 's' : ''} •{' '}
                          <span className="font-semibold text-green-600">
                            {formatCurrency(monthTotal)}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Month trend */}
                  {monthIndex < months.length - 1 && (
                    <MonthTrend
                      current={monthTotal}
                      previous={groupedCalculations[months[monthIndex + 1]]?.reduce(
                        (sum: number, calc: any) => sum + calc.total_amount,
                        0
                      )}
                    />
                  )}
                </div>

                {/* Timeline */}
                <div className="relative pl-8 space-y-4">
                  {/* Timeline line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-purple-200 to-transparent"></div>

                  {monthCalculations.map((calculation: any, calcIndex: number) => (
                    <div
                      key={calculation.id}
                      className="relative animate-in slide-in-from-left duration-300"
                      style={{ animationDelay: `${(monthIndex * 100) + (calcIndex * 50)}ms` }}
                    >
                      {/* Timeline dot */}
                      <div className="absolute -left-[21px] top-6 h-3 w-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border-4 border-white shadow-md"></div>

                      {/* Card */}
                      <CommissionCard
                        calculation={calculation}
                        variant="compact"
                        onClick={() => {
                          window.location.href = `/commissions/${calculation.id}`
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <EmptyState />
      )}

      {/* Pagination */}
      {pagination && pagination.has_more && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" disabled={pagination.offset === 0}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button variant="outline" disabled={!pagination.has_more}>
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  )
}

// Stat card component
function StatCard({
  icon: Icon,
  label,
  value,
  gradient,
}: {
  icon: any
  label: string
  value: string
  gradient: string
}) {
  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div
            className={`h-14 w-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md`}
          >
            <Icon className="h-7 w-7 text-white" />
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">{label}</div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Month trend indicator
function MonthTrend({ current, previous }: { current: number; previous: number }) {
  if (!previous || previous === 0) return null

  const percentChange = ((current - previous) / previous) * 100
  const isPositive = percentChange > 0

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
        isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
      }`}
    >
      {isPositive ? (
        <TrendingUp className="h-4 w-4" />
      ) : (
        <TrendingDown className="h-4 w-4" />
      )}
      <span className="text-sm font-semibold">
        {isPositive ? '+' : ''}
        {percentChange.toFixed(1)}%
      </span>
    </div>
  )
}

// Empty state
function EmptyState() {
  return (
    <Card className="border-2 border-dashed">
      <CardContent className="py-12 text-center">
        <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <Clock className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Commission History</h3>
        <p className="text-gray-600 mb-6">
          Start calculating commissions to see your history here
        </p>
        <Button>Calculate First Commission</Button>
      </CardContent>
    </Card>
  )
}

/**
 * Compact version for sidebar/widgets
 */
export function CommissionHistoryCompact({ userId, limit = 5 }: CommissionHistoryProps) {
  const { calculations, isLoading } = useCommissionHistory({ userId, limit })

  if (isLoading) {
    return <div className="text-center py-4 text-gray-500">Loading...</div>
  }

  if (!calculations || calculations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">No commissions yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {calculations.map((calc: any) => (
        <CommissionCard key={calc.id} calculation={calc} variant="compact" showActions={false} />
      ))}
    </div>
  )
}
