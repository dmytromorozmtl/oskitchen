# KitchenOS RBAC And Permission Architecture

Status: target canonical authorization model for phased implementation
Primary evidence for current state: `lib/permissions/permissions.ts`, `lib/permissions/mutation-access.ts`, `lib/permissions/resolve-ui-permissions.ts`, `lib/scope/require-tenant-actor.ts`, `actions/pos.ts`, `actions/integrations.ts`, `actions/customers.ts`, `actions/billing.ts`, `app/api/pos/terminal/route.ts`

## 1. Problem Statement
KitchenOS already has:
- tenant/session resolution via `requireTenantActor()`
- a small central permission registry in `lib/permissions/permissions.ts`
- legacy fallback logic in `lib/permissions/mutation-access.ts`
- multiple domain-specific capability helpers in staff, training, billing, and CRM flows

What it does not yet have is a single canonical capability system that covers the breadth of the platform and drives both server authorization and UI gating. This document defines that target model.

## 2. Design Principles
- Server-side permission checks are the source of truth.
- UI gating mirrors server truth; it never replaces it.
- Tenant and workspace scope are separate from capabilities. First resolve actor and scope, then resolve capabilities.
- Sensitive denials should be auditable.
- Legacy role fallbacks remain only during migration.
- No hardcoded email allowlists.
- No duplication of permission logic across route families.

## 3. Canonical Roles
### Workspace roles
- Owner
- Admin
- General Manager
- Shift Manager
- Cashier
- Server
- Bartender
- Kitchen Staff
- Driver
- Marketing Manager
- Accountant
- Read-only Auditor
- API Client

### Platform roles
- Support Admin
- Platform Admin
- Implementation Admin

Notes:
- `Owner` and `Admin` are workspace administrative roles.
- `Support Admin`, `Platform Admin`, and `Implementation Admin` are platform/internal roles and must never be inferred from tenant roles.
- `API Client` is a non-interactive principal for public API credentials.

## 4. Canonical Permission Keys
### Orders
- `orders.read`
- `orders.create`
- `orders.update`
- `orders.cancel`
- `orders.refund`
- `orders.export`
- `orders.assign`
- `orders.override`

### POS
- `pos.access`
- `pos.checkout`
- `pos.discount.apply`
- `pos.refund`
- `pos.void`
- `pos.cash.drawer.open`
- `pos.shift.open`
- `pos.shift.close`
- `pos.register.manage`
- `pos.hardware.manage`
- `pos.offline.replay`
- `pos.manager.override`

### Tables
- `tables.read`
- `tables.manage`
- `tables.transfer`
- `tables.merge`
- `checks.split`
- `checks.close`
- `checks.reopen`

### KDS
- `kitchen.view`
- `kitchen.bump`
- `kitchen.recall`
- `kitchen.configure`
- `kitchen.expo.manage`

### Storefront
- `storefront.read`
- `storefront.manage`
- `storefront.publish`
- `storefront.theme.manage`
- `storefront.domain.manage`
- `storefront.forms.manage`
- `storefront.media.manage`

### Menu / Product
- `menus.read`
- `menus.manage`
- `products.read`
- `products.manage`
- `modifiers.manage`
- `pricing.manage`

### Customers / CRM
- `customers.read`
- `customers.manage`
- `customers.export`
- `loyalty.manage`
- `giftcards.manage`
- `campaigns.manage`

### Inventory
- `inventory.read`
- `inventory.manage`
- `inventory.count`
- `inventory.adjust`
- `purchasing.manage`
- `vendors.manage`
- `recipes.manage`
- `costing.manage`

### Staff
- `staff.read`
- `staff.manage`
- `schedule.manage`
- `timeclock.manage`
- `payroll.export`

### Go-live / launch readiness
- `go-live.manage` — create projects, checklist, simulations, approvals, launch transitions, incidents, rollback plans
- `go-live.unlock` — override critical launch blockers (OWNER / admin profile role only via `go-live-permissions` GRANTS)

### Executive command center
- Reuses `reports.read.*` and `reports.export` for view/export surfaces via `executive-permission-keys.ts`
- `executive.insights.manage` — resolve/dismiss executive insights (`actions/executive.ts`)

