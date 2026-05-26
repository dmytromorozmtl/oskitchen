# Final product gap audit (KitchenOS)

**Audience:** Release / product / engineering.  
**Method:** Route inventory + architecture review (not every static marketing page enumerated line-by-line).  
**Classifications:** READY | NEEDS_POLISH | NEEDS_DATA_CONNECTION | NEEDS_WORKFLOW_CONNECTION | PLACEHOLDER | SECURITY_RISK | BROKEN  
**Priorities:** P0 launch blocker | P1 commercial MVP | P2 polish | P3 post-MVP

## Executive summary

| Area | Dominant gap class | Priority |
|------|-------------------|----------|
| Order core status + audit | **NEEDS_WORKFLOW_CONNECTION** → **hardened** for DB `OrderStatus` (see `ORDER_LIFECYCLE_COMPLETION.md`) | P1 → addressed in code |
| Order detail UX | **NEEDS_POLISH** → improved pipeline card, ops columns, internal notes | P1 → partial |
| Today / Dashboard | Mixed **NEEDS_DATA** / **NEEDS_POLISH** (KPIs, deep links) | P1–P2 |
| Platform `/platform` | **NEEDS_POLISH** / entitlements depth | P1–P2 |
| Storefront `app/s/[storeSlug]` | **NEEDS_WORKFLOW_CONNECTION** (tenant isolation, payments) | P0–P1 per deploy |
| Marketing / resources | **READY** (content) | P3 |

---

## Auth and onboarding

| Route / module | Purpose | State | Missing / risk | Priority |
|----------------|---------|-------|----------------|----------|
| `/signup`, login flows | Acquisition | NEEDS_POLISH | Edge-case error copy, rate limits | P2 |
| Onboarding wizard | Workspace setup | NEEDS_WORKFLOW_CONNECTION | Business-mode-specific tasks still evolving | P1–P2 |
| `/dashboard` (post-auth) | Shell | READY | — | — |

---

## Workspace dashboard (operator)

| Route | Purpose | Classification | Notes |
|-------|---------|----------------|-------|
| `/dashboard` | Owner overview | NEEDS_POLISH | Differentiate further from `/dashboard/today`; KPI cache | P2 |
| `/dashboard/today` | Ops command center | NEEDS_DATA_CONNECTION | Cards depend on integrations/webhooks | P1 |
| `/dashboard/orders` | List / triage | NEEDS_POLISH | Pagination, saved views | P2 |
| `/dashboard/orders/[orderId]` | Single order | **NEEDS_POLISH** (improved) | Deep links to fix blockers; optional print PDF | P1–P2 |
| `/dashboard/orders/new`, `quick` | Capture | READY | Menu prerequisite enforced in `createOrder` | P1 |
| `/dashboard/production` | Kitchen execution | NEEDS_WORKFLOW_CONNECTION | Batch ↔ order status sync | P1 |
| `/dashboard/packing` | Packing | NEEDS_WORKFLOW_CONNECTION | QC ↔ order | P1 |
| `/dashboard/routes` | Dispatch | NEEDS_DATA_CONNECTION | Address validation on stops | P1 |
| `/dashboard/order-hub` | Imports / channel | NEEDS_DATA_CONNECTION | Provider-specific | P1 |
| `/dashboard/customers/*` | CRM | NEEDS_POLISH | Unified activity vs legacy timeline | P2 |
| `/dashboard/settings/*` | Configuration | NEEDS_POLISH | Readiness score, save bars (partial elsewhere) | P2 |
| `/dashboard/error-recovery` | Ops recovery | NEEDS_DATA_CONNECTION | Retry semantics per provider | P1 |
| `/dashboard/integrity` (or equivalent) | Data health | NEEDS_DATA_CONNECTION | Auto-fix only when provably safe | P2 |
| `/dashboard/audit-logs` | Compliance | READY | Redaction policy | P2 |

---

## Customer-facing

| Route | Purpose | Classification | Security |
|-------|---------|----------------|----------|
| `/order/[token]` | Lookup | READY | Token-only; no admin data |
| `app/s/[storeSlug]/*` | Storefront | NEEDS_WORKFLOW_CONNECTION | Checkout + webhooks; **tenant scoping** is P0 for prod |
| `/customers` (app) | End-customer portal slice | varies | RBAC |

---

## Platform (internal)

| Area | Classification | Permission risk |
|------|----------------|-----------------|
| `/platform/*` | NEEDS_POLISH | **P0** if any workspace user can hit routes — must stay platform-role gated |
| Platform support / impersonation | NEEDS_WORKFLOW_CONNECTION | **SECURITY_RISK** if unaudited; ensure audit + reason |
| `/platform/workspaces/[id]` | CRM / config | NEEDS_DATA_CONNECTION | Cross-tenant writes |

**Invariant:** `workspace.moroz@gmail.com` retains founder/superadmin (product rule; enforced in seed/platform role config).

---

## Cross-cutting

| Concern | State | Priority |
|---------|-------|----------|
| RBAC | NEEDS_POLISH | P1 — see `docs/PERMISSIONS_RBAC.md` |
| Audit | NEEDS_POLISH | P1 — expand coverage for settings/billing |
| Notifications (Resend) | NEEDS_DATA_CONNECTION | P1 — graceful no-provider mode |
| Billing (Stripe) | NEEDS_DATA_CONNECTION | P1 — honest disabled UI when unset |
| Performance (large tables) | NEEDS_POLISH | P2 — pagination / indexes |
| Global search Cmd+K | NEEDS_POLISH | P2 — result ranking, more entity types |

---

## P0 / P1 punch list (next engineering passes)

1. **P0:** Prove `/platform` middleware + server actions reject workspace-only roles (automated test per persona).
2. **P1:** Tie production/packing completion hooks to suggested (not forced) order status updates.
3. **P1:** Storefront tenant isolation and payment webhooks in staging.
4. **P2:** Empty-state copy sweep (`docs/EMPTY_STATE_POLISH_REPORT.md` when generated).
5. **P3:** Resource center SEO-only pages — no blocking issues.

This audit is **living**: update classifications when ships land.
