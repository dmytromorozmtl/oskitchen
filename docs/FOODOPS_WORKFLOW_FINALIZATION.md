# FoodOps workflow finalization

This document aligns the **commercial FoodOps narrative** (intake → analytics) with the **implemented TypeScript services** in OS Kitchen. It is descriptive of current code; gaps are called out explicitly.

## Canonical chain (product language)

1. **Intake** — Order captured (POS, storefront, manual, import, meal plan, catering conversion).
2. **Mapping** — External channel lines mapped to internal catalog (when applicable).
3. **Confirmation** — Order moves from `PENDING` to confirmed operational acceptance (status + blockers cleared).
4. **Production** — Kitchen / production work items.
5. **Packing** — Labels, verification, QC.
6. **Fulfillment** — Pickup, delivery, routes, handoff.
7. **CRM** — Customer profile linkage and follow-up context.
8. **Analytics** — Closed-loop revenue and operational KPIs.

## Implementation mapping (`services/workflows/foodops-workflow-service.ts`)

The UI stepper uses **eight steps** with these IDs and labels:

| Product stage   | Code step id        | Notes |
|----------------|---------------------|--------|
| Intake         | `intake`            | Derived from `OrderStatus` and creation metadata. |
| Mapping        | `product_mapping`   | Required only when a channel import / external linkage exists; `UNMAPPED_PRODUCTS` blocker drives **blocked**. |
| Confirmation   | *(combined)*       | **Not a separate step in code.** Confirmation is implied when intake is **complete** (non-`PENDING`) and mapping + fulfillment prerequisites are satisfied. A dedicated confirmation step can be added later without breaking routes by splitting `intake` UI only. |
| *(scheduling)* | `fulfillment_info`  | Named “Fulfillment info” in UI — pickup date, delivery address, POS scheduled intent (`lib/fulfillment/fulfillment-requirements.ts`). |
| Production     | `production`        | From `productionWorkItems`. |
| Packing        | `packing`           | From `packingTasks`. |
| Fulfillment    | `route_pickup`      | Delivery stops vs pickup; label is “Route / Pickup”. |
| CRM            | `crm`               | `customerId` present → **complete**; guest → **not_required** (honest, not a blocker). |
| Analytics      | `analytics`         | Completes when order reaches terminal analytics-friendly state (`COMPLETED` in current logic). |

## Order surfaces (every order should expose)

| Concern | Primary implementation |
|---------|-------------------------|
| **Source** | `creationSource`, `orderType`, `channelImportBatch`, `channelTraceJson` |
| **Lifecycle status** | `services/orders/order-lifecycle-service.ts` + Prisma `OrderStatus` |
| **Operational state** | Lifecycle view + FoodOps stepper statuses (`complete` / `current` / `blocked` / `not_required` / `pending`) |
| **Blockers** | `services/orders/order-blocker-service.ts` → `lib/orders/order-blockers.ts` |
| **Next action** | `services/orders/order-next-action-service.ts` |
| **FoodOps stepper** | `buildFoodopsWorkflowView` / `summarizeFoodopsWorkflowForOrder` |
| **Activity timeline** | `services/activity/activity-service.ts` (reads `auditLog` rows for entity) |
| **Audit trail** | `services/audit/audit-service.ts` (central writer, redaction) |
| **Production / packing / fulfillment** | Stepper + dedicated dashboard modules |
| **CRM link** | Order `customerId` → CRM routes (when linked) |
| **Analytics attribution** | Order completion + reporting pipelines (maturity varies by workspace data) |
| **Support link** | Support module + order reference in tickets (where wired) |

## Stage contract (for UI and API consumers)

For each FoodOps step row, the UI should continue to show:

- **Status** — `complete` | `current` | `blocked` | `not_required` | `pending` (see `FoodopsUiStatus`).
- **Explanation** — Human-readable string from builder (no fake integration claims).
- **Next action** — Prefer primary next action from `resolveOrderNextActionBundle` when step is `current`.
- **Fix route** — `fixHref` from blocker or sensible default `/dashboard/orders/[id]`.
- **Related entity link** — Mapping → product mapping; production → production board; packing → packing; routes → routes.

## P0 / P1 follow-ups (honest backlog)

- **P1:** Split **Confirmation** into its own stepper node when product/design requires it (keep backward-compatible step IDs or version the stepper component).
- **P1:** Enrich `activity-service` action dictionary as new `auditLog.action` values are added (partially done in this pass).
- **P2:** Link support tickets from order detail with stable deep links everywhere.

## Related code

- `services/workflows/foodops-workflow-service.ts`
- `services/orders/order-lifecycle-service.ts`
- `services/orders/order-next-action-service.ts`
- `services/orders/order-blocker-service.ts`
- `services/activity/activity-service.ts`
- `services/audit/audit-service.ts`
