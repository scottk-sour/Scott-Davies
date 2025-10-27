# Deployment Guide - Profit Tools

This guide covers deploying your Profit Tools app to production.

## Option 1: Deploy to Vercel (Recommended - Easiest)

Vercel is made by the creators of Next.js and offers the best Next.js hosting experience.

### Prerequisites

- GitHub account
- Vercel account (free tier available)

### Steps

#### 1. Push Code to GitHub

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit - Profit Tools app"

# Create a new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/profit-tools.git
git branch -M main
git push -u origin main
```

#### 2. Deploy to Vercel

**Option A: Using Vercel Dashboard (Easiest)**

1. Go to [vercel.com](https://vercel.com)
2. Sign up / Log in
3. Click **"Add New Project"**
4. Import your GitHub repository
5. Configure project:
   - **Framework Preset:** Next.js (auto-detected)
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next` (default)
6. Add environment variables (see below)
7. Click **"Deploy"**

**Option B: Using Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: profit-tools
# - Directory: ./ (current)

# Deploy to production
vercel --prod
```

#### 3. Set Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables:

```bash
# Stripe (add after you complete Stripe setup)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PRICE_ID=price_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx (after configuring webhooks)

# Site URL (Vercel gives you a .vercel.app domain initially)
NEXT_PUBLIC_SITE_URL=https://your-project.vercel.app
```

**Important:** After adding environment variables, redeploy:
- Go to Deployments tab
- Click "..." on latest deployment
- Click "Redeploy"

#### 4. Configure Custom Domain (Optional)

1. In Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain (e.g., profittools.com)
3. Follow DNS instructions provided
4. Update `NEXT_PUBLIC_SITE_URL` to your custom domain

#### 5. Configure Stripe Webhooks

1. In Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Select events (see STRIPE_SETUP.md)
4. Copy webhook signing secret
5. Add to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`
6. Redeploy

### Done! Your app is live! 🎉

---

## Option 2: Deploy to Netlify

### Steps

