import type { FulfillmentType, OrderStatus } from "@prisma/client";

import { requiresScheduledServiceDate } from "@/lib/fulfillment/fulfillment-requirements";
import { prisma } from "@/lib/prisma";
import type { OrderBlocker } from "@/lib/orders/order-lifecycle-types";
import { listOrderBlockersForOrder } from "@/services/orders/order-blocker-service";
import { buildOrderLifecycleView } from "@/services/orders/order-lifecycle-service";
import { resolveOrderNextActionBundle } from "@/services/orders/order-next-action-service";
import type { OrderLikeForLifecycle } from "@/lib/workflows/order-lifecycle-rules";
import { listAllowedOrderStatusTransitions } from "@/services/workflows/order-lifecycle-service";

export type FoodopsWorkflowStepId =
  | "intake"
  | "product_mapping"
  | "fulfillment_info"
  | "production"
  | "packing"
  | "route_pickup"
  | "crm"
  | "analytics";

/** UI-facing status for the order-detail stepper (linear FoodOps chain). */
export type FoodopsUiStatus = "complete" | "current" | "blocked" | "not_required" | "pending";

export type FoodopsWorkflowStepView = {
  id: FoodopsWorkflowStepId;
  label: string;
  status: FoodopsUiStatus;
  explanation: string;
  countLabel?: string | null;
  fixHref?: string | null;
  fixLabel?: string | null;
  sourceOfTruth: string;
};

type RawStepState = "complete" | "blocked" | "not_required" | "pending";

const FULFILLMENT_BLOCKER_CODES = new Set([
  "MISSING_FULFILLMENT_DATE",
  "MISSING_DELIVERY_ADDRESS",
  "MISSING_PICKUP_WINDOW",
]);

const DONE_PRODUCTION = new Set(["DONE", "CANCELLED"]);
const DONE_PACKING = new Set(["PACKED", "VERIFIED", "HANDED_OFF", "CANCELLED"]);

export type FoodopsOrderInput = {
  id: string;
  status: OrderStatus;
  statusDetail: string | null;
  fulfillmentType: FulfillmentType;
  fulfillmentDetail: string | null;
  orderType: string | null;
  creationSource: string | null;
  sourceMetadataJson: unknown;
  pickupDate: Date | null;
  deliveryAddressJson: unknown | null;
  paymentStatus: string | null;
  paymentMode: string | null;
  customerId: string | null;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  orderItems: { id: string }[];
  productionWorkItems: { id: string; status: string }[];
  packingTasks: { id: string; status: string }[];
  deliveryStops: { id: string }[];
  posTransactions: { id: string; receipt: { id: string } | null }[] | null;
  importedFromExternal: { syncStatus: string } | null;
  channelImportBatch: { status: string } | null;
};

export type BuildFoodopsWorkflowInput = {
  order: FoodopsOrderInput;
  blockers: OrderBlocker[];
  /** Same bundle as order detail / lifecycle (primary + secondaries). */
  nextActions: ReturnType<typeof resolveOrderNextActionBundle>;
  allowedTransitions: OrderStatus[];
};

function lifecycleSnapFromOrder(order: FoodopsOrderInput): OrderLikeForLifecycle {
  return {
    id: order.id,
    status: order.status,
    fulfillmentType: order.fulfillmentType,
    fulfillmentDetail: order.fulfillmentDetail,
    orderType: order.orderType,
    creationSource: order.creationSource,
    sourceMetadataJson: order.sourceMetadataJson,
    pickupDate: order.pickupDate,
    deliveryAddressJson: order.deliveryAddressJson,
    paymentStatus: order.paymentStatus,
    orderItemsCount: order.orderItems.length,
  };
}

function firstFix(blockers: OrderBlocker[], predicate: (b: OrderBlocker) => boolean): OrderBlocker | null {
  return blockers.find(predicate) ?? null;
}

function fulfillmentRequirementCtx(order: FoodopsOrderInput) {
  return {
    status: order.status,
    orderType: order.orderType,
    creationSource: order.creationSource,
    fulfillmentType: order.fulfillmentType,
    fulfillmentDetail: order.fulfillmentDetail,
    pickupDate: order.pickupDate,
    deliveryAddressJson: order.deliveryAddressJson,
    sourceMetadataJson: order.sourceMetadataJson,
  };
}

