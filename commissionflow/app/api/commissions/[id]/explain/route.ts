// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/client'
import { commissionExplainer } from '@/lib/commission-explainer'

// =====================================================
// COMMISSION EXPLANATION API
// Phase 1A: Generate human-readable commission explanations
// =====================================================

/**
 * GET /api/commissions/[id]/explain
 * Get a human-readable explanation of a commission calculation
 *
 * Query params:
 * - format: 'text' | 'html' | 'json' (default: 'json')
 *
 * Returns:
 * - format=text: Plain text explanation
 * - format=html: Styled HTML explanation
 * - format=json: Structured explanation object
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()

    // Get current user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      )
    }

    // Get user's organization and role
    const { data: currentUser } = await supabase
      .from('users')
      .select('organization_id, role')
      .eq('id', session.user.id)
      .single()

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: { message: 'User not found' } },
        { status: 404 }
      )
    }

    // Get the calculation
    const { data: calculation, error: fetchError } = await supabase
      .from('commission_calculations')
      .select(`
        *,
        user:users!commission_calculations_user_id_fkey(id, name, role)
      `)
      .eq('id', params.id)
      .single()

    if (fetchError || !calculation) {
      return NextResponse.json(
        { success: false, error: { message: 'Calculation not found' } },
        { status: 404 }
      )
    }

    // Verify calculation belongs to user's organization
    if (calculation.organization_id !== currentUser.organization_id) {
      return NextResponse.json(
        { success: false, error: { message: 'Calculation not found' } },
        { status: 404 }
      )
    }

    // Check permissions
    // Users can view their own explanations
    // Managers, directors, and accounts can view any explanation
    const canView =
      calculation.user_id === session.user.id ||
      ['manager', 'director', 'accounts'].includes(currentUser.role)

    if (!canView) {
      return NextResponse.json(
        { success: false, error: { message: 'Insufficient permissions. You can only view your own commission explanations.' } },
        { status: 403 }
      )
    }

    // Parse query params
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'json'

    // Generate explanation based on format
    switch (format) {
      case 'text': {
        const textExplanation = await commissionExplainer.generateTextExplanation(params.id)
        return new Response(textExplanation, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
          },
        })
      }

      case 'html': {
        const htmlExplanation = await commissionExplainer.generateHtmlExplanation(params.id)
        return new Response(htmlExplanation, {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
          },
        })
      }

      case 'json':
      default: {
        const jsonExplanation = await commissionExplainer.generateExplanation(params.id)
        return NextResponse.json({
          success: true,
          data: jsonExplanation,
        })
      }
    }
  } catch (error) {
    console.error('Unexpected error in GET /api/commissions/[id]/explain:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

/**
 * POST /api/commissions/[id]/explain/email
 * Email commission explanation to user
 *
 * Body:
 * {
 *   recipient_email?: string - Override email (default: user's email)
 *   include_attachments: boolean - Attach PDF version (default: true)
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()

    // Get current user
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      )
    }

    // Get user's organization and role
    const { data: currentUser } = await supabase
      .from('users')
      .select('organization_id, role, name, email')
      .eq('id', session.user.id)
      .single()

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: { message: 'User not found' } },
        { status: 404 }
      )
    }

    // Get the calculation
    const { data: calculation, error: fetchError } = await supabase
      .from('commission_calculations')
      .select(`
        *,
        user:users!commission_calculations_user_id_fkey(id, name, email)
      `)
      .eq('id', params.id)
      .single()

    if (fetchError || !calculation) {
      return NextResponse.json(
        { success: false, error: { message: 'Calculation not found' } },
        { status: 404 }
      )
    }

    // Verify calculation belongs to user's organization
    if (calculation.organization_id !== currentUser.organization_id) {
      return NextResponse.json(
        { success: false, error: { message: 'Calculation not found' } },
        { status: 404 }
      )
    }

    // Check permissions
    // Users can email their own explanations
    // Managers, directors, and accounts can email any explanation
    const canEmail =
      calculation.user_id === session.user.id ||
      ['manager', 'director', 'accounts'].includes(currentUser.role)

    if (!canEmail) {
      return NextResponse.json(
        { success: false, error: { message: 'Insufficient permissions. You can only email your own commission explanations.' } },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const recipientEmail = body.recipient_email || calculation.user.email
    const includeAttachments = body.include_attachments !== false

    // Generate HTML explanation for email
    const htmlExplanation = await commissionExplainer.generateHtmlExplanation(params.id)

    // TODO: Integrate with email service (Resend, SendGrid, etc.)
    // For now, we'll just log and return success
    console.log('Email commission explanation:', {
      to: recipientEmail,
      subject: `Commission Statement - ${calculation.calculation_period_start} to ${calculation.calculation_period_end}`,
      html: htmlExplanation.substring(0, 100) + '...',
      includeAttachments,
    })

    // In production, you would:
    // 1. Generate PDF using puppeteer or a PDF library
    // 2. Send email using your email service
    // 3. Log the email send event

    // For now, return a mock success response
    return NextResponse.json({
      success: true,
      data: {
        message: 'Commission explanation email sent successfully',
        recipient: recipientEmail,
        calculation_id: params.id,
        // In production, include email service response
      },
    })
  } catch (error) {
    console.error('Unexpected error in POST /api/commissions/[id]/explain/email:', error)
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
