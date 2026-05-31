# OS Kitchen — Final Commercial MVP Route Audit

**Date:** 2026-05-14  
**Scope:** Customer workspace, internal platform, public marketing surfaces.  
**Method:** Codebase route inventory (`app/`), service wiring, RBAC patterns, and honest gap callouts. Some **requested path labels** differ from canonical URLs (noted inline).

## Classification legend

| Tag | Meaning |
|-----|---------|
| **READY** | Coherent UX, real data path, demo-safe for the story it tells. |
| **FUNCTIONAL BUT SHALLOW** | Works but thin depth, few edge cases, or light automation. |
| **NEEDS WORKFLOW CONNECTION** | UI exists; cross-module handoff (orders → production → packing → routes) incomplete or manual. |
| **NEEDS UX POLISH** | Copy, density, hierarchy, or empty states need refinement. |
| **PLACEHOLDER FEEL** | Obvious stub, “coming soon”, or static sample where a buyer expects live workflow. |
| **SECURITY RISK** | Would be a risk if server checks were missing; **verify middleware + server actions** on any change. |
| **NOT DEMO READY** | Missing core narrative or likely to embarrass in a serious demo. |

## Priority legend

- **P0** — Launch blocker (wrong, unsafe, or breaks core story).  
- **P1** — Commercial MVP blocker (weakens “this is one OS” or blocks sales narrative).  
- **P2** — Polish.  
- **P3** — Post-MVP.

---

## Customer workspace

