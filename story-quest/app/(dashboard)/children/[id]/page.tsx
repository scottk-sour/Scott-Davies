import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Book, Award, TrendingUp, User } from 'lucide-react'

export default async function ChildProfilePage({
  params,
}: {
  params: { id: string }
}) {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  const child = await prisma.child.findFirst({
    where: {
      id: params.id,
      userId: session.user.id,
    },
    include: {
      readingSessions: {
        include: {
          story: {
            select: {
              id: true,
              title: true,
              coverImage: true,
              category: true,
            },
          },
        },
        orderBy: { startedAt: 'desc' },
        take: 10,
      },
      achievements: {
        include: {
          achievement: true,
        },
      },
    },
  })

  if (!child) {
    redirect('/dashboard/children')
  }

  const completedSessions = child.readingSessions.filter((s) => s.completedAt)
  const totalMinutes = completedSessions.reduce(
    (acc, session) => acc + (session.duration || 0) / 60,
    0
  )

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/children"
          className="text-purple-600 hover:text-purple-700 text-sm mb-4 inline-block"
        >
          ← Back to Children
        </Link>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center text-2xl font-bold text-purple-600">
              {child.name[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{child.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary">Age {child.age}</Badge>
                <Badge
                  variant={child.careStatusVerified ? 'success' : 'warning'}
                >
                  {formatCareStatus(child.careStatus)}
                </Badge>
              </div>
            </div>
          </div>
          <Button variant="outline">Edit Profile</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <StatCard
          title="Stories Completed"
          value={completedSessions.length}
          icon={<Book className="h-5 w-5 text-purple-600" />}
        />
        <StatCard
          title="Reading Time"
          value={`${Math.round(totalMinutes)} min`}
          icon={<TrendingUp className="h-5 w-5 text-purple-600" />}
        />
        <StatCard
          title="Achievements"
          value={child.achievements.length}
          icon={<Award className="h-5 w-5 text-purple-600" />}
        />
      </div>

      {/* Recent Stories */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Recent Reading</CardTitle>
        </CardHeader>
        <CardContent>
          {completedSessions.length === 0 ? (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No stories read yet</p>
              <Link href="/dashboard/stories">
                <Button className="mt-4">Browse Stories</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {completedSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded bg-purple-100 flex items-center justify-center">
                      <Book className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">{session.story.title}</p>
                      <p className="text-sm text-gray-600">
                        {session.completedAt
                          ? new Date(session.completedAt).toLocaleDateString()
                          : 'In progress'}
                      </p>
                    </div>
                  </div>
                  <Badge variant="success">Completed</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievements */}
      {child.achievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {child.achievements.map((ca) => (
                <div
                  key={ca.id}
                  className="flex flex-col items-center text-center p-4 rounded-lg bg-purple-50"
                >
                  <div className="text-3xl mb-2">{ca.achievement.icon}</div>
                  <p className="font-medium text-sm">{ca.achievement.name}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {ca.achievement.description}
                  </p>
                </div>
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
}: {
  title: string
  value: number | string
  icon: React.ReactNode
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-purple-50 flex items-center justify-center">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function formatCareStatus(status: string): string {
  const statusMap: Record<string, string> = {
    NOT_IN_CARE: 'Not in Care',
    FOSTER_CARE: 'Foster Care',
    KINSHIP_CARE: 'Kinship Care',
    RESIDENTIAL_CARE: 'Residential Care',
    ADOPTED_FROM_CARE: 'Adopted',
    SPECIAL_GUARDIANSHIP: 'Special Guardianship',
  }
  return statusMap[status] || status
}
