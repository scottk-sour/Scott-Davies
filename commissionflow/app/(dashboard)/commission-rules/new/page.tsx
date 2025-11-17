'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCommissionRule } from '@/hooks/useCommissionRules'
import { RuleForm } from '@/components/commission/RuleForm'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

function NewRulePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const duplicateId = searchParams.get('duplicate')

  // If duplicating, fetch the rule
  const { rule: duplicateRule, isLoading } = useCommissionRule(duplicateId)

  if (duplicateId && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-3">Loading rule...</p>
        </div>
      </div>
    )
  }

  // Prepare rule data for duplication (clear ID and dates)
  const ruleTemplate = duplicateRule ? {
    ...duplicateRule,
    id: undefined,
    name: `${duplicateRule.name} (Copy)`,
    created_at: undefined,
    updated_at: undefined,
    created_by: undefined,
    updated_by: undefined,
  } : null

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

        <h1 className="text-3xl font-bold tracking-tight">
          {duplicateId ? 'Duplicate Commission Rule' : 'Create Commission Rule'}
        </h1>
        <p className="text-gray-600 mt-1">
          Define how this commission will be calculated
        </p>
      </div>

      {/* Form */}
      <RuleForm
        rule={ruleTemplate as any}
        onSuccess={(rule) => {
          router.push(`/commission-rules/${rule.id}`)
        }}
        onCancel={() => {
          router.push('/commission-rules')
        }}
      />
    </div>
  )
}

export default function NewRulePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-3">Loading...</p>
        </div>
      </div>
    }>
      <NewRulePageContent />
    </Suspense>
  )
}