### Playbooks
- `playbooks.participate` — view playbooks, start runs, complete steps
- `playbooks.manage` — create/edit/archive playbooks, generate tasks
- `playbooks.read.reports` maps to `reports.read.operations` via `playbook-permission-keys.ts`

### Workspace templates
- `templates.participate` — view templates, preview changes, view application history
- `templates.manage` — apply or roll back workspace quick-start templates (`actions/templates.ts`)

### Product mapping workbench
- Maps `mapping.*` capabilities to `integrations.read` (view/audit) and `integrations.manage` (mutations) via `mapping-permission-keys.ts`
- `actions/product-mapping.ts` uses `authorize()` + `product_mapping.permission_denied` audits

### Storefront admin tabs (catalog, team, settings)
- Maps `storefront.*` admin tab keys to `storefront.read` (`storefront.orders`) or `storefront.manage` (settings, catalog, markets, theme, team) via `storefront-admin-permission-keys.ts`
- `requireStorefrontAdminPermission` enforces canonical keys (legacy `storefront:view` / `storefront:edit-draft` bridge) before `staffAccess` JSON tab grants
- `storefront-admin-page-access.tsx` mirrors server checks on catalog, team (+ audit), markets, and theme admin pages

### Reports
- `reports.view`
- `reports.export`
- `analytics.view`
- `financials.view`

### Integrations
- `integrations.read`
- `integrations.manage`
- `webhooks.manage`
- `api_keys.manage`

### Billing
- `billing.view`
- `billing.manage`

### Settings
- `settings.view`
- `settings.manage`
- `security.manage`
- `workspace.manage`
- `locations.manage`
- `brands.manage`

### Platform
- `platform.view`
- `platform.manage`
- `support.impersonate`
- `audit.view`
- `audit.export`

## 5. Role Preset Map
This is the target starter matrix. Custom roles can subtract or add from these presets later.

| Role | Baseline permissions |
| --- | --- |
| Owner | all workspace permissions except platform-only permissions |
| Admin | most workspace permissions including billing/manage, integrations/manage, settings/manage |
| General Manager | orders, POS, tables, kitchen, staff read/manage, reports/analytics, storefront read/manage |
| Shift Manager | orders update/cancel/assign, POS checkout/refund/void, shifts, kitchen, tables, reports view |
| Cashier | orders read/create/update, pos access/checkout, shift open/close, customers read, giftcards manage |
| Server | orders read/create/update, tables read/manage/transfer, checks split/close, pos access/checkout |
| Bartender | server baseline plus bar/POS override for tab-heavy flows, no billing/settings |
| Kitchen Staff | kitchen view/bump/recall, orders read, limited production/inventory read |
| Driver | orders read/update assigned orders, limited customer/location access, route-specific future permissions |
| Marketing Manager | customers read/manage, campaigns manage, loyalty manage, giftcards manage, analytics view |
| Accountant | financials view, reports export, payroll export, billing view, purchasing read/manage where needed |
| Support Admin | platform view, audit view, support tools, no tenant mutation without explicit impersonation path |
| Platform Admin | full platform permissions, support impersonate, audit export |
| Implementation Admin | workspace/bootstrap/settings/integrations/storefront setup, limited financial mutability |
| Read-only Auditor | workspace/platform read + audit view/export, no mutations |
| API Client | scoped machine permissions such as orders.create, orders.read, products.read, customers.read depending on key |

## 6. Data Model Target
The canonical implementation should support:
- `PermissionKey` registry in code
- workspace role presets in code
- optional custom role rows in data
- per-staff assigned role or custom role
- API keys mapped to explicit scopes/permissions

Recommended phased model:
1. code-first registry and presets
2. adapter from legacy roles and existing custom role JSON
3. eventual normalized role + role_permission + actor_role tables if operationally justified

This avoids a risky auth rewrite while creating one enforcement language first.

## 7. Enforcement Helpers
### `assertPermission(permissionKey)`
Behavior:
- resolve actor via workspace/platform context
- resolve granted permissions from role preset plus custom grants
- throw or return a typed denial when missing
- attach scope info for downstream services

### `withMutationPermission(permissionKey, handler)`
Use for server actions and mutations:
- resolve actor
- assert permission
- execute handler
- on denial, write audit event where appropriate

