# Order lifecycle engine

## Current implementation (code)

- **Types & stages:** `lib/orders/order-lifecycle-types.ts` — operational `OrderLifecycleStage` on top of Prisma `OrderStatus` (`PENDING` | `CONFIRMED` | `PREPARING` | `READY` | `COMPLETED` | `CANCELLED`).
- **Derivation:** `lib/orders/order-lifecycle-status.ts` — `deriveOrderLifecycleStage`.
- **Guards / transitions:** `lib/orders/order-lifecycle-guards.ts`, `lib/orders/order-lifecycle-transitions.ts`, `lib/orders/order-lifecycle-actions.ts`.
- **Blockers:** `lib/orders/order-blockers.ts`, `services/orders/order-blocker-service.ts`.
- **Read model:** `services/orders/order-lifecycle-service.ts` — `getOrderLifecycleView`.

## Rules (enforced pattern)

1. **Invalid confirm** — handled at order mutation layer + guards (see transition module).
2. **Unmapped items** — blocker `UNMAPPED_PRODUCTS` + channel conflict counts.
3. **Delivery without address** — `MISSING_DELIVERY_ADDRESS` blocker.
4. **Packing before production** — `PRODUCTION_NOT_COMPLETE` / packing statuses in blocker service.
5. **Audit** — status mutations must continue to write audit / activity rows (verify in order actions).

## Gap vs aspirational enum

The brief lists granular statuses (e.g. `OUT_FOR_DELIVERY`). **Today:** expressed via **stage derivation** + related tables (routes, packing tasks), not only `OrderStatus`. **Improvement:** surface stage + DB status together on Order Detail tabs.

## Priority

- **P1** — Order Detail “super page” alignment.
- **P2** — Optional Prisma enum expansion (high migration cost — treat as enterprise milestone).
