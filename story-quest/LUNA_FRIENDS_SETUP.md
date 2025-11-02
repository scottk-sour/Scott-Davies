# Luna Makes New Friends - Setup Instructions

## Status

✅ Story JSON created: `prisma/seed-story-luna-makes-friends.json`
✅ Placeholder images created: All 20 images in `public/images/stories/luna-friends/`
✅ Direct seed script created: `scripts/seed-luna-direct.js`

## Problem Encountered

The Prisma client cannot be generated in the sandboxed Linux environment because:
1. Prisma CDN returns 403 errors when trying to download engine binaries
2. External database connection is blocked (DNS resolution fails)

## Solution

Run the seed script on your **Windows machine** where you have:
- Node.js installed
- Access to the Neon database
- All the project files

## Steps to Add the Story to Your Database

### Option 1: Using the Direct Seed Script (RECOMMENDED)

1. Open PowerShell in your project directory:
   ```powershell
   cd C:\Users\pmeth\Projects\Scott-Davies\storyquest
   ```

2. Pull the latest changes (if git push succeeded):
   ```powershell
   git pull origin claude/storyquest-interactive-app-build-011CUfArnsnhpgv1AqZxbrpg
   ```

3. Run the direct seed script:
   ```powershell
   node scripts\seed-luna-direct.js
   ```

   This script:
   - Uses the `pg` module directly (no Prisma needed)
   - Reads from `.env.local` automatically
   - Inserts or updates the story
   - Creates all conversation guides

### Option 2: If the script file doesn't exist

If `scripts/seed-luna-direct.js` doesn't exist after pulling, create it manually:

1. Create the file `scripts\seed-luna-direct.js`
2. Copy the content from below
3. Run: `node scripts\seed-luna-direct.js`

<details>
<summary>Click to see the script content</summary>

```javascript
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
        \`UPDATE "Story" SET
          title = $1,
          subtitle = $2,
          description = $3,
          "coverImage" = $4,
          content = $5,
          "updatedAt" = NOW()
        WHERE id = $6\`,
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
        \`INSERT INTO "Story" (
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
        ) RETURNING id\`,
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

    console.log(\`✅ Story processed with ID: \${storyId}\`);

    // Delete existing conversation guides for this story
    await client.query(
      'DELETE FROM "ConversationGuide" WHERE "storyId" = $1',
      [storyId]
    );
    console.log('Cleared old conversation guides');

    // Insert conversation guides
    for (const guide of storyData.story.conversationGuides) {
      await client.query(
        \`INSERT INTO "ConversationGuide" (
          "storyId", title, section, questions, activities,
          observations, responses, "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())\`,
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

    console.log(\`✅ Created \${storyData.story.conversationGuides.length} conversation guides\`);
    console.log('');
    console.log('✅ Seed completed successfully!');
    console.log(\`🎉 Story "\${storyData.story.title}" is now in your database!\`);
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
```

</details>

### Option 3: Using Next.js API Endpoint

If you have Next.js running:

1. Start your dev server:
   ```powershell
   npm run dev
   ```

2. In another PowerShell window, call the API:
   ```powershell
   curl -X POST http://localhost:3000/api/seed-luna
   ```

   Or open your browser and navigate to:
   ```
   http://localhost:3000/api/seed-luna
   ```

## Verification

After running the seed script, you should see:
```
✅ Story processed with ID: <some-id>
Cleared old conversation guides
✅ Created 3 conversation guides
✅ Seed completed successfully!
🎉 Story "Luna Makes New Friends" is now in your database!
```

Then:
1. Go to `http://localhost:3000/stories`
2. You should see both stories:
   - Finding My Safe Place
   - Luna Makes New Friends
3. Click on "Luna Makes New Friends"
4. Select a child profile
5. Start reading!

## Story Details

- **Title:** Luna Makes New Friends
- **Theme:** Social Skills & Friendship
- **Age Group:** 4-6 years
- **Scenes:** 15 interactive scenes
- **Endings:** 4 different endings
- **Therapeutic Themes:** Social skills, self-worth, courage, resilience
- **New Character:** Holly the Hedgehog

## Files Created

- `prisma/seed-story-luna-makes-friends.json` - Complete story data
- `prisma/seed-luna-friends.ts` - Original Prisma seed script
- `scripts/seed-luna-direct.js` - Direct database seed script (bypasses Prisma)
- `app/api/seed-luna/route.ts` - API endpoint for seeding
- `scripts/create-luna-friends-placeholders.ps1` - Image generation script
- `public/images/stories/luna-friends/` - 20 placeholder images (already created)

## Troubleshooting

### "Cannot find module"
Make sure you're in the correct directory:
```powershell
cd C:\Users\pmeth\Projects\Scott-Davies\storyquest
```

### "DATABASE_URL not found"
Check that `.env.local` exists and contains:
```
DATABASE_URL="postgresql://..."
```

### "Connection refused" or "Network error"
Make sure you have internet access to reach the Neon database.

### Story doesn't appear on the stories page
1. Refresh the page (Ctrl+R)
2. Clear browser cache
3. Check the console logs for errors
4. Verify the seed script completed successfully

## Next Steps

Once the story is added:
1. Test all 15 scenes
2. Try different choices to reach different endings
3. Test the conversation guides
4. Verify images are loading correctly

Enjoy the new story! 🐰💜
