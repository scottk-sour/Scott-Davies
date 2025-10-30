import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, ShoppingCart, TrendingUp, Bell, DollarSign, Clock, ArrowRight, CheckCircle2, Sparkles, Zap, Shield, Star } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 md:h-20 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Package className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
            <span className="text-lg md:text-xl font-bold">Etsy Organiser</span>
          </div>
          <nav className="flex items-center gap-2 md:gap-4">
            <Link href="/pricing" className="hidden sm:block">
              <Button variant="ghost">Pricing</Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="sm" className="md:size-default">Login</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="md:size-lg shadow-lg shadow-primary/20">
                <span className="hidden sm:inline">Start Free Trial</span>
                <span className="sm:hidden">Sign Up</span>
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 -z-10" />

        <div className="container flex flex-col items-center gap-6 md:gap-8 py-16 md:py-24 lg:py-32 text-center">
          {/* Social Proof Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border-2 border-primary/20 bg-background/50 backdrop-blur-sm px-4 md:px-6 py-2 text-sm shadow-lg">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-medium">Built specifically for Etsy sellers</span>
          </div>

          <div className="max-w-4xl space-y-4 md:space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight">
              Your Etsy Shop,{" "}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Organised
              </span>
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Stop juggling spreadsheets and browser tabs. Track inventory, manage orders,
              and calculate profits—all in one beautiful dashboard.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Link href="/signup">
              <Button size="lg" className="h-12 md:h-14 px-6 md:px-8 text-base md:text-lg shadow-2xl shadow-primary/30 hover:shadow-primary/40 transition-all group">
                Try Free for 14 Days
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <div className="flex flex-col items-center sm:items-start gap-1">
              <p className="text-xs md:text-sm text-muted-foreground font-medium">
                ✓ No credit card required
              </p>
              <p className="text-xs md:text-sm text-muted-foreground font-medium">
                ✓ Connects in 2 minutes
              </p>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 mt-8 md:mt-12 text-xs md:text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span>Secure & Private</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-600" />
              <span>Instant Setup</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-orange-600" />
              <span>Made for Etsy</span>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="border-y bg-background py-12 md:py-16">
        <div className="container max-w-5xl">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">Sound Familiar?</h2>
            <p className="text-base md:text-lg text-muted-foreground">These are the top struggles we hear from Etsy sellers</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <Card className="border-2 bg-gradient-to-br from-red-50 to-background">
              <CardContent className="p-5 md:p-6">
                <p className="text-sm md:text-base text-muted-foreground italic">
                  "I ran out of stock on my bestseller and lost £500 in sales this week..."
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 bg-gradient-to-br from-yellow-50 to-background">
              <CardContent className="p-5 md:p-6">
                <p className="text-sm md:text-base text-muted-foreground italic">
                  "I spend 2 hours every day just tracking orders across multiple tabs..."
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 bg-gradient-to-br from-purple-50 to-background sm:col-span-2 lg:col-span-1">
              <CardContent className="p-5 md:p-6">
                <p className="text-sm md:text-base text-muted-foreground italic">
                  "I have no idea which products are actually profitable after Etsy fees..."
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-10 md:py-12 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 text-center">
            <div className="p-4">
              <div className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                10 hrs/week
              </div>
              <p className="text-sm md:text-base text-muted-foreground mt-2 font-medium">Average time saved</p>
            </div>
            <div className="p-4">
              <div className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                £39/mo
              </div>
              <p className="text-sm md:text-base text-muted-foreground mt-2 font-medium">vs £80-120 for separate tools</p>
            </div>
            <div className="p-4">
              <div className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
                2 minutes
              </div>
              <p className="text-sm md:text-base text-muted-foreground mt-2 font-medium">To connect your Etsy shop</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container py-16 md:py-20 lg:py-24">
        <div className="text-center mb-10 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">How It Works</h2>
          <p className="text-base md:text-xl text-muted-foreground">Get organised in 3 simple steps</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          <Card className="relative border-2 overflow-hidden group hover:shadow-xl transition-all">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 opacity-10 rounded-bl-full" />
            <CardContent className="p-6 md:p-8 text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-2xl md:text-3xl font-bold mx-auto mb-4 shadow-lg">
                1
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">Connect Your Shop</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                One-click connection to your Etsy shop. We sync your products and orders automatically.
              </p>
            </CardContent>
          </Card>

          <Card className="relative border-2 overflow-hidden group hover:shadow-xl transition-all">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 opacity-10 rounded-bl-full" />
            <CardContent className="p-6 md:p-8 text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-white flex items-center justify-center text-2xl md:text-3xl font-bold mx-auto mb-4 shadow-lg">
                2
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">See Everything</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                One dashboard with real-time inventory, orders, and profit calculations.
              </p>
            </CardContent>
          </Card>

          <Card className="relative border-2 overflow-hidden group hover:shadow-xl transition-all sm:col-span-2 lg:col-span-1">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-pink-500 to-orange-600 opacity-10 rounded-bl-full" />
            <CardContent className="p-6 md:p-8 text-center">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-pink-500 to-orange-600 text-white flex items-center justify-center text-2xl md:text-3xl font-bold mx-auto mb-4 shadow-lg">
                3
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">Stay Organised</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                Get alerts before you run out of stock. Track orders until delivery. Focus on selling.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section className="border-y bg-muted/30 py-16 md:py-20 lg:py-24">
        <div className="container">
          <div className="text-center mb-10 md:mb-12">
            <Badge className="mb-4 text-sm px-4 py-1">Everything You Need</Badge>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">Powerful Features in One Place</h2>
            <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Replace 3-4 separate tools with one simple, beautiful dashboard
            </p>
          </div>

          <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            <Card className="border-2 transition-all hover:shadow-2xl hover:border-blue-200 group">
              <CardHeader className="space-y-3">
                <div className="h-12 w-12 md:h-14 md:w-14 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Package className="h-6 w-6 md:h-7 md:w-7 text-blue-600" />
                </div>
                <CardTitle className="text-lg md:text-xl">Inventory Tracking</CardTitle>
                <CardDescription className="text-sm md:text-base">
                  Syncs with Etsy automatically. See stock levels at a glance. Never oversell or run out unexpectedly.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 transition-all hover:shadow-2xl hover:border-orange-200 group">
              <CardHeader className="space-y-3">
                <div className="h-12 w-12 md:h-14 md:w-14 rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Bell className="h-6 w-6 md:h-7 md:w-7 text-orange-600" />
                </div>
                <CardTitle className="text-lg md:text-xl">Low Stock Alerts</CardTitle>
                <CardDescription className="text-sm md:text-base">
                  Get email alerts before you run out. Set custom thresholds per product. Restock on your terms.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 transition-all hover:shadow-2xl hover:border-green-200 group">
              <CardHeader className="space-y-3">
                <div className="h-12 w-12 md:h-14 md:w-14 rounded-xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShoppingCart className="h-6 w-6 md:h-7 md:w-7 text-green-600" />
                </div>
                <CardTitle className="text-lg md:text-xl">Order Management</CardTitle>
                <CardDescription className="text-sm md:text-base">
                  All your orders in one view. Track fulfillment status. Add tracking numbers. Stay organised.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 transition-all hover:shadow-2xl hover:border-purple-200 group">
              <CardHeader className="space-y-3">
                <div className="h-12 w-12 md:h-14 md:w-14 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <DollarSign className="h-6 w-6 md:h-7 md:w-7 text-purple-600" />
                </div>
                <CardTitle className="text-lg md:text-xl">Profit Calculator</CardTitle>
                <CardDescription className="text-sm md:text-base">
                  See true profit after Etsy fees, shipping, and costs. Know which products actually make money.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 transition-all hover:shadow-2xl hover:border-pink-200 group">
              <CardHeader className="space-y-3">
                <div className="h-12 w-12 md:h-14 md:w-14 rounded-xl bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-6 w-6 md:h-7 md:w-7 text-pink-600" />
                </div>
                <CardTitle className="text-lg md:text-xl">Sales Analytics</CardTitle>
                <CardDescription className="text-sm md:text-base">
                  Track revenue trends. See bestsellers. Identify what's working. Make data-driven decisions.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 transition-all hover:shadow-2xl hover:border-yellow-200 group">
              <CardHeader className="space-y-3">
                <div className="h-12 w-12 md:h-14 md:w-14 rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock className="h-6 w-6 md:h-7 md:w-7 text-yellow-600" />
                </div>
                <CardTitle className="text-lg md:text-xl">Save Hours Weekly</CardTitle>
                <CardDescription className="text-sm md:text-base">
                  Stop switching between tabs and spreadsheets. Everything updates automatically. Focus on creating.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container py-16 md:py-20 lg:py-24">
        <div className="text-center mb-10 md:mb-12">
          <Badge className="mb-4 text-sm px-4 py-1">Simple Pricing</Badge>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">Choose Your Plan</h2>
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Start free, upgrade when you're ready. Cancel anytime.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <Card className="border-2 relative">
            <CardHeader className="space-y-4 pb-6">
              <div>
                <CardTitle className="text-xl md:text-2xl">Free</CardTitle>
                <CardDescription className="text-sm md:text-base mt-2">For trying it out</CardDescription>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold">£0</div>
                <p className="text-sm text-muted-foreground mt-1">forever</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">1 Etsy shop</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Basic inventory tracking</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">View up to 50 products</span>
                </li>
              </ul>
              <Link href="/signup" className="block">
                <Button variant="outline" className="w-full mt-6">Get Started</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Pro Plan - Featured */}
          <Card className="border-2 border-primary relative shadow-2xl shadow-primary/20 scale-105">
            <div className="absolute -top-4 left-0 right-0 flex justify-center">
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 shadow-lg">
                Most Popular
              </Badge>
            </div>
            <CardHeader className="space-y-4 pb-6 pt-8">
              <div>
                <CardTitle className="text-xl md:text-2xl">Pro</CardTitle>
                <CardDescription className="text-sm md:text-base mt-2">For serious sellers</CardDescription>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold">£39</div>
                <p className="text-sm text-muted-foreground mt-1">per month</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Unlimited shops</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Unlimited products & orders</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Low stock alerts</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Profit calculator</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Priority email support</span>
                </li>
              </ul>
              <Link href="/signup" className="block">
                <Button className="w-full mt-6 shadow-lg shadow-primary/30">
                  Start 14-Day Free Trial
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Enterprise Plan */}
          <Card className="border-2 relative">
            <CardHeader className="space-y-4 pb-6">
              <div>
                <CardTitle className="text-xl md:text-2xl">Enterprise</CardTitle>
                <CardDescription className="text-sm md:text-base mt-2">For large operations</CardDescription>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold">Custom</div>
                <p className="text-sm text-muted-foreground mt-1">contact us</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Everything in Pro</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Dedicated account manager</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Custom integrations</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">API access</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full mt-6">Contact Sales</Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-y bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-16 md:py-20 lg:py-24">
        <div className="container">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">Loved by Etsy Sellers</h2>
            <p className="text-base md:text-xl text-muted-foreground">See what our users are saying</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="border-2 bg-background/80 backdrop-blur">
              <CardContent className="p-6 space-y-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm md:text-base">
                  "Finally, a tool that actually understands Etsy sellers! Saved me 15 hours this month. The profit calculator alone is worth it."
                </p>
                <div>
                  <p className="font-semibold text-sm">Sarah M.</p>
                  <p className="text-xs text-muted-foreground">Handmade Jewelry Shop</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 bg-background/80 backdrop-blur">
              <CardContent className="p-6 space-y-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm md:text-base">
                  "I manage 200+ listings and this is the only tool that makes it manageable. Low stock alerts saved me from losing sales multiple times."
                </p>
                <div>
                  <p className="font-semibold text-sm">Mike T.</p>
                  <p className="text-xs text-muted-foreground">Print on Demand Store</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 bg-background/80 backdrop-blur sm:col-span-2 lg:col-span-1">
              <CardContent className="p-6 space-y-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm md:text-base">
                  "Super clean interface, connects instantly. No more juggling Etsy tabs and Excel sheets. I can check my shop in 30 seconds now!"
                </p>
                <div>
                  <p className="font-semibold text-sm">Jessica L.</p>
                  <p className="text-xs text-muted-foreground">Vintage Clothing Shop</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="container py-16 md:py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-10 md:mb-12">Perfect For All Types of Etsy Shops</h2>

          <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
            <Card className="border-2 group hover:shadow-lg transition-all">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-base md:text-lg mb-2">Makers & Crafters</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Track material inventory, know your true costs, and never run out of bestselling items mid-production.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 group hover:shadow-lg transition-all">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-base md:text-lg mb-2">Multi-Product Shops</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Manage dozens or hundreds of listings easily. Bulk update stock. See which products drive profit.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 group hover:shadow-lg transition-all">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-base md:text-lg mb-2">Print-on-Demand</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Sync orders automatically. Track fulfillment status. Manage customer expectations effortlessly.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 group hover:shadow-lg transition-all">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-base md:text-lg mb-2">Part-Time Sellers</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Spend less time on admin, more time creating. Check your shop in minutes, not hours.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-y bg-muted/30 py-16 md:py-20">
        <div className="container max-w-3xl">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-10 md:mb-12">Frequently Asked Questions</h2>

          <div className="space-y-4 md:space-y-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-base md:text-lg">Is my Etsy shop data safe?</CardTitle>
                <CardDescription className="text-sm md:text-base mt-2">
                  Yes! We use industry-standard OAuth to connect to Etsy (the same method Etsy recommends).
                  We never see your Etsy password, and you can revoke access anytime from your Etsy settings.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-base md:text-lg">Do you automatically update my inventory on Etsy?</CardTitle>
                <CardDescription className="text-sm md:text-base mt-2">
                  Not yet! For now, we sync data FROM Etsy to give you a better view of your shop.
                  You still update inventory on Etsy. (Two-way sync is coming soon based on seller feedback.)
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-base md:text-lg">Can I connect multiple Etsy shops?</CardTitle>
                <CardDescription className="text-sm md:text-base mt-2">
                  Yes! You can connect and manage multiple Etsy shops from one account.
                  Switch between shops easily from the dashboard.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-base md:text-lg">What happens after the 14-day trial?</CardTitle>
                <CardDescription className="text-sm md:text-base mt-2">
                  You can upgrade to continue using Etsy Organiser for £39/month (cancel anytime).
                  Or keep using the free plan with basic inventory tracking for one shop.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-base md:text-lg">How is this different from Etsy's built-in tools?</CardTitle>
                <CardDescription className="text-sm md:text-base mt-2">
                  Etsy shows orders and listings separately. We bring everything together: inventory levels,
                  order status, profit calculations, and proactive alerts—all in one dashboard optimised for sellers.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-base md:text-lg">Do you offer support?</CardTitle>
                <CardDescription className="text-sm md:text-base mt-2">
                  Yes! Email support for all users. We typically respond within 24 hours (usually much faster).
                  We're a small team building in public, and we read every message.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container py-16 md:py-20 lg:py-24">
        <div className="relative max-w-4xl mx-auto">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl opacity-10 blur-2xl -z-10" />

          <Card className="border-2 border-primary shadow-2xl shadow-primary/20">
            <CardContent className="flex flex-col items-center gap-6 py-12 md:py-16 text-center px-6">
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 text-sm shadow-lg">
                Limited Time Offer
              </Badge>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                Ready to Get Organised?
              </h2>
              <p className="text-base md:text-xl text-muted-foreground max-w-2xl">
                Join hundreds of Etsy sellers who've stopped juggling spreadsheets and started focusing on what matters:
                creating amazing products and growing their shops.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <Link href="/signup">
                  <Button size="lg" className="h-12 md:h-14 px-6 md:px-8 text-base md:text-lg shadow-2xl shadow-primary/30 hover:shadow-primary/40 transition-all group">
                    Start Your Free 14-Day Trial
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4 text-xs md:text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>14-day free trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-3 text-sm md:text-base">Product</h3>
              <ul className="space-y-2 text-xs md:text-sm text-muted-foreground">
                <li><Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link href="/signup" className="hover:text-foreground transition-colors">Start Free Trial</Link></li>
                <li><Link href="/login" className="hover:text-foreground transition-colors">Login</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3 text-sm md:text-base">Support</h3>
              <ul className="space-y-2 text-xs md:text-sm text-muted-foreground">
                <li>
                  <a href="mailto:support@etsyorganizer.com" className="hover:text-foreground transition-colors">
                    Email Support
                  </a>
                </li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">FAQ</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3 text-sm md:text-base">Company</h3>
              <ul className="space-y-2 text-xs md:text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Roadmap</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3 text-sm md:text-base">Legal</h3>
              <ul className="space-y-2 text-xs md:text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t text-center text-xs md:text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Package className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold">Etsy Organiser</span>
            </div>
            <p>© 2025 Etsy Organiser. All rights reserved.</p>
            <p className="mt-1">Built for Etsy sellers who want to stop stressing and start selling.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
