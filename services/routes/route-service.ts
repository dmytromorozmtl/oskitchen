import {
  DeliveryEventType,
  DeliveryRouteStatus,
  DeliveryStopStatus,
  type FailedDeliveryReason,
  type DeliveryRouteMode,
  type Prisma,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { startOfUtcDay } from "@/lib/routes/route-planning";
import {
  computeRouteStatusFromStops,
  countStopBuckets,
} from "@/lib/routes/route-status";
import { applyReorder, canTransitionStop } from "@/lib/routes/route-stops";

type OwnerScope = { userId: string };

export async function listRoutesForUser(
  scope: OwnerScope,
  opts?: { take?: number; from?: Date; to?: Date; status?: DeliveryRouteStatus },
) {
  return prisma.deliveryRoute.findMany({
    where: {
      userId: scope.userId,
      ...(opts?.from || opts?.to
        ? {
            routeDate: {
              ...(opts?.from ? { gte: opts.from } : {}),
              ...(opts?.to ? { lte: opts.to } : {}),
            },
          }
        : {}),
      ...(opts?.status ? { status: opts.status } : {}),
    },
    orderBy: [{ routeDate: "desc" }, { createdAt: "desc" }],
    take: opts?.take ?? 50,
    include: {
      stops: { orderBy: { sequence: "asc" }, select: { status: true } },
      driverProfile: { select: { id: true, name: true, phone: true } },
      zone: { select: { id: true, name: true } },
      brand: { select: { id: true, name: true } },
      location: { select: { id: true, name: true } },
    },
  });
}

export async function getRouteForUser(scope: OwnerScope, routeId: string) {
  return prisma.deliveryRoute.findFirst({
    where: { id: routeId, userId: scope.userId },
    include: {
      stops: {
        orderBy: { sequence: "asc" },
        include: {
          order: { select: { id: true, customerName: true, customerEmail: true, status: true, fulfillmentType: true } },
          customer: { select: { id: true, name: true, phone: true, email: true } },
        },
      },
      driverProfile: true,
      driverUser: { select: { id: true, email: true, fullName: true } },
      zone: true,
      brand: { select: { id: true, name: true } },
      location: { select: { id: true, name: true } },
      events: { orderBy: { createdAt: "desc" }, take: 50 },
    },
  });
}

export type CreateManualRouteInput = {
  userId: string;
  routeDate: Date;
  title?: string | null;
  mode?: DeliveryRouteMode | null;
  driverName?: string | null;
  driverProfileId?: string | null;
  vehicleName?: string | null;
  zoneId?: string | null;
  brandId?: string | null;
  locationId?: string | null;
  deliveryWindowStart?: Date | null;
  deliveryWindowEnd?: Date | null;
  notes?: string | null;
};

export async function createManualRoute(input: CreateManualRouteInput): Promise<string> {
  const date = startOfUtcDay(input.routeDate);
  const route = await prisma.deliveryRoute.create({
    data: {
      userId: input.userId,
      routeDate: date,
      title: input.title?.trim() || null,
      mode: input.mode ?? "MEAL_PREP_DELIVERY",
      status: DeliveryRouteStatus.DRAFT,
      driverName: input.driverName?.trim() || null,
      driverProfileId: input.driverProfileId ?? null,
      vehicleName: input.vehicleName?.trim() || null,
      zoneId: input.zoneId ?? null,
      brandId: input.brandId ?? null,
      locationId: input.locationId ?? null,
      deliveryWindowStart: input.deliveryWindowStart ?? null,
      deliveryWindowEnd: input.deliveryWindowEnd ?? null,
      notes: input.notes?.trim() || null,
      totalStops: 0,
    },
  });
  await prisma.deliveryEvent.create({
    data: {
      routeId: route.id,
      eventType: DeliveryEventType.ROUTE_CREATED,
      metadataJson: { source: "manual" } as Prisma.InputJsonValue,
    },
  });
  return route.id;
}

export async function applyOptimizedStopOrder(
  scope: OwnerScope,
  routeId: string,
  stopIdsInOrder: readonly string[],
) {
  const route = await prisma.deliveryRoute.findFirst({
    where: { id: routeId, userId: scope.userId },
    include: { stops: { select: { id: true } } },
  });
  if (!route) throw new Error("Route not found.");

  const existingIds = new Set(route.stops.map((s) => s.id));
  if (stopIdsInOrder.length !== route.stops.length) {
    throw new Error("Optimized stop list must include every stop on the route.");
  }
  for (const id of stopIdsInOrder) {
    if (!existingIds.has(id)) throw new Error("Invalid stop in optimized order.");
  }

  await prisma.$transaction(
    stopIdsInOrder.map((id, sequence) =>
      prisma.deliveryStop.update({ where: { id }, data: { sequence } }),
    ),
  );

  await prisma.deliveryRoute.update({
    where: { id: routeId },
    data: { estimatedDistance: null, estimatedDuration: null },
  });

  await prisma.deliveryEvent.create({
    data: {
      routeId,
      eventType: DeliveryEventType.ROUTE_UPDATED,
      metadataJson: {
        source: "dispatch_optimization",
        stopOrder: [...stopIdsInOrder],
      } as Prisma.InputJsonValue,
    },
  });
}

export type ReorderStopInput = { routeId: string; stopId: string; toIndex: number };

export async function reorderStop(scope: OwnerScope, input: ReorderStopInput) {
  const route = await prisma.deliveryRoute.findFirst({
    where: { id: input.routeId, userId: scope.userId },
    include: { stops: { select: { id: true, sequence: true } } },
  });
  if (!route) throw new Error("Route not found.");

  const next = applyReorder(route.stops, input.stopId, input.toIndex);
  await prisma.$transaction(
    next.map((s) =>
      prisma.deliveryStop.update({ where: { id: s.id }, data: { sequence: s.sequence } }),
    ),
  );
  await prisma.deliveryEvent.create({
    data: {
      routeId: route.id,
      stopId: input.stopId,
      eventType: DeliveryEventType.STOP_REORDERED,
      metadataJson: { toIndex: input.toIndex } as Prisma.InputJsonValue,
    },
  });
}

export type UpdateStopStatusInput = {
  routeId: string;
  stopId: string;
  to: DeliveryStopStatus;
  failedReason?: FailedDeliveryReason | null;
  notes?: string | null;
  performedBy?: string | null;
};

export async function updateStopStatus(scope: OwnerScope, input: UpdateStopStatusInput) {
  const stop = await prisma.deliveryStop.findFirst({
    where: { id: input.stopId, route: { id: input.routeId, userId: scope.userId } },
    select: { id: true, status: true, customerName: true, customerPhone: true, sequence: true },
  });
  if (!stop) throw new Error("Stop not found.");
  if (!canTransitionStop(stop.status, input.to)) {
    throw new Error(`Cannot transition stop from ${stop.status} to ${input.to}.`);
  }
  const eventType = mapStopStatusToEvent(input.to);
  await prisma.$transaction(async (tx) => {
    await tx.deliveryStop.update({
      where: { id: input.stopId },
      data: {
        status: input.to,
        failedReason: input.to === "FAILED" ? input.failedReason ?? "OTHER" : null,
        deliveredAt: input.to === "DELIVERED" ? new Date() : null,
        deliveryNotes: input.notes?.trim() || undefined,
      },
    });

    const refreshed = await tx.deliveryRoute.findUniqueOrThrow({
      where: { id: input.routeId },
      include: { stops: { select: { status: true } } },
    });
    const buckets = countStopBuckets(refreshed.stops);
    const newStatus = computeRouteStatusFromStops(refreshed.status, refreshed.stops);
    await tx.deliveryRoute.update({
      where: { id: input.routeId },
      data: {
        status: newStatus,
        completedStops: buckets.completed,
        failedStops: buckets.failed,
      },
    });

    if (eventType) {
      await tx.deliveryEvent.create({
        data: {
          routeId: input.routeId,
          stopId: input.stopId,
          eventType,
          performedBy: input.performedBy?.slice(0, 255) ?? null,
          metadataJson: {
            to: input.to,
            failedReason: input.failedReason ?? undefined,
          } as Prisma.InputJsonValue,
        },
      });
    }
  });

  // Side-effect: failed deliveries auto-create a follow-up task. Best-effort —
  // if task creation fails we don't roll back the stop status.
  if (input.to === "FAILED") {
    try {
      const { createFollowUpTask } = await import("@/services/tasks/task-service");
      await createFollowUpTask({
        userId: scope.userId,
        title: `Follow up failed delivery — ${stop.customerName ?? "Stop"}${stop.sequence != null ? ` #${stop.sequence}` : ""}`,
        source: "ROUTE",
        sourceId: input.routeId,
        sourceLabel: `Route stop ${stop.id}`,
        priority: "HIGH",
        description: input.notes ?? `Stop marked FAILED${input.failedReason ? ` (${input.failedReason})` : ""}. Contact customer and reschedule or refund.`,
        metadata: {
          stopId: input.stopId,
          failedReason: input.failedReason ?? null,
          customerPhone: stop.customerPhone ?? null,
        } as Prisma.InputJsonValue,
        performedBy: input.performedBy ?? null,
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      logger.warn("[routes] failed to create follow-up task:", (err as Error).message);
    }
  }
}

function mapStopStatusToEvent(to: DeliveryStopStatus): DeliveryEventType | null {
  switch (to) {
    case "LOADED":
      return DeliveryEventType.STOP_LOADED;
    case "OUT_FOR_DELIVERY":
      return DeliveryEventType.STOP_OUT_FOR_DELIVERY;
    case "DELIVERED":
      return DeliveryEventType.STOP_DELIVERED;
    case "FAILED":
      return DeliveryEventType.STOP_FAILED;
    case "RETURNED":
      return DeliveryEventType.STOP_RETURNED;
    case "SKIPPED":
      return DeliveryEventType.STOP_SKIPPED;
    case "PACKED":
    case "READY":
    case "PENDING":
    default:
      return null;
  }
}

export async function assignDriver(
  scope: OwnerScope,
  routeId: string,
  driverProfileId: string | null,
  driverName?: string | null,
  performedBy?: string | null,
) {
  const route = await prisma.deliveryRoute.findFirst({
    where: { id: routeId, userId: scope.userId },
    select: { id: true },
  });
  if (!route) throw new Error("Route not found.");
  await prisma.deliveryRoute.update({
    where: { id: route.id },
    data: {
      driverProfileId: driverProfileId,
      driverName: driverName?.trim() || null,
    },
  });
  await prisma.deliveryEvent.create({
    data: {
      routeId: route.id,
      eventType: DeliveryEventType.ROUTE_ASSIGNED,
      performedBy: performedBy?.slice(0, 255) ?? null,
      metadataJson: {
        driverProfileId,
        driverName: driverName ?? null,
      } as Prisma.InputJsonValue,
    },
  });
}

export async function recordRouteEvent(
  routeId: string,
  eventType: DeliveryEventType,
  performedBy?: string | null,
  metadata?: Prisma.InputJsonValue,
) {
  await prisma.deliveryEvent.create({
    data: {
      routeId,
      eventType,
      performedBy: performedBy?.slice(0, 255) ?? null,
      metadataJson: metadata,
    },
  });
}
