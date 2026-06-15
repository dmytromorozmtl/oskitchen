import {
  buildKdsPriorityLaneItems,
  partitionKdsQueueByPriority,
  scoreKdsTicketPriority,
  resolveKdsPriorityReasons,
  formatKdsPriorityReasonLabel,
  type KdsPriorityLaneItem,
  type KdsPriorityTicket,
} from "@/lib/kitchen/kds-priority-lane-era19";
import {
  formatKdsElapsedClock,
  formatKdsTicketNumber,
  summarizeKdsQueue,
  type KdsQueueSummary,
} from "@/lib/kitchen/kds-queue-clarity-era18";
import { kdsTicketAnchor } from "@/lib/kitchen/kds-ticket-focus-era18";
import {
  KDS_RUSH_ARRIVAL_WINDOW_MS,
  KDS_RUSH_ARRIVALS_BUILDING_MIN,
  KDS_RUSH_ARRIVALS_PEAK_MIN,
  KDS_RUSH_BUILDING_ACTIVE_MIN,
  KDS_RUSH_MAX_PRIORITY_ROUTES,
  KDS_RUSH_MODE_POLICY_ID,
  KDS_RUSH_OVERDUE_BUILDING_MIN,
  KDS_RUSH_OVERDUE_PEAK_MIN,
  KDS_RUSH_PEAK_ACTIVE_MIN,
} from "@/lib/kitchen/kds-rush-mode-policy";

export type KdsRushLevel = "normal" | "building" | "rush";

export type KdsRushPeakSignal =
  | "active_volume"
  | "arrival_rate"
  | "overdue_spike";

export type KdsRushModeSnapshot = {
  level: KdsRushLevel;
  queue: KdsQueueSummary;
  arrivalsLast10Min: number;
  peakSignals: KdsRushPeakSignal[];
  priorityRoutes: KdsPriorityLaneItem[];
  policyId: typeof KDS_RUSH_MODE_POLICY_ID;
};

export function countKdsArrivalsInWindow(
  orders: readonly { createdAt: string }[],
  windowMs: number,
  nowMs: number,
): number {
  const cutoff = nowMs - windowMs;
  return orders.filter((order) => new Date(order.createdAt).getTime() >= cutoff).length;
}

export function detectKdsRushPeakSignals(
  summary: KdsQueueSummary,
  arrivalsLast10Min: number,
): KdsRushPeakSignal[] {
  const signals: KdsRushPeakSignal[] = [];

  if (summary.total >= KDS_RUSH_BUILDING_ACTIVE_MIN) {
    signals.push("active_volume");
  }
  if (arrivalsLast10Min >= KDS_RUSH_ARRIVALS_BUILDING_MIN) {
    signals.push("arrival_rate");
  }
  if (summary.overdue >= KDS_RUSH_OVERDUE_BUILDING_MIN) {
    signals.push("overdue_spike");
  }

  return signals;
}

export function detectKdsRushLevel(
  summary: KdsQueueSummary,
  arrivalsLast10Min: number,
): KdsRushLevel {
  const peakByVolume = summary.total >= KDS_RUSH_PEAK_ACTIVE_MIN;
  const peakByArrivals = arrivalsLast10Min >= KDS_RUSH_ARRIVALS_PEAK_MIN;
  const peakByOverdue = summary.overdue >= KDS_RUSH_OVERDUE_PEAK_MIN;

  if (peakByVolume || peakByArrivals || peakByOverdue) {
    return "rush";
  }

  const buildingByVolume = summary.total >= KDS_RUSH_BUILDING_ACTIVE_MIN;
  const buildingByArrivals = arrivalsLast10Min >= KDS_RUSH_ARRIVALS_BUILDING_MIN;
  const buildingByOverdue = summary.overdue >= KDS_RUSH_OVERDUE_BUILDING_MIN;

  if (buildingByVolume || buildingByArrivals || buildingByOverdue) {
    return "building";
  }

  return "normal";
}

function mapRushPriorityRoute(
  order: KdsPriorityTicket,
  lane: "prep" | "expo",
): KdsPriorityLaneItem {
  return {
    order,
    score: scoreKdsTicketPriority(order),
    reasons: resolveKdsPriorityReasons(order),
    lane,
    rank: 0,
    ticketNumber: formatKdsTicketNumber(order.id),
    elapsedLabel: formatKdsElapsedClock(order.elapsedSeconds),
    href: kdsTicketAnchor(order.id),
  };
}

export function buildKdsRushPriorityRoutes(
  preparing: readonly KdsPriorityTicket[],
  ready: readonly KdsPriorityTicket[],
  level: KdsRushLevel,
  maxRoutes: number = KDS_RUSH_MAX_PRIORITY_ROUTES,
): KdsPriorityLaneItem[] {
  const priorityLane = buildKdsPriorityLaneItems(preparing, ready, maxRoutes);
  if (priorityLane.length > 0 || level === "normal") {
    return priorityLane;
  }

  const candidates: KdsPriorityLaneItem[] = [];
  for (const order of preparing) {
    candidates.push(mapRushPriorityRoute(order, "prep"));
  }
  for (const order of ready) {
    candidates.push(mapRushPriorityRoute(order, "expo"));
  }

  return candidates
    .sort((left, right) => right.score - left.score)
    .slice(0, maxRoutes)
    .map((item, index) => ({ ...item, rank: index + 1 }));
}

export function buildKdsRushModeSnapshot(
  orders: readonly KdsPriorityTicket[],
  options?: { nowMs?: number },
): KdsRushModeSnapshot {
  const nowMs = options?.nowMs ?? Date.now();
  const queue = summarizeKdsQueue(orders);
  const arrivalsLast10Min = countKdsArrivalsInWindow(
    orders,
    KDS_RUSH_ARRIVAL_WINDOW_MS,
    nowMs,
  );
  const level = detectKdsRushLevel(queue, arrivalsLast10Min);
  const peakSignals = detectKdsRushPeakSignals(queue, arrivalsLast10Min);
  const { preparing, ready } = partitionKdsQueueByPriority(orders);
  const priorityRoutes = buildKdsRushPriorityRoutes(preparing, ready, level);

  return {
    level,
    queue,
    arrivalsLast10Min,
    peakSignals,
    priorityRoutes,
    policyId: KDS_RUSH_MODE_POLICY_ID,
  };
}

export function shouldShowKdsRushMode(snapshot: KdsRushModeSnapshot): boolean {
  return snapshot.level !== "normal" || snapshot.priorityRoutes.length > 0;
}

export function formatKdsRushLevelLabel(level: KdsRushLevel): string {
  switch (level) {
    case "normal":
      return "Normal service";
    case "building":
      return "Rush building";
    case "rush":
      return "Peak rush";
  }
}

export function formatKdsRushPeakSignalLabel(signal: KdsRushPeakSignal): string {
  switch (signal) {
    case "active_volume":
      return "High ticket volume";
    case "arrival_rate":
      return "Arrival surge";
    case "overdue_spike":
      return "Overdue spike";
  }
}

export { formatKdsPriorityReasonLabel };

export function kdsRushModePolicySnapshot(): {
  policyId: typeof KDS_RUSH_MODE_POLICY_ID;
  maxRoutes: typeof KDS_RUSH_MAX_PRIORITY_ROUTES;
} {
  return {
    policyId: KDS_RUSH_MODE_POLICY_ID,
    maxRoutes: KDS_RUSH_MAX_PRIORITY_ROUTES,
  };
}

export function isKdsRushSoundAlertLevel(level: KdsRushLevel): boolean {
  return level === "rush";
}
