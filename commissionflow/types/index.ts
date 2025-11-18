import { Database } from './database'

// Database table types
export type Organization = Database['public']['Tables']['organizations']['Row']
export type User = Database['public']['Tables']['users']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type Deal = Database['public']['Tables']['deals']['Row']
export type DealProduct = Database['public']['Tables']['deal_products']['Row']
export type CommissionRecord = Database['public']['Tables']['commission_records']['Row']
export type AuditLog = Database['public']['Tables']['audit_logs']['Row']

// Insert types
export type InsertDeal = Database['public']['Tables']['deals']['Insert']
export type InsertProduct = Database['public']['Tables']['products']['Insert']
export type InsertCommissionRecord = Database['public']['Tables']['commission_records']['Insert']

// Update types
export type UpdateDeal = Database['public']['Tables']['deals']['Update']
export type UpdateProduct = Database['public']['Tables']['products']['Update']

// Extended types with relations
export type DealWithRelations = Deal & {
  telesales_agent?: User
  bdm?: User
  deal_products?: (DealProduct & { product?: Product })[]
}

export type CommissionRecordWithBDM = CommissionRecord & {
  bdm?: User
}

// Commission calculation types
export interface MonthlyCommissionResult {
  month: number
  year: number
  bdmId: string
  monthlyProfit: number // in pence
  previousCarryover: number // in pence
  cumulativeAmount: number // in pence
  thresholdAmount: number // in pence (default 350000 = £3,500)
  thresholdMet: boolean
  bdmCommission: number // in pence
  carryoverToNext: number // in pence
  dealsCount: number
}

export interface TelesalesCommissionSummary {
  agentId: string
  agentName: string
  dealsCount: number
  totalProfit: number // in pence
  totalCommission: number // in pence
}

export interface MonthlyCommissionSummary {
  month: number
  year: number
  telesales: TelesalesCommissionSummary[]
  bdms: MonthlyCommissionResult[]
  totalTelesalesCommission: number // in pence
  totalBDMCommission: number // in pence
  totalCommissions: number // in pence
}

// Status badge mapping
export const DEAL_STATUS_CONFIG = {
  to_do: {
    label: 'To Do',
    color: 'bg-gray-100 text-gray-800',
    icon: '⚪',
  },
  done: {
    label: 'Done',
    color: 'bg-yellow-100 text-yellow-800',
    icon: '🟡',
  },
  signed: {
    label: 'Signed',
    color: 'bg-blue-100 text-blue-800',
    icon: '🔵',
  },
  installed: {
    label: 'Installed',
    color: 'bg-green-100 text-green-800',
    icon: '🟢',
  },
  invoiced: {
    label: 'Invoiced',
    color: 'bg-orange-100 text-orange-800',
    icon: '🟠',
  },
  paid: {
    label: 'Paid',
    color: 'bg-emerald-100 text-emerald-800',
    icon: '✅',
  },
} as const

export type DealStatus = keyof typeof DEAL_STATUS_CONFIG

// Plan limits
export const PLAN_LIMITS = {
  starter: {
    name: 'Starter',
    price: 49,
    maxUsers: 5,
    maxDealsPerMonth: 100,
  },
  professional: {
    name: 'Professional',
    price: 99,
    maxUsers: 15,
    maxDealsPerMonth: 500,
  },
  business: {
    name: 'Business',
    price: 199,
    maxUsers: 50,
    maxDealsPerMonth: Infinity,
  },
} as const

export type Plan = keyof typeof PLAN_LIMITS

// Helper to convert pence to pounds
export function penceToPounds(pence: number): number {
  return pence / 100
}

// Helper to convert pounds to pence
export function poundsToPence(pounds: number): number {
  return Math.round(pounds * 100)
}

// Helper to format pence as currency (£X,XXX.XX)
export function formatCurrency(pence: number): string {
  const pounds = penceToPounds(pence)
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(pounds)
}
