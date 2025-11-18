// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase/client'
import { poundsToPence } from '@/types'
import { commissionCalculator } from '@/lib/commission-calculator'

// GET /api/deals - List all deals for organization
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization
    const { data: user } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', session.user.id)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let query = supabase
      .from('deals')
      .select(`
        *,
        telesales_agent:users!deals_telesales_agent_id_fkey(id, name),
        bdm:users!deals_bdm_id_fkey(id, name)
      `)
      .eq('organization_id', user.organization_id)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data: deals, error } = await query

    if (error) {
      console.error('Error fetching deals:', error)
      return NextResponse.json({ error: 'Failed to fetch deals' }, { status: 500 })
    }

    return NextResponse.json({ deals })
  } catch (error) {
    console.error('Deals API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/deals - Create a new deal
export async function POST(request: NextRequest) {
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

    const body = await request.json()

    // Convert pounds to pence
    const dealValue = poundsToPence(body.dealValue)
    const buyInCost = poundsToPence(body.buyInCost)
    const installationCost = poundsToPence(body.installationCost)
    const miscCosts = poundsToPence(body.miscCosts || 0)

    // Calculate commissions
    const initialProfit = dealValue - buyInCost - installationCost - miscCosts
    const telesalesCommission = Math.round(initialProfit * 0.1)
    const remainingProfit = initialProfit - telesalesCommission

    // Validate
    if (initialProfit < 0) {
      return NextResponse.json(
        { error: 'Costs cannot exceed deal value' },
        { status: 400 }
      )
    }

    // Create deal
    const { data: deal, error } = await supabase
      .from('deals')
      .insert({
        organization_id: user.organization_id,
        customer_name: body.customerName,
        deal_value: dealValue,
        buy_in_cost: buyInCost,
        installation_cost: installationCost,
        misc_costs: miscCosts,
        initial_profit: initialProfit,
        telesales_commission: telesalesCommission,
        remaining_profit: remainingProfit,
        telesales_agent_id: body.telesalesAgentId,
        bdm_id: body.bdmId,
        status: body.status || 'to_do',
        notes: body.notes,
        created_by: session.user.id,
      })
      .select(`
        *,
        telesales_agent:users!deals_telesales_agent_id_fkey(id, name),
        bdm:users!deals_bdm_id_fkey(id, name)
      `)
      .single()

    if (error) {
      console.error('Error creating deal:', error)
      return NextResponse.json({ error: 'Failed to create deal' }, { status: 500 })
    }

    return NextResponse.json({ deal }, { status: 201 })
  } catch (error) {
    console.error('Create deal error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
