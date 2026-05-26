# Packing & Labels module audit

## Scope

- Route: `/dashboard/packing` (command center + exports).
- Related: `/dashboard/packing/verify`, `/dashboard/nutrition-labels`, `/dashboard/production`, `/dashboard/order-hub`.
- Data: `Order` / `OrderItem` / `Product`, legacy `PackingEvent`, new `PackingBatch`, `PackingTask`, `PackingWave`, `LabelTemplate`, `PrintedLabel`, `PackingVerificationEvent`.

## Current state (post-upgrade)

| Area | Current state |
|------|----------------|
| `/dashboard/packing` | Server-driven **Packing Command Center**: KPIs, date/mode/fulfillment controls, queue generation, task actions, tabs (queue, waves, customer, route, window, labels, verification, exports, reports link). |
| Production | Unchanged contract: orders still drive packing; generation reads **CONFIRMED / PREPARING / READY** orders. |
| Order hub | Still the source of orders; fulfillment filter narrows the pipeline slice shown. |
| Packing verify | Route `/dashboard/packing/verify` unchanged; command center links to it and logs `PackingVerificationEvent` on **Mark verified**. |
| Nutrition labels | Module at `/dashboard/nutrition-labels`; linked from Labels tab with compliance disclaimer. |
| PDF/CSV | Preserved in **Exports** tab via `PackingExportsPanel` (same jsPDF + autotable + CSV logic as before). |
| Empty state | **Business-type aware** copy via `packingEmptyStateForBusiness` + `EmptyState` CTAs. |
| Pickup / delivery | Fulfillment filter + lane summary card; task cards show `fulfillmentType`. |
| Label generation | **Placeholder**: `PrintedLabel` requires a `LabelTemplate` FK; UI counts templates and “log label printed” updates task only. |
| Allergen / nutrition | Product allergens JSON on task; flags `requiresAllergenCheck` / `requiresNutritionLabel`; disclaimer in Verification tab. |
| Staff permissions | Not yet enforced per-role on packing actions (follow-up); platform superadmin unchanged globally. |
| Mobile / tablet | Large tap targets (`min-h-11` / `min-h-12`), stacked cards, scrollable tabs. |

## Issues → recommendations

| Issue | Why limiting | Affected modes | Fix | Priority |
|-------|----------------|----------------|-----|----------|
| Queue generation is order-centric only | Catering-only or event-only loads not modeled yet | Catering, Bar event | Add sources (events, manual batch) in generator | P1 |
| No route auto-assignment | Delivery grouping weak | Delivery, meal prep routes | Join `DeliveryStop` / route planner | P1 |
| `PrintedLabel` needs template | Cannot persist print audit without seed templates | All | Seed default templates or optional template-less audit row | P1 |
| Waves lack task assignment UI | Waves are names only | Waves | UI to attach tasks + progress | P1 |
| KPI “late/risk” is zero | No SLA fields | All | Add promised time + risk scoring | P2 |
| Role-based packing ACL | Everyone with dashboard access can act | Multi-site | Wire `StaffMember.role` + RLS-style checks in actions | P1 |
| Reports page is minimal | Ops need trends | All | Extend aggregates + charts | P2 |
| No export history | Compliance / ops audit | All | `ExportJob` table + downloadedAt | P3 |

## P0 critical

- **None open** for regressions: legacy `packing_events` retained; verify route untouched; exports preserved.

## Summary

The page is no longer export-only: it exposes **tasks, waves hooks, verification events, and KPIs** while keeping **existing PDF/CSV** and **Packing Verify** behavior intact.
