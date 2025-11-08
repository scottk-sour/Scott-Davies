'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { RulesList } from '@/components/commission/RulesList'
import { Plus } from 'lucide-react'

export default function CommissionRulesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Commission Rules</h1>
          <p className="text-gray-600 mt-1">
            Manage your commission structure and rule configurations
          </p>
        </div>
        <Link href="/commission-rules/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create New Rule
          </Button>
        </Link>
      </div>

      {/* Rules List */}
      <RulesList
        onEdit={(rule) => {
          window.location.href = `/commission-rules/${rule.id}`
        }}
        onView={(rule) => {
          window.location.href = `/commission-rules/${rule.id}`
        }}
        onDuplicate={(rule) => {
          window.location.href = `/commission-rules/new?duplicate=${rule.id}`
        }}
      />

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Priority:</strong> Higher priority rules (100) apply before lower priority (10)</li>
          <li>• <strong>Stacking:</strong> Determines how rules combine (replace, add, multiply, highest)</li>
          <li>• <strong>Absolute Rules:</strong> Ignore all lower priority rules completely</li>
          <li>• <strong>Test Rules:</strong> Use the dry run feature before activating new rules</li>
        </ul>
      </div>
    </div>
  )
}
