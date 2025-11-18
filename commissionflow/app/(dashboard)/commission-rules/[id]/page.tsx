'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useCommissionRule } from '@/hooks/useCommissionRules'
import { RuleForm } from '@/components/commission/RuleForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Edit, History, Info } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export default function RuleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const ruleId = params.id as string

  const [isEditing, setIsEditing] = useState(false)

  const { rule, history, isLoading, isError, refresh } = useCommissionRule(ruleId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-3">Loading rule...</p>
        </div>
      </div>
    )
  }

  if (isError || !rule) {
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load commission rule. Please try again.
          </AlertDescription>
        </Alert>
        <Link href="/commission-rules">
          <Button className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Rules
          </Button>
        </Link>
      </div>
    )
  }

  if (isEditing) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <Button variant="ghost" onClick={() => setIsEditing(false)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancel Editing
          </Button>

          <h1 className="text-3xl font-bold tracking-tight">Edit Commission Rule</h1>
          <p className="text-gray-600 mt-1">{rule.name}</p>
        </div>

        <RuleForm
          rule={rule}
          onSuccess={(updatedRule) => {
            refresh()
            setIsEditing(false)
          }}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link href="/commission-rules">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Rules
          </Button>
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{rule.name}</h1>
              {rule.active ? (
                <Badge variant="success">Active</Badge>
              ) : (
                <Badge variant="secondary">Inactive</Badge>
              )}
            </div>
            {rule.description && (
              <p className="text-gray-600 mt-2">{rule.description}</p>
            )}
          </div>

          <Button onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Rule
          </Button>
        </div>
      </div>

      {/* Rule Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-sm text-gray-500">Rule Type</div>
              <div className="font-medium capitalize">
                {rule.rule_type.replace('_', ' ')}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-500">Applies To</div>
              <div className="font-medium">
                {rule.applies_to_role ? (
                  <Badge variant="secondary">
                    {rule.applies_to_role.replace('_', ' ')}
                  </Badge>
                ) : rule.applies_to_user_ids ? (
                  <Badge variant="secondary">
                    {rule.applies_to_user_ids.length} specific user(s)
                  </Badge>
                ) : (
                  'All Users'
                )}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-500">Priority</div>
              <div className="font-medium">
                <Badge>{rule.priority}</Badge>
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-500">Stacking Behavior</div>
              <div className="font-medium capitalize">
                <Badge variant="outline">{rule.stacking_behavior}</Badge>
              </div>
            </div>

            {rule.is_absolute && (
              <div>
                <Badge variant="warning">Absolute Rule</Badge>
                <p className="text-xs text-gray-500 mt-1">
                  Ignores all lower priority rules
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <RuleConfigDisplay rule={rule} />
          </CardContent>
        </Card>

        {/* Dates */}
        <Card>
          <CardHeader>
            <CardTitle>Effective Dates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-sm text-gray-500">Effective From</div>
              <div className="font-medium">{formatDate(rule.effective_from)}</div>
            </div>

            {rule.effective_to && (
              <div>
                <div className="text-sm text-gray-500">Effective To</div>
                <div className="font-medium">{formatDate(rule.effective_to)}</div>
              </div>
            )}

            <div>
              <div className="text-sm text-gray-500">Created</div>
              <div className="font-medium">{formatDate(rule.created_at)}</div>
            </div>

            {rule.updated_at && (
              <div>
                <div className="text-sm text-gray-500">Last Updated</div>
                <div className="font-medium">{formatDate(rule.updated_at)}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href={`/commission-rules/test?rule_id=${rule.id}`}>
              <Button variant="outline" className="w-full">
                Test This Rule
              </Button>
            </Link>

            <Link href={`/commission-rules/new?duplicate=${rule.id}`}>
              <Button variant="outline" className="w-full">
                Duplicate Rule
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Change History */}
      {history && history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Change History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.map((entry: any) => (
                <div key={entry.id} className="border-l-2 border-gray-200 pl-4 py-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {entry.action}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      by {entry.changed_by_name} • {formatDate(entry.created_at)}
                    </span>
                  </div>
                  {entry.changes && (
                    <div className="text-sm text-gray-700 mt-1">
                      {entry.changes.action || 'Updated rule'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Box */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Changes to this rule will affect all future commission calculations.
          Consider testing changes with the dry run feature before saving.
        </AlertDescription>
      </Alert>
    </div>
  )
}

// Helper component to display rule configuration
function RuleConfigDisplay({ rule }: { rule: any }) {
  const { rule_type, config } = rule

  switch (rule_type) {
    case 'percentage':
      return (
        <div>
          <div className="text-2xl font-bold">{(config.rate * 100).toFixed(1)}%</div>
          <div className="text-sm text-gray-600">of total profit</div>
        </div>
      )

    case 'flat':
      return (
        <div>
          <div className="text-2xl font-bold">£{(config.amount / 100).toFixed(2)}</div>
          <div className="text-sm text-gray-600">per {config.per_unit}</div>
        </div>
      )

    case 'threshold':
      return (
        <div className="space-y-2">
          <div>
            <div className="text-sm text-gray-500">Threshold</div>
            <div className="font-semibold">£{(config.threshold / 100).toFixed(2)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Rate</div>
            <div className="font-semibold">{(config.rate * 100).toFixed(0)}%</div>
          </div>
          {config.carry_deficit && (
            <Badge variant="secondary">Carries Deficit</Badge>
          )}
        </div>
      )

    case 'tiered':
      return (
        <div className="space-y-2">
          <div className="text-sm text-gray-600">{config.tiers?.length || 0} tiers configured</div>
          {config.tiers?.map((tier: any, idx: number) => (
            <div key={idx} className="text-sm">
              <span className="font-medium">Tier {idx + 1}:</span> £
              {(tier.min_amount / 100).toFixed(0)}+ at {(tier.rate * 100).toFixed(1)}%
            </div>
          ))}
        </div>
      )

    case 'accelerator':
      return (
        <div className="space-y-2">
          <div>
            <div className="text-sm text-gray-500">Base Rate</div>
            <div className="font-semibold">{(config.base_rate * 100).toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Accelerated Rate</div>
            <div className="font-semibold">{(config.accelerated_rate * 100).toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Trigger</div>
            <div className="font-semibold">£{(config.trigger_threshold / 100).toFixed(2)}</div>
          </div>
        </div>
      )

    case 'bonus':
      return (
        <div className="space-y-2">
          <div>
            <div className="text-sm text-gray-500">Bonus Amount</div>
            <div className="font-semibold">£{(config.bonus_amount / 100).toFixed(2)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Target</div>
            <div className="font-semibold">£{(config.target_amount / 100).toFixed(2)}</div>
          </div>
        </div>
      )

    default:
      return <div className="text-gray-600">Unknown configuration</div>
  }
}
