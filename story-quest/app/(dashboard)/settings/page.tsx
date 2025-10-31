import { auth } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function SettingsPage() {
  const session = await auth()

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

      <div className="space-y-6">
        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Name</p>
              <p className="text-gray-900">{session?.user?.name || 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Email</p>
              <p className="text-gray-900">{session?.user?.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Role</p>
              <Badge variant="secondary">{session?.user?.role}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* More settings coming soon */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              More settings options including notifications, privacy preferences, and
              account management will be available soon.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
