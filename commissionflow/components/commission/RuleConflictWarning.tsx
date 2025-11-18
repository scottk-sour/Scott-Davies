// @ts-nocheck
'use client'

import { useState } from 'react'
import type { RuleConflict } from '@/types/commission'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, AlertCircle, Info, CheckCircle, Zap, ChevronDown, ChevronUp } from 'lucide-react'

// =====================================================
// PREMIUM RULE CONFLICT WARNING COMPONENT
// Beautiful, animated conflict detection display
// =====================================================

interface RuleConflictWarningProps {
  conflicts: RuleConflict[]
  onApplyFix?: (conflict: RuleConflict, resolution: any) => void
  onIgnore?: (conflict: RuleConflict) => void
  className?: string
}

export function RuleConflictWarning({
  conflicts,
  onApplyFix,
  onIgnore,
  className = '',
}: RuleConflictWarningProps) {
  const [expandedConflicts, setExpandedConflicts] = useState<Set<number>>(new Set([0]))

  if (!conflicts || conflicts.length === 0) {
    return null
  }

  const errorCount = conflicts.filter(c => c.severity === 'error').length
  const warningCount = conflicts.filter(c => c.severity === 'warning').length
  const infoCount = conflicts.filter(c => c.severity === 'info').length

  const toggleExpand = (index: number) => {
    const newExpanded = new Set(expandedConflicts)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedConflicts(newExpanded)
  }

  return (
    <Card className={`border-2 animate-in slide-in-from-top-2 duration-300 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center animate-pulse">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-lg">Rule Conflicts Detected</div>
              <div className="text-sm font-normal text-gray-600">
                {conflicts.length} issue{conflicts.length !== 1 ? 's' : ''} found • Review and resolve before saving
              </div>
            </div>
          </CardTitle>

          <div className="flex gap-2">
            {errorCount > 0 && (
              <Badge variant="destructive" className="animate-in zoom-in duration-200">
                {errorCount} Error{errorCount !== 1 ? 's' : ''}
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge variant="warning" className="animate-in zoom-in duration-200 delay-75">
                {warningCount} Warning{warningCount !== 1 ? 's' : ''}
              </Badge>
            )}
            {infoCount > 0 && (
              <Badge variant="secondary" className="animate-in zoom-in duration-200 delay-150">
                {infoCount} Info
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {conflicts.map((conflict, index) => (
          <ConflictItem
            key={index}
            conflict={conflict}
            index={index}
            isExpanded={expandedConflicts.has(index)}
            onToggle={() => toggleExpand(index)}
            onApplyFix={onApplyFix}
            onIgnore={onIgnore}
          />
        ))}
      </CardContent>
    </Card>
  )
}

interface ConflictItemProps {
  conflict: RuleConflict
  index: number
  isExpanded: boolean
  onToggle: () => void
  onApplyFix?: (conflict: RuleConflict, resolution: any) => void
  onIgnore?: (conflict: RuleConflict) => void
}

function ConflictItem({
  conflict,
  index,
  isExpanded,
  onToggle,
  onApplyFix,
  onIgnore,
}: ConflictItemProps) {
  const [isApplying, setIsApplying] = useState(false)

  const getSeverityIcon = () => {
    switch (conflict.severity) {
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />
      default:
        return <Info className="h-5 w-5 text-gray-500" />
    }
  }

  const getSeverityColor = () => {
    switch (conflict.severity) {
      case 'error':
        return 'border-l-red-500 bg-red-50/50 hover:bg-red-50'
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50/50 hover:bg-yellow-50'
      case 'info':
        return 'border-l-blue-500 bg-blue-50/50 hover:bg-blue-50'
      default:
        return 'border-l-gray-500 bg-gray-50/50 hover:bg-gray-50'
    }
  }

  const handleApplyFix = async (resolution: any) => {
    if (!onApplyFix) return

    setIsApplying(true)
    try {
      await onApplyFix(conflict, resolution)
    } finally {
      setIsApplying(false)
    }
  }

  return (
    <div
      className={`border-l-4 rounded-lg transition-all duration-200 ${getSeverityColor()} animate-in slide-in-from-left duration-300`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <button
        onClick={onToggle}
        className="w-full p-4 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
      >
        <div className="flex items-start gap-3">
          {getSeverityIcon()}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-gray-900">{conflict.type}</span>
              <Badge variant="outline" className="text-xs">
                {conflict.severity.toUpperCase()}
              </Badge>
            </div>
            <p className="text-sm text-gray-700">{conflict.message}</p>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-400 transition-transform" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400 transition-transform" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
          {/* Affected Rules */}
          {conflict.affected_rules && conflict.affected_rules.length > 0 && (
            <div className="bg-white/50 rounded-lg p-3">
              <div className="text-xs font-semibold text-gray-600 mb-2">AFFECTED RULES</div>
              <div className="space-y-1">
                {conflict.affected_rules.map((rule, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-gray-400"></div>
                    <span className="text-gray-700">{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggestion */}
          {conflict.suggestion && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Zap className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-blue-900 mb-1">
                    SUGGESTED FIX
                  </div>
                  <p className="text-sm text-blue-800">{conflict.suggestion}</p>
                </div>
              </div>
            </div>
          )}

          {/* Auto-fix Available */}
          {conflict.auto_fix_available && conflict.resolutions && conflict.resolutions.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-gray-600">QUICK FIXES</div>
              {conflict.resolutions.map((resolution, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApplyFix(resolution)}
                  disabled={isApplying}
                  className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-2">
                    {isApplying ? (
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    <span className="text-sm font-medium">{resolution.action}</span>
                  </div>
                  <span className="text-xs opacity-75">Click to apply</span>
                </button>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {onIgnore && conflict.severity !== 'error' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onIgnore(conflict)}
                className="text-xs"
              >
                Ignore Warning
              </Button>
            )}
            {conflict.severity === 'error' && (
              <div className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                This must be resolved before saving
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Compact version for inline display
 */
export function RuleConflictWarningCompact({ conflicts }: { conflicts: RuleConflict[] }) {
  const errorCount = conflicts.filter(c => c.severity === 'error').length
  const warningCount = conflicts.filter(c => c.severity === 'warning').length

  if (conflicts.length === 0) {
    return null
  }

  return (
    <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg animate-in slide-in-from-top duration-200">
      <AlertTriangle className="h-4 w-4 text-orange-500 animate-pulse" />
      <span className="text-sm text-orange-800">
        <strong>{conflicts.length} conflict{conflicts.length !== 1 ? 's' : ''}</strong>
        {errorCount > 0 && ` • ${errorCount} must be resolved`}
        {warningCount > 0 && ` • ${warningCount} warning${warningCount !== 1 ? 's' : ''}`}
      </span>
    </div>
  )
}

/**
 * Success state when no conflicts
 */
export function NoConflictsMessage() {
  return (
    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg animate-in zoom-in duration-300">
      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
        <CheckCircle className="h-5 w-5 text-white" />
      </div>
      <div>
        <div className="font-semibold text-green-900">No Conflicts Detected</div>
        <div className="text-sm text-green-700">
          This rule is ready to be saved and activated
        </div>
      </div>
    </div>
  )
}
