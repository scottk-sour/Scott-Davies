// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCurrency } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'

export default function NewDealPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [users, setUsers] = useState<any[]>([])

  const [formData, setFormData] = useState({
    customerName: '',
    dealValue: '',
    buyInCost: '',
    installationCost: '',
    miscCosts: '0',
    telesalesAgentId: '',
    bdmId: '',
    notes: '',
  })

  // Calculated values
  const dealValue = parseFloat(formData.dealValue) || 0
  const buyInCost = parseFloat(formData.buyInCost) || 0
  const installationCost = parseFloat(formData.installationCost) || 0
  const miscCosts = parseFloat(formData.miscCosts) || 0

  const initialProfit = dealValue - buyInCost - installationCost - miscCosts
  const telesalesCommission = initialProfit * 0.1
  const remainingProfit = initialProfit - telesalesCommission

  // Load users
  useEffect(() => {
    async function loadUsers() {
      const supabase = createClient()

      const { data: session } = await supabase.auth.getSession()
      if (!session.data.session) return

      const { data: currentUser } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', session.data.session.user.id)
        .single()

      if (!currentUser) return

      const { data } = await supabase
        .from('users')
        .select('id, name, role')
        .eq('organization_id', currentUser.organization_id)
        .eq('active', true)
        .order('name')

      setUsers(data || [])
    }

    loadUsers()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (initialProfit < 0) {
      setError('Costs cannot exceed deal value')
      setLoading(false)
      return
    }

    if (!formData.telesalesAgentId || !formData.bdmId) {
      setError('Please select both a telesales agent and BDM')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.customerName,
          dealValue,
          buyInCost,
          installationCost,
          miscCosts,
          telesalesAgentId: formData.telesalesAgentId,
          bdmId: formData.bdmId,
          notes: formData.notes,
          status: 'to_do',
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create deal')
      }

      toast({
        variant: 'success',
        title: 'Deal created!',
        description: `${formData.customerName} has been added successfully.`,
      })

      router.push('/deals')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      toast({
        variant: 'destructive',
        title: 'Error creating deal',
        description: err.message,
      })
      setLoading(false)
    }
  }

  const telesalesAgents = users.filter(u => u.role === 'telesales')
  const bdms = users.filter(u => u.role === 'bdm')

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Add New Deal
        </h1>
        <p className="text-gray-600 mt-1">Enter deal details to calculate commissions automatically</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Customer Info */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  required
                  disabled={loading}
                  placeholder="Acme Ltd"
                />
              </div>
            </CardContent>
          </Card>

          {/* Financial Info */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">💰 Financial Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dealValue">Deal Value (£) *</Label>
                  <Input
                    id="dealValue"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.dealValue}
                    onChange={(e) => setFormData({ ...formData, dealValue: e.target.value })}
                    required
                    disabled={loading}
                    placeholder="15000"
                  />
                </div>

                <div>
                  <Label htmlFor="buyInCost">Buy-in Cost (£) *</Label>
                  <Input
                    id="buyInCost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.buyInCost}
                    onChange={(e) => setFormData({ ...formData, buyInCost: e.target.value })}
                    required
                    disabled={loading}
                    placeholder="8000"
                  />
                </div>

                <div>
                  <Label htmlFor="installationCost">Installation Cost (£) *</Label>
                  <Input
                    id="installationCost"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.installationCost}
                    onChange={(e) => setFormData({ ...formData, installationCost: e.target.value })}
                    required
                    disabled={loading}
                    placeholder="2000"
                  />
                </div>

                <div>
                  <Label htmlFor="miscCosts">Misc Costs (£)</Label>
                  <Input
                    id="miscCosts"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.miscCosts}
                    onChange={(e) => setFormData({ ...formData, miscCosts: e.target.value })}
                    disabled={loading}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Calculated Values */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-3">Calculated Commissions</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-blue-700">Initial Profit</p>
                    <p className="text-lg font-bold text-blue-900">
                      {formatCurrency(initialProfit)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-700">Telesales (10%)</p>
                    <p className="text-lg font-bold text-blue-900">
                      {formatCurrency(telesalesCommission)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-700">Remaining (BDM Pool)</p>
                    <p className="text-lg font-bold text-blue-900">
                      {formatCurrency(remainingProfit)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team Assignment */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">👥 Team Assignment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telesalesAgentId">Telesales Agent *</Label>
                  <select
                    id="telesalesAgentId"
                    value={formData.telesalesAgentId}
                    onChange={(e) => setFormData({ ...formData, telesalesAgentId: e.target.value })}
                    required
                    disabled={loading}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select telesales agent</option>
                    {telesalesAgents.map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="bdmId">BDM *</Label>
                  <select
                    id="bdmId"
                    value={formData.bdmId}
                    onChange={(e) => setFormData({ ...formData, bdmId: e.target.value })}
                    required
                    disabled={loading}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select BDM</option>
                    {bdms.map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  disabled={loading}
                  rows={3}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Any additional notes about this deal..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="shadow-md hover:shadow-lg transition-shadow"
            >
              {loading ? 'Creating...' : 'Create Deal'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
