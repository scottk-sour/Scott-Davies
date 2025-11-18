export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          plan: 'starter' | 'professional' | 'business'
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: 'active' | 'canceled' | 'past_due' | 'trialing' | null
          trial_ends_at: string | null
          bdm_threshold_amount: number
          bdm_commission_rate: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          plan?: 'starter' | 'professional' | 'business'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: 'active' | 'canceled' | 'past_due' | 'trialing' | null
          trial_ends_at?: string | null
          bdm_threshold_amount?: number
          bdm_commission_rate?: number
        }
        Update: {
          name?: string
          slug?: string
          plan?: 'starter' | 'professional' | 'business'
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: 'active' | 'canceled' | 'past_due' | 'trialing' | null
          trial_ends_at?: string | null
          bdm_threshold_amount?: number
          bdm_commission_rate?: number
        }
      }
      users: {
        Row: {
          id: string
          organization_id: string
          email: string
          name: string
          role: 'admin' | 'manager' | 'telesales' | 'bdm'
          active: boolean
          hire_date: string | null
          commission_rate: number
          target_monthly: number | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          email: string
          name: string
          role?: 'admin' | 'manager' | 'telesales' | 'bdm'
          active?: boolean
          hire_date?: string | null
          commission_rate?: number
          target_monthly?: number | null
          avatar_url?: string | null
        }
        Update: {
          organization_id?: string
          email?: string
          name?: string
          role?: 'admin' | 'manager' | 'telesales' | 'bdm'
          active?: boolean
          hire_date?: string | null
          commission_rate?: number
          target_monthly?: number | null
          avatar_url?: string | null
        }
      }
      products: {
        Row: {
          id: string
          organization_id: string
          name: string
          category: string | null
          default_buy_in: number | null
          default_install: number | null
          typical_sale_price: number | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          category?: string | null
          default_buy_in?: number | null
          default_install?: number | null
          typical_sale_price?: number | null
          active?: boolean
        }
        Update: {
          name?: string
          category?: string | null
          default_buy_in?: number | null
          default_install?: number | null
          typical_sale_price?: number | null
          active?: boolean
        }
      }
      deals: {
        Row: {
          id: string
          organization_id: string
          deal_number: string
          customer_name: string
          deal_value: number
          buy_in_cost: number
          installation_cost: number
          misc_costs: number
          initial_profit: number
          telesales_commission: number
          remaining_profit: number
          telesales_agent_id: string
          bdm_id: string
          status: 'to_do' | 'done' | 'signed' | 'installed' | 'invoiced' | 'paid'
          month_signed: string | null
          month_installed: string | null
          month_invoiced: string | null
          month_paid: string | null
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          deal_number?: string
          customer_name: string
          deal_value: number
          buy_in_cost: number
          installation_cost: number
          misc_costs?: number
          initial_profit: number
          telesales_commission: number
          remaining_profit: number
          telesales_agent_id: string
          bdm_id: string
          status?: 'to_do' | 'done' | 'signed' | 'installed' | 'invoiced' | 'paid'
          month_signed?: string | null
          month_installed?: string | null
          month_invoiced?: string | null
          month_paid?: string | null
          notes?: string | null
          created_by?: string | null
        }
        Update: {
          customer_name?: string
          deal_value?: number
          buy_in_cost?: number
          installation_cost?: number
          misc_costs?: number
          initial_profit?: number
          telesales_commission?: number
          remaining_profit?: number
          telesales_agent_id?: string
          bdm_id?: string
          status?: 'to_do' | 'done' | 'signed' | 'installed' | 'invoiced' | 'paid'
          month_signed?: string | null
          month_installed?: string | null
          month_invoiced?: string | null
          month_paid?: string | null
          notes?: string | null
        }
      }
      deal_products: {
        Row: {
          id: string
          deal_id: string
          product_id: string
          quantity: number
          created_at: string
        }
        Insert: {
          id?: string
          deal_id: string
          product_id: string
          quantity?: number
        }
        Update: {
          quantity?: number
        }
      }
      commission_records: {
        Row: {
          id: string
          organization_id: string
          bdm_id: string
          month: number
          year: number
          monthly_profit: number
          previous_deficit: number
          threshold_needed: number
          base_threshold: number
          threshold_met: boolean
          excess_over_threshold: number
          bdm_commission: number
          deficit_to_next: number
          deals_count: number
          calculated_at: string
          calculated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          bdm_id: string
          month: number
          year: number
          monthly_profit: number
          previous_deficit?: number
          threshold_needed: number
          base_threshold?: number
          threshold_met: boolean
          excess_over_threshold?: number
          bdm_commission: number
          deficit_to_next?: number
          deals_count: number
          calculated_by?: string | null
        }
        Update: {
          monthly_profit?: number
          previous_deficit?: number
          threshold_needed?: number
          base_threshold?: number
          threshold_met?: boolean
          excess_over_threshold?: number
          bdm_commission?: number
          deficit_to_next?: number
          deals_count?: number
        }
      }
      audit_logs: {
        Row: {
          id: string
          organization_id: string | null
          user_id: string | null
          action: string
          entity_type: string
          entity_id: string | null
          old_value: Json | null
          new_value: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id?: string | null
          user_id?: string | null
          action: string
          entity_type: string
          entity_id?: string | null
          old_value?: Json | null
          new_value?: Json | null
          ip_address?: string | null
          user_agent?: string | null
        }
      }
    }
  }
}
