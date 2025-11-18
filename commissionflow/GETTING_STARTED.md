# CommissionFlow - Getting Started

## 🎯 What You've Got

A complete commission tracking SaaS built with:
- ✅ Next.js 14 + TypeScript + Tailwind CSS
- ✅ Supabase (PostgreSQL + Auth + Row-Level Security)
- ✅ Complete authentication system (login, signup)
- ✅ Deal management (create, read, update, delete)
- ✅ Automatic commission calculations (telesales + BDM with threshold rollovers)
- ✅ Real-time dashboard with metrics
- ✅ Commission reports
- ✅ Team management
- ✅ Marketing landing page
- ✅ Mobile responsive design

## 🚀 Quick Start (5 Minutes)

### 1. Install Dependencies

```bash
cd commissionflow
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create free account
2. Create new project (save the database password!)
3. Wait 2-3 minutes for setup
4. Go to **SQL Editor** > **New Query**
5. Copy entire `supabase/schema.sql` file and paste
6. Click **Run**
7. Go to **Settings** > **API** and copy:
   - Project URL
   - anon public key
   - service_role key

### 3. Configure Environment

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run Locally

```bash
npm run dev
```

Open http://localhost:3000

### 5. Create Your Account

1. Click "Start Free Trial"
2. Fill in your details
3. You're in! 🎉

---

## 📚 Understanding the App

### Core Concepts

**Organizations:**
- Every company is an organization
- Data is completely isolated between organizations
- First user becomes admin

**Users & Roles:**
- **Admin:** Full access, can manage everything
- **Manager:** View all, generate reports
- **Telesales:** Gets 10% of profit from their deals
- **BDM:** Gets remaining profit after telesales commission (with £3,500 threshold)

**Deals:**
- Track from "To Do" → "Paid"
- Commission calculated when marked as "Paid"
- Statuses: To Do, Done, Signed, Installed, Invoiced, Paid

**Commission Logic:**
```
Deal Value: £15,000
- Buy-in Cost: £8,000
- Installation: £2,000
- Misc Costs: £500
= Initial Profit: £4,500

Telesales Commission (10%): £450
Remaining Profit: £4,050 (goes to BDM pool)
```

**BDM Threshold (THE KEY FEATURE):**
- Monthly threshold: £3,500
- If monthly remaining profit < £3,500 → No commission, shortfall carries forward
- If monthly profit ≥ £3,500 → BDM gets paid everything (including carryover)

**Example:**
- October: £2,000 remaining profit → £1,500 shortfall carries to November
- November: £2,500 remaining profit → Total with carryover = £4,000 → BDM gets £4,000!

---

## 🗂️ Project Structure

```
commissionflow/
├── app/
│   ├── (auth)/              # Login, signup pages
│   ├── (dashboard)/         # Protected app (dashboard, deals, reports, team)
│   ├── (marketing)/         # Public landing page
│   └── api/                 # API routes
│       ├── auth/            # Signup, signout
│       └── deals/           # CRUD operations
├── components/
│   └── ui/                  # shadcn/ui components
├── lib/
│   ├── supabase/            # Supabase client
│   ├── commission-calculator.ts  # Core business logic ⭐
│   └── utils.ts             # Helper functions
├── types/
│   ├── database.ts          # Database types
│   └── index.ts             # App types
└── supabase/
    └── schema.sql           # Database schema ⭐
```

**Key Files to Understand:**

1. **`lib/commission-calculator.ts`**
   - Contains ALL commission logic
   - Handles BDM threshold rollovers
   - This is what makes your app special!

2. **`supabase/schema.sql`**
   - Complete database structure
   - Row-level security (critical for multi-tenant)
   - Automatic triggers and functions

3. **`app/api/deals/route.ts`**
   - Deal CRUD operations
   - Automatic commission recalculation

---

## 🎨 Customization Guide

### Change Branding

**Logo/Icon:**
- Replace `💷` emoji in:
  - `app/(dashboard)/layout.tsx`
  - `app/(marketing)/page.tsx`
  - `app/(auth)/login/page.tsx`

**Company Name:**
- Find and replace "CommissionFlow" across the codebase

**Colors:**
Update `tailwind.config.ts`:
```typescript
colors: {
  primary: {
    DEFAULT: 'hsl(221.2 83.2% 53.3%)', // Change this!
  }
}
```

### Change Commission Logic

**Telesales Rate (default 10%):**

Edit `app/api/deals/route.ts`:
```typescript
const telesalesCommission = Math.round(initialProfit * 0.10)  // Change 0.10 to your rate
```

**BDM Threshold (default £3,500):**

Edit `lib/commission-calculator.ts`:
```typescript
private readonly THRESHOLD = 350000  // This is in pence (£3,500)
```

### Add New Features

**Want to add products dropdown?**
1. Products table already exists in schema
2. Create `/app/api/products` route
3. Add product selector to deal form

**Want email notifications?**
1. Install Resend: `npm install resend`
2. Create `/app/api/send-email` route
3. Call when deal status changes

---

## 🧪 Testing Guide

### Manual Testing Checklist

**Auth Flow:**
- [ ] Sign up creates organization + user
- [ ] Login works
- [ ] Sign out works
- [ ] Can't access /app routes when logged out

**Deal Management:**
- [ ] Can create deal
- [ ] Deal number auto-generates (DEAL-2025-001)
- [ ] Calculations are correct
- [ ] Can view deals list
- [ ] Can update deal status
- [ ] Can delete deal

**Commission Calculations:**
- [ ] Telesales commission = 10% of profit
- [ ] BDM threshold works:
  - [ ] Below £3,500 → no payment, carryover set
  - [ ] Above £3,500 → full payment including carryover

**Reports:**
- [ ] Monthly report generates
- [ ] Telesales breakdown correct
- [ ] BDM breakdown shows threshold logic

### Test Data Generator

Add this to Supabase SQL Editor to create test deals:

```sql
-- Insert test users (replace YOUR_ORG_ID with your organization_id)
INSERT INTO users (id, organization_id, email, name, role) VALUES
  ('11111111-1111-1111-1111-111111111111', 'YOUR_ORG_ID', 'telesales@test.com', 'Test Telesales', 'telesales'),
  ('22222222-2222-2222-2222-222222222222', 'YOUR_ORG_ID', 'bdm@test.com', 'Test BDM', 'bdm');

