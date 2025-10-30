import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Package } from 'lucide-react'

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 md:h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Package className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
            <span className="text-lg md:text-xl font-bold">Etsy Organiser</span>
          </Link>
          <nav className="flex items-center gap-2 md:gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="md:size-default">Login</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="md:size-lg">Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Pricing Content */}
      <div className="container py-16 md:py-24">
        <div className="text-center mb-10 md:mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Start free, upgrade when you're ready. Cancel anytime.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          {/* Free Tier */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl">Free</CardTitle>
              <CardDescription className="text-sm md:text-base">Perfect to get started</CardDescription>
              <div className="mt-4">
                <span className="text-3xl md:text-4xl font-bold">£0</span>
                <span className="text-muted-foreground">/forever</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/signup" className="block">
                <Button className="w-full" variant="outline">Get Started</Button>
              </Link>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm">1 Etsy shop</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm">Basic inventory tracking</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm">View up to 50 products</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm">Basic order management</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="border-2 border-primary shadow-2xl shadow-primary/20 relative scale-105">
            <div className="absolute -top-4 left-0 right-0 flex justify-center">
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1">
                Most Popular
              </Badge>
            </div>
            <CardHeader className="pt-8">
              <CardTitle className="text-xl md:text-2xl">Pro</CardTitle>
              <CardDescription className="text-sm md:text-base">For serious sellers</CardDescription>
              <div className="mt-4">
                <span className="text-3xl md:text-4xl font-bold">£39</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/signup" className="block">
                <Button className="w-full shadow-lg shadow-primary/30">Start 14-Day Free Trial</Button>
              </Link>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm font-semibold">Everything in Free, plus:</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm">Unlimited Etsy shops</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm">Unlimited products & orders</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm">Low stock email alerts</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm">Profit calculator</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm">Sales analytics</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm">Priority email support</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enterprise Plan */}
          <Card className="border-2 sm:col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl">Enterprise</CardTitle>
              <CardDescription className="text-sm md:text-base">For large operations</CardDescription>
              <div className="mt-4">
                <span className="text-3xl md:text-4xl font-bold">Custom</span>
                <span className="text-muted-foreground text-sm block mt-1">contact us</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" variant="outline">Contact Sales</Button>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm font-semibold">Everything in Pro, plus:</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm">Dedicated account manager</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm">Custom integrations</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm">API access</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm">Custom reporting</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ or additional info */}
        <div className="mt-12 md:mt-16 text-center space-y-4">
          <p className="text-muted-foreground text-sm md:text-base">
            All plans include a 14-day free trial. No credit card required.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-xs md:text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span>No setup fees</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span>Secure & encrypted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-8 md:py-12 mt-auto bg-muted/30">
        <div className="container">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Package className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold">Etsy Organiser</span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">
              © 2025 Etsy Organiser. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              Built for Etsy sellers who want to stop stressing and start selling.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
