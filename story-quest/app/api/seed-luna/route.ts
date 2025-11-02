import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import storyData from '@/prisma/seed-story-luna-makes-friends.json'

export async function POST() {
  try {
    console.log('🌱 Starting seed for Luna Makes New Friends...')

    // Create the story
    console.log('Creating story...')
    const story = await prisma.story.upsert({
      where: { slug: storyData.story.slug },
      update: {
        title: storyData.story.title,
        subtitle: storyData.story.subtitle,
        description: storyData.story.description,
        coverImage: storyData.story.coverImage,
        content: storyData.story.content as any,
      },
      create: {
        title: storyData.story.title,
        subtitle: storyData.story.subtitle,
        description: storyData.story.description,
        coverImage: storyData.story.coverImage,
        slug: storyData.story.slug,
        author: storyData.story.author,
        illustrator: storyData.story.illustrator,
        narrator: storyData.story.narrator,
        reviewedBy: storyData.story.reviewedBy,
        ageGroup: storyData.story.ageGroup,
        category: storyData.story.category as any,
        duration: storyData.story.duration,
        wordCount: storyData.story.wordCount,
        therapeuticThemes: storyData.story.therapeuticThemes,
        traumaTopics: storyData.story.traumaTopics,
        contentWarnings: storyData.story.contentWarnings,
        healingGoals: storyData.story.healingGoals,
        professionalGuidance: storyData.story.professionalGuidance,
        content: storyData.story.content as any,
        audioFiles: {},
        status: storyData.story.status as any,
        featured: storyData.story.featured,
        freeForCareChildren: storyData.story.freeForCareChildren,
        vocabulary: [],
        emotionalSkills: [],
        copingStrategies: [],
        publishedAt: new Date(),
      },
    })
    console.log(`✅ Created story: ${story.title}`)

    // Create conversation guides
    console.log('Creating conversation guides...')

    // Delete existing guides for this story
    await prisma.conversationGuide.deleteMany({
      where: { storyId: story.id }
    })

    const guides = await Promise.all(
      storyData.story.conversationGuides.map((guide) =>
        prisma.conversationGuide.create({
          data: {
            storyId: story.id,
            title: guide.title,
            section: guide.section,
            questions: guide.questions,
            activities: guide.activities || [],
            observations: guide.observations || [],
            responses: {},
          },
        })
      )
    )
    console.log(`✅ Created ${guides.length} conversation guides`)

    return NextResponse.json({
      success: true,
      message: `Story "${story.title}" has been added to the database!`,
      story: {
        id: story.id,
        title: story.title,
        slug: story.slug,
      },
      guides: guides.length
    })
  } catch (error: any) {
    console.error('❌ Seed failed:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
