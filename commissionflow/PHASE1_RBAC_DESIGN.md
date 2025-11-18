# Phase 1: RBAC System Design

## Overview

CommissionFlow needs a robust Role-Based Access Control (RBAC) system to support 5 distinct user roles, each with different permissions and access patterns. This design ensures data security, compliance, and a smooth user experience.

---

## 5 User Roles

### 1. Sales Rep (formerly "Telesales")
**Primary Job**: Sell products, generate deals

**Access Level**: Own data only

**Permissions**:
- ✅ View own deals
- ✅ Create new deals
- ✅ Edit own deals (only if not yet approved)
- ✅ View own commission statements
- ❌ Cannot see other sales reps' data
- ❌ Cannot approve commissions
- ❌ Cannot manage commission rules

**Dashboard View**:
- My Deals (current pipeline status)
- My Commission This Month (real-time estimate)
- My Performance (vs. target)

**Typical User**: John (Telesales Agent)

---

### 2. Team Lead (formerly "BDM")
**Primary Job**: Manage a team of sales reps, oversee installations

**Access Level**: Own data + team data

**Permissions**:
- ✅ View own deals
- ✅ View team members' deals (reports to them)
- ✅ Create deals
- ✅ Edit own deals
- ✅ Edit team deals (with limits)
- ✅ View own commissions
- ✅ View team commissions (read-only)
- ✅ Submit commission calculations for approval
- ❌ Cannot approve commissions
- ❌ Cannot see other teams' data
- ❌ Cannot manage commission rules

**Dashboard View**:
- Team Performance
- Team Deals Pipeline
- My Commission + Team Overview
- Pending Installations

**Typical User**: Sarah (BDM, manages 3 sales reps)

---

### 3. Manager
**Primary Job**: Oversee multiple teams, first-level commission approval

**Access Level**: All organizational data

**Permissions**:
- ✅ View all deals across organization
- ✅ Create deals
- ✅ Edit any deal
- ✅ Delete deals
- ✅ View all commissions
- ✅ **Approve commissions (first stage)**
- ✅ Request changes to commission calculations
- ✅ View all reports
- ✅ Export reports to CSV
- ❌ Cannot create/edit commission rules (director only)
- ❌ Cannot manage users (director only)
- ❌ Final payroll approval (accounts only)

**Dashboard View**:
- Organization Overview
- Pending Approvals (commissions awaiting manager approval)
- Team Performance Comparison
- Revenue & Profit Trends

**Approval Workflow Role**: Stage 1 approver

**Typical User**: Mike (Sales Manager, oversees 3 team leads)

---

### 4. Accounts
**Primary Job**: Financial oversight, commission verification, payroll processing

**Access Level**: All financial data (read + approve)

**Permissions**:
- ✅ View all deals
- ✅ View all commissions
- ✅ **Approve commissions (second stage, after manager)**
- ✅ View detailed financial breakdowns
- ✅ Export commission reports for payroll
- ✅ Add manual adjustments (with audit trail)
- ✅ View audit logs
- ❌ Cannot create/edit deals
- ❌ Cannot create/edit commission rules
- ❌ Cannot manage users

**Dashboard View**:
- Pending Financial Approvals
- Commission Summary (by user, by team)
- Monthly Payroll Report
- Audit Trail

**Approval Workflow Role**: Stage 2 approver (financial verification)

**Typical User**: Emma (Accounts Manager)

---

### 5. Director (formerly "Admin")
**Primary Job**: Overall business management, system configuration

**Access Level**: Full system access

**Permissions**:
- ✅ Everything from Manager + Accounts
- ✅ Create/edit/delete commission rules
- ✅ Manage users (create, edit, deactivate)
- ✅ Manage organization settings
- ✅ View system audit logs
- ✅ Override any approval
- ✅ Access advanced settings

**Dashboard View**:
- Executive Dashboard
- System Health & Usage
- Commission Rules Management
- User Management

**Approval Workflow Role**: Can approve at any stage, can override

**Typical User**: David (CEO/Director)

---

## Permission System Design

### Permission Naming Convention
```
<entity>.<action>.<scope>
```

