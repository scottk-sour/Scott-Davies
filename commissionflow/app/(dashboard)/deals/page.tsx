// @ts-nocheck
import { createServerClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, penceToPounds, DEAL_STATUS_CONFIG } from '@/types'
import { EmptyState } from '@/components/ui/empty-state'
import Link from 'next/link'

async function getDeals() {
  const supabase = createServerClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) return []

  const { data: user } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', session.user.id)
    .single()

  if (!user) return []

  const { data: deals } = await supabase
    .from('deals')
    .select(`
      *,
      telesales_agent:users!deals_telesales_agent_id_fkey(id, name),
      bdm:users!deals_bdm_id_fkey(id, name)
    `)
    .eq('organization_id', user.organization_id)
    .order('created_at', { ascending: false })
    .limit(50)

  return deals || []
}

export default async function DealsPage() {
  const deals = await getDeals()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Deals
          </h1>
          <p className="text-gray-600 mt-1">Manage your sales pipeline</p>
        </div>
        <Link href="/deals/new">
          <Button size="lg" className="shadow-md hover:shadow-lg transition-shadow">
            + Add New Deal
          </Button>
        </Link>
      </div>

      {/* Deals Table */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">All Deals</CardTitle>
        </CardHeader>
        <CardContent>
          {deals.length === 0 ? (
            <EmptyState
              icon="💼"
              title="No deals yet"
              description="Get started by creating your first deal to track commissions and pipeline progress."
              action={{
                label: '+ Add New Deal',
                href: '/app/deals/new',
              }}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Deal #</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Customer</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Value</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Profit</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Telesales</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">BDM</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deals.map((deal: any) => (
                    <tr key={deal.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-sm">{deal.deal_number}</td>
                      <td className="py-3 px-4">{deal.customer_name}</td>
                      <td className="py-3 px-4 font-semibold">
                        {formatCurrency(penceToPounds(deal.deal_value))}
                      </td>
                      <td className="py-3 px-4 text-green-600 font-semibold">
                        {formatCurrency(penceToPounds(deal.initial_profit))}
                      </td>
                      <td className="py-3 px-4 text-sm">{deal.telesales_agent?.name}</td>
                      <td className="py-3 px-4 text-sm">{deal.bdm?.name}</td>
                      <td className="py-3 px-4">
                        <Badge
                          className={DEAL_STATUS_CONFIG[deal.status as keyof typeof DEAL_STATUS_CONFIG].color}
                        >
                          {DEAL_STATUS_CONFIG[deal.status as keyof typeof DEAL_STATUS_CONFIG].label}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Link href={`/app/deals/${deal.id}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
