const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Read the story data
const storyData = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, '../prisma/seed-story-luna-makes-friends.json'),
    'utf8'
  )
);

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment');
  process.exit(1);
}

async function seedStory() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('🌱 Starting seed for Luna Makes New Friends...');

    // Check if story exists
    const existingStory = await client.query(
      'SELECT id FROM "Story" WHERE slug = $1',
      [storyData.story.slug]
    );

    let storyId;

    if (existingStory.rows.length > 0) {
      storyId = existingStory.rows[0].id;
      console.log('Story already exists, updating...');

      // Update story
      await client.query(
        `UPDATE "Story" SET
          title = $1,
          subtitle = $2,
          description = $3,
          "coverImage" = $4,
          content = $5,
          "updatedAt" = NOW()
        WHERE id = $6`,
        [
          storyData.story.title,
          storyData.story.subtitle,
          storyData.story.description,
          storyData.story.coverImage,
          JSON.stringify(storyData.story.content),
          storyId
        ]
      );
    } else {
      console.log('Creating new story...');

      // Insert story
      const insertResult = await client.query(
        `INSERT INTO "Story" (
          title, subtitle, description, "coverImage", slug, author,
          illustrator, narrator, "reviewedBy", "ageGroup", category,
          duration, "wordCount", "therapeuticThemes", "traumaTopics",
          "contentWarnings", "healingGoals", "professionalGuidance",
          content, "audioFiles", status, featured, "freeForCareChildren",
          vocabulary, "emotionalSkills", "copingStrategies",
          "publishedAt", "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
          $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26,
          NOW(), NOW(), NOW()
        ) RETURNING id`,
        [
          storyData.story.title,
          storyData.story.subtitle,
          storyData.story.description,
          storyData.story.coverImage,
          storyData.story.slug,
          storyData.story.author,
          storyData.story.illustrator,
          storyData.story.narrator,
          storyData.story.reviewedBy,
          storyData.story.ageGroup,
          storyData.story.category,
          storyData.story.duration,
          storyData.story.wordCount,
          storyData.story.therapeuticThemes,
          storyData.story.traumaTopics,
          storyData.story.contentWarnings,
          storyData.story.healingGoals,
          storyData.story.professionalGuidance,
          JSON.stringify(storyData.story.content),
          JSON.stringify({}),
          storyData.story.status,
          storyData.story.featured,
          storyData.story.freeForCareChildren,
          JSON.stringify([]),
          JSON.stringify([]),
          JSON.stringify([])
        ]
      );

      storyId = insertResult.rows[0].id;
    }

    console.log(`✅ Story processed with ID: ${storyId}`);

    // Delete existing conversation guides for this story
    await client.query(
      'DELETE FROM "ConversationGuide" WHERE "storyId" = $1',
      [storyId]
    );
    console.log('Cleared old conversation guides');

    // Insert conversation guides
    for (const guide of storyData.story.conversationGuides) {
      await client.query(
        `INSERT INTO "ConversationGuide" (
          "storyId", title, section, questions, activities,
          observations, responses, "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
        [
          storyId,
          guide.title,
          guide.section,
          JSON.stringify(guide.questions),
          JSON.stringify(guide.activities || []),
          JSON.stringify(guide.observations || []),
          JSON.stringify({})
        ]
      );
    }

    console.log(`✅ Created ${storyData.story.conversationGuides.length} conversation guides`);
    console.log('');
    console.log('✅ Seed completed successfully!');
    console.log(`🎉 Story "${storyData.story.title}" is now in your database!`);
    console.log('');
    console.log('To test it:');
    console.log('1. Go to http://localhost:3000/stories');
    console.log('2. Find "Luna Makes New Friends"');
    console.log('3. Select a child and start reading!');
    console.log('');
    console.log('Enjoy! 💜');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seedStory();
