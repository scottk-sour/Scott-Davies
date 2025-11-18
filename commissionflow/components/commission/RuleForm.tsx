// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCommissionRules } from '@/hooks/useCommissionRules'
import type { CommissionRule, RuleConflict } from '@/types/commission'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, Info, Plus, X } from 'lucide-react'

// =====================================================
// RULE FORM COMPONENT
// Phase 1A: Create and edit commission rules
// =====================================================

interface RuleFormProps {
  rule?: CommissionRule | null
  onSuccess?: (rule: CommissionRule) => void
  onCancel?: () => void
}

type RuleType = 'percentage' | 'flat' | 'threshold' | 'tiered' | 'accelerator' | 'bonus'
type StackingBehavior = 'replace' | 'add' | 'multiply' | 'highest'

interface FormData {
  name: string
  description: string
  rule_type: RuleType
  applies_to_role: string
  applies_to_user_ids: string[]
  config: any
  priority: number
  stacking_behavior: StackingBehavior
  is_absolute: boolean
  effective_from: string
  effective_to: string
}

export function RuleForm({ rule, onSuccess, onCancel }: RuleFormProps) {
  const router = useRouter()
  const { createRule, updateRule } = useCommissionRules()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [conflicts, setConflicts] = useState<RuleConflict[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState<FormData>({
    name: rule?.name || '',
    description: rule?.description || '',
    rule_type: rule?.rule_type || 'percentage',
    applies_to_role: rule?.applies_to_role || '',
    applies_to_user_ids: rule?.applies_to_user_ids || [],
    config: rule?.config || {},
    priority: rule?.priority || 10,
    stacking_behavior: rule?.stacking_behavior || 'replace',
    is_absolute: rule?.is_absolute || false,
    effective_from: rule?.effective_from ? new Date(rule.effective_from).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    effective_to: rule?.effective_to ? new Date(rule.effective_to).toISOString().split('T')[0] : '',
  })

  // Initialize config based on rule type
  useEffect(() => {
    if (!rule) {
      setFormData(prev => ({
        ...prev,
        config: getDefaultConfig(prev.rule_type),
      }))
    }
  }, [formData.rule_type, rule])

  const getDefaultConfig = (ruleType: RuleType) => {
    switch (ruleType) {
      case 'percentage':
        return { rate: 0.10 }
      case 'flat':
        return { amount: 10000, per_unit: 'deal' }
      case 'threshold':
        return { threshold: 350000, rate: 1.0, carry_deficit: true }
      case 'tiered':
        return { tiers: [{ min_amount: 0, rate: 0.08 }] }
      case 'accelerator':
        return { base_rate: 0.10, accelerated_rate: 0.15, trigger_threshold: 1000000 }
      case 'bonus':
        return { bonus_amount: 50000, target_amount: 2000000 }
      default:
        return {}
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})
    setConflicts([])

    // Validate form
    const validationErrors = validateForm(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setIsSubmitting(false)
      return
    }

    try {
      let result
      if (rule) {
        // Update existing rule
        result = await updateRule(rule.id, formData)
      } else {
        // Create new rule
        result = await createRule(formData)
      }

      if (result.success) {
        if (result.warnings && result.warnings.length > 0) {
          setConflicts(result.warnings)
        }

        if (onSuccess && result.rule) {
          onSuccess(result.rule)
        } else {
          router.push('/commissions')
        }
      } else {
        if (result.error) {
          setErrors({ submit: result.error })
        }
        if (result.warnings) {
          setConflicts(result.warnings)
        }
      }
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to save rule' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const validateForm = (data: FormData): Record<string, string> => {
    const errors: Record<string, string> = {}

    if (!data.name.trim()) {
      errors.name = 'Name is required'
    }

    if (!data.effective_from) {
      errors.effective_from = 'Effective from date is required'
    }

    // Validate config based on rule type
    const configErrors = validateConfig(data.rule_type, data.config)
    Object.assign(errors, configErrors)

    return errors
  }

  const validateConfig = (ruleType: RuleType, config: any): Record<string, string> => {
    const errors: Record<string, string> = {}

    switch (ruleType) {
      case 'percentage':
        if (!config.rate || config.rate <= 0 || config.rate > 1) {
          errors.config_rate = 'Rate must be between 0 and 1 (e.g., 0.10 for 10%)'
        }
        break
      case 'flat':
        if (!config.amount || config.amount <= 0) {
          errors.config_amount = 'Amount must be greater than 0'
        }
        if (!config.per_unit) {
          errors.config_per_unit = 'Per unit is required'
        }
        break
      case 'threshold':
        if (!config.threshold || config.threshold <= 0) {
          errors.config_threshold = 'Threshold must be greater than 0'
        }
        break
      case 'tiered':
        if (!config.tiers || config.tiers.length === 0) {
          errors.config_tiers = 'At least one tier is required'
        }
        break
      case 'accelerator':
        if (!config.base_rate || config.base_rate <= 0 || config.base_rate > 1) {
          errors.config_base_rate = 'Base rate must be between 0 and 1'
        }
        if (!config.accelerated_rate || config.accelerated_rate <= 0 || config.accelerated_rate > 1) {
          errors.config_accelerated_rate = 'Accelerated rate must be between 0 and 1'
        }
        if (!config.trigger_threshold || config.trigger_threshold <= 0) {
          errors.config_trigger = 'Trigger threshold must be greater than 0'
        }
        break
      case 'bonus':
        if (!config.bonus_amount || config.bonus_amount <= 0) {
          errors.config_bonus = 'Bonus amount must be greater than 0'
        }
        if (!config.target_amount || config.target_amount <= 0) {
          errors.config_target = 'Target amount must be greater than 0'
        }
        break
    }

    return errors
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Submit Error */}
      {errors.submit && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{errors.submit}</AlertDescription>
        </Alert>
      )}

      {/* Conflicts */}
      {conflicts.length > 0 && (
        <Alert variant="warning">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold mb-2">Rule Conflicts Detected</div>
            <ul className="list-disc list-inside space-y-1">
              {conflicts.map((conflict, idx) => (
                <li key={idx} className="text-sm">
                  {conflict.message}
                  {conflict.suggestion && (
                    <div className="text-xs text-gray-600 ml-5 mt-1">
                      Suggested fix: {conflict.suggestion}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Rule Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Base Sales Commission"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description"
            />
          </div>
        </CardContent>
      </Card>

      {/* Rule Type */}
      <Card>
        <CardHeader>
          <CardTitle>Rule Type</CardTitle>
          <CardDescription>Select how commission will be calculated</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { value: 'percentage', label: 'Percentage', desc: 'X% of profit' },
              { value: 'flat', label: 'Flat', desc: '£X per unit' },
              { value: 'threshold', label: 'Threshold', desc: 'Hit target to earn' },
              { value: 'tiered', label: 'Tiered', desc: 'Rates by level' },
              { value: 'accelerator', label: 'Accelerator', desc: 'Rate increases' },
              { value: 'bonus', label: 'Bonus', desc: 'One-time reward' },
            ].map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData({ ...formData, rule_type: type.value as RuleType })}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  formData.rule_type === type.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">{type.label}</div>
                <div className="text-sm text-gray-600">{type.desc}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration</CardTitle>
          <CardDescription>
            {formData.rule_type === 'percentage' && 'Set the commission percentage'}
            {formData.rule_type === 'flat' && 'Set the flat commission amount'}
            {formData.rule_type === 'threshold' && 'Set the threshold requirement'}
            {formData.rule_type === 'tiered' && 'Define commission tiers'}
            {formData.rule_type === 'accelerator' && 'Set base and accelerated rates'}
            {formData.rule_type === 'bonus' && 'Set bonus amount and target'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {formData.rule_type === 'percentage' && (
            <PercentageConfig
              config={formData.config}
              onChange={(config) => setFormData({ ...formData, config })}
              errors={errors}
            />
          )}
          {formData.rule_type === 'flat' && (
            <FlatConfig
              config={formData.config}
              onChange={(config) => setFormData({ ...formData, config })}
              errors={errors}
            />
          )}
          {formData.rule_type === 'threshold' && (
            <ThresholdConfig
              config={formData.config}
              onChange={(config) => setFormData({ ...formData, config })}
              errors={errors}
            />
          )}
          {formData.rule_type === 'tiered' && (
            <TieredConfig
              config={formData.config}
              onChange={(config) => setFormData({ ...formData, config })}
              errors={errors}
            />
          )}
          {formData.rule_type === 'accelerator' && (
            <AcceleratorConfig
              config={formData.config}
              onChange={(config) => setFormData({ ...formData, config })}
              errors={errors}
            />
          )}
          {formData.rule_type === 'bonus' && (
            <BonusConfig
              config={formData.config}
              onChange={(config) => setFormData({ ...formData, config })}
              errors={errors}
            />
          )}
        </CardContent>
      </Card>

      {/* Applies To */}
      <Card>
        <CardHeader>
          <CardTitle>Applies To</CardTitle>
          <CardDescription>Who should this rule apply to?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="applies_to_role">By Role</Label>
            <select
              id="applies_to_role"
              value={formData.applies_to_role}
              onChange={(e) => setFormData({ ...formData, applies_to_role: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">All Users</option>
              <option value="sales_rep">Sales Rep</option>
              <option value="team_lead">Team Lead</option>
              <option value="manager">Manager</option>
              <option value="accounts">Accounts</option>
              <option value="director">Director</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority">Priority (0-100)</Label>
              <Input
                id="priority"
                type="number"
                min="0"
                max="100"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
              />
              <p className="text-xs text-gray-500 mt-1">Higher priority rules apply first</p>
            </div>

            <div>
              <Label htmlFor="stacking_behavior">Stacking Behavior</Label>
              <select
                id="stacking_behavior"
                value={formData.stacking_behavior}
                onChange={(e) => setFormData({ ...formData, stacking_behavior: e.target.value as StackingBehavior })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="replace">Replace</option>
                <option value="add">Add</option>
                <option value="multiply">Multiply</option>
                <option value="highest">Highest</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_absolute"
              checked={formData.is_absolute}
              onChange={(e) => setFormData({ ...formData, is_absolute: e.target.checked })}
              className="rounded"
            />
            <Label htmlFor="is_absolute">This is an absolute rule (ignores lower priority)</Label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="effective_from">Effective From *</Label>
              <Input
                id="effective_from"
                type="date"
                value={formData.effective_from}
                onChange={(e) => setFormData({ ...formData, effective_from: e.target.value })}
                className={errors.effective_from ? 'border-red-500' : ''}
              />
              {errors.effective_from && <p className="text-sm text-red-500 mt-1">{errors.effective_from}</p>}
            </div>

            <div>
              <Label htmlFor="effective_to">Effective To (Optional)</Label>
              <Input
                id="effective_to"
                type="date"
                value={formData.effective_to}
                onChange={(e) => setFormData({ ...formData, effective_to: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : rule ? 'Update Rule' : 'Create Rule'}
        </Button>
      </div>
    </form>
  )
}

// Config Components
function PercentageConfig({ config, onChange, errors }: any) {
  return (
    <div>
      <Label htmlFor="rate">Commission Rate (%)</Label>
      <div className="flex items-center gap-2">
        <Input
          id="rate"
          type="number"
          min="0"
          max="100"
          step="0.1"
          value={(config.rate || 0) * 100}
          onChange={(e) => onChange({ ...config, rate: parseFloat(e.target.value) / 100 })}
          className={errors.config_rate ? 'border-red-500' : ''}
        />
        <span className="text-gray-600">%</span>
      </div>
      {errors.config_rate && <p className="text-sm text-red-500 mt-1">{errors.config_rate}</p>}
      <p className="text-xs text-gray-500 mt-1">e.g., 10 for 10% commission</p>
    </div>
  )
}

function FlatConfig({ config, onChange, errors }: any) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="amount">Amount (£)</Label>
        <Input
          id="amount"
          type="number"
          min="0"
          step="0.01"
          value={(config.amount || 0) / 100}
          onChange={(e) => onChange({ ...config, amount: Math.round(parseFloat(e.target.value) * 100) })}
          className={errors.config_amount ? 'border-red-500' : ''}
        />
        {errors.config_amount && <p className="text-sm text-red-500 mt-1">{errors.config_amount}</p>}
      </div>

      <div>
        <Label htmlFor="per_unit">Per Unit</Label>
        <select
          id="per_unit"
          value={config.per_unit || 'deal'}
          onChange={(e) => onChange({ ...config, per_unit: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="deal">Deal</option>
          <option value="appointment">Appointment</option>
          <option value="lead">Lead</option>
          <option value="demo">Demo</option>
          <option value="call">Call</option>
        </select>
      </div>
    </div>
  )
}

function ThresholdConfig({ config, onChange, errors }: any) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="threshold">Threshold Amount (£)</Label>
        <Input
          id="threshold"
          type="number"
          min="0"
          step="0.01"
          value={(config.threshold || 0) / 100}
          onChange={(e) => onChange({ ...config, threshold: Math.round(parseFloat(e.target.value) * 100) })}
          className={errors.config_threshold ? 'border-red-500' : ''}
        />
        {errors.config_threshold && <p className="text-sm text-red-500 mt-1">{errors.config_threshold}</p>}
      </div>

      <div>
        <Label htmlFor="rate">Commission Rate (%)</Label>
        <Input
          id="rate"
          type="number"
          min="0"
          max="100"
          step="0.1"
          value={(config.rate || 0) * 100}
          onChange={(e) => onChange({ ...config, rate: parseFloat(e.target.value) / 100 })}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="carry_deficit"
          checked={config.carry_deficit !== false}
          onChange={(e) => onChange({ ...config, carry_deficit: e.target.checked })}
          className="rounded"
        />
        <Label htmlFor="carry_deficit">Carry deficit to next month</Label>
      </div>
    </div>
  )
}

function TieredConfig({ config, onChange, errors }: any) {
  const tiers = config.tiers || [{ min_amount: 0, rate: 0.08 }]

  const addTier = () => {
    onChange({
      ...config,
      tiers: [...tiers, { min_amount: 0, rate: 0 }],
    })
  }

  const removeTier = (index: number) => {
    onChange({
      ...config,
      tiers: tiers.filter((_: any, i: number) => i !== index),
    })
  }

  const updateTier = (index: number, field: string, value: any) => {
    const newTiers = [...tiers]
    newTiers[index] = { ...newTiers[index], [field]: value }
    onChange({ ...config, tiers: newTiers })
  }

  return (
    <div className="space-y-4">
      {tiers.map((tier: any, index: number) => (
        <div key={index} className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold">Tier {index + 1}</h4>
            {tiers.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeTier(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>From Amount (£)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={(tier.min_amount || 0) / 100}
                onChange={(e) => updateTier(index, 'min_amount', Math.round(parseFloat(e.target.value) * 100))}
              />
            </div>

            <div>
              <Label>Rate (%)</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={(tier.rate || 0) * 100}
                onChange={(e) => updateTier(index, 'rate', parseFloat(e.target.value) / 100)}
              />
            </div>
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" onClick={addTier} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Tier
      </Button>

      {errors.config_tiers && <p className="text-sm text-red-500">{errors.config_tiers}</p>}
    </div>
  )
}

function AcceleratorConfig({ config, onChange, errors }: any) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="base_rate">Base Rate (%)</Label>
        <Input
          id="base_rate"
          type="number"
          min="0"
          max="100"
          step="0.1"
          value={(config.base_rate || 0) * 100}
          onChange={(e) => onChange({ ...config, base_rate: parseFloat(e.target.value) / 100 })}
          className={errors.config_base_rate ? 'border-red-500' : ''}
        />
        {errors.config_base_rate && <p className="text-sm text-red-500 mt-1">{errors.config_base_rate}</p>}
      </div>

      <div>
        <Label htmlFor="accelerated_rate">Accelerated Rate (%)</Label>
        <Input
          id="accelerated_rate"
          type="number"
          min="0"
          max="100"
          step="0.1"
          value={(config.accelerated_rate || 0) * 100}
          onChange={(e) => onChange({ ...config, accelerated_rate: parseFloat(e.target.value) / 100 })}
          className={errors.config_accelerated_rate ? 'border-red-500' : ''}
        />
        {errors.config_accelerated_rate && <p className="text-sm text-red-500 mt-1">{errors.config_accelerated_rate}</p>}
      </div>

      <div>
        <Label htmlFor="trigger_threshold">Trigger Threshold (£)</Label>
        <Input
          id="trigger_threshold"
          type="number"
          min="0"
          step="0.01"
          value={(config.trigger_threshold || 0) / 100}
          onChange={(e) => onChange({ ...config, trigger_threshold: Math.round(parseFloat(e.target.value) * 100) })}
          className={errors.config_trigger ? 'border-red-500' : ''}
        />
        {errors.config_trigger && <p className="text-sm text-red-500 mt-1">{errors.config_trigger}</p>}
        <p className="text-xs text-gray-500 mt-1">Rate increases after exceeding this amount</p>
      </div>
    </div>
  )
}

function BonusConfig({ config, onChange, errors }: any) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="bonus_amount">Bonus Amount (£)</Label>
        <Input
          id="bonus_amount"
          type="number"
          min="0"
          step="0.01"
          value={(config.bonus_amount || 0) / 100}
          onChange={(e) => onChange({ ...config, bonus_amount: Math.round(parseFloat(e.target.value) * 100) })}
          className={errors.config_bonus ? 'border-red-500' : ''}
        />
        {errors.config_bonus && <p className="text-sm text-red-500 mt-1">{errors.config_bonus}</p>}
      </div>

      <div>
        <Label htmlFor="target_amount">Target Amount (£)</Label>
        <Input
          id="target_amount"
          type="number"
          min="0"
          step="0.01"
          value={(config.target_amount || 0) / 100}
          onChange={(e) => onChange({ ...config, target_amount: Math.round(parseFloat(e.target.value) * 100) })}
          className={errors.config_target ? 'border-red-500' : ''}
        />
        {errors.config_target && <p className="text-sm text-red-500 mt-1">{errors.config_target}</p>}
        <p className="text-xs text-gray-500 mt-1">Bonus awarded when exceeding this amount</p>
      </div>
    </div>
  )
}
