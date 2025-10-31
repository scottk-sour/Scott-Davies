import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/stories - List published stories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ageGroup = searchParams.get('ageGroup')
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')

    const stories = await prisma.story.findMany({
      where: {
        status: 'PUBLISHED',
        ...(ageGroup && { ageGroup: { has: ageGroup } }),
        ...(category && { category }),
        ...(featured === 'true' && { featured: true }),
      },
      select: {
        id: true,
        title: true,
        subtitle: true,
        description: true,
        coverImage: true,
        ageGroup: true,
        category: true,
        therapeuticThemes: true,
        traumaTopics: true,
        contentWarnings: true,
        healingGoals: true,
        duration: true,
        featured: true,
        freeForCareChildren: true,
        slug: true,
        author: true,
        playCount: true,
        averageRating: true,
      },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json({ stories })
  } catch (error) {
    console.error('GET /api/stories error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stories' },
      { status: 500 }
    )
  }
}
