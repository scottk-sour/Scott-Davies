import { PrismaClient } from '@prisma/client'
import storyData from './seed-story-finding-safe-place.json'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create achievements first
  console.log('Creating achievements...')
  const achievements = await Promise.all(
    storyData.achievements.map((achievement) =>
      prisma.achievement.upsert({
        where: { name: achievement.name },
        update: {},
        create: {
          name: achievement.name,
          description: achievement.description,
          icon: achievement.icon,
          type: achievement.type as any,
          requirement: {}, // Empty JSON object
        },
      })
    )
  )
  console.log(`✅ Created ${achievements.length} achievements`)

  // Create the story
  console.log('Creating story...')
  const story = await prisma.story.upsert({
    where: { slug: storyData.story.slug },
    update: {},
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
1. Run: npm run dev
2. Sign up for an account
3. Add a child profile
4. Browse to Stories
5. Read "Finding My Safe Place"

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
