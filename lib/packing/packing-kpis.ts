import type { PackingTaskStatus } from "@prisma/client";

import type { PackingOrderDTO } from "@/lib/packing/packing-order-dto";

export type PackingTaskKpiRow = {
  id: string;
  orderId: string;
  quantity: number;
  fulfillmentType: "PICKUP" | "DELIVERY";
  status: PackingTaskStatus;
  requiresLabel: boolean;
  requiresNutritionLabel: boolean;
  requiresAllergenCheck: boolean;
  labelPrintedAt: string | null;
  packedAt: string | null;
  verifiedAt: string | null;
};

export type PackingKpis = {
  ordersToPack: number;
  itemsToPack: number;
  packedItems: number;
  verifiedTasks: number;
  labelsMissing: number;
  allergenChecksOpen: number;
  pickupReadyOrders: number;
  deliveryReadyOrders: number;
  lateOrRisk: number;
};

const active: PackingTaskStatus[] = ["QUEUED", "IN_PROGRESS"];

function uniqueOrdersForHandoff(rows: PackingTaskKpiRow[]) {
  const pickup = new Set<string>();
  const delivery = new Set<string>();
  for (const r of rows) {
    if (r.status !== "PACKED" && r.status !== "VERIFIED") continue;
    if (r.fulfillmentType === "PICKUP") pickup.add(r.orderId);
    else delivery.add(r.orderId);
  }
  return { pickup: pickup.size, delivery: delivery.size };
}

export function computePackingKpis(
  tasks: PackingTaskKpiRow[],
  pipelineOrders: PackingOrderDTO[],
): PackingKpis {
  const uniqueOrderIds = new Set(tasks.map((t) => t.orderId));
  const ordersToPack =
    uniqueOrderIds.size > 0 ? uniqueOrderIds.size : pipelineOrders.length;

  let itemsToPack = 0;
  let packedItems = 0;
  let verifiedTasks = 0;
  let labelsMissing = 0;
  let allergenChecksOpen = 0;

    for (const t of tasks) {
      if (active.includes(t.status)) itemsToPack += t.quantity;
      if (t.status === "PACKED" || t.status === "VERIFIED") packedItems += t.quantity;
      if (t.status === "VERIFIED") verifiedTasks += 1;
      if ((t.requiresLabel || t.requiresNutritionLabel) && !t.labelPrintedAt) labelsMissing += 1;
      if (t.requiresAllergenCheck && t.status !== "VERIFIED" && t.status !== "HANDED_OFF")
        allergenChecksOpen += 1;
    }

  const handoff = uniqueOrdersForHandoff(tasks);

  return {
    ordersToPack,
    itemsToPack,
    packedItems,
    verifiedTasks,
    labelsMissing,
    allergenChecksOpen,
    pickupReadyOrders: handoff.pickup,
    deliveryReadyOrders: handoff.delivery,
    lateOrRisk: 0,
  };
}
