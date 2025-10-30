'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, ShoppingCart, TrendingUp, Bell, Sparkles } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

type WelcomeModalProps = {
  isOpen: boolean
  onComplete: (createSampleData: boolean) => Promise<void>
}

export function WelcomeModal({ isOpen, onComplete }: WelcomeModalProps) {
  const [loading, setLoading] = useState(false)
  const [createSampleData, setCreateSampleData] = useState(true)

  const handleGetStarted = async () => {
    setLoading(true)
    try {
      await onComplete(createSampleData)
    } catch (error) {
      console.error('Error completing onboarding:', error)
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Welcome to Etsy Organiser!
          </DialogTitle>
          <DialogDescription className="text-base">
            Your all-in-one hub for running a successful Etsy shop. Here's what you can do:
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          <Card>
            <CardHeader>
              <Package className="h-8 w-8 text-blue-500 mb-2" />
              <CardTitle className="text-lg">Product Inventory</CardTitle>
              <CardDescription>
                Track all your Etsy products in one place. Monitor stock levels, costs, prices, and get alerts when inventory runs low.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <ShoppingCart className="h-8 w-8 text-green-500 mb-2" />
              <CardTitle className="text-lg">Order Management</CardTitle>
              <CardDescription>
                View all orders with automatic profit calculations. Track fulfilment status, add tracking numbers, and manage customer orders efficiently.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="h-8 w-8 text-purple-500 mb-2" />
              <CardTitle className="text-lg">Profit Calculator</CardTitle>
              <CardDescription>
                Calculate true profit margins including all Etsy fees (listing, transaction, payment processing). Make informed pricing decisions in GBP.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Bell className="h-8 w-8 text-orange-500 mb-2" />
              <CardTitle className="text-lg">Stock Alerts</CardTitle>
              <CardDescription>
                Get automatic email notifications when products run low or go out of stock. Never miss a sale due to inventory issues.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-6">
          <p className="text-sm text-blue-900">
            <strong>💡 Getting Started:</strong> Start by adding your products in the Products page, then track orders as they come in. Use the Profit Calculator to optimise your pricing!
          </p>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex-1 text-sm text-muted-foreground">
            Ready to organise your Etsy shop?
          </div>
          <Button onClick={handleGetStarted} disabled={loading} size="lg">
            {loading ? 'Setting up...' : "Let's Get Started"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
