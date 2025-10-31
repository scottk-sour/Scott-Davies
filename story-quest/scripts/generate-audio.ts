/**
 * Script to generate audio narration for stories using AI TTS
 *
 * Services you can use:
 * 1. ElevenLabs (Best quality) - https://elevenlabs.io
 * 2. OpenAI TTS (Good quality) - https://platform.openai.com
 * 3. Google Cloud TTS (Decent) - https://cloud.google.com/text-to-speech
 *
 * Run: npx tsx scripts/generate-audio.ts
 */

import fs from 'fs'
import path from 'path'
import storyData from '../prisma/seed-story-finding-safe-place.json'

// ============================================
// OPTION 1: ElevenLabs (Recommended)
// ============================================
// API Key: Get from https://elevenlabs.io/app/settings
// Voice ID: Get from https://elevenlabs.io/app/voice-lab

async function generateAudioWithElevenLabs(text: string, filename: string) {
  const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
  const VOICE_ID = 'EXAVITQu4vr4xnSDxMaL' // "Bella" - warm, gentle female voice

  if (!ELEVENLABS_API_KEY) {
    throw new Error('ELEVENLABS_API_KEY not found in environment variables')
  }

  console.log(`🎙️  Generating audio for: ${filename}`)

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.75,
          style: 0.5, // Gentle, calm narration
          use_speaker_boost: true,
        },
      }),
    }
  )

  if (!response.ok) {
    throw new Error(`ElevenLabs API error: ${response.statusText}`)
  }

  const audioBuffer = await response.arrayBuffer()
  const outputPath = path.join(process.cwd(), 'public', 'audio', filename)

  // Ensure directory exists
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })

  fs.writeFileSync(outputPath, Buffer.from(audioBuffer))
  console.log(`✅ Saved: ${outputPath}`)

  return outputPath
}

// ============================================
// OPTION 2: OpenAI TTS (Alternative)
// ============================================
// API Key: Get from https://platform.openai.com/api-keys

async function generateAudioWithOpenAI(text: string, filename: string) {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY

  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not found in environment variables')
  }

  console.log(`🎙️  Generating audio with OpenAI: ${filename}`)

  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'tts-1-hd', // High quality
      voice: 'nova', // Warm, gentle female voice
      input: text,
      speed: 0.9, // Slightly slower for children
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`)
  }

  const audioBuffer = await response.arrayBuffer()
  const outputPath = path.join(process.cwd(), 'public', 'audio', filename)

  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, Buffer.from(audioBuffer))

  console.log(`✅ Saved: ${outputPath}`)

  return outputPath
}

// ============================================
// Main Script
// ============================================

async function generateAllAudio() {
  console.log('🎬 Starting audio generation for "Finding My Safe Place"')
  console.log('================================================')

  const nodes = storyData.story.content.nodes
  const endings = storyData.story.content.endings

  // Choose your TTS service
  const TTS_SERVICE = process.env.TTS_SERVICE || 'elevenlabs' // or 'openai'

  try {
    // Generate audio for each scene
    let sceneNumber = 1
    for (const node of nodes) {
      const filename = `stories/safe-place/scene-${String(sceneNumber).padStart(2, '0')}.mp3`

      if (TTS_SERVICE === 'elevenlabs') {
        await generateAudioWithElevenLabs(node.text, filename)
      } else if (TTS_SERVICE === 'openai') {
        await generateAudioWithOpenAI(node.text, filename)
      }

      sceneNumber++

      // Add delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    // Generate audio for endings
    let endingNumber = 1
    for (const ending of endings) {
      const filename = `stories/safe-place/ending-${String(endingNumber).padStart(2, '0')}.mp3`

      if (TTS_SERVICE === 'elevenlabs') {
        await generateAudioWithElevenLabs(ending.text, filename)
      } else if (TTS_SERVICE === 'openai') {
        await generateAudioWithOpenAI(ending.text, filename)
      }

      endingNumber++

      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    console.log('================================================')
    console.log('✅ All audio files generated successfully!')
    console.log(`📁 Audio files saved to: public/audio/stories/safe-place/`)
    console.log('')
    console.log('Next steps:')
    console.log('1. Listen to the audio files to verify quality')
    console.log('2. Adjust voice settings if needed')
    console.log('3. Update story JSON with correct audio paths (already correct!)')
    console.log('4. Test the story in your app')

  } catch (error) {
    console.error('❌ Error generating audio:', error)
    process.exit(1)
  }
}

// ============================================
// Run the script
// ============================================

console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║        StoryQuest Audio Generation Script                   ║
║        Generate AI narration for therapeutic stories        ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

Configuration:
- TTS Service: ${process.env.TTS_SERVICE || 'elevenlabs (default)'}
- Story: Finding My Safe Place
- Scenes: ${storyData.story.content.nodes.length}
- Endings: ${storyData.story.content.endings.length}
- Total audio files: ${storyData.story.content.nodes.length + storyData.story.content.endings.length}

Environment variables needed:
${process.env.TTS_SERVICE === 'openai' || !process.env.TTS_SERVICE
  ? '✅ ELEVENLABS_API_KEY (from https://elevenlabs.io)'
  : '✅ OPENAI_API_KEY (from https://platform.openai.com)'}

Press Ctrl+C to cancel, or the script will start in 3 seconds...
`)

setTimeout(() => {
  generateAllAudio().catch(console.error)
}, 3000)
