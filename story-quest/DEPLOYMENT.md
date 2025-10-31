# 🚀 Production Deployment Guide

## Prerequisites Checklist

Before deploying to production, ensure you have:

- [ ] Vercel account (free tier is fine to start)
- [ ] Production PostgreSQL database (Neon recommended - free tier available)
- [ ] Stripe account (both test and live mode configured)
- [ ] Domain name (optional but recommended)
- [ ] Email service (Resend - free tier: 3,000 emails/month)
- [ ] Error tracking (Sentry - optional but recommended)

---

## Environment Variables

Create a `.env.production` file with these variables:

### Database
```bash
DATABASE_URL="postgresql://user:password@host:5432/storyquest?sslmode=require"
```

### NextAuth
```bash
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="[Generate with: openssl rand -base64 32]"
```

### Stripe (Production)
```bash
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### Email (Resend)
```bash
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="noreply@yourdomain.com"
```

### Application
```bash
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

### Optional: Analytics & Monitoring
```bash
NEXT_PUBLIC_POSTHOG_KEY="phc_..."
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"
SENTRY_DSN="https://...@sentry.io/..."
```

---

## Step 1: Database Setup (Neon - Free)

### 1.1 Create Database
```bash
# Go to https://neon.tech
# Create free account
# Create new project: "storyquest-production"
# Copy connection string
```

### 1.2 Set Environment Variable
```bash
# In Vercel dashboard:
# Settings → Environment Variables
# Add: DATABASE_URL = [your Neon connection string]
```

### 1.3 Run Migrations
```bash
# From your local machine (after setting DATABASE_URL):
npx prisma migrate deploy
```

### 1.4 Seed Initial Data
```bash
npm run prisma:seed
```

---

## Step 2: Vercel Deployment

### 2.1 Connect Repository
```bash
# Go to https://vercel.com
# Click "Import Project"
# Connect GitHub → Select "Scott-Davies" repo
# Select branch: main (or your production branch)
```

### 2.2 Configure Build Settings
```
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
Root Directory: story-quest
```

### 2.3 Add Environment Variables
In Vercel Dashboard → Settings → Environment Variables:
- Add ALL variables from `.env.production`
- Set environment: Production
- Click "Save"

### 2.4 Deploy
```
Click "Deploy"
Wait 2-3 minutes
Visit your deployment URL
```

---

## Step 3: Stripe Configuration

### 3.1 Switch to Live Mode
```bash
# In Stripe Dashboard:
# Toggle from "Test mode" to "Live mode" (top right)
```

### 3.2 Create Products (Production)
```
Product 1: Monthly Pro Subscription
- Name: "Pro Monthly"
- Price: £7.99/month
- Copy Price ID → Add to Vercel env vars

Product 2: Yearly Pro Subscription
- Name: "Pro Yearly"
- Price: £79.99/year
- Copy Price ID → Add to Vercel env vars

Product 3: School License
- Name: "Institutional License"
- Price: £2,500/year
- Copy Price ID → Add to Vercel env vars
```

### 3.3 Configure Webhook (Production)
```
Stripe Dashboard → Developers → Webhooks → Add endpoint

Endpoint URL: https://yourdomain.com/api/webhooks/stripe
Description: StoryQuest Production

Events to listen to:
✓ checkout.session.completed
✓ customer.subscription.created
✓ customer.subscription.updated
✓ customer.subscription.deleted
✓ invoice.payment_succeeded
✓ invoice.payment_failed

Copy webhook secret → Add to Vercel: STRIPE_WEBHOOK_SECRET
```

---

## Step 4: Email Configuration (Resend)

### 4.1 Verify Domain
```bash
# Go to https://resend.com
# Add your domain
# Add DNS records (provided by Resend):
  - TXT record for verification
  - MX records for email delivery
  - DKIM records for authentication
```

### 4.2 Create API Key
```
Settings → API Keys → Create
Name: "StoryQuest Production"
Permission: Sending access
Copy key → Add to Vercel: RESEND_API_KEY
```

### 4.3 Set From Address
```
Use: noreply@yourdomain.com
Or: hello@yourdomain.com
Add to Vercel: RESEND_FROM_EMAIL
```

---

## Step 5: Custom Domain (Optional)

### 5.1 Add Domain to Vercel
```
Project Settings → Domains → Add
Enter: yourdomain.com
```

### 5.2 Configure DNS
```
Add these records at your domain registrar:

A Record:
Name: @
Value: 76.76.21.21

CNAME Record:
Name: www
Value: cname.vercel-dns.com
```

### 5.3 Enable HTTPS
```
Vercel automatically provisions SSL certificates
Wait 5-10 minutes for DNS propagation
```

---

## Step 6: Security Checklist

### 6.1 Authentication
- [ ] NEXTAUTH_SECRET is strong (32+ characters)
- [ ] Session strategy is JWT
- [ ] Passwords hashed with bcrypt (salt rounds: 10)

### 6.2 API Routes
- [ ] All protected routes check authentication
- [ ] User can only access their own data
- [ ] Input validation with Zod on all routes
- [ ] Rate limiting implemented (see below)

### 6.3 Database
- [ ] SSL mode enabled (sslmode=require)
- [ ] Connection pooling configured
- [ ] Regular backups enabled (Neon auto-backups)

### 6.4 Environment
- [ ] No secrets in codebase
- [ ] .env files in .gitignore
- [ ] NODE_ENV=production set

---

## Step 7: Performance Optimization

### 7.1 Database Indexes
```sql
-- Already in schema.prisma:
@@index([userId])
@@index([storyId])
@@index([slug])
@@index([status, featured])
```

