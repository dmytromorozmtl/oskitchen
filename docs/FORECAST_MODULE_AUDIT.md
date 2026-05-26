# Forecast module audit (KitchenOS)

**Date:** 2026-05-11
**Scope:** `/dashboard/forecast`, `services/forecasting/production-forecast.ts`,
and the surrounding planning surfaces it must integrate with —
Menus (`Menu`, `Product`), Menu Planner, Orders (`Order`, `OrderItem`),
Production (`ProductionBatch`), Packing (`PackingBatch`),
Routes (`DeliveryRoute`, `DeliveryStop`), Meal Plans (`MealPlan`,
`MealPlanCycle`), Catering Quotes (`CateringQuote`, `CateringQuoteItem`),
Ingredient Demand (`Ingredient`, `Recipe`, `RecipeIngredient`,
`IngredientDemandRun`).

## TL;DR

Today's `/dashboard/forecast` is a single-screen production forecast
that is **hard-locked to two requirements**: (a) the workspace must
have an **active weekly menu**, and (b) it only considers the last 21
days of internal `Order` rows. That excludes restaurants, cafés, bars,
bakeries, catering shops, and ghost kitchens whose primary signal isn't
"this week's menu". It also produces no manual adjustment surface, no
buffer settings, no integration with Production / Ingredient Demand /
Routes, no history, and no business-mode adaptation.

This project ships a real Forecast & Planning Center built on the data
already in the DB. Forecasts are deterministic and explainable; we
never claim ML/AI predictions, and the UI everywhere labels output as
an estimate.

## Findings

| #  | Area | Current state | Limitation | Affected business types | Recommended fix | Pri |
|----|------|---------------|------------|--------------------------|-----------------|-----|
| 1  | Page | Single screen, table of products with buffer | No filters, no tabs, no run history, no manual adjustments | All | Ship Command Center at `/dashboard/forecast` with subnav and 10 tabs | P1 |
| 2  | Hard active-menu requirement | `if (!activeMenu) → empty state` | Restaurant / Café / Bar / Bakery / Catering workspaces have no "active weekly menu" model | All except Meal Prep | Conditional empty state — only Meal Prep nudges to set an active menu; everyone else can still forecast from history, meal plans, catering events, or manual planning | P0 |
| 3  | Forecast logic | 21-day window, weekly average × 1.08, fixed 10% buffer | Doesn't consider same-weekday history, meal plan committed demand, accepted catering events, or manual adjustments | All | Calculation engine that combines simple-MA + same-weekday-MA + meal-plan-committed + catering-accepted + manual adjustments, with transparent source breakdown | P0 |
| 4  | Forecast types | Production only | Operators also need order/ingredient/route/packing/staffing/catering/meal-plan/channel forecasts | All | New `ForecastType` enum (`ORDER_DEMAND`, `PRODUCT_DEMAND`, `PRODUCTION_LOAD`, `INGREDIENT_DEMAND`, `STAFFING_LOAD`, `PACKING_LOAD`, `ROUTE_LOAD`, `CATERING_LOAD`, `MEAL_PLAN_LOAD`, `CHANNEL_DEMAND`) | P1 |
| 5  | Persistence | No persistence — re-runs on every page load | Cannot compare runs, audit decisions, or send to downstream modules | All | `ForecastRun` + `ForecastLine` + `ForecastAdjustment` + `ForecastEvent` tables | P0 |
| 6  | Manual adjustments | None | Operators can't model a holiday, rain day, or corporate order | All | `ForecastAdjustment` with PERCENT / FIXED_QUANTITY / OVERRIDE types and audit trail | P1 |
| 7  | Buffer configuration | Hard-coded 10% | Cannot tune buffer per category, business, or high-risk SKU | All | `lib/forecast/forecast-buffers.ts` defaults per business mode + per-run override + future product-level rules | P1 |
| 8  | Confidence labelling | `low`/`medium`/`high` derived only from order count | No notion of MANUAL or combined-source confidence | All | `lib/forecast/forecast-confidence.ts` — LOW / MEDIUM / HIGH / MANUAL | P2 |
| 9  | Source attribution | Only "recent KitchenOS orders" | Operators can't see why a number was suggested | All | Each `ForecastLine` carries `sourceSummaryJson` describing contributions | P1 |
| 10 | Integration with Production | None | Forecast has no "send to production" action | Meal Prep, Catering, Restaurant | Server action that copies recommended quantities into a `ProductionBatch` (creates draft) | P1 |
| 11 | Integration with Ingredient Demand | None | Forecast has no "send to ingredient demand" action | All | Server action that copies forecasted product quantities into an `IngredientDemandRun` draft | P1 |
| 12 | Catering integration | None | Accepted events do not shift forecast | Catering, Restaurant, Bakery, Meal Prep | Source `ACCEPTED_CATERING_EVENTS` — pulls quotes with status `ACCEPTED` / `CONVERTED_TO_ORDER` whose `eventDate` falls in window | P1 |
| 13 | Meal Plan integration | None | Recurring committed demand is ignored | Meal Prep | Source `MEAL_PLANS` — pulls `MealPlanCycle` rows with status `READY_TO_GENERATE` / `NEEDS_SELECTION` whose `cycleStartDate` falls in window | P1 |
| 14 | Channel awareness | None | Forecast can't be filtered to Storefront / WooCommerce / etc. | All | Reuse `lib/analytics/channel-attribution.ts` to bucket history by channel; channel filter on the run | P2 |
| 15 | Brand / Location awareness | None | Multi-brand operators can't forecast a brand or location separately | Ghost Kitchen, Multi-brand, Multi-location | `ForecastRun.brandId` + `ForecastRun.locationId`; filters applied at history aggregation | P1 |
| 16 | History | None | Cannot compare runs across time | All | Persisted runs + history list + per-run detail view | P1 |
| 17 | Permissions | Plan gate only | Same forecast visible to every role | All | `lib/forecast/forecast-permissions.ts` — owner/admin/manager/kitchen_lead/purchasing/viewer + superadmin override | P0 |
| 18 | Performance | findMany(400 orders) and a Map fold | OK at small scale; not bounded for large workspaces | All | Bound history pulls to a sensible window; persist results so we don't recompute on each page render | P2 |
| 19 | UX disclaimer | One sentence | Operators may treat output as a forecast guarantee | All | Render "Estimate" badges in every header, KPI card, and CSV export | P1 |
| 20 | Business-mode adaptation | None | Bakery preorders, Bar event prep, Café AM rush all look identical | All except Meal Prep | `forecastTerminologyForMode` helper for header text and default sources | P2 |

## Priority legend

- **P0** — Core correctness (don't require an active menu; persist runs; gate access).
- **P1** — Core planning value (multi-source calc, integrations, history, manual adjustments).
- **P2** — Polish (channel filters, terminology, performance bounding).
- **P3** — Future (forecast vs actual accuracy reporting; recurring scheduled runs).
