# ViewingReports - MVP

Mobile-first property viewing report generator for UK estate agents. Transform quick voice/text notes into professional vendor reports in < 30 seconds using AI.

## Features (MVP)

✅ **Mobile-First Design**
- Responsive PWA (installable on phone)
- Bottom navigation optimized for thumbs
- Large touch targets (min 44px)
- Fast loading & optimistic UI

✅ **Quick Viewing Form**
- 3-step wizard design
- Voice-to-text notes (browser native)
- Photo upload (camera integration)
- Star ratings (1-5) for interest/finance/seriousness

✅ **AI Report Generation**
- Powered by Anthropic Claude
- Professional UK estate agent language
- Generates in 15-30 seconds
- Email + SMS delivery

✅ **Viewing History**
- Searchable list of past viewings
- View generated reports
- Track delivery status

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL + Prisma ORM
- **AI**: Anthropic Claude API
- **SMS**: Twilio
- **Email**: Resend
- **Storage**: Cloudflare R2 (photos)
- **Auth**: Custom (simplified for MVP)

## Prerequisites

- Node.js 18+
- PostgreSQL database (local or cloud like Neon)
- API keys for:
  - Anthropic
  - Twilio
  - Resend
  - Cloudflare R2
  - Ideal Postcodes (optional)

## Setup Instructions

### 1. Install Dependencies

```bash
cd viewing-reports
npm install
```

### 2. Set Up Database

Create a PostgreSQL database and note the connection URL.

### 3. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in all the required values:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/viewing_reports"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"

# AI
ANTHROPIC_API_KEY="sk-ant-..."

# SMS
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="+447..."

# Storage
CLOUDFLARE_ACCOUNT_ID="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET_NAME="viewing-photos"
R2_BUCKET_ID="..."

# Email
RESEND_API_KEY="re_..."
FROM_EMAIL="noreply@viewingreports.co.uk"

# UK Postcodes API
IDEAL_POSTCODES_API_KEY="..."
```

### 4. Initialize Database

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Open Prisma Studio to view data
npm run db:studio
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Creating Your First Viewing Report

1. **Sign Up**: Create an account at `/signup`
2. **New Viewing**: Click the big "+" in bottom nav
3. **Fill Form**:
   - Step 1: Property & vendor details
   - Step 2: Viewer details & ratings
   - Step 3: Voice notes & photos
4. **Generate**: Click "Generate Report"
5. **Done**: Report sent via email & SMS to vendor

### Voice Recording

The app uses the browser's native Web Speech API (no cost):
- Tap "Start Voice Note"
- Speak naturally
- Tap "Stop Recording"
- Transcript appears automatically

**Supported browsers**: Chrome (Android/Desktop), Safari (iOS)

### Photo Upload

- Tap "Take Photo" to use camera
- Tap "Upload" to select from gallery
- Max 10 photos per viewing
- Auto-compresses before upload

## Database Schema

```
Users (Estate Agents)
  ├── Properties
  │     └── Viewings
  │           ├── ViewingPhotos
  │           └── Report
  └── Agency (optional)
        └── Subscription
```

## API Routes

### Auth
- `POST /api/auth/signup` - Create account
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signout` - Sign out

### Viewings
- `POST /api/viewings/create` - Create viewing

### Reports
- `POST /api/reports/generate` - Generate & send report

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Connect to your PostgreSQL database (Neon recommended)
```

### Environment Variables on Vercel

Add all variables from `.env.local` to your Vercel project settings.

### Database Migrations

For production, use proper migrations:

```bash
npm run db:migrate
```

## PWA Installation

On mobile:
1. Visit the deployed URL
2. Tap browser menu
3. Select "Add to Home Screen"
4. App icon appears on home screen

## Cost Breakdown (50 users)

- Vercel: £16/month
- Neon DB: £19/month
- Cloudflare R2: £5/month
- Anthropic API: £50/month (2 reports/agent/day)
- Twilio SMS: £30/month (1 SMS/report)
- Stripe fees: £150/month (3%)

**Total**: £270/month
**Revenue** (50 users × £99): £4,950/month
**Net margin**: £4,680/month (95%)

## Troubleshooting

### Voice recording not working
- Ensure HTTPS (required for microphone access)
- Check browser permissions
- Supported: Chrome, Safari only

### Database connection failed
- Verify DATABASE_URL is correct
- Check database is running
- Run `npm run db:push` to sync schema

### Photos won't upload
- Check R2 credentials
- Verify bucket exists
- Check file size (max 10MB)

### AI generation failing
- Verify ANTHROPIC_API_KEY
- Check API credit balance
- Review console logs

## Next Steps (Post-MVP)

- [ ] Offline mode (service worker + IndexedDB)
- [ ] Calendar integration
- [ ] Team/agency accounts
- [ ] Stripe subscriptions
- [ ] Custom branding
- [ ] Analytics dashboard
- [ ] CRM integrations (Rightmove, Zoopla)

## Support

For issues or questions:
- Check the troubleshooting section above
- Review API documentation
- Contact: support@viewingreports.co.uk

## License

Proprietary - All Rights Reserved

---

**Built for UK estate agents who value their time.**
