import { routeItemToPrimaryStation } from "@/lib/ai/digital-twin-simulation";
import type { SimulationMenuMixItem, SimulationResult } from "@/lib/ai/digital-twin-types";
import type { KdsDailyOrder } from "@/services/kitchen-screen/daily-kds-service";

import type { KdsLiveState, KdsTwinPredictions, PosLiveSnapshot } from "./real-time-twin-types";

export const BOTTLENECK_ALERT_THRESHOLD_MINUTES = 15;
export const REALTIME_TWIN_WINDOW_MINUTES = 60;

export function computeStationLoadsFromKdsOrders(
  orders: KdsDailyOrder[],
  stationNames: string[],
): Map<string, number> {
  const loads = new Map<string, number>();
  for (const name of stationNames) loads.set(name, 0);

  if (stationNames.length === 0) return loads;

  for (const order of orders) {
    const items = order.items.length > 0 ? order.items : ["Order"];
    for (const item of items) {
      const station = routeItemToPrimaryStation(item, stationNames);
      loads.set(station, (loads.get(station) ?? 0) + 1);
    }
  }

  return loads;
}

export function buildKdsLiveState(orders: KdsDailyOrder[], stationNames: string[]): KdsLiveState {
  const loads = computeStationLoadsFromKdsOrders(orders, stationNames);
  const waitMinutes =
    orders.length > 0
      ? orders.reduce((sum, o) => sum + o.elapsedSeconds / 60, 0) / orders.length
      : 0;

  return {
    queueDepth: orders.length,
    highPriorityCount: orders.filter((o) => o.priority === "high").length,
    avgWaitMinutes: Math.round(waitMinutes * 10) / 10,
    stationLoads: stationNames.map((station) => ({
      station,
      load: loads.get(station) ?? 0,
    })),
    orders,
    updatedAt: new Date().toISOString(),
  };
}

export function buildPosLiveSnapshot(input: {
  ordersLastHour: number;
  menuMix: SimulationMenuMixItem[];
}): PosLiveSnapshot {
  const mix =
    input.menuMix.length > 0 ? input.menuMix : [{ item: "House favorite", percentage: 100 }];

  return {
    ordersLastHour: input.ordersLastHour,
    incomingRatePerHour: input.ordersLastHour,
    menuMix: mix,
    updatedAt: new Date().toISOString(),
  };
}

/** Project order count for the simulation horizon from live queue + POS flow. */
export function buildLiveSimulationParams(input: {
  kdsState: KdsLiveState;
  posSnapshot: PosLiveSnapshot;
  timeWindowMinutes?: number;
}): {
  orderCount: number;
  timeWindow: number;
  menuMix: SimulationMenuMixItem[];
} {
  const timeWindow = input.timeWindowMinutes ?? REALTIME_TWIN_WINDOW_MINUTES;
  const projectedFromPos = Math.ceil((input.posSnapshot.incomingRatePerHour * timeWindow) / 60);
  const backlog = input.kdsState.queueDepth;
  const orderCount = Math.max(backlog + projectedFromPos, backlog, 1);

  return {
    orderCount,
    timeWindow,
    menuMix: input.posSnapshot.menuMix,
  };
}

export function buildKdsTwinPredictions(input: {
  workspaceId: string;
  kdsState: KdsLiveState;
  simulation: SimulationResult;
}): KdsTwinPredictions {
  const loadByStation = new Map(input.kdsState.stationLoads.map((s) => [s.station, s.load]));
  const waitByStation = new Map(input.simulation.waitTimes.map((w) => [w.station, w]));
  const utilByStation = new Map(input.simulation.stationUtilization.map((u) => [u.station, u.utilization]));

  const stations = new Set([
    ...input.kdsState.stationLoads.map((s) => s.station),
    ...input.simulation.waitTimes.map((w) => w.station),
  ]);

  return {
    workspaceId: input.workspaceId,
    updatedAt: new Date().toISOString(),
    bottleneckStation: input.simulation.bottleneckStation,
    bottleneckDelayMinutes: input.simulation.bottleneckDelay,
    alertActive: input.simulation.bottleneckDelay > BOTTLENECK_ALERT_THRESHOLD_MINUTES,
    stationPredictions: [...stations].map((station) => ({
      station,
      predictedWaitMinutes: waitByStation.get(station)?.maxWait ?? 0,
      utilization: utilByStation.get(station) ?? 0,
      currentLoad: loadByStation.get(station) ?? 0,
    })),
    recommendations: input.simulation.recommendations,
    confidence: input.simulation.confidence,
    aiAssisted: true,
  };
}

export function shouldSendBottleneckAlert(bottleneckDelayMinutes: number): boolean {
  return bottleneckDelayMinutes > BOTTLENECK_ALERT_THRESHOLD_MINUTES;
}

/** 30-minute buckets so the same bottleneck can re-alert after cooldown. */
export function bottleneckAlertDedupeKey(workspaceId: string, station: string, now = Date.now()): string {
  const bucket = Math.floor(now / (30 * 60 * 1000));
  return `realtime-twin-bottleneck:${workspaceId}:${station}:${bucket}`;
}

export function formatBottleneckAlertMessage(input: {
  station: string;
  delayMinutes: number;
  queueDepth: number;
}): string {
  return (
    `Kitchen bottleneck alert: ${input.station} projected delay ${input.delayMinutes.toFixed(1)} min ` +
    `(threshold ${BOTTLENECK_ALERT_THRESHOLD_MINUTES} min). Active KDS queue: ${input.queueDepth} tickets.`
  );
}
