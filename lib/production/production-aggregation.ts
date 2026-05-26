import type { ProductionWorkStatus, ProductionWorkPriority } from "@prisma/client";

import { isWorkLate } from "@/lib/production/production-status";

export type WorkItemKpiInput = {
  status: ProductionWorkStatus;
  priority: ProductionWorkPriority;
  requiresPacking: boolean;
  station: string | null;
  dueAt?: Date | null;
  estimatedMinutes?: number | null;
};

export function aggregateWorkItemKpis(items: WorkItemKpiInput[]) {
  const today = items.length;
  const completed = items.filter((i) => i.status === "DONE").length;
  const inProgress = items.filter((i) => i.status === "IN_PROGRESS").length;
  const packingHandoff = items.filter((i) => i.status === "PACK_HANDOFF" || i.requiresPacking).length;
  const lateOrRisk = items.filter(
    (i) =>
      i.priority === "CRITICAL" ||
      i.status === "HOLD" ||
      isWorkLate(i.dueAt ?? null, i.status),
  ).length;

  const byStation = new Map<string, number>();
  for (const i of items) {
    const key = (i.station?.trim() || "Unassigned").slice(0, 64);
    byStation.set(key, (byStation.get(key) ?? 0) + 1);
  }

  let estMinutes = 0;
  for (const i of items) {
    if (typeof i.estimatedMinutes === "number" && i.estimatedMinutes > 0) estMinutes += i.estimatedMinutes;
  }

  return {
    tasksToday: today,
    completed,
    inProgress,
    lateOrRisk,
    packingHandoff,
    estimatedPrepMinutes: estMinutes,
    stationLoad: [...byStation.entries()].sort((a, b) => b[1] - a[1]),
  };
}
