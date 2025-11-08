# 🚀 CommissionFlow - Vercel Deployment Guide

**Status:** Ready to deploy Phase 1A (Commission Rules System)
**Branch:** `claude/build-commissionflow-saas-011CUdSiH9FfJLBFu6SK5q6x`
**Date:** November 8, 2025

---

## ✅ Pre-Deployment Checklist

- [x] Phase 1A code committed (30+ files, ~10,500 lines)
- [x] Package.json added to git
- [x] TypeScript compiles successfully
- [x] Database migrations ready
- [ ] Environment variables prepared (DO THIS NOW)
- [ ] Vercel account ready
- [ ] Supabase project configured

---

## 📋 STEP 1: Prepare Environment Variables

Before deploying, gather these values:

### From Supabase Dashboard (https://app.supabase.com)

1. **Select your CommissionFlow project**
2. **Go to:** Settings → API
3. **Copy these 3 values:**

```bash
# 1. Project URL (top of page)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co

# 2. Anon/Public Key (Project API keys section → anon public)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 3. Service Role Key (Project API keys section → service_role secret)
⚠️ THIS IS SENSITIVE - NEVER EXPOSE IN CLIENT CODE
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### From Stripe Dashboard (https://dashboard.stripe.com)

**If you have Stripe set up:**

1. **Go to:** Developers → API keys
2. **Copy:**

```bash
# Publishable key (safe for client-side)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... (or pk_live_...)

# Secret key (NEVER expose in client code)
STRIPE_SECRET_KEY=sk_test_... (or sk_live_...)
```

3. **Go to:** Developers → Webhooks → Add endpoint
4. **Copy webhook secret (after creating endpoint):**

```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

5. **Create 3 products in Stripe:**
   - Starter: £49/month → Copy price ID
   - Professional: £99/month → Copy price ID
   - Business: £199/month → Copy price ID

```bash
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_PROFESSIONAL=price_...
STRIPE_PRICE_BUSINESS=price_...
```

