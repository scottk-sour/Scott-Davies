// @ts-nocheck
'use client'

import { formatDryRunResult, generateDryRunSummary } from '@/hooks/useDryRun'
import type { DryRunResult } from '@/types/commission'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AlertTriangle, TrendingUp, TrendingDown, Info } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

// =====================================================
// DRY RUN RESULTS COMPONENT
// Phase 1A: Visualize dry run test results
// =====================================================

interface DryRunResultsProps {
  result: DryRunResult
  userNames?: Record<string, string>
}

export function DryRunResults({ result, userNames = {} }: DryRunResultsProps) {
  const formatted = formatDryRunResult(result)
  const summaryText = generateDryRunSummary(result)

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Dry Run Results</CardTitle>
          <CardDescription>
            Impact analysis of proposed commission rules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Current Total */}
            <div>
              <div className="text-sm text-gray-500 mb-1">Current Total</div>
              <div className="text-3xl font-bold text-gray-900">
                {formatCurrency(formatted.summary.current_total)}
              </div>
            </div>

            {/* Proposed Total */}
            <div>
              <div className="text-sm text-gray-500 mb-1">Proposed Total</div>
              <div className="text-3xl font-bold text-blue-600">
                {formatCurrency(formatted.summary.proposed_total)}
              </div>
            </div>

            {/* Change */}
            <div>
              <div className="text-sm text-gray-500 mb-1">Change</div>
              <div
                className={`text-3xl font-bold flex items-center gap-2 ${
                  formatted.changeDirection === 'increase'
                    ? 'text-red-600'
                    : 'text-green-600'
                }`}
              >
                {formatted.changeDirection === 'increase' ? (
                  <TrendingUp className="h-8 w-8" />
                ) : (
                  <TrendingDown className="h-8 w-8" />
                )}
                {formatted.summary.change_percent > 0 ? '+' : ''}
                {formatted.summary.change_percent.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {formatted.summary.change_amount > 0 ? '+' : ''}
                {formatCurrency(formatted.summary.change_amount)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warnings */}
      {formatted.hasWarnings && (
        <Alert variant={formatted.hasLargeChange ? 'destructive' : 'warning'}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold mb-2">
              {formatted.hasLargeChange
                ? 'Large Change Detected'
                : 'Warnings'}
            </div>
            <ul className="list-disc list-inside space-y-1">
              {formatted.warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Budget Impact */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Impact Forecast</CardTitle>
          <CardDescription>
            Estimated cost change over different periods
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <BudgetImpactCard
              label="Monthly"
              amount={formatted.budgetImpact.monthly}
              changeDirection={formatted.changeDirection}
            />
            <BudgetImpactCard
              label="Quarterly"
              amount={formatted.budgetImpact.quarterly}
              changeDirection={formatted.changeDirection}
            />
            <BudgetImpactCard
              label="Annual"
              amount={formatted.budgetImpact.annual}
              changeDirection={formatted.changeDirection}
            />
          </div>
        </CardContent>
      </Card>

      {/* Per-User Impact */}
      <Card>
        <CardHeader>
          <CardTitle>Per-User Impact</CardTitle>
          <CardDescription>
            How each user's commission would change
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead className="text-right">Current</TableHead>
                <TableHead className="text-right">Proposed</TableHead>
                <TableHead className="text-right">Change</TableHead>
                <TableHead className="text-right">Change %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.difference.changes_by_user.map((change) => (
                <TableRow key={change.user_id}>
                  <TableCell className="font-medium">
                    {userNames[change.user_id] || change.user_id}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(change.current_commission)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(change.proposed_commission)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={
                        change.change_amount > 0
                          ? 'text-red-600'
                          : change.change_amount < 0
                          ? 'text-green-600'
                          : ''
                      }
                    >
                      {change.change_amount > 0 ? '+' : ''}
                      {formatCurrency(change.change_amount)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={
                        Math.abs(change.change_percent) > 20
                          ? 'destructive'
                          : Math.abs(change.change_percent) > 10
                          ? 'warning'
                          : 'outline'
                      }
                    >
                      {change.change_percent > 0 ? '+' : ''}
                      {change.change_percent.toFixed(1)}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Summary Text */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg border">
            {summaryText}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Budget impact card for a specific period
 */
function BudgetImpactCard({
  label,
  amount,
  changeDirection,
}: {
  label: string
  amount: number
  changeDirection: 'increase' | 'decrease'
}) {
  return (
    <div className="border rounded-lg p-4">
      <div className="text-sm text-gray-500 mb-1">{label}</div>
      <div
        className={`text-2xl font-bold ${
          changeDirection === 'increase' ? 'text-red-600' : 'text-green-600'
        }`}
      >
        {amount > 0 ? '+' : ''}
        {formatCurrency(amount)}
      </div>
      <div className="text-xs text-gray-600 mt-1">
        {changeDirection === 'increase' ? 'Additional cost' : 'Cost savings'}
      </div>
    </div>
  )
}

/**
 * Compact dry run results for use in cards/modals
 */
export function DryRunResultsCompact({ result }: { result: DryRunResult }) {
  const formatted = formatDryRunResult(result)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">Impact</div>
        <div
          className={`font-bold ${
            formatted.changeDirection === 'increase'
              ? 'text-red-600'
              : 'text-green-600'
          }`}
        >
          {formatted.summary.change_percent > 0 ? '+' : ''}
          {formatted.summary.change_percent.toFixed(1)}%
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">Affected Users</div>
        <div className="font-medium">{formatted.summary.affected_users}</div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">Annual Impact</div>
        <div className="font-medium">
          {formatted.budgetImpact.annual > 0 ? '+' : ''}
          {formatCurrency(formatted.budgetImpact.annual)}
        </div>
      </div>

      {formatted.hasWarnings && (
        <Alert variant="warning" className="mt-2">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            {formatted.warnings.length} warning{formatted.warnings.length !== 1 ? 's' : ''} detected
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
