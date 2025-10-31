# ⚡ QuickStart Guide for StoryQuest

Get up and running in **5 minutes**.

---

## Prerequisites

You should have already:
- ✅ Cloned the repository
- ✅ Run `npm install`
- ✅ Created a Neon database account

---

## Step 1: Configure Environment (2 minutes)

### Create .env.local file:

```powershell
notepad .env.local
```

### Copy this into the file:

```env
# DATABASE (Your Neon connection string)
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

**Save and close (Ctrl+S).**

---

## Step 2: Set Up Database (1 minute)

### Option A: Automated Script (Recommended)

```powershell
.\setup-database.ps1
```

### Option B: Manual Commands

```powershell
# Create database tables
npx prisma migrate dev --name init

# Load story data
npx prisma db seed

# Generate Prisma client
npx prisma generate
```

---

## Step 3: Run the App (1 minute)

```powershell
npm run dev
```

Open browser: **http://localhost:3000**

---

## Step 4: Test It (1 minute)

1. Click **"Sign Up"**
2. Create account:
   - Email: `test@example.com`
   - Password: `password123`
3. Add child profile
4. Browse stories → **"Finding My Safe Place"**
5. Read the story!

---

## ✅ Success!

You should see:
- ✅ Login working
- ✅ Story library with 1 story
- ✅ Interactive story reader
- ✅ Placeholder images (we'll add real ones next)

---

## 🎨 Next Steps

### Add Images and Audio

See **`scripts/README.md`** for:
- 🎤 Automated audio generation (30 min)
- 🖼️ AI image generation guide (1-2 hours)

### View Database

```powershell
npx prisma studio
```

Opens GUI to see your data.

---

## 🐛 Troubleshooting

### "Environment variable not found: DATABASE_URL"

Fix: Check .env.local file exists and has DATABASE_URL

```powershell
cat .env.local
```

### "The table public.User does not exist"

Fix: Run database migrations

```powershell
npx prisma migrate dev --name init
```

### "Can't reach database server"

Fix: Add `?sslmode=require` to end of DATABASE_URL

```env
DATABASE_URL="postgresql://...neondb?sslmode=require"
```

---

## 📚 More Help

- **Windows Setup:** `WINDOWS_SETUP.md`
- **Content Generation:** `scripts/README.md`
- **Deployment:** `DEPLOYMENT.md`
- **Full README:** `README.md`

---

**Questions?** Check the docs above or open an issue.

**Working?** Start creating content! 🎉