**Examples**:
- `deals.view.own` - Can view own deals
- `deals.view.team` - Can view team deals
- `deals.view.all` - Can view all deals
- `deals.create` - Can create deals
- `deals.edit.own` - Can edit own deals
- `deals.edit.all` - Can edit any deal
- `deals.delete` - Can delete deals
- `commissions.view.own` - Can view own commissions
- `commissions.view.all` - Can view all commissions
- `commissions.approve.manager` - Can approve (manager stage)
- `commissions.approve.accounts` - Can approve (accounts stage)
- `rules.create` - Can create commission rules
- `rules.edit` - Can edit commission rules
- `users.manage` - Can manage users
- `settings.manage` - Can manage org settings
- `reports.view` - Can view reports
- `reports.export` - Can export reports

### Default Permissions by Role

```typescript
// lib/rbac/default-permissions.ts

export const ROLE_PERMISSIONS = {
  sales_rep: [
    'deals.view.own',
    'deals.create',
    'deals.edit.own',
    'commissions.view.own',
  ],

  team_lead: [
    'deals.view.own',
    'deals.view.team',
    'deals.create',
    'deals.edit.own',
    'deals.edit.team',
    'commissions.view.own',
    'commissions.view.team',
    'commissions.submit',
  ],

  manager: [
    'deals.view.all',
    'deals.create',
    'deals.edit.all',
    'deals.delete',
    'commissions.view.all',
    'commissions.approve.manager',
    'reports.view',
    'reports.export',
  ],

  accounts: [
    'deals.view.all',
    'commissions.view.all',
    'commissions.approve.accounts',
    'commissions.adjust',
    'reports.view',
    'reports.export',
    'audit.view',
  ],

  director: [
    'deals.view.all',
    'deals.create',
    'deals.edit.all',
    'deals.delete',
    'commissions.view.all',
    'commissions.approve.all',
    'commissions.adjust',
    'rules.create',
    'rules.edit',
    'rules.delete',
    'users.manage',
    'settings.manage',
    'reports.view',
    'reports.export',
    'audit.view',
  ],
} as const
```

---

## Implementation: Permission Checking

### Backend: API Route Protection

```typescript
// lib/rbac/check-permission.ts

export async function checkPermission(
  userId: string,
  permission: string
): Promise<boolean> {
  // 1. Get user with role
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { role: true, organization_id: true },
  })

  if (!user) return false

  // 2. Check default role permissions
  const rolePermissions = ROLE_PERMISSIONS[user.role] || []
  if (rolePermissions.includes(permission)) return true

  // 3. Check custom user permissions (overrides)
  const customPermission = await prisma.user_permissions.findUnique({
    where: {
      organization_id_user_id_permission: {
        organization_id: user.organization_id,
        user_id: userId,
        permission,
      },
    },
  })

  return customPermission?.granted === true
}

// Middleware for API routes
export async function requirePermission(permission: string) {
  return async (req: NextRequest) => {
    const session = await getServerSession()
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const hasPermission = await checkPermission(session.user.id, permission)
    if (!hasPermission) {
      return new Response('Forbidden', { status: 403 })
    }

    // Continue to route handler
  }
}
```

### Usage in API Routes

```typescript
// app/api/deals/route.ts

export async function GET(req: NextRequest) {
  const session = await getServerSession()
  if (!session?.user) {
    return errorResponse('Unauthorized', 401)
  }

  const user = await prisma.users.findUnique({
    where: { id: session.user.id },
    select: { role: true, organization_id: true },
  })

  // Get deals based on user's role/permissions
  let deals

  if (await checkPermission(user.id, 'deals.view.all')) {
    // Manager, Accounts, Director: See all deals
    deals = await prisma.deals.findMany({
      where: { organization_id: user.organization_id },
    })
  } else if (await checkPermission(user.id, 'deals.view.team')) {
    // Team Lead: See own + team deals
    deals = await prisma.deals.findMany({
      where: {
        organization_id: user.organization_id,
        OR: [
          { telesales_agent_id: user.id }, // Own deals
          { bdm_id: user.id }, // Deals they manage
          {
            telesales_agent: {
              reports_to: user.id, // Team members' deals
            },
          },
        ],
      },
    })
  } else if (await checkPermission(user.id, 'deals.view.own')) {
    // Sales Rep: See only own deals
    deals = await prisma.deals.findMany({
      where: {
        organization_id: user.organization_id,
        telesales_agent_id: user.id,
      },
    })
  } else {
    return errorResponse('Forbidden', 403)
  }

  return successResponse(deals)
}
```

---

## Frontend: UI Permissions

### Permission Hook

