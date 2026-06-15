import type { ExpoViewSnapshot } from "@/lib/kitchen/kds-expo-view";
import { KDS_MANAGER_VIEW_ROUTE } from "@/lib/kitchen/kds-manager-view-policy";
import type { KdsQueueSummary } from "@/lib/kitchen/kds-queue-clarity-era18";
import {
  normalizeProductionStation,
  type ProductionViewSnapshot,
} from "@/lib/kitchen/kds-production-view";

export { KDS_MANAGER_VIEW_ROUTE };

export type ManagerCompletedTicket = {
  station: string;
  prepMinutes: number | null;
  wasOnTime: boolean;
};

export type ManagerStationPerformance = {
  station: string;
  activeItems: number;
  completedToday: number;
  avgPrepMinutes: number | null;
  overdueItems: number;
  efficiencyScore: number;
};

export type ManagerViewSnapshot = {
  generatedAtIso: string;
  performance: {
    ticketsCompletedToday: number;
    avgTicketMinutes: number | null;
    onTimeRatePercent: number;
    efficiencyScore: number;
  };
  delays: {
    overdueTickets: number;
    delayedExpoTickets: number;
    bottleneckStation: string | null;
    avgDelayMinutes: number;
    oldestWaitMinutes: number;
  };
  efficiency: {
    readyBacklog: number;
    waitingBacklog: number;
    inProgressItems: number;
    kitchenEtaMinutes: number;
  };
  stations: ManagerStationPerformance[];
  alerts: string[];
};

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function average(values: readonly number[]): number | null {
  if (!values.length) return null;
  return round1(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function stationEfficiencyScore(input: {
  activeItems: number;
  completedToday: number;
  overdueItems: number;
  loadPercent: number;
}): number {
  const throughputBoost = Math.min(20, input.completedToday * 2);
  const penalty = input.overdueItems * 8 + input.loadPercent * 0.25;
  return clampScore(72 + throughputBoost - penalty);
}

export function buildKdsManagerViewSnapshot(input: {
  production: ProductionViewSnapshot;
  expo: ExpoViewSnapshot;
  queueSummary: KdsQueueSummary;
  completedToday: ManagerCompletedTicket[];
  generatedAtIso?: string;
}): ManagerViewSnapshot {
  const generatedAtIso = input.generatedAtIso ?? new Date().toISOString();
  const completedPrep = input.completedToday
    .map((row) => row.prepMinutes)
    .filter((value): value is number => value != null);
  const onTimeCount = input.completedToday.filter((row) => row.wasOnTime).length;
  const onTimeRatePercent =
    input.completedToday.length === 0
      ? 100
      : clampScore((onTimeCount / input.completedToday.length) * 100);

  const delayedLane = input.expo.lanes.find((lane) => lane.lane === "delayed");
  const readyLane = input.expo.lanes.find((lane) => lane.lane === "ready");
  const waitingLane = input.expo.lanes.find((lane) => lane.lane === "waiting");
  const delayedExpoTickets = delayedLane?.count ?? 0;

  const overdueTickets = input.queueSummary.overdue + (delayedLane?.count ?? 0);
  const oldestWaitMinutes = input.queueSummary.oldestPrepSeconds
    ? Math.round(input.queueSummary.oldestPrepSeconds / 60)
    : 0;
  const avgDelayMinutes = average(
    (delayedLane?.tickets ?? []).map((ticket) => ticket.elapsedSeconds / 60),
  ) ?? 0;

  const completedByStation = new Map<string, ManagerCompletedTicket[]>();
  for (const row of input.completedToday) {
    const bucket = completedByStation.get(row.station) ?? [];
    bucket.push(row);
    completedByStation.set(row.station, bucket);
  }

  const stations: ManagerStationPerformance[] = input.production.stations.map((station) => {
    const completedRows = completedByStation.get(station.station) ?? [];
    const completedPrepMinutes = completedRows
      .map((row) => row.prepMinutes)
      .filter((value): value is number => value != null);
    return {
      station: station.station,
      activeItems: station.activeItems,
      completedToday: completedRows.length,
      avgPrepMinutes: average(completedPrepMinutes),
      overdueItems: station.overdueItems,
      efficiencyScore: stationEfficiencyScore({
        activeItems: station.activeItems,
        completedToday: completedRows.length,
        overdueItems: station.overdueItems,
        loadPercent: station.loadPercent,
      }),
    };
  });

  for (const [station, rows] of completedByStation.entries()) {
    if (stations.some((row) => row.station === station)) continue;
    const completedPrepMinutes = rows
      .map((row) => row.prepMinutes)
      .filter((value): value is number => value != null);
    stations.push({
      station,
      activeItems: 0,
      completedToday: rows.length,
      avgPrepMinutes: average(completedPrepMinutes),
      overdueItems: 0,
      efficiencyScore: stationEfficiencyScore({
        activeItems: 0,
        completedToday: rows.length,
        overdueItems: 0,
        loadPercent: 0,
      }),
    });
  }

  stations.sort((a, b) => b.efficiencyScore - a.efficiencyScore);

  const efficiencyScore = clampScore(
    onTimeRatePercent * 0.45 +
      (stations[0]?.efficiencyScore ?? 70) * 0.35 -
      overdueTickets * 3 -
      delayedExpoTickets * 2,
  );

  const alerts: string[] = [];
  if (input.production.bottleneckStation) {
    alerts.push(`Bottleneck at ${input.production.bottleneckStation} — ETA ~${input.production.kitchenEtaMinutes} min.`);
  }
  if (delayedExpoTickets > 0) {
    alerts.push(`${delayedExpoTickets} delayed expo ticket(s) need runner attention.`);
  }
  if (input.queueSummary.overdue > 0) {
    alerts.push(`${input.queueSummary.overdue} overdue ticket(s) on the line.`);
  }
  if (onTimeRatePercent < 80 && input.completedToday.length > 0) {
    alerts.push(`On-time rate dropped to ${onTimeRatePercent}% today.`);
  }
  if (!alerts.length) {
    alerts.push("Kitchen flow is within normal range.");
  }

  return {
    generatedAtIso,
    performance: {
      ticketsCompletedToday: input.completedToday.length,
      avgTicketMinutes: average(completedPrep),
      onTimeRatePercent,
      efficiencyScore,
    },
    delays: {
      overdueTickets,
      delayedExpoTickets,
      bottleneckStation: input.production.bottleneckStation,
      avgDelayMinutes,
      oldestWaitMinutes,
    },
    efficiency: {
      readyBacklog: readyLane?.count ?? 0,
      waitingBacklog: waitingLane?.count ?? 0,
      inProgressItems: input.queueSummary.preparing,
      kitchenEtaMinutes: input.production.kitchenEtaMinutes,
    },
    stations,
    alerts,
  };
}

export function normalizeManagerStation(station: string | null | undefined): string {
  return normalizeProductionStation(station);
}
