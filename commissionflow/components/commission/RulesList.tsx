// @ts-nocheck
'use client'

import { useState } from 'react'
import { useCommissionRules } from '@/hooks/useCommissionRules'
import type { CommissionRule } from '@/types/commission'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Edit, Trash2, Copy, Eye } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

// =====================================================
// RULES LIST COMPONENT
// Phase 1A: Display commission rules in a table
// =====================================================

interface RulesListProps {
  onEdit?: (rule: CommissionRule) => void
  onDelete?: (rule: CommissionRule) => void
  onView?: (rule: CommissionRule) => void
  onDuplicate?: (rule: CommissionRule) => void
}

export function RulesList({
  onEdit,
  onDelete,
  onView,
  onDuplicate,
}: RulesListProps) {
  const [filterRole, setFilterRole] = useState<string | undefined>(undefined)
  const [showInactive, setShowInactive] = useState(false)

  const { rules, isLoading, isError, count, deleteRule } = useCommissionRules({
    activeOnly: !showInactive,
    role: filterRole,
    autoRefresh: true,
  })

  const handleDelete = async (rule: CommissionRule) => {
    if (!confirm(`Are you sure you want to deactivate "${rule.name}"?`)) {
      return
    }

    const result = await deleteRule(rule.id)

    if (result.success) {
      alert('Rule deactivated successfully')
    } else {
      alert(`Failed to deactivate rule: ${result.error}`)
    }
  }

  // Format rule type for display
  const formatRuleType = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // Format config for display
  const formatConfig = (rule: CommissionRule) => {
    const { rule_type, config } = rule

    switch (rule_type) {
      case 'percentage':
        return `${(config.rate * 100).toFixed(0)}% of profit`
      case 'flat':
        return `£${(config.amount / 100).toFixed(2)} per ${config.per_unit}`
      case 'threshold':
        return `£${(config.threshold / 100).toFixed(2)} threshold`
      case 'tiered':
        return `${config.tiers?.length || 0} tiers`
      case 'accelerator':
        return `${(config.base_rate * 100).toFixed(0)}% → ${(config.accelerated_rate * 100).toFixed(0)}%`
      case 'bonus':
        return `£${(config.bonus_amount / 100).toFixed(2)} bonus`
      default:
        return 'Unknown'
    }
  }

  // Get badge color for stacking behavior
  const getStackingBadgeColor = (behavior: string) => {
    switch (behavior) {
      case 'replace':
        return 'default'
      case 'add':
        return 'success'
      case 'multiply':
        return 'warning'
      case 'highest':
        return 'info'
      default:
        return 'default'
    }
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load commission rules. Please try again.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Filter by role:</label>
          <select
            value={filterRole || ''}
            onChange={(e) => setFilterRole(e.target.value || undefined)}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="">All roles</option>
            <option value="sales_rep">Sales Rep</option>
            <option value="team_lead">Team Lead</option>
            <option value="manager">Manager</option>
            <option value="accounts">Accounts</option>
            <option value="director">Director</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="show-inactive"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="show-inactive" className="text-sm font-medium">
            Show inactive rules
          </label>
        </div>

        <div className="ml-auto text-sm text-gray-600">
          {count} rule{count !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Configuration</TableHead>
              <TableHead>Applies To</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Stacking</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  Loading rules...
                </TableCell>
              </TableRow>
            ) : rules && rules.length > 0 ? (
              rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">
                    {rule.name}
                    {rule.description && (
                      <div className="text-xs text-gray-500 mt-1">
                        {rule.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{formatRuleType(rule.rule_type)}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{formatConfig(rule)}</TableCell>
                  <TableCell className="text-sm">
                    {rule.applies_to_role ? (
                      <Badge variant="secondary">
                        {rule.applies_to_role.replace('_', ' ')}
                      </Badge>
                    ) : rule.applies_to_user_ids ? (
                      <Badge variant="secondary">
                        {rule.applies_to_user_ids.length} user{rule.applies_to_user_ids.length !== 1 ? 's' : ''}
                      </Badge>
                    ) : (
                      <span className="text-gray-400">All users</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={rule.priority > 50 ? 'default' : 'outline'}>
                      {rule.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStackingBadgeColor(rule.stacking_behavior) as any}>
                      {rule.stacking_behavior}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {rule.active ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {onView && (
                          <DropdownMenuItem onClick={() => onView(rule)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View details
                          </DropdownMenuItem>
                        )}
                        {onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(rule)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {onDuplicate && (
                          <DropdownMenuItem onClick={() => onDuplicate(rule)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                        )}
                        {onDelete && rule.active && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(rule)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Deactivate
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  No commission rules found. Create your first rule to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
