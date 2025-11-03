'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/signout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div>
              <p className="font-medium">Profile</p>
              <p className="text-sm text-gray-600">Manage your account details</p>
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div>
              <p className="font-medium">Subscription</p>
              <p className="text-sm text-gray-600">Manage your subscription</p>
            </div>
          </div>

          <div className="flex items-center justify-between pb-3">
            <div>
              <p className="font-medium">Agency Settings</p>
              <p className="text-sm text-gray-600">Configure agency branding</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>App Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">Version</p>
            <p className="text-sm font-medium">1.0.0 (MVP)</p>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleLogout}
        variant="destructive"
        className="w-full"
        size="lg"
      >
        Sign Out
      </Button>
    </div>
  )
}
