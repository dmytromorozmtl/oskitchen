# KitchenOS — Full Functional Audit

**Date:** 20 May 2026  
**Production:** https://os-kitchen.com  
**Tests:** 647 PASS (1 skipped)  
**Methodology:** 10-layer functional catalog (not bug audit)

---

## Executive Summary

| Layer | Count | Notes |
|-------|------:|-------|
| L1 Modules | 23 | 13 Core + 5 Expansion + 5 Tier 1 (26 catalog rows — fulfillment chain split) |
| L2 Pages | 617 | 455 dashboard + 162 public/marketing/auth |
| L3 Components | 654 | 53 categories |
| L4 Server Actions | 634 | 110 files |
| L5 Services | 481 | business logic layer |
| L6 API Routes | 125 | product (+ 121 experimental crons) |
| L7 Prisma | 301 models | 256 enums |
| L8 Lib | 1020 files | shared utilities |
| L9 Infra | 12 crons | vercel.json + production-manifest |
| L10 Connections | 6 matrices | see Layer 10 |

**Route states:** 458 loading · 455 error · global-error: yes
---
## Layer 1: Modules (23)
Source: `docs/PHASE1_AND_TIER1_CLOSURE_19MAY2026.md`, `docs/PHASE1_CLOSURE_19MAY2026.md`
### Module inventory
| Tier | Module | Purpose | Route | Actions | Services | Prisma|
|------|--------|---------|-------|---------|----------|--------|
|Core | **Orders** | Order lifecycle: list, detail, status, production handoff | `/dashboard/orders` | `actions/orders.ts, actions/order-creation.ts` | `services/orders/` | Order, OrderItem|
|Core | **Production** | Kitchen prep queue, work items | `/dashboard/production` | `actions/production.ts` | `services/production/` | ProductionWorkItem|
|Core | **Packing** | Packing lists, labels, scan verify | `/dashboard/packing` | `actions/packing.ts` | `services/packing/` | PackingTask|
|Core | **Routes** | Delivery sequencing, driver handoff | `/dashboard/routes` | `actions/delivery-route.ts` | `services/orders/` | DeliveryRoute|
|Core | **Storefront + Stripe** | Public site, checkout, Stripe Connect | `/dashboard/storefront` | `actions/storefront-*.ts` | `services/storefront/` | Storefront, CheckoutSession|
|Core | **POS Terminal** | Counter sales, quick-order | `/dashboard/pos` | `actions/pos.ts` | `services/pos/` | Order|
|Core | **CRM** | Customers, segments, follow-ups | `/dashboard/customers` | `actions/customers.ts` | `services/` | Customer|
|Core | **Billing** | Stripe subscriptions, entitlements | `/dashboard/billing` | `actions/billing.ts` | `services/billing/` | Subscription|
|Core | **Costing A vs T** | Recipe economics, variance alerts | `/dashboard/costing` | `actions/costing.ts` | `services/costing/` | RecipeCost|
|Core | **PO Approval** | Purchase order workflow | `/dashboard/purchasing` | `actions/purchasing.ts` | `services/purchasing/` | PurchaseOrder|
|Core | **Recipe Scaling** | Batch scaling from recipes | `/dashboard/production` | `actions/scale.ts` | `services/production/` | Recipe|
|Core | **Catering GA** | Quotes, deposits, convert-to-order | `/dashboard/catering-quotes` | `actions/catering-quotes.ts` | `services/catering/` | CateringQuote|
|Core | **Supplier Price Charts** | Supplier price history | `/dashboard/purchasing` | `actions/purchasing.ts` | `services/purchasing/` | SupplierPrice|
|Core | **Integration Health** | Connector health command center | `/dashboard/integration-health` | `actions/integration-health.ts` | `services/integrations/` | IntegrationConnection|
|Core | **Meal Plans Auto-Renew** | Recurring programs + cron | `/dashboard/meal-plans` | `actions/meal-plans.ts` | `services/meal-plans/` | MealPlan|
|Core | **Executive Dashboard** | Multi-brand portfolio rollups | `/dashboard/executive` | `actions/executive.ts` | `services/executive/` | Workspace, Brand|
|Expansion | **Operating Mode** | WEEKLY_PREORDER / DAILY_SERVICE | `/dashboard/settings` | `actions/operating-mode.ts` | `lib/operating-modes/` | KitchenSettings|
|Expansion | **Daily Production View** | Today's queue | `/dashboard/today` | `actions/production-daily-queue.ts` | `services/production/` | Order|
|Expansion | **Quick-Order POS** | Café/bar fast buttons | `/dashboard/pos` | `actions/pos.ts` | `services/pos/` | Order|
|Expansion | **KDS v2** | Kitchen display, bump READY | `/dashboard/kitchen` | `actions/kitchen-daily-kds.ts` | `services/` | Order.status|
|Expansion | **QR Menu Generator** | Table QR → daily menu | `/dashboard/tables` | `actions/restaurant/tables.ts` | `services/restaurant/` | RestaurantTable|
|Tier 1 | **Table Management** | Floor plan, table status | `/dashboard/tables` | `actions/restaurant/tables.ts` | `services/restaurant/` | RestaurantTable|
|Tier 1 | **Tab Management** | Bar/café tabs | `/dashboard/pos/tabs` | `actions/pos/tabs.ts` | `services/pos/` | PosTab, PosTabItem|
|Tier 1 | **Multi-Brand Command Center** | Ghost kitchen cross-brand | `/dashboard/brands/command-center` | `actions/brands.ts` | `services/brand/` | Brand|
|Tier 1 | **Handheld POS** | Tableside ordering | `/dashboard/pos/handheld` | `actions/pos.ts` | `services/pos/` | Order|
|Tier 1 | **Pickup Windows** | Pre-order slots | `/dashboard/storefront/pickup-windows` | `actions/storefront/pickup-windows.ts` | `services/storefront/` | PickupWindow |
### Extended module registry

`lib/modules/module-registry.ts` defines **48 navigable module keys** with path prefixes, plan gates, and business-mode hints.

**Note on module count:** Phase 1 closure documents **23 modules** (Orders→Production→Packing→Routes counts as one core module). This catalog lists **26 rows** by splitting that fulfillment chain into four traceable surfaces and listing QR Menu alongside Table Management on `/dashboard/tables`.

### Sidebar navigation (`lib/navigation/final-navigation-groups.ts`)

| Group | Key routes |
|-------|------------|
| Core | `/dashboard/today`, `/dashboard`, `/dashboard/orders`, `/dashboard/pos`, `/dashboard/pos/tabs`, `/dashboard/pos/handheld` |
| Operations | `/dashboard/tables`, `/dashboard/production`, `/dashboard/kitchen`, `/dashboard/packing`, `/dashboard/routes` |
| Commerce | `/dashboard/storefront`, `/dashboard/storefront/pickup-windows`, `/dashboard/sales-channels` |
| Menus | `/dashboard/menus`, `/dashboard/products`, `/dashboard/brands/command-center` |
| Customers | `/dashboard/customers`, `/dashboard/meal-plans`, `/dashboard/catering-quotes` |
| Inventory & finance | `/dashboard/purchasing`, `/dashboard/costing`, `/dashboard/billing` |
| Insights | `/dashboard/analytics`, `/dashboard/executive`, `/dashboard/copilot` |
| Setup | `/dashboard/implementation`, `/dashboard/training`, `/dashboard/playbooks` |
| Admin | `/dashboard/settings`, `/dashboard/integration-health`, `/dashboard/system-health` |
| Internal | `/dashboard/growth`, `/dashboard/developer` (owner-only) |

---
## Layer 2: Pages
**Total:** 617 pages · **Dashboard:** 455
### Dashboard pages by module

