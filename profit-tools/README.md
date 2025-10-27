# Profit Tools - Business Calculator Suite

A professional suite of 5 essential business calculators designed to help entrepreneurs make data-driven decisions about pricing, profitability, and growth.

## 🎯 What's Included

1. **💰 Pricing Calculator** - Calculate optimal prices based on costs and desired profit margins
2. **📊 Profit Margin Calculator** - Analyze gross profit, net profit, and markup percentages
3. **⏱️ Freelance Rate Calculator** - Determine ideal hourly/project rates based on income goals
4. **📈 ROI Calculator** - Calculate return on investment for business decisions
5. **⚖️ Break-Even Calculator** - Find out how many sales needed to cover costs

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- A Stripe account (for payment processing)

### Installation

1. **Clone or navigate to the project:**
```bash
cd profit-tools
```

2. **Install dependencies:**
```bash
npm install
```

3. **Run the development server:**
```bash
npm run dev
```

4. **Open your browser:**
Visit [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
profit-tools/
├── app/                          # Next.js app directory
│   ├── calculators/              # Calculator pages
│   │   ├── pricing/
│   │   ├── profit-margin/
│   │   ├── freelance-rate/
│   │   ├── roi/
│   │   └── break-even/
│   ├── page.tsx                  # Landing page
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── components/
│   └── calculators/              # Calculator components
│       ├── PricingCalculator.tsx
│       ├── ProfitMarginCalculator.tsx
│       ├── FreelanceRateCalculator.tsx
│       ├── ROICalculator.tsx
│       └── BreakEvenCalculator.tsx
├── public/                       # Static assets
├── package.json
└── README.md
```

## 💻 Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run type checking
npm run type-check

# Run linter
npm run lint
```

## 🎨 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Deployment:** Vercel (recommended)
- **Payments:** Stripe (to be integrated)

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Coming soon - Stripe integration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PRICE_ID=your_product_price_id

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 📦 Deployment

### Deploy to Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow the prompts to link your project

4. Set environment variables in Vercel dashboard

### Alternative: Deploy to Any Platform

This is a standard Next.js app and can be deployed to:
- Netlify
- Railway
- AWS
- Google Cloud
- Any Node.js hosting

## 💳 Adding Payments (Next Steps)

See `STRIPE_SETUP.md` for detailed instructions on:
1. Creating Stripe products
2. Setting up checkout
3. Handling webhooks
4. Managing customer access

## 🎯 Business Model

- **Price:** $47 one-time payment
- **Access:** Lifetime access to all calculators
- **No subscriptions:** Simple, honest pricing
- **Target:** Small business owners, freelancers, entrepreneurs

## 🛠️ Customization

### Changing the Price

1. Update landing page: `app/page.tsx` (search for "$47")
2. Update Stripe product price
3. Update payment integration

### Adding More Calculators

1. Create component in `components/calculators/YourCalculator.tsx`
2. Create page in `app/calculators/your-calculator/page.tsx`
3. Add link in `app/calculators/layout.tsx`
4. Add card in `app/calculators/page.tsx`

### Customizing Design

- Colors: Edit `tailwind.config.ts`
- Global styles: Edit `app/globals.css`
- Layout: Edit `app/layout.tsx` and calculator layout

## 📝 To-Do List

- [ ] Set up Stripe account and get API keys
- [ ] Create Stripe product for $47 one-time payment
- [ ] Integrate payment flow
- [ ] Add user authentication (optional)
- [ ] Deploy to production
- [ ] Set up custom domain
- [ ] Add Google Analytics (optional)
- [ ] Create social media graphics
- [ ] Launch marketing campaign

## 🐛 Troubleshooting

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Type Errors

```bash
# Run type check to see all errors
npm run type-check
```

### Styling Issues

```bash
# Rebuild Tailwind
npm run build
```

## 📧 Support

If you need help:
1. Check the documentation files in this repo
2. Review Next.js documentation: https://nextjs.org/docs
3. Check Tailwind CSS docs: https://tailwindcss.com/docs

## 📄 License

This is a commercial product. All rights reserved.

## 🎉 Launch Checklist

- [x] All 5 calculators built and tested
- [x] Landing page with sales copy
- [x] Mobile-responsive design
- [ ] Stripe payment integration
- [ ] Deployed to production
- [ ] Custom domain configured
- [ ] Analytics set up
- [ ] Social proof/testimonials added
- [ ] Launch on Product Hunt / Twitter

---

**Built with Next.js 16 + TypeScript + Tailwind CSS**

**Ready to help entrepreneurs make better business decisions!** 🚀
