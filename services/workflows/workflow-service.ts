import type { OrderStatus } from "@prisma/client";

import { toDbOrderStatus, type OrderStatusKey } from "@/lib/orders/order-status";
import { describeTransitionForOperators, sideEffectsForTransition } from "@/lib/workflows/workflow-actions";
import {
  listActiveBranchesForOrder,
  listTransitionGuardFailures,
  type OrderGuardContext,
} from "@/lib/workflows/workflow-guards";
import { allowedTargetPhases, isTerminalPhase, nextHappyPathPhase } from "@/lib/workflows/workflow-transitions";
import { foodOpsPhaseFromOrder, resolveOrderStatusKey } from "@/lib/workflows/workflow-status";

import type { FoodOpsPhaseId, WorkflowTransitionPlan } from "@/lib/workflows/workflow-types";

export { foodOpsPhaseFromOrder, resolveOrderStatusKey, toDbOrderStatus };

function ctxFromOrder(order: {
  fulfillmentType: string;
  deliveryAddressJson: unknown | null;
  paymentStatus?: string | null;
  customerName: string;
  customerEmail: string;
  orderType?: string | null;
  creationSource?: string | null;
  fulfillmentDetail?: string | null;
  pickupDate?: Date | null;
  sourceMetadataJson?: unknown;
}): OrderGuardContext {
  return {
    fulfillmentType: order.fulfillmentType,
    deliveryAddressJson: order.deliveryAddressJson,
    paymentStatus: order.paymentStatus ?? null,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    orderType: order.orderType ?? null,
    creationSource: order.creationSource ?? null,
    fulfillmentDetail: order.fulfillmentDetail ?? null,
    pickupDate: order.pickupDate ?? null,
    sourceMetadataJson: order.sourceMetadataJson ?? null,
  };
}

/**
 * Plan a phase transition — pure validation. Callers perform Prisma updates + audit logging.
 * Irreversible: cancel or complete from certain states.
 */
export function planFoodOpsTransition(
  order: {
    status: OrderStatus;
    statusDetail?: string | null;
    fulfillmentType: string;
    orderType?: string | null;
    creationSource?: string | null;
    fulfillmentDetail?: string | null;
    pickupDate?: Date | null;
    sourceMetadataJson?: unknown;
    deliveryAddressJson: unknown | null;
    paymentStatus?: string | null;
    customerName: string;
    customerEmail: string;
  },
  targetPhase: FoodOpsPhaseId,
): WorkflowTransitionPlan {
  const fromPhase = foodOpsPhaseFromOrder(order);
  const allowed = allowedTargetPhases(fromPhase);
  const failures: string[] = [];
  if (!allowed.includes(targetPhase)) {
    failures.push(`Transition from ${fromPhase} to ${targetPhase} is not in the allowed graph.`);
  }
  failures.push(...listTransitionGuardFailures(ctxFromOrder(order), targetPhase));

  const irreversible =
    targetPhase === "CANCELLED" ||
    (targetPhase === "COMPLETED" && !isTerminalPhase(fromPhase));

  return {
    fromPhase,
    toPhase: targetPhase,
    guardFailures: failures,
    auditAction: `order.food_ops.${fromPhase.toLowerCase()}.${targetPhase.toLowerCase()}`,
    irreversible,
  };
}

export function describeHappyPathNext(order: {
  status: OrderStatus;
  statusDetail?: string | null;
  orderType?: string | null;
  creationSource?: string | null;
  fulfillmentType: string;
  fulfillmentDetail?: string | null;
  pickupDate?: Date | null;
  sourceMetadataJson?: unknown;
  deliveryAddressJson: unknown | null;
  paymentStatus?: string | null;
  customerName: string;
  customerEmail: string;
}): { phase: FoodOpsPhaseId; label: string } | null {
  const phase = foodOpsPhaseFromOrder(order);
  const next = nextHappyPathPhase(phase);
  if (!next) return null;
  return {
    phase: next,
    label: describeTransitionForOperators(phase, next),
  };
}

export function workflowSideEffectsForPlan(plan: WorkflowTransitionPlan) {
  return sideEffectsForTransition(plan.fromPhase, plan.toPhase);
}

export function activeWorkflowBranches(order: Parameters<typeof listActiveBranchesForOrder>[0]) {
  return listActiveBranchesForOrder(order);
}

/** Map a FoodOps phase to widened status key + DB enum for persistence helpers. */
export function persistenceHintsForPhase(phase: FoodOpsPhaseId): {
  statusDetail: OrderStatusKey;
  dbStatus: OrderStatus;
} {
  const map: Record<FoodOpsPhaseId, OrderStatusKey> = {
    ORDER_CREATED: "REQUESTED",
    ORDER_CONFIRMED: "CONFIRMED",
    PRODUCTION_PLANNED: "CONFIRMED",
    IN_PRODUCTION: "IN_PRODUCTION",
    READY_FOR_PACKING: "READY_FOR_PACKING",
    PACKING: "PACKED",
    PACKED: "PACKED",
    READY_FOR_PICKUP: "READY_FOR_PICKUP",
    OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
    COMPLETED: "COMPLETED",
    CANCELLED: "CANCELLED",
  };
  const statusDetail = map[phase] ?? "REQUESTED";
  return { statusDetail, dbStatus: toDbOrderStatus(statusDetail) };
}