#### `analytics` (13)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/analytics` | ✅ | ✅|
|`/dashboard/analytics/catering` | ✅ | ✅|
|`/dashboard/analytics/channels` | ✅ | ✅|
|`/dashboard/analytics/customers` | ✅ | ✅|
|`/dashboard/analytics/delivery` | ✅ | ✅|
|`/dashboard/analytics/forecasting` | ✅ | ✅|
|`/dashboard/analytics/inventory` | ✅ | ✅|
|`/dashboard/analytics/meal-plans` | ✅ | ✅|
|`/dashboard/analytics/orders` | ✅ | ✅|
|`/dashboard/analytics/production` | ✅ | ✅|
|`/dashboard/analytics/reports` | ✅ | ✅|
|`/dashboard/analytics/revenue` | ✅ | ✅|
|`/dashboard/analytics/saved-views` | ✅ | ✅ |
#### `audit-logs` (2)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/audit-logs` | ✅ | ✅|
|`/dashboard/audit-logs/retention` | ✅ | ✅ |
#### `beta-applications` (1)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/beta-applications` | ✅ | ✅ |
#### `billing` (11)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/billing` | ✅ | ✅|
|`/dashboard/billing/cancel` | ✅ | ✅|
|`/dashboard/billing/cancelled` | ✅ | ✅|
|`/dashboard/billing/entitlements` | ✅ | ✅|
|`/dashboard/billing/history` | ✅ | ✅|
|`/dashboard/billing/invoices` | ✅ | ✅|
|`/dashboard/billing/payment-method` | ✅ | ✅|
|`/dashboard/billing/plans` | ✅ | ✅|
|`/dashboard/billing/settings` | ✅ | ✅|
|`/dashboard/billing/success` | ✅ | ✅|
|`/dashboard/billing/usage` | ✅ | ✅ |
#### `brands` (8)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/brands` | ✅ | ✅|
|`/dashboard/brands/[brandId]` | ✅ | ✅|
|`/dashboard/brands/[brandId]/reports` | ✅ | ✅|
|`/dashboard/brands/assignment` | ✅ | ✅|
|`/dashboard/brands/command-center` | ✅ | ✅|
|`/dashboard/brands/multi-brand-setup` | ✅ | ✅|
|`/dashboard/brands/new` | ✅ | ✅|
|`/dashboard/brands/templates` | ✅ | ✅ |
#### `calendar` (1)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/calendar` | ✅ | ✅ |
#### `catering` (1)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/catering` | ✅ | ✅ |
#### `catering-quotes` (11)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/catering-quotes` | ✅ | ✅|
|`/dashboard/catering-quotes/[quoteId]` | ✅ | ✅|
|`/dashboard/catering-quotes/accepted` | ✅ | ✅|
|`/dashboard/catering-quotes/follow-ups` | ✅ | ✅|
|`/dashboard/catering-quotes/new` | ✅ | ✅|
|`/dashboard/catering-quotes/pipeline` | ✅ | ✅|
|`/dashboard/catering-quotes/public-proposals` | ✅ | ✅|
|`/dashboard/catering-quotes/quotes` | ✅ | ✅|
|`/dashboard/catering-quotes/reports` | ✅ | ✅|
|`/dashboard/catering-quotes/settings` | ✅ | ✅|
|`/dashboard/catering-quotes/templates` | ✅ | ✅ |
#### `compliance` (1)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/compliance/experiment-audit` | ✅ | ✅ |
#### `copilot` (8)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/copilot` | ✅ | ✅|
|`/dashboard/copilot/audit` | ✅ | ✅|
|`/dashboard/copilot/chat` | ✅ | ✅|
|`/dashboard/copilot/drafts` | ✅ | ✅|
|`/dashboard/copilot/insights` | ✅ | ✅|
|`/dashboard/copilot/settings` | ✅ | ✅|
|`/dashboard/copilot/sources` | ✅ | ✅|
|`/dashboard/copilot/summaries` | ✅ | ✅ |
#### `costing` (11)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/costing` | ✅ | ✅|
|`/dashboard/costing/alerts` | ✅ | ✅|
|`/dashboard/costing/avt` | ✅ | ✅|
|`/dashboard/costing/channel-fees` | ✅ | ✅|
|`/dashboard/costing/components` | ✅ | ✅|
|`/dashboard/costing/items` | ✅ | ✅|
|`/dashboard/costing/menus` | ✅ | ✅|
|`/dashboard/costing/recipes-missing` | ✅ | ✅|
|`/dashboard/costing/reports` | ✅ | ✅|
|`/dashboard/costing/scenarios` | ✅ | ✅|
|`/dashboard/costing/settings` | ✅ | ✅ |
#### `crm` (1)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/crm/customers/[customerId]` | ✅ | ✅ |
#### `customers` (13)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/customers` | ✅ | ✅|
|`/dashboard/customers/[customerId]` | ✅ | ✅|
|`/dashboard/customers/allergies` | ✅ | ✅|
|`/dashboard/customers/at-risk` | ✅ | ✅|
|`/dashboard/customers/companies` | ✅ | ✅|
|`/dashboard/customers/dedupe` | ✅ | ✅|
|`/dashboard/customers/deduplication` | ✅ | ✅|
|`/dashboard/customers/follow-ups` | ✅ | ✅|
|`/dashboard/customers/list` | ✅ | ✅|
|`/dashboard/customers/new` | ✅ | ✅|
|`/dashboard/customers/reports` | ✅ | ✅|
|`/dashboard/customers/segments` | ✅ | ✅|
|`/dashboard/customers/vip` | ✅ | ✅ |
#### `demo` (1)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/demo/scenarios` | ✅ | ✅ |
#### `developer` (14)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/developer` | ✅ | ✅|
|`/dashboard/developer/api-keys` | ✅ | ✅|
|`/dashboard/developer/docs` | ✅ | ✅|
|`/dashboard/developer/email-preview` | ✅ | ✅|
|`/dashboard/developer/flags` | ✅ | ✅|
|`/dashboard/developer/health` | ✅ | ✅|
|`/dashboard/developer/incidents` | ✅ | ✅|
|`/dashboard/developer/integrations` | ✅ | ✅|
|`/dashboard/developer/jobs` | ✅ | ✅|
|`/dashboard/developer/logs` | ✅ | ✅|
|`/dashboard/developer/performance` | ✅ | ✅|
|`/dashboard/developer/releases` | ✅ | ✅|
|`/dashboard/developer/tools` | ✅ | ✅|
|`/dashboard/developer/webhooks` | ✅ | ✅ |
#### `error-recovery` (1)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/error-recovery` | ✅ | ✅ |
#### `executive` (8)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/executive` | ✅ | ✅|
|`/dashboard/executive/brands-locations` | ✅ | ✅|
|`/dashboard/executive/customers` | ✅ | ✅|
|`/dashboard/executive/operations` | ✅ | ✅|
|`/dashboard/executive/profitability` | ✅ | ✅|
|`/dashboard/executive/report` | ✅ | ✅|
|`/dashboard/executive/revenue` | ✅ | ✅|
|`/dashboard/executive/risks` | ✅ | ✅ |
#### `forecast` (5)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/forecast` | ✅ | ✅|
|`/dashboard/forecast/[runId]` | ✅ | ✅|
|`/dashboard/forecast/history` | ✅ | ✅|
|`/dashboard/forecast/new` | ✅ | ✅|
|`/dashboard/forecast/settings` | ✅ | ✅ |
#### `founder` (1)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/founder` | ✅ | ✅ |
#### `go-live` (3)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/go-live` | ✅ | ✅|
|`/dashboard/go-live/projects/[projectId]` | ✅ | ✅|
|`/dashboard/go-live/test-run` | ✅ | ✅ |
#### `growth` (17)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/growth` | ✅ | ✅|
|`/dashboard/growth/accounts` | ✅ | ✅|
|`/dashboard/growth/advisory-board` | ✅ | ✅|
|`/dashboard/growth/content-library` | ✅ | ✅|
|`/dashboard/growth/customer-success` | ✅ | ✅|
|`/dashboard/growth/demo-requests` | ✅ | ✅|
|`/dashboard/growth/feedback` | ✅ | ✅|
|`/dashboard/growth/launch-analytics` | ✅ | ✅|
|`/dashboard/growth/leads` | ✅ | ✅|
|`/dashboard/growth/leads/[id]` | ✅ | ✅|
|`/dashboard/growth/onboarding-calls` | ✅ | ✅|
|`/dashboard/growth/outreach` | ✅ | ✅|
|`/dashboard/growth/partner-leads` | ✅ | ✅|
|`/dashboard/growth/referrals` | ✅ | ✅|
|`/dashboard/growth/roadmap` | ✅ | ✅|
|`/dashboard/growth/sales-inquiries` | ✅ | ✅|
|`/dashboard/growth/usage` | ✅ | ✅ |
#### `implementation` (24)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/implementation` | ✅ | ✅|
|`/dashboard/implementation/[projectId]` | ✅ | ✅|
|`/dashboard/implementation/[projectId]/activity` | ✅ | ✅|
|`/dashboard/implementation/[projectId]/checklist` | ✅ | ✅|
|`/dashboard/implementation/[projectId]/go-live` | ✅ | ✅|
|`/dashboard/implementation/[projectId]/integrations` | ✅ | ✅|
|`/dashboard/implementation/[projectId]/migration` | ✅ | ✅|
|`/dashboard/implementation/[projectId]/risks` | ✅ | ✅|
|`/dashboard/implementation/[projectId]/timeline` | ✅ | ✅|
|`/dashboard/implementation/[projectId]/training` | ✅ | ✅|
|`/dashboard/implementation/[projectId]/uat` | ✅ | ✅|
|`/dashboard/implementation/activity` | ✅ | ✅|
|`/dashboard/implementation/checklist` | ✅ | ✅|
|`/dashboard/implementation/enterprise` | ✅ | ✅|
|`/dashboard/implementation/go-live` | ✅ | ✅|
|`/dashboard/implementation/handoff` | ✅ | ✅|
|`/dashboard/implementation/integrations` | ✅ | ✅|
|`/dashboard/implementation/migration` | ✅ | ✅|
|`/dashboard/implementation/new` | ✅ | ✅|
|`/dashboard/implementation/projects` | ✅ | ✅|
|`/dashboard/implementation/reports` | ✅ | ✅|
|`/dashboard/implementation/risks` | ✅ | ✅|
|`/dashboard/implementation/training` | ✅ | ✅|
|`/dashboard/implementation/uat` | ✅ | ✅ |
#### `import-center` (7)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/import-center` | ✅ | ✅|
|`/dashboard/import-center/errors` | ✅ | ✅|
|`/dashboard/import-center/history` | ✅ | ✅|
|`/dashboard/import-center/jobs/[jobId]` | ✅ | ✅|
|`/dashboard/import-center/settings` | ✅ | ✅|
|`/dashboard/import-center/templates` | ✅ | ✅|
|`/dashboard/import-center/upload` | ✅ | ✅ |
#### `import-export` (9)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/import-export` | ✅ | ✅|
|`/dashboard/import-export/export` | ✅ | ✅|
|`/dashboard/import-export/exports` | ✅ | ✅|
|`/dashboard/import-export/import` | ✅ | ✅|
|`/dashboard/import-export/imports` | ✅ | ✅|
|`/dashboard/import-export/imports/[jobId]` | ✅ | ✅|
|`/dashboard/import-export/settings` | ✅ | ✅|
|`/dashboard/import-export/templates` | ✅ | ✅|
|`/dashboard/import-export/validation-errors` | ✅ | ✅ |
#### `integration-health` (1)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/integration-health` | ✅ | ✅ |
#### `integrations` (7)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/integrations` | ✅ | ✅|
|`/dashboard/integrations/health` | ✅ | ✅|
|`/dashboard/integrations/shopify` | ✅ | ✅|
|`/dashboard/integrations/uber-direct` | ✅ | ✅|
|`/dashboard/integrations/uber-eats` | ✅ | ✅|
|`/dashboard/integrations/webhooks` | ✅ | ✅|
|`/dashboard/integrations/woocommerce` | ✅ | ✅ |
#### `inventory` (2)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/inventory/demand` | ✅ | ✅|
|`/dashboard/inventory/demand/settings` | ✅ | ✅ |
#### `kitchen` (3)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/kitchen` | ✅ | ✅|
|`/dashboard/kitchen/fullscreen` | ✅ | ✅|
|`/dashboard/kitchen/tablet` | ✅ | ✅ |
#### `locations` (20)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/locations` | ✅ | ✅|
|`/dashboard/locations/[locationId]` | ✅ | ✅|
|`/dashboard/locations/[locationId]/brands` | ✅ | ✅|
|`/dashboard/locations/[locationId]/fulfillment` | ✅ | ✅|
|`/dashboard/locations/[locationId]/hours` | ✅ | ✅|
|`/dashboard/locations/[locationId]/inventory` | ✅ | ✅|
|`/dashboard/locations/[locationId]/menus` | ✅ | ✅|
|`/dashboard/locations/[locationId]/orders` | ✅ | ✅|
|`/dashboard/locations/[locationId]/production` | ✅ | ✅|
|`/dashboard/locations/[locationId]/profile` | ✅ | ✅|
|`/dashboard/locations/[locationId]/reports` | ✅ | ✅|
|`/dashboard/locations/[locationId]/routes` | ✅ | ✅|
|`/dashboard/locations/[locationId]/settings` | ✅ | ✅|
|`/dashboard/locations/active` | ✅ | ✅|
|`/dashboard/locations/assignment` | ✅ | ✅|
|`/dashboard/locations/new` | ✅ | ✅|
|`/dashboard/locations/reports` | ✅ | ✅|
|`/dashboard/locations/settings` | ✅ | ✅|
|`/dashboard/locations/setup` | ✅ | ✅|
|`/dashboard/locations/templates` | ✅ | ✅ |
#### `meal-plans` (12)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/meal-plans` | ✅ | ✅|
|`/dashboard/meal-plans/[planId]` | ✅ | ✅|
|`/dashboard/meal-plans/active` | ✅ | ✅|
|`/dashboard/meal-plans/customers` | ✅ | ✅|
|`/dashboard/meal-plans/cycles` | ✅ | ✅|
|`/dashboard/meal-plans/generated` | ✅ | ✅|
|`/dashboard/meal-plans/needs-review` | ✅ | ✅|
|`/dashboard/meal-plans/new` | ✅ | ✅|
|`/dashboard/meal-plans/paused` | ✅ | ✅|
|`/dashboard/meal-plans/reports` | ✅ | ✅|
|`/dashboard/meal-plans/settings` | ✅ | ✅|
|`/dashboard/meal-plans/templates` | ✅ | ✅ |
#### `meal-subscriptions` (1)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/meal-subscriptions` | ✅ | ✅ |
#### `menu-planner` (1)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/menu-planner` | ✅ | ✅ |
#### `menus` (5)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/menus` | ✅ | ✅|
|`/dashboard/menus/[menuId]` | ✅ | ✅|
|`/dashboard/menus/[menuId]/reports` | ✅ | ✅|
|`/dashboard/menus/new` | ✅ | ✅|
|`/dashboard/menus/templates` | ✅ | ✅ |
#### `notifications` (9)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/notifications` | ✅ | ✅|
|`/dashboard/notifications/alerts` | ✅ | ✅|
|`/dashboard/notifications/log` | ✅ | ✅|
|`/dashboard/notifications/preferences` | ✅ | ✅|
|`/dashboard/notifications/provider` | ✅ | ✅|
|`/dashboard/notifications/retry` | ✅ | ✅|
|`/dashboard/notifications/rules` | ✅ | ✅|
|`/dashboard/notifications/settings` | ✅ | ✅|
|`/dashboard/notifications/templates` | ✅ | ✅ |
#### `nutrition-labels` (5)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/nutrition-labels` | ✅ | ✅|
|`/dashboard/nutrition-labels/import` | ✅ | ✅|
|`/dashboard/nutrition-labels/items/[productId]` | ✅ | ✅|
|`/dashboard/nutrition-labels/print-queue` | ✅ | ✅|
|`/dashboard/nutrition-labels/reports` | ✅ | ✅ |
#### `order-hub` (1)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/order-hub` | ✅ | ✅ |
#### `orders` (4)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/orders` | ✅ | ✅|
|`/dashboard/orders/[orderId]` | ✅ | ✅|
|`/dashboard/orders/new` | ✅ | ✅|
|`/dashboard/orders/quick` | ✅ | ✅ |
#### `packing` (4)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/packing` | ✅ | ✅|
|`/dashboard/packing/reports` | ✅ | ✅|
|`/dashboard/packing/scanner` | ✅ | ✅|
|`/dashboard/packing/verify` | ✅ | ✅ |
#### `partner` (1)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/partner` | ✅ | ✅ |
#### `playbooks` (11)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/playbooks` | ✅ | ✅|
|`/dashboard/playbooks/[playbookId]` | ✅ | ✅|
|`/dashboard/playbooks/active` | ✅ | ✅|
|`/dashboard/playbooks/all` | ✅ | ✅|
|`/dashboard/playbooks/custom` | ✅ | ✅|
|`/dashboard/playbooks/new` | ✅ | ✅|
|`/dashboard/playbooks/reports` | ✅ | ✅|
|`/dashboard/playbooks/runs/[runId]` | ✅ | ✅|
|`/dashboard/playbooks/schedule` | ✅ | ✅|
|`/dashboard/playbooks/settings` | ✅ | ✅|
|`/dashboard/playbooks/templates` | ✅ | ✅ |
#### `pos` (11)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/pos` | ✅ | ✅|
|`/dashboard/pos/handheld` | ✅ | —|
|`/dashboard/pos/receipts` | ✅ | ✅|
|`/dashboard/pos/registers` | ✅ | ✅|
|`/dashboard/pos/reports` | ✅ | ✅|
|`/dashboard/pos/settings` | ✅ | ✅|
|`/dashboard/pos/settings/hardware` | ✅ | ✅|
|`/dashboard/pos/shifts` | ✅ | ✅|
|`/dashboard/pos/tabs` | ✅ | ✅|
|`/dashboard/pos/terminal` | ✅ | ✅|
|`/dashboard/pos/transactions` | ✅ | ✅ |
#### `product-mapping` (12)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/product-mapping` | ✅ | ✅|
|`/dashboard/product-mapping/activity` | ✅ | ✅|
|`/dashboard/product-mapping/aliases` | ✅ | ✅|
|`/dashboard/product-mapping/approved` | ✅ | ✅|
|`/dashboard/product-mapping/batches` | ✅ | ✅|
|`/dashboard/product-mapping/bulk` | ✅ | ✅|
|`/dashboard/product-mapping/conflicts` | ✅ | ✅|
|`/dashboard/product-mapping/health` | ✅ | ✅|
|`/dashboard/product-mapping/modifiers` | ✅ | ✅|
|`/dashboard/product-mapping/settings` | ✅ | ✅|
|`/dashboard/product-mapping/suggestions` | ✅ | ✅|
|`/dashboard/product-mapping/unmapped` | ✅ | ✅ |
#### `production` (4)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/production` | ✅ | ✅|
|`/dashboard/production/batches/[batchId]` | ✅ | ✅|
|`/dashboard/production/reports` | ✅ | ✅|
|`/dashboard/production/templates` | ✅ | ✅ |
#### `products` (3)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/products` | ✅ | ✅|
|`/dashboard/products/[productId]` | ✅ | ✅|
|`/dashboard/products/new` | ✅ | ✅ |
#### `purchasing` (8)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/purchasing` | ✅ | ✅|
|`/dashboard/purchasing/exports` | ✅ | ✅|
|`/dashboard/purchasing/price-history` | ✅ | ✅|
|`/dashboard/purchasing/purchase-orders` | ✅ | ✅|
|`/dashboard/purchasing/purchase-orders/[poId]` | ✅ | ✅|
|`/dashboard/purchasing/receiving` | ✅ | ✅|
|`/dashboard/purchasing/reorder-queue` | ✅ | ✅|
|`/dashboard/purchasing/suppliers` | ✅ | ✅ |
#### `reports` (11)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/reports` | ✅ | ✅|
|`/dashboard/reports/[reportKey]` | ✅ | ✅|
|`/dashboard/reports/enterprise` | ✅ | ✅|
|`/dashboard/reports/executive` | ✅ | ✅|
|`/dashboard/reports/financial` | ✅ | ✅|
|`/dashboard/reports/history` | ✅ | ✅|
|`/dashboard/reports/labor` | ✅ | ✅|
|`/dashboard/reports/library` | ✅ | ✅|
|`/dashboard/reports/operations` | ✅ | ✅|
|`/dashboard/reports/saved` | ✅ | ✅|
|`/dashboard/reports/settings` | ✅ | ✅ |
#### `root` (1)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard` | ✅ | ✅ |
#### `routes` (11)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/routes` | ✅ | ✅|
|`/dashboard/routes/[routeId]` | ✅ | ✅|
|`/dashboard/routes/[routeId]/driver` | ✅ | ✅|
|`/dashboard/routes/[routeId]/manifest` | ✅ | ✅|
|`/dashboard/routes/driver` | ✅ | ✅|
|`/dashboard/routes/drivers` | ✅ | ✅|
|`/dashboard/routes/planner` | ✅ | ✅|
|`/dashboard/routes/reports` | ✅ | ✅|
|`/dashboard/routes/settings` | ✅ | ✅|
|`/dashboard/routes/uber-direct` | ✅ | ✅|
|`/dashboard/routes/zones` | ✅ | ✅ |
#### `sales-channels` (21)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/sales-channels` | ✅ | ✅|
|`/dashboard/sales-channels/[providerKey]/setup` | ✅ | ✅|
|`/dashboard/sales-channels/analytics` | ✅ | ✅|
|`/dashboard/sales-channels/assistant` | ✅ | ✅|
|`/dashboard/sales-channels/attention` | ✅ | ✅|
|`/dashboard/sales-channels/available` | ✅ | ✅|
|`/dashboard/sales-channels/conflicts` | ✅ | ✅|
|`/dashboard/sales-channels/connected` | ✅ | ✅|
|`/dashboard/sales-channels/connections/[connectionId]` | ✅ | ✅|
|`/dashboard/sales-channels/handoff` | ✅ | ✅|
|`/dashboard/sales-channels/health` | ✅ | ✅|
|`/dashboard/sales-channels/imports/[batchId]` | ✅ | ✅|
|`/dashboard/sales-channels/mapping` | ✅ | ✅|
|`/dashboard/sales-channels/reliability` | ✅ | ✅|
|`/dashboard/sales-channels/rules` | ✅ | ✅|
|`/dashboard/sales-channels/settings` | ✅ | ✅|
|`/dashboard/sales-channels/simulator` | ✅ | ✅|
|`/dashboard/sales-channels/staging` | ✅ | ✅|
|`/dashboard/sales-channels/sync-jobs` | ✅ | ✅|
|`/dashboard/sales-channels/webhook-lab` | ✅ | ✅|
|`/dashboard/sales-channels/webhooks` | ✅ | ✅ |
#### `scan` (1)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/scan` | ✅ | ✅ |
#### `security` (1)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/security/audit-logs` | ✅ | ✅ |
#### `settings` (27)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/settings` | ✅ | ✅|
|`/dashboard/settings/advanced` | ✅ | ✅|
|`/dashboard/settings/ai` | ✅ | ✅|
|`/dashboard/settings/automation` | ✅ | ✅|
|`/dashboard/settings/backups` | ✅ | ✅|
|`/dashboard/settings/billing` | ✅ | ✅|
|`/dashboard/settings/branding` | ✅ | ✅|
|`/dashboard/settings/compliance` | ✅ | ✅|
|`/dashboard/settings/crm` | ✅ | ✅|
|`/dashboard/settings/delivery` | ✅ | ✅|
|`/dashboard/settings/developer` | ✅ | ✅|
|`/dashboard/settings/domains` | ✅ | ✅|
|`/dashboard/settings/imports` | ✅ | ✅|
|`/dashboard/settings/integrations` | ✅ | ✅|
|`/dashboard/settings/modules` | ✅ | ✅|
|`/dashboard/settings/notifications` | ✅ | ✅|
|`/dashboard/settings/operations` | ✅ | ✅|
|`/dashboard/settings/orders` | ✅ | ✅|
|`/dashboard/settings/packing` | ✅ | ✅|
|`/dashboard/settings/pos` | ✅ | ✅|
|`/dashboard/settings/production` | ✅ | ✅|
|`/dashboard/settings/routes` | ✅ | ✅|
|`/dashboard/settings/security` | ✅ | ✅|
|`/dashboard/settings/staff` | ✅ | ✅|
|`/dashboard/settings/storefront` | ✅ | ✅|
|`/dashboard/settings/white-label` | ✅ | ✅|
|`/dashboard/settings/workspace` | ✅ | ✅ |
#### `staff` (9)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/staff` | ✅ | ✅|
|`/dashboard/staff/[staffId]` | ✅ | ✅|
|`/dashboard/staff/availability` | ✅ | ✅|
|`/dashboard/staff/certifications` | ✅ | ✅|
|`/dashboard/staff/drivers` | ✅ | ✅|
|`/dashboard/staff/reports` | ✅ | ✅|
|`/dashboard/staff/roles` | ✅ | ✅|
|`/dashboard/staff/roster` | ✅ | ✅|
|`/dashboard/staff/shifts` | ✅ | ✅ |
#### `storefront` (32)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/storefront` | ✅ | ✅|
|`/dashboard/storefront/advanced` | ✅ | ✅|
|`/dashboard/storefront/analytics` | ✅ | ✅|
|`/dashboard/storefront/builder` | ✅ | ✅|
|`/dashboard/storefront/catalog` | ✅ | ✅|
|`/dashboard/storefront/discounts` | ✅ | ✅|
|`/dashboard/storefront/domains` | ✅ | ✅|
|`/dashboard/storefront/forms` | ✅ | ✅|
|`/dashboard/storefront/forms/[formId]` | ✅ | ✅|
|`/dashboard/storefront/forms/[formId]/submissions` | ✅ | ✅|
|`/dashboard/storefront/forms/new` | ✅ | ✅|
|`/dashboard/storefront/fulfillment` | ✅ | ✅|
|`/dashboard/storefront/launch` | ✅ | ✅|
|`/dashboard/storefront/markets` | ✅ | ✅|
|`/dashboard/storefront/media` | ✅ | ✅|
|`/dashboard/storefront/menu` | ✅ | ✅|
|`/dashboard/storefront/notifications` | ✅ | ✅|
|`/dashboard/storefront/ordering` | ✅ | ✅|
|`/dashboard/storefront/pages` | ✅ | ✅|
|`/dashboard/storefront/pages/[pageId]` | ✅ | ✅|
|`/dashboard/storefront/pickup-windows` | ✅ | —|
|`/dashboard/storefront/preview` | ✅ | ✅|
|`/dashboard/storefront/products` | ✅ | ✅|
|`/dashboard/storefront/redirects` | ✅ | ✅|
|`/dashboard/storefront/seo` | ✅ | ✅|
|`/dashboard/storefront/settings` | ✅ | ✅|
|`/dashboard/storefront/settings/experiments` | ✅ | ✅|
|`/dashboard/storefront/team` | ✅ | ✅|
|`/dashboard/storefront/team/audit` | ✅ | ✅|
|`/dashboard/storefront/theme` | ✅ | ✅|
|`/dashboard/storefront/website` | ✅ | ✅|
|`/dashboard/storefront/workspace` | ✅ | ✅ |
#### `support` (5)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/support` | ✅ | ✅|
|`/dashboard/support/[ticketId]` | ✅ | ✅|
|`/dashboard/support/inbox` | ✅ | ✅|
|`/dashboard/support/kb` | ✅ | ✅|
|`/dashboard/support/reports` | ✅ | ✅ |
#### `system-health` (2)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/system-health` | ✅ | ✅|
|`/dashboard/system-health/data-integrity` | ✅ | ✅ |
#### `tables` (1)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/tables` | ✅ | ✅ |
#### `tasks` (11)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/tasks` | ✅ | ✅|
|`/dashboard/tasks/[taskId]` | ✅ | ✅|
|`/dashboard/tasks/calendar` | ✅ | ✅|
|`/dashboard/tasks/kanban` | ✅ | ✅|
|`/dashboard/tasks/list` | ✅ | ✅|
|`/dashboard/tasks/my` | ✅ | ✅|
|`/dashboard/tasks/new` | ✅ | ✅|
|`/dashboard/tasks/recurring` | ✅ | ✅|
|`/dashboard/tasks/reports` | ✅ | ✅|
|`/dashboard/tasks/settings` | ✅ | ✅|
|`/dashboard/tasks/templates` | ✅ | ✅ |
#### `templates` (10)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/templates` | ✅ | ✅|
|`/dashboard/templates/[templateKey]` | ✅ | ✅|
|`/dashboard/templates/[templateKey]/apply` | ✅ | ✅|
|`/dashboard/templates/all` | ✅ | ✅|
|`/dashboard/templates/history` | ✅ | ✅|
|`/dashboard/templates/imports` | ✅ | ✅|
|`/dashboard/templates/module-packs` | ✅ | ✅|
|`/dashboard/templates/playbooks` | ✅ | ✅|
|`/dashboard/templates/starters` | ✅ | ✅|
|`/dashboard/templates/storefront` | ✅ | ✅ |
#### `today` (1)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/today` | ✅ | ✅ |
#### `training` (13)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/training` | ✅ | ✅|
|`/dashboard/training/analytics` | ✅ | ✅|
|`/dashboard/training/assignments` | ✅ | ✅|
|`/dashboard/training/certifications` | ✅ | ✅|
|`/dashboard/training/kitchen` | ✅ | ✅|
|`/dashboard/training/manager` | ✅ | ✅|
|`/dashboard/training/packing` | ✅ | ✅|
|`/dashboard/training/practice` | ✅ | ✅|
|`/dashboard/training/programs` | ✅ | ✅|
|`/dashboard/training/programs/[programId]` | ✅ | ✅|
|`/dashboard/training/simulations` | ✅ | ✅|
|`/dashboard/training/sops` | ✅ | ✅|
|`/dashboard/training/tablet` | ✅ | ✅ |
#### `workspace` (1)
| Route | loading | error|
|-------|:-------:|:-----:|
|`/dashboard/workspace/experiments` | ✅ | ✅ |
### Non-dashboard pages