-- Insert test deal
INSERT INTO deals (
  organization_id,
  customer_name,
  deal_value,
  buy_in_cost,
  installation_cost,
  misc_costs,
  initial_profit,
  telesales_commission,
  remaining_profit,
  telesales_agent_id,
  bdm_id,
  status,
  month_paid,
  created_by
) VALUES (
  'YOUR_ORG_ID',
  'Test Customer Ltd',
  1500000,  -- £15,000
  800000,   -- £8,000
  200000,   -- £2,000
  50000,    -- £500
  450000,   -- £4,500 profit
  45000,    -- £450 telesales commission
  405000,   -- £4,050 remaining
  '11111111-1111-1111-1111-111111111111',  -- telesales user ID
  '22222222-2222-2222-2222-222222222222',  -- BDM user ID
  'paid',
  NOW(),
  '11111111-1111-1111-1111-111111111111'
);
```

---

## 🚀 Deployment

See `DEPLOYMENT.md` for complete deployment guide.

**Quick Version:**

1. Push to GitHub
2. Deploy to Vercel (free tier):
   - Import repository
   - Add environment variables
   - Deploy
3. Update Supabase redirect URLs
4. Test production URL

**Cost Estimate:**
- Supabase: Free (up to 500MB database)
- Vercel: Free (up to 100GB bandwidth)
- Domain: ~£10/year
- Total: **£10/year** until you hit scale!

---

## 💡 Business Tips

### Pricing Strategy

Your cost: £10/year
Your pricing: £99/month
Your margin: 99.9%

**Don't underprice!** £99/month is FAIR VALUE for:
- 8 hours saved per month (£400 value at £50/hour)
- Zero commission disputes
- Real-time visibility
- Professional image

### Customer Acquisition

**Week 1-2: Beta Launch**
- Offer 50% off for life to first 50 customers
- Target: 10 beta customers

**Where to Find Customers:**
- LinkedIn: Search "Sales Manager UK"
- Facebook Groups: "UK Business Owners", "Sales Professionals UK"
- Reddit: r/sales, r/UKBusiness
- Cold email: Find companies selling solar, HVAC, office equipment

**Messaging:**
"I noticed you manage a sales team. Quick question: how long does it take you to calculate commissions each month?"

### Scaling Roadmap

**Month 1-3: MVP & Validation**
- 10-20 beta customers
- Collect feedback
- Fix critical bugs

**Month 4-6: Growth**
- 50-100 customers
- Add requested features
- Paid advertising

**Month 7-12: Scale**
- 200-500 customers
- Hire support person
- Consider raising prices

**Revenue Targets:**
- Month 3: £1,000 MRR (10 customers @ £99)
- Month 6: £5,000 MRR (50 customers)
- Month 12: £20,000 MRR (200 customers)

---

## 🆘 Common Issues

### "Organization not found"

**Cause:** User created in Supabase Auth but not in users table
**Fix:**
```sql
-- Find the auth user ID
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Insert into users table (replace IDs)
INSERT INTO users (id, organization_id, email, name, role)
VALUES ('auth-user-id', 'your-org-id', 'email@example.com', 'Your Name', 'admin');
```

### "Deal number not generating"

**Cause:** Trigger not created
**Fix:** Re-run the `supabase/schema.sql` file in SQL Editor

### "Commission calculations are wrong"

**Remember:** Values are stored in PENCE, not pounds!
- £100 = 10000 in database
- Always use `penceToPounds()` for display
- Always use `poundsToPence()` when saving

---

## 📞 Support

- **Documentation:** This file + README.md + DEPLOYMENT.md
- **Database Schema:** supabase/schema.sql
- **Commission Logic:** lib/commission-calculator.ts

---

## 🎉 You're Ready!

You now have a complete, production-ready commission tracking SaaS.

**What makes this special:**
1. **Threshold Rollover Logic** - No competitor does this properly
2. **UK-First Design** - Built for UK sales teams (£, terminology)
3. **Simple Pricing** - Per-company, not per-user
4. **Fast Setup** - 10 minutes from signup to first report

**Your next steps:**
1. Deploy to production (see DEPLOYMENT.md)
2. Get 10 beta customers
3. Iterate based on feedback
4. Scale to £10k MRR

Good luck building your SaaS! 🚀💰
