# Purchasing architecture

## Layers

1. **Types & rules** — `lib/purchasing/purchase-order-types.ts`, `supplier-types.ts`, `reorder-rules.ts`, `purchasing-calculations.ts`, `purchasing-status.ts`.
2. **Service** — `services/purchasing/purchasing-service.ts` aggregates demand + procurement tables for the command center.
3. **Actions** — `app/dashboard/purchasing/actions.ts` — server mutations (reorder seed, supplier create, draft PO).
4. **UI** — `app/dashboard/purchasing/layout.tsx` + `PurchasingSubnav` + nested routes under `/dashboard/purchasing/*`.
5. **Demand** — Still `loadDemandCommandCenterPayload` for rollup parity with Ingredient Demand.

## Flow (target)

Demand/shortage → reorder queue → draft PO by supplier → review → sent → receiving → stock + price history (receiving/stock hooks pending).