- `/app/advisory-board`
- `/app/b/[brandSlug]`
- `/app/beta`
- `/app/blog/how-to-start-meal-prep-business`
- `/app/blog`
- `/app/blog/reduce-food-waste-with-production-planning`
- `/app/blog/restaurant-pos-comparison-2026`
- `/app/book-demo`
- `/app/capabilities`
- `/app/changelog`
- `/app/compare/[slug]`
- `/app/compare`
- `/app/contact-sales`
- `/app/customers/[id]`
- `/app/customers`
- `/app/demo/[slug]`
- `/app/demo`
- `/app/developers/docs`
- `/app/developers`
- `/app/developers/webhooks`
- `/app/driver`
- `/app/forgot-password`
- `/app/get-started`
- `/app/help/billing`
- `/app/help/data-export`
- `/app/help/faq`
- `/app/help/getting-started`
- `/app/help/import-export`
- `/app/help/integrations`
- `/app/help/order-hub`
- `/app/help/packing`
- `/app/help`
- `/app/help/production`
- `/app/help/products-skus`
- `/app/help/uber-eats`
- `/app/implementation-service`
- `/app/integrations/manual-orders`
- `/app/integrations`
- `/app/integrations/public-storefront`
- `/app/integrations/shopify/app`
- `/app/integrations/shopify`
- `/app/integrations/uber-direct`
- `/app/integrations/uber-eats`
- `/app/integrations/woocommerce/extension`
- `/app/integrations/woocommerce`
- `/app/invite/[token]`
- `/app/kds`
- `/app/legal/acceptable-use`
- `/app/legal/cookie-policy`
- `/app/legal/data-rights`
- `/app/legal/dpa`
- `/app/legal/privacy`
- `/app/legal/security`
- `/app/legal/terms`
- `/app/login`
- `/app/lp/[slug]/[metro]`
- `/app/lp/[slug]`
- `/app/markets/canada`
- `/app/markets/europe`
- `/app/markets/united-kingdom`
- `/app/markets/united-states`
- `/app/onboarding`
- `/app/order/[token]`
- `/app`
- `/app/partner/clients/[id]`
- `/app/partner/clients`
- `/app/partner/implementation`
- `/app/partner`
- `/app/partner/revenue`
- `/app/partners`
- `/app/platform/accounts`
- `/app/platform/audit`
- `/app/platform/automations`
- `/app/platform/beta-applications`
- `/app/platform/billing`
- `/app/platform/customer-success`
- `/app/platform/dashboard`
- `/app/platform/demo`
- `/app/platform/entitlements`
- `/app/platform/error-recovery`
- `/app/platform/errors`
- `/app/platform/feature-flags`
- `/app/platform/go-live`
- `/app/platform/growth-crm`
- `/app/platform/health`
- `/app/platform/implementations`
- `/app/platform/incidents`
- `/app/platform/integrations`
- `/app/platform/jobs`
- `/app/platform/notifications`
- `/app/platform/organizations`
- `/app/platform`
- `/app/platform/partner`
- `/app/platform/plans`
- `/app/platform/platform-users`
- `/app/platform/pos`
- `/app/platform/preview/[userId]`
- `/app/platform/revenue`
- `/app/platform/roles`
- `/app/platform/runbooks`
- `/app/platform/search`
- `/app/platform/settings`
- `/app/platform/support/[ticketId]`
- `/app/platform/support/escalations`
- `/app/platform/support/knowledge-base`
- `/app/platform/support`
- `/app/platform/support/queue`
- `/app/platform/system-health`
- `/app/platform/tools/db-health`
- `/app/platform/tools`
- `/app/platform/training`
- `/app/platform/trials`
- `/app/platform/users`
- `/app/platform/webhooks`
- `/app/platform/workspaces/[workspaceId]/integration-health`
- `/app/platform/workspaces/[workspaceId]`
- `/app/platform/workspaces`
- `/app/pricing`
- `/app/product/[slug]`
- `/app/product`
- `/app/product/pos-terminal`
- `/app/quote/[token]`
- `/app/resources/catering-production-workflow`
- `/app/resources/kitchen-production-planning`
- `/app/resources/meal-prep-operations`
- `/app/resources/packing-labels-for-meal-prep`
- `/app/resources`
- `/app/resources/shopify-meal-prep-store`
- `/app/resources/woocommerce-food-orders`
- `/app/roi-calculator`
- `/app/s/[storeSlug]/about`
- `/app/s/[storeSlug]/account`
- `/app/s/[storeSlug]/cart`
- `/app/s/[storeSlug]/catering`
- `/app/s/[storeSlug]/checkout`
- `/app/s/[storeSlug]/collections/[collectionSlug]`
- `/app/s/[storeSlug]/contact`
- `/app/s/[storeSlug]/daily-menu`
- `/app/s/[storeSlug]/faq`
- `/app/s/[storeSlug]/menu`
- `/app/s/[storeSlug]/order/[token]`
- `/app/s/[storeSlug]/order-confirmation/[token]`
- `/app/s/[storeSlug]/p/[pageSlug]`
- `/app/s/[storeSlug]`
- `/app/s/[storeSlug]/policies/privacy`
- `/app/s/[storeSlug]/policies/terms`
- `/app/s/[storeSlug]/products/[productRef]`
- `/app/service-areas`
- `/app/signup`
- `/app/solutions/[slug]`
- `/app/solutions`
- `/app/status`
- `/app/support/contact`
- `/app/support/feature-request`
- `/app/support`
- `/app/support/status`
- `/app/trust`
- `/app/trust/status`
- `/app/visual-test/checkout-shell`
- `/app/visual-test/collection-preview`
- `/app/visual-test/nav-tokens`
- `/app/visual-test/theme-presets`