/**
 * Pure builder for the FoodOps chain — safe for order detail (no extra Prisma round-trips).
 */
export function buildFoodopsWorkflowView(input: BuildFoodopsWorkflowInput): { steps: FoodopsWorkflowStepView[] } {
  const { order, blockers, nextActions, allowedTransitions } = input;
  const fulfillmentCtx = fulfillmentRequirementCtx(order);
  const needsScheduledDate = requiresScheduledServiceDate(fulfillmentCtx);
  const channelOrder = order.importedFromExternal != null || order.channelImportBatch != null;
  const unmapped = blockers.some((b) => b.code === "UNMAPPED_PRODUCTS");
  const fulBlockers = blockers.filter((b) => FULFILLMENT_BLOCKER_CODES.has(b.code));
  const prodDone =
    order.productionWorkItems.length === 0 ||
    order.productionWorkItems.every((w) => DONE_PRODUCTION.has(w.status));
  const packDone =
    order.packingTasks.length === 0 || order.packingTasks.every((t) => DONE_PACKING.has(t.status));
  const intakeRaw: RawStepState = order.status === "PENDING" ? "pending" : "complete";
  const intakeExplanation =
    order.status === "PENDING"
      ? "Order is still pending confirmation — intake is not finalized."
      : `${order.creationSource ?? "Unknown source"} · ${order.orderType ?? "order"} — sale or import accepted.`;

  let mappingRaw: RawStepState;
  let mappingExplanation: string;
  let mappingFix: OrderBlocker | null = null;
  if (!channelOrder) {
    mappingRaw = "not_required";
    mappingExplanation =
      "No external channel batch on this order — lines use your internal catalog (POS or manual).";
  } else if (unmapped) {
    mappingRaw = "blocked";
    mappingExplanation = "One or more channel lines still need catalog mapping before kitchen work is trustworthy.";
    mappingFix = firstFix(blockers, (b) => b.code === "UNMAPPED_PRODUCTS");
  } else {
    mappingRaw = "complete";
    mappingExplanation = "Channel lines are mapped to OS Kitchen menu items (no open mapping conflicts).";
  }

  let fulfillmentRaw: RawStepState;
  let fulfillmentExplanation: string;
  let fulfillmentFix: OrderBlocker | null = null;
  if (fulBlockers.length > 0) {
    fulfillmentRaw = "blocked";
    const b = fulBlockers[0]!;
    fulfillmentExplanation = b.explanation;
    fulfillmentFix = b;
  } else if (order.fulfillmentType !== "DELIVERY" && !needsScheduledDate) {
    fulfillmentRaw = "not_required";
    fulfillmentExplanation =
      "Counter or same-day pickup path — a future pickup date is not required for this order profile.";
  } else {
    fulfillmentRaw = "complete";
    fulfillmentExplanation =
      order.fulfillmentType === "DELIVERY"
        ? "Delivery address and fulfillment prerequisites are satisfied for the current stage."
        : needsScheduledDate
          ? "Pickup / service scheduling requirements are satisfied."
          : "Fulfillment metadata is sufficient for the current workflow.";
  }

  let productionRaw: RawStepState;
  let productionExplanation: string;
  let productionFix: OrderBlocker | null = null;
  const pw = order.productionWorkItems.length;
  if (pw === 0) {
    productionRaw = "not_required";
    productionExplanation = "No production work items — often normal for retail-ready or non-kitchen lines.";
  } else if (blockers.some((b) => b.code === "PRODUCTION_NOT_COMPLETE")) {
    productionRaw = "blocked";
    productionExplanation = "Production lines tied to this order are still open while the order is advancing.";
    productionFix = firstFix(blockers, (b) => b.code === "PRODUCTION_NOT_COMPLETE");
  } else if (order.productionWorkItems.some((w) => !DONE_PRODUCTION.has(w.status))) {
    productionRaw = "pending";
    productionExplanation = "Kitchen work is in progress for this order.";
  } else {
    productionRaw = "complete";
    productionExplanation = "All linked production work is done or cancelled.";
  }

  let packingRaw: RawStepState;
  let packingExplanation: string;
  let packingFix: OrderBlocker | null = null;
  const pt = order.packingTasks.length;
  if (pt === 0) {
    packingRaw = "not_required";
    packingExplanation = "No packing tasks — typical for simple counter handoff unless labels were generated.";
  } else if (blockers.some((b) => b.code === "PACKING_NOT_COMPLETE")) {
    packingRaw = "blocked";
    packingExplanation = "Packing or verification is incomplete for the current order status.";
    packingFix = firstFix(blockers, (b) => b.code === "PACKING_NOT_COMPLETE");
  } else if (order.packingTasks.some((t) => !DONE_PACKING.has(t.status))) {
    packingRaw = "pending";
    packingExplanation = "Packing tasks are still moving through verify / handoff.";
  } else {
    packingRaw = "complete";
    packingExplanation = "Packing tasks are complete, handed off, or cancelled.";
  }

  let routeRaw: RawStepState;
  let routeExplanation: string;
  let routeFix: OrderBlocker | null = null;
  if (order.fulfillmentType !== "DELIVERY") {
    routeRaw = "not_required";
    routeExplanation = "Not a delivery manifest — route stops are not part of this handoff.";
  } else if (blockers.some((b) => b.code === "ROUTE_NOT_ASSIGNED")) {
    routeRaw = "blocked";
    routeExplanation = "Delivery is marked ready but no route stops are assigned yet.";
    routeFix = firstFix(blockers, (b) => b.code === "ROUTE_NOT_ASSIGNED");
  } else if (order.deliveryStops.length === 0) {
    routeRaw = "pending";
    routeExplanation = "Delivery order — add route stops when dispatch is ready.";
  } else {
    routeRaw = "complete";
    routeExplanation = `Route has ${order.deliveryStops.length} stop(s) on file.`;
  }

  const crmRaw: RawStepState = order.customerId ? "complete" : "not_required";
  const crmExplanation = order.customerId
    ? "Linked OS Kitchen customer profile — CRM history and follow-ups apply."
    : "Guest checkout — no CRM customer profile linked (not a blocker by itself).";

  const analyticsRaw: RawStepState = order.status === "COMPLETED" ? "complete" : "pending";
  const analyticsExplanation =
    order.status === "COMPLETED"
      ? "Order completed — revenue and operational KPIs roll into analytics as data matures."
      : "Forecasting and margin rollups finalize after the order reaches a closed terminal state.";

  const rawSteps: { id: FoodopsWorkflowStepId; label: string; raw: RawStepState; explanation: string; fix?: OrderBlocker | null; countLabel?: string | null; source: string }[] = [
    {
      id: "intake",
      label: "Intake",
      raw: intakeRaw,
      explanation: intakeExplanation,
      source: "Order status + creation metadata",
    },
    {
      id: "product_mapping",
      label: "Product mapping",
      raw: mappingRaw,
      explanation: mappingExplanation,
      fix: mappingFix,
      source: "Channel conflicts + import linkage",
    },
    {
      id: "fulfillment_info",
      label: "Fulfillment info",
      raw: fulfillmentRaw,
      explanation: fulfillmentExplanation,
      fix: fulfillmentFix,
      source: "Fulfillment rules + order fields",
    },
    {
      id: "production",
      label: "Production",
      raw: productionRaw,
      explanation: productionExplanation,
      fix: productionFix,
      countLabel: pw > 0 ? `${pw} work item(s)` : null,
      source: "Production work items",
    },
    {
      id: "packing",
      label: "Packing",
      raw: packingRaw,
      explanation: packingExplanation,
      fix: packingFix,
      countLabel: pt > 0 ? `${pt} task(s)` : null,
      source: "Packing tasks",
    },
    {
      id: "route_pickup",
      label: "Route / Pickup",
      raw: routeRaw,
      explanation: routeExplanation,
      fix: routeFix,
      countLabel: order.fulfillmentType === "DELIVERY" && order.deliveryStops.length > 0 ? `${order.deliveryStops.length} stop(s)` : null,
      source: "Delivery stops + fulfillment type",
    },
    {
      id: "crm",
      label: "Customer / CRM",
      raw: crmRaw,
      explanation: crmExplanation,
      source: "Customer link on order",
    },
    {
      id: "analytics",
      label: "Analytics",
      raw: analyticsRaw,
      explanation: analyticsExplanation,
      countLabel: allowedTransitions.length ? `${allowedTransitions.length} allowed transition(s)` : null,
      source: "Order lifecycle + status",
    },
  ];

  const focalIndex = rawSteps.findIndex((s) => s.raw === "blocked" || s.raw === "pending");
  const steps: FoodopsWorkflowStepView[] = rawSteps.map((s, i) => {
    let status: FoodopsUiStatus;
    if (s.raw === "not_required") status = "not_required";
    else if (s.raw === "complete") status = "complete";
    else {
      if (focalIndex === -1) status = s.raw === "blocked" ? "blocked" : "pending";
      else if (i < focalIndex) status = "complete";
      else if (i === focalIndex) status = s.raw === "blocked" ? "blocked" : "current";
      else status = "pending";
    }

    const fix = s.fix;

    return {
      id: s.id,
      label: s.label,
      status,
      explanation: s.explanation,
      countLabel: s.countLabel ?? null,
      fixHref: status === "blocked" && fix ? fix.fixHref : status === "current" && nextActions.primary ? nextActions.primary.href : null,
      fixLabel:
        status === "blocked" && fix
          ? fix.recommendedAction
          : status === "current" && nextActions.primary
            ? nextActions.primary.title
            : null,
      sourceOfTruth: s.source,
    };
  });

  const defaultOrderHref = `/dashboard/orders/${order.id}`;
  for (const st of steps) {
    if (st.status === "blocked" && !st.fixHref) {
      const raw = rawSteps.find((r) => r.id === st.id);
      const b = raw?.fix;
      st.fixHref = b?.fixHref ?? defaultOrderHref;
      st.fixLabel = st.fixLabel ?? b?.recommendedAction ?? "Resolve blocker";
    }
    if (st.status === "current" && !st.fixHref && nextActions.primary) {
      st.fixHref = nextActions.primary.href;
      st.fixLabel = nextActions.primary.title;
    }
  }

  return { steps };
}

