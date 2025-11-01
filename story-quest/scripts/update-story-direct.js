const { Client } = require('pg');

const connectionString = "postgresql://neondb_owner:npg_cvUTMqam2W5V@ep-falling-wave-abu7tea6-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require";

const content = {
  nodes: [
    {
      id: 'start',
      type: 'scene',
      text: 'Luna the little bunny arrived at a new house. Everything felt big and different. She didn\'t know where anything was, or who these new people were. Her ears drooped down, and her little heart beat fast.',
      image: '/images/stories/safe-place/scene-01-luna-worried.jpg',
      audio: '/audio/stories/safe-place/scene-01.mp3',
      emotionalTone: 'worried',
      choices: [
        {
          id: 'choice-1a',
          text: 'Explore the house',
          icon: '🏠',
          nextNode: 'scene-02a'
        },
        {
          id: 'choice-1b',
          text: 'Find a quiet corner',
          icon: '🛋️',
          nextNode: 'scene-02b'
        }
      ]
    },
    {
      id: 'scene-02a',
      type: 'scene',
      text: 'Luna hopped slowly through the rooms. She saw a soft rug, some colorful toys, and a big comfy chair. By the window, someone was reading a book. They looked up and smiled gently at Luna.',
      image: '/images/stories/safe-place/scene-02a-exploring.jpg',
      audio: '/audio/stories/safe-place/scene-02a.mp3',
      emotionalTone: 'curious',
      choices: [
        {
          id: 'choice-2a-1',
          text: 'Go closer to the person',
          icon: '👋',
          nextNode: 'scene-03'
        },
        {
          id: 'choice-2a-2',
          text: 'Watch from here',
          icon: '👀',
          nextNode: 'scene-04'
        }
      ]
    },
    {
      id: 'scene-02b',
      type: 'scene',
      text: 'Luna found a quiet corner with soft cushions. She curled up small and watched everything from her safe spot. It was okay to take her time. Nobody rushed her.',
      image: '/images/stories/safe-place/scene-02b-quiet-corner.jpg',
      audio: '/audio/stories/safe-place/scene-02b.mp3',
      emotionalTone: 'cautious',
      choices: [
        {
          id: 'choice-2b-1',
          text: 'Stay here a bit longer',
          icon: '🛋️',
          nextNode: 'scene-04'
        },
        {
          id: 'choice-2b-2',
          text: 'Look for the person',
          icon: '🔍',
          nextNode: 'scene-03'
        }
      ]
    },
    {
      id: 'scene-03',
      type: 'scene',
      text: 'The caregiver got down on the floor, so they were closer to Luna\'s size. "Hello, little one," they said softly. "You\'re safe here. Would you like to come a bit closer?"',
      image: '/images/stories/safe-place/scene-03-meet-caregiver.jpg',
      audio: '/audio/stories/safe-place/scene-03.mp3',
      emotionalTone: 'hopeful',
      choices: [
        {
          id: 'choice-3-1',
          text: 'Move a little closer',
          icon: '🐰',
          nextNode: 'scene-05'
        },
        {
          id: 'choice-3-2',
          text: 'Watch from where I am',
          icon: '👀',
          nextNode: 'scene-04'
        }
      ]
    },
    {
      id: 'scene-04',
      type: 'scene',
      text: 'Luna watched from her safe space. The caregiver did calm, quiet things - reading, drawing, humming softly. They didn\'t try to grab Luna or rush her. They respected that Luna needed time.',
      image: '/images/stories/safe-place/scene-04-observe-safe.jpg',
      audio: '/audio/stories/safe-place/scene-04.mp3',
      emotionalTone: 'observant',
      choices: [
        {
          id: 'choice-4-1',
          text: 'Keep watching',
          icon: '👀',
          nextNode: 'scene-05'
        },
        {
          id: 'choice-4-2',
          text: 'Hop a little closer',
          icon: '🐰',
          nextNode: 'scene-05'
        }
      ]
    },
    {
      id: 'scene-05',
      type: 'scene',
      text: 'The caregiver held up a beautiful soft blanket. It had stars and moons on it. "I thought you might like this," they said gently. "It\'s very soft and warm. Would you like to try it?"',
      image: '/images/stories/safe-place/scene-05-special-blanket.jpg',
      audio: '/audio/stories/safe-place/scene-05.mp3',
      emotionalTone: 'interested',
      choices: [
        {
          id: 'choice-5-1',
          text: 'Try the blanket',
          icon: '✨',
          nextNode: 'ending-peaceful'
        },
        {
          id: 'choice-5-2',
          text: 'Ask a question',
          icon: '❓',
          nextNode: 'ending-trusting'
        }
      ]
    }
  ],
  endings: [
    {
      id: 'ending-peaceful',
      type: 'ending',
      text: 'Luna curled up in her special blanket. She felt calm inside. Her new home was safe. She could rest here. She could be peaceful here. Everything was going to be okay.',
      image: '/images/stories/safe-place/ending-01-peaceful.jpg',
      audio: '/audio/stories/safe-place/ending-01.mp3',
      emotionalTone: 'peaceful'
    },
    {
      id: 'ending-trusting',
      type: 'ending',
      text: 'Luna sat close to the caregiver, their warmth next to her. She had learned that this person would keep their promises. She could trust them. She wasn\'t alone anymore.',
      image: '/images/stories/safe-place/ending-02-trusting.jpg',
      audio: '/audio/stories/safe-place/ending-02.mp3',
      emotionalTone: 'trusting'
    }
  ]
};

async function updateStory() {
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    const result = await client.query(
      `UPDATE "Story" SET content = $1, "coverImage" = $2 WHERE slug = $3`,
      [JSON.stringify(content), '/images/stories/safe-place/safe-place-cover.jpg', 'finding-my-safe-place']
    );

    console.log('✅ Story updated successfully!');
    console.log(`   - Rows affected: ${result.rowCount}`);
    console.log(`   - Nodes: ${content.nodes.length}`);
    console.log(`   - Endings: ${content.endings.length}`);
    console.log('\nYou can now view the story at: http://localhost:3000/stories/finding-my-safe-place');

  } catch (error) {
    console.error('❌ Error updating story:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

updateStory();