---
## Layer 3: Components
**Total:** 654 TSX files

| Category | Count |
|----------|------:|
| `dashboard/` | 365 |
| `storefront/` | 58 |
| `marketing/` | 34 |
| `ui/` | 24 |
| `landing/` | 19 |
| `storefront-builder/` | 16 |
| `sales-channels/` | 10 |
| `orders/` | 10 |
| `feedback/` | 9 |
| `integrations/` | 8 |
| `platform/` | 7 |
| `analytics/` | 7 |
| `growth/` | 6 |
| `seo/` | 5 |
| `costing/` | 4 |
| `brands/` | 4 |
| `layout/` | 4 |
| `demo/` | 3 |
| `capabilities/` | 3 |
| `auth/` | 3 |
| `permissions/` | 3 |
| `realtime/` | 3 |
| `data-display/` | 3 |
| `billing/` | 3 |
| `onboarding/` | 3 |
| `root/` | 2 |
| `beta/` | 2 |
| `developer/` | 2 |
| `purchasing/` | 2 |
| `plans/` | 2 |
| `cards/` | 2 |
| `providers/` | 2 |
| `status/` | 2 |
| `pos/` | 2 |
| `support/` | 2 |
| `book-demo/` | 2 |
| `channels/` | 2 |
| `gates/` | 1 |
| `tables/` | 1 |
| `restaurant/` | 1 |
| `forms/` | 1 |
| `today/` | 1 |
| `activity/` | 1 |
| `brand/` | 1 |
| `empty-state/` | 1 |
| `partner/` | 1 |
| `invite/` | 1 |
| `public/` | 1 |
| `production/` | 1 |
| `a11y/` | 1 |
| `kitchen/` | 1 |
| `legal/` | 1 |
| `executive/` | 1 |

