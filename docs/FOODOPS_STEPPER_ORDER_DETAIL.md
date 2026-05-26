# FoodOps stepper on Order Detail

## Goal

Expose the operational chain on `/dashboard/orders/[orderId]` Overview without duplicating lifecycle rules.

## Implementation

- Service: `buildFoodopsWorkflowView` in `services/workflows/foodops-workflow-service.ts` (pure, Prisma-free) fed by `loadOrderDetailPageData`.
- UI: `OrderWorkflowSummaryCard` + `FoodopsWorkflowStepper` (`components/orders/*`).
- Steps: Intake → Product mapping → Fulfillment info → Production → Packing → Route/Pickup → Customer/CRM → Analytics.
- Status vocabulary: `complete | current | blocked | not_required | pending` with POS pickup-now exempt from false pickup-date requirements via `requiresScheduledServiceDate`.

## QA checklist

1. POS walk-in: fulfillment info `not_required` when scheduling not required.
2. Scheduled pickup missing date: blocker surfaces on fulfillment step.
3. Delivery missing address: blocker on fulfillment step.
4. Guest CRM: `not_required` with honest copy — not a fake blocker.
5. No UUIDs as primary labels in the stepper (packing tab also uses ordinal labels).
