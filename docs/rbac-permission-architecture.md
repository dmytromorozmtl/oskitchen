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
- `storefront-admin-page-access.tsx` mirrors server checks on catalog, team (+ audit), markets, theme, settings (+ experiments, advanced, fulfillment, discounts, ordering, seo, marketing, gift-cards, pickup-windows, cart-recovery, redirects, schedule, analytics, reviews, loyalty, inventory), and workspace admin pages; `actions/storefront/pickup-windows.ts` requires `storefront.settings` on mutations

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
- Status update: POS, KDS (`kitchen.view` / `kitchen.bump` / `kitchen.recall` on daily KDS actions; `kitchen.bump` / `kitchen.expo.manage` on production work-item transitions from kitchen screen; `kitchen.configure` for station/mode UI), billing, integrations, export routes, storefront publish/media/manage plus domains/settings/forms pages and mutations; programmatic publish API routes enforce `storefront.publish`; runtime platform superadmin bypass requires `SUPER_ADMIN` role row; manual order creation uses `orders.manage`; commissary transfers use `production.manage`; notification rule toggle/seed use `workspace.settings`; **notifications center mutations** (`actions/notifications-center.ts`) require `workspace.settings` with settings denial audits (`tests/unit/notifications-center-rbac.test.ts`); **channel certification mutations** (`actions/channel-certification.ts`) require `integrations.manage` via `requireIntegrationsActor` — owner profile role alone is insufficient (`tests/unit/channel-certification-rbac.test.ts`); **customer success mutations** (`actions/customer-success.ts`) require `growth.manage` via `authorizeGrowth` — owner profile role alone is insufficient (`tests/unit/customer-success-rbac.test.ts`); **customer success CSV export** (`app/api/growth/customer-success/export/route.ts`) requires `growth.manage` via `requireGrowthApiAccess` — `growth.view` alone is insufficient (`tests/unit/customer-success-export-rbac.test.ts`); monetization API keys use `integrations.manage`; branding save uses `workspace.settings`; settings-center save mutations use `requireSettingsCenterMutation` with capability→permission map and denial audits; **email bypass closure certified** — `tests/unit/platform-email-bypass-closure.test.ts` guards against runtime bootstrap-email authorization in `app/` / `actions/` / `lib/`; bootstrap email seeds `SUPER_ADMIN` via `ensurePlatformOwnerBootstrap` only; **dashboard superadmin UI parity** — billing badge, branding settings page gate + Enterprise hide checkbox, and training badge use `actor.platformBypass` from persisted `SUPER_ADMIN` role row — bootstrap email alone is insufficient; no runtime `isSuperAdminEmail` in `app/` or `actions/`; **notifications permission bridge** (`isSuperAdminNotifications`, `canUseNotifications`) uses `platformBypass` from persisted `SUPER_ADMIN` role row via `getNotificationActorScope` — bootstrap email alone is insufficient (`tests/unit/notifications-platform-bypass.test.ts`); **costing mutations** (`actions/costing.ts`) use `reports.read.financial` for margin/fee/scenario/recalculate paths and `workspace.settings` for costing settings with `costing.permission_denied` audits (`tests/unit/costing-actions-rbac.test.ts`); **purchasing PO approval** (`actions/purchasing.ts`) uses `production.manage` for submit and `reports.read.financial` for approve/reject with `purchasing.permission_denied` audits (`tests/unit/purchasing-actions-rbac.test.ts`); **purchasing bulk pricing** (`actions/purchasing/bulk-price.ts`) uses `reports.read.financial` for bulk update/undo with the same denial audit pattern (`tests/unit/purchasing-bulk-price-rbac.test.ts`); **export audit_logs** (`app/api/export/route.ts`) requires persisted `SUPER_ADMIN` role row plus `audit.export` via `requireExportActor` — bootstrap email alone is insufficient (`tests/unit/export-route-audit-rbac.test.ts`); export hub UI (`app/dashboard/import-export/export/page.tsx`) mirrors the same gate via `resolveVisibleExportTypes` (`tests/unit/export-page-access.test.ts`); **DSR manual export** (`app/api/internal/dsr/export/route.ts`) requires persisted `SUPER_ADMIN` role row plus MFA — bootstrap email alone is insufficient (`tests/unit/dsr-export-route-rbac.test.ts`); **incident manager UI gates** (`canManageCronIncidentsForUser`, `canManageProductionIncidentsForUser`) require persisted platform role rows — bootstrap email alone is insufficient (`tests/unit/incident-manager-platform-access.test.ts`); **growth/import legacy permission bridges** (`canUseGrowth`, `canUseImportCenter`) use `platformBypass` from persisted `SUPER_ADMIN` role row — bootstrap email alone is insufficient (`tests/unit/growth-import-platform-bypass.test.ts`); **playbooks/templates permission bridges** (`canUsePlaybooks`, `canUseTemplates`) use the same `platformBypass` pattern (`tests/unit/playbooks-templates-platform-bypass.test.ts`); **settings/audit permission bridges** (`canUseSettings`, `canAccessSettingsSection`, audit viewer helpers) require `platformBypass` from SUPER_ADMIN role row (`tests/unit/settings-audit-platform-bypass.test.ts`); **reports/executive permission bridges** (`isSuperAdminReports`, `isSuperAdminExecutive`) use `platformBypass` from persisted `SUPER_ADMIN` role row via `createReportActorScope` / `createExecutiveActorScope` — bootstrap email alone is insufficient (`tests/unit/reports-executive-platform-bypass.test.ts`); **staff/training permission bridges** (`isSuperAdminStaff`, `isSuperAdminTraining`) use `platformBypass` from persisted `SUPER_ADMIN` role row via `resolveStaffActorScope` / `resolveTrainingActorScope` — bootstrap email alone is insufficient (`tests/unit/staff-training-platform-bypass.test.ts`); **go-live permission bridge** (`isSuperAdminGoLive`) uses `platformBypass` from persisted `SUPER_ADMIN` role row via `resolveGoLiveActorScope` — bootstrap email alone is insufficient; go-live project unlock UI no longer bypasses `go-live.unlock` via founder email (`tests/unit/go-live-platform-bypass.test.ts`); **channels permission bridge** (`canManageChannelOperations`, `canManageChannelCredentials`, `bypassesPlanGates`) uses `platformBypass` from persisted `SUPER_ADMIN` role row — bootstrap email alone is insufficient (`tests/unit/channels-platform-bypass.test.ts`); **product-mapping permission bridge** (`isSuperAdminMapping`) uses `platformBypass` from persisted `SUPER_ADMIN` role row via `createProductMappingActorScope` — bootstrap email alone is insufficient (`tests/unit/product-mapping-platform-bypass.test.ts`); **storefront legacy permission bridge** (`canStorefront`) uses `platformBypass` from persisted `SUPER_ADMIN` role row via `legacyStorefrontAllowsForActor` / storefront page access — bootstrap email alone is insufficient (`tests/unit/storefront-platform-bypass.test.ts`); **forecast permission bridge** (`isSuperAdminForecast`) uses `platformBypass` from persisted `SUPER_ADMIN` role row via `resolveForecastActorScope` — bootstrap email alone is insufficient (`tests/unit/forecast-platform-bypass.test.ts`); **copilot permission bridge** (`isSuperAdminCopilot`) uses `platformBypass` from persisted `SUPER_ADMIN` role row via `createCopilotActorScope` — bootstrap email alone is insufficient (`tests/unit/copilot-platform-bypass.test.ts`); **implementation permission bridge** (`isSuperAdminImplementation`) uses `platformBypass` from persisted `SUPER_ADMIN` role row via `createImplementationActorScope` — bootstrap email alone is insufficient (`tests/unit/implementation-platform-bypass.test.ts`); **tasks permission bridge** (`actorIsSuperAdmin`) uses `platformBypass` from persisted `SUPER_ADMIN` role row via `resolveTaskActorScope` — bootstrap email alone is insufficient; tasks settings page displays override from `actor.platformBypass` (`tests/unit/tasks-platform-bypass.test.ts`); **brands permission bridge** (`canViewAllBrands`, `canManageBrands`, `canManageSingleBrand`) uses `platformBypass` from persisted `SUPER_ADMIN` role row via `resolveBrandActorScope` — bootstrap email alone is insufficient (`tests/unit/brands-platform-bypass.test.ts`); **locations permission bridge** (`isSuperAdmin`, `canDoLocation`, `visibleLocationIds`) uses `platformBypass` from persisted `SUPER_ADMIN` role row via `resolveLocationActorScope` — bootstrap email alone is insufficient; locations settings page displays override from `actor.platformBypass` (`tests/unit/locations-platform-bypass.test.ts`); **crm permission bridge** (`isSuperAdmin`, `canDoCrm`) uses `platformBypass` from persisted `SUPER_ADMIN` role row via `resolveCrmActorScope` — bootstrap email alone is insufficient (`tests/unit/crm-platform-bypass.test.ts`); **meal plan permission bridge** (`isSuperAdmin`, `canDoMealPlan`) uses `platformBypass` from persisted `SUPER_ADMIN` role row via `resolveMealPlanActorScope` — bootstrap email alone is insufficient (`tests/unit/meal-plans-platform-bypass.test.ts`); **catering quote permission bridge** (`isSuperAdminCatering`, `canDoCateringQuote`) uses `platformBypass` from persisted `SUPER_ADMIN` role row via `resolveCateringQuoteActorScope` — bootstrap email alone is insufficient (`tests/unit/catering-platform-bypass.test.ts`); **packing verification supervisor override** (`canSupervisorOverride`) uses `platformBypass` from persisted `SUPER_ADMIN` role row via `requireWorkspacePermissionActor` in `supervisorOverrideVerificationAction` — bootstrap email alone is insufficient (`tests/unit/packing-verification-platform-bypass.test.ts`); **analytics permission bridge** (`isSuperAdminAnalytics`, `canDoAnalytics`) uses `platformBypass` from persisted `SUPER_ADMIN` role row via `resolveAnalyticsActorScope` — bootstrap email alone is insufficient (`tests/unit/analytics-platform-bypass.test.ts`); **platform support session** (`isWorkspaceOwnerSuperAdminProtected`, `startPlatformSupportSession` founder guard) requires persisted `SUPER_ADMIN` role row for protected workspaces — bootstrap email alone is insufficient (`tests/unit/platform-support-session-bypass.test.ts`); **platform guards** (`requirePlatformAccess` → `isFounder`) derives founder-only nav from persisted `SUPER_ADMIN` role row — bootstrap email alone is insufficient (`tests/unit/platform-guards-bypass.test.ts`); **platform impersonation target protection** (`isTargetSuperAdminProtected`) requires persisted `SUPER_ADMIN` role row — bootstrap email alone is insufficient (`tests/unit/platform-target-protection-bypass.test.ts`); draft-editor row loads use `requireManageStorefrontRow` and `getManageStorefrontForSession` (canonical `storefront.manage` without requiring the settings admin tab) (including blackout dates, Stripe Connect onboarding, reservation admin, product public fields, page-publish webhook redelivery, and multi-store cookie/primary-store actions), storefront hub `storefront.read` layout gate (`requireStorefrontReadPage`) with per-href subnav filtering via `resolveStorefrontSubnavVisibleHrefs` (read/manage/media/admin tab permissions), report read/saved-report/generator pages, and channel-command-center mutations are on canonical keys with denial audits; `/dashboard/reports/[reportKey]` gates via `lib/reports/require-report-generator-page.ts` (wraps `requireReportReadActor`; UI deny via `reportPermissionDeniedCard`) before report queries; billing checkout/portal API routes and dashboard billing layout use `requireBillingActor` / `requireBillingApiAccess` / `requireBillingPageAccess` with capability-aware subnav; entitlement overrides and cancellation feedback use the same actor helper; storefront draft edits use `requireStorefrontManageActor` with legacy `storefront:edit-draft` bridge; channel command actions use `requireChannelManageActor` (`integrations.manage`); manage-only sales-channel and storefront editor pages are URL-guarded; labor schedule/time-clock mutations use `schedule.manage` / `timeclock.manage` with UI parity on staff schedule and time-clock pages; staff CRUD/quick-create uses `staff.manage` on `actions/staff.ts` and `actions/staff-member.ts` with `staff.permission_denied` audits; training mutations use `training.manage` / `training.participate` on `actions/training.ts` with UI alignment on programs/SOPs/certs/simulations pages; go-live mutations use `go-live.manage` / `go-live.unlock` on `actions/go-live.ts` with `resolveGoLiveActorScope` (no hardcoded `isOwner`), `go-live.permission_denied` audits, and UI gates via `getGoLivePageAccess` on command center + project workbench; executive dashboard uses `createExecutiveActorScope` + `requireExecutivePageAccess` / `getExecutivePageAccess` with `executive.permission_denied` audits on `actions/executive.ts` and permission-filtered subnav; playbooks use `createPlaybookActorScope` + `authorize` gates on `actions/playbooks.ts` with `playbooks.permission_denied` audits and `requirePlaybooksPageAccess` on command center pages; workspace templates use `createTemplateActorScope` + `authorize` on `actions/templates.ts` with `templates.permission_denied` audits and `requireTemplatesPageAccess` on template hub pages; product mapping workbench uses `createProductMappingActorScope` + `authorize` on `actions/product-mapping.ts` with `requireProductMappingPageAccess` on workbench pages; growth hub uses `createGrowthActorScope` + `authorizeGrowth` / `requireGrowthPageAccess` on `actions/growth.ts`, layout, and `/api/growth/*/export` with `growth.permission_denied` audits and legacy `canAccessGrowthModule` bridge for platform GTM roles

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
- Import / Export Center ingredient CSV preview/upload uses `products.edit` via `requireImportActor` (`lib/import-export/require-import-actor.ts`); denials audit as `IMPORT_PERMISSION_DENIED`; hub pages filter subnav via `getImportExportPageAccess`
- Import Center (`/dashboard/import-center`) uses canonical domain permissions via `workspace-import-permission.ts` / `requireImportCenterActor` / `requireImportCenterHubPageAccess`: hub view when the actor has any of `products.edit`, `production.manage`, `customers.manage`, `orders.manage`, `staff.manage`, or `workspace.settings`; upload is type-scoped (e.g. `CUSTOMERS` → `customers.manage`); commit requires `workspace.settings` plus type upload permission; rollback requires `workspace.settings`; cancel is type-scoped via `requireImportCenterJobCancel`; job detail UI gates commit/rollback/cancel via `resolveImportCenterJobPermissions`; template and errors CSV API routes enforce hub view; denials audit as `IMPORT_PERMISSION_DENIED` with `domain: import_center`
- Workspace gift cards and loyalty program mutations use canonical `giftcards.manage` / `loyalty.manage` via `requireRewardsMutation`; dashboard pages gate issue/edit UI; POS balance lookups allow `pos.checkout` or the respective manage permission (`lib/crm/require-rewards-mutation.ts`); storefront promo codes (`/dashboard/storefront/discounts`, `actions/storefront-discounts.ts`) use `storefront.manage` via `requireStorefrontManagePage` / `requireManageStorefrontRow` (not `storefront.settings`); storefront gift cards and loyalty admin share `requireStorefrontRewardsPageAccess` / `canAccessStorefrontRewardsTab` in `lib/storefront/storefront-rewards-page-access.ts` and `storefront-rewards-permission.ts` (`giftcards.manage` / `loyalty.manage` with storefront resolution; subnav uses unified `rewards` gate; not `storefront.settings`)
- CRM hub pages use `customers.read` for view surfaces and `customers.manage` for mutations (`requireCustomersHubPageAccess`, `requireCrmMutation` with `crm.permission_denied` audits); subnav hides manage-only links such as dedupe when the actor lacks `customers.manage`

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
