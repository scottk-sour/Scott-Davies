# 🪟 Windows Setup Guide for StoryQuest

Quick setup guide for running StoryQuest on your Windows machine.

---

## ✅ What You've Done So Far

1. ✅ Cloned repository to `C:\Users\pmeth\Projects\Scott-Davies\storyquest`
2. ✅ Ran `npm install` - 96 packages installed
3. ✅ Generated Prisma client with `npx prisma generate`

---

## 🔧 Fix Database Connection (Do This Now)

### Step 1: Verify .env.local File

Open PowerShell in your storyquest folder:

```powershell
cd C:\Users\pmeth\Projects\Scott-Davies\storyquest

# Check if .env.local exists
ls .env.local

# If it doesn't exist or is wrong, create/fix it:
notepad .env.local
```

### Step 2: Copy This EXACT Content Into .env.local

**IMPORTANT:** Copy ALL of this into the file, then save and close:

```env
# ============================================
# StoryQuest - Local Development Environment
# ============================================

# DATABASE (Neon PostgreSQL)
DATABASE_URL="postgresql://neondb_owner:npg_cvUTMqam2W5V@ep-falling-wave-abu7tea6-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"

# AUTHENTICATION
NEXTAUTH_SECRET="p53dbdNxOTisp4jhz4FBw1YW3obr5RCosGMyhdLUw1I="
NEXTAUTH_URL="http://localhost:3000"

# PUBLIC URL
NEXT_PUBLIC_URL="http://localhost:3000"

# FEATURE FLAGS
NEXT_PUBLIC_ENABLE_AUDIO_NARRATION="true"
NEXT_PUBLIC_ENABLE_ACHIEVEMENTS="true"
```

**Save the file (Ctrl+S) and close Notepad.**

### Step 3: Verify the File Saved Correctly

```powershell
# This should show the file contents
cat .env.local
```

You should see the DATABASE_URL and other variables. If not, repeat Step 2.

---

## 🗄️ Set Up Database

Now that .env.local is correct, run these commands:

```powershell
# 1. Run database migrations (creates tables)
npx prisma migrate dev --name init

# 2. Seed the database (loads "Finding My Safe Place" story)
npx prisma db seed

# 3. Verify it worked
npx prisma studio
```

Prisma Studio will open in your browser showing your database tables. You should see:
- ✅ 1 Story: "Finding My Safe Place"
- ✅ 4 Achievements
- ✅ Conversation guides

Close Prisma Studio when done.

---

## 🚀 Run the App

```powershell
# Start development server
npm run dev
```

You should see:
```
✓ Ready in 1.2s
  Local:   http://localhost:3000
```

**Open browser:** http://localhost:3000

---

## 🧪 Test Everything

### 1. Sign Up
- Go to http://localhost:3000/signup
- Email: `test@example.com`
- Password: `password123`
- Click "Create Account"

### 2. Add Child Profile
- Age: 5
- Name: "Test Child"
- Trauma history: Select options

### 3. Browse Stories
- Click "Browse Stories"
- You should see "Finding My Safe Place"
- Click to read it

### 4. Test Story Reader
- Story should load with 14 scenes
- You'll see placeholder images (we'll add real ones later)
- No audio yet (we'll generate that next)

---

## 🐛 Troubleshooting

### Error: "Environment variable not found: DATABASE_URL"

**Fix:**
```powershell
# Check if .env.local exists
ls .env.local

# If missing, create it:
notepad .env.local
# Copy the content from Step 2 above
```

### Error: "Can't reach database server"

**Possible causes:**
1. .env.local doesn't have `?sslmode=require` at end of DATABASE_URL
2. Your internet connection is down
3. Neon database is paused (free tier pauses after inactivity)

**Fix:**
```powershell
# Verify DATABASE_URL has ?sslmode=require at the end:
cat .env.local | findstr DATABASE_URL

# Should show:
# DATABASE_URL="postgresql://...neondb?sslmode=require"
```

### Error: "Prisma schema loaded from prisma\schema.prisma"

This is normal! Not an error. Prisma is just telling you what file it's using.

### Build Warnings About Tailwind

These are safe to ignore:
```
warn - The `borderColor` property in your Tailwind CSS configuration is deprecated
```

Your app still works fine!

---

## 📊 Common Commands

```powershell
# Start dev server
npm run dev

# Build for production
npm run build

# View database
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Run database migrations
npx prisma migrate dev

# Seed database with story
npx prisma db seed

# Generate Prisma client (after schema changes)
npx prisma generate

# Format code
npm run lint:fix
```

---

## 🎨 Next Steps: Add Images and Audio

Once the app is working, you can generate professional content:

### Generate Audio (30 minutes)
```powershell
# 1. Sign up for ElevenLabs: https://elevenlabs.io (free tier)
# 2. Get API key from settings
# 3. Add to .env.local:
#    ELEVENLABS_API_KEY="your_key_here"
#    TTS_SERVICE="elevenlabs"
# 4. Run script:
npx tsx scripts/generate-audio.ts
```

See `scripts/README.md` for full instructions.

### Generate Images (1-2 hours)

See `scripts/generate-images-guide.md` for:
- ✅ 18 scene-by-scene AI image prompts
- ✅ Step-by-step instructions
- ✅ Recommended tools (ChatGPT Plus = $20/month)

---

## 🔒 Security Reminder

**Your .env.local contains secrets!**

- ✅ It's in `.gitignore` (won't be committed to git)
- ❌ Never share your .env.local file
- ❌ Never post DATABASE_URL or NEXTAUTH_SECRET publicly

**If you accidentally exposed secrets:**
1. Rotate NEXTAUTH_SECRET: `openssl rand -base64 32`
2. Reset Neon database password in dashboard
3. Update .env.local with new values

---

## 💡 Tips

1. **Restart server after .env changes:**
   - Stop server: `Ctrl+C`
   - Start again: `npm run dev`

2. **Clear Next.js cache if things are weird:**
   ```powershell
   rmdir .next -Recurse -Force
   npm run dev
   ```

3. **Check logs for errors:**
   - Look in PowerShell terminal for error messages
   - Check browser console (F12) for client errors

4. **Database GUI:**
   - Use `npx prisma studio` to view/edit database visually
   - Great for debugging

---

## ✅ Success Checklist

- [ ] .env.local file created and saved
- [ ] DATABASE_URL includes `?sslmode=require`
- [ ] `npx prisma migrate dev` runs without errors
- [ ] `npx prisma db seed` loads story successfully
- [ ] `npm run dev` starts server
- [ ] Can sign up at http://localhost:3000/signup
- [ ] Can add child profile
- [ ] Can view "Finding My Safe Place" story
- [ ] Story reader displays text correctly

**Once all checked:** You're ready to add images and audio! 🎉

---

**Need help?** Check `scripts/README.md`, `DEPLOYMENT.md`, or main `README.md`.
