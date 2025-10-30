import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { startOfDay, addDays } from 'date-fns'

const completeOnboardingSchema = z.object({
  createSampleData: z.boolean().default(false),
})

// POST /api/user/onboarding - Mark onboarding as complete
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { createSampleData } = completeOnboardingSchema.parse(body)

    // Mark onboarding as complete
    await prisma.user.update({
      where: { id: session.user.id },
      data: { onboardingCompleted: true },
    })

    // TODO: Create sample Etsy data (products, orders) when requested
    // For now, skip sample data creation as the old CEO schema has been removed
    if (createSampleData) {
      // Sample data creation will be implemented with Etsy-specific data
      console.log('Sample data creation requested but not yet implemented for Etsy schema')
    }

    return NextResponse.json({
      success: true,
      message: 'Onboarding completed',
      sampleDataCreated: createSampleData,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error completing onboarding:', error)
    return NextResponse.json({ error: 'Failed to complete onboarding' }, { status: 500 })
  }
}
