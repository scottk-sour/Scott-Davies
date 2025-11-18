// @ts-nocheck
import { createServerClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, penceToPounds } from '@/types'
import { commissionCalculator } from '@/lib/commission-calculator'
import { EmptyState } from '@/components/ui/empty-state'

async function getCommissionReport() {
  const supabase = createServerClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) return null

  const { data: user } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', session.user.id)
    .single()

  if (!user) return null

  // Get current month
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  try {
    const summary = await commissionCalculator.getMonthlyCommissionSummary(
      user.organization_id,
      month,
      year
    )

    return summary
  } catch (error) {
    console.error('Error fetching commission report:', error)
    return null
  }
}

export default async function ReportsPage() {
  const report = await getCommissionReport()

  if (!report) {
    return (
      <EmptyState
        icon="📊"
        title="Unable to load commission report"
        description="There was an issue loading your commission data. Please try again later."
        action={{
          label: 'Back to Dashboard',
          href: '/app/dashboard',
        }}
      />
    )
  }

  const currentMonth = new Date().toLocaleString('en-GB', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Commission Report
        </h1>
        <p className="text-gray-600 mt-1">{currentMonth}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600 uppercase tracking-wide">
              Telesales Commissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {formatCurrency(penceToPounds(report.totalTelesalesCommission))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {report.telesales.length} agents
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-orange-500">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600 uppercase tracking-wide">
              BDM Commissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {formatCurrency(penceToPounds(report.totalBDMCommission))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {report.bdms.length} BDMs
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600 uppercase tracking-wide">
              Total Commissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {formatCurrency(penceToPounds(report.totalCommissions))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Payable this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Telesales Breakdown */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Telesales Commissions</CardTitle>
        </CardHeader>
        <CardContent>
          {report.telesales.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No telesales commissions this month</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Agent</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Deals</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Total Profit</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Commission (10%)</th>
                  </tr>
                </thead>
                <tbody>
                  {report.telesales.map((agent) => (
                    <tr key={agent.agentId} className="border-b">
                      <td className="py-3 px-4 font-medium">{agent.agentName}</td>
                      <td className="py-3 px-4 text-right">{agent.dealsCount}</td>
                      <td className="py-3 px-4 text-right">
                        {formatCurrency(penceToPounds(agent.totalProfit))}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-green-600">
                        {formatCurrency(penceToPounds(agent.totalCommission))}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 font-bold">
                    <td className="py-3 px-4">TOTAL</td>
                    <td className="py-3 px-4 text-right">
                      {report.telesales.reduce((sum, a) => sum + a.dealsCount, 0)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {formatCurrency(penceToPounds(report.telesales.reduce((sum, a) => sum + a.totalProfit, 0)))}
                    </td>
                    <td className="py-3 px-4 text-right text-green-600">
                      {formatCurrency(penceToPounds(report.totalTelesalesCommission))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* BDM Breakdown */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">BDM Commissions (Threshold: £3,500)</CardTitle>
        </CardHeader>
        <CardContent>
          {report.bdms.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No BDM commissions this month</p>
          ) : (
            <div className="space-y-6">
              {report.bdms.map((bdm) => (
                <div key={bdm.bdmId} className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">BDM Details</h3>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-gray-600">Deals this month:</span> <span className="font-medium">{bdm.dealsCount}</span></p>
                        <p><span className="text-gray-600">Monthly profit:</span> <span className="font-medium">{formatCurrency(penceToPounds(bdm.monthlyProfit))}</span></p>
                        <p><span className="text-gray-600">Previous carryover:</span> <span className="font-medium">{formatCurrency(penceToPounds(bdm.previousCarryover))}</span></p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg mb-2">Commission Calculation</h3>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-gray-600">Cumulative amount:</span> <span className="font-bold">{formatCurrency(penceToPounds(bdm.cumulativeAmount))}</span></p>
                        <p><span className="text-gray-600">Threshold (£3,500):</span> <span className={bdm.thresholdMet ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>{bdm.thresholdMet ? '✅ MET' : '❌ NOT MET'}</span></p>
                        {bdm.thresholdMet ? (
                          <p className="text-lg"><span className="text-gray-600">Commission payable:</span> <span className="font-bold text-green-600">{formatCurrency(penceToPounds(bdm.bdmCommission))}</span></p>
                        ) : (
                          <p><span className="text-gray-600">Shortfall carrying forward:</span> <span className="font-medium text-orange-600">{formatCurrency(penceToPounds(bdm.carryoverToNext))}</span></p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