### Route-state components (`components/dashboard/route-states.tsx`)

| Component | States |
|-----------|--------|
| `RouteLoading` | loading spinner + message |
| `RouteError` | error + retry (`reset`) |
| `RouteEmpty` | empty + optional CTA href |

---
## Layer 4: Server Actions
**634** exported async functions in **110** files.

### Top 25 action files

| File | Exports |
|------|--------:|
| `actions/catering-quotes.ts` | 24 |
| `actions/customers.ts` | 24 |
| `actions/storefront-pages.ts` | 22 |
| `actions/meal-plans.ts` | 20 |
| `actions/kitchen-task.ts` | 19 |
| `actions/growth.ts` | 17 |
| `actions/implementation.ts` | 16 |
| `actions/locations.ts` | 16 |
| `actions/settings-center.ts` | 16 |
| `actions/delivery-route.ts` | 15 |
| `actions/onboarding.ts` | 14 |
| `actions/forecast.ts` | 12 |
| `actions/packing-verification.ts` | 12 |
| `actions/storefront-advanced.ts` | 12 |
| `actions/storefront-forms.ts` | 12 |
| `actions/storefront-pillar-settings.ts` | 12 |
| `actions/training.ts` | 12 |
| `actions/channel-command-center.ts` | 11 |
| `actions/implementation-center.ts` | 11 |
| `actions/staff.ts` | 10 |
| `actions/storefront-settings.ts` | 10 |
| `actions/analytics.ts` | 9 |
| `actions/go-live.ts` | 9 |
| `actions/playbooks.ts` | 9 |
| `actions/pos.ts` | 9 |

