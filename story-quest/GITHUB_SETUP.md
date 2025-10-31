# Setting Up StoryQuest on GitHub

This guide will help you create a dedicated GitHub repository for StoryQuest.

---

## Step 1: Create New GitHub Repository

### Option A: Via GitHub Web Interface (Recommended)

1. **Go to GitHub:** https://github.com
2. **Click the "+" icon** in the top-right corner
3. **Select "New repository"**
4. **Fill in the details:**
   - **Repository name:** `storyquest` or `StoryQuest`
   - **Description:** `Therapeutic story platform for children in care - trauma-informed interactive stories to support healing and growth`
   - **Visibility:**
     - ✅ **Public** (if you want to showcase it, attract contributors, or apply for grants)
     - ✅ **Private** (if you want to keep it confidential during development)
   - **Initialize repository:**
     - ❌ **DO NOT** check "Add a README file"
     - ❌ **DO NOT** add .gitignore
     - ❌ **DO NOT** choose a license yet
   - (We'll push existing code, so start with an empty repository)

5. **Click "Create repository"**

6. **Copy the repository URL** that appears. It will look like:
   ```
   https://github.com/YOUR-USERNAME/storyquest.git
   ```

---

## Step 2: Return Here and Provide the Repository URL

Once you've created the repository, come back to Claude Code and provide the repository URL.

I'll then help you:
1. Prepare the code for the new repository
2. Set up the git remote
3. Push all your code to the new repository

---

## What Will Happen Next

When you provide the repository URL, I will:

1. **Navigate to the story-quest directory**
2. **Initialize it as a new standalone repository**
3. **Add all your files**
4. **Create an initial commit** with all the work we've done
5. **Set up the remote** pointing to your new repository
6. **Push everything** to GitHub

---

## Current Project Structure

Your StoryQuest code is currently in:
```
/home/user/Scott-Davies/story-quest/
```

This includes:
- ✅ Complete Next.js application
- ✅ Database schema (Prisma)
- ✅ Authentication system (NextAuth.js)
- ✅ Child management system
- ✅ Story library and interactive reader
- ✅ First therapeutic story "Finding My Safe Place"
- ✅ Production deployment guides
- ✅ Legal policies (Privacy, Terms, Cookies)
- ✅ UI components (loading, toast, progress, etc.)

**Total:** ~50+ files, 15,000+ lines of code

---

## Repository Settings Recommendations

Once the repository is created, you may want to configure:

### Branch Protection (Settings → Branches)
- Protect the `main` branch
- Require pull request reviews
- Require status checks to pass

### Secrets (Settings → Secrets and variables → Actions)
Add these for CI/CD:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `STRIPE_SECRET_KEY`
- etc.

### About Section (Main repository page, click ⚙️ next to About)
- Description: "Therapeutic story platform for children in care"
- Website: Your production URL (when deployed)
- Topics: `nextjs`, `typescript`, `therapeutic`, `children-in-care`, `trauma-informed`, `prisma`, `tailwindcss`

### Social Preview (Settings → General → Social preview)
Upload a preview image (1280×640 pixels)

---

## Next Steps After Repository Setup

1. **Update README.md** with:
   - Project description
   - Setup instructions
   - Contributing guidelines
   - License information

2. **Add LICENSE file:**
   - Consider MIT, Apache 2.0, or AGPL-3.0
   - Or proprietary license if keeping it closed

3. **Set up GitHub Actions** (optional):
   - Automated testing
   - TypeScript checking
   - Deployment to Vercel

4. **Enable Discussions** (optional):
   - For community support
   - Feature requests
   - Q&A

5. **Add Issue Templates:**
   - Bug reports
   - Feature requests
   - Professional/safeguarding concerns

---

## Ready to Proceed?

Create the GitHub repository now, then provide me with the repository URL (e.g., `https://github.com/YOUR-USERNAME/storyquest.git`), and I'll handle the rest!
