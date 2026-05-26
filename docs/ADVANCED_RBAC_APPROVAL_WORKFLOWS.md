# Advanced RBAC & Approval Workflows

## Current baseline

- Workspace roles: `UserRole` + `StaffMember` / `StaffRoleType` / custom roles.  
- Platform roles: `PlatformUserRole` + founder email bootstrap (`lib/platform-owner.ts`).  
- Sensitive flows already partially exist (`GoLiveApproval`, purchasing approvals).

## This pass

- `lib/permissions/permission-matrix.ts` — **declarative** capability bundles per `StaffRoleType` (documentation + future enforcement).  
- `lib/permissions/approval-rules.ts` — `SensitiveAction` → `ApprovalStatus` policy table.  
- `services/permissions/approval-service.ts` — `evaluateApprovalRequirement` (**no DB rows yet** — honest).  
- `services/permissions/access-review-service.ts` — quarterly review checklist stub.

## Required next engineering

1. Persist approvals (`ApprovalRequest` model) with `requestedBy`, `approverRole`, `reason`, `expiresAt`, `auditLogId`.  
2. Wire **server actions** for cancel/refund/replay/demo-reset to consult `evaluateApprovalRequirement` **and** enforce capabilities from the matrix, not only UI.

## Founder rule

- `workspace.moroz@gmail.com` remains break-glass per existing platform-owner policy — **do not** remove or narrow without explicit product decision.