### Tier 1 actions (detail)

**`actions/restaurant/tables.ts`:** `createRestaurantTable`, `updateTablePosition`, `updateTableStatusAction`, `deleteRestaurantTable` → `RestaurantTable`

**`actions/pos/tabs.ts`:** `createTabAction`, `addItemToTabAction`, `closeTabAction` → `PosTab`, `PosTabItem`

**`actions/operating-mode.ts`:** `updateKitchenOperatingMode` → `KitchenSettings.operatingMode`

**`actions/kitchen-daily-kds.ts`:** `fetchDailyKdsOrdersAction`, `bumpDailyKdsOrderAction` → Order status

**`actions/storefront/pickup-windows.ts`:** pickup window CRUD → `PickupWindow`

---
## Layer 5: Services
**481** files

| Directory | Files |
|-----------|------:|
| `services/storefront/` | 178 |
| `services/platform/` | 16 |
| `services/pos/` | 16 |
| `services/developer/` | 15 |
| `services/growth/` | 12 |
| `services/crm/` | 11 |
| `services/webhooks/` | 9 |
| `services/beta/` | 8 |
| `services/observability/` | 8 |
| `services/partner/` | 8 |
| `services/orders/` | 8 |
| `services/analytics/` | 8 |
| `services/support/` | 7 |
| `services/ai/` | 7 |
| `services/storefront-builder/` | 7 |
| `services/inventory/` | 6 |
| `services/billing/` | 6 |
| `services/forecast/` | 5 |
| `services/demo/` | 5 |
| `services/costing/` | 5 |
| `services/purchasing/` | 5 |
| `services/today/` | 5 |
| `services/security/` | 5 |
| `services/audit/` | 5 |
| `services/integrations/` | 4 |
| `services/import-export/` | 4 |
| `services/implementation/` | 4 |
| `services/catering/` | 4 |
| `services/meal-plans/` | 3 |
| `services/order-hub/` | 3 |
| `services/brand/` | 3 |
| `services/workflows/` | 3 |
| `services/permissions/` | 3 |
| `services/operations/` | 3 |
| `services/automation/` | 3 |
| `services/notifications/` | 3 |
| `services/cron/` | 3 |
| `services/root/` | 2 |
| `services/kitchen-screen/` | 2 |
| `services/settings/` | 2 |
| `services/privacy/` | 2 |
| `services/location/` | 2 |
| `services/training/` | 2 |
| `services/playbooks/` | 2 |
| `services/alerts/` | 2 |
| `services/nutrition-labels/` | 2 |
| `services/queue/` | 2 |
| `services/production/` | 2 |
| `services/templates/` | 2 |
| `services/staff/` | 2 |
| `services/product-mapping/` | 2 |
| `services/events/` | 2 |
| `services/modules/` | 2 |
| `services/beta-ops/` | 2 |
| `services/routes/` | 2 |
| `services/channels/` | 2 |
| `services/packing/` | 2 |
| `services/organization/` | 1 |
| `services/restaurant/` | 1 |
| `services/import-center/` | 1 |
| `services/tasks/` | 1 |
| `services/capabilities/` | 1 |
| `services/ingredient-demand/` | 1 |
| `services/intelligence/` | 1 |
| `services/activity/` | 1 |
| `services/org/` | 1 |
| `services/recovery/` | 1 |
| `services/go-live/` | 1 |
| `services/navigation/` | 1 |
| `services/fulfillment/` | 1 |
| `services/scope/` | 1 |
| `services/imports/` | 1 |
| `services/dsr/` | 1 |
| `services/packing-verification/` | 1 |
| `services/storage/` | 1 |
| `services/search/` | 1 |
| `services/exports/` | 1 |
| `services/realtime/` | 1 |
| `services/locations/` | 1 |
| `services/readiness/` | 1 |
| `services/delivery/` | 1 |
| `services/db/` | 1 |
| `services/integrity/` | 1 |
| `services/trust/` | 1 |
| `services/errors/` | 1 |
| `services/jobs/` | 1 |
| `services/forecasting/` | 1 |
| `services/onboarding/` | 1 |
| `services/reports/` | 1 |
| `services/executive/` | 1 |

---
## Layer 6: API Routes

### Production crons (12)

| Slug | Schedule | Purpose |
|------|----------|----------|
| `webhook-jobs` | `*/5 * * * *` | Process queued webhook jobs |
| `reminders` | `0 14 * * *` | Customer/order reminders |
| `storefront-domain-recheck` | `0 */6 * * *` | Custom domain DNS recheck |
| `storefront-cart-recovery` | `*/30 * * * *` | Abandoned cart recovery |
| `storefront-theme-publish` | `*/15 * * * *` | Scheduled theme publish |
| `storefront-team-invite-reminders` | `0 10 * * *` | Team invite reminders |
| `storefront-webhook-retention` | `15 4 * * *` | Webhook log retention |
| `storefront-invite-audit-retention` | `0 3 * * 0` | Invite audit retention |
| `storefront-ga4-parity` | `30 */6 * * *` | GA4 parity checks |
| `storefront-edge-sync` | `*/2 * * * *` | Edge config sync |
| `pilot-daily-health` | `0 8 * * *` | Pilot health snapshot |
| `meal-plan-auto-renew` | `0 6 * * *` | Meal plan auto-renew |

