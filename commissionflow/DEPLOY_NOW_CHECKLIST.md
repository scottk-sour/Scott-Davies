# 🚀 DEPLOY NOW - Quick Action Checklist

**Time to deploy:** 15-20 minutes
**Status:** Phase 1A ready, all code committed

---

## ⚡ STEP 1: Get Supabase Keys (5 minutes)

1. Open: https://app.supabase.com
2. Click your CommissionFlow project
3. Click **Settings** (gear icon) → **API**
4. **COPY these 3 values** (paste into notepad):

```
Project URL:
https://_____________________.supabase.co

Anon key (anon public):
eyJ_________________________________________________

Service role key (service_role secret):
eyJ_________________________________________________
```

**⚠️ Keep the service role key SECRET! Never expose it!**

---

## 🚀 STEP 2: Deploy to Vercel (10 minutes)

### If First Time:

1. Go to: https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Click **"Import"** next to `scottk-sour/Scott-Davies`
4. **ROOT DIRECTORY:** Click "Edit" → Type: `commissionflow` ✅
5. Click **"Environment Variables"**
6. Add these 3 variables:

```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: [Paste from Step 1]
Environments: ✓ Production ✓ Preview ✓ Development

Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: [Paste from Step 1]
Environments: ✓ Production ✓ Preview ✓ Development

Name: SUPABASE_SERVICE_ROLE_KEY
Value: [Paste from Step 1]
Environments: ✓ Production ✓ Preview ✓ Development
🔒 Check "Sensitive"

Name: NEXT_PUBLIC_APP_URL
Value: https://commission-flow.vercel.app (use your project name)
Environments: ✓ Production ✓ Preview ✓ Development

Name: NODE_ENV
Value: production
Environments: ✓ Production only
```

7. **Select branch:** `claude/build-commissionflow-saas-011CUdSiH9FfJLBFu6SK5q6x`
8. Click **"Deploy"**
9. **Wait 2-3 minutes** ☕

---

### If Project Already Exists:

1. Go to: https://vercel.com/dashboard
2. Click your `commission-flow` project
3. Click **"Deployments"** tab
4. Click **"Deploy"** button (top right)
5. Select branch: `claude/build-commissionflow-saas-011CUdSiH9FfJLBFu6SK5q6x`
6. Click **"Deploy"**
7. **Wait 2-3 minutes** ☕

---

## ✅ STEP 3: Test It Works (5 minutes)

After "Deployment Ready" appears:

1. **Click "Visit"** button
2. You should see the landing page
3. Click **"Sign Up"**
4. Create account:
   - Email: test@yourcompany.com
   - Password: TestPassword123!
5. Should redirect to **/dashboard** ✅
6. Click **"Commission Rules"** in sidebar
7. Should see **4 default rules** ✅
8. Click **"Deals"** → **"New Deal"**
9. Create a test deal:
   - Customer: Test Customer
   - Deal Value: £10,000
   - Buy In: £2,000
   - Installation: £1,000
10. Should calculate commission automatically ✅

---

## 🎉 SUCCESS CRITERIA

You're deployed if you can:
- ✅ Sign up and create an account
- ✅ See the dashboard with metrics
- ✅ View 4 default commission rules
- ✅ Create a test deal
- ✅ See commission calculated

---

## 🚨 IF IT FAILS

### Build Error: "supabaseUrl is required"
→ Environment variables not set. Go back to Step 2, add all 3 Supabase variables.

### Runtime Error: "Organization not found"
→ Database migrations not run. Go to Supabase Dashboard → SQL Editor → Run these 3 files:
- `database/migrations/000_auth_helper_functions.sql`
- `database/migrations/001_phase1_commission_rules_system.sql`
- `database/migrations/002_seed_default_commission_rules.sql`

### Can't Sign Up: "Email already exists"
→ Use a different email or reset in Supabase Dashboard → Authentication → Users

### Page shows blank/white screen
→ Check Vercel function logs: Dashboard → Functions → Click function → View logs

---

## 📋 OPTIONAL: Add Stripe (Skip for Now)

**Only do this if you need payment functionality immediately.**

Otherwise, you can add Stripe later (Phase 1B).

See full guide: `VERCEL_DEPLOY_GUIDE.md`

---

## ✅ YOU'RE LIVE!

**What works:**
- User signup/login with organization creation
- Deal creation and commission calculations
- Commission rules management (create, edit, delete)
- What-if calculator
- Dry run simulations
- Team member list
- Reports dashboard

**What doesn't work yet (Phase 1B):**
- Payments (no Stripe)
- Deal editing (can only create)
- Email notifications (no Resend)
- Settings page

---

**Next:** Share the URL with your first test users! 🎊

**Production URL:** https://your-app.vercel.app

**Admin Dashboard:** https://your-app.vercel.app/dashboard

**Commission Rules:** https://your-app.vercel.app/commission-rules

---

🤖 **Built by Claude Code - Autonomous Execution Mode**