| Route | Purpose | Current state | Gaps / risks | Tag | Commercial readiness | Required fix (summary) | Pri |
|-------|---------|---------------|--------------|-----|----------------------|-------------------------|-----|
| `/dashboard` | Classic home / KPIs | Functional overview | Overlaps with Today; ensure single narrative | FUNCTIONAL BUT SHALLOW | OK secondary entry | Cross-link + align KPIs with Today | P2 |
| `/dashboard/today` | Operational command center | **Upgraded** KPIs (POS tx, POS kitchen queue, revenue today) | More sections (queues) still data-limited vs spec | NEEDS WORKFLOW CONNECTION | **Demo-improving** | Keep deepening queue cards + deep links | P1 |
| `/dashboard/pos` | POS hub | Registers, shifts, terminal entry exist | Full FOH narrative still maturing | NEEDS WORKFLOW CONNECTION | OK for guided demo | Wire receipts/transactions to order lifecycle blockers | P1 |
| `/dashboard/pos/terminal` | Touch POS | Terminal UI | Depends on catalog + shift | NEEDS UX POLISH | Guided demo | Touch-first polish, sidebar toggle | P2 |
| `/dashboard/pos/registers` | Register CRUD | Functional | — | FUNCTIONAL BUT SHALLOW | OK | — | P3 |
| `/dashboard/pos/shifts` | Shift open/close | Functional | Variance approval depth | FUNCTIONAL BUT SHALLOW | OK | Manager threshold flows | P2 |
| `/dashboard/pos/transactions` | Transaction list | Functional | Tie to order blockers (POS_TRANSACTION_MISSING) | NEEDS WORKFLOW CONNECTION | **Better** | Reconciliation UX | P1 |
| `/dashboard/pos/receipts` | Receipts | Functional | RECEIPT_MISSING surfaced on order | NEEDS WORKFLOW_CONNECTION | **Better** | Print/regenerate policy | P2 |
| `/dashboard/pos/settings` | POS settings | Partial | — | FUNCTIONAL BUT SHALLOW | OK | Centralize in Settings hub | P2 |
| `/dashboard/pos/reports` | POS analytics | Shallow | — | FUNCTIONAL BUT SHALLOW | Soft demo | Deeper register/shift reports | P2 |
| `/dashboard/orders` | Order list | Functional | — | FUNCTIONAL BUT SHALLOW | OK | Saved views by business mode | P2 |
| `/dashboard/orders/new` | Manual order | Functional | — | NEEDS WORKFLOW CONNECTION | OK | Fulfillment wizard consistency | P1 |
| `/dashboard/orders/[orderId]` | Order detail | **Tabs + lifecycle + next actions** | Tabs depth vs spec (all 9 tabs may not exist) | NEEDS UX POLISH | **Demo-ready guided** | Finish tab parity (audit gating) | P1 |
| `/dashboard/order-hub` | Intake / triage | Tabs + filters | Channel depth varies by connection | NEEDS WORKFLOW CONNECTION | OK | Tab counts from lifecycle engine | P1 |
| `/dashboard/menus` | Menu management | Functional | Not required for all business types (OK) | FUNCTIONAL BUT SHALLOW | OK | Mode-aware copy | P2 |
| `/dashboard/products` | Catalog | Functional | — | FUNCTIONAL BUT SHALLOW | OK | — | P3 |
| `/dashboard/menu-planner` | Planning | Functional | Meal-prep centric | NEEDS UX POLISH | Mode-gated OK | Business-mode hints | P2 |
| `/dashboard/brands` | Brands | Functional | — | FUNCTIONAL BUT SHALLOW | OK | Multi-brand filters in hubs | P2 |
| `/dashboard/production` | Production | Functional | Order ↔ production linkage varies | NEEDS WORKFLOW CONNECTION | OK | Single lifecycle CTA source | P1 |
| `/dashboard/kitchen` | Kitchen screen | Functional | Hardware “live” only if implemented | PLACEHOLDER FEEL *if claimed* | OK if honest | Never claim hardware without integration | P0 |
| `/dashboard/packing` | Packing | Functional | — | NEEDS WORKFLOW CONNECTION | OK | Packing completeness in lifecycle | P1 |
| `/dashboard/packing/verify` | Verification | Functional | — | FUNCTIONAL BUT SHALLOW | OK | — | P2 |
| `/dashboard/nutrition-labels` | Labels | Functional | — | FUNCTIONAL BUT SHALLOW | Meal prep | — | P3 |
| `/dashboard/storefront` | Storefront builder | Functional | Depends on Stripe/env | NEEDS WORKFLOW CONNECTION | OK | Clear non-fake payment copy | P1 |
| `/dashboard/sales-channels` | Channels | Functional | Placeholders for some providers | PLACEHOLDER FEEL | OK if labeled “connect” | No fake “live” badges | P0 |
| `/dashboard/integrations/webhooks` | Workspace webhooks | Functional | — | FUNCTIONAL BUT SHALLOW | OK | Link to error recovery | P2 |
| `/dashboard/integration-health` | **Redirect** → `/dashboard/sales-channels/health` | Bookmark-safe | READY | OK | — | P2 |
| `/dashboard/inventory/demand` | Demand | Functional | — | FUNCTIONAL BUT SHALLOW | OK | — | P2 |
| `/dashboard/purchasing` | Purchasing | Functional | — | FUNCTIONAL BUT SHALLOW | OK | — | P3 |
| `/dashboard/costing` | Costing | Functional | — | FUNCTIONAL BUT SHALLOW | OK | — | P3 |
| `/dashboard/routes` | Routing | Functional | — | NEEDS WORKFLOW CONNECTION | OK | Route blocker in lifecycle | P1 |
| `/dashboard/tasks` | Tasks | Functional | — | FUNCTIONAL BUT SHALLOW | OK | Today picks up tasks | P2 |
| `/dashboard/locations` | Locations | Functional | — | FUNCTIONAL BUT SHALLOW | OK | — | P3 |
| `/dashboard/customer-crm` | **Canonical:** `/dashboard/customers` and `/dashboard/crm/*` | CRM exists under alternate paths | Taxonomy mismatch | NEEDS UX POLISH | Fix IA | Redirect or nav label sync | P1 |
| `/dashboard/meal-plans` | Meal plans | Functional | Meal-prep centric | FUNCTIONAL BUT SHALLOW | Mode OK | Don’t force for non–meal-prep | P2 |
| `/dashboard/catering-quotes` | Catering | Functional | — | NEEDS WORKFLOW CONNECTION | OK | Quote → order lifecycle | P1 |
| `/dashboard/analytics` | Analytics | Functional | Depth varies | FUNCTIONAL BUT SHALLOW | OK | — | P2 |
| `/dashboard/forecast` | Forecast | Functional | — | FUNCTIONAL BUT SHALLOW | OK | — | P3 |
| `/dashboard/reports` | Reports | Functional | — | FUNCTIONAL BUT SHALLOW | OK | — | P3 |
| `/dashboard/executive` | Exec KPIs | Functional | — | FUNCTIONAL BUT SHALLOW | OK | — | P3 |
| `/dashboard/ai` | **Canonical:** `/dashboard/copilot` | AI copilot | Naming drift | NEEDS UX POLISH | OK | Nav alias “AI” → copilot | P2 |
| `/dashboard/staff` | Staff | Functional | RBAC must stay server-side | SECURITY RISK *if only UI* | Verify | Server guards on sensitive actions | P0 |
| `/dashboard/billing` | Billing | Stripe-backed | Never expose secrets | SECURITY RISK *if leaked* | OK | Env + webhook health | P1 |
| `/dashboard/notifications` | Notifications | Functional | Safe disabled state | FUNCTIONAL BUT SHALLOW | OK | — | P2 |
| `/dashboard/notifications/rules` | Rules | Functional | — | FUNCTIONAL BUT SHALLOW | OK | — | P3 |
| `/dashboard/error-recovery` | Recovery | Functional | Tie to integrity | NEEDS WORKFLOW CONNECTION | OK | Retry actions audited | P1 |
| `/dashboard/system-health/data-integrity` | Integrity | Counts + flags | Expand rules over time | FUNCTIONAL BUT SHALLOW | OK | POS txn/receipt rules in sync with order blockers | P1 |
| `/dashboard/settings` | Control center | Multi-section | Spec wants more IA buckets | NEEDS UX POLISH | OK | Group POS / ops / security | P2 |
| `/dashboard/audit-logs` | Audit | Functional | Permission-gated reads | SECURITY RISK *if mis-gated* | Verify | Redaction on platform | P0 |
| `/dashboard/support` | Support inbox | Functional | Full SLA automation partial | FUNCTIONAL BUT SHALLOW | OK | Status model vs platform | P2 |

