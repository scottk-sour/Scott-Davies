# Stripe Payment Integration Guide

This guide will walk you through integrating Stripe for one-time $47 payments.

## Step 1: Create Stripe Account

1. Go to [https://stripe.com](https://stripe.com)
2. Sign up for a free account
3. Complete business verification (required for live payments)

## Step 2: Get Your API Keys

1. Log into Stripe Dashboard
2. Go to **Developers** → **API Keys**
3. Copy both keys:
   - **Publishable key** (starts with `pk_test_` or `pk_live_`)
   - **Secret key** (starts with `sk_test_` or `sk_live_`)

## Step 3: Create Your Product

1. In Stripe Dashboard, go to **Products**
2. Click **+ Add product**
3. Fill in:
   - **Name:** Profit Tools - Business Calculator Suite
   - **Description:** Lifetime access to 5 professional business calculators
   - **Pricing:** $47 USD
   - **Billing:** One-time payment
4. Click **Save product**
5. Copy the **Price ID** (starts with `price_`)

## Step 4: Set Environment Variables

Create `.env.local` in your project root:

```bash
# Stripe Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_PRICE_ID=price_xxxxxxxxxxxxx

# Your site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Step 5: Install Stripe Package

```bash
npm install @stripe/stripe-js stripe
```

## Step 6: Create Stripe Checkout API Route

Create `app/api/checkout/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

export async function POST(req: NextRequest) {
  try {
    const { priceId } = await req.json()

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/`,
      customer_email: undefined, // They'll enter during checkout
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
```

## Step 7: Update Landing Page Buttons

Replace the "Get Started" buttons in `app/page.tsx` with:

```typescript
'use client'

import { loadStripe } from '@stripe/stripe-js'
import { useState } from 'react'

// At the top of your component
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// Inside your component
const [loading, setLoading] = useState(false)

const handleCheckout = async () => {
  setLoading(true)

  try {
    const stripe = await stripePromise

    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
      }),
    })

    const { sessionId } = await response.json()

    await stripe?.redirectToCheckout({ sessionId })
  } catch (error) {
    console.error('Checkout error:', error)
    alert('Something went wrong. Please try again.')
  } finally {
    setLoading(false)
  }
}

// Then use in your button
<button onClick={handleCheckout} disabled={loading} className="btn-primary">
  {loading ? 'Loading...' : 'Get Instant Access - $47'}
</button>
```

## Step 8: Create Success Page

Create `app/success/page.tsx`:

```typescript
export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
      <div className="max-w-2xl text-center">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Profit Tools!
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Thank you for your purchase. You now have lifetime access to all 5 calculators!
        </p>
        <a href="/calculators" className="btn-primary inline-block">
          Start Using Your Calculators
        </a>
        <p className="text-sm text-gray-500 mt-6">
          A receipt has been sent to your email.
        </p>
      </div>
    </div>
  )
}
```

## Step 9: Test the Payment Flow

1. Start your dev server: `npm run dev`
2. Click "Get Started" button
3. Use Stripe test card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
4. Complete checkout
5. Should redirect to success page

## Step 10: Set Up Webhooks (Optional but Recommended)

Webhooks let you know when payments succeed/fail.

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **+ Add endpoint**
3. Enter your URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the **Signing secret**

Create `app/api/webhooks/stripe/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object
      console.log('Payment successful:', session.id)
      // TODO: Grant user access to calculators
      // You can store in a database or send welcome email
      break

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object
      console.log('Payment failed:', failedPayment.id)
      // TODO: Handle failed payment (notify user, retry, etc.)
      break
  }

  return NextResponse.json({ received: true })
}
```

## Step 11: Go Live!

### Switch to Live Mode

1. In Stripe Dashboard, toggle from **Test mode** to **Live mode**
2. Get your **live** API keys
3. Update `.env.local` with live keys
4. Update Stripe webhooks with production URL

### Environment Variables for Production

Set these in your hosting platform (Vercel, Netlify, etc.):

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_PRICE_ID=price_xxxxxxxxxxxxx (your live price ID)
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## Advanced: Add User Authentication (Optional)

If you want to restrict calculator access to paying customers:

1. Add NextAuth.js for authentication
2. Store purchase records in a database (PostgreSQL/MongoDB)
3. Check payment status before allowing calculator access
4. Implement login/logout functionality

## Pricing Strategies

### Current: $47 One-Time

**Pros:**
- Simple to understand
- No monthly objections
- Easy to sell
- Higher perceived value

**Cons:**
- No recurring revenue
- One-time customer relationship

### Alternative: $9/month Subscription

**Pros:**
- Recurring revenue
- Easier to justify ($9 vs $47)
- Ongoing customer relationship

**Cons:**
- Need to justify monthly value
- Higher churn potential
- More customer management

### Both Options

Offer both and let customers choose:
- **One-time:** $47 (suggested)
- **Monthly:** $9/month

Most customers will choose one-time payment.

## Testing Checklist

- [ ] Test checkout flow works
- [ ] Test with Stripe test cards
- [ ] Verify success page displays
- [ ] Check email receipt arrives
- [ ] Test failed payment handling
- [ ] Verify webhooks receive events
- [ ] Test on mobile devices
- [ ] Test in different browsers

## Common Issues

### "No such price"
- Double-check your STRIPE_PRICE_ID
- Make sure you're using the right mode (test/live)

### "Invalid API key"
- Verify STRIPE_SECRET_KEY is correct
- Check you're not mixing test/live keys

### Webhook not working
- Verify webhook URL is correct
- Check STRIPE_WEBHOOK_SECRET is set
- Ensure your server is publicly accessible

## Resources

- [Stripe Checkout Docs](https://stripe.com/docs/payments/checkout)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

## Support

If you get stuck:
1. Check Stripe Dashboard for error logs
2. Review Stripe API logs (Developers → Logs)
3. Use Stripe test mode for debugging
4. Check browser console for errors

---

**You're almost there! Once Stripe is integrated, you're ready to launch and start making sales!** 🚀
