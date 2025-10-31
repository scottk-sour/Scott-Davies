import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { updateChildSchema } from '@/lib/validations/child'
import { z } from 'zod'

// GET /api/children/:id - Get single child
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth()

    const child = await prisma.child.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        readingSessions: {
          include: {
            story: {
              select: {
                id: true,
                title: true,
                coverImage: true,
              },
            },
          },
          orderBy: { startedAt: 'desc' },
          take: 10,
        },
        quizResults: {
          orderBy: { completedAt: 'desc' },
          take: 5,
        },
        achievements: {
          include: {
            achievement: true,
          },
        },
      },
    })

    if (!child) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 })
    }

    return NextResponse.json({ child })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.error('GET /api/children/:id error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch child' },
      { status: 500 }
    )
  }
}

// PATCH /api/children/:id - Update child
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth()

    // Verify ownership
    const existing = await prisma.child.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 })
    }

    const body = await request.json()
    const validated = updateChildSchema.parse(body)

    const child = await prisma.child.update({
      where: { id: params.id },
      data: validated,
      select: {
        id: true,
        name: true,
        age: true,
        avatar: true,
        ageGroup: true,
        careStatus: true,
        careStatusVerified: true,
      },
    })

    return NextResponse.json({ child })
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

    console.error('PATCH /api/children/:id error:', error)
    return NextResponse.json(
      { error: 'Failed to update child' },
      { status: 500 }
    )
  }
}

// DELETE /api/children/:id - Delete child
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth()

    // Verify ownership
    const existing = await prisma.child.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 })
    }

    await prisma.child.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.error('DELETE /api/children/:id error:', error)
    return NextResponse.json(
      { error: 'Failed to delete child' },
      { status: 500 }
    )
  }
}