**If you DON'T have Stripe yet:**
- Skip Stripe variables for now
- You can add them later (payment features won't work until added)

### App Configuration

```bash
# Your production URL (will be provided by Vercel after first deployment)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# Environment
NODE_ENV=production
```

### Email (Optional - Resend)

**If you have Resend account (https://resend.com):**

```bash
RESEND_API_KEY=re_...
```

**If not:** Skip for now (email features won't work)

---

## 🚀 STEP 2: Deploy to Vercel (Via Dashboard)

### Option A: First Time Deployment

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Login with your account

2. **Click "Add New..." → Project**

3. **Import Git Repository**
   - Click "Import" next to your GitHub account
   - Select repository: `scottk-sour/Scott-Davies`
   - Click "Import"

4. **Configure Project**

   **Project Name:** `commission-flow` (or your preferred name)

   **Framework Preset:** Next.js (should auto-detect)

   **Root Directory:** Click "Edit" → Enter: `commissionflow`

   ⚠️ **CRITICAL:** Set root directory to `commissionflow` because it's a monorepo!

   **Build Command:** `npm run build` (auto-detected)

   **Output Directory:** `.next` (auto-detected)

   **Install Command:** `npm install` (auto-detected)

5. **Add Environment Variables**

   Click "Environment Variables" section, add ALL the variables from Step 1:

   **Required for basic functionality:**
   ```
   Key: NEXT_PUBLIC_SUPABASE_URL
   Value: https://xxxxxxxxxxxxx.supabase.co
   Environments: Production, Preview, Development ✓✓✓

   Key: NEXT_PUBLIC_SUPABASE_ANON_KEY
   Value: eyJhbGc...
   Environments: Production, Preview, Development ✓✓✓

   Key: SUPABASE_SERVICE_ROLE_KEY
   Value: eyJhbGc...
   Environments: Production, Preview, Development ✓✓✓
   🔒 Mark as "Sensitive" ✓

   Key: NEXT_PUBLIC_APP_URL
   Value: https://commission-flow.vercel.app (use your actual Vercel URL)
   Environments: Production, Preview, Development ✓✓✓

   Key: NODE_ENV
   Value: production
   Environments: Production ✓
   ```

   **Optional (Stripe - if configured):**
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
   STRIPE_SECRET_KEY (mark as Sensitive)
   STRIPE_WEBHOOK_SECRET (mark as Sensitive)
   STRIPE_PRICE_STARTER
   STRIPE_PRICE_PROFESSIONAL
   STRIPE_PRICE_BUSINESS
   ```

   **Optional (Resend - if configured):**
   ```
   RESEND_API_KEY (mark as Sensitive)
   ```

6. **Select Branch to Deploy**
   - Branch: `claude/build-commissionflow-saas-011CUdSiH9FfJLBFu6SK5q6x`

7. **Click "Deploy"**
   - Vercel will start building (takes 2-3 minutes)
   - Watch the build logs for any errors

8. **Wait for Success**
   - You'll see "Congratulations! 🎉" when done
   - Vercel will show your production URL

---

### Option B: Deploy New Branch (If Project Already Exists)

1. **Go to your Vercel project dashboard**
   - Visit: https://vercel.com/dashboard
   - Click on `commission-flow` project

2. **Go to Deployments tab**

3. **Click "Deploy" button** (top right)

4. **Select branch:** `claude/build-commissionflow-saas-011CUdSiH9FfJLBFu6SK5q6x`

5. **Click "Deploy"**

6. **Wait for build to complete** (2-3 minutes)

---

## ✅ STEP 3: Verify Deployment

After deployment succeeds, test these URLs:

### 1. Landing Page
```
https://your-app.vercel.app/
```
**Expected:** Marketing landing page

### 2. Signup
```
https://your-app.vercel.app/signup
```
**Expected:** Signup form
**Test:** Create a test account

### 3. Dashboard
```
https://your-app.vercel.app/dashboard
```
**Expected:** Dashboard with metrics (after login)

### 4. Commission Rules
```
https://your-app.vercel.app/commission-rules
```
**Expected:** List of 4 default commission rules
- Manager Standard Commission (20%)
- Director Standard Commission (15%)
- Field Rep Activity Commission
- Telesales Activity Commission

### 5. Create Rule
```
https://your-app.vercel.app/commission-rules/new
```
**Expected:** Form to create new commission rule

### 6. Test Dashboard
```
https://your-app.vercel.app/commission-rules/test
```
**Expected:** What-if calculator and dry run interface

### 7. API Health Check
```
https://your-app.vercel.app/api/commission-rules
```
**Expected:** JSON response with rules array

---

## 🔧 STEP 4: Configure Vercel Settings

### Set Production Domain (Optional)

1. **Go to:** Project Settings → Domains
2. **Add custom domain** (if you have one):
   - Example: `commissionflow.com`
   - Vercel will provide DNS instructions
3. **Update environment variable:**
   - Change `NEXT_PUBLIC_APP_URL` to your custom domain

### Configure Stripe Webhook (If Using Stripe)

1. **Copy your Vercel production URL**
   - Example: `https://commission-flow.vercel.app`

2. **Go to Stripe Dashboard → Developers → Webhooks**

3. **Add endpoint:**
   - Endpoint URL: `https://commission-flow.vercel.app/api/webhooks/stripe`
   - Events to send:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `checkout.session.completed`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

4. **Copy webhook signing secret**

5. **Add to Vercel environment variables:**
   - Key: `STRIPE_WEBHOOK_SECRET`
   - Value: `whsec_...`
   - Mark as Sensitive ✓

6. **Redeploy** to apply new environment variable

---

## 🐛 Troubleshooting

### Build Fails with "supabaseUrl is required"

**Cause:** Environment variables not set in Vercel

**Fix:**
1. Go to Project Settings → Environment Variables
2. Verify all Supabase variables are present
3. Click "Redeploy" from Deployments tab

---

### Build Fails with "Cannot find module 'X'"

**Cause:** Missing dependency in package.json

**Fix:**
1. Check the error log for the missing module
2. Add it to `commissionflow/package.json` locally
3. Commit and push
4. Vercel will auto-redeploy

---

### Runtime Error: "Organization not found"

**Cause:** Database migrations not run in Supabase

**Fix:**
1. Go to Supabase Dashboard → SQL Editor
2. Run migrations from `database/migrations/`:
   - `000_auth_helper_functions.sql`
   - `001_phase1_commission_rules_system.sql`
   - `002_seed_default_commission_rules.sql`
3. Refresh your app

---

### Page Shows "Internal Server Error"

**Cause:** Check Vercel function logs

**Fix:**
1. Go to Vercel Dashboard → Project → Functions
2. Click on the failing function
3. Read error logs
4. Common issues:
   - Missing environment variables
   - Database connection issues
   - RLS policy blocking queries

---

### Commission Rules Page Empty

**Cause:** No default rules seeded

**Fix:**
1. Run migration `002_seed_default_commission_rules.sql` in Supabase
2. Or manually create rules in the UI

---

## 📊 Post-Deployment Checklist

After successful deployment:

- [ ] Test signup flow (create account, org created)
- [ ] Test login flow
- [ ] Create a test deal
- [ ] Verify commission calculations
- [ ] Check commission rules list (4 defaults appear)
- [ ] Create a custom commission rule
- [ ] Test what-if calculator
- [ ] Run dry run simulation
- [ ] Check all pages load without errors
- [ ] Verify mobile responsive design
- [ ] Test logout

---

## 🚨 Known Limitations (Phase 1A)

### Features NOT Implemented Yet:
❌ Stripe payment integration (can't subscribe/pay)
❌ Deal editing page (can create but not edit)
❌ Settings page (can't change org settings)
❌ Email notifications (Resend not integrated)
❌ CSV export
❌ Error monitoring (Sentry)

### What DOES Work:
✅ User signup/login with organization creation
✅ Create deals with automatic commission calculations
✅ View deals pipeline
✅ Commission reports (legacy BDM threshold system)
✅ Commission rules CRUD (create, read, update, delete)
✅ Flexible commission rules engine (5 rule types)
✅ What-if calculator
✅ Dry run simulations
✅ Conflict detection
✅ Calculation explainer
✅ Team member list

---

## 🎯 Next Steps (Phase 1B)

After verifying Phase 1A deployment:

1. **Integrate Stripe** (6-8 hours)
   - Build checkout flow
   - Handle webhooks
   - Subscription management

2. **Add missing pages** (4-5 hours)
   - Deal edit page
   - Settings page
   - Billing page

3. **Integrate Resend** (2-3 hours)
   - Welcome emails
   - Commission notifications

4. **Add CSV export** (2-3 hours)
   - Deals export
   - Commission reports export

5. **Fix type safety** (10-15 hours)
   - Remove @ts-nocheck from 33 files
   - Fix actual type errors

---

## 📞 Support

**Build logs:** Vercel Dashboard → Deployments → Click deployment → View logs

**Function logs:** Vercel Dashboard → Functions → Select function → Logs

**Database logs:** Supabase Dashboard → Logs → Select table

**Common issues:** See Troubleshooting section above

---

## ✅ Deployment Complete!

Once deployed successfully, your CommissionFlow Phase 1A is LIVE! 🎉

**What you can do:**
- Sign up and create your organization
- Add team members
- Create deals and track commissions
- Configure flexible commission rules
- Test scenarios with what-if calculator
- Run dry runs before deploying rule changes

**What you CANNOT do yet:**
- Accept payments (need Stripe integration)
- Edit existing deals (need deal edit page)
- Send emails (need Resend integration)

---

**Built by Claude Code - Autonomous AI Co-Founder** 🤖
**CommissionFlow Phase 1A - Flexible Commission Rules System**
