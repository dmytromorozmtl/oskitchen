# KitchenOS — Platform Completion Audit

**Scope:** Full-surface cohesion pass (routes preserved, no fake integrations).  
**Date:** 2026-05-13  
**Legend:** COMPLETE · FUNCTIONAL BUT SHALLOW · PLACEHOLDER · BROKEN/RISKY · NEEDS CONNECTION

## Executive summary

KitchenOS has broad module coverage. The largest gap is **cross-module narrative** (one operating story) rather than missing URLs. This audit classifies representative modules and records **priority** for follow-up.

| Priority | Meaning |
|----------|---------|
| P0 | Production blocker |
| P1 | MVP blocker |
| P2 | Polish / cohesion |
| P3 | Future |

## Core operational spine

| Module | Route | Classification | Notes | Priority |
|--------|-------|------------------|-------|----------|
| Today | `/dashboard/today` | FUNCTIONAL BUT SHALLOW → **upgraded** | Now loads `loadTodayCommandCenter`: KPIs, blockers, readiness, queues | P2 |
| Dashboard | `/dashboard` | FUNCTIONAL BUT SHALLOW | Home overview KPIs; not duplicate of Today | P2 |
| Orders | `/dashboard/orders` | NEEDS CONNECTION | **New** `/dashboard/orders/[orderId]` detail | P1 |
| Order Hub | `/dashboard/order-hub` | FUNCTIONAL BUT SHALLOW | Needs tighter linkage from Today blockers | P2 |
| Calendar | `/dashboard/calendar` | FUNCTIONAL BUT SHALLOW | Aggregates entities; deep links vary | P2 |

## Kitchen & fulfillment

| Module | Route | Classification | Priority |
|--------|-------|------------------|----------|
| Production | `/dashboard/production` | FUNCTIONAL BUT SHALLOW | **New** batch detail `/dashboard/production/batches/[batchId]` | P2 |
| Packing | `/dashboard/packing` | FUNCTIONAL BUT SHALLOW | P2 |
| Packing verify | `/dashboard/packing/verify` | FUNCTIONAL BUT SHALLOW | P2 |
| Kitchen screen | `/dashboard/kitchen` | FUNCTIONAL BUT SHALLOW | Realtime TBD | P2 |
| Routes | `/dashboard/routes` | FUNCTIONAL BUT SHALLOW | Detail exists | P2 |
| Nutrition labels | `/dashboard/nutrition-labels` | FUNCTIONAL BUT SHALLOW | P3 |

## Catalog & commerce

| Module | Route | Classification | Priority |
|--------|-------|------------------|----------|
| Menus | `/dashboard/menus` | FUNCTIONAL BUT SHALLOW | P2 |
| Menu items | `/dashboard/products` | NEEDS CONNECTION | **New** `/dashboard/products/[productId]` | P1 |
| Storefront | `/dashboard/storefront` | FUNCTIONAL BUT SHALLOW | P2 |
| Sales channels | `/dashboard/sales-channels` | FUNCTIONAL BUT SHALLOW | **New** `/dashboard/sales-channels/connections/[connectionId]` | P2 |

## Integrations & data

| Module | Route | Classification | Priority |
|--------|-------|------------------|----------|
| Webhooks | `.../sales-channels/webhooks` | FUNCTIONAL BUT SHALLOW | Surfaces in Today + error recovery | P2 |
| Import center | `/dashboard/import-center` | FUNCTIONAL BUT SHALLOW | Job detail under `jobs/[jobId]` | P2 |
| Product mapping | `/dashboard/product-mapping` | FUNCTIONAL BUT SHALLOW | P2 |
| **Error recovery** | `/dashboard/error-recovery` | **NEW** | Aggregates failure surfaces | P1 |
| **Data integrity** | `/dashboard/system-health/data-integrity` | **NEW** | Rule-based checks | P1 |

## People & GTM

| Module | Route | Classification | Priority |
|--------|-------|------------------|----------|
| CRM | `/dashboard/customers` | FUNCTIONAL BUT SHALLOW | Alias `/dashboard/crm/customers/[id]` | P2 |
| Staff | `/dashboard/staff` | FUNCTIONAL BUT SHALLOW | RBAC expansion TBD | P2 |
| Support | `/dashboard/support` | FUNCTIONAL BUT SHALLOW | Ticket detail exists | P2 |

## Strategy & insights

| Module | Route | Classification | Priority |
|--------|-------|------------------|----------|
| Analytics / Reports / Executive | various | FUNCTIONAL BUT SHALLOW | Needs shared “insight cards” pattern | P3 |
| Forecast | `/dashboard/forecast` | FUNCTIONAL BUT SHALLOW | P3 |
| AI Copilot | `/dashboard/copilot` | FUNCTIONAL BUT SHALLOW | P3 |

## Admin & platform

| Module | Route | Classification | Priority |
|--------|-------|------------------|----------|
| Settings | `/dashboard/settings` | FUNCTIONAL BUT SHALLOW | Readiness also surfaces here (service reusable) | P2 |
| Billing | `/dashboard/billing` | FUNCTIONAL BUT SHALLOW | Stripe-gated safely elsewhere | P1 |
| Platform | `/platform/*` | COMPLETE (guard) | `requirePlatformAccess` keeps clients out | P0 |
| Audit logs | `/dashboard/audit-logs` | FUNCTIONAL BUT SHALLOW | Activity timeline consumes same store | P2 |

## Cross-cutting risks

1. **RBAC:** Prisma `UserRole` is still `OWNER | STAFF`. Expanded role vocabulary is staged in `lib/permissions/*` — enforcement must stay server-side. **P1**
2. **Realtime:** Hot paths still navigation-based refresh; architecture documented — **P2**
3. **Demo data:** Conservative stub `services/demo/demo-seed-service.ts` — **P3**
4. **Workflow:** FoodOps phase graph added in TypeScript; DB still authoritative via `Order` + `statusDetail` — callers must audit on mutation. **P1**

## Founder / superadmin

`workspace.moroz@gmail.com` remains wired through `lib/platform-owner.ts` + billing bypass; unchanged by this layer.
