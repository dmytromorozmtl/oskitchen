import { format } from "date-fns";

import { prisma } from "@/lib/prisma";
import {
  packingTaskListWhereForOwner,
  resolveOwnerScopedWhere,
} from "@/lib/scope/workspace-resource-scope";
import type { PackingCommandMode, PackingTaskStatus } from "@prisma/client";

export type PackingTaskCardDTO = {
  id: string;
  orderId: string;
  orderItemId: string | null;
  title: string;
  quantity: number;
  fulfillmentType: "PICKUP" | "DELIVERY";
  status: PackingTaskStatus;
  customerName: string;
  requiresLabel: boolean;
  requiresNutritionLabel: boolean;
  requiresAllergenCheck: boolean;
  labelPrintedAt: string | null;
  packedAt: string | null;
  verifiedAt: string | null;
  routeLabel: string | null;
  pickupWindow: string | null;
  batchTitle: string | null;
  allergenSummary: string | null;
};

export type PackingWaveRowDTO = {
  id: string;
  title: string;
  status: string;
  fulfillmentType: "PICKUP" | "DELIVERY" | null;
  taskCount: number;
};

function routeLabelFromRoute(route: {
  driverName: string | null;
  routeDate: Date;
} | null): string | null {
  if (!route) return null;
  const day = format(route.routeDate, "MMM d");
  return route.driverName ? `${route.driverName} · ${day}` : `Route · ${day}`;
}

export async function loadPackingTasksForDate(
  userId: string,
  packingDate: Date,
): Promise<PackingTaskCardDTO[]> {
  const taskScope = await packingTaskListWhereForOwner(userId);
  const rows = await prisma.packingTask.findMany({
    where: {
      AND: [
        taskScope,
        {
          status: { notIn: ["HANDED_OFF", "CANCELLED"] },
          OR: [
            { batch: { packingDate: { equals: packingDate } } },
            { wave: { packingDate: { equals: packingDate } } },
          ],
        },
      ],
    },
    include: {
      order: { select: { customerName: true, fulfillmentType: true } },
      batch: { select: { title: true } },
      route: { select: { driverName: true, routeDate: true } },
    },
    orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
  });

  return rows.map((r) => {
    let allergenSummary: string | null = null;
    if (r.allergenWarningsJson && typeof r.allergenWarningsJson === "object" && r.allergenWarningsJson !== null) {
      const j = r.allergenWarningsJson as { text?: string };
      allergenSummary = j.text ?? null;
    }
    return {
      id: r.id,
      orderId: r.orderId,
      orderItemId: r.orderItemId,
      title: r.title,
      quantity: r.quantity,
      fulfillmentType: r.fulfillmentType,
      status: r.status,
      customerName: r.order.customerName,
      requiresLabel: r.requiresLabel,
      requiresNutritionLabel: r.requiresNutritionLabel,
      requiresAllergenCheck: r.requiresAllergenCheck,
      labelPrintedAt: r.labelPrintedAt ? r.labelPrintedAt.toISOString() : null,
      packedAt: r.packedAt ? r.packedAt.toISOString() : null,
      verifiedAt: r.verifiedAt ? r.verifiedAt.toISOString() : null,
      routeLabel: routeLabelFromRoute(r.route),
      pickupWindow: r.pickupWindow,
      batchTitle: r.batch?.title ?? null,
      allergenSummary,
    };
  });
}

export async function loadPackingWavesForDate(
  userId: string,
  packingDate: Date,
): Promise<PackingWaveRowDTO[]> {
  const waveScope = await resolveOwnerScopedWhere(userId);
  const waves = await prisma.packingWave.findMany({
    where: { AND: [waveScope, { packingDate: { equals: packingDate } }] },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { tasks: true } } },
  });

  return waves.map((w) => ({
    id: w.id,
    title: w.title,
    status: w.status,
    fulfillmentType: w.fulfillmentType,
    taskCount: w._count.tasks,
  }));
}

export function parsePackingCommandMode(raw: string | undefined, fallback: PackingCommandMode): PackingCommandMode {
  const allowed: PackingCommandMode[] = [
    "MEAL_PREP_PACKING",
    "TAKEOUT_PACKING",
    "DELIVERY_PACKING",
    "PICKUP_PACKING",
    "CATERING_PACKING",
    "EVENT_LOADOUT",
    "BAKERY_PICKUP",
    "CAFE_PICKUP",
    "GHOST_KITCHEN_PACKING",
    "ROUTE_HANDOFF",
  ];
  if (raw && allowed.includes(raw as PackingCommandMode)) return raw as PackingCommandMode;
  return fallback;
}
