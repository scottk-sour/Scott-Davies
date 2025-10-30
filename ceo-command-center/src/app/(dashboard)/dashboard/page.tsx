import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, AlertCircle, ShoppingCart, DollarSign } from 'lucide-react'
import { OnboardingProvider } from '@/components/onboarding/OnboardingProvider'

async function getDashboardStats(userId: string) {
  // Get user's Etsy shop
  const etsyShop = await prisma.etsyShop.findFirst({
    where: { userId },
  })

  if (!etsyShop) {
    return {
      totalProducts: 0,
      lowStockItems: 0,
      pendingOrders: 0,
      monthlyRevenue: 0,
    }
  }

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [totalProducts, lowStockItems, pendingOrders, monthlyOrders] = await Promise.all([
    prisma.product.count({
      where: { shopId: etsyShop.id },
    }),
    prisma.product.count({
      where: {
        shopId: etsyShop.id,
        quantity: {
          lte: etsyShop.defaultStockThreshold,
        },
      },
    }),
    prisma.order.count({
      where: {
        shopId: etsyShop.id,
        status: 'PENDING',
      },
    }),
    prisma.order.findMany({
      where: {
        shopId: etsyShop.id,
        orderDate: {
          gte: startOfMonth,
        },
      },
      select: {
        total: true,
      },
    }),
  ])

  const monthlyRevenue = monthlyOrders.reduce(
    (sum, order) => sum + Number(order.total),
    0
  )

  return {
    totalProducts,
    lowStockItems,
    pendingOrders,
    monthlyRevenue,
  }
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) return null

  // Check if user has completed onboarding
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingCompleted: true },
  })

  const stats = await getDashboardStats(session.user.id)

  const dashboardContent = (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {session.user.name?.split(' ')[0] || 'there'}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Here's your Etsy shop overview
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              In your shop
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Low Stock
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.lowStockItems}
            </div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Orders
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">
              Ready to ship
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.monthlyRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Manage your Etsy shop
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <a
              href="/products"
              className="flex flex-col gap-2 p-4 border rounded-lg hover:bg-accent transition-colors"
            >
              <Package className="h-6 w-6 text-primary" />
              <h3 className="font-semibold">Manage Inventory</h3>
              <p className="text-sm text-muted-foreground">
                Track stock levels and update products
              </p>
            </a>

            <a
              href="/orders"
              className="flex flex-col gap-2 p-4 border rounded-lg hover:bg-accent transition-colors"
            >
              <ShoppingCart className="h-6 w-6 text-primary" />
              <h3 className="font-semibold">Process Orders</h3>
              <p className="text-sm text-muted-foreground">
                Fulfill orders and add tracking
              </p>
            </a>

            <a
              href="/settings"
              className="flex flex-col gap-2 p-4 border rounded-lg hover:bg-accent transition-colors"
            >
              <AlertCircle className="h-6 w-6 text-primary" />
              <h3 className="font-semibold">Etsy Connection</h3>
              <p className="text-sm text-muted-foreground">
                Connect or sync your Etsy shop
              </p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <OnboardingProvider showOnboarding={!user?.onboardingCompleted}>
      {dashboardContent}
    </OnboardingProvider>
  )
}