### Product API routes (125)

<details><summary>Click to expand route list</summary>

- `/api/billing/checkout`
- `/api/billing/portal`
- `/api/billing-portal`
- `/api/checkout`
- `/api/compliance/auditor/experiment-controls`
- `/api/cron/meal-plan-auto-renew`
- `/api/cron/pilot-daily-health`
- `/api/cron/reminders`
- `/api/cron/storefront-cart-recovery`
- `/api/cron/storefront-domain-recheck`
- `/api/cron/storefront-edge-sync`
- `/api/cron/storefront-ga4-parity`
- `/api/cron/storefront-invite-audit-retention`
- `/api/cron/storefront-team-invite-reminders`
- `/api/cron/storefront-theme-publish`
- `/api/cron/storefront-webhook-retention`
- `/api/cron/webhook-jobs`
- `/api/dashboard/compliance/experiment-audit-download`
- `/api/dashboard/experiment-publish-preflight`
- `/api/dashboard/orders/storefront-export`
- `/api/dashboard/storefront/experiment-audit-export`
- `/api/dashboard/storefront/experiment-legal-hold`
- `/api/dashboard/storefront/experiment-series`
- `/api/dashboard/storefront/team-invite-audit-export`
- `/api/delivery/cancel`
- `/api/delivery/create`
- `/api/delivery/quote`
- `/api/export/report`
- `/api/export`
- `/api/growth/customer-success/export`
- `/api/growth/leads/export`
- `/api/health`
- `/api/import-center/[jobId]/errors.csv`
- `/api/import-center/templates/[type]`
- `/api/import-export/template`
- `/api/import-templates/[type]`
- `/api/integrations/shopify/sync-orders`
- `/api/integrations/shopify/sync-products`
- `/api/integrations/shopify/test`
- `/api/integrations/uber-eats/test`
- `/api/integrations/woocommerce/sync-orders`
- `/api/integrations/woocommerce/sync-products`
- `/api/integrations/woocommerce/test`
- `/api/internal/dsr/export`
- `/api/internal/experiment-dna-audit-block`
- `/api/internal/experiment-ebpf-sample`
- `/api/internal/experiment-ethics-review`
- `/api/internal/experiment-quantum-seal`
- `/api/internal/experiment-tee-attest`
- `/api/internal/experiment-wetware-calibrate`
- `/api/internal/experiment-zk-proof`
- `/api/internal/stripe/resolve-prices`
- `/api/invite/magic-link`
- `/api/public/v1/customers`
- `/api/public/v1/orders`
- `/api/public/v1/products`
- `/api/storefront/account/orders`
- `/api/storefront/account/reorder/preview`
- `/api/storefront/account/reorder`
- `/api/storefront/account/session`
- `/api/storefront/analytics`
- `/api/storefront/cart`
- `/api/storefront/cart-recovery`
- `/api/storefront/cart-recovery/unsubscribe`
- `/api/storefront/catalog`
- `/api/storefront/experiment/auto-conclude/approve`
- `/api/storefront/experiment/auto-conclude/bulk-approve`
- `/api/storefront/experiment/auto-conclude/reject`
- `/api/storefront/experiment/causal-discovery/approve`
- `/api/storefront/experiment/orchestrator/approve`
- `/api/storefront/form-submissions-export/[formId]`
- `/api/storefront/forms/upload`
- `/api/storefront/guest-account`
- `/api/storefront/preview-token`
- `/api/storefront/qr`
- `/api/storefront/resolve-host`
- `/api/storefront/resolve-redirect`
- `/api/storefront/shipping/quote`
- `/api/storefront/theme-experiment`
- `/api/webhooks/bigquery-bayesian-prior`
- `/api/webhooks/bigquery-causal-discovery-outcomes`
- `/api/webhooks/bigquery-causal-lift`
- `/api/webhooks/bigquery-causal-posteriors`
- `/api/webhooks/bigquery-federated-gradients`
- `/api/webhooks/bigquery-ga4-parity`
- `/api/webhooks/bigquery-global-mesh-outcomes`
- `/api/webhooks/bigquery-homomorphic-metrics`
- `/api/webhooks/bigquery-interference-matrix`
- `/api/webhooks/bigquery-linucb-weights`
- `/api/webhooks/bigquery-off-policy`
- `/api/webhooks/bigquery-spillover-daily`
- `/api/webhooks/bigquery-workspace-acl`
- `/api/webhooks/cen-cenelec-digital-product-governance-registry`
- `/api/webhooks/eu-ai-act-art71-pmm-live`
- `/api/webhooks/eu-ai-act-live-registry`
- `/api/webhooks/eu-ai-office-conformity-sync`
- `/api/webhooks/experiment-cislunar-dtn-bundle`
- `/api/webhooks/experiment-dtn-bundle`
- `/api/webhooks/experiment-feature-stream`
- `/api/webhooks/experiment-feature-stream-flink`
- `/api/webhooks/experiment-heliopause-dtn-bundle`
- `/api/webhooks/experiment-holdout-ws-push`
- `/api/webhooks/experiment-scientist-proposal`
- `/api/webhooks/icao-imo-ai-aviation-registry`
- `/api/webhooks/iso-42001-cert-body-attest`
- `/api/webhooks/iso-iec-ai-standards-harmonization-registry`
- `/api/webhooks/itu-uncitral-digital-commerce-ai-registry`
- `/api/webhooks/nist-ai-rmf-live-control-feed`
- `/api/webhooks/oecd-state-ag-ai-transparency-mesh`
- `/api/webhooks/resend`
- `/api/webhooks/scim/experiment-auditor`
- `/api/webhooks/shopify/app-uninstalled`
- `/api/webhooks/shopify/orders-create`
- `/api/webhooks/shopify/orders-updated`
- `/api/webhooks/shopify/products-update`
- `/api/webhooks/slack/experiment-interactive`
- `/api/webhooks/stripe`
- `/api/webhooks/uber-direct`
- `/api/webhooks/uber-eats/orders`
- `/api/webhooks/uk-dsit-algorithmic-transparency`
- `/api/webhooks/un-ai-office-global-registry-mesh`
- `/api/webhooks/us-ftc-ai-transparency-live`
- `/api/webhooks/vertex-ml-model`
- `/api/webhooks/woocommerce`
- `/api/webhooks/wto-upu-cross-border-ai-trade-registry`

</details>

*121 experimental `/api/cron/*` stubs exist (compliance sandbox); not in `ALLOWED_PRODUCTION_CRON_SLUGS`.*

---
## Layer 7: Prisma Models

**301** models · **256** enums · `prisma/schema.prisma`

### Tier 1 models

| Model | Key fields |
|-------|------------|
| `KitchenSettings` | operatingMode, businessType, timezone, currency |
| `Order` | status, orderType, paymentMode, fulfillmentType, brandId |
| `RestaurantTable` | status, shape, positionX/Y, capacity |
| `PosTab` | tableId, status, subtotal/tax/tip/total |
| `PosTabItem` | productId, quantity, paidById |
| `PickupWindow` | dayOfWeek, startTime, endTime, capacity |
| `Brand` | slug, conceptKind, workspaceId |
| `Workspace` | name, type, ownerUserId |

<details><summary>All model names (301)</summary>

