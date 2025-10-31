import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { childSchema } from '@/lib/validations/child'
import { getAgeGroup } from '@/lib/utils'
import { handleApiError, successResponse, UnauthorizedError } from '@/lib/api-errors'

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

    return successResponse({ children: childrenWithStats })
  } catch (error) {
    return handleApiError(error)
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

    return successResponse({ child }, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
