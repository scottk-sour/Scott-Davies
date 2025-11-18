// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createRouteClient } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    const { userId, email, name, companyName } = await request.json()

    if (!userId || !email || !name || !companyName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = createRouteClient()

    // Create organization slug from company name
    const slug = companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    // Create organization
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: companyName,
        slug: slug + '-' + Math.random().toString(36).substring(7), // Add random suffix to ensure uniqueness
        plan: 'starter',
        subscription_status: 'trialing',
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days trial
      })
      .select()
      .single()

    if (orgError) {
      console.error('Error creating organization:', orgError)
      return NextResponse.json(
        { error: 'Failed to create organization' },
        { status: 500 }
      )
    }

    // Create user in our users table
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: userId,
        organization_id: organization.id,
        email,
        name,
        role: 'admin', // First user is always admin
        active: true,
      })

    if (userError) {
      console.error('Error creating user:', userError)

      // Clean up organization if user creation fails
      await supabase.from('organizations').delete().eq('id', organization.id)

      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      organization: {
        id: organization.id,
        name: organization.name,
      },
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
