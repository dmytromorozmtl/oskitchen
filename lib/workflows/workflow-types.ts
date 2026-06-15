/**
 * Canonical FoodOps phases — UI + planning layer. Persists via `Order.status` + `Order.statusDetail`
 * (see `lib/orders/order-status.ts`). Do not rename without updating mappers.
 */
export const FOOD_OPS_PHASE_IDS = [
  "ORDER_CREATED",
  "ORDER_CONFIRMED",
  "PRODUCTION_PLANNED",
  "IN_PRODUCTION",
  "READY_FOR_PACKING",
  "PACKING",
  "PACKED",
  "READY_FOR_PICKUP",
  "OUT_FOR_DELIVERY",
  "COMPLETED",
  "CANCELLED",
] as const;

export type FoodOpsPhaseId = (typeof FOOD_OPS_PHASE_IDS)[number];

/** Operational overlays — not mutually exclusive with phase; drive alerts and Today blockers. */
export const WORKFLOW_BRANCH_IDS = [
  "CANCELLED",
  "REFUNDED_PLACEHOLDER",
  "BLOCKED",
  "ON_HOLD",
  "NEEDS_MAPPING",
  "NEEDS_CUSTOMER_INFO",
  "NEEDS_PAYMENT",
  "NEEDS_ADDRESS",
  "NEEDS_PRODUCTION",
  "NEEDS_PACKING",
  "NEEDS_ROUTE",
] as const;

export type WorkflowBranchId = (typeof WORKFLOW_BRANCH_IDS)[number];

export type WorkflowTransitionPlan = {
  fromPhase: FoodOpsPhaseId;
  toPhase: FoodOpsPhaseId;
  /** Human-readable guard failures — transition must not apply if non-empty. */
  guardFailures: string[];
  /** Suggested audit action key (caller maps to AuditLog.action). */
  auditAction: string;
  irreversible: boolean;
};
