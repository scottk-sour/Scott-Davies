// @ts-nocheck
'use client'

import { useCommissionExplanation } from '@/hooks/useCommissionCalculation'
import type { CommissionExplanation, CalculationStep } from '@/types/commission'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Download, Mail, FileText } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

// =====================================================
// COMMISSION EXPLAINER COMPONENT
// Phase 1A: Display commission calculation breakdown
// =====================================================

interface CommissionExplainerProps {
  calculationId: string
  showActions?: boolean
}

export function CommissionExplainer({
  calculationId,
  showActions = true,
}: CommissionExplainerProps) {
  const {
    explanation,
    isLoading,
    isError,
    isEmailing,
    emailExplanation,
    downloadText,
    downloadHtml,
  } = useCommissionExplanation(calculationId)

  const handleEmail = async () => {
    const result = await emailExplanation()
    if (result.success) {
      alert('Explanation emailed successfully!')
    } else {
      alert(`Failed to email: ${result.error}`)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          Loading commission explanation...
        </CardContent>
      </Card>
    )
  }

  if (isError || !explanation) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load commission explanation. Please try again.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Commission Statement</CardTitle>
              <CardDescription>
                {explanation.user_name} • {formatDate(explanation.period_start)} - {formatDate(explanation.period_end)}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(explanation.final_commission)}
              </div>
              <div className="text-sm text-gray-500">Total Commission</div>
            </div>
          </div>
        </CardHeader>

        {showActions && (
          <CardContent className="border-t pt-4">
            <div className="flex gap-2">
              <Button onClick={downloadText} variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Download Text
              </Button>
              <Button onClick={downloadHtml} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download HTML
              </Button>
              <Button
                onClick={handleEmail}
                variant="outline"
                size="sm"
                disabled={isEmailing}
              >
                <Mail className="h-4 w-4 mr-2" />
                {isEmailing ? 'Sending...' : 'Email'}
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Performance Summary */}
      {explanation.summary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(explanation.summary).map(([key, value]) => (
                <div key={key}>
                  <div className="text-2xl font-bold">
                    {typeof value === 'number' && key.includes('sales')
                      ? formatCurrency(value)
                      : value}
                  </div>
                  <div className="text-sm text-gray-500 capitalize">
                    {key.replace(/_/g, ' ')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calculation Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How This Was Calculated</CardTitle>
          <CardDescription>
            Step-by-step breakdown of your commission
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {explanation.steps.map((step) => (
              <CalculationStepCard key={step.step} step={step} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Individual calculation step card
 */
function CalculationStepCard({ step }: { step: CalculationStep }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied':
        return 'bg-green-50 border-green-200'
      case 'not_applied':
        return 'bg-gray-50 border-gray-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'applied':
        return <Badge variant="success">Applied</Badge>
      case 'not_applied':
        return <Badge variant="secondary">Not Applied</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className={`border rounded-lg p-4 ${getStatusColor(step.status)}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{step.icon || '📊'}</span>
          <div>
            <div className="font-semibold text-lg">
              Step {step.step}: {step.rule_name}
            </div>
            {step.formula && (
              <div className="text-sm text-gray-600 font-mono mt-1">
                {step.formula}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(step.status)}
          {step.result !== undefined && step.status === 'applied' && (
            <div className="text-xl font-bold text-green-600">
              {formatCurrency(step.result)}
            </div>
          )}
        </div>
      </div>

      <div className="text-sm text-gray-700 mt-2">{step.explanation}</div>

      {step.metadata && Object.keys(step.metadata).length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-xs font-semibold text-gray-500 mb-1">Details:</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(step.metadata).map(([key, value]) => (
              <div key={key}>
                <span className="text-gray-500">{key}:</span>{' '}
                <span className="font-medium">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Compact version for use in lists/tables
 */
export function CommissionExplainerCompact({
  calculationId,
  onExpand,
}: {
  calculationId: string
  onExpand?: () => void
}) {
  const { explanation, isLoading } = useCommissionExplanation(calculationId)

  if (isLoading || !explanation) {
    return <div className="text-sm text-gray-500">Loading...</div>
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="font-semibold">
          {formatCurrency(explanation.final_commission)}
        </div>
        <Button onClick={onExpand} variant="ghost" size="sm">
          View breakdown
        </Button>
      </div>
      <div className="text-xs text-gray-500">
        {explanation.steps.filter((s) => s.status === 'applied').length} rules applied
      </div>
    </div>
  )
}
