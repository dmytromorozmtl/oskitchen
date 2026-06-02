import type { Prisma } from "@prisma/client";
import { subHours } from "date-fns";

import {
  buildKdsLiveState,
  buildKdsTwinPredictions,
  buildLiveSimulationParams,
  buildPosLiveSnapshot,
  bottleneckAlertDedupeKey,
  formatBottleneckAlertMessage,
  shouldSendBottleneckAlert,
} from "@/lib/ai/real-time-twin-builders";
import type { KdsTwinPredictions, KdsLiveState, PosLiveSnapshot, RealTimeTwinUpdate } from "@/lib/ai/real-time-twin-types";
import type { SimulationMenuMixItem } from "@/lib/ai/digital-twin-types";
import { logger } from "@/lib/logger";
import { getProviderMode } from "@/lib/notifications/provider-resend";
import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId, resolveWorkspaceOwnerUserId } from "@/lib/scope/resolve-owner-workspace-id";
import { orderListWhereForOwnerAnd } from "@/lib/scope/workspace-resource-scope";
import { createDigitalTwin } from "@/services/ai/digital-twin";
import { getDailyKdsOrders } from "@/services/kitchen-screen/daily-kds-service";

export type { KdsLiveState, KdsTwinPredictions, PosLiveSnapshot, RealTimeTwinUpdate } from "@/lib/ai/real-time-twin-types";

/** Read persisted KDS twin predictions from kitchen settings. */
export async function getKDSPredictions(workspaceId: string): Promise<KdsTwinPredictions | null> {
  const ownerUserId = await resolveWorkspaceOwnerUserId(workspaceId);
  if (!ownerUserId) return null;

  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: ownerUserId },
    select: { settingsCenterJson: true },
  });

  const center = kitchen?.settingsCenterJson;
  if (!center || typeof center !== "object" || Array.isArray(center)) return null;

  const raw = (center as Record<string, unknown>).realTimeTwin;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;

  const predictions = raw as KdsTwinPredictions;
  if (typeof predictions.bottleneckStation !== "string") return null;
  return predictions;
}

/** Live KDS queue — active tickets, per-station load, wait metrics. */
export async function getCurrentKDSState(workspaceId: string): Promise<KdsLiveState> {
  const ownerUserId = await resolveWorkspaceOwnerUserId(workspaceId);
  if (!ownerUserId) {
    throw new Error(`Workspace not found: ${workspaceId}`);
  }

  const twin = await createDigitalTwin(workspaceId);
  const stationNames = twin.config.stations.map((s) => s.name);
  const orders = await getDailyKdsOrders(ownerUserId);
  return buildKdsLiveState(orders, stationNames);
}

/** Recent POS flow — orders in the last hour and menu mix for simulation. */
export async function getCurrentPOSOrders(workspaceId: string): Promise<PosLiveSnapshot> {
  const ownerUserId = await resolveWorkspaceOwnerUserId(workspaceId);
  if (!ownerUserId) {
    throw new Error(`Workspace not found: ${workspaceId}`);
  }

  const since = subHours(new Date(), 1);
  const orderWhere = await orderListWhereForOwnerAnd(ownerUserId, {
    createdAt: { gte: since },
    status: { notIn: ["CANCELLED"] },
  });

  const orders = await prisma.order.findMany({
    where: orderWhere,
    select: {
      orderItems: {
        select: {
          title: true,
          quantity: true,
          product: { select: { title: true } },
        },
      },
    },
    take: 500,
  });

  const itemCounts = new Map<string, number>();
  for (const order of orders) {
    for (const line of order.orderItems) {
      const label = line.title?.trim() || line.product?.title?.trim() || "Item";
      const qty = Math.max(line.quantity ?? 1, 1);
      itemCounts.set(label, (itemCounts.get(label) ?? 0) + qty);
    }
  }

  const totalQty = [...itemCounts.values()].reduce((s, n) => s + n, 0);
  let menuMix: SimulationMenuMixItem[];
  if (totalQty <= 0) {
    menuMix = [{ item: "House favorite", percentage: 100 }];
  } else {
    menuMix = [...itemCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([item, qty]) => ({ item, percentage: (qty / totalQty) * 100 }));
  }

  return buildPosLiveSnapshot({ ordersLastHour: orders.length, menuMix });
}

export async function persistKDSPredictions(ownerUserId: string, predictions: KdsTwinPredictions): Promise<void> {
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: ownerUserId },
    select: { settingsCenterJson: true },
  });

  const existing =
    kitchen?.settingsCenterJson && typeof kitchen.settingsCenterJson === "object" && !Array.isArray(kitchen.settingsCenterJson)
      ? { ...(kitchen.settingsCenterJson as Record<string, unknown>) }
      : {};

  existing.realTimeTwin = predictions;

  await prisma.kitchenSettings.upsert({
    where: { userId: ownerUserId },
    create: { userId: ownerUserId, settingsCenterJson: existing as Prisma.InputJsonValue },
    update: { settingsCenterJson: existing as Prisma.InputJsonValue },
  });
}