1. Push code to GitHub (same as above)
2. Go to [netlify.com](https://netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect to GitHub and select your repo
5. Configure:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
6. Add environment variables (same as Vercel)
7. Deploy

**Note:** Netlify works great but Vercel has better Next.js optimization.

---

## Option 3: Deploy to Railway

Railway offers easy deployment with databases if needed later.

### Steps

1. Go to [railway.app](https://railway.app)
2. Sign up / Log in
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway auto-detects Next.js
6. Add environment variables
7. Deploy

---

## Option 4: Self-Host (VPS/Docker)

If you want full control, deploy to your own server.

### Prerequisites

- Ubuntu 20.04+ VPS (DigitalOcean, Linode, AWS, etc.)
- Domain name pointed to your server
- Basic server knowledge

### Quick Setup

```bash
# On your server
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Clone your repo
git clone https://github.com/YOUR_USERNAME/profit-tools.git
cd profit-tools

# Install dependencies
npm install

# Create .env.local with your variables

# Build
npm run build

# Start with PM2
pm2 start npm --name "profit-tools" -- start
pm2 save
pm2 startup
```

### Set up Nginx as Reverse Proxy

```bash
# Install Nginx
sudo apt install nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/profit-tools

# Add this:
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/profit-tools /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Set up SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## Post-Deployment Checklist

### Immediately After Deployment

- [ ] Visit your live URL - does it load?
- [ ] Test all 5 calculators - do they work?
- [ ] Check mobile responsiveness
- [ ] Test on different browsers (Chrome, Safari, Firefox)
- [ ] Verify environment variables are set
- [ ] Check for any console errors

### Before Accepting Payments

- [ ] Complete Stripe setup (see STRIPE_SETUP.md)
- [ ] Test checkout flow in production
- [ ] Verify success page works
- [ ] Test webhook delivery
- [ ] Confirm email receipts are sent
- [ ] Make a real $1 test purchase (you can refund it)

### SEO & Performance

- [ ] Add Google Analytics (optional)
- [ ] Submit sitemap to Google Search Console
- [ ] Check page load speed (should be < 3 seconds)
- [ ] Verify meta tags are correct
- [ ] Test social media sharing (Open Graph images)

### Legal & Business

- [ ] Add Privacy Policy page
- [ ] Add Terms of Service page
- [ ] Add Contact/Support email
- [ ] Set up business email forwarding
- [ ] Prepare customer support process

---

## Continuous Deployment

Set up automatic deployments when you push to GitHub:

### Vercel (Auto-configured)

- Every push to `main` = automatic deployment
- Pull requests get preview deployments
- No configuration needed!

### GitHub Actions (For other hosts)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      # Add your deployment command here
```

---

## Monitoring & Maintenance

### Add Error Monitoring (Recommended)

**Option 1: Sentry (Free tier available)**

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

**Option 2: LogRocket**

```bash
npm install logrocket
```

### Add Uptime Monitoring

Free services that ping your site:
- [UptimeRobot](https://uptimerobot.com) - Free
- [BetterStack](https://betterstack.com) - Free tier
- [Pingdom](https://pingdom.com) - Free tier

### Analytics

**Google Analytics 4:**

1. Create GA4 property
2. Get Measurement ID
3. Add to `app/layout.tsx`:

```typescript
<Script src={`https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX`} />
<Script id="google-analytics">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
  `}
</Script>
```

---

## Troubleshooting

### Build Fails

```bash
# Check build locally first
npm run build

# If it works locally but fails on host:
# - Check Node.js version matches
# - Verify all environment variables are set
# - Check build logs for specific errors
```

### Environment Variables Not Working

```bash
# Make sure they're prefixed correctly:
# - NEXT_PUBLIC_* for client-side variables
# - Regular names for server-side only
# Redeploy after adding variables!
```

### 404 Errors

```bash
# Ensure your hosting supports Next.js App Router
# Vercel: Works automatically
# Others: May need special configuration
```

### Slow Performance

```bash
# Enable Next.js caching
# Use Vercel Edge Network (automatic on Vercel)
# Optimize images (Next.js does this automatically)
# Enable Gzip compression in your web server
```

---

## Scaling Considerations

### If You Get More Than 10,000 Users

1. **Upgrade hosting plan** - More compute resources
2. **Add CDN** - Vercel includes this automatically
3. **Database** - If you add user accounts later
4. **Caching** - Redis for frequently accessed data
5. **Load balancer** - Multiple server instances

### If You Add Database Later

Consider:
- **Vercel Postgres** - Integrated with Vercel
- **PlanetScale** - MySQL compatible, generous free tier
- **Supabase** - PostgreSQL with realtime features
- **MongoDB Atlas** - NoSQL option

---

## Cost Estimates

### Monthly Costs (Expected)

**Vercel (Recommended):**
- Free tier: 0-1,000 users ✓
- Pro plan ($20/mo): 1,000-10,000 users
- Enterprise (custom): 10,000+ users

**Domain Name:**
- $12-15/year (any registrar)

**Stripe Fees:**
- 2.9% + $0.30 per transaction
- On $47 sale: $1.67 fee, you keep $45.33

**Total minimum:** ~$1-2/month initially (just domain)

---

## Launch Day Checklist

**Morning of Launch:**

- [ ] Double-check all calculators work
- [ ] Test payment flow one more time
- [ ] Verify success page is correct
- [ ] Check all links work
- [ ] Mobile testing on real devices
- [ ] Prepare social media posts
- [ ] Screenshot the app for sharing

**Launch:**

- [ ] Post on Twitter with #buildinpublic
- [ ] Share on relevant subreddits (r/SideProject, r/Entrepreneur)
- [ ] Submit to Product Hunt
- [ ] Email to your network
- [ ] Post in relevant communities

**Day 1:**

- [ ] Monitor for bugs/errors
- [ ] Respond to feedback quickly
- [ ] Track analytics
- [ ] Celebrate your first sale! 🎉

---

## Support & Updates

### Updating Your App

```bash
# Make changes locally
git add .
git commit -m "Description of changes"
git push origin main

# If using Vercel, it auto-deploys!
# Others may need manual deployment
```

### Rolling Back

If something breaks:

**Vercel:**
1. Go to Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

**Others:**
```bash
git revert HEAD
git push origin main
```

---

**You're ready to deploy! Good luck with your launch!** 🚀

Questions? Check:
- README.md - General info
- STRIPE_SETUP.md - Payment integration
- Next.js Deployment Docs: https://nextjs.org/docs/deployment
