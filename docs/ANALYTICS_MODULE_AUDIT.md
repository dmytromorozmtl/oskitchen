# Analytics module audit (KitchenOS)

**Date:** 2026-05-11
**Scope:** `/dashboard/analytics`, related `Order`, `ExternalOrder`,
`ProductionBatch`, `PackingBatch`, `DeliveryStop`, `KitchenCustomer`,
`MealPlan`, `CateringQuote`, `Ingredient*`, `Recipe*`, `Brand`,
`Location`, `IntegrationConnection` models.

## TL;DR

The current `/dashboard/analytics` page is a placeholder showing two
counters (internal/external orders) and a roadmap card. Every promised
KPI ("revenue by channel, AOV, repeat rate, late orders, packing
completion, weekly trends") is **un-implemented**. There is no
revenue/aggregation engine, no executive overview, no per-tab analytic
surface, no role-based gating beyond `PlanGate`, no snapshots, no
saved views, no alerts, no forecasting, no business-mode adaptation,
no exports.

This project ships a real Operational Intelligence & Executive
Analytics Center built **purely on data already in the DB** —
`orders`, `external_orders`, `production_batches`, `packing_batches`,
`delivery_stops`, `meal_plans`, `catering_quotes`, `kitchen_customers`,
`ingredient_*`. No synthetic numbers, no fake integrations.

## Findings

| #  | Area | Current state | Limitation | Affected business types | Business impact | Recommended fix | Pri |
|----|------|---------------|------------|--------------------------|-----------------|-----------------|-----|
| 1  | Page | One placeholder route, two count widgets, a roadmap card | No KPIs, no charts, no filters | All | Cannot answer any of the 10 strategic questions | Ship Command Center at `/dashboard/analytics` with subnav, KPI cards, charts, drilldowns | P1 |
| 2  | Revenue logic | None | No gross / net revenue, no fees, no discounts | All | Owners can't tell how much they made | New `lib/analytics/revenue-metrics.ts` — sum `orders.total` for completed statuses plus `external_orders.total` when imported separately; de-dupe imported orders that reference an `imported_order_id` | P0 |
| 3  | Channel attribution | Implicit only (Order.channelImportBatchId + ExternalOrder.provider) | No unified channel taxonomy, no revenue/order share | All | Owners can't see channel mix | New `lib/analytics/channel-attribution.ts` — STOREFRONT / MANUAL / WOOCOMMERCE / SHOPIFY / UBER_EATS / UBER_DIRECT / OTHER inferred from each order's joined data | P0 |
| 4  | AOV / repeat / new | None | No formula | All | Sales decisions made blind | `lib/analytics/customer-metrics.ts` — AOV = revenue/orders; new = customers with first order in window; repeat rate = repeat customers / customers with order; LTV from `kitchen_customers.lifetimeValueCents` | P0 |
| 5  | Production metrics | None | Cannot see completion / bottlenecks | Catering, Meal prep, Restaurant | Quality risk | `lib/analytics/operational-metrics.ts` — completionRate = SUM(completedItems)/SUM(totalItems), late % = COUNT(productionDate<today AND status!=COMPLETED) | P1 |
| 6  | Packing metrics | None | Same | Meal prep, Catering, Bakery | Quality risk | Same source for `packing_batches`: packedItems / totalItems | P1 |
| 7  | Delivery metrics | None | Cannot see on-time, failed | Meal prep, Catering | Customer experience | `delivery_stops` aggregates by status (DELIVERED / FAILED / OUT_FOR_DELIVERY / RETURNED) | P1 |
| 8  | Catering / Meal plan rollup | None | Owners don't see contribution | Catering, Meal prep | Revenue allocation | Sum `catering_quotes.total` by status; sum derived order totals for meal-plan-generated orders | P1 |
| 9  | Forecasting | None | Cannot plan | All | Staffing/inventory waste | `lib/analytics/forecasting.ts` — moving average + recurring meal plan demand + accepted catering events. Clearly labeled `estimate`. | P2 |
| 10 | Alerts | None | Operators don't see warnings | All | Operational risk | `lib/analytics/alerts.ts` — rule-based, NO AI, explainable; thresholds stored in `AnalyticsAlert` | P2 |
| 11 | Saved views | None | Owners re-pick filters | All | UX | `AnalyticsSavedView` table; "Save view" button stores filters JSON; presets available | P2 |
| 12 | Snapshots | None | Heavy queries every page load | All | Performance | `AnalyticsSnapshot` table — owners can snapshot a window; surface "last refreshed" tag | P1 |
| 13 | Permissions | `PlanGate` only | Same numbers shown to all roles | All | Privacy | `lib/analytics/analytics-permissions.ts` — restrict cost/margin/CRM details to admin/manager/accountant; superadmin override | P0 |
| 14 | Performance | Counts only | Each new chart could load entire tables | All | Slow page | Use `groupBy`, `aggregate`, indexed `where { userId, createdAt:{gte,lte} }` filters; snapshot tables for heavy reports | P1 |
| 15 | Filters | None | Cannot drill | All | UX | Query-string driven `from`, `to`, `channel`, `brandId`, `locationId`, `fulfillmentType`, `mealPlanOnly`, `cateringOnly` | P1 |
| 16 | Exports | None | Cannot share | All | UX | CSV server actions for revenue, orders, channels | P2 |
| 17 | Empty states | Generic "collect data first" | Lacks CTAs | All | Polish | Per-tab empty states + forecast empty state when too little history | P2 |
| 18 | Business mode | Hard-coded "Analytics" title | All verticals look the same | Bar / Bakery / Café / Catering / Meal Prep / Ghost Kitchen | Brand mismatch | `analyticsTerminologyForMode` helper analogous to CRM/Meal Plans/Catering | P2 |
| 19 | Forecast surface | Existing `/dashboard/forecast` route exists but unrelated | Confusing IA | All | UX | Keep `/dashboard/forecast` untouched; reference it from the new Analytics center | P3 |
| 20 | Multi-brand / multi-location | Not modeled in metrics | Ghost kitchens can't compare brands | Ghost Kitchen / Multi-brand | Insight loss | Brand & Location filters + per-brand revenue charts | P1 |
| 21 | PII safety | Storefront orders show customer emails | No masking | All | Privacy | Reuse existing `maskEmail` / `maskPhone` on lists; never expose raw lists outside the customer detail UI | P0 |
| 22 | Synthetic data | None today (good) | n/a | All | n/a | **Constraint** — never invent revenue, customers, or trends; render an empty state when source rows are missing | P0 |

## Priority legend

- **P0** — Data correctness, role/privacy safety, no synthetic numbers.
- **P1** — Core analytic value (revenue / orders / channels / production / packing / delivery / brand mix).
- **P2** — Forecasting / alerts / saved views / exports / business-mode terminology.
- **P3** — Future deeper integrations (GA4 / Stripe / QuickBooks placeholders, not implemented).
