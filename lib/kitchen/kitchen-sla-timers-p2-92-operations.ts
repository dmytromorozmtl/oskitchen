/**
 * Pure helpers for kitchen SLA timers (Blueprint P2-92).
 */

import {
  formatKdsElapsedClock,
  isKdsTicketReady,
  type KdsQueueTicket,
} from "@/lib/kitchen/kds-queue-clarity-era18";
import type { ProductionStationSnapshot } from "@/lib/kitchen/kds-production-view";

/** Green: under 5 minutes. */
export const KITCHEN_SLA_GREEN_MAX_SECONDS = 300 as const;

/** Yellow: 5–10 minutes. Red: over 10 minutes. */
export const KITCHEN_SLA_YELLOW_MAX_SECONDS = 600 as const;

export type KitchenSlaTimerLevel = "green" | "yellow" | "red";

export type KitchenSlaTicket = {
  id: string;
  status: string;
  elapsedSeconds: number;
  level: KitchenSlaTimerLevel;
  clock: string;
};

export type KitchenSlaBottleneckAlert = {
  station: string;
  loadPercent: number;
  overdueItems: number;
  avgWaitMinutes: number;
  message: string;
};

export type KitchenSlaLevelCounts = {
  green: number;
  yellow: number;
  red: number;
};

export type KitchenSlaReport = {
  avgPrepTimeSeconds: number;
  levelCounts: KitchenSlaLevelCounts;
  bottleneck: KitchenSlaBottleneckAlert | null;
  tickets: KitchenSlaTicket[];
};

export function resolveKitchenSlaTimerLevel(elapsedSeconds: number): KitchenSlaTimerLevel {
  if (elapsedSeconds < KITCHEN_SLA_GREEN_MAX_SECONDS) return "green";
  if (elapsedSeconds < KITCHEN_SLA_YELLOW_MAX_SECONDS) return "yellow";
  return "red";
}

export function countKitchenSlaLevels(tickets: readonly KitchenSlaTicket[]): KitchenSlaLevelCounts {
  const counts: KitchenSlaLevelCounts = { green: 0, yellow: 0, red: 0 };
  for (const ticket of tickets) {
    counts[ticket.level] += 1;
  }
  return counts;
}

export function buildKitchenSlaTickets(orders: readonly KdsQueueTicket[]): KitchenSlaTicket[] {
  return orders.map((order) => ({
    id: order.id,
    status: order.status,
    elapsedSeconds: order.elapsedSeconds,
    level: resolveKitchenSlaTimerLevel(order.elapsedSeconds),
    clock: formatKdsElapsedClock(order.elapsedSeconds),
  }));
}

export function computeAvgPrepTimeSeconds(
  orders: readonly Pick<KdsQueueTicket, "elapsedSeconds" | "status">[],
): number {
  const preparing = orders.filter((order) => !isKdsTicketReady(order.status));
  if (preparing.length === 0) return 0;
  const total = preparing.reduce((sum, order) => sum + order.elapsedSeconds, 0);
  return Math.round(total / preparing.length);
}

export function detectKitchenSlaBottleneck(
  stations: readonly ProductionStationSnapshot[],
): KitchenSlaBottleneckAlert | null {
  if (stations.length === 0) return null;

  const bottleneck =
    stations.find((station) => station.isBottleneck) ??
    [...stations].sort((left, right) => right.loadPercent - left.loadPercent)[0];

  if (!bottleneck || bottleneck.loadPercent <= 0) return null;

  return {
    station: bottleneck.station,
    loadPercent: bottleneck.loadPercent,
    overdueItems: bottleneck.overdueItems,
    avgWaitMinutes: bottleneck.avgWaitMinutes,
    message: `Bottleneck at ${bottleneck.station} — ${bottleneck.loadPercent}% load, ${bottleneck.overdueItems} overdue.`,
  };
}

export function buildKitchenSlaReport(
  orders: readonly KdsQueueTicket[],
  stations: readonly ProductionStationSnapshot[],
): KitchenSlaReport {
  const tickets = buildKitchenSlaTickets(orders);
  return {
    avgPrepTimeSeconds: computeAvgPrepTimeSeconds(orders),
    levelCounts: countKitchenSlaLevels(tickets),
    bottleneck: detectKitchenSlaBottleneck(stations),
    tickets: tickets.sort((left, right) => right.elapsedSeconds - left.elapsedSeconds),
  };
}

export function kitchenSlaLevelBadgeVariant(
  level: KitchenSlaTimerLevel,
): "default" | "secondary" | "destructive" {
  switch (level) {
    case "green":
      return "secondary";
    case "yellow":
      return "default";
    case "red":
      return "destructive";
  }
}

export function formatKitchenSlaDuration(seconds: number): string {
  if (seconds <= 0) return "0s";
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  if (minutes === 0) return `${remainder}s`;
  return `${minutes}m ${remainder}s`;
}
