'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function LoadDemoButton() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const loadDemoData = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch('/api/demo/load', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load demo data')
      }

      // Refresh the page to show the new data
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <Card className="border-2 border-dashed border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          Try Demo Mode
        </CardTitle>
        <CardDescription>
          See how your dashboard will look with real Etsy data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          We'll create sample products (scarves, mugs, candles) and orders with realistic UK pricing in £. You can delete them anytime.
        </p>

        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
            {error}
          </div>
        )}

        <Button
          onClick={loadDemoData}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading Demo Data...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Load Demo Data
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          This will create 6 products and 5 orders
        </p>
      </CardContent>
    </Card>
  )
}
