import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, AlertCircle, ShoppingCart, DollarSign, TrendingUp, ArrowRight } from 'lucide-react'
import { OnboardingProvider } from '@/components/onboarding/OnboardingProvider'
import { LoadDemoButton } from '@/components/dashboard/LoadDemoButton'
import Link from 'next/link'

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
    <div className="space-y-6 md:space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 md:p-8 border-none shadow-md">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Welcome back, {session.user.name?.split(' ')[0] || 'there'}! 👋
        </h1>
        <p className="text-muted-foreground mt-2 text-base md:text-lg">
          Here's your Etsy shop overview for today
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-3 md:gap-6 grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-md hover:shadow-lg transition-all bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Total Products
            </CardTitle>
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Package className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              In your shop
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md hover:shadow-lg transition-all bg-gradient-to-br from-yellow-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Low Stock
            </CardTitle>
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-yellow-600">
              {stats.lowStockItems}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Need attention
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md hover:shadow-lg transition-all bg-gradient-to-br from-purple-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Pending Orders
            </CardTitle>
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-purple-100 flex items-center justify-center">
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{stats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Ready to ship
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md hover:shadow-lg transition-all bg-gradient-to-br from-green-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              Monthly Revenue
            </CardTitle>
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-green-100 flex items-center justify-center">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">
              £{stats.monthlyRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Demo Mode Card - Show if no products */}
      {stats.totalProducts === 0 && (
        <LoadDemoButton />
      )}

      {/* Quick Actions */}
      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">Quick Actions</CardTitle>
          <CardDescription className="text-sm md:text-base">
            Jump right into managing your Etsy shop
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            <Link
              href="/products"
              className="group flex flex-col gap-3 p-6 border-2 rounded-xl hover:border-blue-500 hover:shadow-md transition-all bg-gradient-to-br from-blue-50/50 to-white"
            >
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Manage Inventory</h3>
                <p className="text-sm text-muted-foreground">
                  Track stock levels and update products
                </p>
              </div>
            </Link>

            <Link
              href="/orders"
              className="group flex flex-col gap-3 p-6 border-2 rounded-xl hover:border-purple-500 hover:shadow-md transition-all bg-gradient-to-br from-purple-50/50 to-white"
            >
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <ShoppingCart className="h-6 w-6 text-purple-600" />
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Process Orders</h3>
                <p className="text-sm text-muted-foreground">
                  Fulfill orders and add tracking
                </p>
              </div>
            </Link>

            <Link
              href="/analytics"
              className="group flex flex-col gap-3 p-6 border-2 rounded-xl hover:border-green-500 hover:shadow-md transition-all bg-gradient-to-br from-green-50/50 to-white"
            >
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Profit Calculator</h3>
                <p className="text-sm text-muted-foreground">
                  Calculate profit after Etsy fees
                </p>
              </div>
            </Link>
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
