'use client'

import Link from 'next/link'
import { useCommissionHistory } from '@/hooks/useCommissionCalculation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, History, Calculator, ArrowRight, Eye, Mail } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function CommissionsPage() {
  const { calculations, summary, isLoading, isError } = useCommissionHistory({
    limit: 20,
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Commissions</h1>
          <p className="text-gray-600 mt-1">
            View and manage commission calculations
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/commissions/history">
            <Button variant="outline">
              <History className="h-4 w-4 mr-2" />
              Full History
            </Button>
          </Link>
          <Link href="/commissions/calculate">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Calculate Commission
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Calculations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_calculations}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Amount
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.total_amount)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                By Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Object.entries(summary.by_status).map(([status, count]) => (
                  <Badge key={status} variant="secondary">
                    {status}: {count as number}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Calculations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Calculations</CardTitle>
            <Link href="/commissions/history">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-3">Loading calculations...</p>
            </div>
          ) : isError ? (
            <Alert variant="destructive">
              <AlertDescription>
                Failed to load commission calculations. Please try again.
              </AlertDescription>
            </Alert>
          ) : calculations && calculations.length > 0 ? (
            <div className="space-y-3">
              {calculations.map((calc: any) => (
                <div
                  key={calc.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="font-medium">{calc.user?.name || 'Unknown User'}</div>
                      <StatusBadge status={calc.status} />
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {formatDate(calc.calculation_period_start)} -{' '}
                      {formatDate(calc.calculation_period_end)}
                      {' • '}
                      {calc.user?.role && (
                        <Badge variant="outline" className="text-xs">
                          {calc.user.role.replace('_', ' ')}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(calc.total_amount)}
                      </div>
                      <div className="text-xs text-gray-600">
                        Base: {formatCurrency(calc.base_amount || 0)}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/commissions/${calc.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Calculator className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p className="font-medium">No calculations yet</p>
              <p className="text-sm mt-1">
                Calculate your first commission to get started
              </p>
              <Link href="/commissions/calculate">
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Calculate Commission
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/commissions/calculate">
          <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Calculator className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold">Calculate Commission</div>
                  <div className="text-sm text-gray-600">
                    Calculate for specific user and period
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/commission-rules">
          <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <History className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <div className="font-semibold">Manage Rules</div>
                  <div className="text-sm text-gray-600">
                    View and edit commission rules
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, any> = {
    calculated: 'secondary',
    pending: 'warning',
    approved: 'success',
    paid: 'success',
  }

  const labels: Record<string, string> = {
    calculated: 'Calculated',
    pending: 'Pending Approval',
    approved: 'Approved',
    paid: 'Paid',
  }

  return (
    <Badge variant={variants[status] || 'secondary'}>
      {labels[status] || status}
    </Badge>
  )
}
