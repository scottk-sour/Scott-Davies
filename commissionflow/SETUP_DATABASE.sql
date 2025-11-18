-- CommissionFlow Database Schema
-- Copy ALL of this and paste into Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations (Multi-tenant isolation)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'professional', 'business')),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  subscription_status TEXT CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'trialing')),
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  bdm_threshold_amount INTEGER DEFAULT 350000,
  bdm_commission_rate DECIMAL(5, 4) DEFAULT 1.0000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'telesales' CHECK (role IN ('admin', 'manager', 'telesales', 'bdm')),
  active BOOLEAN DEFAULT true,
  hire_date DATE,
  commission_rate DECIMAL(5, 4) DEFAULT 0.10,
  target_monthly DECIMAL(10, 2),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  default_buy_in DECIMAL(10, 2),
  default_install DECIMAL(10, 2),
  typical_sale_price DECIMAL(10, 2),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deals
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  deal_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  deal_value INTEGER NOT NULL,
  buy_in_cost INTEGER NOT NULL,
  installation_cost INTEGER NOT NULL,
  misc_costs INTEGER DEFAULT 0,
  initial_profit INTEGER NOT NULL,
  telesales_commission INTEGER NOT NULL,
  remaining_profit INTEGER NOT NULL,
  telesales_agent_id UUID NOT NULL REFERENCES users(id),
  bdm_id UUID NOT NULL REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'to_do' CHECK (status IN ('to_do', 'done', 'signed', 'installed', 'invoiced', 'paid')),
  month_signed TIMESTAMP WITH TIME ZONE,
  month_installed TIMESTAMP WITH TIME ZONE,
  month_invoiced TIMESTAMP WITH TIME ZONE,
  month_paid TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, deal_number)
);

-- Deal Products
CREATE TABLE deal_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Commission Records
CREATE TABLE commission_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  bdm_id UUID NOT NULL REFERENCES users(id),
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  monthly_profit INTEGER NOT NULL,
  previous_deficit INTEGER NOT NULL DEFAULT 0,
  threshold_needed INTEGER NOT NULL,
  base_threshold INTEGER DEFAULT 350000,
  threshold_met BOOLEAN NOT NULL,
  excess_over_threshold INTEGER NOT NULL DEFAULT 0,
  bdm_commission INTEGER NOT NULL,
  deficit_to_next INTEGER NOT NULL DEFAULT 0,
  deals_count INTEGER NOT NULL,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  calculated_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, bdm_id, year, month)
);

-- Audit Log
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_value JSONB,
  new_value JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_products_organization ON products(organization_id);
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_deals_organization ON deals(organization_id);
CREATE INDEX idx_deals_status ON deals(status);
CREATE INDEX idx_deals_month_paid ON deals(month_paid);
CREATE INDEX idx_deals_telesales_agent ON deals(telesales_agent_id);
CREATE INDEX idx_deals_bdm ON deals(bdm_id);
CREATE INDEX idx_deals_deal_number ON deals(deal_number);
CREATE INDEX idx_commission_records_organization ON commission_records(organization_id);
CREATE INDEX idx_commission_records_bdm ON commission_records(bdm_id);
CREATE INDEX idx_commission_records_year_month ON commission_records(year, month);
CREATE INDEX idx_audit_logs_organization ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- ROW LEVEL SECURITY
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function
CREATE OR REPLACE FUNCTION auth.user_organization_id()
RETURNS UUID AS $$
  SELECT organization_id FROM users WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;

-- Organizations policies
CREATE POLICY "Users can view own organization" ON organizations FOR SELECT USING (id = auth.user_organization_id());
CREATE POLICY "Users can update own organization" ON organizations FOR UPDATE USING (id = auth.user_organization_id());

-- Users policies
CREATE POLICY "Users can view organization members" ON users FOR SELECT USING (organization_id = auth.user_organization_id());
CREATE POLICY "Admins can insert users" ON users FOR INSERT WITH CHECK (organization_id = auth.user_organization_id() AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager')));
CREATE POLICY "Admins can update users" ON users FOR UPDATE USING (organization_id = auth.user_organization_id() AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager')));

-- Products policies
CREATE POLICY "Users can view organization products" ON products FOR SELECT USING (organization_id = auth.user_organization_id());
CREATE POLICY "Users can insert products" ON products FOR INSERT WITH CHECK (organization_id = auth.user_organization_id());
CREATE POLICY "Users can update products" ON products FOR UPDATE USING (organization_id = auth.user_organization_id());

-- Deals policies
CREATE POLICY "Users can view organization deals" ON deals FOR SELECT USING (organization_id = auth.user_organization_id());
CREATE POLICY "Users can insert deals" ON deals FOR INSERT WITH CHECK (organization_id = auth.user_organization_id());
CREATE POLICY "Users can update deals" ON deals FOR UPDATE USING (organization_id = auth.user_organization_id());
CREATE POLICY "Users can delete deals" ON deals FOR DELETE USING (organization_id = auth.user_organization_id());

-- Deal Products policies
CREATE POLICY "Users can view deal products" ON deal_products FOR SELECT USING (EXISTS (SELECT 1 FROM deals WHERE deals.id = deal_products.deal_id AND deals.organization_id = auth.user_organization_id()));
CREATE POLICY "Users can insert deal products" ON deal_products FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM deals WHERE deals.id = deal_products.deal_id AND deals.organization_id = auth.user_organization_id()));

-- Commission Records policies
CREATE POLICY "Users can view organization commission records" ON commission_records FOR SELECT USING (organization_id = auth.user_organization_id());
CREATE POLICY "Managers can insert commission records" ON commission_records FOR INSERT WITH CHECK (organization_id = auth.user_organization_id() AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager')));
CREATE POLICY "Managers can update commission records" ON commission_records FOR UPDATE USING (organization_id = auth.user_organization_id() AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'manager')));

-- Audit Logs policies
CREATE POLICY "Users can view organization audit logs" ON audit_logs FOR SELECT USING (organization_id = auth.user_organization_id());
CREATE POLICY "System can insert audit logs" ON audit_logs FOR INSERT WITH CHECK (true);

-- FUNCTIONS & TRIGGERS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_commission_records_updated_at BEFORE UPDATE ON commission_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Generate deal number
CREATE OR REPLACE FUNCTION generate_deal_number()
RETURNS TRIGGER AS $$
DECLARE
  year_suffix TEXT;
  seq_num INTEGER;
  new_deal_number TEXT;
BEGIN
  year_suffix := TO_CHAR(NOW(), 'YYYY');
  SELECT COALESCE(MAX(CAST(SUBSTRING(deal_number FROM 'DEAL-\d{4}-(\d+)') AS INTEGER)), 0) + 1
  INTO seq_num
  FROM deals
  WHERE organization_id = NEW.organization_id AND deal_number LIKE 'DEAL-' || year_suffix || '-%';
  new_deal_number := 'DEAL-' || year_suffix || '-' || LPAD(seq_num::TEXT, 3, '0');
  NEW.deal_number := new_deal_number;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_deal_number_trigger BEFORE INSERT ON deals FOR EACH ROW WHEN (NEW.deal_number IS NULL OR NEW.deal_number = '') EXECUTE FUNCTION generate_deal_number();

-- DONE! Now you can run npm run dev
