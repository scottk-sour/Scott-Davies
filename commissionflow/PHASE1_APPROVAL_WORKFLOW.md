# Phase 1: Approval Workflow State Machine

## Overview

The approval workflow ensures that commission calculations are verified by multiple stakeholders before being paid out. This design implements a multi-stage approval process with state tracking, audit trails, and notification system.

---

## Workflow States

### State Diagram

```
                    ┌─────────────┐
                    │   DRAFT     │
                    │  (initial)  │
                    └──────┬──────┘
                           │ submit
                           ▼
                  ┌────────────────┐
                  │   SUBMITTED    │
                  │ (pending stage │
                  │  1 approval)   │
                  └───┬────────┬───┘
                      │        │
            approved  │        │ rejected
            by mgr    │        │
                      ▼        ▼
           ┌──────────────┐  ┌──────────────┐
           │  MANAGER_    │  │   REJECTED   │
           │  APPROVED    │  │  (terminal)  │
           │ (pending     │  └──────────────┘
           │  stage 2)    │
           └──┬────────┬──┘
              │        │
    approved  │        │ rejected
    by accts  │        │
              ▼        ▼
   ┌──────────────┐  ┌──────────────┐
   │  ACCOUNTS_   │  │   REJECTED   │
   │  APPROVED    │  │  (terminal)  │
   │ (pending     │  └──────────────┘
   │  payroll)    │
   └──────┬───────┘
          │
          │ approved by director
          │ or marked as paid
          ▼
   ┌──────────────┐
   │     PAID     │
   │  (terminal)  │
   └──────────────┘

Special States:
   ┌──────────────┐       ┌──────────────┐
   │  DISPUTED    │       │  CANCELLED   │
   │ (can return  │       │  (terminal)  │
   │  to pending) │       └──────────────┘
   └──────────────┘
```

### State Definitions

| State | Description | Who Can Act | Possible Actions |
|-------|-------------|-------------|------------------|
| `draft` | Initial state, not yet submitted | Calculation creator | Submit, Edit, Delete |
| `submitted` | Awaiting manager approval (stage 1) | Manager | Approve, Reject, Request Changes |
| `manager_approved` | Manager approved, awaiting accounts verification (stage 2) | Accounts | Approve, Reject, Request Audit |
| `accounts_approved` | Accounts verified, ready for payroll | Director, Accounts | Mark as Paid |
| `paid` | Commission has been paid out | None | View only (terminal state) |
| `rejected` | Rejected at any stage | Calculation creator | View reason, Fix and Resubmit |
| `disputed` | User disputes the calculation | Manager, Director | Investigate, Adjust, Approve, or Reject |
| `cancelled` | Cancelled before payment | Manager, Director | View only (terminal state) |

---

## Database Schema (Already Defined in Phase 1 Plan)

### Quick Reference

**`approval_workflows`** - Workflow definitions
- Defines stages and roles for each workflow type
- Can have different workflows for different commission types

**`approval_requests`** - Workflow instances
- One request per commission calculation
- Tracks current stage and overall status

**`approval_actions`** - Action history
- Every approve/reject/comment action
- Full audit trail

---

## Workflow Engine Implementation

### Core Workflow Engine

