// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase/client'
import { poundsToPence } from '@/types'
import { commissionCalculator } from '@/lib/commission-calculator'

// GET /api/deals/[id] - Get a specific deal
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: user } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', session.user.id)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { data: deal, error } = await supabase
      .from('deals')
      .select(`
        *,
        telesales_agent:users!deals_telesales_agent_id_fkey(id, name),
        bdm:users!deals_bdm_id_fkey(id, name)
      `)
      .eq('id', params.id)
      .eq('organization_id', user.organization_id)
      .single()

    if (error || !deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    return NextResponse.json({ deal })
  } catch (error) {
    console.error('Get deal error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/deals/[id] - Update a deal
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: user } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', session.user.id)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get existing deal
    const { data: existingDeal } = await supabase
      .from('deals')
      .select('*')
      .eq('id', params.id)
      .eq('organization_id', user.organization_id)
      .single()

    if (!existingDeal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    const body = await request.json()
    const updateData: any = {}

    // Handle financial updates
    if (
      body.dealValue !== undefined ||
      body.buyInCost !== undefined ||
      body.installationCost !== undefined ||
      body.miscCosts !== undefined
    ) {
      const dealValue = body.dealValue !== undefined ? poundsToPence(body.dealValue) : existingDeal.deal_value
      const buyInCost = body.buyInCost !== undefined ? poundsToPence(body.buyInCost) : existingDeal.buy_in_cost
      const installationCost = body.installationCost !== undefined ? poundsToPence(body.installationCost) : existingDeal.installation_cost
      const miscCosts = body.miscCosts !== undefined ? poundsToPence(body.miscCosts) : existingDeal.misc_costs

      const initialProfit = dealValue - buyInCost - installationCost - miscCosts
      const telesalesCommission = Math.round(initialProfit * 0.1)
      const remainingProfit = initialProfit - telesalesCommission

      if (initialProfit < 0) {
        return NextResponse.json(
          { error: 'Costs cannot exceed deal value' },
          { status: 400 }
        )
      }

      updateData.deal_value = dealValue
      updateData.buy_in_cost = buyInCost
      updateData.installation_cost = installationCost
      updateData.misc_costs = miscCosts
      updateData.initial_profit = initialProfit
      updateData.telesales_commission = telesalesCommission
      updateData.remaining_profit = remainingProfit
    }

    // Handle status update
    if (body.status !== undefined && body.status !== existingDeal.status) {
      updateData.status = body.status

      const now = new Date().toISOString()

      switch (body.status) {
        case 'signed':
          updateData.month_signed = updateData.month_signed || now
          break
        case 'installed':
          updateData.month_installed = updateData.month_installed || now
          break
        case 'invoiced':
          updateData.month_invoiced = updateData.month_invoiced || now
          break
        case 'paid':
          updateData.month_paid = body.monthPaid || now

          // CRITICAL: Recalculate commissions when deal is marked as paid
          setTimeout(async () => {
            try {
              await commissionCalculator.recalculateOnDealPaid(params.id, session.user.id)
            } catch (err) {
              console.error('Failed to recalculate commissions:', err)
            }
          }, 100)
          break
      }
    }

    // Other fields
    if (body.customerName !== undefined) updateData.customer_name = body.customerName
    if (body.telesalesAgentId !== undefined) updateData.telesales_agent_id = body.telesalesAgentId
    if (body.bdmId !== undefined) updateData.bdm_id = body.bdmId
    if (body.notes !== undefined) updateData.notes = body.notes

    // Update deal
    const { data: deal, error } = await supabase
      .from('deals')
      .update(updateData)
      .eq('id', params.id)
      .eq('organization_id', user.organization_id)
      .select(`
        *,
        telesales_agent:users!deals_telesales_agent_id_fkey(id, name),
        bdm:users!deals_bdm_id_fkey(id, name)
      `)
      .single()

    if (error) {
      console.error('Error updating deal:', error)
      return NextResponse.json({ error: 'Failed to update deal' }, { status: 500 })
    }

    return NextResponse.json({ deal })
  } catch (error) {
    console.error('Update deal error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/deals/[id] - Delete a deal
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: user } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', session.user.id)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { error } = await supabase
      .from('deals')
      .delete()
      .eq('id', params.id)
      .eq('organization_id', user.organization_id)

    if (error) {
      console.error('Error deleting deal:', error)
      return NextResponse.json({ error: 'Failed to delete deal' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete deal error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
