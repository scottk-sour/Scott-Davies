'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDryRun } from '@/hooks/useDryRun'
import { useCommissionRules } from '@/hooks/useCommissionRules'
import { DryRunResults } from '@/components/commission/DryRunResults'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Play, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function TestRulesPage() {
  const router = useRouter()
  const { runDryRun, isRunning, result, error, clearResult } = useDryRun()
  const { rules } = useCommissionRules({ activeOnly: true })

  const [testPeriodStart, setTestPeriodStart] = useState(() => {
    const date = new Date()
    date.setMonth(date.getMonth() - 1)
    date.setDate(1)
    return date.toISOString().split('T')[0]
  })

  const [testPeriodEnd, setTestPeriodEnd] = useState(() => {
    const date = new Date()
    date.setDate(0) // Last day of previous month
    return date.toISOString().split('T')[0]
  })

  const handleRunTest = async () => {
    if (!rules || rules.length === 0) {
      alert('No active rules to test. Please create at least one rule first.')
      return
    }

    if (!testPeriodStart || !testPeriodEnd) {
      alert('Please select a test period.')
      return
    }

    // Convert active rules to proposed rules format
    const proposedRules = rules.map(rule => ({
      name: rule.name,
      rule_type: rule.rule_type,
      applies_to_role: rule.applies_to_role || null,
      applies_to_user_ids: rule.applies_to_user_ids || null,
      config: rule.config,
      priority: rule.priority,
      stacking_behavior: rule.stacking_behavior,
      is_absolute: rule.is_absolute,
    }))

    await runDryRun({
      proposed_rules: proposedRules as any,
      period_start: new Date(testPeriodStart),
      period_end: new Date(testPeriodEnd),
    })
  }

  const handleApplyRules = () => {
    if (confirm('Are you sure you want to apply these rules? This will affect all future calculations.')) {
      // Rules are already active, so just redirect
      router.push('/commission-rules')
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link href="/commission-rules">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Rules
          </Button>
        </Link>

        <h1 className="text-3xl font-bold tracking-tight">Test Commission Rules</h1>
        <p className="text-gray-600 mt-1">
          Run a simulation to see how your current rules would perform on historical data
        </p>
      </div>

      {/* Test Configuration */}
      {!result && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Select Test Period</CardTitle>
              <CardDescription>
                Choose a historical period to test your rules against
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="period_start">From</Label>
                  <input
                    type="date"
                    id="period_start"
                    value={testPeriodStart}
                    onChange={(e) => setTestPeriodStart(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div>
                  <Label htmlFor="period_end">To</Label>
                  <input
                    type="date"
                    id="period_end"
                    value={testPeriodEnd}
                    onChange={(e) => setTestPeriodEnd(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This test will use your <strong>current active rules</strong> to calculate
                  what commissions would have been for the selected period.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Rules ({rules?.length || 0})</CardTitle>
              <CardDescription>
                These rules will be tested on the historical data
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rules && rules.length > 0 ? (
                <div className="space-y-2">
                  {rules.map((rule) => (
                    <div
                      key={rule.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{rule.name}</div>
                        <div className="text-sm text-gray-600">
                          {rule.rule_type.charAt(0).toUpperCase() + rule.rule_type.slice(1)} •
                          Priority {rule.priority} •
                          Stacking: {rule.stacking_behavior}
                        </div>
                      </div>
                      <Link href={`/commission-rules/${rule.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No active rules found.</p>
                  <Link href="/commission-rules/new">
                    <Button className="mt-3">Create Your First Rule</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end gap-3">
            <Button
              onClick={handleRunTest}
              disabled={isRunning || !rules || rules.length === 0}
              size="lg"
            >
              {isRunning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Running Test...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run Test
                </>
              )}
            </Button>
          </div>
        </>
      )}

      {/* Test Results */}
      {result && (
        <>
          <DryRunResults result={result} />

          <div className="flex justify-between">
            <Button variant="outline" onClick={clearResult}>
              Run Another Test
            </Button>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => router.push('/commission-rules')}>
                View Rules
              </Button>
              <Button onClick={handleApplyRules}>
                Rules Already Active
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Help */}
      {!result && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">How Testing Works</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Select a historical period (e.g., last month)</li>
            <li>• The system will fetch actual deals from that period</li>
            <li>• Your current active rules will be applied to that data</li>
            <li>• You'll see what commissions would have been calculated</li>
            <li>• Compare results before and after rule changes</li>
            <li>• View budget impact projections (monthly, quarterly, annual)</li>
          </ul>
        </div>
      )}
    </div>
  )
}
