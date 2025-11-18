// @ts-nocheck
'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  User,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Mail,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { CommissionCalculation } from '@/types/commission'

// =====================================================
// PREMIUM COMMISSION CARD COMPONENT
// Beautiful cards for displaying commission information
// =====================================================

interface CommissionCardProps {
  calculation: CommissionCalculation
  showActions?: boolean
  variant?: 'default' | 'compact' | 'detailed' | 'hero'
  onClick?: () => void
}

export function CommissionCard({
  calculation,
  showActions = true,
  variant = 'default',
  onClick,
}: CommissionCardProps) {
  if (variant === 'hero') {
    return <CommissionCardHero calculation={calculation} showActions={showActions} onClick={onClick} />
  }

  if (variant === 'compact') {
    return <CommissionCardCompact calculation={calculation} onClick={onClick} />
  }

  if (variant === 'detailed') {
    return <CommissionCardDetailed calculation={calculation} showActions={showActions} onClick={onClick} />
  }

  return <CommissionCardDefault calculation={calculation} showActions={showActions} onClick={onClick} />
}

// Default variant - balanced view
function CommissionCardDefault({
  calculation,
  showActions,
  onClick,
}: Omit<CommissionCardProps, 'variant'>) {
  const changePercent = calculation.base_amount
    ? (((calculation.total_amount - calculation.base_amount) / calculation.base_amount) * 100).toFixed(1)
    : null

  return (
    <Card
      className={`border-2 hover:border-blue-300 transition-all duration-200 hover:shadow-lg ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-md">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="font-semibold text-lg text-gray-900">
                {(calculation as any).user?.name || 'Unknown User'}
              </div>
              <div className="text-sm text-gray-600 flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                {formatDate(calculation.calculation_period_start)} -{' '}
                {formatDate(calculation.calculation_period_end)}
              </div>
            </div>
          </div>

          <StatusBadge status={calculation.status} />
        </div>

        {/* Amount */}
        <div className="mb-4">
          <div className="text-4xl font-bold text-green-600 mb-1">
            {formatCurrency(calculation.total_amount)}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Base: {formatCurrency(calculation.base_amount || 0)}</span>
            {changePercent && parseFloat(changePercent) !== 0 && (
              <Badge variant={parseFloat(changePercent) > 0 ? 'success' : 'secondary'} className="text-xs">
                {parseFloat(changePercent) > 0 ? '+' : ''}
                {changePercent}%
              </Badge>
            )}
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2">
            <Link href={`/commissions/${calculation.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                <Eye className="h-4 w-4 mr-1" />
                View Details
              </Button>
            </Link>
            {calculation.status === 'approved' && (
              <Button variant="outline" size="sm">
                <Mail className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Compact variant - for lists
function CommissionCardCompact({
  calculation,
  onClick,
}: Pick<CommissionCardProps, 'calculation' | 'onClick'>) {
  return (
    <div
      className={`flex items-center justify-between p-4 border-2 rounded-lg hover:bg-gray-50 transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-blue-300' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="font-medium">{(calculation as any).user?.name || 'Unknown'}</div>
          <div className="text-xs text-gray-600">
            {formatDate(calculation.calculation_period_end)}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-xl font-bold text-green-600">
            {formatCurrency(calculation.total_amount)}
          </div>
        </div>
        <StatusBadge status={calculation.status} size="sm" />
        {onClick && <ArrowRight className="h-4 w-4 text-gray-400" />}
      </div>
    </div>
  )
}

// Detailed variant - full information
function CommissionCardDetailed({
  calculation,
  showActions,
  onClick,
}: Omit<CommissionCardProps, 'variant'>) {
  const breakdown = calculation.calculation_breakdown as any[]

  return (
    <Card
      className={`border-2 hover:border-blue-300 transition-all duration-200 hover:shadow-lg ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">
                {(calculation as any).user?.name || 'Unknown User'}
              </div>
              <div className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4" />
                {formatDate(calculation.calculation_period_start)} to{' '}
                {formatDate(calculation.calculation_period_end)}
              </div>
            </div>
          </div>

          <StatusBadge status={calculation.status} size="lg" />
        </div>

        {/* Main Amount */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
          <div className="text-sm font-medium text-green-700 mb-2">TOTAL COMMISSION</div>
          <div className="text-5xl font-bold text-green-600 mb-2">
            {formatCurrency(calculation.total_amount)}
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-600">
              Base: {formatCurrency(calculation.base_amount || 0)}
            </span>
            {calculation.base_amount && calculation.total_amount !== calculation.base_amount && (
              <Badge variant="success">
                +{formatCurrency(calculation.total_amount - calculation.base_amount)} bonus
              </Badge>
            )}
          </div>
        </div>

        {/* Rules Applied */}
        {breakdown && breakdown.length > 0 && (
          <div>
            <div className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">
              Rules Applied
            </div>
            <div className="space-y-2">
              {breakdown.slice(0, 3).map((step: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-600">{idx + 1}</span>
                    </div>
                    <span className="text-sm font-medium">{step.rule_name}</span>
                  </div>
                  <span className="text-sm font-semibold text-green-600">
                    +{formatCurrency(step.result)}
                  </span>
                </div>
              ))}
              {breakdown.length > 3 && (
                <div className="text-center text-sm text-gray-500">
                  +{breakdown.length - 3} more rule{breakdown.length - 3 !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 pt-4 border-t">
            <Link href={`/commissions/${calculation.id}`} className="flex-1">
              <Button className="w-full">
                <Eye className="h-4 w-4 mr-2" />
                View Full Breakdown
              </Button>
            </Link>
            {calculation.status === 'approved' && (
              <Button variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Hero variant - for featured/highlighted commissions
function CommissionCardHero({
  calculation,
  showActions,
  onClick,
}: Omit<CommissionCardProps, 'variant'>) {
  return (
    <Card
      className={`border-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-[1.02] ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-8 space-y-6">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-white animate-pulse" />
              </div>
              <div>
                <div className="text-white/80 text-sm mb-1">MONTHLY COMMISSION</div>
                <div className="text-2xl font-bold">
                  {(calculation as any).user?.name || 'Your Commission'}
                </div>
              </div>
            </div>
            <StatusBadge status={calculation.status} variant="glass" />
          </div>

          {/* Amount */}
          <div className="mb-6">
            <div className="text-6xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
              {formatCurrency(calculation.total_amount)}
            </div>
            <div className="text-white/70">
              {formatDate(calculation.calculation_period_start)} -{' '}
              {formatDate(calculation.calculation_period_end)}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-white/70 text-xs mb-1">Base</div>
              <div className="text-lg font-bold">
                {formatCurrency(calculation.base_amount || 0)}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-white/70 text-xs mb-1">Bonus</div>
              <div className="text-lg font-bold">
                {formatCurrency(calculation.total_amount - (calculation.base_amount || 0))}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="text-white/70 text-xs mb-1">Status</div>
              <div className="text-lg font-bold capitalize">{calculation.status}</div>
            </div>
          </div>

          {/* Actions */}
          {showActions && (
            <Link href={`/commissions/${calculation.id}`}>
              <Button
                size="lg"
                className="w-full bg-white text-blue-600 hover:bg-white/90 font-semibold"
              >
                View Detailed Breakdown
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Status badge component
function StatusBadge({
  status,
  size = 'default',
  variant = 'default',
}: {
  status: string
  size?: 'sm' | 'default' | 'lg'
  variant?: 'default' | 'glass'
}) {
  const getStatusConfig = () => {
    switch (status) {
      case 'calculated':
        return {
          icon: Clock,
          label: 'Calculated',
          className: 'bg-blue-100 text-blue-700 border-blue-200',
        }
      case 'pending':
        return {
          icon: AlertCircle,
          label: 'Pending',
          className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        }
      case 'approved':
        return {
          icon: CheckCircle,
          label: 'Approved',
          className: 'bg-green-100 text-green-700 border-green-200',
        }
      case 'paid':
        return {
          icon: CheckCircle,
          label: 'Paid',
          className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        }
      default:
        return {
          icon: AlertCircle,
          label: status,
          className: 'bg-gray-100 text-gray-700 border-gray-200',
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  if (variant === 'glass') {
    return (
      <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30">
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    default: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border-2 font-medium ${config.className} ${sizeClasses[size]}`}
    >
      <Icon className={size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} />
      {config.label}
    </div>
  )
}
