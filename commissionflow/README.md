# CommissionFlow

Commission tracking SaaS for UK sales teams. Track deals, calculate commissions automatically (with BDM threshold rollovers), and pay your team accurately.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API
3. Copy your project URL and anon key
4. Run the SQL schema from `supabase/schema.sql` in the SQL Editor

### 3. Set Up Stripe

1. Create account at [stripe.com](https://stripe.com)
2. Create three products:
   - Starter: £49/month
   - Professional: £99/month
   - Business: £199/month
3. Copy price IDs from each product

### 4. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your Supabase and Stripe credentials.

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
commissionflow/
├── app/                    # Next.js 14 App Router
│   ├── (auth)/            # Auth pages (login, signup)
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── (marketing)/       # Public marketing pages
│   └── api/               # API routes
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── auth/              # Auth components
│   ├── dashboard/         # Dashboard components
│   └── deals/             # Deal management components
├── lib/
│   ├── supabase/          # Supabase client & helpers
│   ├── commission-calculator.ts
│   ├── stripe.ts
│   └── utils.ts
├── types/                 # TypeScript types
└── supabase/             # Database schema
```

## 🏗️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui
- **Charts:** Recharts
- **Payments:** Stripe
- **Deployment:** Vercel

## 🔑 Key Features

- ✅ Deal pipeline tracking (To Do → Paid)
- ✅ Automatic commission calculations
- ✅ BDM threshold rollover logic (£3,500)
- ✅ Monthly commission reports
- ✅ Team management
- ✅ Multi-tenant (organization-based)
- ✅ Stripe subscriptions
- ✅ CSV export

## 🔐 Security

- Row-level security (RLS) enabled in Supabase
- Organization-based data isolation
- Server-side session validation
- Input validation with Zod

## 📊 Database Schema

See `supabase/schema.sql` for the complete schema including:
- Organizations
- Users (with roles)
- Deals
- Products
- Commission Records
- Audit Logs

## 🚢 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Set Up Stripe Webhooks

1. In Stripe Dashboard, go to Developers > Webhooks
2. Add endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Select events: `customer.subscription.*`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

## 📈 Commission Logic

### Telesales Commission
- **Rule:** 10% of initial profit
- **Calculation:** `initialProfit = dealValue - buyInCost - installationCost - miscCosts`
- **Commission:** `initialProfit × 0.10`

### BDM Commission
- **Rule:** £3,500 monthly threshold
- **Rollover:** Shortfalls carry to next month
- **Calculation:**
  - Monthly profit = Sum of remaining profit (after telesales commission)
  - Cumulative = Monthly profit + previous month carryover
  - If cumulative ≥ £3,500 → BDM gets paid the full cumulative amount
  - If cumulative < £3,500 → No payment, shortfall carries forward

## 🤝 Contributing

This is a commercial project. For questions or issues, contact the maintainer.

## 📄 License

Proprietary - All rights reserved

## 🆘 Support

For setup help or questions:
- Email: support@commissionflow.com
- Documentation: [docs.commissionflow.com](https://docs.commissionflow.com)

---

Built with ❤️ for UK sales teams
