import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { childSchema } from '@/lib/validations/child'
import { z } from 'zod'
import { getAgeGroup } from '@/lib/utils'

// GET /api/children - List all children for current user
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth()

    const children = await prisma.child.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        age: true,
        avatar: true,
        ageGroup: true,
        careStatus: true,
        careStatusVerified: true,
        createdAt: true,
        readingSessions: {
          where: { completedAt: { not: null } },
          select: { id: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Add reading stats
    const childrenWithStats = children.map((child) => ({
      ...child,
      storiesCompleted: child.readingSessions.length,
      readingSessions: undefined, // Remove from response
    }))

    return NextResponse.json({ children: childrenWithStats })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.error('GET /api/children error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch children' },
      { status: 500 }
    )
  }
}

// POST /api/children - Create new child
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()

    const body = await request.json()
    const validated = childSchema.parse(body)

    // Auto-determine age group if not provided
    const ageGroup = validated.ageGroup || getAgeGroup(validated.age)

    const child = await prisma.child.create({
      data: {
        ...validated,
        ageGroup,
        userId: session.user.id,
        careStatusVerified: false, // Needs verification
      },
      select: {
        id: true,
        name: true,
        age: true,
        avatar: true,
        ageGroup: true,
        careStatus: true,
        careStatusVerified: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ child }, { status: 201 })
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

    console.error('POST /api/children error:', error)
    return NextResponse.json(
      { error: 'Failed to create child' },
      { status: 500 }
    )
  }
}
