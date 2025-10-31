import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { startSessionSchema } from '@/lib/validations/story'
import { z } from 'zod'

// POST /api/reading-sessions - Start new reading session
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()

    const body = await request.json()
    const validated = startSessionSchema.parse(body)

    // Verify child belongs to user
    const child = await prisma.child.findFirst({
      where: {
        id: validated.childId,
        userId: session.user.id,
      },
    })

    if (!child) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 })
    }

    // Verify story exists
    const story = await prisma.story.findUnique({
      where: { id: validated.storyId },
    })

    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 })
    }

    // Create reading session
    const readingSession = await prisma.readingSession.create({
      data: {
        childId: validated.childId,
        storyId: validated.storyId,
        choicesMade: [],
        nodesVisited: ['start'], // Start with first node
      },
      include: {
        story: {
          select: {
            id: true,
            title: true,
            content: true,
            audioFiles: true,
          },
        },
      },
    })

    return NextResponse.json({ session: readingSession }, { status: 201 })
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

    console.error('POST /api/reading-sessions error:', error)
    return NextResponse.json(
      { error: 'Failed to start session' },
      { status: 500 }
    )
  }
}
