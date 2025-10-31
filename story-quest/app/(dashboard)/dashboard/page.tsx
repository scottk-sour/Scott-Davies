import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Book, Award, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user?.id) {
    return null
  }

  // Fetch dashboard stats
  const [children, user] = await Promise.all([
    prisma.child.findMany({
      where: { userId: session.user.id },
      include: {
        readingSessions: {
          where: { completedAt: { not: null } },
        },
        achievements: true,
      },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        role: true,
      },
    }),
  ])

  const totalChildren = children.length
  const totalStories = children.reduce(
    (acc, child) => acc + child.readingSessions.length,
    0
  )
  const totalAchievements = children.reduce(
    (acc, child) => acc + child.achievements.length,
    0
  )

  // Calculate this week's reading
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const thisWeekStories = children.reduce((acc, child) => {
    return (
      acc +
      child.readingSessions.filter(
        (session) =>
          session.completedAt && session.completedAt >= oneWeekAgo
      ).length
    )
  }, 0)

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name || 'there'}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your children's reading journey
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Children"
          value={totalChildren}
          icon={<Users className="h-5 w-5 text-purple-600" />}
          description={totalChildren === 1 ? 'child profile' : 'child profiles'}
        />
        <StatCard
          title="Stories Completed"
          value={totalStories}
          icon={<Book className="h-5 w-5 text-purple-600" />}
          description="all time"
        />
        <StatCard
          title="This Week"
          value={thisWeekStories}
          icon={<TrendingUp className="h-5 w-5 text-purple-600" />}
          description={`${thisWeekStories} ${thisWeekStories === 1 ? 'story' : 'stories'} read`}
        />
        <StatCard
          title="Achievements"
          value={totalAchievements}
          icon={<Award className="h-5 w-5 text-purple-600" />}
          description="badges earned"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {totalChildren === 0 ? (
              <Link href="/dashboard/children">
                <Button className="w-full">Add Your First Child</Button>
              </Link>
            ) : (
              <>
                <Link href="/dashboard/stories">
                  <Button className="w-full">Browse Stories</Button>
                </Link>
                <Link href="/dashboard/children">
                  <Button variant="outline" className="w-full">
                    View Children
                  </Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Getting Started</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 h-5 w-5 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-xs font-bold text-purple-600">1</span>
                </div>
                <div>
                  <p className="font-medium">Add child profiles</p>
                  <p className="text-gray-600">Create profiles for the children in your care</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 h-5 w-5 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-xs font-bold text-purple-600">2</span>
                </div>
                <div>
                  <p className="font-medium">Browse therapeutic stories</p>
                  <p className="text-gray-600">Find stories that match their needs</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 h-5 w-5 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-xs font-bold text-purple-600">3</span>
                </div>
                <div>
                  <p className="font-medium">Start reading together</p>
                  <p className="text-gray-600">Let them make choices and guide the story</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      {children.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Your Children</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {children.slice(0, 3).map((child) => (
                <Link
                  key={child.id}
                  href={`/dashboard/children/${child.id}`}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-xl font-bold text-purple-600">
                      {child.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{child.name}</p>
                      <p className="text-sm text-gray-600">
                        {child.readingSessions.length} {child.readingSessions.length === 1 ? 'story' : 'stories'} completed
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    View Profile →
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  description,
}: {
  title: string
  value: number
  icon: React.ReactNode
  description: string
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-purple-50 flex items-center justify-center">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
