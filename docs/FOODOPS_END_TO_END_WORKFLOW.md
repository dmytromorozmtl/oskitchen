# FoodOps End-to-End Workflow

## Canonical chain

**POS / Manual / Storefront / Channel → Order Hub → Product Mapping → Order Detail → Production → Packing → Route or Pickup → CRM → Analytics → Forecast → Ingredient Demand → Purchasing**

## Services (code)

| Concern | Path |
|---------|------|
| Blockers | `services/orders/order-blocker-service.ts` |
| Lifecycle view | `services/orders/order-lifecycle-service.ts` |
| Next actions | `services/orders/order-next-action-service.ts` |
| Chain summary | `services/workflows/foodops-workflow-service.ts` (`buildFoodopsWorkflowView`, `summarizeFoodopsWorkflowForOrder`) |
| Activity | `services/activity/activity-service.ts` |
| Audit | `services/audit/audit-service.ts` |

## Order truth model

Every order should surface: **source**, **DB status**, **derived operational stage**, **blockers**, **primary next action**, **activity**, **audit** (permission gated), and **downstream impact hints** (production/packing/route).

## Blocker catalog

Aligned with `lib/orders/order-blockers.ts` + guards — includes POS transaction / receipt integrity for POS sales.

## Demo / QA

Use `buildFoodopsWorkflowView` on Order Detail (server) or `summarizeFoodopsWorkflowForOrder` when you only have ids — same blockers as lifecycle, no duplicated rules.
