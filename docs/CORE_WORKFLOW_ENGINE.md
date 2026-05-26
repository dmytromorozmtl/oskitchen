# Core FoodOps Workflow Engine

## Purpose

Canonical **phase vocabulary** + **guards** aligned to persisted `Order.status` and widened `Order.statusDetail` (`lib/orders/order-status.ts`). This avoids a destructive enum migration while giving product + analytics a single language.

## Code map

| Path | Responsibility |
|------|------------------|
| `lib/workflows/workflow-types.ts` | Phase + branch ids |
| `lib/workflows/workflow-status.ts` | Map DB order → widened key → phase |
| `lib/workflows/workflow-transitions.ts` | Happy-path graph + allowed targets |
| `lib/workflows/workflow-guards.ts` | Preconditions + operational “branches” |
| `lib/workflows/workflow-actions.ts` | Side-effect hints + operator copy |
| `services/workflows/workflow-service.ts` | `planFoodOpsTransition`, persistence hints |

## Mutation policy

`planFoodOpsTransition` is **pure**. Production code that changes orders must:

1. Call the planner and block when `guardFailures.length > 0`.
2. Persist via existing order services / actions.
3. Call `auditLog` from `services/audit/audit-service.ts` with redacted payloads.
4. Optionally enqueue notifications / tasks — never silently for irreversible steps.

## Branches vs phases

Branches (`NEEDS_ADDRESS`, `NEEDS_PAYMENT`, …) are **derived signals** for Today / alerts. They are not a second lifecycle enum.
