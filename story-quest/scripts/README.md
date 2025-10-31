# 🎬 StoryQuest Content Generation Scripts

This directory contains scripts to generate images and audio for your therapeutic stories.

---

## 📁 What's Here

- **`generate-audio.ts`** - Auto-generate AI voice narration for all scenes
- **`generate-images-guide.md`** - Complete guide with prompts for all 18 images

---

## 🎤 Quick Start: Audio Generation

### Step 1: Choose Your TTS Service

**Option A: ElevenLabs (Recommended)**
- Best quality, most natural voices
- Free tier: 10,000 characters/month
- Paid: $5/month for 30,000 characters
- Sign up: https://elevenlabs.io

**Option B: OpenAI TTS**
- Good quality
- Pay per use: ~$15 per million characters
- Requires OpenAI API key

### Step 2: Get API Key

**ElevenLabs:**
1. Go to https://elevenlabs.io
2. Sign up (free)
3. Go to Profile → API Key
4. Copy your key

**OpenAI:**
1. Go to https://platform.openai.com/api-keys
2. Create new API key
3. Copy it

### Step 3: Set Environment Variable

Add to your `.env.local`:

```bash
# For ElevenLabs (recommended)
ELEVENLABS_API_KEY="your_key_here"
TTS_SERVICE="elevenlabs"

# OR for OpenAI
OPENAI_API_KEY="sk-..."
TTS_SERVICE="openai"
```

### Step 4: Install Dependencies

```bash
# Install tsx (TypeScript executor)
npm install -D tsx

# Or use globally
npm install -g tsx
```

### Step 5: Run the Script

```bash
npx tsx scripts/generate-audio.ts
```

**What happens:**
- ✅ Reads story from `prisma/seed-story-finding-safe-place.json`
- ✅ Generates audio for all 14 scenes
- ✅ Generates audio for all 4 endings
- ✅ Saves MP3 files to `public/audio/stories/safe-place/`
- ✅ Total: 18 audio files

**Time:** 5-10 minutes (1 second per scene)
**Cost:** ~$0.50-2.00 depending on service

---

## 🎨 Quick Start: Image Generation

### Step 1: Read the Guide

Open `scripts/generate-images-guide.md` for:
- ✅ All 18 scene-by-scene prompts
- ✅ AI tool recommendations
- ✅ Cost comparisons
- ✅ Pro tips

### Step 2: Choose Your Tool

**Easiest: ChatGPT Plus ($20/month)**
- Sign up: https://chat.openai.com/
- Use DALL-E 3 built-in
- Copy prompts from guide
- Download images

**Best Quality: Midjourney ($10/month)**
- Join Discord: https://www.midjourney.com
- Use prompts in Discord
- Download images

**Free: Stable Diffusion**
- Use: https://stablediffusionweb.com
- Or install locally
- Takes longer, less consistent

### Step 3: Generate Images

1. **Create directory:**
   ```bash
   mkdir -p public/images/stories/safe-place
   ```

2. **For each scene:**
   - Copy prompt from guide
   - Paste into AI tool
   - Download image
   - Save with correct filename

3. **File naming:**
   ```
   scene-01-luna-worried.jpg
   scene-02a-exploring.jpg
   scene-02b-quiet-corner.jpg
   ...
   ending-01-peaceful.jpg
   ...
   ```

**Time:** 1-2 hours with ChatGPT Plus
**Cost:** $20 (one month subscription, unlimited generations)

---

## ⚡ Fast Track (Get Started in 10 Minutes)

**Want to test the story NOW without waiting for content?**

### Temporary Placeholder Solution

The story works perfectly without images/audio! Just test it as-is:

```bash
# 1. Set up database
DATABASE_URL="..." npx prisma migrate dev

# 2. Seed story (text only)
npx prisma db seed

# 3. Run app
npm run dev

# 4. Test the story
# - Sign up
# - Add child
# - Browse stories
# - Read "Finding My Safe Place"
```

**You can add images and audio later!** The story is fully functional with just text.

---

## 📊 Content Statistics

### "Finding My Safe Place"

**Audio Needed:**
- 14 scene narrations
- 4 ending narrations
- **Total:** 18 audio files (~5-7 minutes total audio)

**Images Needed:**
- 14 scene illustrations
- 4 ending illustrations
- **Total:** 18 images (recommended 1200x675px, 16:9 aspect ratio)

**Cost Estimates:**

| Approach | Audio | Images | Total | Time |
|----------|-------|--------|-------|------|
| **DIY AI (Best Value)** | $5 | $20 | **$25** | 2-3 hours |
| **Premium AI** | $15 | $30 | **$45** | 1-2 hours |
| **Commission Artist** | Record yourself | $300 | **$300** | 1-2 weeks |
| **Placeholder** | None | None | **$0** | 0 minutes |

