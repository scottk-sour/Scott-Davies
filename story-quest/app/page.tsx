import Link from 'next/link'
import { Heart, Shield, Book, Users } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">StoryQuest</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700 transition-colors font-medium"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Stories That Help Children{' '}
            <span className="text-purple-600">Heal and Grow</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Trauma-informed interactive stories designed specifically for children in care.
            Created by experts, guided by professionals, and free for those who need it most.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-purple-600 text-white px-8 py-4 rounded-full hover:bg-purple-700 transition-colors text-lg font-semibold"
            >
              Start Free Access
            </Link>
            <Link
              href="#professionals"
              className="bg-white border-2 border-purple-600 text-purple-600 px-8 py-4 rounded-full hover:bg-purple-50 transition-colors text-lg font-semibold"
            >
              For Professionals
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-20">
          <FeatureCard
            icon={<Heart className="h-12 w-12 text-purple-600" />}
            title="Trauma-Informed"
            description="Every story is carefully crafted with therapeutic principles and reviewed by child psychologists"
          />
          <FeatureCard
            icon={<Shield className="h-12 w-12 text-purple-600" />}
            title="Safe & Secure"
            description="Built with safeguarding at its core. Full GDPR compliance and professional oversight"
          />
          <FeatureCard
            icon={<Book className="h-12 w-12 text-purple-600" />}
            title="Interactive Stories"
            description="Children make choices that empower them and help process difficult emotions safely"
          />
          <FeatureCard
            icon={<Users className="h-12 w-12 text-purple-600" />}
            title="Professional Support"
            description="Social workers and therapists can track progress and access conversation guides"
          />
        </div>

        {/* Mission Statement */}
        <div className="mt-20 bg-purple-600 rounded-3xl p-12 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-lg leading-relaxed opacity-90">
              We believe every child in care deserves access to therapeutic support. That's why our
              platform is <strong>completely free</strong> for children in the care system, funded
              through partnerships with Local Authorities and charitable grants.
            </p>
          </div>
        </div>

        {/* For Professionals */}
        <div id="professionals" className="mt-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              For Social Workers & Therapists
            </h2>
            <p className="text-xl text-gray-600">
              Professional tools to support your therapeutic work
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <ProfessionalFeature
              title="Track Progress"
              description="Monitor reading sessions, emotional responses, and therapeutic breakthroughs"
            />
            <ProfessionalFeature
              title="Conversation Guides"
              description="Evidence-based prompts to facilitate meaningful discussions before and after stories"
            />
            <ProfessionalFeature
              title="Secure Notes"
              description="Document observations and share insights with your team (with appropriate consent)"
            />
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join hundreds of professionals supporting children through therapeutic storytelling
          </p>
          <Link
            href="/signup"
            className="bg-purple-600 text-white px-8 py-4 rounded-full hover:bg-purple-700 transition-colors text-lg font-semibold inline-block"
          >
            Create Free Account
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Heart className="h-6 w-6 text-purple-600" />
                <span className="text-xl font-bold">StoryQuest</span>
              </div>
              <p className="text-sm text-gray-600">
                Supporting children in care through therapeutic storytelling
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/stories">Stories</Link></li>
                <li><Link href="/professionals">For Professionals</Link></li>
                <li><Link href="/local-authorities">For Local Authorities</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/help">Help Centre</Link></li>
                <li><Link href="/safeguarding">Safeguarding</Link></li>
                <li><Link href="/contact">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/privacy">Privacy Policy</Link></li>
                <li><Link href="/terms">Terms of Service</Link></li>
                <li><Link href="/gdpr">GDPR Compliance</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-600">
            <p>&copy; 2025 StoryQuest. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function ProfessionalFeature({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-6 border border-purple-100">
      <h3 className="text-xl font-bold mb-3 text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