---

## Internal platform (`/platform/*`)

**Rule:** Client workspace users must **never** access `/platform` without a **platform role** (separate from workspace roles). `workspace.moroz@gmail.com` remains **PLATFORM_FOUNDER** in seed/policy.

| Route | Purpose | Tag | Pri |
|-------|---------|-----|-----|
| `/platform/dashboard` | Platform KPIs | FUNCTIONAL BUT SHALLOW | P1 |
| `/platform/workspaces` | Tenant admin | NEEDS UX POLISH | P1 |
| `/platform/workspaces/[workspaceId]` | Tenant drill-down (incl. POS diagnostics) | FUNCTIONAL BUT SHALLOW | P1 |
| `/platform/users` | User admin | FUNCTIONAL BUT SHALLOW | P2 |
| `/platform/organizations` | Orgs | FUNCTIONAL BUT SHALLOW | P2 |
| `/platform/support` | Support queue | NEEDS WORKFLOW CONNECTION | P1 |
| `/platform/integrations` | Integrations | FUNCTIONAL BUT SHALLOW | P1 |
| `/platform/webhooks` | Webhooks | FUNCTIONAL BUT SHALLOW | P1 |
| `/platform/automations` | Automations | PLACEHOLDER FEEL / partial | P2 |
| `/platform/audit` | Audit | NEEDS UX POLISH | P1 |
| `/platform/tools` | Internal tools | SECURITY RISK *if mis-gated* | P0 |

---

## Public website

| Route | Purpose | Tag | Pri |
|-------|---------|-----|-----|
| `/` | Marketing home | NEEDS UX POLISH (ongoing) | P1 |
| `/solutions` | Solutions hub | Verify all segment routes exist | P1 |
| `/product` | Product | FUNCTIONAL BUT SHALLOW | P2 |
| `/pricing` | Pricing | READY | P2 |
| `/demo` | Demo | NEEDS WORKFLOW CONNECTION | P1 |
| `/beta` | Beta | FUNCTIONAL BUT SHALLOW | P2 |
| `/book-demo` | CTA | READY | P2 |
| `/contact-sales` | CTA | READY | P2 |
| `/trust` | Trust | FUNCTIONAL BUT SHALLOW | P2 |
| `/integrations` | Integrations story | **No fake “live”** | P0 |
| `/resources` | Content | FUNCTIONAL BUT SHALLOW | P3 |
| `/partners` | Partners | FUNCTIONAL BUT SHALLOW | P3 |

Deep product routes under `/product/*` and `/solutions/*` — **spot-check** in CI that new marketing pages compile; many are static MDX/TSX and are **FUNCTIONAL BUT SHALLOW** until paired with in-app screenshots.

---

## P0 / P1 execution order (from this audit)

1. **P0:** No fake payments/integrations; `/platform` server enforcement; audit redaction; secret hygiene.  
2. **P1:** Single **order lifecycle** narrative (blockers → Today → Order Hub → Order detail); **POS** reconciliation signals; **nav canonical paths** (integration health, AI, CRM).  
3. **P2:** Settings IA, polish, analytics depth.

---

## Related engineering docs

- `docs/ORDER_LIFECYCLE_ENGINE_FINAL.md` — types, guards, transitions, services.  
- `docs/OS Kitchen_COMMERCIAL_MVP_COMPLETION_REPORT.md` — completion snapshot.  
- `docs/OS Kitchen_FINAL_QA_MATRIX.md` — persona × workflow tests.