```typescript
// hooks/usePermission.ts
'use client'

import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'

export function usePermission(permission: string) {
  const { data: session } = useSession()

  const { data: hasPermission, isLoading } = useQuery({
    queryKey: ['permission', permission],
    queryFn: async () => {
      const res = await fetch(`/api/permissions/check?permission=${permission}`)
      const data = await res.json()
      return data.hasPermission as boolean
    },
    enabled: !!session?.user,
  })

  return { hasPermission: hasPermission ?? false, isLoading }
}

// Usage in components
export function DealActions({ deal }: { deal: Deal }) {
  const { hasPermission: canEdit } = usePermission('deals.edit.all')
  const { hasPermission: canDelete } = usePermission('deals.delete')

  return (
    <div>
      {canEdit && <Button onClick={handleEdit}>Edit</Button>}
      {canDelete && <Button onClick={handleDelete}>Delete</Button>}
    </div>
  )
}
```

### Conditional Rendering by Role

```typescript
// components/RoleGate.tsx
'use client'

import { useSession } from 'next-auth/react'

interface RoleGateProps {
  allowedRoles: Array<'sales_rep' | 'team_lead' | 'manager' | 'accounts' | 'director'>
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function RoleGate({ allowedRoles, children, fallback = null }: RoleGateProps) {
  const { data: session } = useSession()

  if (!session?.user?.role) return fallback

  if (!allowedRoles.includes(session.user.role)) {
    return fallback
  }

  return <>{children}</>
}

// Usage
export function SettingsPage() {
  return (
    <div>
      <h1>Settings</h1>

      {/* Only directors can see this */}
      <RoleGate allowedRoles={['director']}>
        <CommissionRulesSection />
      </RoleGate>

      {/* Managers and directors can see this */}
      <RoleGate allowedRoles={['manager', 'director']}>
        <TeamManagementSection />
      </RoleGate>

      {/* Everyone can see this */}
      <ProfileSection />
    </div>
  )
}
```

---

## Row-Level Security (RLS) Updates

### Enhanced RLS Policies

```sql
-- =====================================================
-- ENHANCED RLS FOR DEALS
-- =====================================================

-- Drop old policies
DROP POLICY IF EXISTS "Users can view organization deals" ON deals;

-- Create role-specific policies

-- Policy 1: Directors, Managers, Accounts can see all deals
CREATE POLICY "Privileged roles can view all deals"
  ON deals FOR SELECT
  USING (
    organization_id = auth.user_organization_id() AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('director', 'manager', 'accounts')
    )
  );

-- Policy 2: Team Leads can see own + team deals
CREATE POLICY "Team leads can view own and team deals"
  ON deals FOR SELECT
  USING (
    organization_id = auth.user_organization_id() AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'team_lead'
      AND (
        deals.telesales_agent_id = users.id OR
        deals.bdm_id = users.id OR
        deals.telesales_agent_id IN (
          SELECT id FROM users WHERE reports_to = auth.uid()
        )
      )
    )
  );

-- Policy 3: Sales Reps can see only own deals
CREATE POLICY "Sales reps can view own deals"
  ON deals FOR SELECT
  USING (
    organization_id = auth.user_organization_id() AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'sales_rep'
      AND deals.telesales_agent_id = users.id
    )
  );

-- =====================================================
-- ENHANCED RLS FOR COMMISSIONS
-- =====================================================

-- Policy 1: Privileged roles can see all commissions
CREATE POLICY "Privileged roles can view all commissions"
  ON commission_calculations FOR SELECT
  USING (
    organization_id = auth.user_organization_id() AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('director', 'manager', 'accounts')
    )
  );

-- Policy 2: Team Leads can see own + team commissions
CREATE POLICY "Team leads can view own and team commissions"
  ON commission_calculations FOR SELECT
  USING (
    organization_id = auth.user_organization_id() AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'team_lead'
      AND (
        commission_calculations.user_id = users.id OR
        commission_calculations.user_id IN (
          SELECT id FROM users WHERE reports_to = auth.uid()
        )
      )
    )
  );

-- Policy 3: Sales Reps can see only own commissions
CREATE POLICY "Sales reps can view own commissions"
  ON commission_calculations FOR SELECT
  USING (
    organization_id = auth.user_organization_id() AND
    commission_calculations.user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'sales_rep'
    )
  );
```

---

## Team Hierarchy Support

To support Team Leads viewing their team's data, we need to add a team hierarchy:

```sql
-- Add reports_to field to users table
ALTER TABLE users ADD COLUMN reports_to UUID REFERENCES users(id);

-- Index for performance
CREATE INDEX idx_users_reports_to ON users(reports_to);

-- Example data:
-- Sales Rep John reports to Team Lead Sarah
UPDATE users SET reports_to = 'sarah-uuid' WHERE id = 'john-uuid';

-- Team Lead Sarah reports to Manager Mike
UPDATE users SET reports_to = 'mike-uuid' WHERE id = 'sarah-uuid';
```

