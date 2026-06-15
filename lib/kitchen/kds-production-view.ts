import { KDS_PRODUCTION_VIEW_ROUTE } from "@/lib/kitchen/kds-production-view-policy";

export { KDS_PRODUCTION_VIEW_ROUTE };

/** Default prep minutes per queued item when no startedAt is available. */
export const KDS_DEFAULT_PREP_MINUTES_PER_ITEM = 4;

const ACTIVE_STATUSES = new Set([
  "TO_PREP",
  "IN_PROGRESS",
  "READY",
  "PACK_HANDOFF",
  "HOLD",
  "QUEUED",
]);

const IN_PROGRESS_STATUSES = new Set(["IN_PROGRESS", "PACK_HANDOFF"]);

export type ProductionViewWorkItemInput = {
  id: string;
  title: string;
  station: string | null;
  status: string;
  priority: string;
  quantity: number;
  dueAtIso: string | null;
  createdAtIso: string;
  startedAtIso: string | null;
};

export type ProductionViewWorkItem = ProductionViewWorkItemInput & {
  stationLabel: string;
  minutesWaiting: number;
  isOverdue: boolean;
};

export type ProductionStationSnapshot = {
  station: string;
  activeItems: number;
  inProgressItems: number;
  queuedItems: number;
  overdueItems: number;
  loadScore: number;
  loadPercent: number;
  estimatedClearMinutes: number;
  avgWaitMinutes: number;
  isBottleneck: boolean;
  items: ProductionViewWorkItem[];
};

export type ProductionViewSnapshot = {
  generatedAtIso: string;
  totalActive: number;
  bottleneckStation: string | null;
  bottleneckDelayMinutes: number;
  kitchenEtaMinutes: number;
  stations: ProductionStationSnapshot[];
};

export function normalizeProductionStation(station: string | null | undefined): string {
  const label = station?.trim();
  return label && label.length > 0 ? label : "Unassigned";
}

export function isActiveProductionStatus(status: string): boolean {
  return ACTIVE_STATUSES.has(status);
}

function minutesBetween(startIso: string, endMs: number): number {
  const start = Date.parse(startIso);
  if (!Number.isFinite(start)) return 0;
  return Math.max(0, Math.round((endMs - start) / 60_000));
}

function priorityWeight(priority: string): number {
  switch (priority) {
    case "RUSH":
      return 1.5;
    case "HIGH":
      return 1.25;
    default:
      return 1;
  }
}

function enrichWorkItem(item: ProductionViewWorkItemInput, nowMs: number): ProductionViewWorkItem {
  const stationLabel = normalizeProductionStation(item.station);
  const waitAnchor = item.startedAtIso ?? item.createdAtIso;
  const minutesWaiting = minutesBetween(waitAnchor, nowMs);
  const isOverdue =
    item.dueAtIso != null && Date.parse(item.dueAtIso) < nowMs && isActiveProductionStatus(item.status);

  return {
    ...item,
    stationLabel,
    minutesWaiting,
    isOverdue,
  };
}

function stationLoadScore(station: ProductionStationSnapshot): number {
  return (
    station.activeItems +
    station.overdueItems * 2 +
    Math.round(station.avgWaitMinutes / 5)
  );
}

export function buildProductionViewSnapshot(
  items: ProductionViewWorkItemInput[],
  options?: { now?: Date; prepMinutesPerItem?: number },
): ProductionViewSnapshot {
  const nowMs = (options?.now ?? new Date()).getTime();
  const prepMinutes = options?.prepMinutesPerItem ?? KDS_DEFAULT_PREP_MINUTES_PER_ITEM;
  const generatedAtIso = new Date(nowMs).toISOString();

  const enriched = items
    .filter((item) => isActiveProductionStatus(item.status))
    .map((item) => enrichWorkItem(item, nowMs));

  const byStation = new Map<string, ProductionViewWorkItem[]>();
  for (const item of enriched) {
    const bucket = byStation.get(item.stationLabel) ?? [];
    bucket.push(item);
    byStation.set(item.stationLabel, bucket);
  }

  const stations: ProductionStationSnapshot[] = [...byStation.entries()].map(([station, rows]) => {
    const inProgressItems = rows.filter((row) => IN_PROGRESS_STATUSES.has(row.status)).length;
    const queuedItems = rows.length - inProgressItems;
    const overdueItems = rows.filter((row) => row.isOverdue).length;
    const avgWaitMinutes =
      rows.length === 0
        ? 0
        : Math.round(rows.reduce((sum, row) => sum + row.minutesWaiting, 0) / rows.length);
    const estimatedClearMinutes = Math.max(
      1,
      Math.round(
        rows.reduce(
          (sum, row) => sum + prepMinutes * priorityWeight(row.priority) * Math.max(1, row.quantity),
          0,
        ) / Math.max(1, rows.length),
      ) + avgWaitMinutes,
    );

    return {
      station,
      activeItems: rows.length,
      inProgressItems,
      queuedItems,
      overdueItems,
      loadScore: 0,
      loadPercent: 0,
      estimatedClearMinutes,
      avgWaitMinutes,
      isBottleneck: false,
      items: rows.sort((a, b) => {
        if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1;
        return b.minutesWaiting - a.minutesWaiting;
      }),
    };
  });

  const maxLoad = Math.max(1, ...stations.map((station) => station.activeItems + station.overdueItems * 2));

  for (const station of stations) {
    station.loadScore = stationLoadScore(station);
    station.loadPercent = Math.min(
      100,
      Math.round(((station.activeItems + station.overdueItems * 2) / maxLoad) * 100),
    );
  }

  stations.sort((a, b) => b.loadScore - a.loadScore);

  const bottleneck = stations[0] ?? null;
  if (bottleneck) {
    bottleneck.isBottleneck = true;
  }

  const kitchenEtaMinutes = stations.reduce(
    (max, station) => Math.max(max, station.estimatedClearMinutes),
    0,
  );

  return {
    generatedAtIso,
    totalActive: enriched.length,
    bottleneckStation: bottleneck?.station ?? null,
    bottleneckDelayMinutes: bottleneck?.avgWaitMinutes ?? 0,
    kitchenEtaMinutes,
    stations,
  };
}
