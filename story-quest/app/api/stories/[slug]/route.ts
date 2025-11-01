import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/stories/:slug - Get single story
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const story = await prisma.story.findUnique({
      where: {
        slug,
        status: 'PUBLISHED',
      },
      include: {
        conversationGuides: true,
      },
    })

    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 })
    }

    // Increment play count
    await prisma.story.update({
      where: { id: story.id },
      data: { playCount: { increment: 1 } },
    })

    return NextResponse.json({ story })
  } catch (error) {
    console.error('GET /api/stories/:slug error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch story' },
      { status: 500 }
    )
  }
}