```typescript
// lib/workflow/approval-engine.ts

export class ApprovalEngine {
  /**
   * Submit a commission calculation for approval
   */
  async submitForApproval(
    calculationId: string,
    submittedBy: string
  ): Promise<ApprovalRequest> {
    // 1. Get the calculation
    const calculation = await prisma.commission_calculations.findUnique({
      where: { id: calculationId },
    })

    if (!calculation) {
      throw new Error('Calculation not found')
    }

    if (calculation.status !== 'calculated') {
      throw new Error('Calculation must be in "calculated" state to submit')
    }

    // 2. Get the appropriate workflow
    const workflow = await this.getWorkflow(
      calculation.organization_id,
      'commission'
    )

    // 3. Check if auto-approve applies
    const shouldAutoApprove = this.checkAutoApprove(workflow, calculation)

    if (shouldAutoApprove) {
      return this.autoApprove(calculation, workflow, submittedBy)
    }

    // 4. Create approval request
    const approvalRequest = await prisma.approval_requests.create({
      data: {
        organization_id: calculation.organization_id,
        workflow_id: workflow.id,
        entity_type: 'commission',
        entity_id: calculationId,
        requested_by: submittedBy,
        current_stage: 1,
        status: 'pending',
      },
    })

    // 5. Update calculation status
    await prisma.commission_calculations.update({
      where: { id: calculationId },
      data: { status: 'pending' },
    })

    // 6. Notify stage 1 approvers (managers)
    await this.notifyApprovers(workflow, 1, approvalRequest.id)

    return approvalRequest
  }

  /**
   * Approve at current stage
   */
  async approve(
    requestId: string,
    approverId: string,
    comment?: string
  ): Promise<ApprovalRequest> {
    // 1. Get request with workflow
    const request = await prisma.approval_requests.findUnique({
      where: { id: requestId },
      include: { workflow: true },
    })

    if (!request || request.status !== 'pending') {
      throw new Error('Invalid approval request')
    }

    // 2. Verify approver has permission for this stage
    await this.verifyApproverPermission(
      approverId,
      request.workflow,
      request.current_stage
    )

    // 3. Record the approval action
    await prisma.approval_actions.create({
      data: {
        approval_request_id: requestId,
        actor_id: approverId,
        actor_role: await this.getActorRole(approverId),
        action: 'approved',
        stage: request.current_stage,
        comment,
      },
    })

    // 4. Determine next stage
    const stages = request.workflow.stages as any[]
    const nextStage = request.current_stage + 1

    if (nextStage > stages.length) {
      // Final approval - move to "approved" state
      await prisma.approval_requests.update({
        where: { id: requestId },
        data: {
          status: 'approved',
          final_approver: approverId,
          final_decision_at: new Date(),
        },
      })

      // Update calculation
      await prisma.commission_calculations.update({
        where: { id: request.entity_id },
        data: { status: 'approved' },
      })

      // Notify requester
      await this.notifyRequester(requestId, 'approved')

      return await prisma.approval_requests.findUnique({
        where: { id: requestId },
      })
    } else {
      // Move to next stage
      await prisma.approval_requests.update({
        where: { id: requestId },
        data: { current_stage: nextStage },
      })

      // Notify next stage approvers
      await this.notifyApprovers(request.workflow, nextStage, requestId)

      return await prisma.approval_requests.findUnique({
        where: { id: requestId },
      })
    }
  }

  /**
   * Reject at current stage
   */
  async reject(
    requestId: string,
    rejecterId: string,
    reason: string
  ): Promise<ApprovalRequest> {
    const request = await prisma.approval_requests.findUnique({
      where: { id: requestId },
      include: { workflow: true },
    })

    if (!request || request.status !== 'pending') {
      throw new Error('Invalid approval request')
    }

    // Verify permission
    await this.verifyApproverPermission(
      rejecterId,
      request.workflow,
      request.current_stage
    )

    // Record rejection
    await prisma.approval_actions.create({
      data: {
        approval_request_id: requestId,
        actor_id: rejecterId,
        actor_role: await this.getActorRole(rejecterId),
        action: 'rejected',
        stage: request.current_stage,
        comment: reason,
      },
    })

    // Update request status
    await prisma.approval_requests.update({
      where: { id: requestId },
      data: {
        status: 'rejected',
        final_approver: rejecterId,
        final_decision_at: new Date(),
      },
    })

    // Update calculation
    await prisma.commission_calculations.update({
      where: { id: request.entity_id },
      data: {
        status: 'rejected',
        dispute_reason: reason,
      },
    })

    // Notify requester
    await this.notifyRequester(requestId, 'rejected', reason)

    return await prisma.approval_requests.findUnique({
      where: { id: requestId },
    })
  }

  /**
   * Request changes (send back to requester)
   */
  async requestChanges(
    requestId: string,
    requesterId: string,
    changes: string
  ): Promise<ApprovalRequest> {
    const request = await prisma.approval_requests.findUnique({
      where: { id: requestId },
    })

    // Record action
    await prisma.approval_actions.create({
      data: {
        approval_request_id: requestId,
        actor_id: requesterId,
        actor_role: await this.getActorRole(requesterId),
        action: 'requested_changes',
        stage: request.current_stage,
        comment: changes,
      },
    })

    // Move back to stage 1 (or keep at current stage - depends on policy)
    await prisma.approval_requests.update({
      where: { id: requestId },
      data: { current_stage: 1 }, // Reset to beginning
    })

    // Notify requester
    await this.notifyRequester(requestId, 'changes_requested', changes)

    return await prisma.approval_requests.findUnique({
      where: { id: requestId },
    })
  }

  /**
   * Mark as paid (final step)
   */
  async markAsPaid(
    calculationId: string,
    paidBy: string,
    paymentRef?: string
  ): Promise<void> {
    const calculation = await prisma.commission_calculations.findUnique({
      where: { id: calculationId },
    })

    if (calculation.status !== 'approved') {
      throw new Error('Calculation must be approved before marking as paid')
    }

    // Update calculation
    await prisma.commission_calculations.update({
      where: { id: calculationId },
      data: {
        status: 'paid',
        notes: paymentRef ? `Paid: ${paymentRef}` : calculation.notes,
      },
    })

    // Record in audit log
    await prisma.audit_logs.create({
      data: {
        organization_id: calculation.organization_id,
        user_id: paidBy,
        action: 'commission_paid',
        entity_type: 'commission_calculation',
        entity_id: calculationId,
        new_value: { payment_ref: paymentRef },
      },
    })

    // Notify user
    await this.notifyUser(calculation.user_id, 'commission_paid', calculation)
  }

  /**
   * Check if auto-approve conditions are met
   */
  private checkAutoApprove(
    workflow: ApprovalWorkflow,
    calculation: CommissionCalculation
  ): boolean {
    if (!workflow.auto_approve_if) return false

    const conditions = workflow.auto_approve_if as any

    // Example: Auto-approve if amount under £100
    if (conditions.amount_under && calculation.total_amount < conditions.amount_under) {
      return true
    }

    // Example: Auto-approve if specific user
    if (conditions.user_ids && conditions.user_ids.includes(calculation.user_id)) {
      return true
    }

    return false
  }

  /**
   * Auto-approve a calculation
   */
  private async autoApprove(
    calculation: CommissionCalculation,
    workflow: ApprovalWorkflow,
    submittedBy: string
  ): Promise<ApprovalRequest> {
    // Create request in "approved" state
    const request = await prisma.approval_requests.create({
      data: {
        organization_id: calculation.organization_id,
        workflow_id: workflow.id,
        entity_type: 'commission',
        entity_id: calculation.id,
        requested_by: submittedBy,
        current_stage: 999, // Special stage for auto-approved
        status: 'approved',
        final_approver: 'SYSTEM',
        final_decision_at: new Date(),
      },
    })

    // Record auto-approval action
    await prisma.approval_actions.create({
      data: {
        approval_request_id: request.id,
        actor_id: 'SYSTEM',
        actor_role: 'system',
        action: 'approved',
        stage: 0,
        comment: 'Auto-approved: Met auto-approval criteria',
      },
    })

    // Update calculation
    await prisma.commission_calculations.update({
      where: { id: calculation.id },
      data: { status: 'approved' },
    })

    return request
  }

  // Additional helper methods...
  private async verifyApproverPermission(...) { /* ... */ }
  private async getActorRole(...) { /* ... */ }
  private async notifyApprovers(...) { /* ... */ }
  private async notifyRequester(...) { /* ... */ }
  private async notifyUser(...) { /* ... */ }
}

export const approvalEngine = new ApprovalEngine()
```

