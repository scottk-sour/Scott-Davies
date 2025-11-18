# CommissionFlow - Deployment Guide

Complete guide to deploying CommissionFlow to production.

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git installed
- GitHub account
- Supabase account (free tier is fine)
- Vercel account (free tier is fine)
- Stripe account (optional - for payments)

---

## 🚀 Step 1: Set Up Supabase

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new organization (if needed)
4. Create a new project:
   - **Project name:** commissionflow-production
   - **Database password:** (generate strong password - save it!)
   - **Region:** Choose closest to your users (UK: London)

### 1.2 Run Database Schema

1. Wait for project to finish setting up (2-3 minutes)
2. Go to **SQL Editor** in left sidebar
3. Click **New Query**
4. Copy entire contents of `supabase/schema.sql`
5. Paste into SQL editor
6. Click **Run** (bottom right)
7. Verify success: Green checkmark appears

### 1.3 Get API Keys

1. Go to **Project Settings** (gear icon)
2. Click **API** in left menu
3. Copy these values (you'll need them later):
   - **Project URL** (looks like: https://xxx.supabase.co)
   - **anon public** key (starts with: eyJ...)
   - **service_role** key (starts with: eyJ... - keep this secret!)

---

## 🔐 Step 2: Configure Authentication

### 2.1 Enable Email Auth

1. In Supabase, go to **Authentication** > **Providers**
2. Find **Email** provider
3. Ensure it's **Enabled** (should be by default)
4. Configure email templates (optional):
   - Go to **Authentication** > **Email Templates**
   - Customize signup confirmation email

### 2.2 Set Site URL

1. Go to **Authentication** > **URL Configuration**
2. Set **Site URL:** `https://your-domain.com` (or use Vercel URL initially)
3. Set **Redirect URLs:**
   ```
   https://your-domain.com/**
   http://localhost:3000/**
   ```

---

## 📦 Step 3: Install and Build Locally

### 3.1 Clone and Install

```bash
# Navigate to the commissionflow directory
cd commissionflow

# Install dependencies
npm install
```

### 3.2 Configure Environment Variables

Create `.env.local` file in root directory:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Stripe (optional - for payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### 3.3 Test Locally

```bash
# Run development server
npm run dev
```

Open http://localhost:3000

**Test the following:**
1. ✅ Landing page loads
2. ✅ Sign up creates account
3. ✅ Login works
4. ✅ Dashboard shows (empty state is fine)
5. ✅ Add a new deal
6. ✅ View deals list
7. ✅ Commission report generates

---

## 🌐 Step 4: Deploy to Vercel

### 4.1 Push to GitHub

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - CommissionFlow MVP"

# Create repository on GitHub
# Then push to it:
git remote add origin https://github.com/YOUR_USERNAME/commissionflow.git
git branch -M main
git push -u origin main
```

### 4.2 Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **Add New** > **Project**
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./` (leave as default)
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `.next` (auto-detected)

### 4.3 Add Environment Variables

In Vercel project settings:

1. Go to **Settings** > **Environment Variables**
2. Add each variable from your `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

3. Click **Deploy**

### 4.4 Update Supabase URLs

After Vercel deploys:

1. Copy your Vercel URL (e.g., `https://commissionflow.vercel.app`)
2. Go back to Supabase > **Authentication** > **URL Configuration**
3. Update **Site URL** to your Vercel URL
4. Add Vercel URL to **Redirect URLs**

---

## 💳 Step 5: Set Up Stripe (Optional)

### 5.1 Create Stripe Account

1. Go to [stripe.com](https://stripe.com)
2. Create account
3. Complete business verification

### 5.2 Create Products

1. Go to **Products** in Stripe Dashboard
2. Create three products:

**Starter Plan:**
- Name: CommissionFlow Starter
- Price: £49/month
- Recurring: Monthly
- Copy **Price ID** (starts with `price_`)

**Professional Plan:**
- Name: CommissionFlow Professional
- Price: £99/month
- Recurring: Monthly
- Copy **Price ID**

**Business Plan:**
- Name: CommissionFlow Business
- Price: £199/month
- Recurring: Monthly
- Copy **Price ID**

### 5.3 Add Stripe Keys to Vercel

1. In Stripe, go to **Developers** > **API Keys**
2. Copy:
   - **Publishable key** (starts with `pk_`)
   - **Secret key** (starts with `sk_`)
3. Add to Vercel environment variables:

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PRICE_STARTER=price_xxx
STRIPE_PRICE_PROFESSIONAL=price_xxx
STRIPE_PRICE_BUSINESS=price_xxx
```

4. Redeploy Vercel app

### 5.4 Set Up Webhooks

1. In Stripe Dashboard, go to **Developers** > **Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://your-app.vercel.app/api/webhooks/stripe`
4. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click **Add endpoint**
6. Copy **Signing secret** (starts with `whsec_`)
7. Add to Vercel: `STRIPE_WEBHOOK_SECRET=whsec_xxx`

---

## 🎨 Step 6: Custom Domain (Optional)

### 6.1 Buy Domain

Purchase domain from:
- Namecheap
- GoDaddy
- Google Domains
- Vercel (built-in)

### 6.2 Add to Vercel

1. In Vercel project, go to **Settings** > **Domains**
2. Click **Add**
3. Enter your domain: `commissionflow.com`
4. Follow DNS configuration instructions
5. Wait for DNS propagation (5 minutes - 48 hours)

### 6.3 Update URLs

After domain is active:

1. Update `NEXT_PUBLIC_APP_URL` in Vercel to `https://commissionflow.com`
2. Update Supabase Site URL to `https://commissionflow.com`
3. Update Stripe webhook URL to `https://commissionflow.com/api/webhooks/stripe`

---

## 🧪 Step 7: Final Testing

### 7.1 Test Full User Journey

1. **Sign Up:**
   - Go to your production URL
   - Click "Start Free Trial"
   - Fill in form
   - Verify account is created in Supabase (Auth > Users)

2. **Add Team Members:**
   - Manually add users in Supabase for now
   - Go to **Table Editor** > **users**
   - Click **Insert row**
   - Fill in: name, email, role (telesales or bdm)

3. **Create Deals:**
   - Login to dashboard
   - Click "Add New Deal"
   - Fill in all fields
   - Verify deal appears in list

4. **Generate Commission Report:**
   - Go to Reports
   - Verify calculations are correct

### 7.2 Test Commission Logic

**Telesales Test:**
- Create deal with £10,000 profit
- Verify telesales commission = £1,000 (10%)
- Mark deal as "paid"
- Check Reports page shows correct commission

**BDM Threshold Test:**
- Create 3 deals with £1,000 remaining profit each
- Total remaining profit = £3,000 (below £3,500 threshold)
- Mark all as "paid"
- Check Reports: BDM should NOT receive commission
- Verify £500 shortfall carries to next month

**BDM Threshold Met Test:**
- Next month, create deal with £1,000 remaining profit
- Total with carryover = £500 + £1,000 = £1,500 (still below)
- Create another deal with £2,500 remaining profit
- Total = £1,500 + £2,500 = £4,000 (above threshold!)
- Check Reports: BDM should receive £4,000

---

## 📊 Step 8: Monitoring & Maintenance

### 8.1 Set Up Analytics

1. Vercel Analytics (built-in):
   - Go to project > **Analytics**
   - Enable Analytics

2. Error Tracking (Sentry - optional):
   ```bash
   npm install @sentry/nextjs
   npx @sentry/wizard@latest -i nextjs
   ```

### 8.2 Database Backups

Supabase automatically backs up your database:
- Daily backups retained for 7 days (free tier)
- Go to **Database** > **Backups** to download manual backup

### 8.3 Regular Maintenance

**Weekly:**
- Check error logs in Vercel
- Review Supabase usage

**Monthly:**
- Review commission calculations for accuracy
- Check for failed Stripe payments
- Update dependencies: `npm outdated`

---

## 🐛 Troubleshooting

### "Failed to fetch deals"

**Cause:** Row-level security blocking queries
**Fix:**
1. Go to Supabase SQL Editor
2. Run this query to check RLS policies:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'deals';
   ```
3. Verify user is in `users` table with correct `organization_id`

### "Unauthorized" on API routes

**Cause:** Session not being passed correctly
**Fix:**
1. Check middleware.ts is configured
2. Verify Supabase URL and keys in Vercel environment variables
3. Clear browser cookies and try again

### Commission calculations wrong

**Cause:** Values stored in pence, not pounds
**Fix:**
- Remember: All financial values are stored in PENCE (not pounds)
- £100 = 10000 in database
- Use `penceToPounds()` and `poundsToPence()` helpers

---

## 📝 Post-Launch Checklist

- [ ] Production URL working
- [ ] Sign up flow tested
- [ ] Login flow tested
- [ ] Can create deals
- [ ] Can view deals
- [ ] Commission calculations correct
- [ ] Reports generating correctly
- [ ] Email notifications working (if configured)
- [ ] Stripe payments working (if configured)
- [ ] Mobile responsive (test on phone)
- [ ] Custom domain configured (if applicable)
- [ ] Analytics enabled
- [ ] Backup strategy in place

---

## 🎉 You're Live!

Your CommissionFlow instance is now running in production!

### Next Steps:

1. **Add your team:**
   - Create user accounts for telesales and BDMs
   - Assign appropriate roles

2. **Import existing data:**
   - Use CSV import feature (when built)
   - Or manually enter recent deals

3. **Train your team:**
   - Show them how to add deals
   - Explain the status workflow
   - Walk through commission reports

4. **Start selling:**
   - Share landing page link
   - Use trial accounts for demos
   - Collect feedback from early users

---

## 💰 Monetization Timeline

**Week 1-2:** Free beta users (up to 50)
**Week 3-4:** Launch paid plans
**Month 2:** First paying customers
**Month 3-6:** Scale to 100+ customers

Target: £10,000 MRR by Month 6

---

## 🆘 Need Help?

- **Documentation:** See README.md
- **Database Schema:** See supabase/schema.sql
- **Commission Logic:** See lib/commission-calculator.ts

Good luck building your SaaS! 🚀
