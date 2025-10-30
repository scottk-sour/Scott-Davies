import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { EtsyConnection } from '@/components/settings/EtsyConnection'

async function getUserSettings(userId: string) {
  const [user, etsyShop] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        subscriptionStatus: true,
        stripeCurrentPeriodEnd: true,
      },
    }),
    prisma.etsyShop.findFirst({
      where: { userId },
      select: {
        id: true,
        shopName: true,
        etsyShopId: true,
        lastSyncedAt: true,
        syncEnabled: true,
      },
    }),
  ])

  return { user, etsyShop }
}

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) return null

  const { user, etsyShop } = await getUserSettings(session.user.id)
  if (!user) return null

  const isPro = user.subscriptionStatus === 'ACTIVE' || user.subscriptionStatus === 'TRIALING'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your Etsy connection and account
        </p>
      </div>

      {/* Etsy Connection */}
      <EtsyConnection etsyShop={etsyShop} />

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your profile details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium">Name</p>
            <p className="text-sm text-muted-foreground">{user.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Email</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>Manage your plan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Current Plan</p>
            <Badge variant={isPro ? 'default' : 'secondary'} className="text-sm">
              {isPro ? 'Pro' : 'Free'}
            </Badge>
          </div>

          {!isPro && (
            <div>
              <p className="text-sm text-muted-foreground mb-4">
                Upgrade to Pro to unlock unlimited products, advanced analytics, and automation features.
              </p>
              <Link href="/pricing">
                <Button>Upgrade to Pro</Button>
              </Link>
            </div>
          )}

          {isPro && user.stripeCurrentPeriodEnd && (
            <div>
              <p className="text-sm text-muted-foreground">
                Your subscription renews on{' '}
                {new Date(user.stripeCurrentPeriodEnd).toLocaleDateString()}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
