# ViewingReports MVP - Deployment Guide

## Quick Deploy to Vercel

### Prerequisites

1. **GitHub Account** - Push this code to a GitHub repository
2. **Vercel Account** - Sign up at https://vercel.com
3. **Neon Account** - For PostgreSQL database (https://neon.tech)
4. **API Keys**:
   - Anthropic API key (https://console.anthropic.com)
   - Twilio account (https://twilio.com)
   - Resend API key (https://resend.com)
   - Cloudflare R2 (https://cloudflare.com/products/r2)
   - Ideal Postcodes (optional, https://ideal-postcodes.co.uk)

### Step-by-Step Deployment

#### 1. Set Up Database (Neon)

```bash
# Go to https://neon.tech
# Create a new project
# Copy the connection string (postgres://...)
```

#### 2. Push to GitHub

```bash
cd viewing-reports
git init
git add .
git commit -m "Initial commit - ViewingReports MVP"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

#### 3. Deploy to Vercel

1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - Framework Preset: **Next.js**
   - Root Directory: `./viewing-reports`
   - Build Command: `npm run build`
   - Output Directory: `.next`

#### 4. Add Environment Variables

In Vercel dashboard, go to Settings → Environment Variables and add:

```
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
ANTHROPIC_API_KEY=sk-ant-...
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+447...
CLOUDFLARE_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=viewing-photos
R2_BUCKET_ID=...
RESEND_API_KEY=re_...
FROM_EMAIL=noreply@yourdomain.com
IDEAL_POSTCODES_API_KEY=...
```

#### 5. Initialize Database

After deployment, run migrations:

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link to your project
vercel link

# Run database migration
vercel env pull .env.local
npx prisma db push
```

#### 6. Test Your Deployment

1. Visit your Vercel URL
2. Sign up for an account
3. Create a test viewing report
4. Check email and SMS delivery

### Cloudflare R2 Setup

1. Go to Cloudflare Dashboard
2. Create R2 bucket: `viewing-photos`
3. Enable public access (or use custom domain)
4. Create API token with R2 read/write permissions
5. Copy Account ID, Access Key, Secret Key, and Bucket ID

### Twilio Setup

1. Create Twilio account
2. Get a UK phone number (+44)
3. Copy Account SID and Auth Token
4. Fund your account (£10 minimum for testing)

### Resend Setup

1. Create Resend account
2. Verify your domain (or use onboarding domain for testing)
3. Create API key
4. Set FROM_EMAIL to verified address

### Anthropic Setup

1. Create Anthropic account
2. Add credits to your account (minimum $5)
3. Generate API key
4. Copy to ANTHROPIC_API_KEY

## Custom Domain

1. In Vercel dashboard, go to Settings → Domains
2. Add your custom domain (e.g., viewingreports.co.uk)
3. Update DNS records as instructed
4. Update NEXTAUTH_URL to your custom domain
5. Update Resend FROM_EMAIL to match your domain

## Monitoring & Maintenance

### Check Logs

```bash
vercel logs
```

### View Database

```bash
npx prisma studio
```

### Monitor Costs

- **Vercel**: Check usage in dashboard
- **Neon**: Monitor database size
- **Anthropic**: Track API usage
- **Twilio**: Monitor SMS credits
- **Cloudflare R2**: Check storage usage

## Troubleshooting

### Build Fails

1. Check environment variables are set
2. Verify database connection string
3. Check build logs for errors

### Database Connection Issues

1. Verify DATABASE_URL is correct
2. Check Neon dashboard for database status
3. Whitelist Vercel IPs (or use connection pooling)

### API Errors

1. Check API keys are valid
2. Verify sufficient credits/balance
3. Review error logs in Vercel

## Scaling

### Performance Optimization

1. Enable Vercel Edge Functions for auth
2. Use Vercel Image Optimization
3. Add caching headers
4. Implement CDN for static assets

### Database Scaling

1. Upgrade Neon plan as needed
2. Add read replicas for heavy load
3. Enable connection pooling

### Cost Optimization

1. Monitor API usage
2. Implement rate limiting
3. Compress images before upload
4. Auto-delete old photos (>30 days)

## Security Checklist

- [ ] HTTPS enforced (Vercel default)
- [ ] Environment variables secured
- [ ] Database connection pooling enabled
- [ ] API rate limiting implemented
- [ ] Input validation on all forms
- [ ] SQL injection prevention (Prisma)
- [ ] XSS protection enabled
- [ ] CORS configured correctly

## Backup Strategy

1. **Database**: Neon auto-backups (7-day retention)
2. **Photos**: R2 versioning enabled
3. **Code**: Git repository

## Production Checklist

- [ ] All environment variables set
- [ ] Database migrated successfully
- [ ] Custom domain configured
- [ ] Email sending verified
- [ ] SMS sending verified
- [ ] AI report generation tested
- [ ] Mobile PWA installation tested
- [ ] Performance tested on 3G
- [ ] Error monitoring enabled
- [ ] Analytics configured

## Support

For deployment issues:
- Check Vercel documentation
- Review Neon docs for database issues
- Contact support@viewingreports.co.uk

---

**Estimated deployment time**: 30-45 minutes

**Monthly costs (50 users)**: ~£270
**Monthly revenue (50 users × £99)**: ~£4,950
**Net margin**: ~95%