export async function sendTwinBottleneckAlert(params: {
  ownerUserId: string;
  workspaceId: string;
  station: string;
  delayMinutes: number;
  queueDepth: number;
}): Promise<{ sent: boolean; reason?: string }> {
  const dedupeKey = bottleneckAlertDedupeKey(params.workspaceId, params.station);
  const existing = await prisma.notificationLog.findUnique({ where: { dedupeKey } });
  if (existing) {
    return { sent: false, reason: "Alert already sent in this 30-minute window." };
  }

  const profile = await prisma.userProfile.findUnique({
    where: { id: params.ownerUserId },
    select: { email: true },
  });
  const recipient = profile?.email?.trim() || "kitchen@internal";

  const message = formatBottleneckAlertMessage({
    station: params.station,
    delayMinutes: params.delayMinutes,
    queueDepth: params.queueDepth,
  });

  await prisma.notificationLog.create({
    data: {
      userId: params.ownerUserId,
      workspaceId: params.workspaceId,
      type: "CRON_REMINDER",
      dedupeKey,
      recipient,
      status: "SENT",
      category: "INTERNAL_ALERT",
      channel: "IN_APP",
      provider: getProviderMode(),
      templateKey: "realtime_twin_bottleneck",
      triggerType: "realtime_twin_bottleneck",
      sourceType: "workspace",
      sourceId: params.workspaceId,
      subject: `Kitchen bottleneck: ${params.station}`,
      metadata: {
        station: params.station,
        delayMinutes: params.delayMinutes,
        queueDepth: params.queueDepth,
        message,
      },
      sentAt: new Date(),
    },
  });

  return { sent: true };
}

/**
 * Run Digital Twin with live KDS + POS data, persist KDS predictions, and alert when bottleneck delay exceeds 15 min.
 */
export async function updateRealTimeTwin(workspaceId: string): Promise<RealTimeTwinUpdate> {
  const ownerUserId = await resolveWorkspaceOwnerUserId(workspaceId);
  if (!ownerUserId) {
    throw new Error(`Workspace not found: ${workspaceId}`);
  }

  const [kdsState, posSnapshot, twin] = await Promise.all([
    getCurrentKDSState(workspaceId),
    getCurrentPOSOrders(workspaceId),
    createDigitalTwin(workspaceId),
  ]);

  const loadByStation = new Map(kdsState.stationLoads.map((s) => [s.station, s.load]));
  const configWithLoad = {
    ...twin.config,
    stations: twin.config.stations.map((station) => ({
      ...station,
      currentLoad: loadByStation.get(station.name) ?? 0,
    })),
  };

  const simParams = buildLiveSimulationParams({ kdsState, posSnapshot });
  const { simulateKitchen } = await import("@/lib/ai/digital-twin-simulation");
  const seededSimulation = simulateKitchen(configWithLoad, simParams);

  const predictions = buildKdsTwinPredictions({
    workspaceId,
    kdsState,
    simulation: seededSimulation,
  });

  await persistKDSPredictions(ownerUserId, predictions);

  let alertSent = false;
  let alertReason: string | undefined;

  if (shouldSendBottleneckAlert(seededSimulation.bottleneckDelay)) {
    try {
      const alertOutcome = await sendTwinBottleneckAlert({
        ownerUserId,
        workspaceId,
        station: seededSimulation.bottleneckStation,
        delayMinutes: seededSimulation.bottleneckDelay,
        queueDepth: kdsState.queueDepth,
      });
      alertSent = alertOutcome.sent;
      alertReason = alertOutcome.reason;
    } catch (error) {
      logger.warn("realtime twin bottleneck alert failed", error);
      alertReason = error instanceof Error ? error.message : "Alert delivery failed.";
    }
  }

  return {
    workspaceId,
    kdsState,
    posSnapshot,
    simulation: seededSimulation,
    predictions,
    alertSent,
    alertReason,
  };
}

/** Convenience alias — same as updateRealTimeTwin (persists predictions for KDS clients). */
export async function updateKDSPredictions(workspaceId: string): Promise<KdsTwinPredictions> {
  const result = await updateRealTimeTwin(workspaceId);
  return result.predictions;
}

export async function updateRealTimeTwinForUser(userId: string): Promise<RealTimeTwinUpdate> {
  const workspaceId = await resolveOwnerWorkspaceId(userId);
  if (!workspaceId) throw new Error(`No workspace for user: ${userId}`);
  return updateRealTimeTwin(workspaceId);
}