**Recommended:** DIY AI approach for best value/quality ratio!

---

## 🎯 Production Workflow

### For Your First Story (Tonight!)

**Phase 1: Test Without Content (10 minutes)**
```bash
1. Set up database
2. Seed story (text only)
3. Test reading experience
4. Verify all scenes work
```

**Phase 2: Add Audio (30 minutes)**
```bash
1. Sign up for ElevenLabs
2. Add API key to .env.local
3. Run: npx tsx scripts/generate-audio.ts
4. Test audio playback
```

**Phase 3: Add Images (1-2 hours)**
```bash
1. Sign up for ChatGPT Plus
2. Generate all 18 images using guide
3. Save to public/images/stories/safe-place/
4. Test story with images
```

**Phase 4: Polish (30 minutes)**
```bash
1. Adjust audio speed if needed
2. Optimize image file sizes
3. Test on mobile
4. Deploy to production
```

**Total Time:** 2-3 hours
**Total Cost:** $25
**Result:** Professional therapeutic story with voice and illustrations!

---

## 🔧 Troubleshooting

### Audio Script Errors

**"Module not found"**
```bash
npm install -D tsx
```

**"API key not found"**
```bash
# Add to .env.local
ELEVENLABS_API_KEY="your_key_here"
```

**"Rate limit exceeded"**
- Wait 60 seconds between API calls
- Script has built-in 1-second delay

### Image Generation Issues

**"Character looks different in each scene"**
- Use same AI tool for all images
- Include character description in every prompt
- Generate all in one session

**"Wrong aspect ratio"**
- Specify `--ar 16:9` in Midjourney
- Request "landscape 16:9" in DALL-E
- Crop manually if needed

---

## 📚 Resources

### Audio Services
- **ElevenLabs:** https://elevenlabs.io (Best quality)
- **OpenAI TTS:** https://platform.openai.com/docs/guides/text-to-speech
- **Google Cloud TTS:** https://cloud.google.com/text-to-speech
- **Amazon Polly:** https://aws.amazon.com/polly/

### Image Services
- **DALL-E 3:** https://chat.openai.com/ (ChatGPT Plus)
- **Midjourney:** https://www.midjourney.com
- **Stable Diffusion:** https://stablediffusionweb.com
- **Leonardo.ai:** https://leonardo.ai (Free tier)

### Free Alternatives
- **Record audio yourself** (free, personal touch)
- **Use Canva** for simple illustrations (free tier)
- **Stock photos** from Unsplash/Pexels (free)
- **Placeholder images** initially (test functionality)

---

## 🎓 Creating More Stories

Once you've done "Finding My Safe Place", you can create more stories:

1. **Write story JSON** (follow the same format)
2. **Run audio script** for new story
3. **Generate images** using the guide
4. **Add to seed script**
5. **Deploy**

**Each additional story takes 2-3 hours** with this workflow!

---

## 💡 Pro Tips

### Audio
- ✅ Use consistent voice across all stories
- ✅ Slower narration (0.9x speed) for young children
- ✅ Test with actual 4-6 year olds if possible
- ✅ Add gentle background music (optional)
- ✅ Save as MP3 (smaller file size than WAV)

### Images
- ✅ Maintain consistent character design
- ✅ Use calming, therapeutic color palette
- ✅ Avoid scary or threatening imagery
- ✅ Optimize file sizes (<500KB each)
- ✅ Test on mobile screens (responsive)
- ✅ Add alt text for accessibility

### Cost Optimization
- ✅ ChatGPT Plus = $20/month = unlimited DALL-E generations
- ✅ ElevenLabs free tier = 10,000 chars = ~1-2 stories
- ✅ Generate all content in one month, then cancel subscriptions
- ✅ Total one-time cost: ~$25 per story

---

## ✅ Checklist for Complete Story

- [ ] Story text written and in JSON format
- [ ] Database seeded with story
- [ ] Audio generated for all scenes
- [ ] Audio saved to correct directory
- [ ] Images generated for all scenes
- [ ] Images saved with correct filenames
- [ ] Tested story reader with audio playback
- [ ] Verified images display correctly
- [ ] Tested on mobile device
- [ ] Optimized file sizes
- [ ] Deployed to production
- [ ] Tested with real users (if possible)

---

**Questions?** Check the main README or DEPLOYMENT.md for more information.

**Ready to bring your therapeutic stories to life!** 🎨🎤✨