```
UserProfile
KitchenSettings
KitchenModulePreference
Menu
Product
Order
OrderItem
ProductionTask
ProductionBatch
ProductionWorkItem
ProductionStation
ProductionStagePreset
ProductionWorkEvent
ProductionTemplate
Subscription
BillingCustomer
UsageCounter
BillingEvent
InvoiceRecord
EntitlementOverride
NotificationLog
NotificationTemplate
NotificationEvent
NotificationPreference
IntegrationConnection
TrialState
LifecycleEvent
LifecycleEmail
CancellationFeedback
IntegrationHealthCheck
ApiKey
ExternalOrder
ExternalProduct
OrderChannel
WebhookEvent
WebhookProcessingJob
ErrorRecoveryItem
ChannelSyncJob
ChannelSetupProgress
ChannelCredentialAudit
ChannelImportBatch
ChannelImportRecord
ChannelConflict
ChannelRule
ChannelImportRollback
ChannelRetryAttempt
DeliveryDispatch
MenuChannelPublish
BetaApplication
BetaCohort
BetaLead
BetaInvitation
BetaFeedback
BetaLeadNote
DemoRequest
AppFeedback
OnboardingCall
UsageEvent
ActivationState
ReferralCode
ReferralEvent
OutreachCampaign
CustomerHealthSnapshot
ReleaseNote
UserTourState
Location
LocationAssignmentEvent
StorefrontSettings
StorefrontTeamInvite
StorefrontTeamInviteEvent
StorefrontEdgeSyncJob
StorefrontExperimentAuditEvent
StorefrontCartRecovery
StorefrontPage
StorefrontSection
StorefrontTheme
StorefrontOrder
StorefrontOrderItem
StorefrontContactSubmission
StorefrontDomain
StorefrontVisit
StorefrontConversionEvent
StorefrontBlackoutDate
StorefrontDiscount
StorefrontRedirect
StorefrontForm
StorefrontFormSubmission
StorefrontMenuPublish
StorefrontNavigation
StorefrontFooter
StorefrontFulfillmentRule
StorefrontAsset
ProductAvailability
StorefrontProductVariant
StorefrontModifierGroup
StorefrontModifierOption
StorefrontCustomer
MenuTemplate
Ingredient
Recipe
RecipeIngredient
CostSnapshot
CostingRun
ProfitabilityLine
CostComponent
LaborRate
PackagingItem
ProductPackagingRule
ChannelFeeRule
MarginRule
PriceScenario
IngredientDemandLine
IngredientDemandRun
IngredientDemandRunLine
InventoryStock
IngredientSubstitution
Supplier
SupplierItem
PurchaseOrder
PurchaseOrderLine
ReorderQueueItem
ReceivingEvent
SupplierPriceHistory
PurchaseApprovalEvent
NutritionProfile
AllergenProfile
IngredientDeclaration
LabelVerificationEvent
StaffMember
StaffRole
StaffAvailability
StaffShift
StaffCertification
StaffEvent
KitchenTask
KitchenTaskComment
KitchenTaskEvent
KitchenTaskTemplate
KitchenTaskDependency
KitchenTaskRecurrence
KitchenCustomer
CustomerAddress
CustomerNote
CustomerTimelineEvent
CustomerSegment
CustomerSegmentMembership
CustomerMergeCandidate
CustomerFollowUp
CustomerConsentEvent
CompanyAccount
CustomerSubscription
CateringQuote
CateringQuoteItem
CateringQuotePackage
CateringQuoteEvent
CateringQuoteVersion
CateringProposalView
CateringQuoteFollowUp
CateringQuoteTemplate
DeliveryRoute
DeliveryStop
DeliveryZone
DriverProfile
DeliveryEvent
PackingEvent
PackingBatch
PackingWave
PackingTask
LabelTemplate
PrintedLabel
PackingVerificationEvent
PackingVerificationSession
PackingVerificationItem
PackingQcEvent
PackingVerificationOverride
PackingScanEvent
NotificationRule
ImplementationProject
ImplementationPhase
ImplementationChecklistItem
ImplementationEvent
GoLiveReadinessCheck
ImplementationTask
ImportJob
ImportRowError
ImportJobPreviewRow
ImportRollback
ExportJob
DataTemplate
ImportMappingTemplate
ProductMapping
ProductMappingAlias
ProductModifierMapping
ProductMappingEvent
ProductMappingImportBatch
CustomerMergeEvent
StagedOrderImport
GoLiveTestRun
GoLiveProject
GoLiveChecklistItem
GoLiveSimulation
GoLiveApproval
GoLiveIncident
GoLiveRollbackPlan
GoLiveProjectEvent
TrainingProgram
TrainingModule
TrainingLesson
TrainingQuiz
TrainingQuizAttempt
TrainingAssignment
TrainingProgress
TrainingCertification
TrainingSimulation
TrainingSimulationRun
TrainingIncidentDrill
SOPDocument
SOPAcknowledgement
TrainingEvent
PartnerAccount
PartnerMember
PartnerClient
PartnerRevenue
PartnerManagedTicket
PartnerReferral
PartnerCommissionPlaceholder
Organization
OrganizationMember
Workspace
WorkspaceMember
Brand
AuditRetentionPolicy
AuditExport
AuditLog
SupportTicket
SupportTicketComment
SupportTicketEvent
SupportSlaPolicy
SupportSavedView
SupportMacro
PartnerLead
SalesInquiry
ImplementationStakeholder
ImplementationWave
ImplementationRisk
ImplementationSignoff
AdvisoryBoardApplication
AutomationRule
AutomationTrigger
AutomationAction
AutomationExecution
PlatformUserRole
ImpersonationSession
PlatformSupportSession
InternalNote
FeatureFlag
WorkspaceFeatureOverride
MealPlan
MealPlanCycle
MealPlanSelection
MealPlanEvent
MealPlanTemplate
AnalyticsSnapshot
AnalyticsEvent
AnalyticsSavedView
AnalyticsAlert
ForecastRun
ForecastLine
ForecastAdjustment
ForecastEvent
SavedReport
ExecutiveSnapshot
ExecutiveInsight
CopilotInsight
CopilotConversation
CopilotMessage
CopilotActionDraft
CopilotAuditEvent
Playbook
PlaybookStep
PlaybookRun
PlaybookRunStep
PlaybookEvent
WorkspaceTemplate
TemplateApplication
TemplateApplicationEvent
CopilotSettings
POSTerminal
POSRegister
POSShift
POSCart
POSTransaction
POSPayment
POSReceipt
POSHeldOrder
POSAuditEvent
PosInventoryImpactEvent
RestaurantTable
PosTab
PosTabItem
PickupWindow
```
</details>

---
## Layer 8: Utilities

**1020** files in `lib/`

| Directory | Files |
|-----------|------:|
| `lib/storefront/` | 272 |
| `lib/root/` | 64 |
| `lib/compliance/` | 58 |
| `lib/marketing/` | 31 |
| `lib/scope/` | 25 |
| `lib/orders/` | 20 |
| `lib/beta-ops/` | 18 |
| `lib/channels/` | 17 |
| `lib/billing/` | 15 |
| `lib/platform/` | 14 |
| `lib/experiment-production/` | 14 |
| `lib/storefront-builder/` | 14 |
| `lib/permissions/` | 13 |
| `lib/webhooks/` | 13 |
| `lib/analytics/` | 13 |
| `lib/import-export/` | 12 |
| `lib/audit/` | 12 |
| `lib/import-center/` | 11 |
| `lib/growth/` | 11 |
| `lib/integrations/` | 10 |
| `lib/pos/` | 10 |
| `lib/costing/` | 9 |
| `lib/crm/` | 9 |
| `lib/go-live/` | 9 |
| `lib/support/` | 9 |

### Key cross-cutting helpers

| Helper | Location |
|--------|----------|
| `safeInternalNextPath` | `lib/auth/` — open-redirect guard |
| `MODULE_REGISTRY_ENTRIES` | `lib/modules/module-registry.ts` |
| `FINAL_NAVIGATION_GROUPS` | `lib/navigation/final-navigation-groups.ts` |
| `ALLOWED_PRODUCTION_CRON_SLUGS` | `services/cron/production-manifest.ts` |
| `pathAllowedByModuleGate` | `lib/modules/module-gates.ts` |

---
## Layer 9: Infrastructure

| Asset | Path |
|-------|------|
| CI | `.github/workflows/ci.yml` |
| Vercel build | `scripts/vercel-build.sh` |
| Crons | `vercel.json` (12 paths) |
| Env template | `.env.example`, `.env.staging.template` |
| Ops | `scripts/ops/pilot-dashboard.sh`, `pilot-ready-check.sh`, `quick-acceptance.sh` |
| Docs | `docs/PHASE1_CLOSURE_19MAY2026.md`, `PHASE1_AND_TIER1_CLOSURE_19MAY2026.md` |

---
## Layer 10: Connection Matrices

### Tables
`page` `/dashboard/tables` → `actions/restaurant/tables.ts` → `RestaurantTable`

### POS Tabs
`page` `/dashboard/pos/tabs` → `actions/pos/tabs.ts` → `PosTab` / `PosTabItem` → `Order` on close

### Orders → Production → Packing → Routes
`/dashboard/orders` → `/dashboard/production` → `/dashboard/packing` → `/dashboard/routes`
Actions: orders, production, packing, delivery-route → Order, ProductionWorkItem, PackingTask

### Storefront checkout
`/s/[storeSlug]/checkout` → `actions/storefront-order.ts` → `services/storefront/` → Stripe webhooks

### Operating mode
`/dashboard/settings` → `updateKitchenOperatingMode` → affects `/dashboard/today`, `/dashboard/kitchen`, POS

### Meal plan renew
`/dashboard/meal-plans` → cron `meal-plan-auto-renew` → `services/meal-plans/`

---
## Sign-off

Full functional audit completed **20 May 2026**.

| Metric | Value |
|--------|------:|
| Modules | 23 |
| Pages | 617 |
| Actions | 634 |
| Services | 481 |
| Product APIs | 125 |
| Models | 301 |

*Catalog only — not a bug/security audit.*