---

## API Routes

### Approval Management

```typescript
// app/api/approvals/route.ts

/**
 * GET /api/approvals
 * Get pending approval requests for current user
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession()
  if (!session?.user) {
    return errorResponse('Unauthorized', 401)
  }

  const user = await prisma.users.findUnique({
    where: { id: session.user.id },
    select: { role: true, organization_id: true },
  })

  // Get approvals based on user's role and current stage
  const approvals = await prisma.approval_requests.findMany({
    where: {
      organization_id: user.organization_id,
      status: 'pending',
      // Filter by what stage user can approve
      ...(await getStageFilter(user.role)),
    },
    include: {
      workflow: true,
      approval_actions: {
        orderBy: { acted_at: 'desc' },
        take: 5,
      },
    },
    orderBy: { requested_at: 'asc' },
  })

  return successResponse(approvals)
}

/**
 * POST /api/approvals/[id]/approve
 * Approve an approval request
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession()
  if (!session?.user) {
    return errorResponse('Unauthorized', 401)
  }

  const body = await req.json()
  const { comment } = body

  try {
    const result = await approvalEngine.approve(
      params.id,
      session.user.id,
      comment
    )

    return successResponse(result)
  } catch (error) {
    return errorResponse(error.message, 400)
  }
}

/**
 * POST /api/approvals/[id]/reject
 * Reject an approval request
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession()
  if (!session?.user) {
    return errorResponse('Unauthorized', 401)
  }

  const body = await req.json()
  const { reason } = body

  if (!reason) {
    return errorResponse('Rejection reason is required', 400)
  }

  try {
    const result = await approvalEngine.reject(
      params.id,
      session.user.id,
      reason
    )

    return successResponse(result)
  } catch (error) {
    return errorResponse(error.message, 400)
  }
}
```

