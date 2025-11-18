// @ts-nocheck
import { createServerClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, penceToPounds, Deal } from '@/types'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

async function getDashboardData() {
  const supabase = createServerClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) return null

  const { data: user } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', session.user.id)
    .single<{ organization_id: string }>()

  if (!user || !user.organization_id) return null

  // Get current month deals
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

  // Get paid deals this month
  const { data: paidDeals } = await supabase
    .from('deals')
    .select('*')
    .eq('organization_id', user.organization_id)
    .eq('status', 'paid')
    .gte('month_paid', monthStart.toISOString())
    .lte('month_paid', monthEnd.toISOString())
    .returns<Deal[]>()

  // Get all deals by status
  const { data: allDeals } = await supabase
    .from('deals')
    .select('status')
    .eq('organization_id', user.organization_id)
    .returns<Pick<Deal, 'status'>[]>()

  // Calculate metrics
  const totalRevenue = paidDeals?.reduce((sum, deal) => sum + deal.deal_value, 0) || 0
  const totalProfit = paidDeals?.reduce((sum, deal) => sum + deal.initial_profit, 0) || 0
  const totalCommissions = paidDeals?.reduce(
    (sum, deal) => sum + deal.telesales_commission + deal.remaining_profit,
    0
  ) || 0

  // Count deals by status
  const dealsByStatus = allDeals?.reduce((acc: any, deal) => {
    acc[deal.status] = (acc[deal.status] || 0) + 1
    return acc
  }, {})

  return {
    totalRevenue,
    totalProfit,
    totalCommissions,
    paidDealsCount: paidDeals?.length || 0,
    dealsByStatus: dealsByStatus || {},
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  if (!data) {
    return <div>Loading...</div>
  }

  const currentMonth = new Date().toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Overview for {currentMonth}</p>
        </div>
        <Link href="/deals/new">
          <Button size="lg" className="shadow-md hover:shadow-lg transition-shadow">
            + Add New Deal
          </Button>
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(penceToPounds(data.totalRevenue))}
          subtitle="Paid this month"
        />
        <MetricCard
          title="Total Profit"
          value={formatCurrency(penceToPounds(data.totalProfit))}
          subtitle="From paid deals"
        />
        <MetricCard
          title="Commissions Due"
          value={formatCurrency(penceToPounds(data.totalCommissions))}
          subtitle="Telesales + BDM"
        />
        <MetricCard
          title="Deals Paid"
          value={data.paidDealsCount.toString()}
          subtitle="This month"
        />
      </div>

      {/* Pipeline Overview */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Deal Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <PipelineStatus status="to_do" count={data.dealsByStatus.to_do || 0} />
            <PipelineStatus status="done" count={data.dealsByStatus.done || 0} />
            <PipelineStatus status="signed" count={data.dealsByStatus.signed || 0} />
            <PipelineStatus status="installed" count={data.dealsByStatus.installed || 0} />
            <PipelineStatus status="invoiced" count={data.dealsByStatus.invoiced || 0} />
            <PipelineStatus status="paid" count={data.dealsByStatus.paid || 0} />
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href="/deals">
            <Button variant="outline">View All Deals</Button>
          </Link>
          <Link href="/reports">
            <Button variant="outline">Generate Commission Report</Button>
          </Link>
          <Link href="/team">
            <Button variant="outline">Manage Team</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

function MetricCard({
  title,
  value,
  subtitle,
}: {
  title: string
  value: string
  subtitle: string
}) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-primary">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 uppercase tracking-wide">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-gray-900">{value}</div>
        <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
      </CardContent>
    </Card>
  )
}

function PipelineStatus({ status, count }: { status: string; count: number }) {
  const statusConfig: Record<string, { label: string; color: string }> = {
    to_do: { label: 'To Do', color: 'bg-gray-100 text-gray-800' },
    done: { label: 'Done', color: 'bg-yellow-100 text-yellow-800' },
    signed: { label: 'Signed', color: 'bg-blue-100 text-blue-800' },
    installed: { label: 'Installed', color: 'bg-green-100 text-green-800' },
    invoiced: { label: 'Invoiced', color: 'bg-orange-100 text-orange-800' },
    paid: { label: 'Paid', color: 'bg-emerald-100 text-emerald-800' },
  }

  const config = (statusConfig[status] || statusConfig.to_do) as { label: string; color: string }

  return (
    <div className="text-center">
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${config.color} mb-2`}>
        <span className="text-lg font-bold">{count}</span>
      </div>
      <p className="text-sm font-medium text-gray-700">{config.label}</p>
    </div>
  )
}
