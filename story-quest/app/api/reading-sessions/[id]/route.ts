import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { updateSessionSchema, completeSessionSchema } from '@/lib/validations/story'
import { z } from 'zod'

// PATCH /api/reading-sessions/:id - Update session progress
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth()

    // Verify session belongs to user
    const readingSession = await prisma.readingSession.findFirst({
      where: {
        id: params.id,
        child: {
          userId: session.user.id,
        },
      },
    })

    if (!readingSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const body = await request.json()
    const validated = updateSessionSchema.parse(body)

    // Update session
    const updated = await prisma.readingSession.update({
      where: { id: params.id },
      data: {
        choicesMade: validated.choicesMade,
        nodesVisited: validated.nodesVisited,
      },
    })

    return NextResponse.json({ session: updated })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('PATCH /api/reading-sessions/:id error:', error)
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    )
  }
}

// POST /api/reading-sessions/:id/complete - Complete session
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth()

    // Verify session belongs to user
    const readingSession = await prisma.readingSession.findFirst({
      where: {
        id: params.id,
        child: {
          userId: session.user.id,
        },
      },
      include: {
        child: true,
      },
    })

    if (!readingSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const body = await request.json()
    const validated = completeSessionSchema.parse(body)

    // Calculate duration
    const duration = Math.floor(
      (new Date().getTime() - readingSession.startedAt.getTime()) / 1000
    )

    // Complete session
    const completed = await prisma.readingSession.update({
      where: { id: params.id },
      data: {
        completedAt: new Date(),
        duration,
        endingReached: validated.endingReached,
        emotionalResponse: validated.emotionalResponse,
        helpfulRating: validated.helpfulRating,
      },
    })

    // Check for achievements (simplified - can be expanded)
    const completedCount = await prisma.readingSession.count({
      where: {
        childId: readingSession.childId,
        completedAt: { not: null },
      },
    })

    // Award "First Story" achievement
    if (completedCount === 1) {
      const firstStoryAchievement = await prisma.achievement.findFirst({
        where: { name: 'First Story' },
      })

      if (firstStoryAchievement) {
        await prisma.childAchievement.create({
          data: {
            childId: readingSession.childId,
            achievementId: firstStoryAchievement.id,
          },
        })
      }
    }

    return NextResponse.json({ session: completed })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('POST /api/reading-sessions/:id/complete error:', error)
    return NextResponse.json(
      { error: 'Failed to complete session' },
      { status: 500 }
    )
  }
}