---

## UI Components

### Approvals Dashboard

```typescript
// app/(dashboard)/approvals/page.tsx

export default async function ApprovalsPage() {
  const session = await getServerSession()
  const user = await getUserWithRole(session.user.id)

  // Get pending approvals for this user's role
  const pendingApprovals = await prisma.approval_requests.findMany({
    where: {
      organization_id: user.organization_id,
      status: 'pending',
      // Only show approvals at stages this role can approve
    },
    include: {
      commission_calculation: {
        include: { user: true },
      },
      approval_actions: true,
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Pending Approvals</h1>
        <Badge variant="secondary">
          {pendingApprovals.length} pending
        </Badge>
      </div>

      {pendingApprovals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No pending approvals</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingApprovals.map((approval) => (
            <ApprovalCard key={approval.id} approval={approval} />
          ))}
        </div>
      )}
    </div>
  )
}
```

### Approval Card Component

```typescript
// components/approvals/ApprovalCard.tsx
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'

export function ApprovalCard({ approval }: { approval: ApprovalRequest }) {
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [comment, setComment] = useState('')
  const [rejectReason, setRejectReason] = useState('')

  const handleApprove = async () => {
    setIsApproving(true)
    try {
      await fetch(`/api/approvals/${approval.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment }),
      })

      // Refresh page or remove from list
      window.location.reload()
    } catch (error) {
      alert('Failed to approve')
    } finally {
      setIsApproving(false)
    }
  }

  const handleReject = async () => {
    if (!rejectReason) {
      alert('Please provide a reason for rejection')
      return
    }

    setIsRejecting(true)
    try {
      await fetch(`/api/approvals/${approval.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason }),
      })

      window.location.reload()
    } catch (error) {
      alert('Failed to reject')
    } finally {
      setIsRejecting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>
              Commission: {approval.commission_calculation.user.name}
            </CardTitle>
            <p className="text-sm text-gray-500">
              Period: {formatPeriod(approval.commission_calculation)}
            </p>
          </div>
          <Badge variant="warning">Stage {approval.current_stage}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Commission Details */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
          <div>
            <p className="text-sm text-gray-600">Base Amount</p>
            <p className="text-lg font-semibold">
              £{(approval.commission_calculation.base_amount / 100).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="text-lg font-semibold text-green-600">
              £{(approval.commission_calculation.total_amount / 100).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Previous Actions */}
        {approval.approval_actions.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold">Previous Actions:</p>
            {approval.approval_actions.map((action) => (
              <div key={action.id} className="text-sm p-2 bg-gray-50 rounded">
                <span className="font-medium">{action.actor_role}</span>{' '}
                {action.action} at stage {action.stage}
                {action.comment && <p className="text-gray-600 mt-1">{action.comment}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Approval Actions */}
        <div className="space-y-3 pt-4 border-t">
          <Textarea
            placeholder="Add a comment (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <div className="flex space-x-3">
            <Button
              onClick={handleApprove}
              disabled={isApproving || isRejecting}
              className="flex-1"
            >
              {isApproving ? 'Approving...' : '✅ Approve'}
            </Button>

            <Button
              onClick={() => {
                const reason = prompt('Reason for rejection:')
                if (reason) {
                  setRejectReason(reason)
                  handleReject()
                }
              }}
              variant="destructive"
              disabled={isApproving || isRejecting}
              className="flex-1"
            >
              {isRejecting ? 'Rejecting...' : '❌ Reject'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## Notification System

### Email Notifications

```typescript
// lib/notifications/approval-notifications.ts

export async function notifyManagersOfPendingApproval(
  approvalRequestId: string
) {
  const request = await prisma.approval_requests.findUnique({
    where: { id: approvalRequestId },
    include: {
      commission_calculation: {
        include: { user: true },
      },
    },
  })

  // Get all managers in organization
  const managers = await prisma.users.findMany({
    where: {
      organization_id: request.organization_id,
      role: 'manager',
      active: true,
    },
  })

  // Send email to each manager
  for (const manager of managers) {
    await sendEmail({
      to: manager.email,
      subject: 'Commission Approval Required',
      template: 'approval-required',
      data: {
        managerName: manager.name,
        userName: request.commission_calculation.user.name,
        amount: request.commission_calculation.total_amount / 100,
        approvalUrl: `https://commissionflow.app/approvals/${request.id}`,
      },
    })
  }
}

// Similar functions for:
// - notifyAccountsOfPendingApproval()
// - notifyRequesterOfApproval()
// - notifyRequesterOfRejection()
// - notifyUserOfPayment()
```

---

## Workflow Configuration UI

### Settings → Workflows

```typescript
// app/(dashboard)/settings/workflows/page.tsx

export default async function WorkflowsPage() {
  const session = await getServerSession()
  const user = await getUserWithRole(session.user.id)

  // Only directors can manage workflows
  if (user.role !== 'director') {
    return <div>Access Denied</div>
  }

  const workflows = await prisma.approval_workflows.findMany({
    where: { organization_id: user.organization_id },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Approval Workflows</h1>

      <Button>+ Create New Workflow</Button>

      <div className="space-y-4">
        {workflows.map((workflow) => (
          <WorkflowCard key={workflow.id} workflow={workflow} />
        ))}
      </div>
    </div>
  )
}
```

---

## Testing the Workflow

### Unit Tests

```typescript
// __tests__/workflow/approval-engine.test.ts

describe('Approval Engine', () => {
  it('submits calculation for approval', async () => {
    const request = await approvalEngine.submitForApproval(calcId, userId)

    expect(request.status).toBe('pending')
    expect(request.current_stage).toBe(1)
  })

  it('approves at stage 1 and moves to stage 2', async () => {
    const request = await approvalEngine.approve(requestId, managerId)

    expect(request.current_stage).toBe(2)
    expect(request.status).toBe('pending')
  })

  it('final approval marks as approved', async () => {
    await approvalEngine.approve(requestId, managerId) // Stage 1
    const final = await approvalEngine.approve(requestId, accountsId) // Stage 2

    expect(final.status).toBe('approved')
  })

  it('rejection stops workflow', async () => {
    const request = await approvalEngine.reject(requestId, managerId, 'Wrong amount')

    expect(request.status).toBe('rejected')

    // Cannot approve a rejected request
    await expect(
      approvalEngine.approve(requestId, accountsId)
    ).rejects.toThrow()
  })
})
```

---

## Summary

This approval workflow system provides:

- ✅ Multi-stage approval process (Manager → Accounts → Paid)
- ✅ State machine with clear transitions
- ✅ Full audit trail of all actions
- ✅ Notification system for approvers
- ✅ Auto-approval for small amounts
- ✅ Request changes functionality
- ✅ Dispute handling
- ✅ UI for approvers and requesters
- ✅ Configurable workflows per organization

**Next**: Create final migration plan from current hardcoded system to flexible rules system
