# Platform admin audit

Internal-only `/platform/*` console for OS Kitchen operators. This document audits the **current** implementation (not the full future roadmap).

## Routes

| Route | Current behavior | Risk / gap | Team | Priority |
|--------|-------------------|------------|------|----------|
| `/platform/dashboard` | Command-center KPIs + health/support/billing summaries + recent `PLATFORM` audit tail | MRR/ARR/churn/incidents are placeholders until Stripe + health tables | All ops | P2 |
| `/platform/workspaces` | List + link to detail | No archive/lock/plan edit UI yet | Implementation, Support | P1 |
| `/platform/workspaces/[id]` | Read-only overview (owner, subscription, org) | No tabs (modules, webhooks, danger zone) | Implementation | P1 |
| `/platform/users` | Directory + preview link + super-admin impersonate | No disable/invite/role reset from platform | Support | P1 |
| `/platform/preview/[userId]` | Read-only profile snapshot | Not a substitute for audited impersonation | Support | P2 |
| `/platform/organizations` | List | No org detail / franchise rollup | Growth | P2 |
| `/platform/support` | Inbox table | — | Support | — |
| `/platform/support/[id]` | Thread, internal notes, customer replies, status, assign | Assignee is raw UUID; no SLA widgets | Support | P1 |
| `/platform/support/queue` | Open-like statuses | — | Support | — |
| `/platform/support/escalations` | `ESCALATED` filter | — | Support | — |
| `/platform/support/knowledge-base` | Stub | No macros / articles | Support | P3 |
| `/platform/integrations` | Connection list (no secrets) | No replay/repair actions | Support, Eng | P1 |
| `/platform/webhooks`, `/platform/jobs`, `/platform/notifications` | Stubs | Needs queue instrumentation | Eng | P2 |
| `/platform/automations` | Execution list | No retry/disable | Eng | P1 |
| `/platform/audit` | `PLATFORM` + `platform.*` tail | Full cross-tenant filters pending | Security | P1 |
| `/platform/tools`, `/platform/tools/db-health` | Links + DB ping | Dangerous tools not implemented | Eng | P1 |
| `/platform/billing`, `/platform/trials`, … | Stubs | No Stripe writes | Billing | P1 |
| `/platform/search` | Users, workspaces, orgs, tickets | No invoices / audit full-text | All | P2 |
| `/platform/feature-flags` | Lists `FeatureFlag` | Writes require `platform:feature-flags:write` | Eng | P2 |

## Access control

- **Layout**: `requirePlatformAccess()` — `isPlatformAdmin` OR founder email; `resolvePlatformPermissions` gates nav.
- **Workspace roles** are separate from **Prisma `PlatformUserRole`** (see `lib/platform-admin.ts`, `lib/platform/platform-permissions.ts`).
- **Founder**: `workspace.moroz@gmail.com` via `isSuperAdminEmail` receives full permission set and cannot be impersonation-blocked as another super-admin target only if they are the founder profile (see `isTargetSuperAdminProtected`).

## Isolation gaps (mitigations)

1. **Direct URL to stub routes**: Low risk if page calls `assertPlatformPermission` — **ensure every new platform page asserts**.
2. **Support assignee UUID**: Operational friction + mis-assignment risk — **P1** replace with searchable staff picker.
3. **Audit log `listPlatformAuditTail`**: Filters to platform category/prefix; other tenant actions remain in general audit — **document** for auditors.

## Impersonation

- Start: `requireSuperAdmin` in `actions/platform-impersonation.ts` (not all platform roles).
- Cookie session 1h; `recordPlatformAudit` includes resolved workspace when owner/member found.

## Data privacy

- Integration list does not print tokens (columns are provider/status only).
- Preview page avoids subscription secrets.

## Recommended next slices

1. P0: Per-route `assertPlatformPermission` on **all** `/platform/*` pages (including dashboard if split per-widget).
2. P1: Workspace detail tabs + billing/trial actions with **reason + audit**.
3. P1: Staff picker for assignment + customer reply email notifications if product requires.
