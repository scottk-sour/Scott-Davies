'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Target, Calendar, FolderKanban, Sparkles } from 'lucide-react'
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
              <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
              <CardTitle className="text-lg">Smart Task Management</CardTitle>
              <CardDescription>
                Prioritize by urgency (P0-P3). Track product photography, listing creation, customer messages, and shipping - all in one place.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <FolderKanban className="h-8 w-8 text-blue-500 mb-2" />
              <CardTitle className="text-lg">Product Launch Projects</CardTitle>
              <CardDescription>
                Group tasks into projects like "Holiday Collection" or "Spring Catalog". Track progress from design to listing automatically.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Target className="h-8 w-8 text-purple-500 mb-2" />
              <CardTitle className="text-lg">Revenue Goals</CardTitle>
              <CardDescription>
                Set monthly/quarterly revenue targets with measurable milestones. Track listings created, sales targets, and profit goals.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Calendar className="h-8 w-8 text-orange-500 mb-2" />
              <CardTitle className="text-lg">Daily Shop Habits</CardTitle>
              <CardDescription>
                Build consistency with habits like "List 1 product daily" or "Respond to messages within 4 hours". Track streaks and grow your shop.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Checkbox
                id="sample-data"
                checked={createSampleData}
                onCheckedChange={(checked) => setCreateSampleData(checked === true)}
              />
              <div className="flex-1">
                <Label htmlFor="sample-data" className="cursor-pointer font-semibold">
                  Load example Etsy shop data to explore features
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  We'll create a sample "Holiday Collection Launch" project, "$10k revenue" goal, example tasks like product photography and customer messages, and a daily listing habit. You can delete them anytime.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex-1 text-sm text-muted-foreground">
            Tip: Track your top 5 shop priorities as P0/P1 tasks
          </div>
          <Button onClick={handleGetStarted} disabled={loading} size="lg">
            {loading ? 'Setting up...' : "Let's Get Started"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