### `withRoutePermission(permissionKey, handler)`
Use for API routes:
- resolve route actor (session, API key, platform actor, or machine principal)
- assert permission before handler body
- standardize denial JSON and audit metadata

### `requireWorkspacePermissionActor()`
Current helper remains useful as the scope resolver feeding the new capability system. Evidence: `lib/permissions/resolve-ui-permissions.ts`, `lib/permissions/mutation-access.ts`.

## 8. Permission Denial Audit Logs
Denial events should be logged for:
- refund, void, billing, impersonation, export, integrations credential save, storefront publish, upload/media mutations, role changes

Suggested metadata:
- attempted permission key
- actor id and resolved role
- workspace id
- entity type/id if available
- source route or action name
- denial reason category (`missing_permission`, `scope_denied`, `platform_only`)

Sensitive denials should mask PII just like successful audit events.

## 9. Sensitive Mutation Scanner
Create a scanner/test that flags:
- server actions under `actions/` that mutate state but do not call a canonical mutation helper
- API routes under `app/api/` that mutate state but do not use route guard + permission helper
- exports and upload actions missing permission keys

Initial scope:
- POS
- orders
- billing
- settings
- integrations
- storefront publishing
- uploads/media
- exports

## 10. Migration Plan
### Phase 1: Registry
- add full permission registry and role presets
- add mapping from current roles/legacy permissions to the new keys
- keep legacy fallback inside the adapter only

### Phase 2: High-risk mutations
- migrate `actions/pos.ts`
- migrate `actions/pos/tabs.ts`
- migrate `app/api/pos/terminal/route.ts`
- migrate `actions/billing.ts`
- migrate `actions/integrations.ts`
- migrate storefront publish/media/forms/domain actions
- migrate upload and export actions
- Status update: POS, KDS (`kitchen.view` / `kitchen.bump` / `kitchen.recall` on daily KDS actions; `kitchen.bump` / `kitchen.expo.manage` on production work-item transitions from kitchen screen; `kitchen.configure` for station/mode UI), billing, integrations, export routes, storefront publish/media/manage plus domains/settings/forms pages and mutations, storefront hub `storefront.read` layout gate (`requireStorefrontReadPage`) with manage-only subnav filtering, report read/saved-report/generator pages, and channel-command-center mutations are on canonical keys with denial audits; `/dashboard/reports/[reportKey]` gates via `lib/reports/require-report-generator-page.ts` (wraps `requireReportReadActor`; UI deny via `reportPermissionDeniedCard`) before report queries; billing checkout/portal API routes and dashboard billing layout use `requireBillingActor` / `requireBillingApiAccess` / `requireBillingPageAccess` with capability-aware subnav; entitlement overrides and cancellation feedback use the same actor helper; storefront draft edits use `requireStorefrontManageActor` with legacy `storefront:edit-draft` bridge; channel command actions use `requireChannelManageActor` (`integrations.manage`); manage-only sales-channel and storefront editor pages are URL-guarded; labor schedule/time-clock mutations use `schedule.manage` / `timeclock.manage` with UI parity on staff schedule and time-clock pages; staff CRUD/quick-create uses `staff.manage` on `actions/staff.ts` and `actions/staff-member.ts` with `staff.permission_denied` audits; training mutations use `training.manage` / `training.participate` on `actions/training.ts` with UI alignment on programs/SOPs/certs/simulations pages; go-live mutations use `go-live.manage` / `go-live.unlock` on `actions/go-live.ts` with `resolveGoLiveActorScope` (no hardcoded `isOwner`), `go-live.permission_denied` audits, and UI gates via `getGoLivePageAccess` on command center + project workbench; executive dashboard uses `createExecutiveActorScope` + `requireExecutivePageAccess` / `getExecutivePageAccess` with `executive.permission_denied` audits on `actions/executive.ts` and permission-filtered subnav; playbooks use `createPlaybookActorScope` + `authorize` gates on `actions/playbooks.ts` with `playbooks.permission_denied` audits and `requirePlaybooksPageAccess` on command center pages; workspace templates use `createTemplateActorScope` + `authorize` on `actions/templates.ts` with `templates.permission_denied` audits and `requireTemplatesPageAccess` on template hub pages; product mapping workbench uses `createProductMappingActorScope` + `authorize` on `actions/product-mapping.ts` with `requireProductMappingPageAccess` on workbench pages