### 7.2 Next.js Image Optimization
```typescript
// Already configured in next.config.js
images: {
  domains: ['localhost'],
  remotePatterns: [{ protocol: 'https', hostname: '**' }]
}
```

### 7.3 Caching Headers
```typescript
// Add to API routes:
return NextResponse.json(data, {
  headers: {
    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
  }
})
```

---

## Step 8: Monitoring & Errors

### 8.1 Vercel Analytics (Free)
```
Automatically enabled on Vercel
View: Dashboard → Analytics
Tracks: Page views, performance, Core Web Vitals
```

### 8.2 Sentry Error Tracking (Optional)
```bash
npm install @sentry/nextjs

# Add to next.config.js:
const { withSentryConfig } = require('@sentry/nextjs')

module.exports = withSentryConfig(nextConfig, {
  silent: true,
  org: 'your-org',
  project: 'storyquest'
})
```

### 8.3 Database Monitoring
```
Neon Dashboard → Monitoring
- Query performance
- Connection count
- Storage usage
```

---

## Step 9: Testing in Production

### 9.1 Authentication Flow
- [ ] Sign up with new email
- [ ] Receive welcome email
- [ ] Login successful
- [ ] Session persists
- [ ] Logout works

### 9.2 Child Management
- [ ] Create child profile
- [ ] View child list
- [ ] Edit child details
- [ ] Delete child (with confirmation)

### 9.3 Story Reading
- [ ] Browse stories
- [ ] View story details
- [ ] Start reading session
- [ ] Make choices (story advances)
- [ ] Audio plays (if files available)
- [ ] Complete story
- [ ] Achievement unlocked

### 9.4 Payment Flow (Test Mode First)
- [ ] Subscribe to Pro
- [ ] Stripe checkout loads
- [ ] Payment processes
- [ ] Webhook receives event
- [ ] User upgraded to Pro
- [ ] Access granted to premium features

---

## Step 10: Launch Checklist

### Pre-Launch
- [ ] All environment variables set
- [ ] Database migrations run
- [ ] Seed data loaded (stories, achievements)
- [ ] SSL certificate active
- [ ] Custom domain configured (if applicable)
- [ ] Test accounts created
- [ ] All user flows tested

### Launch Day
- [ ] Monitor Vercel deployment logs
- [ ] Check error tracking (Sentry)
- [ ] Monitor database connections
- [ ] Test from multiple devices
- [ ] Check mobile responsiveness
- [ ] Verify emails sending

### Post-Launch
- [ ] Set up daily database backups
- [ ] Monitor performance metrics
- [ ] Track user signups
- [ ] Gather user feedback
- [ ] Fix critical bugs immediately

---

## Troubleshooting

### Build Fails
```bash
# Check build logs in Vercel dashboard
# Common issues:
- TypeScript errors → Fix locally first
- Missing dependencies → Check package.json
- Environment variables → Ensure all set
```

### Database Connection Issues
```bash
# Verify connection string:
- SSL mode required for Neon
- Connection pooling enabled
- Firewall allows Vercel IPs
```

### Stripe Webhook Not Working
```bash
# Test webhook:
curl -X POST https://yourdomain.com/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{"type":"ping"}'

# Check:
- Webhook URL is correct
- Webhook secret matches
- Events selected in Stripe
- Check Vercel function logs
```

### Email Not Sending
```bash
# Verify:
- Domain verified in Resend
- DNS records correct
- API key valid
- From address matches domain
- Check Resend logs
```

---

## Rollback Plan

If deployment fails:

### 1. Immediate Rollback
```
Vercel Dashboard → Deployments
Click previous working deployment
Click "Promote to Production"
```

### 2. Database Rollback
```bash
# If migration failed:
npx prisma migrate resolve --rolled-back [migration_name]

# Restore from backup (Neon):
Dashboard → Backups → Restore to point in time
```

### 3. Notify Users
```
- Status page update
- Email notification (if major issue)
- Social media update
```

---

## Scaling Considerations

### When to Upgrade

**Database (Neon Free → Pro)**
- Free tier: 0.5 GB storage, 100 hours compute/month
- Upgrade when: >500 active users

**Vercel (Hobby → Pro)**
- Free tier: 100 GB bandwidth, unlimited deployments
- Upgrade when: >10K page views/month

**Stripe (No upgrade needed)**
- Standard fees: 1.4% + 20p (UK cards)
- Volume discounts available at £80K+/month

---

## Support Contacts

### Technical Issues
- Vercel Support: https://vercel.com/support
- Neon Support: support@neon.tech
- Stripe Support: https://support.stripe.com

### Community
- Next.js Discord: https://nextjs.org/discord
- Vercel Community: https://github.com/vercel/next.js/discussions

---

## Cost Estimates (First 6 Months)

| Service | Plan | Cost |
|---------|------|------|
| Vercel | Hobby (free) | £0 |
| Neon Database | Free tier | £0 |
| Stripe | Pay-as-you-go | 1.4% + 20p per transaction |
| Resend | Free tier | £0 (up to 3K emails/month) |
| Domain | Yearly | £10-15/year |
| **Total** | | **~£1-2/month** |

At 100 paying users (£7.99/month):
- Revenue: £799/month
- Stripe fees: ~£15/month
- Platform costs: ~£2/month
- **Profit: ~£782/month** 💰

---

## Next Steps

1. ✅ Read this guide thoroughly
2. ✅ Set up accounts (Vercel, Neon, Stripe, Resend)
3. ✅ Configure environment variables
4. ✅ Test locally with production variables
5. ✅ Deploy to Vercel
6. ✅ Test in production
7. ✅ Monitor and iterate

**You're ready to launch!** 🚀

---

*Last Updated: 2025-10-31*
*Version: 1.0*