### API to Get Team Members

```typescript
// lib/rbac/get-team-members.ts

export async function getTeamMembers(userId: string): Promise<string[]> {
  const teamMembers = await prisma.users.findMany({
    where: { reports_to: userId, active: true },
    select: { id: true },
  })

  return teamMembers.map(m => m.id)
}

// Include indirect reports (team of team)
export async function getAllSubordinates(userId: string): Promise<string[]> {
  const direct = await getTeamMembers(userId)
  const indirect = await Promise.all(direct.map(id => getTeamMembers(id)))

  return [...direct, ...indirect.flat()]
}
```

---

## Admin UI: Manage Permissions

### Settings Page: User Permissions

```typescript
// app/(dashboard)/settings/users/[userId]/permissions/page.tsx

export default async function UserPermissionsPage({
  params,
}: {
  params: { userId: string }
}) {
  // Check if current user can manage permissions (director only)
  const canManage = await checkPermission(session.user.id, 'users.manage')
  if (!canManage) {
    return <div>Access Denied</div>
  }

  const user = await prisma.users.findUnique({
    where: { id: params.userId },
    include: {
      user_permissions: true,
    },
  })

  const defaultPermissions = ROLE_PERMISSIONS[user.role]
  const customPermissions = user.user_permissions

  return (
    <div>
      <h1>Manage Permissions: {user.name}</h1>

      <section>
        <h2>Default Permissions (from role: {user.role})</h2>
        <ul>
          {defaultPermissions.map(perm => (
            <li key={perm}>✅ {perm}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Custom Permissions</h2>
        <PermissionManager
          userId={user.id}
          customPermissions={customPermissions}
        />
      </section>
    </div>
  )
}
```

---

## Audit Logging for RBAC

Every permission-related action should be logged:

```typescript
// lib/rbac/audit-permission-change.ts

export async function auditPermissionChange(
  organizationId: string,
  actorId: string,
  targetUserId: string,
  permission: string,
  action: 'granted' | 'revoked'
) {
  await prisma.audit_logs.create({
    data: {
      organization_id: organizationId,
      user_id: actorId,
      action: `permission_${action}`,
      entity_type: 'user_permission',
      entity_id: targetUserId,
      new_value: { permission, action },
    },
  })
}
```

---

## Migration from Old Roles

```typescript
// scripts/migrate-roles.ts

async function migrateRoles() {
  // 1. telesales → sales_rep
  await prisma.users.updateMany({
    where: { role: 'telesales' as any },
    data: { role: 'sales_rep' },
  })

  // 2. bdm → team_lead
  await prisma.users.updateMany({
    where: { role: 'bdm' as any },
    data: { role: 'team_lead' },
  })

  // 3. admin → director
  await prisma.users.updateMany({
    where: { role: 'admin' as any },
    data: { role: 'director' },
  })

  // 4. Existing "manager" stays as "manager"

  console.log('✅ Role migration complete')
}
```

---

## Testing RBAC

### Unit Tests

```typescript
// __tests__/rbac/permissions.test.ts

describe('RBAC Permission Checking', () => {
  it('sales rep can view own deals', async () => {
    const hasPermission = await checkPermission(salesRepId, 'deals.view.own')
    expect(hasPermission).toBe(true)
  })

  it('sales rep cannot view all deals', async () => {
    const hasPermission = await checkPermission(salesRepId, 'deals.view.all')
    expect(hasPermission).toBe(false)
  })

  it('manager can approve commissions', async () => {
    const hasPermission = await checkPermission(managerId, 'commissions.approve.manager')
    expect(hasPermission).toBe(true)
  })

  it('team lead can view team deals', async () => {
    const hasPermission = await checkPermission(teamLeadId, 'deals.view.team')
    expect(hasPermission).toBe(true)
  })
})
```

---

## Summary

This RBAC design provides:
- ✅ 5 distinct user roles with clear responsibilities
- ✅ Granular permission system with scoping
- ✅ Row-level security at database level
- ✅ Team hierarchy support (reports_to)
- ✅ Custom permission overrides per user
- ✅ Audit logging for compliance
- ✅ Frontend and backend permission checking
- ✅ Migration path from old roles

**Next**: Design the approval workflow state machine
