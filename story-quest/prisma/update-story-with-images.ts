import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables
config({ path: resolve(__dirname, '../.env.local') })

const prisma = new PrismaClient()

async function updateStoryWithImages() {
  try {
    // Update the story with cover image and content with image paths
    const story = await prisma.story.update({
      where: { slug: 'finding-my-safe-place' },
      data: {
        coverImage: '/images/stories/safe-place/safe-place-cover.jpg',
        content: {
          scenes: [
            {
              id: 'scene-01',
              title: 'A New Place',
              content: 'Luna the little bunny arrived at a new house. Everything felt big and different. She didn\'t know where anything was, or who these new people were. Her ears drooped down, and her little heart beat fast.',
              image: '/images/stories/safe-place/scene-01-luna-worried.jpg',
              choices: [
                {
                  text: 'Explore the house',
                  nextScene: 'scene-02a'
                },
                {
                  text: 'Find a quiet corner',
                  nextScene: 'scene-02b'
                }
              ]
            },
            {
              id: 'scene-02a',
              title: 'Looking Around',
              content: 'Luna hopped slowly through the rooms. She saw a soft rug, some colorful toys, and a big comfy chair. By the window, someone was reading a book. They looked up and smiled gently at Luna.',
              image: '/images/stories/safe-place/scene-02a-exploring.jpg',
              choices: [
                {
                  text: 'Go closer to the person',
                  nextScene: 'scene-03'
                },
                {
                  text: 'Watch from here',
                  nextScene: 'scene-04'
                }
              ]
            },
            {
              id: 'scene-02b',
              title: 'A Safe Spot',
              content: 'Luna found a quiet corner with soft cushions. She curled up small and watched everything from her safe spot. It was okay to take her time. Nobody rushed her.',
              image: '/images/stories/safe-place/scene-02b-quiet-corner.jpg',
              choices: [
                {
                  text: 'Stay here a bit longer',
                  nextScene: 'scene-04'
                },
                {
                  text: 'Look for the person',
                  nextScene: 'scene-03'
                }
              ]
            },
            {
              id: 'scene-03',
              title: 'Meeting Someone Kind',
              content: 'The caregiver got down on the floor, so they were closer to Luna\'s size. "Hello, little one," they said softly. "You\'re safe here. Would you like to come a bit closer?"',
              image: '/images/stories/safe-place/scene-03-meet-caregiver.jpg',
              choices: [
                {
                  text: 'Move a little closer',
                  nextScene: 'scene-05'
                },
                {
                  text: 'Watch from where I am',
                  nextScene: 'scene-04'
                }
              ]
            },
            {
              id: 'scene-04',
              title: 'Taking Your Time',
              content: 'Luna watched from her safe space. The caregiver did calm, quiet things - reading, drawing, humming softly. They didn\'t try to grab Luna or rush her. They respected that Luna needed time.',
              image: '/images/stories/safe-place/scene-04-observe-safe.jpg',
              choices: [
                {
                  text: 'Keep watching',
                  nextScene: 'scene-05'
                },
                {
                  text: 'Hop a little closer',
                  nextScene: 'scene-05'
                }
              ]
            },
            {
              id: 'scene-05',
              title: 'Something Special',
              content: 'The caregiver held up a beautiful soft blanket. It had stars and moons on it. "I thought you might like this," they said gently. "It\'s very soft and warm. Would you like to try it?"',
              image: '/images/stories/safe-place/scene-05-special-blanket.jpg',
              choices: [
                {
                  text: 'Try the blanket',
                  nextScene: 'scene-06'
                },
                {
                  text: 'Not yet',
                  nextScene: 'scene-07'
                }
              ]
            },
            {
              id: 'scene-06',
              title: 'Soft and Safe',
              content: 'Luna touched the blanket with one paw. It was so soft! She snuggled into it a little. The caregiver smiled. "That\'s your special blanket now. Whenever you need to feel safe, it\'s here for you."',
              image: '/images/stories/safe-place/scene-06-accept-blanket.jpg',
              choices: [
                {
                  text: 'Snuggle in the blanket',
                  nextScene: 'scene-09'
                },
                {
                  text: 'Ask a question',
                  nextScene: 'scene-07'
                }
              ]
            },
            {
              id: 'scene-07',
              title: 'Asking Questions',
              content: 'Luna looked up at the caregiver. "Will I... will I stay here?" she asked in a tiny voice. The caregiver listened carefully. "Yes, Luna. This is your home now. We\'re here to take care of you."',
              image: '/images/stories/safe-place/scene-07-ask-question.jpg',
              choices: [
                {
                  text: 'Share how I feel',
                  nextScene: 'scene-08a'
                },
                {
                  text: 'Listen to a story',
                  nextScene: 'scene-08b'
                }
              ]
            },
            {
              id: 'scene-08a',
              title: 'Sharing Feelings',
              content: 'Luna\'s ears drooped. "I feel scared sometimes," she whispered. The caregiver nodded kindly. "That makes sense. It\'s okay to feel scared. Would you like to tell me what makes you scared?"',
              image: '/images/stories/safe-place/scene-08a-share-worry.jpg',
              choices: [
                {
                  text: 'Talk about it',
                  nextScene: 'scene-09'
                },
                {
                  text: 'Maybe later',
                  nextScene: 'scene-09'
                }
              ]
            },
            {
              id: 'scene-08b',
              title: 'Story Time',
              content: 'The caregiver picked up a book with pictures of other bunnies. "Would you like to hear a story?" Luna nodded. She curled up close as the caregiver read in a soft, calm voice.',
              image: '/images/stories/safe-place/scene-08b-listen-story.jpg',
              choices: [
                {
                  text: 'Continue listening',
                  nextScene: 'scene-09'
                }
              ]
            },
            {
              id: 'scene-09',
              title: 'Bedtime',
              content: 'As the sky grew dark, the caregiver helped Luna get ready for bed. They showed her the soft bed, the nightlight, and where her special blanket would be. "I\'ll be right nearby if you need me," they said.',
              image: '/images/stories/safe-place/scene-09-bedtime.jpg',
              choices: [
                {
                  text: 'Curl up in bed',
                  nextScene: 'scene-10'
                }
              ]
            },
            {
              id: 'scene-10',
              title: 'Feeling Safer',
              content: 'Luna wrapped herself in her special blanket. The room was quiet and peaceful. Her heart didn\'t beat quite so fast anymore. Maybe... maybe this place could feel safe.',
              image: '/images/stories/safe-place/scene-10-feel-safe.jpg',
              choices: [
                {
                  text: 'Go to sleep',
                  nextScene: 'scene-11'
                }
              ]
            },
            {
              id: 'scene-11',
              title: 'A New Day',
              content: 'When Luna woke up, gentle sunlight filled the room. She could hear soft sounds from the kitchen. The caregiver peeked in with a smile. "Good morning, Luna. How did you sleep?"',
              image: '/images/stories/safe-place/scene-11-morning.jpg',
              choices: [
                {
                  text: 'Tell them about my sleep',
                  nextScene: 'scene-12'
                }
              ]
            },
            {
              id: 'scene-12',
              title: 'Building Trust',
              content: 'Days passed. Luna and the caregiver did things together - puzzles, drawing, looking at clouds. Luna started to feel more comfortable. She could be herself here.',
              image: '/images/stories/safe-place/scene-12-trust.jpg',
              choices: [
                {
                  text: 'Try something new',
                  nextScene: 'scene-13'
                }
              ]
            },
            {
              id: 'scene-13',
              title: 'Being Brave',
              content: 'One day, the caregiver showed Luna something new to try. Luna felt a little nervous, but she also felt... brave. "I can try," she said. The caregiver smiled. "I\'m right here if you need me."',
              image: '/images/stories/safe-place/scene-13-brave.jpg',
              choices: [
                {
                  text: 'Feel peaceful',
                  nextScene: 'ending-01'
                },
                {
                  text: 'Feel trusting',
                  nextScene: 'ending-02'
                },
                {
                  text: 'Feel connected',
                  nextScene: 'ending-03'
                },
                {
                  text: 'Feel brave',
                  nextScene: 'ending-04'
                }
              ]
            },
            {
              id: 'ending-01',
              title: 'Finding Peace',
              content: 'Luna curled up in her special blanket. She felt calm inside. Her new home was safe. She could rest here. She could be peaceful here. Everything was going to be okay.',
              image: '/images/stories/safe-place/ending-01-peaceful.jpg',
              isEnding: true
            },
            {
              id: 'ending-02',
              title: 'Learning to Trust',
              content: 'Luna sat close to the caregiver, their warmth next to her. She had learned that this person would keep their promises. She could trust them. She wasn\'t alone anymore.',
              image: '/images/stories/safe-place/ending-02-trusting.jpg',
              isEnding: true
            },
            {
              id: 'ending-03',
              title: 'Feeling Connected',
              content: 'Luna played happily with the caregiver. They laughed together. Luna felt like she belonged. This was her family now. She was loved, and she could love back.',
              image: '/images/stories/safe-place/ending-03-connected.jpg',
              isEnding: true
            },
            {
              id: 'ending-04',
              title: 'Growing Brave',
              content: 'Luna stood tall, her ears up. She still had her special blanket nearby, but she didn\'t need it all the time now. She was growing braver every day. She was safe, and she was strong.',
              image: '/images/stories/safe-place/ending-04-brave.jpg',
              isEnding: true
            }
          ]
        }
      }
    })

    console.log('✅ Story updated with images and full content!')
    console.log(`   - Cover image: ${story.coverImage}`)
    console.log(`   - Scenes: ${(story.content as any).scenes.length}`)
  } catch (error) {
    console.error('❌ Error updating story:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateStoryWithImages()
