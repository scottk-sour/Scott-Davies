import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Calculator,
  BarChart3,
  Target,
  TrendingUp,
  FileText,
  Users,
  CheckCircle2,
  ArrowRight,
  Clock,
  Shield,
  Zap,
  PoundSterling
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b bg-white/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <PoundSterling className="w-5 h-5 text-white" />
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">CommissionFlow</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Features
              </Link>
              <Link href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                How it Works
              </Link>
              <Link href="#pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Pricing
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM2MzY2ZjEiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-100 rounded-full text-sm font-medium text-blue-700 mb-8">
              <Zap className="w-4 h-4 mr-2" />
              Trusted by 100+ UK Sales Teams
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-6">
              Commission Tracking That{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Actually Works
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Stop wasting hours in Excel. Calculate commissions automatically,
              track deals in real-time, and pay your team accurately—every time.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto text-base px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 py-6 border-2">
                  See How It Works
                </Button>
              </Link>
            </div>

            <p className="text-sm text-gray-500">
              14-day free trial • No credit card required • Setup in 10 minutes
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof Stats */}
      <section className="border-y bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard value="8+" label="Hours Saved Monthly" />
            <StatCard value="99.9%" label="Calculation Accuracy" />
            <StatCard value="£2M+" label="Commissions Tracked" />
            <StatCard value="500+" label="Happy Sales Reps" />
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Sound Familiar?
          </h2>
          <p className="text-lg text-gray-600">
            Commission management shouldn't be this hard
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <ProblemCard
            icon={<Clock className="w-8 h-8 text-red-500" />}
            title="Wasting 8+ Hours Monthly"
            description="Manually calculating commissions in complex Excel spreadsheets with formula errors"
          />
          <ProblemCard
            icon={<Shield className="w-8 h-8 text-red-500" />}
            title="Payment Disputes"
            description="Wrong calculations leading to unhappy salespeople and damaged trust"
          />
          <ProblemCard
            icon={<BarChart3 className="w-8 h-8 text-red-500" />}
            title="No Real-Time Visibility"
            description="Can't see team performance until month-end reconciliation"
          />
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number="1"
              title="Set Up Your Rules"
              description="Define commission structures, thresholds, and team roles in minutes"
            />
            <StepCard
              number="2"
              title="Log Your Deals"
              description="Track deals from signed to paid with automatic stage progression"
            />
            <StepCard
              number="3"
              title="Pay With Confidence"
              description="Generate accurate commission reports and pay your team on time"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything You Need
          </h2>
          <p className="text-lg text-gray-600">
            Built specifically for UK sales teams
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Calculator className="w-6 h-6" />}
            title="Automatic Calculations"
            description="Commission rates calculated instantly with support for complex rules and thresholds"
          />
          <FeatureCard
            icon={<BarChart3 className="w-6 h-6" />}
            title="Deal Pipeline"
            description="Track deals from prospect to paid with real-time status updates"
          />
          <FeatureCard
            icon={<Target className="w-6 h-6" />}
            title="Threshold Rollovers"
            description="Automatic shortfall carryover for BDM thresholds—we're the only tool that does this properly"
          />
          <FeatureCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="Real-Time Dashboard"
            description="See revenue, profit, and commissions at a glance with live updates"
          />
          <FeatureCard
            icon={<FileText className="w-6 h-6" />}
            title="One-Click Reports"
            description="Generate commission reports in seconds and export to CSV or PDF"
          />
          <FeatureCard
            icon={<Users className="w-6 h-6" />}
            title="Team Management"
            description="Manage roles, set individual rates, and track performance across your team"
          />
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-gray-600">
              No hidden fees. No per-user charges. One price for your whole team.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard
              name="Starter"
              price="£49"
              description="Perfect for small teams"
              features={[
                'Up to 5 users',
                '100 deals/month',
                'All core features',
                'Email support',
              ]}
            />
            <PricingCard
              name="Professional"
              price="£99"
              description="Most popular choice"
              features={[
                'Up to 15 users',
                '500 deals/month',
                'All core features',
                'Priority support',
                'CSV export',
                'Custom rules',
              ]}
              popular
            />
            <PricingCard
              name="Business"
              price="£199"
              description="For growing companies"
              features={[
                'Up to 50 users',
                'Unlimited deals',
                'All core features',
                'Priority support',
                'CSV & PDF export',
                'API access',
                'Dedicated account manager',
              ]}
            />
          </div>

          <p className="text-center text-gray-600 mt-8">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-12 lg:p-16 text-center relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />

          <div className="relative">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Ready to Stop Wasting Time on Spreadsheets?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join hundreds of UK sales teams who've already saved thousands of hours
            </p>
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="text-base px-8 py-6 shadow-lg">
                Start Your Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <p className="mt-6 text-sm text-blue-200">
              Set up in 10 minutes • Free for 14 days • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <PoundSterling className="w-5 h-5 text-white" />
                </div>
                <span className="ml-2 text-lg font-bold">CommissionFlow</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Commission tracking built for UK sales teams
              </p>
              <p className="text-xs text-gray-500">
                © 2025 CommissionFlow. All rights reserved.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Pricing</Link></li>
                <li><Link href="/signup" className="text-gray-600 hover:text-gray-900 transition-colors">Free Trial</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">About</Link></li>
                <li><Link href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">Contact</Link></li>
                <li><Link href="/blog" className="text-gray-600 hover:text-gray-900 transition-colors">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/privacy" className="text-gray-600 hover:text-gray-900 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-gray-600 hover:text-gray-900 transition-colors">Terms of Service</Link></li>
                <li><Link href="/cookies" className="text-gray-600 hover:text-gray-900 transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Component definitions
function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  )
}

function ProblemCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-lg text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  )
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full text-white font-bold text-lg mb-4">
        {number}
      </div>
      <h3 className="font-semibold text-lg text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="hover:shadow-lg transition-shadow border-gray-200">
      <CardHeader className="pb-2">
        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 mb-3">
          {icon}
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 text-sm">{description}</p>
      </CardContent>
    </Card>
  )
}

function PricingCard({
  name,
  price,
  description,
  features,
  popular = false,
}: {
  name: string
  price: string
  description: string
  features: string[]
  popular?: boolean
}) {
  return (
    <Card className={`relative ${popular ? 'border-2 border-blue-600 shadow-xl' : 'border-gray-200'}`}>
      {popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
            Most Popular
          </span>
        </div>
      )}
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-xl">{name}</CardTitle>
        <CardDescription className="text-sm">{description}</CardDescription>
        <div className="mt-4">
          <span className="text-4xl font-bold text-gray-900">{price}</span>
          <span className="text-gray-600">/month</span>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3 mb-6">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start">
              <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
              <span className="text-sm text-gray-600">{feature}</span>
            </li>
          ))}
        </ul>
        <Link href="/signup" className="block">
          <Button
            className={`w-full ${popular ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700' : ''}`}
            variant={popular ? 'default' : 'outline'}
          >
            Start Free Trial
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
