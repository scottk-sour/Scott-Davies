import { PrismaClient } from '@prisma/client'
import storyData from './seed-story-luna-makes-friends.json'

const prisma = new PrismaClient()

async function main() {
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

  console.log('✅ Seed completed successfully!')
  console.log(`
🎉 Story "${story.title}" is now in your database!

To test it:
1. Go to http://localhost:3000/stories
2. Find "Luna Makes New Friends"
3. Select a child and start reading!

Enjoy! 💜
  `)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