### Phase 3: UI parity
- replace scattered UI gates with permission-derived navigation and component gates
- keep plan/module gates separate from role permissions
- Status update: the first POS UI parity slice is now live for the POS layout shell, filtered sub-navigation, registers, shifts, handheld, tabs, receipts, transactions, reports, and POS hardware/settings entry pages, and the focused POS RBAC suite now exercises deny/allow parity on the handheld, tabs, transactions, receipts, reports, and hardware/settings page surfaces instead of relying only on runtime guards

### Phase 4: Broader domains
- staff/training/labor
- inventory/costing/purchasing
- analytics/reports
- platform support/admin tools

## 11. Current-State Mapping
The following current files should be treated as migration inputs, not long-term authorization endpoints:
- `lib/permissions/permissions.ts`
- `lib/permissions/mutation-access.ts`
- `lib/permissions/legacy.ts`
- `lib/staff/staff-permissions.ts`
- `lib/training/training-permissions.ts`
- `lib/billing/billing-permissions.ts`
- `lib/billing/require-billing-actor.ts`
- `lib/billing/require-billing-api-access.ts`
- `lib/billing/billing-page-access.tsx`
- `lib/crm/require-crm-mutation.ts`

## 12. Initial Target Application By Module
### POS
- `pos.access`
- `pos.checkout`
- `pos.discount.apply`
- `pos.refund`
- `pos.void`
- `pos.shift.open`
- `pos.shift.close`
- `pos.register.manage`
- `pos.hardware.manage`
- `pos.manager.override`

### Orders
- `orders.read`
- `orders.create`
- `orders.update`
- `orders.cancel`
- `orders.refund`
- `orders.assign`
- `orders.export`
- `orders.override`

### Billing
- `billing.view`
- `billing.manage`
- `financials.view`

### Storefront
- `storefront.read`
- `storefront.manage`
- `storefront.publish`
- `storefront.theme.manage`
- `storefront.domain.manage`
- `storefront.forms.manage`
- `storefront.media.manage`

### Integrations
- `integrations.read`
- `integrations.manage`
- `webhooks.manage`
- `api_keys.manage`

### Uploads / Exports
- `storefront.media.manage`
- `reports.export`
- `orders.export`
- `customers.export`
- `audit.export`

## 13. UI Gating Principles
- Navigation visibility is not the same as permission. Nav can hide unavailable modules, but server checks remain mandatory.
- Module flags, plan gates, and permissions all must be represented explicitly:
  - module flag: feature released for this workspace
  - plan gate: feature allowed by subscription
  - permission gate: actor allowed to use the feature
- A route should show one of:
  - available
  - permission denied
  - plan upgrade required
  - setup required
  - preview/internal/hidden

## 14. API Client Model
`API Client` should not inherit owner/admin behavior. API keys must be explicit machine principals mapped to scopes. Current public API auth is a good starting point for this separation. Evidence: `lib/api-public/guard.ts`, `app/api/public/v1/orders/route.ts`.

## 15. Acceptance Criteria
- A central permission registry exists and covers the real high-risk module surface.
- Role presets are explicit and documented.
- High-risk mutations use canonical permission helpers.
- UI permission gating mirrors server truth.
- Sensitive denials are auditable.
- A scanner/test catches new sensitive mutations without permission checks.
- Legacy fallbacks are isolated to a migration adapter layer, not spread across product code.

## 16. Required Tests
- Permission-negative tests by role for POS, orders, billing, integrations, storefront publishing, uploads, and exports
- Cross-tenant tests remain mandatory
- API route permission tests for public/session/platform routes
- UI gate snapshot or behavior tests for major role dashboards
- Denial audit tests for the most sensitive actions

## 17. Safest Implementation Start
The first implementation pass after these docs should apply this model to POS mutations and POS route handlers because:
- they are financially sensitive
- they are already partially using the current mutation helper
- they expose the clearest inconsistency in the codebase today
- they provide a reusable pattern for billing, integrations, and storefront publishing next