/**
 * One-screen summary of the FoodOps chain for a single order — uses Prisma when callers do not have hydrated order rows.
 */
export async function summarizeFoodopsWorkflowForOrder(
  userId: string,
  orderId: string,
): Promise<{ steps: FoodopsWorkflowStepView[]; blockers: Awaited<ReturnType<typeof listOrderBlockersForOrder>> } | null> {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    select: {
      id: true,
      status: true,
      statusDetail: true,
      fulfillmentType: true,
      fulfillmentDetail: true,
      orderType: true,
      creationSource: true,
      sourceMetadataJson: true,
      pickupDate: true,
      deliveryAddressJson: true,
      paymentStatus: true,
      paymentMode: true,
      customerId: true,
      customerName: true,
      customerEmail: true,
      customerPhone: true,
      orderItems: { select: { id: true } },
      productionWorkItems: { select: { id: true, status: true } },
      packingTasks: { select: { id: true, status: true } },
      deliveryStops: { select: { id: true } },
      posTransactions: { select: { id: true, receipt: { select: { id: true } } } },
      importedFromExternal: { select: { syncStatus: true } },
      channelImportBatch: { select: { status: true } },
    },
  });
  if (!order) return null;

  const blockers = await listOrderBlockersForOrder(userId, orderId);
  const lifecycleView = buildOrderLifecycleView(
    {
      status: order.status,
      statusDetail: order.statusDetail,
      orderType: order.orderType,
      creationSource: order.creationSource,
      fulfillmentType: order.fulfillmentType,
      fulfillmentDetail: order.fulfillmentDetail,
      sourceMetadataJson: order.sourceMetadataJson,
      paymentStatus: order.paymentStatus,
      paymentMode: order.paymentMode,
      pickupDate: order.pickupDate,
      deliveryAddressJson: order.deliveryAddressJson,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      orderItems: order.orderItems,
      productionWorkItems: order.productionWorkItems,
      packingTasks: order.packingTasks,
      deliveryStops: order.deliveryStops,
      posTransactions: order.posTransactions,
      importedFromExternal: order.importedFromExternal,
      channelImportBatch: order.channelImportBatch,
    },
    blockers,
  );

  const snap = lifecycleSnapFromOrder(order);
  const next = resolveOrderNextActionBundle({
    orderId: order.id,
    order: snap,
    blockers: lifecycleView.blockers,
    customerLinked: order.customerId != null,
  });
  const allowed = listAllowedOrderStatusTransitions(snap);

  const { steps } = buildFoodopsWorkflowView({
    order,
    blockers,
    nextActions: next,
    allowedTransitions: allowed,
  });

  return { steps, blockers };
}
